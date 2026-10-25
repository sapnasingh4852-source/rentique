const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    tier: {
      type: String,
      enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
      default: 'BRONZE'
    },
    totalRentalsCompleted: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 100 },
    perks: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loyalty', loyaltySchema);
