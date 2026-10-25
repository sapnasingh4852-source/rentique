const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/pending', authenticate, authorize('ADMIN'), inspectionController.getPendingInspections);
router.post('/:rentalId', authenticate, authorize('ADMIN'), inspectionController.submitVisualInspection);

module.exports = router;
