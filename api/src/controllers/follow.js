const User = require('../models/User');

async function create(req, res) {
    const { user: idUser, follow: idFollow } = req.body;
    if(idUser === idFollow) {
        return res.status(409).send({
            status: 'fail',
            data: { idUser: 'Users cannot follow themselves' }
        });
    }

    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        const user = await User.findByIdAndUpdate(idUser, { $addToSet: { following: idFollow } }, opts);
        const follow = await User.findByIdAndUpdate(idFollow, { $addToSet: { followers: idUser } }, opts);
        
        await session.commitTransaction();
        session.endSession();
        res.status(200).send({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    following: user.following,
                },
                follow: {
                    id: follow._id,
                    followers: follow.followers,
                }
            },
        });
    } catch(err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
}

async function remove(req, res) {
    const { user: idUser, follow: idFollow } = req.body;

    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        const user = await User.findByIdAndUpdate(idUser, { $pull: { following: idFollow } }, opts);
        const follow = await User.findByIdAndUpdate(idFollow, { $pull: { followers: idUser } }, opts);
        await session.commitTransaction();
        session.endSession();
        res.status(200).send({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    following: user.following,
                },
                follow: {
                    id: follow._id,
                    followers: follow.followers,
                }
            },
        });
    } catch(err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
}

module.exports = {
    create,
    remove,
}
