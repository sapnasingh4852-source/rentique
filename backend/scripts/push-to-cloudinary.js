/**
 * Uploads every catalog image to Cloudinary and writes a source → delivery URL
 * override map. Run after adding real CLOUDINARY_* credentials to backend/.env:
 *
 *   npm run media:check
 *   npm run media:push
 *
 * Until then the storefront keeps serving the local JPEG masters in
 * frontend/public/media.
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const cloudinaryService = require('../services/cloudinary.service');
const { allProducts } = require('../data/products');

const OVERRIDES_PATH = path.join(__dirname, '../data/mediaOverrides.json');
const LOCAL_MEDIA_ROOT = path.join(__dirname, '../../frontend/public');
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;

function publicIdFor(source) {
  const hash = crypto.createHash('sha1').update(source).digest('hex').slice(0, 20);
  return `rentique/catalog/${hash}`;
}

function localPathFor(source) {
  if (!source.startsWith('/media/')) return null;
  return path.join(LOCAL_MEDIA_ROOT, source);
}

function collectSources() {
  const sources = new Map();
  allProducts.forEach(product => {
    (product.listingImages || []).forEach(image => {
      if (image.secureUrl && !sources.has(image.secureUrl)) {
        sources.set(image.secureUrl, { source: image.secureUrl, collection: product.collection });
      }
    });
  });
  return [...sources.values()];
}

async function uploadOne(asset) {
  const localPath = localPathFor(asset.source);
  if (localPath && !fs.existsSync(localPath)) {
    throw new Error(`Missing local file: ${localPath}`);
  }

  const publicId = publicIdFor(asset.source);
  try {
    const result = await cloudinary.uploader.upload(localPath || asset.source, {
      public_id: publicId,
      overwrite: false,
      invalidate: true,
      resource_type: 'image'
    });
    return { source: asset.source, secureUrl: result.secure_url, publicId: result.public_id };
  } catch (error) {
    // Re-runs are resumable: reuse the asset an earlier run already uploaded.
    if (error.http_code === 400 && /already exists/i.test(error.message || '')) {
      const existing = await cloudinary.api.resource(publicId);
      return { source: asset.source, secureUrl: existing.secure_url, publicId: existing.public_id };
    }
    throw error;
  }
}

function isRetryable(error) {
  const status = error.http_code || error.statusCode;
  return (
    status === 429 ||
    status >= 500 ||
    /rate|timeout|ECONNRESET|ETIMEDOUT/i.test(error.message || '')
  );
}

async function uploadWithRetry(asset) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await uploadOne(asset);
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(error)) throw error;
      const waitMs = 2000 * 2 ** (attempt - 1);
      console.warn(`  retry ${attempt}/${MAX_ATTEMPTS - 1} in ${waitMs}ms — ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let cursor = 0;

  async function next() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

async function main() {
  if (!cloudinaryService.isConfigured()) {
    console.error(
      [
        'Cloudinary is not configured yet.',
        'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env,',
        'then run: npm run media:check && npm run media:push',
        'The demo continues to work with the local JPEG masters in the meantime.'
      ].join('\n')
    );
    process.exit(1);
  }

  const assets = collectSources();
  console.log(`Uploading ${assets.length} unique catalog images to Cloudinary (${cloudinaryService.cloudName})...`);

  const overrides = {};
  let uploaded = 0;
  let failed = 0;

  await runPool(
    assets,
    async asset => {
      try {
        const result = await uploadWithRetry(asset);
        overrides[result.source] = result.secureUrl;
        uploaded += 1;
        console.log(`  ok  [${uploaded}/${assets.length}] ${result.publicId}`);
      } catch (error) {
        failed += 1;
        console.error(`  err ${asset.source.slice(0, 90)} — ${error.message}`);
      }
    },
    CONCURRENCY
  );

  const tmpPath = `${OVERRIDES_PATH}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(overrides, null, 2)}\n`);
  fs.renameSync(tmpPath, OVERRIDES_PATH);

  console.log(`\nDone. ${uploaded} uploaded, ${failed} failed.`);
  console.log(`Override map written to ${path.relative(process.cwd(), OVERRIDES_PATH)}`);
  console.log('Restart the backend to serve Cloudinary delivery URLs.');
}

main().catch(error => {
  console.error('Cloudinary sync failed:', error.message);
  process.exit(1);
});
