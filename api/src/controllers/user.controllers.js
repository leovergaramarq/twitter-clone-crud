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
    console.log(fields);
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
    console.log(fields);
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
    // try {
    //     user = await User.findByIdAndDelete(req.params.id);
    // }catch(err) {
    //     return res.status(500).send({
    //         status: 'error',
    //         code: 500,
    //         message: err,
    //     });
    // }
    // if(!user) {
    //     return res.status(404).send({
    //         status: 'fail',
    //         data: { id: 'User not found' },
    //     });
    // }
    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session };
        user = await User.findByIdAndDelete(id, opts);
        if(!user) throw new Error('Not found');
        
        // data.tweets = await Tweet.deleteMany({ by: id }, opts);
        // data.followers = await User.updateMany({ following: id }, { $pull: { following: id } }, opts);
        // data.following = await User.updateMany({ followers: id }, { $pull: { followers: id } }, opts);
        
        data.user = user._id;
        user.tweets && user.tweets.forEach(async tweetId => {
            const tweetData = { id: tweetId };
            const tweet = await Tweet.findByIdAndDelete(tweetId, opts);

            if(!tweet) tweetData.status = 'Not found';
            else {
                tweetData.status = 'Deleted';
                tweetData.likes = [];
                tweet.likes.forEach(async userId => {
                    const user = await User.findByIdAndUpdate(userId, {
                        $pull: { likes: tweet._id }
                    }, opts);
                    tweetData.likes.push({
                        id: userId,
                        status: user ? 'Updated' : 'Not found',
                    });
                });
            }
            data.tweets.push(tweetData);
        });
        user.followers && user.followers.forEach(async userId => {
            const user = await User.findByIdAndUpdate(userId, {
                $pull: { following: user._id }
            }, opts);
            data.followers.push({
                id: userId,
                status: user ? 'Updated' : 'Not found',
            });
        });
        user.following && user.following.forEach(async userId => {
            const user = await User.findByIdAndUpdate(userId, {
                $pull: { followers: user._id }
            }, opts);
            data.following.push({
                id: userId,
                status: user ? 'Updated' : 'Not found',
            });
        });
        await session.commitTransaction();
        session.endSession();
    } catch(err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
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

// async function deleteMany(req, res) {
//     let users;
//     try {
//         users = await User.deleteMany(req.query);
//     } catch(err) {
//         return res.status(500).send({
//             status: 'error',
//             code: 500,
//             message: err,
//         });
//     }
//     res.status(200).send({
//         status: 'success',
//         data: { count: users.deletedCount },
//     });
// }

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

    try {
        tweets = await Tweet.aggregate([
            { $match: {
                $or: user.following.map(following => ({ by: following })),
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
