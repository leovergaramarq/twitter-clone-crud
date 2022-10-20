const User = require('../models/User');

async function getOne(req, res) {
    let user;
    try {
        user = await User.findById(req.params.id);
    } catch(err){
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

    res.status(200).send({
        status: 'success',
        data: user,
    });
}

async function getMany(req, res) {
    // console.log(req.query);
    let users;
    try {
        users = await User.find(req.query);
    } catch(err) {
        // console.log(err);
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data: users,
    });
}

async function create(req, res) {
    const fields = {};
    for(let field of STARTABLE_FIELDS) {
        if(req.body[field]) fields[field] = req.body[field];
    }
    console.log(fields);
    const user = new User(fields);
    try {
        await user.save();
    } catch(err) {
        // console.log(err);
        if(err.code === 11000) {
            return res.status(409).send({
                status: 'fail',
                data: { username: 'Username already exists' }
            });
        } else if(err.name === 'ValidationError') {
            return res.status(400).send({
                status: 'fail',
                data: { username: 'Username is required',  }
            });
        } else {
            return res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
    }
    res.status(201).send({
        status: 'success',
        data: { id: user._id },
    });
}

async function update(req, res) {   
    const fields = {};
    for(let field of UPDATABLE_FIELDS) {
        if(req.body[field]) fields[field] = req.body[field];
    }

    let user;
    try {
        user = await User.findByIdAndUpdate(req.params.id, fields);
    } catch(err) {
        if(err.code === 11000) {
            return res.status(409).send({
                status: 'fail',
                data: { username: 'Username already exists' }
            });
        } else {
            return res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
    }
    if(!user) {
        return res.status(404).send({
            status: 'fail',
            data: { id: 'User not found' },
        });
    }
    
    res.status(200).send({
        status: 'success',
        data: fields,
    });
}

async function removeOne(req, res) {
    let user;
    
    try {
        user = await User.findByIdAndDelete(req.params.id);
    }catch(err) {
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
    res.status(200).send({
        status: 'success',
        data: { id: user._id },
    });
}

async function removeMany(req, res) {
    let users;
    try {
        users = await User.deleteMany(req.query);
    } catch(err) {
        return res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
    }
    res.status(200).send({
        status: 'success',
        data: { count: users.deletedCount },
    });
}

const UPDATABLE_FIELDS = ['username', 'name', 'bio', 'interests'];
const STARTABLE_FIELDS = ['username', 'name', 'bio', 'interests'];

module.exports = { getOne, getMany, create, update, removeOne, removeMany };
