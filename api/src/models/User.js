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
    followers: {
        type: [Number],
        default: undefined,
        ref: 'User',
    },
    following: {
        type: [Number],
        default: undefined,
        ref: 'User',
    },
    likes: {
        type: [Number],
        default: undefined,
        ref: 'Tweet',
    },
    tweets: {
        type: [Number],
        default: undefined,
        ref: 'Tweet',
    },
}, { versionKey: false });

userSchema.pre('save', async function (next) {
    this._id = await Counter.getNextSequence('user_id');
    next();
});

module.exports = mongoose.model('User', userSchema);
