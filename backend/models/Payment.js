const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
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
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentGateway: {
      type: String,
      default: 'Rentique DemoPay'
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'COD', 'WALLET'],
      default: 'CARD'
    },
    // Never the full PAN or CVV — only a display-safe label such as "VISA •••• 4242".
    maskedInstrument: {
      type: String,
      default: ''
    },
    deliveryPincode: String,
    amount: {
      type: Number,
      required: true
    },
    paymentType: {
      type: String,
      enum: ['INITIAL_RENTAL_DEPOSIT', 'PENALTY_SETTLEMENT'],
      default: 'INITIAL_RENTAL_DEPOSIT'
    },
    paymentStatus: {
      type: String,
      enum: ['INITIATED', 'PENDING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS'
    },
    refundStatus: {
      type: String,
      enum: ['NOT_APPLICABLE', 'PENDING', 'PROCESSED_WALLET', 'PROCESSED_SOURCE', 'FAILED'],
      default: 'PENDING'
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundDestination: {
      type: String,
      enum: ['APP_WALLET', 'ORIGINAL_PAYMENT_METHOD'],
      default: 'APP_WALLET'
    },
    refundTransactionId: String,
    refundProcessedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
