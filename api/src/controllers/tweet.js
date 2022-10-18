const Tweet = require('../models/Tweet');

async function getOne(req, res) {
    let tweet;
    try {
        tweet = await Tweet.findById(req.params.id);
    } catch(err){
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
        return;
    }
    res.status(200).send({
        status: 'success',
        data: tweet,
    });
}

async function getMany(req, res) {
    let tweets;
    try {
        tweets = await Tweet.find(res.query);
    } catch(err) {
        console.log(err);
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
        return;
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
        if(err.code === 11000) {
            res.status(409).send({
                status: 'fail',
                data: { tweetname: 'Tweetname already exists' }
            });
        } else if(err.name === 'ValidationError') {
            res.status(400).send({
                status: 'fail',
                data: { tweetname: 'Tweetname is required',  }
            });
        } else {
            res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
        return;
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
            res.status(409).send({
                status: 'fail',
                data: { tweetname: 'Tweetname already exists' }
            });
        } else {
            res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
        return;
    }
    res.status(200).send({
        status: 'success',
        data: fields,
    });
}

function remove(req, res) {
    let tweet;
    
    try {
        tweet = Tweet.findOneDelete(req.params.id);
    }catch(err) {
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });

        return;
    }
    res.status(200).send({
        status: 'success',
        data: { id: tweet._id },
    });
}

const UPDATABLE_FIELDS = ['text'];
const STARTABLE_FIELDS = ['text', 'by'];

module.exports = { getOne, getMany, create, update, remove };
