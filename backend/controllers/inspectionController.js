const store = require('../data/store');
const pricingService = require('../services/pricing.service');
const mediaService = require('../services/media.service');

/**
 * Get Pending Visual Inspections Queue for Admin
 */
exports.getPendingInspections = async (req, res) => {
  try {
    const pendingRentals = store.getRentals({ status: 'UNDER_INSPECTION' });
    res.json({
      success: true,
      count: pendingRentals.length,
      rentals: pendingRentals.map(rental => mediaService.applyToRental(rental))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Visual Inspection & Settle Deposit
 * Performs Before vs After evaluation, calculates late fees, applies damage penalty,
 * and processes refund according to customer preference (App Wallet or Original Payment Method).
 */
exports.submitVisualInspection = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const {
      condition = 'NO_DAMAGE', // NO_DAMAGE, MINOR_DAMAGE, MAJOR_DAMAGE
      damageDescription = '',
      damageFee = 0,
      beforeVsAfterNotes = 'Verified against Cloudinary dispatch photographs.'
    } = req.body;

    const rental = store.findRentalById(rentalId);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    const customer = store.findUserById(rental.customerId._id || rental.customerId);
    const product = store.findProductById(rental.productId._id || rental.productId);
    const securityDeposit = rental.pricing.securityDeposit;

    // 1. Calculate Late Fee
    const returnedDate = rental.returnedDate || new Date();
    const lateFeeDetails = pricingService.calculateLateFee(
      product.actualPrice,
      rental.dueDate,
      returnedDate
    );

    const damageFeeNum = Math.max(0, Number(damageFee) || 0);
    const totalLateFee = lateFeeDetails.totalLateFee;

    // 2. Calculate Final Deposit Refund
    const refundDetails = pricingService.calculateFinalRefund(
      securityDeposit,
      totalLateFee,
      damageFeeNum
    );

    // 3. Record Inspection Document
    const inspection = store.createInspection({
      rentalId: rental._id,
      productId: product._id,
      customerId: customer._id,
      inspectorId: req.user._id,
      condition,
      beforeVsAfterNotes,
      damageDescription,
      damageFee: damageFeeNum,
      lateDays: lateFeeDetails.numberOfLateDays,
      lateFee: totalLateFee,
      securityDeposit,
      finalRefundAmount: refundDetails.finalRefund,
      refundDestination: rental.refundPreference,
      approvedByAdmin: true
    });

    // 4. Record Penalty if damage or late fee is charged
    let penaltyRecord = null;
    if (damageFeeNum > 0 || totalLateFee > 0) {
      penaltyRecord = store.createPenalty({
        rentalId: rental._id,
        customerId: customer._id,
        inspectionId: inspection._id,
        type: damageFeeNum > 0 && totalLateFee > 0 ? 'COMBINED' : (damageFeeNum > 0 ? 'DAMAGE_FEE' : 'LATE_RETURN_FEE'),
        amount: damageFeeNum + totalLateFee,
        reason: `${damageDescription ? damageDescription + '. ' : ''}${totalLateFee > 0 ? `${lateFeeDetails.numberOfLateDays} days late fee applied.` : ''}`,
        status: 'APPLIED'
      });
    }

    // 5. Execute Refund according to Customer Preference
    if (rental.refundPreference === 'APP_WALLET') {
      const currentBalance = customer.walletBalance || 0;
      store.updateUser(customer._id, {
        walletBalance: currentBalance + refundDetails.finalRefund
      });
    } else {
      // ORIGINAL_PAYMENT_METHOD - Refund processed to card/UPI source
      // Payment record updated with refund transaction
      const payment = store.payments.find(p => p.rentalId.toString() === rental._id.toString());
      if (payment) {
        payment.refundStatus = 'PROCESSED_SOURCE';
        payment.refundAmount = refundDetails.finalRefund;
        payment.refundTransactionId = 'REF_TXN_' + Date.now();
        payment.refundProcessedAt = new Date().toISOString();
      }
    }

    // 6. Update Customer Trust Score & Stats
    const isCleanReturn = condition === 'NO_DAMAGE' && !lateFeeDetails.isLate;
    const isLate = lateFeeDetails.isLate;
    const isDamaged = condition !== 'NO_DAMAGE';

    const updatedUserStats = {
      successfulReturns: (customer.successfulReturns || 0) + (isCleanReturn ? 1 : 0),
      lateReturns: (customer.lateReturns || 0) + (isLate ? 1 : 0),
      damageCases: (customer.damageCases || 0) + (isDamaged ? 1 : 0)
    };

    const newTrustScore = pricingService.calculateTrustScore({
      totalRentals: customer.totalRentals || 1,
      successfulReturns: updatedUserStats.successfulReturns,
      lateReturns: updatedUserStats.lateReturns,
      damageCases: updatedUserStats.damageCases
    });

    const newLoyalty = pricingService.determineLoyaltyTier(updatedUserStats.successfulReturns);

    store.updateUser(customer._id, {
      ...updatedUserStats,
      trustScore: newTrustScore,
      loyaltyTier: newLoyalty.tier
    });

    // 7. Update Product Condition History & Inventory
    const newProductCondition = condition === 'MAJOR_DAMAGE' ? 'UNDER_REPAIR' : 'EXCELLENT';
    store.updateProductCondition(product._id, {
      stage: 'INSPECTED',
      rentalId: rental._id,
      customerName: customer.name,
      conditionGrade: condition,
      notes: `Visual inspection concluded: ${condition}. ${damageDescription ? `Damage note: ${damageDescription}.` : 'No damage.'}`
    }, newProductCondition);

    // 8. Update Rental Status to COMPLETED
    const updatedRental = store.updateRental(rental._id, {
      status: 'COMPLETED',
      inspectionId: inspection._id,
      pricing: {
        ...rental.pricing,
        lateFee: totalLateFee,
        lateDays: lateFeeDetails.numberOfLateDays,
        damageFee: damageFeeNum,
        calculatedRefund: refundDetails.finalRefund
      }
    });

    // 9. Alert Customer
    const refundMessage = rental.refundPreference === 'APP_WALLET'
      ? `₹${refundDetails.finalRefund} has been instantly credited to your App Wallet.`
      : `₹${refundDetails.finalRefund} refund has been processed back to your original payment method.`;

    store.addNotification(
      customer._id,
      `Inspection Complete for Rental ${rental.rentalNumber}`,
      `Inspection outcome: ${condition.replace('_', ' ')}. ${refundMessage}${damageFeeNum > 0 ? ` (Damage fee: ₹${damageFeeNum})` : ''}`,
      'INSPECTION_RESULT'
    );

    res.json({
      success: true,
      message: 'Inspection finalized and refund settled.',
      inspection,
      penalty: penaltyRecord,
      rental: mediaService.applyToRental(updatedRental)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
