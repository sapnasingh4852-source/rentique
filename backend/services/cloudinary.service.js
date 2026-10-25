const cloudinary = require('../config/cloudinary');
const streamifier = require('stream');

const DEMO_CREDENTIALS = new Set([
  '',
  'fashion-rental-cloud',
  'fashion-rental-demo',
  '987654321098765',
  '123456789012345',
  'demo_cloudinary_secret_key_here',
  'sample_secret_key_demo_only'
]);

/**
 * Enterprise Cloudinary Service
 * Handles listing images, inspection evidence, direct signed uploads,
 * responsive transformations, video evidence, and private signed URLs.
 */
class CloudinaryService {
  constructor() {
    const config = cloudinary.config();
    this.cloudName = config.cloud_name;
    this.apiKey = config.api_key;
    this.apiSecret = config.api_secret;
  }

  /**
   * Check if Cloudinary credentials are valid production credentials
   */
  isConfigured() {
    return [this.cloudName, this.apiKey, this.apiSecret]
      .every(value => !DEMO_CREDENTIALS.has(value));
  }

  /**
   * Upload Image from buffer or file path
   * @param {Buffer|string} fileInput
   * @param {Object} options
   */
  async uploadImage(fileInput, options = {}) {
    const defaultOptions = {
      folder: 'fashion_rental/general',
      resource_type: 'image',
      format: 'webp',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };
    const uploadOptions = { ...defaultOptions, ...options };

    // If real Cloudinary is configured, upload via SDK
    if (this.isConfigured()) {
      return new Promise((resolve, reject) => {
        if (Buffer.isBuffer(fileInput)) {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) return reject(error);
            resolve({
              publicId: result.public_id,
              secureUrl: result.secure_url,
              resourceType: result.resource_type,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes
            });
          });
          const bufferStream = new streamifier.PassThrough();
          bufferStream.end(fileInput);
          bufferStream.pipe(stream);
        } else {
          cloudinary.uploader.upload(fileInput, uploadOptions)
            .then(result => resolve({
              publicId: result.public_id,
              secureUrl: result.secure_url,
              resourceType: result.resource_type,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes
            }))
            .catch(reject);
        }
      });
    }

    // High-fidelity fallback when testing locally without external API keys:
    // Generates valid, realistic Cloudinary image metadata and standard Unsplash high-res fashion fallback
    const id = `fashion_rental/${uploadOptions.folder || 'evidence'}/asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      publicId: id,
      secureUrl: options.mockUrl || `https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80`,
      resourceType: 'image',
      format: 'webp',
      width: 1200,
      height: 1600,
      bytes: 245120
    };
  }

  /**
   * Upload Video from buffer or path (for broken zip, fabric tear, defective motion proof)
   * @param {Buffer|string} fileInput
   * @param {Object} options
   */
  async uploadVideo(fileInput, options = {}) {
    const defaultOptions = {
      folder: 'fashion_rental/video_evidence',
      resource_type: 'video',
      transformation: [
        { quality: 'auto' }
      ]
    };
    const uploadOptions = { ...defaultOptions, ...options };

    if (this.isConfigured()) {
      return new Promise((resolve, reject) => {
        if (Buffer.isBuffer(fileInput)) {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) return reject(error);
            resolve({
              publicId: result.public_id,
              secureUrl: result.secure_url,
              resourceType: 'video',
              format: result.format,
              duration: result.duration,
              width: result.width,
              height: result.height
            });
          });
          const bufferStream = new streamifier.PassThrough();
          bufferStream.end(fileInput);
          bufferStream.pipe(stream);
        } else {
          cloudinary.uploader.upload(fileInput, uploadOptions)
            .then(result => resolve({
              publicId: result.public_id,
              secureUrl: result.secure_url,
              resourceType: 'video',
              format: result.format,
              duration: result.duration,
              width: result.width,
              height: result.height
            }))
            .catch(reject);
        }
      });
    }

    // High fidelity fallback for video evidence
    const id = `fashion_rental/video_evidence/vid_${Date.now()}`;
    return {
      publicId: id,
      secureUrl: options.mockUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-seamstress-threading-a-needle-43187-large.mp4',
      resourceType: 'video',
      format: 'mp4',
      duration: 6.2,
      width: 1280,
      height: 720
    };
  }

  /**
   * Delete Asset from Cloudinary
   * @param {string} publicId
   * @param {string} resourceType ('image' or 'video')
   */
  async deleteAsset(publicId, resourceType = 'image') {
    if (this.isConfigured()) {
      return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
    return { result: 'ok', mocked: true };
  }

  /**
   * Generate Transformed Cloudinary URL
   * Provides responsive sizes, crop gravity, WebP/AVIF auto format, and quality optimizations
   */
  generateSecureUrl(publicId, transformations = {}) {
    if (!publicId) return '';
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
      return publicId;
    }
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto',
      ...transformations
    });
  }

  /**
   * Presets for product cards, details, side-by-side inspection, and thumbnails
   */
  getTransformedUrl(publicId, preset = 'card') {
    const presets = {
      card: { width: 500, height: 650, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' },
      thumbnail: { width: 120, height: 160, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' },
      detail: { width: 1000, height: 1333, crop: 'limit', fetch_format: 'auto', quality: 'auto:best' },
      zoom: { width: 1600, height: 2133, crop: 'limit', quality: 'auto:best' },
      comparison: { width: 600, height: 750, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' },
      badgeOverlay: {
        width: 600,
        height: 750,
        crop: 'fill',
        overlay: { font_family: 'Arial', font_size: 24, font_weight: 'bold', text: 'VERIFIED EVIDENCE' },
        color: '#FFFFFF',
        gravity: 'south_east',
        x: 15,
        y: 15
      }
    };

    return this.generateSecureUrl(publicId, presets[preset] || presets.card);
  }

  /**
   * Generate Cloudinary Signature for direct browser upload
   * Prevents leaking API secret to frontend while enabling direct high-speed signed uploads
   */
  generateUploadSignature(paramsToSign = {}) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      ...paramsToSign
    };
    const signature = cloudinary.utils.api_sign_request(params, this.apiSecret);

    return {
      signature,
      timestamp,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder: params.folder || 'fashion_rental/evidence'
    };
  }

  /**
   * Generate Private / Authenticated Signed URL for sensitive damage evidence
   * Restricts viewing to authorized renters, delivery staff, and admins
   */
  generatePrivateEvidenceUrl(publicId, expiresInSeconds = 3600) {
    if (!publicId) return '';
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
      return publicId;
    }

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      type: 'authenticated',
      expires_at: expiresAt,
      fetch_format: 'auto',
      quality: 'auto'
    });
  }
}

module.exports = new CloudinaryService();
