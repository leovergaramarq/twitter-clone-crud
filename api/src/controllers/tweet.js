const Tweet = require('../models/Tweet');

async function getOne(req, res) {
    let tweet;
    try {
        tweet = await Tweet.findById(req.params.id);
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

async function getMany(req, res) {
    let tweets;
    try {
        tweets = await Tweet.find(req.query);
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

async function create(req, res) {
    const fields = {};
    for(let field of STARTABLE_FIELDS) {
        if(req.body[field]) fields[field] = req.body[field];
    }

    const tweet = new Tweet(fields);
    try {
        await tweet.save();
    } catch(err) {
        if(err.name === 'ValidationError') {
            return res.status(400).send({
                status: 'fail',
                data: { tweetname: 'Tweetname is required',  }
            });
        } else {
            return res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
    }
    res.status(201).send({
        status: 'success',
        data: { id: tweet._id },
    });
}

async function update(req, res) {
    const fields = {};
    for(let field of UPDATABLE_FIELDS) {
        if(req.body[field]) fields[field] = req.body[field];
    }

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

async function removeOne(req, res) {
    let tweet;
    try {
        tweet = await Tweet.findByIdAndDelete(req.params.id);
    }catch(err) {
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
        data: { id: tweet._id },
    });
}

async function removeMany(req, res) {
    let tweets;
    try {
        tweets = await Tweet.deleteMany(req.query);
    } catch(err) {
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data: { count: tweets.deletedCount },
    });
}

const UPDATABLE_FIELDS = ['text'];
const STARTABLE_FIELDS = ['text', 'by'];

module.exports = { getOne, getMany, create, update, removeOne, removeMany };
