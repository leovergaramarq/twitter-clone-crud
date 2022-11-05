const { filterFields } = require('../helpers/utils');
const Tweet = require('../models/Tweet');
const User = require('../models/User');

async function readOne(req, res) {
    let tweet;
    try {
        tweet = await Tweet
            .findById(req.params.id)
            .populate('by', '_id username')
            .populate('likes', '_id username');
    } catch(err){
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    
    if(!tweet) {
        return res.status(404).send({
            status: 'fail',
            data: { id: 'Tweet not found' },
        });
    }
    res.status(200).send({
        status: 'success',
        data: tweet,
    });
}

async function readMany(req, res) {
    let tweets;
    try {
        tweets = await Tweet
            .find(req.query)
            .populate('by', '_id username')
            .populate('likes', '_id username');
    } catch(err) {
        console.log(err);
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data: tweets,
    });
}

async function createOne(req, res) {
    const fields = filterFields(req.body, STARTABLE_FIELDS);
    // console.log(fields);
    const tweet = new Tweet(fields);
    const session = await Tweet.startSession();
    session.startTransaction();
    try {
        const opts = { session };
        await tweet.save(opts);
        const user = await User.findByIdAndUpdate(tweet.by, {
            $push: { tweets: tweet._id }
        }, opts);
        if(!user) throw new Error('User not found');
        await session.commitTransaction();
        session.endSession();
    } catch(err) {
        await session.abortTransaction();
        session.endSession();
        if(err.message === 'User not found') {
            return res.status(404).send({
                status: 'fail',
                data: { by: 'User not found' },
            });
        }
        if(err.name === 'ValidationError') {
            return res.status(400).send({
                status: 'fail',
                data: {
                    by: !fields.by ? 'Tweet must have a user' : undefined,
                    text: !fields.text ? 'Tweet must have text' : undefined,
                }
            });
        }
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(201).send({
        status: 'success',
        data: { id: tweet._id },
    });
}

async function updateOne(req, res) {
    const fields = filterFields(req.body, UPDATABLE_FIELDS);

    let tweet;
    try {
        tweet = await Tweet.findByIdAndUpdate(req.params.id, fields);
    } catch(err) {
        if(err.code === 11000) {
            return res.status(409).send({
                status: 'fail',
                data: { tweetname: 'Tweetname already exists' }
            });
        } else {
            return res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
    }
    if(!tweet) {
        return res.status(404).send({
            status: 'fail',
            data: { id: 'Tweet not found' },
        });
    }

    res.status(200).send({
        status: 'success',
        data: fields,
    });
}

async function deleteOne(req, res) {
    const { id } = req.params;
    let tweet;
    const data = { likes: [] };

    const tweetSession = await Tweet.startSession();
    tweetSession.startTransaction();
    const userSession = await User.startSession();
    userSession.startTransaction();
    try {
        const tweetOpts = { session: tweetSession };
        const userOpts = { session: userSession };
        tweet = await Tweet.findByIdAndDelete(id, tweetOpts);
        if(!tweet) throw new Error('Not found');
        
        if(tweet.likes) {
            for(let like of tweet.likes) {
                like = await User.findByIdAndUpdate(like, {
                    $pull: { likes: tweet._id }
                }, userOpts);
                data.likes.push(like._id);
            }
        }
        await tweetSession.commitTransaction();
        tweetSession.endSession();
        await userSession.commitTransaction();
        userSession.endSession();
    } catch(err) {
        await tweetSession.abortTransaction();
        tweetSession.endSession();
        await userSession.commitTransaction();
        userSession.endSession();
        if(err.message === 'Not found') {
            return res.status(404).send({
                status: 'fail',
                data: { id: 'Tweet not found' },
            });
        }
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data,
    });
}

const UPDATABLE_FIELDS = ['text'];
const STARTABLE_FIELDS = ['text', 'by'];

module.exports = { readOne, readMany, createOne, updateOne, deleteOne };
