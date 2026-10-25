const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['RENTAL_UPDATE', 'INSPECTION_RESULT', 'REFUND_PROCESSED', 'PENALTY_NOTICE', 'DEFECT_CLAIM'],
      default: 'RENTAL_UPDATE'
    },
    read: { type: Boolean, default: false },
    link: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
