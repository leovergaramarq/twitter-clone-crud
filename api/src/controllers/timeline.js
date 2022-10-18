const User = require('../models/User');
const Tweet = require('../models/Tweet');

async function getUserTimeline(req, res) {
    const { username } = req.params;

    User.findOne({ username }, (err, user) => {
        if (err) {
            res.status(500).send({
                status: 500,
                message: err.message,
            });
        } else {
            const { following } = user;
            Tweet.aggregate([
                {
                    $match: {
                        $or: following.map(username => ({ username }))
                    }
                }
            ], (err, tweets) => {
                if (err) {
                    res.status(500).send({
                        status: 500,
                        message: err.message,
                    });
                } else {
                    res.status(200).send({
                        status: 200,
                        data: tweets,
                    });
                }
            });
        }
    });
}

module.exports = {
    getUserTimeline,
}
