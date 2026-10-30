const store = require('../data/store');
const mediaService = require('../services/media.service');

exports.getAdminMetrics = async (req, res) => {
  try {
    const products = store.products;
    const rentals = store.rentals;
    const users = store.users;
    const inspections = store.inspections;
    const penalties = store.penalties;

    const totalProducts = products.length;
    const activeRentals = rentals.filter(r => ['BOOKED', 'DISPATCH_PREPARED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(r.status)).length;

    const now = new Date().getTime();
    const overdueRentals = rentals.filter(r => {
      const isPastDue = new Date(r.dueDate).getTime() < now;
      return isPastDue && ['DELIVERED', 'OUT_FOR_DELIVERY'].includes(r.status);
    }).length;

    const pendingReturns = rentals.filter(r => r.status === 'RETURN_REQUESTED').length;
    const pendingInspections = rentals.filter(r => r.status === 'UNDER_INSPECTION').length;
    const damageClaims = inspections.filter(i => i.condition !== 'NO_DAMAGE').length;

    const totalRevenue = rentals.reduce((acc, r) => acc + (r.pricing?.rentalPrice || 0), 0);
    const totalDepositsHeld = rentals
      .filter(r => r.status !== 'COMPLETED')
      .reduce((acc, r) => acc + (r.pricing?.securityDeposit || 0), 0);

    const totalRefundsProcessed = inspections.reduce((acc, i) => acc + (i.finalRefundAmount || 0), 0);
    const customersCount = users.filter(u => u.role === 'CUSTOMER').length;

    // List of pending visual inspections with populated evidence
    const pendingInspectionQueue = store
      .getRentals({ status: 'UNDER_INSPECTION' })
      .map(rental => mediaService.applyToRental(rental));

    // New bookings waiting for the boutique to capture dispatch evidence
    const dispatchQueue = store
      .getRentals({ status: 'BOOKED' })
      .map(rental => mediaService.applyToRental(rental));

    res.json({
      success: true,
      metrics: {
        totalProducts,
        activeRentals,
        overdueRentals,
        pendingReturns,
        pendingInspections,
        damageClaims,
        totalRevenue,
        totalDepositsHeld,
        totalRefundsProcessed,
        customersCount,
        newOrders: dispatchQueue.length
      },
      dispatchQueue,
      pendingInspectionQueue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
