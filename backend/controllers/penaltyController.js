const store = require('../data/store');

/**
 * Customer disputes damage penalty
 */
exports.disputePenalty = async (req, res) => {
  try {
    const { penaltyId } = req.params;
    const { disputeReason, counterEvidence = [] } = req.body;

    const penalty = store.findPenaltyById(penaltyId);
    if (!penalty) {
      return res.status(404).json({ success: false, message: 'Penalty not found' });
    }

    if (penalty.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to dispute this penalty.' });
    }

    const updatedPenalty = store.updatePenalty(penaltyId, {
      status: 'DISPUTED',
      disputeReason,
      disputeEvidence: counterEvidence,
      disputedAt: new Date().toISOString()
    });

    // Notify admin
    store.addNotification(
      '65e000000000000000000003', // Admin
      `⚠️ Penalty Disputed: ${penalty.amount} INR`,
      `Customer has contested penalty: "${disputeReason}". Cloudinary counter-evidence submitted for review.`,
      'PENALTY_NOTICE'
    );

    res.json({
      success: true,
      message: 'Dispute submitted. Admin review team will reassess within 24 hours.',
      penalty: updatedPenalty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin resolves customer penalty dispute
 */
exports.resolveDispute = async (req, res) => {
  try {
    const { penaltyId } = req.params;
    const { action = 'RESOLVED_REDUCED', newAmount = 0, adminNotes = '' } = req.body;

    const penalty = store.findPenaltyById(penaltyId);
    if (!penalty) {
      return res.status(404).json({ success: false, message: 'Penalty not found' });
    }

    const originalAmount = penalty.amount;
    const adjustedAmount = action === 'RESOLVED_WAIVED' ? 0 : Math.min(originalAmount, Number(newAmount));
    const refundedDiff = originalAmount - adjustedAmount;

    const updatedPenalty = store.updatePenalty(penaltyId, {
      status: action === 'RESOLVED_WAIVED' ? 'RESOLVED_WAIVED' : 'RESOLVED_REDUCED',
      amount: adjustedAmount,
      adminResolutionNotes: adminNotes,
      resolvedAt: new Date().toISOString()
    });

    // Credit back the difference to customer's wallet
    if (refundedDiff > 0) {
      const customer = store.findUserById(penalty.customerId);
      if (customer) {
        store.updateUser(customer._id, {
          walletBalance: (customer.walletBalance || 0) + refundedDiff
        });
      }
    }

    // Notify customer
    store.addNotification(
      penalty.customerId,
      'Penalty Dispute Resolved',
      `Your dispute has been reviewed. Outcome: ${action.replace('_', ' ')}. ₹${refundedDiff} credited back to your App Wallet.`,
      'PENALTY_NOTICE'
    );

    res.json({
      success: true,
      message: 'Dispute successfully resolved.',
      penalty: updatedPenalty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPenaltiesForCustomer = async (req, res) => {
  try {
    const penalties = store.penalties.filter(p => p.customerId.toString() === req.user._id.toString());
    res.json({
      success: true,
      count: penalties.length,
      penalties
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
