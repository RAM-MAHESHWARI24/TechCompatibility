const express = require('express');
const router = express.Router();
const lemfController = require('../controllers/lemfController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, lemfController.list);
router.post('/', authMiddleware, lemfController.create);
router.put('/:id', authMiddleware, lemfController.update);
router.delete('/:id', authMiddleware, lemfController.delete);

module.exports = router;
