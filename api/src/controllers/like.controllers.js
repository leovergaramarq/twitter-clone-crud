const User = require('../models/User');
const Tweet = require('../models/Tweet');

async function createOne(req, res) {
    const { user: userId, tweet: tweetId } = req.body;
    if(!userId || !tweetId) {
        return res.status(400).send({
            status: 'fail',
            code: 400,
            message: 'User and tweet IDs are required',
        });
    }
    let user, tweet;

    const userSession = await User.startSession();
    userSession.startTransaction();
    const tweetSession = await Tweet.startSession();
    tweetSession.startTransaction();
    try {
        const userOpts = { session: userSession, new: true };
        const tweetOpts = { session: tweetSession, new: true };
        user = await User.findByIdAndUpdate(userId, { $addToSet: { likes: tweetId } }, userOpts);
        tweet = await Tweet.findByIdAndUpdate(tweetId, { $addToSet: { likes: userId } }, tweetOpts);
        await userSession.commitTransaction();
        userSession.endSession();
        await tweetSession.commitTransaction();
        tweetSession.endSession();
    } catch (err) {
        console.log(err);
        await userSession.abortTransaction();
        userSession.endSession();
        await tweetSession.abortTransaction();
        tweetSession.endSession();
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    if (!user || !tweet) {
        return res.status(404).send({
            status: 'fail',
            code: 404,
            message: 'User or tweet not found',
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
    if(!userId || !tweetId) {
        return res.status(400).send({
            status: 'fail',
            code: 400,
            message: 'User and tweet IDs are required',
        });
    }
    let user, tweet;
    try {
        user = await User.findById(userId);
    } catch {}
    if (!user) {
        return res.status(404).send({
            status: 'fail',
            code: 404,
            message: 'User not found',
        });
    }
    if(!user.likes || !user.likes.includes(tweetId)) {
        return res.status(404).send({
            status: 'fail',
            code: 404,
            message: 'Tweet not liked by user',
        });
    }

    const userSession = await User.startSession();
    userSession.startTransaction();
    const tweetSession = await Tweet.startSession();
    tweetSession.startTransaction();
    try {
        const userOpts = { session: userSession, new: true };
        const tweetOpts = { session: tweetSession, new: true };
        await User.findByIdAndUpdate(userId, { $pull: { likes: tweetId } }, userOpts);
        tweet = await Tweet.findByIdAndUpdate(tweetId, { $pull: { likes: userId } }, tweetOpts);
        await userSession.commitTransaction();
        userSession.endSession();
        await tweetSession.commitTransaction();
        tweetSession.endSession();
    } catch (err) {
        console.log(err);
        await userSession.abortTransaction();
        userSession.endSession();
        await tweetSession.abortTransaction();
        tweetSession.endSession();
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    if (!tweet) {
        return res.status(404).send({
            status: 'fail',
            code: 404,
            message: 'Tweet not found',
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
