const mongoose = require('mongoose');

const listingImageSchema = new mongoose.Schema({
  viewType: {
    type: String,
    enum: ['FRONT', 'BACK', 'SIDE', 'CLOSEUP', 'TAG'],
    required: true
  },
  publicId: { type: String, required: true },
  cloudinaryPublicId: { type: String }, // Alias as requested in prompt
  secureUrl: { type: String, required: true },
  resourceType: { type: String, default: 'image' },
  format: { type: String, default: 'webp' },
  width: { type: Number, default: 1200 },
  height: { type: Number, default: 1600 }
});

const conditionHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  stage: {
    type: String,
    enum: ['INITIAL_STOCK', 'BEFORE_RENTAL', 'RETURNED', 'INSPECTED', 'REPAIRED'],
    required: true
  },
  rentalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
  customerName: String,
  conditionGrade: {
    type: String,
    enum: ['EXCELLENT', 'VERY_GOOD', 'GOOD', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'REPAIRED'],
    default: 'EXCELLENT'
  },
  notes: { type: String, required: true },
  evidence: [
    {
      publicId: String,
      secureUrl: String,
      viewType: String,
      resourceType: { type: String, default: 'image' }
    }
  ]
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['CLOTHES', 'SHOES', 'ACCESSORIES'],
      required: true
    },
    collection: {
      type: String,
      enum: ['lehengas', 'sarees', 'suits', 'gowns', 'menswear', 'jewellery', 'bags', 'footwear'],
      default: 'lehengas',
      index: true
    },
    subCategory: { type: String, required: true }, // e.g. 'Evening Gown', 'Tuxedo', 'Heels', 'Clutch'
    gender: { type: String, enum: ['WOMEN', 'MEN', 'UNISEX'], default: 'WOMEN' },
    size: [{ type: String }], // ['S', 'M', 'L'] or ['UK 7', 'UK 8']
    color: { type: String, default: 'Classic' },
    colorFamily: { type: String, default: 'Gold', index: true },
    fabricOrMaterial: { type: String, default: 'Silk / Italian Leather' },
    description: { type: String, required: true },
    occasion: { type: String, default: 'Cocktail / Wedding / Gala' },
    
    // Pricing
    actualPrice: { type: Number, required: true }, // 100%
    rentalPrice: { type: Number, required: true }, // 20%
    securityDeposit: { type: Number, required: true }, // 30%

    // Cloudinary Listing Images (Front, Back, Side, Close-up, Tag)
    listingImages: [listingImageSchema],

    currentCondition: {
      type: String,
      enum: ['EXCELLENT', 'VERY_GOOD', 'GOOD', 'UNDER_REPAIR'],
      default: 'EXCELLENT'
    },

    // Visual Condition Timeline
    conditionHistory: [conditionHistorySchema],

    available: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 24 }
  },
  { timestamps: true }
);

// Auto-populate alias if not explicitly provided
productSchema.pre('save', function (next) {
  if (this.listingImages && this.listingImages.length > 0) {
    this.listingImages.forEach(img => {
      if (!img.cloudinaryPublicId) {
        img.cloudinaryPublicId = img.publicId;
      }
    });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
