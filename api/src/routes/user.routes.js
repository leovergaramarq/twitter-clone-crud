const { Router } = require('express');
const {
    readOne,
    readMany,
    createOne,
    updateOne,
    deleteOne,
    // deleteMany
    readTimeline,
} = require('../controllers/user.controllers');
// const timeline = require('../controllers/timeline.controllers');

const router = Router();

router.get('/', readMany);
router.get('/:id', readOne);
// router.get('/:id/followers', follow.getUserFollowers);
// router.get('/:id/following', follow.getUserFollowing);
router.get('/:id/timeline', readTimeline);
// router.get('/:id/likes', like.getUserLikes);
router.post('/', createOne);
router.put('/:id', updateOne);
// router.delete('/', deleteMany);
router.delete('/:id', deleteOne);

module.exports = router;
