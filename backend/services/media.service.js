const fs = require('fs');
const path = require('path');
const cloudinaryService = require('./cloudinary.service');

const OVERRIDES_PATH = path.join(__dirname, '../data/mediaOverrides.json');

const TRANSFORM_PRESETS = {
  thumbnail: 'c_fill,g_auto,w_140,h_180,q_auto,f_auto',
  card: 'c_fill,g_auto,w_500,h_650,q_auto,f_auto',
  detail: 'c_limit,w_1000,h_1333,q_auto:best,f_auto',
  zoom: 'c_limit,w_1600,h_2133,q_auto:best,f_auto'
};

/**
 * Resolves catalog media for delivery.
 * Demo mode serves the local JPEG masters in frontend/public/media directly.
 * After `npm run media:push`, every source URL is replaced by its Cloudinary
 * delivery URL from data/mediaOverrides.json, enabling f_auto/q_auto variants.
 */
class MediaService {
  constructor() {
    this.overrides = {};
    this.loadOverrides();
  }

  loadOverrides() {
    try {
      if (fs.existsSync(OVERRIDES_PATH)) {
        this.overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
      }
    } catch (error) {
      console.warn('Cloudinary override map could not be read:', error.message);
      this.overrides = {};
    }
  }

  get overrideCount() {
    return Object.keys(this.overrides).length;
  }

  resolveUrl(url) {
    if (!url) return url;
    return this.overrides[url] || url;
  }

  isCloudinaryUrl(url = '') {
    return url.includes('res.cloudinary.com') && (url.includes('/upload/') || url.includes('/fetch/'));
  }

  isLocalUrl(url = '') {
    return url.startsWith('/media/');
  }

  transformUrl(url, preset = 'card') {
    if (!this.isCloudinaryUrl(url)) return url;
    const marker = url.includes('/upload/') ? '/upload/' : '/fetch/';
    const [base, rest] = url.split(marker);
    if (!rest) return url;
    const transform = TRANSFORM_PRESETS[preset] || TRANSFORM_PRESETS.card;
    return `${base}${marker}${transform}/${rest}`;
  }

  applyToProduct(product) {
    if (!product) return product;
    const listingImages = (product.listingImages || []).map(image => {
      const secureUrl = this.resolveUrl(image.secureUrl);
      return {
        ...image,
        secureUrl,
        thumbnailUrl: this.transformUrl(secureUrl, 'thumbnail'),
        cardUrl: this.transformUrl(secureUrl, 'card'),
        detailUrl: this.transformUrl(secureUrl, 'detail')
      };
    });

    const conditionHistory = (product.conditionHistory || []).map(entry => ({
      ...entry,
      evidence: (entry.evidence || []).map(item => ({
        ...item,
        secureUrl: this.resolveUrl(item.secureUrl)
      }))
    }));

    return { ...product, listingImages, conditionHistory };
  }

  resolveMediaItems(items) {
    return (items || []).map(item => ({
      ...item,
      secureUrl: this.resolveUrl(item.secureUrl || item.url)
    }));
  }

  applyToEvidence(evidence) {
    if (!evidence) return evidence;
    const received = evidence.customerReceived || {};
    return {
      ...evidence,
      beforeRental: this.resolveMediaItems(evidence.beforeRental),
      customerReturn: this.resolveMediaItems(evidence.customerReturn),
      deliveryPartnerReturn: this.resolveMediaItems(evidence.deliveryPartnerReturn),
      damageEvidence: this.resolveMediaItems(evidence.damageEvidence),
      customerReceived: {
        ...received,
        customerReceivedImages: this.resolveMediaItems(received.customerReceivedImages),
        customerReceivedVideos: this.resolveMediaItems(received.customerReceivedVideos)
      }
    };
  }

  applyToRental(rental) {
    if (!rental) return rental;
    return {
      ...rental,
      product: this.applyToProduct(rental.product),
      evidence: this.applyToEvidence(rental.evidence)
    };
  }

  status() {
    return {
      cloudinaryConfigured: cloudinaryService.isConfigured(),
      cloudName: cloudinaryService.cloudName,
      deliveryMode: this.overrideCount > 0 ? 'CLOUDINARY_DELIVERY' : 'LOCAL_MEDIA',
      overrideCount: this.overrideCount,
      overridesFile: 'backend/data/mediaOverrides.json'
    };
  }
}

module.exports = new MediaService();
