const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/metrics', authenticate, authorize('ADMIN'), adminController.getAdminMetrics);

module.exports = router;
