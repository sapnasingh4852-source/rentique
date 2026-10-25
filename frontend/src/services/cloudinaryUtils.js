/**
 * Client-Side Cloudinary Media Utilities
 * Generates dynamic transformation URLs (responsive, thumbnails, side-by-side zoom)
 * and performs direct signed uploads to Cloudinary without overloading backend buffers.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';

// Cloudinary rejects gravity alongside c_limit; only crop modes that use
// gravity may include g_auto.
function buildTransformations({ crop, gravity, width, height, quality, format }) {
  return [
    `c_${crop}`,
    crop === 'limit' ? null : `g_${gravity}`,
    `w_${width}`,
    `h_${height}`,
    `q_${quality}`,
    `f_${format}`
  ]
    .filter(Boolean)
    .join(',');
}

/**
 * Build dynamic Cloudinary transformed URL
 * Applies automatic WebP/AVIF format, auto-quality, and gravity-assisted smart cropping
 */
export function getOptimizedImageUrl(urlOrPublicId, options = {}) {
  if (!urlOrPublicId) return '';

  // Local / bundled assets are served as-is; never rewrite them to Cloudinary
  if (
    urlOrPublicId.startsWith('/') ||
    urlOrPublicId.startsWith('data:') ||
    urlOrPublicId.startsWith('blob:')
  ) {
    return urlOrPublicId;
  }

  const {
    width = 600,
    height = 800,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto'
  } = options;

  // If it's a Cloudinary public_id (doesn't start with http)
  if (!urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://')) {
    if (!CLOUDINARY_CLOUD_NAME) return urlOrPublicId;
    const transformations = buildTransformations({ crop, gravity, width, height, quality, format });
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${urlOrPublicId}`;
  }

  // If it's an Unsplash fallback image, use Unsplash dynamic parameters
  if (urlOrPublicId.includes('unsplash.com')) {
    const url = new URL(urlOrPublicId);
    url.searchParams.set('w', width);
    url.searchParams.set('q', 80);
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }

  // If it's an existing Cloudinary URL, inject transformations before the upload path
  if (urlOrPublicId.includes('res.cloudinary.com') && urlOrPublicId.includes('/upload/')) {
    const parts = urlOrPublicId.split('/upload/');
    const transformations = buildTransformations({ crop, gravity, width, height, quality, format });
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  }

  return urlOrPublicId;
}

/**
 * Thumbnail URL (120x150)
 */
export function getThumbnailUrl(urlOrPublicId) {
  return getOptimizedImageUrl(urlOrPublicId, {
    width: 140,
    height: 180,
    crop: 'fill'
  });
}

/**
 * Detail View (1000x1333)
 */
export function getDetailImageUrl(urlOrPublicId) {
  return getOptimizedImageUrl(urlOrPublicId, {
    width: 1000,
    height: 1333,
    crop: 'limit'
  });
}

/**
 * Side-by-side Inspection URL (600x750)
 */
export function getInspectionImageUrl(urlOrPublicId) {
  return getOptimizedImageUrl(urlOrPublicId, {
    width: 700,
    height: 900,
    crop: 'fill'
  });
}

/**
 * Direct Signed Upload to Cloudinary from browser
 */
export async function uploadDirectToCloudinary(file, signData) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.apiKey);
  formData.append('timestamp', signData.timestamp);
  formData.append('signature', signData.signature);
  if (signData.folder) {
    formData.append('folder', signData.folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Cloudinary direct upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      publicId: data.public_id,
      secureUrl: data.secure_url,
      resourceType: data.resource_type,
      format: data.format,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.warn('Cloudinary direct upload fell back to local buffer route:', error.message);
    throw error;
  }
}
