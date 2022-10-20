const { Router } = require('express');

const user = require('../controllers/user');
const follow = require('../controllers/follow');
const tweet = require('../controllers/tweet');
const like = require('../controllers/like');
const timeline = require('../controllers/timeline');

const router = Router();

router.use((req, _, next) => {
    console.log(`${req.method} ${req.url} **************`);
    next();
});

// /users
router.get('/users', user.getMany);
router.get('/users/:id', user.getOne);
// router.get('/users/:id/followers', follow.getUserFollowers);
// router.get('/users/:id/following', follow.getUserFollowing);
// router.get('/users/:id/timeline', timeline.getUserTimeline);
// router.get('/users/:id/likes', like.getUserLikes);
router.post('/users', user.create);
router.put('/users/:id', user.update);
router.delete('/users', user.removeMany);
router.delete('/users/:id', user.removeOne);

// // /tweets
router.get('/tweets', tweet.getMany);
router.get('/tweets/:id', tweet.getOne);
router.post('/tweets', tweet.create);
router.put('/tweets/:id', tweet.update);
router.delete('/tweets/:id', tweet.removeOne);
router.delete('/tweets/:id', tweet.removeMany);

// // /follow
router.post('/follow', follow.create);
router.delete('/follow', follow.remove);

// // /like
// router.post('/like', like.create);
// router.delete('/like', like.remove);

// Welcome
router.get('/', (req, res) => {
    res.send({
        message: 'Welcome to this Twitter clone API',
    });
});

// Default
router.use((req, res) => {
    res.status(404).send({
        status: 'fail',
        message: '404: Not found',
    });
});

module.exports = router;
