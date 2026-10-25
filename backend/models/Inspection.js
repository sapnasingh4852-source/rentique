const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    condition: {
      type: String,
      enum: ['NO_DAMAGE', 'MINOR_DAMAGE', 'MAJOR_DAMAGE'],
      required: true,
      default: 'NO_DAMAGE'
    },
    beforeVsAfterNotes: {
      type: String,
      default: 'No visible changes between dispatch proof and return inspection.'
    },
    damageDescription: {
      type: String,
      default: ''
    },
    damageFee: {
      type: Number,
      default: 0
    },
    lateDays: {
      type: Number,
      default: 0
    },
    lateFee: {
      type: Number,
      default: 0
    },
    securityDeposit: {
      type: Number,
      required: true
    },
    finalRefundAmount: {
      type: Number,
      required: true
    },
    refundDestination: {
      type: String,
      enum: ['APP_WALLET', 'ORIGINAL_PAYMENT_METHOD'],
      required: true
    },
    approvedByAdmin: {
      type: Boolean,
      default: true
    },
    disputeStatus: {
      type: String,
      enum: ['NONE', 'DISPUTED', 'RESOLVED_REDUCED', 'RESOLVED_UPHELD'],
      default: 'NONE'
    },
    disputeReason: String,
    disputeEvidenceUrls: [String],
    inspectedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);
