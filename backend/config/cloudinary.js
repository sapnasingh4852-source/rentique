const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

function fromCloudinaryUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!parsed.hostname || !parsed.username || !parsed.password) return null;
    return {
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password)
    };
  } catch {
    console.warn('CLOUDINARY_URL is malformed and was ignored.');
    return null;
  }
}

const urlCredentials = fromCloudinaryUrl(process.env.CLOUDINARY_URL);

cloudinary.config({
  cloud_name: urlCredentials?.cloud_name || process.env.CLOUDINARY_CLOUD_NAME || 'fashion-rental-cloud',
  api_key: urlCredentials?.api_key || process.env.CLOUDINARY_API_KEY || '987654321098765',
  api_secret: urlCredentials?.api_secret || process.env.CLOUDINARY_API_SECRET || 'demo_cloudinary_secret_key_here',
  secure: true
});

module.exports = cloudinary;
