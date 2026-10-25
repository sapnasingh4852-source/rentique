const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema({
  angle: {
    type: String,
    enum: ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'SIDE', 'CLOSEUP', 'TAG', 'DAMAGE', 'DEFECT', 'GENERAL'],
    default: 'GENERAL'
  },
  publicId: { type: String, required: true },
  cloudinaryPublicId: { type: String },
  secureUrl: { type: String, required: true },
  resourceType: { type: String, enum: ['image', 'video'], default: 'image' },
  format: String,
  caption: String,
  isPrivate: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  uploadedByRole: {
    type: String,
    enum: ['CUSTOMER', 'DELIVERY_PARTNER', 'ADMIN'],
    default: 'ADMIN'
  }
});

const customerReceivedSchema = new mongoose.Schema({
  verifiedGoodCondition: { type: Boolean, default: true },
  issueType: {
    type: String,
    enum: ['NONE', 'DAMAGED', 'DEFECTIVE', 'WRONG_PRODUCT', 'MISSING_ACCESSORY'],
    default: 'NONE'
  },
  issueDescription: { type: String, default: '' },
  reportedAt: { type: Date, default: Date.now },
  customerReceivedImages: [mediaItemSchema],
  customerReceivedVideos: [mediaItemSchema]
});

const rentalEvidenceSchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
      unique: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    // Official condition proof before customer receives (Front, Back, Left, Right, Close-up)
    beforeRental: [mediaItemSchema],

    // Customer receive verification / 7-day defective claims
    customerReceived: customerReceivedSchema,

    // Customer return process photos before pickup
    customerReturn: [mediaItemSchema],

    // Delivery partner pickup evidence
    deliveryPartnerReturn: [mediaItemSchema],

    // Specific damage evidence (private / authenticated)
    damageEvidence: [mediaItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('RentalEvidence', rentalEvidenceSchema);
