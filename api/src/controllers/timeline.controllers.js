const User = require('../models/User');
const Tweet = require('../models/Tweet');

async function read(req, res) {
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

module.exports = {
    getUserTimeline: read,
}
