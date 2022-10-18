const mongoose = require('mongoose');
const Counter = require('./Counter');

const { Schema } = mongoose;

const tweetSchema = new Schema({
    _id: {
        type: Number,
        default: async () => Counter.getNextSequence('tweet_id'),
    },
    by: {
        _id: {
            type: Number,
            required: true,
            ref: 'User',
        },
        username: {
            type: String,
            required: true,
        }
    },
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: new Date(),
        required: true,
    },
    likes: [{
        _id: {
            type: Number,
            required: true,
            ref: 'User',
        },
        username: {
            type: String,
            required: true,
        }
    }],
});

tweetSchema.pre('save', async function (next) {
    this._id = await Counter.getNextSequence('tweet_id');
    // next();
});

module.exports = mongoose.model('Tweet', tweetSchema);
