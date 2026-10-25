require('dotenv').config();

const cloudinary = require('../config/cloudinary');
const cloudinaryService = require('../services/cloudinary.service');

async function main() {
  if (!cloudinaryService.isConfigured()) {
    console.error(
      'Cloudinary is not configured. Add real CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env.'
    );
    process.exit(1);
  }

  try {
    const result = await cloudinary.api.ping();
    console.log(`Cloudinary OK — cloud "${cloudinaryService.cloudName}" (${result.status}).`);
  } catch (error) {
    const detail = error.error?.message || error.message || 'unknown error';
    console.error(`Cloudinary rejected the credentials: ${detail}`);
    process.exit(1);
  }
}

main();
