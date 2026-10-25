const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('CUSTOMER'), rentalController.createRental);
router.get('/quote', authenticate, authorize('CUSTOMER'), rentalController.getQuote);
router.get('/my-rentals', authenticate, authorize('CUSTOMER'), rentalController.getMyRentals);
router.get('/all', authenticate, authorize('ADMIN', 'DELIVERY_PARTNER'), rentalController.getAllRentals);
router.get('/:id', authenticate, rentalController.getRentalById);
router.put('/:id/refund-preference', authenticate, rentalController.updateRefundPreference);

module.exports = router;
