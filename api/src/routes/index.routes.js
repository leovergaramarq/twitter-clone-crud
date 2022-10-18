const { Router } = require('express');

const user = require('../controllers/user');
const follow = require('../controllers/follow');
const tweet = require('../controllers/tweet');
const like = require('../controllers/like');
const timeline = require('../controllers/timeline');

const router = Router();

// /users
// router.get('/users', user.getMany);
// router.get('/users/:id', user.getOne);
// router.get('/users/:id/followers', follow.getUserFollowers);
// router.get('/users/:id/following', follow.getUserFollowing);
// router.get('/users/:id/timeline', timeline.getUserTimeline);
// router.get('/users/:id/likes', like.getUserLikes);
// router.post('/users', user.create);
// router.put('/users/:id', user.update);
// router.delete('/users/:id', user.remove);

// // /tweets
// router.get('/tweets', tweet.getMany);
// router.get('/tweets/:id', tweet.getOne);
// router.post('/tweets', tweet.create);
// router.put('/tweets/:id', tweet.update);
// router.delete('/tweets/:id', tweet.remove);

// // /follow
// router.post('/follow', follow.create);
// router.delete('/follow', follow.remove);

// // /like
// router.post('/like', like.create);
// router.delete('/like', like.remove);

// Welcome
router.use('/', (req, res) => {
    res.send({
        message: 'Welcome to this Twitter clone API',
    });
});

// Default
router.use((req, res) => {
    res.status(404).send({
        status: 404,
        message: 'Route not found',
    });
});

module.exports = router;
