require('dotenv').config();

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const cloudinary = require('../config/cloudinary');
const cloudinaryService = require('../services/cloudinary.service');

const ENV_PATH = path.join(__dirname, '../.env');
const CLOUDINARY_KEYS = new Set([
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_URL'
]);

function parseCloudinaryUrl(value) {
  const raw = value.replace(/^\s*CLOUDINARY_URL\s*=\s*/i, '').trim();
  try {
    const parsed = new URL(raw);
    if (!parsed.hostname || !parsed.username || !parsed.password) return null;
    return {
      CLOUDINARY_CLOUD_NAME: parsed.hostname,
      CLOUDINARY_API_KEY: decodeURIComponent(parsed.username),
      CLOUDINARY_API_SECRET: decodeURIComponent(parsed.password)
    };
  } catch {
    return null;
  }
}

function writeEnv(credentials) {
  const existing = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const kept = existing
    .split(/\r?\n/)
    .filter(line => !CLOUDINARY_KEYS.has(line.split('=')[0].trim()));

  while (kept.length > 0 && kept[kept.length - 1].trim() === '') kept.pop();

  const lines = [
    ...kept,
    '',
    '# Cloudinary Credentials',
    ...Object.entries(credentials).map(([key, value]) => `${key}=${value}`),
    ''
  ];

  fs.writeFileSync(ENV_PATH, lines.join('\n'), 'utf8');
  fs.chmodSync(ENV_PATH, 0o600);
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = question => new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));

  console.log('\nCloudinary setup — values are written only to backend/.env and never printed back.\n');

  if (cloudinaryService.isConfigured()) {
    const replace = await ask('Cloudinary is already configured. Replace the credentials? (y/N) ');
    if (!/^y/i.test(replace)) {
      console.log('No changes made.');
      rl.close();
      return;
    }
  }

  const url = await ask('Paste CLOUDINARY_URL, or press Enter to type the three values: ');
  let credentials;

  if (url) {
    credentials = parseCloudinaryUrl(url);
    if (!credentials) {
      console.error('That is not a valid cloudinary:// URL. Nothing was written.');
      rl.close();
      process.exit(1);
    }
  } else {
    const cloudName = await ask('Cloud name: ');
    const apiKey = await ask('API key: ');
    const apiSecret = await ask('API secret (visible while typing): ');
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('All three values are required. Nothing was written.');
      rl.close();
      process.exit(1);
    }
    credentials = {
      CLOUDINARY_CLOUD_NAME: cloudName,
      CLOUDINARY_API_KEY: apiKey,
      CLOUDINARY_API_SECRET: apiSecret
    };
  }

  rl.close();
  writeEnv(credentials);
  console.log('\nSaved to backend/.env (permissions 600).');
  console.log('Validating with Cloudinary...');

  cloudinary.config({
    cloud_name: credentials.CLOUDINARY_CLOUD_NAME,
    api_key: credentials.CLOUDINARY_API_KEY,
    api_secret: credentials.CLOUDINARY_API_SECRET,
    secure: true
  });

  try {
    const result = await cloudinary.api.ping();
    console.log(`Cloudinary OK — cloud "${credentials.CLOUDINARY_CLOUD_NAME}" (${result.status}).`);
    console.log('Next: npm run media:push');
  } catch (error) {
    const detail = error.error?.message || error.message || 'unknown error';
    console.error(`Cloudinary rejected the credentials: ${detail}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Setup failed:', error.message);
  process.exit(1);
});
