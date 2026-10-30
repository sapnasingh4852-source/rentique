const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/serviceability', deliveryController.checkServiceability);
router.get('/coverage', deliveryController.getCoverage);

// Logistics job board and delivery leg transitions
router.get('/jobs', authenticate, authorize('DELIVERY_PARTNER', 'ADMIN'), deliveryController.getJobs);
router.put('/:id/delivery-status', authenticate, authorize('DELIVERY_PARTNER', 'ADMIN'), deliveryController.updateDeliveryStatus);

module.exports = router;
