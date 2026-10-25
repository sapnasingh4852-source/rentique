const fs = require('fs');
const path = require('path');
const { collectionMap } = require('../categories');
const mediaOverrides = require('../mediaOverrides.json');

const VIEW_TYPES = ['FRONT', 'BACK', 'SIDE', 'CLOSEUP', 'TAG'];
const PRODUCT_MEDIA_DIR = path.join(__dirname, '../../../frontend/public/media/products');

const DEFAULT_SIZES = {
  lehengas: ['XS', 'S', 'M', 'L', 'XL'],
  sarees: ['Free Size'],
  suits: ['XS', 'S', 'M', 'L', 'XL'],
  gowns: ['XS', 'S', 'M', 'L'],
  menswear: ['38', '40', '42', '44', '46'],
  jewellery: ['Free Size'],
  bags: ['Free Size'],
  footwear: ['UK 5', 'UK 6', 'UK 7', 'UK 8']
};

const DEFAULT_OCCASIONS = {
  lehengas: 'Wedding',
  sarees: 'Wedding',
  suits: 'Sangeet',
  gowns: 'Cocktail',
  menswear: 'Wedding',
  jewellery: 'Wedding',
  bags: 'Sangeet',
  footwear: 'Wedding'
};

let autoSequence = 0x200;
function nextId() {
  autoSequence += 1;
  return `65e1${autoSequence.toString(16).padStart(20, '0')}`;
}

function priceProduct(actualPrice) {
  const rentalPrice = Math.max(49, Math.round((actualPrice * 0.2) / 10) * 10);
  const securityDeposit = Math.max(100, Math.round((actualPrice * 0.3) / 50) * 50);
  return { rentalPrice, securityDeposit };
}

function buildImages(collectionId, entry, collection, id) {
  const fallbackImage = entry.image || collection.image;
  return VIEW_TYPES.map((viewType) => {
    const view = viewType.toLowerCase();
    const fileName = `${id}-${view}.jpg`;
    const localPath = `/media/products/${fileName}`;
    const generated =
      Boolean(mediaOverrides[localPath]) ||
      fs.existsSync(path.join(PRODUCT_MEDIA_DIR, fileName));

    return {
      viewType,
      publicId: `rentique/catalog/${collectionId}/${id}_${view}`,
      cloudinaryPublicId: `rentique/catalog/${collectionId}/${id}_${view}`,
      secureUrl: generated ? localPath : fallbackImage,
      sourceUrl: generated ? localPath : fallbackImage,
      resourceType: 'image',
      format: generated ? 'jpg' : 'webp',
      width: 900,
      height: 1342
    };
  });
}

function buildConditionHistory(listingImages, index, reviewCount) {
  const front = listingImages[0];
  const closeup = listingImages[3];
  const showcase = index === 0;
  const stainedCloseup = {
    publicId: 'rentique/evidence/rnt1023_return_closeup',
    secureUrl: '/media/evidence/rnt1023-return-stain.jpg',
    viewType: 'CLOSEUP'
  };
  const dispatchSet = listingImages.map(image => ({
    publicId: image.publicId,
    secureUrl: image.secureUrl,
    viewType: image.viewType
  }));
  const entries = [
    {
      date: new Date('2026-01-10T10:00:00Z'),
      stage: 'INITIAL_STOCK',
      conditionGrade: 'EXCELLENT',
      notes:
        'Catalogued with a verified front, fabric and authentication tag Cloudinary set. Fabric, embroidery and stitching checked by the boutique before intake.',
      evidence: [
        { publicId: front.publicId, secureUrl: front.secureUrl, viewType: 'FRONT' },
        { publicId: closeup.publicId, secureUrl: closeup.secureUrl, viewType: 'CLOSEUP' }
      ]
    }
  ];

  if (reviewCount >= 40) {
    entries.push({
      date: new Date('2026-07-18T09:30:00Z'),
      stage: 'BEFORE_RENTAL',
      customerName: 'Ananya Sharma',
      conditionGrade: 'EXCELLENT',
      notes: 'Pre-dispatch proof refreshed. Steam-pressed, sanitised and sealed in a Rentique garment bag.',
      evidence: showcase
        ? dispatchSet
        : [{ publicId: front.publicId, secureUrl: front.secureUrl, viewType: 'FRONT' }]
    });
    entries.push({
      date: new Date('2026-07-24T16:45:00Z'),
      stage: 'RETURNED',
      customerName: 'Ananya Sharma',
      conditionGrade: index % 5 === 0 ? 'MINOR_DAMAGE' : 'VERY_GOOD',
      notes:
        index % 5 === 0
          ? showcase
            ? 'Returned with a small oil mark on the left dupatta fall. Sent for specialist cleaning before relisting.'
            : 'Returned with a small bead loose on the hemline. Sent for repair before relisting.'
          : 'Returned on time. Dry-cleaned, inspected and returned to ready inventory.',
      evidence: [
        showcase
          ? stainedCloseup
          : { publicId: closeup.publicId, secureUrl: closeup.secureUrl, viewType: 'CLOSEUP' }
      ]
    });
  }

  if (index % 7 === 0) {
    entries.push({
      date: new Date('2026-09-06T11:15:00Z'),
      stage: 'REPAIRED',
      conditionGrade: 'REPAIRED',
      notes: 'Heritage dry-clean and hand-restoration completed. Restocked for the festive season.',
      evidence: [{ publicId: front.publicId, secureUrl: front.secureUrl, viewType: 'FRONT' }]
    });
  }

  return entries;
}

function buildDescription(entry, collection) {
  if (entry.description) return entry.description;
  return `${entry.title} from ${entry.brand}, curated for ${entry.occasion ||
    collection.tagline.toLowerCase()}. ${entry.fabric}. Available on a 3, 7 or 10 day rental with a fully refundable security deposit.`;
}

function defineCollection(collectionId, entries) {
  const collection = collectionMap[collectionId];
  if (!collection) throw new Error(`Unknown collection: ${collectionId}`);

  return entries.map((entry, index) => {
    const id = entry.id || nextId();
    const { rentalPrice, securityDeposit } = priceProduct(entry.actualPrice);
    const listingImages = buildImages(collectionId, entry, collection, id);
    const reviewCount = entry.reviews || 24 + ((index * 13) % 120);
    const rating = entry.rating || Number((4.72 + ((index * 7) % 26) / 100).toFixed(2));
    const colorFamily = entry.colorFamily || entry.color;
    const occasion = entry.occasion || DEFAULT_OCCASIONS[collectionId];

    return {
      _id: id,
      title: entry.title,
      brand: entry.brand,
      category: collection.category,
      collection: collectionId,
      subCategory: entry.subCategory,
      gender: entry.gender || collection.defaultGender || (collectionId === 'menswear' ? 'MEN' : 'WOMEN'),
      size: entry.sizes || DEFAULT_SIZES[collectionId],
      color: entry.colorName || entry.color,
      colorFamily,
      fabricOrMaterial: entry.fabric,
      description: buildDescription(entry, collection),
      occasion,
      actualPrice: entry.actualPrice,
      rentalPrice,
      securityDeposit,
      listingImages,
      currentCondition: 'EXCELLENT',
      conditionHistory: buildConditionHistory(listingImages, index, reviewCount),
      available: true,
      rating,
      reviewCount
    };
  });
}

module.exports = { defineCollection, priceProduct };
