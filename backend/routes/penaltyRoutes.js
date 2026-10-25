const express = require('express');
const router = express.Router();
const penaltyController = require('../controllers/penaltyController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/my-penalties', authenticate, authorize('CUSTOMER'), penaltyController.getPenaltiesForCustomer);
router.post('/:penaltyId/dispute', authenticate, authorize('CUSTOMER'), penaltyController.disputePenalty);
router.post('/:penaltyId/resolve', authenticate, authorize('ADMIN'), penaltyController.resolveDispute);

module.exports = router;
