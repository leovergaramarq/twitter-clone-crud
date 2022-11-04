const { Router } = require('express');
const follow = require('../controllers/follow.controllers');

const router = Router();

router.post('/', follow.createOne);
router.delete('/', follow.deleteOne);

module.exports = router;
