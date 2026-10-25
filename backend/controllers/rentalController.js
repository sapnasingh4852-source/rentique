const store = require('../data/store');
const pricingService = require('../services/pricing.service');
const mediaService = require('../services/media.service');

exports.createRental = async (req, res) => {
  try {
    const {
      productId,
      rentalDurationDays = 3,
      startDate = new Date(),
      refundPreference = 'APP_WALLET'
    } = req.body;

    const customerId = req.user._id;
    const user = store.findUserById(customerId);
    const product = store.findProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (!product.available) {
      return res.status(400).json({ success: false, message: 'This item is currently out on rent or under maintenance.' });
    }

    // Check customer loyalty tier discount
    const isTrustedRenter = user.trustScore >= 90;
    const loyaltyDetails = pricingService.determineLoyaltyTier(user.successfulReturns || 0);
    const pricing = pricingService.calculateRentalPricing(
      product.actualPrice,
      loyaltyDetails.discountPercent,
      isTrustedRenter,
      rentalDurationDays
    );

    // Compute due date
    const start = new Date(startDate);
    const due = new Date(start.getTime() + rentalDurationDays * 24 * 60 * 60 * 1000);

    const rental = store.createRental({
      productId: product._id,
      customerId: user._id,
      deliveryPartnerId: '65e000000000000000000002', // Auto-assign default test logistics partner
      rentalDurationDays,
      startDate: start,
      dueDate: due,
      pricing: {
        actualPrice: product.actualPrice,
        rentalPrice: pricing.rentalPrice,
        securityDeposit: pricing.securityDeposit,
        totalPaidInitial: pricing.customerInitialPayment,
        lateFee: 0,
        lateDays: 0,
        damageFee: 0,
        calculatedRefund: pricing.securityDeposit
      },
      refundPreference: ['APP_WALLET', 'ORIGINAL_PAYMENT_METHOD'].includes(refundPreference)
        ? refundPreference
        : 'APP_WALLET'
    });

    // Update user stats
    store.updateUser(user._id, {
      totalRentals: (user.totalRentals || 0) + 1
    });

    // Add alert notification
    store.addNotification(
      user._id,
      `Rental ${rental.rentalNumber} Confirmed!`,
      `Your booking for ${product.title} has been confirmed. Security deposit will be refunded to your ${rental.refundPreference === 'APP_WALLET' ? 'App Wallet' : 'Original Payment Method'} upon successful inspection.`
    );

    res.status(201).json({
      success: true,
      message: 'Rental booked successfully!',
      rental: mediaService.applyToRental(rental)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyRentals = async (req, res) => {
  try {
    const rentals = store.getRentals({ customerId: req.user._id });
    res.json({
      success: true,
      count: rentals.length,
      rentals: rentals.map(r => mediaService.applyToRental(r))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRentals = async (req, res) => {
  try {
    const rentals = store.getRentals();
    res.json({
      success: true,
      count: rentals.length,
      rentals: rentals.map(r => mediaService.applyToRental(r))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRentalById = async (req, res) => {
  try {
    const rental = store.findRentalById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // Role check: Only customer owner, delivery partner, or admin can access
    if (
      req.user.role === 'CUSTOMER' &&
      rental.customerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied to this rental.' });
    }

    res.json({
      success: true,
      rental: mediaService.applyToRental(rental)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Refund Preference UI update:
 * Allow the customer to change their preference before the refund is processed
 */
exports.updateRefundPreference = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundPreference } = req.body;

    if (!['APP_WALLET', 'ORIGINAL_PAYMENT_METHOD'].includes(refundPreference)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preference. Must be APP_WALLET or ORIGINAL_PAYMENT_METHOD.'
      });
    }

    const rental = store.findRentalById(id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Refund has already been processed. Preference cannot be altered.'
      });
    }

    const updated = store.updateRental(rental._id, { refundPreference });

    res.json({
      success: true,
      message: `Refund preference updated to ${refundPreference === 'APP_WALLET' ? 'App Wallet' : 'Original Payment Method'}.`,
      rental: mediaService.applyToRental(updated)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
