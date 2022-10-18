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
    interests: [String],
    followers: [
        {
            _id: {
                type: Number,
                required: true,
                ref: 'User',
            },
            username: {
                type: String,
                required: true,
            }
        }
    ],
    following: [
        {
            _id: {
                type: Number,
                required: true,
                ref: 'User',
            },
            username: {
                type: String,
                required: true,
            }
        }
    ],
    likes: [{
        _id: {
            type: Number,
            required: true,
            ref: 'Tweet',
        },
        text: String,
    }],
    tweets: [{
        _id: {
            type: Number,
            required: true,
            ref: 'Tweet',
        },
        text: String,
    }],
});

userSchema.pre('save', async function (next) {
    this._id = await Counter.getNextSequence('user_id');
    // next();
});

module.exports = mongoose.model('User', userSchema);
