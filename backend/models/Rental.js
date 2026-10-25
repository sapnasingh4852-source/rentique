const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    rentalNumber: {
      type: String,
      required: true,
      unique: true
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
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rentalDurationDays: {
      type: Number,
      required: true,
      default: 3
    },
    size: {
      type: String,
      default: 'Free Size'
    },
    delivery: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      area: String,
      etaDays: Number
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'COD'],
      default: 'CARD'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS'
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnedDate: {
      type: Date
    },
    status: {
      type: String,
      enum: [
        'BOOKED',
        'DISPATCH_PREPARED',    // Admin uploaded Before-Rental Condition Proof
        'OUT_FOR_DELIVERY',     // Partner dispatched
        'DELIVERED',            // Customer received
        'RETURN_REQUESTED',     // Customer requested return & uploaded photos
        'PICKED_UP',            // Delivery partner uploaded return condition
        'UNDER_INSPECTION',     // Arrived at hub for Before vs After review
        'INSPECTED',            // Admin completed inspection & entered damage/late fees
        'COMPLETED',            // Security deposit refund processed
        'DISPUTED'              // Customer raised dispute against damage penalty
      ],
      default: 'BOOKED'
    },
    pricing: {
      actualPrice: { type: Number, required: true },
      rentalPrice: { type: Number, required: true },
      securityDeposit: { type: Number, required: true },
      totalPaidInitial: { type: Number, required: true },
      lateFee: { type: Number, default: 0 },
      lateDays: { type: Number, default: 0 },
      damageFee: { type: Number, default: 0 },
      calculatedRefund: { type: Number, default: 0 }
    },
    refundPreference: {
      type: String,
      enum: ['APP_WALLET', 'ORIGINAL_PAYMENT_METHOD'],
      default: 'APP_WALLET'
    },
    receiveVerification: {
      status: {
        type: String,
        enum: ['PENDING', 'RECEIVED_CORRECTLY', 'ISSUE_REPORTED'],
        default: 'PENDING'
      },
      verifiedAt: Date
    },
    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rental', rentalSchema);
