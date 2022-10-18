const User = require('../models/User');
const Tweet = require('../models/Tweet');

function create(req, res) {
    const { user, like } = req.body;
    User.findOneAndUpdate({ username: user }, { $push: { following: follow } }, (err, user) => {
        if (err) {
            res.status(500).send({
                status: 500,
                message: err.message,
            });
        } else {
            res.status(200).send({
                status: 200,
                data: user,
            });
        }
    });
}

function remove(req, res) {
    const { user, follow } = req.body;
    User.findOneAndUpdate({ username: user }, { $pull: { following: follow } }, (err, user) => {
        if (err) {
            res.status(500).send({
                status: 500,
                message: err.message,
            });
        } else {
            res.status(200).send({
                status: 200,
                data: user,
            });
        }
    });
}

module.exports = {
    create,
    remove,
}
