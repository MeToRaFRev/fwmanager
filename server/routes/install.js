const express = require('express');
const router = express.Router();
const installController = require('../controllers/installController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/install', authenticateToken, installController.install);

module.exports = router;
