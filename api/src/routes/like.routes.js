const { Router } = require('express');
const like = require('../controllers/like.controllers');

const router = Router();

router.post('/', like.createOne);
router.delete('/', like.deleteOne);

module.exports = router;
