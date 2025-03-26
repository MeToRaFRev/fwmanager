// routes/requests.js
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/requests', authenticateToken, requestController.getAllRequests);
router.get('/request/:id', authenticateToken, requestController.getRequestById);
router.post('/requests', authenticateToken, requestController.createRequest);
router.patch('/request/:id', authenticateToken, requireAdmin, requestController.updateRequest);
router.post('/nslookup', requestController.nsLookup);

module.exports = router;
