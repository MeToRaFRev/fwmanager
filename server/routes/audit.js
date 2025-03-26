const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/audit', authenticateToken, auditController.getAuditLog);

module.exports = router;
