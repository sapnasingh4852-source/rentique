const store = require('../data/store');
const serviceabilityService = require('../services/serviceability.service');
const mediaService = require('../services/media.service');

exports.checkServiceability = (req, res) => {
  const result = serviceabilityService.check(req.query.pincode);
  res.json({ success: true, ...result });
};

exports.getCoverage = (req, res) => {
  res.json({ success: true, ...serviceabilityService.coverage() });
};

/**
 * Logistics job board: outbound deliveries + return pickups in one response.
 * Outbound:   DISPATCH_PREPARED (ready to collect from boutique) and OUT_FOR_DELIVERY (en route to customer).
 * Return leg: RETURN_REQUESTED (customer waiting) and DELIVERED (already at customer, awaiting return request is not a task —
 *             kept for parity with the legacy portal filter so existing demo data still shows).
 */
exports.getJobs = (req, res) => {
  try {
    const rentals = store
      .getRentals({ status: 'DISPATCH_PREPARED' })
      .concat(store.getRentals({ status: 'OUT_FOR_DELIVERY' }))
      .concat(store.getRentals({ status: 'RETURN_REQUESTED' }))
      .map(rental => mediaService.applyToRental(rental));

    res.json({ success: true, count: rentals.length, rentals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Advance the outbound delivery leg:
 *   DISPATCH_PREPARED → OUT_FOR_DELIVERY → DELIVERED
 * Only these two transitions are allowed and only in this order, so the
 * boutique dispatch step can never be skipped.
 */
exports.updateDeliveryStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Logistics can only set status to OUT_FOR_DELIVERY or DELIVERED.'
      });
    }

    const rental = store.findRentalById(id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    const requiredPrevious = status === 'OUT_FOR_DELIVERY' ? 'DISPATCH_PREPARED' : 'OUT_FOR_DELIVERY';
    if (rental.status !== requiredPrevious) {
      return res.status(400).json({
        success: false,
        message: `Cannot mark ${status}: rental is currently ${rental.status}. It must be ${requiredPrevious} first.`
      });
    }

    const updated = store.updateRental(rental._id, {
      status,
      ...(status === 'OUT_FOR_DELIVERY' ? { dispatchedAt: new Date().toISOString() } : { deliveredAt: new Date().toISOString() })
    });

    const product = rental.product || {};
    if (status === 'OUT_FOR_DELIVERY') {
      store.addNotification(
        rental.customerId,
        `Rental ${rental.rentalNumber} is out for delivery!`,
        `${product.title} has left the boutique and should reach you within ${rental.delivery?.etaDays || 1} day(s).`
      );
    } else {
      store.addNotification(
        rental.customerId,
        `Rental ${rental.rentalNumber} delivered`,
        `${product.title} has been delivered. Please verify its condition in your dashboard to complete the handover.`
      );
    }

    res.json({
      success: true,
      message: `Rental ${rental.rentalNumber} marked ${status.replace(/_/g, ' ').toLowerCase()}.`,
      rental: mediaService.applyToRental(updated)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
