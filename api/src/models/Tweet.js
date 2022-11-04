const mongoose = require('mongoose');
const Counter = require('./Counter');

const { Schema } = mongoose;

const tweetSchema = new Schema({
    _id: {
        type: Number,
    },
    // by: {
    //     _id: {
    //         type: Number,
    //         required: true,
    //         ref: 'User',
    //     },
    //     username: {
    //         type: String,
    //         required: true,
    //     }
    // },
    by: {
        type: Number,
        required: true,
        ref: 'User',
    },
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    // likes: {
    //     type: [{
    //         _id: {
    //             type: Number,
    //             required: true,
    //             ref: 'User',
    //         },
    //         username: {
    //             type: String,
    //             required: true,
    //         }
    //     }],
    //     default: undefined,
    // },
    likes: {
        type: [Number],
        default: undefined,
        ref: 'User',
    },
}, { versionKey: false });

tweetSchema.pre('save', async function (next) {
    this._id = await Counter.getNextSequence('tweet_id');
    next();
});

module.exports = mongoose.model('Tweet', tweetSchema);
