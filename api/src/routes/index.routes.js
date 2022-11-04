const { Router } = require('express');
const user = require('./user.routes');
const tweet = require('./tweet.routes');
const follow = require('./follow.routes');
const like = require('./like.routes');

const router = Router();

router.use((req, _, next) => {
    console.log(`${req.method} ${req.url} **************`);
    next();
});

router.use('/users', user);
router.use('/tweets', tweet);
router.use('/follow', follow);
router.use('/like', like);

// Welcome
router.get('/', (_, res) => {
    res.send({
        message: 'Welcome to this Twitter clone API',
    });
});

// Default
router.use((_, res) => {
    res.status(404).send({
        status: 'fail',
        message: '404: Not found',
    });
});

module.exports = router;
