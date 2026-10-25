const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'DELIVERY_PARTNER', 'ADMIN'],
      default: 'CUSTOMER'
    },
    phone: { type: String, default: '+91 98765 43210' },
    address: {
      street: { type: String, default: '124 Indiranagar 100ft Road' },
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      pincode: { type: String, default: '560038' }
    },
    walletBalance: { type: Number, default: 0 },
    trustScore: { type: Number, default: 95, min: 0, max: 100 },
    totalRentals: { type: Number, default: 0 },
    successfulReturns: { type: Number, default: 0 },
    lateReturns: { type: Number, default: 0 },
    damageCases: { type: Number, default: 0 },
    loyaltyTier: {
      type: String,
      enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
      default: 'BRONZE'
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
