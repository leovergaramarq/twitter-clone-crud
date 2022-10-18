const User = require('../models/User');

async function getOne(req, res) {
    let user;
    try {
        user = await User.findById(req.params.id);
    } catch(err){
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
        return;
    }
    res.status(200).send({
        status: 'success',
        data: user,
    });
}

async function getMany(req, res) {
    let users;
    try {
        users = await User.find(res.query);
    } catch(err) {
        console.log(err);
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });
        return;
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

    const user = new User(fields);
    try {
        await user.save();
    } catch(err) {
        if(err.code === 11000) {
            res.status(409).send({
                status: 'fail',
                data: { username: 'Username already exists' }
            });
        } else if(err.name === 'ValidationError') {
            res.status(400).send({
                status: 'fail',
                data: { username: 'Username is required',  }
            });
        } else {
            res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
        return;
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
            res.status(409).send({
                status: 'fail',
                data: { username: 'Username already exists' }
            });
        } else {
            res.status(500).send({
                status: 'error',
                code: 500,
                message: err,
            });
        }
        return;
    }
    res.status(200).send({
        status: 'success',
        data: fields,
    });
}

function remove(req, res) {
    let user;
    
    try {
        user = User.findOneDelete(req.params.id);
    }catch(err) {
        res.status(500).send({
            status: 'error',
            code: 500,
            message: err,
        });

        return;
    }
    res.status(200).send({
        status: 'success',
        data: { id: user._id },
    });
}

const UPDATABLE_FIELDS = ['username', 'name', 'bio', 'interests'];
const STARTABLE_FIELDS = ['username', 'name', 'bio', 'interests'];

module.exports = { getOne, getMany, create, update, remove };
