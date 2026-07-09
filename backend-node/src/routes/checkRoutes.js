const express = require('express');
const router = express.Router();
const checkController = require('../controllers/checkController');

router.get('/', checkController.verifyStack);

module.exports = router;
