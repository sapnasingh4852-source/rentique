const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection'
    },
    type: {
      type: String,
      enum: ['DAMAGE_FEE', 'LATE_RETURN_FEE', 'COMBINED'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPLIED', 'DISPUTED', 'RESOLVED_WAIVED', 'RESOLVED_REDUCED'],
      default: 'APPLIED'
    },
    disputeReason: {
      type: String,
      default: ''
    },
    disputeEvidence: [
      {
        publicId: String,
        secureUrl: String,
        resourceType: { type: String, default: 'image' }
      }
    ],
    disputedAt: Date,
    resolvedAt: Date,
    adminResolutionNotes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Penalty', penaltySchema);
