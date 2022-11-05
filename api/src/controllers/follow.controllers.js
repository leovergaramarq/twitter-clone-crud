const User = require('../models/User');

async function createOne(req, res) {
    const { user: idUser, follow: idFollow } = req.body;
    if(!idUser || !idFollow) {
        return res.status(400).send({
            status: 'fail',
            code: 400,
            message: 'Bad request',
        });
    }
    if(idUser === idFollow) {
        return res.status(409).send({
            status: 'fail',
            data: { idUser: 'Users cannot follow themselves' }
        });
    }
    let user, follow;

    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        user = await User.findByIdAndUpdate(idUser, { $addToSet: { following: idFollow } }, opts);
        follow = await User.findByIdAndUpdate(idFollow, { $addToSet: { followers: idUser } }, opts);
        await session.commitTransaction();
        session.endSession();
    } catch(err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    if(!user || !follow) {
        return res.status(404).send({
            status: 'fail',
            code: 404,
            message: 'User or follow not found',
        });
    }
    
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
}

async function deleteOne(req, res) {
    const { user: idUser, follow: idFollow } = req.body;
    if(!idUser || !idFollow) {
        return res.status(400).send({
            status: 'fail',
            code: 400,
            message: 'Bad request',
        });
    }
    if(idUser === idFollow) {
        return res.status(409).send({
            status: 'fail',
            data: { idUser: 'Users cannot unfollow themselves' }
        });
    }
    let user, follow;
    try {
        user = await User.findById(idUser);
    } catch {}
    if(!user) {
        return res.status(404).send({
            status: 'fail',
            code: 404,
            message: 'User not found',
        });
    }
    if(!user.following || !user.following.includes(idFollow)) {
        return res.status(409).send({
            status: 'fail',
            data: { idUser: 'User is not following follow' }
        });
    }

    const session = await User.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        await User.findByIdAndUpdate(idUser, { $pull: { following: idFollow } }, opts);
        follow = await User.findByIdAndUpdate(idFollow, { $pull: { followers: idUser } }, opts);
        await session.commitTransaction();
        session.endSession();
    } catch(err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    if(!follow) {
        return res.status(404).send({
            status: 'fail',
            code: 404,
            message: 'Follow not found',
        });
    }
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
}

module.exports = { createOne, deleteOne };
