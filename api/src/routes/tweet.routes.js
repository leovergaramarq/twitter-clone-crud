const { Router } = require('express');
const {
    readOne,
    readMany,
    createOne,
    updateOne,
    deleteOne,
    // deleteMany
} = require('../controllers/tweet.controllers');

const router = Router();

router.get('/', readMany);
router.get('/:id', readOne);
router.post('/', createOne);
router.put('/:id', updateOne);
router.delete('/:id', deleteOne);
// router.delete('/tweets/:id', deleteMany);

module.exports = router;
