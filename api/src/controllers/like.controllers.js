const User = require('../models/User');
const Tweet = require('../models/Tweet');

async function createOne(req, res) {
    const { user: userId, tweet: tweetId } = req.body;
    let user, tweet;

    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        user = await User.findByIdAndUpdate(userId, { $addToSet: { likes: tweetId } }, opts);
        tweet = await Tweet.findByIdAndUpdate(tweetId, { $addToSet: { likes: userId } }, opts);

        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data: {
            user: {
                id: user._id,
                likes: user.likes,
            },
            tweet: {
                id: tweet._id,
                likes: tweet.likes,
            },
        },
    });
}

async function deleteOne(req, res) {
    const { user: userId, tweet: tweetId } = req.body;
    let user, tweet;

    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        user = await User.findByIdAndUpdate(userId, { $pull: { likes: tweetId } }, opts);
        tweet = await Tweet.findByIdAndUpdate(tweetId, { $pull: { likes: userId } }, opts);
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data: {
            user: {
                id: user._id,
                likes: user.likes,
            },
            tweet: {
                id: tweet._id,
                likes: tweet.likes,
            },
        },
    });
}

module.exports = { createOne, deleteOne };
