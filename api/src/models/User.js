const mongoose = require('mongoose');
const Counter = require('./Counter');

const { Schema } = mongoose;

const userSchema = new Schema({
    _id: {
        type: Number,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    bio: String,
    interests: {
        type: [String],
        default: undefined,
    },
    // followers: {
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
    followers: {
        type: [Number],
        default: undefined,
        ref: 'User',
    },
    // following: {
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
    following: {
        type: [Number],
        default: undefined,
        ref: 'User',
    },
    // likes: {
    //     type: [{
    //         _id: {
    //             type: Number,
    //             required: true,
    //             ref: 'Tweet',
    //         },
    //         text: String,
    //     }],
    //     default: undefined,
    // },
    // tweets: {
    //     type: [{
    //         _id: {
    //             type: Number,
    //             required: true,
    //             ref: 'Tweet',
    //         },
    //         text: String,
    //     }],
    //     default: undefined,
    // },
    likes: {
        type: [Number],
        default: undefined,
        ref: 'Tweet',
    },
    tweets: {
        type: [String],
        default: undefined,
        ref: 'Tweet',
    },
});

userSchema.pre('save', async function (next) {
    this._id = await Counter.getNextSequence('user_id');
    // next();
});

module.exports = mongoose.model('User', userSchema);
