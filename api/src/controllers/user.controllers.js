const User = require('../models/User');
const { filterFields } = require('../helpers/utils');
const Tweet = require('../models/Tweet');

async function readOne(req, res) {
    let user;
    try {
        user = await User
            .findById(req.params.id)
            .populate('followers', '_id username')
            .populate('following', '_id username')
            .populate('likes', '_id text createdAt')
            .populate('tweets', '_id text createdAt');
    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    if(!user) {
        return res.status(404).send({
            status: 'fail',
            data: { id: 'User not found' },
        });
    }

    res.status(200).send({
        status: 'success',
        data: user,
    });
}

async function readMany(req, res) {
    let users;
    try {
        users = await User
            .find(req.query)
            .populate('followers', '_id username')
            .populate('following', '_id username')
            .populate('likes', '_id text createdAt')
            .populate('tweets', '_id text createdAt');
    } catch(err) {
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data: users,
    });
}

async function createOne(req, res) {
    const fields = filterFields(req.body, STARTABLE_FIELDS);
    // console.log(fields);
    const user = new User(fields);
    try {
        await user.save();
    } catch(err) {
        // console.log(err);
        if(err.code === 11000) {
            return res.status(409).send({
                status: 'fail',
                data: { username: 'Username already exists' }
            });
        }
        if(err.name === 'ValidationError') {
            return res.status(400).send({
                status: 'fail',
                data: {
                    username: !fields.username ? 'Username is required' : undefined,
                    name: !fields.name ? 'Name is required' : undefined,
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
        data: { id: user._id },
    });
}

async function updateOne(req, res) {   
    const fields = filterFields(req.body, UPDATABLE_FIELDS);
    // console.log(fields);
    let user;
    try {
        user = await User.findByIdAndUpdate(req.params.id, fields);
    } catch(err) {
        if(err.code === 11000) {
            return res.status(409).send({
                status: 'fail',
                data: { username: 'Username already exists' }
            });
        } else {
            return res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
    }
    if(!user) {
        return res.status(404).send({
            status: 'fail',
            data: { id: 'User not found' },
        });
    }
    
    res.status(200).send({
        status: 'success',
        data: fields,
    });
}

async function deleteOne(req, res) {
    const { id } = req.params;
    let user;
    const data = { tweets: [], followers: [], following: [] };

    const userSession = await User.startSession();
    userSession.startTransaction();
    const tweetSession = await User.startSession();
    tweetSession.startTransaction();
    try {
        const userOpts = { session: userSession };
        const tweetOpts = { session: tweetSession };
        user = await User.findByIdAndDelete(id, userOpts);
        if(!user) throw new Error('Not found');
        
        const tweets = await Tweet.find({ by: id });
        await Tweet.deleteMany({ by: id }, tweetOpts);
        for(let tweet of tweets) {
            const temp = { id: tweet._id, likes: [] };
            if(tweet.likes) {
                for(like of tweet.likes) {
                    like = await User.findByIdAndUpdate(like, { $pull: { likes: tweet._id } }, userOpts);
                    if(like) temp.likes.push(like._id);
                    else temp.likes.push(user._id); // user probably liked their own tweet
                }
            }
            data.tweets.push(temp);
        }
        if(user.followers) {
            for(let follower of user.followers) {
                follower = await User.findByIdAndUpdate(follower, { $pull: { following: id } }, userOpts);
                if(follower) data.followers.push(follower._id);
            }
        }
        if(user.following) {
            for(let following of user.following) {
                following = await User.findByIdAndUpdate(following, { $pull: { followers: id } }, userOpts);
                if(following) data.following.push(following._id);
            }
        }
        await userSession.commitTransaction();
        userSession.endSession();
        await tweetSession.commitTransaction();
        tweetSession.endSession();
    } catch(err) {
        console.log(err);
        await userSession.abortTransaction();
        userSession.endSession();
        await tweetSession.abortTransaction();
        tweetSession.endSession();
        
        if(err.message === 'Not found') {
            return res.status(404).send({
                status: 'fail',
                data: { id: 'User not found' },
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

async function readTimeline(req, res) {
    const { id } = req.params;

    let user, tweets;
    try {
        user = await User.findById(id);
    } catch(err) {
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    if(!user) {
        return res.status(404).send({
            status: 'fail',
            data: { id: 'User not found' },
        });
    }
    if(!user.following || !user.following.length) {
        return res.status(200).send({
            status: 'success',
            data: [],
        });
    }

    try {
        tweets = await Tweet.aggregate([
            { $match: {
                // by: { $in: [id, ...user.following] },
                by: { $in: user.following },
            } },
            { $sort: { createdAt: -1 } },
            // { $limit: 100 },
            // { $lookup: {
            //     from: 'users',
            //     localField: 'by',
            //     foreignField: '_id',
            //     as: 'by',
            // } },
        ]);
    } catch(err) {}

    res.status(200).send({
        status: 'success',
        data: tweets,
    });
}

const UPDATABLE_FIELDS = ['username', 'name', 'bio', 'interests'];
const STARTABLE_FIELDS = ['username', 'name', 'bio', 'interests'];

module.exports = { readOne, readMany, createOne, updateOne, deleteOne, readTimeline };
