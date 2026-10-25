#!/usr/bin/env node
/**
 * Generates one unique source photograph per SKU via the keyless Pollinations
 * image API, then derives the five inspection views (front/back/side/closeup/tag)
 * locally with macOS sips. Resumable: existing views are skipped.
 *
 * Usage:
 *   node scripts/generate-product-images.js                 # all remaining
 *   node scripts/generate-product-images.js --limit 5
 *   node scripts/generate-product-images.js --only lehengas
 *   node scripts/generate-product-images.js --id 65e1...0101
 *   node scripts/generate-product-images.js --force --limit 1
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { allProducts } = require('../data/products');

const OUT_DIR = path.join(__dirname, '../../frontend/public/media/products');
const TMP_DIR = path.join(__dirname, '../../.image-tmp');
const LOG_PATH = path.join(__dirname, 'generate-images.log');
const VIEWS = ['front', 'back', 'side', 'closeup', 'tag'];
const TARGET_W = 900;
const TARGET_H = 1342;
const TARGET_ASPECT = TARGET_W / TARGET_H;
const MIN_GAP_MS = 47000;
const RETRY_LIMIT = 5;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : null;
};

const limit = value('limit') ? parseInt(value('limit'), 10) : Infinity;
const onlyCollection = value('only');
const onlyId = value('id');
const force = flag('force');
const coverage = flag('coverage');
const seedOffset = value('seed') ? parseInt(value('seed'), 10) : 0;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedFor(id, index) {
  return (parseInt(id.slice(-6), 16) + index * 977) % 2147483647;
}

function trimWords(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '');
}

function primaryColor(product) {
  return product.color.split(/&|,| with /i)[0].trim();
}

const SILHOUETTES = {
  'Bridal Lehenga': 'heavily embroidered lehenga choli with a full flared skirt and dupatta',
  'Sangeet Lehenga': 'embroidered lehenga choli with a flowing skirt and dupatta',
  'Mehendi Lehenga': 'lightly embroidered lehenga choli with a flared skirt and dupatta',
  'Reception Lehenga': 'formal embroidered lehenga choli with a flared skirt and dupatta',
  'Banarasi Saree': 'Banarasi silk saree draped over the shoulder',
  'Kanjeevaram Saree': 'Kanjeevaram silk saree with a contrast zari border',
  'Organza Saree': 'lightweight organza saree with a delicate border',
  'Georgette Saree': 'flowing georgette saree',
  'Silk Saree': 'pure silk saree with a zari border',
  'Anarkali Suit': 'floor-length flared anarkali kurta over a churidar, with a dupatta, not a lehenga and not a skirt',
  'Sharara Set': 'short embroidered kurta with wide-legged sharara trousers and a dupatta, both trouser legs clearly visible from waist to ankle, not a skirt and not a lehenga',
  'Kurta Set': 'straight-cut knee-length kurta with matching trousers and a dupatta, two separate pieces, both trouser legs clearly visible from waist to ankle, not a lehenga and not a floor-length gown',
  'Palazzo Set': 'knee-length kurta with wide-leg palazzo trousers and a dupatta, two separate pieces, both wide trouser legs clearly visible from waist to ankle, not a skirt and not a lehenga',
  Sherwani: 'structured knee-length sherwani with churidar and stole',
  Bandhgala: 'structured jodhpuri bandhgala jacket with trousers',
  'Indo-Western': 'draped indo-western jacket and trousers',
  'Evening Gown': 'floor-length embroidered evening gown',
  'Cocktail Dress': 'cocktail dress with a fitted bodice and flowing skirt'
};

function buildPrompt(product) {
  const color = primaryColor(product).replace(/&/g, 'and');
  const fabric = trimWords(product.fabricOrMaterial, 78);
  const occasion = product.occasion;
  const sub = product.subCategory;
  const silhouette = SILHOUETTES[sub] || sub;
  const common = 'professional e-commerce catalogue photography, ultra detailed, no text, no logo, no watermark';

  switch (product.collection) {
    case 'jewellery': {
      const onBust = ['Kundan Set', 'Polki Set', 'Choker Set'].includes(sub);
      if (onBust) {
        return `Luxury jewellery product photograph of a ${color} ${sub.toLowerCase()} with ${fabric}, displayed on a deep plum velvet jewellery bust, framed from the neck to mid-chest, no person, no face, no skin, no cleavage, warm golden rim light, macro detail, Indian ethnic jewellery catalogue for weddings and festivals, ${common}`;
      }
      const subject = sub === 'Bangles'
        ? 'pair of ornate bangles stacked on a woman\'s wrist, hand and arm in sharp focus, no necklace, no face'
        : sub === 'Earrings'
          ? 'pair of ornate earrings worn by an Indian model, close-up of ear and jawline, earrings prominent, no necklace'
          : sub === 'Maang Tikka'
            ? 'delicate forehead ornament pinned at the centre parting, close-up of forehead and eyes, no necklace'
            : `ornate ${sub.toLowerCase()} with ${fabric}`;
      return `Luxury close-up jewellery photograph of a ${color} ${subject}, warm golden rim light, Indian ethnic jewellery catalogue for weddings and festivals, macro detail, ${common}`;
    }
    case 'bags':
      return `Luxury product photograph of a ${color} ${sub} with ${fabric}, resting on a cream marble plinth, warm studio light, Indian ethnic accessories catalogue, ${common}`;
    case 'footwear':
      return `Luxury product photograph of a pair of ${color} ${sub} shoes with ${fabric}, on a warm ivory studio backdrop, soft shadow, Indian ethnic footwear catalogue, ${common}`;
    default: {
      const who = product.gender === 'MEN' ? 'man' : 'woman';
      const pale = /ivory|cream|white|pearl|pastel|blush|champagne|powder|lavender|lilac|mint|peach|silver|gold/i;
      const deep = /wine|maroon|burgundy|deep|midnight|navy|black|emerald|forest|ruby|cobalt/i;
      const deepNotes = [
        [/wine|burgundy|maroon|ruby/i, 'dark oxblood wine, like red wine held to the light — absolutely not pink, blush, rose or peach'],
        [/navy|midnight|cobalt/i, 'dark inky blue — absolutely not sky blue, powder blue or grey'],
        [/emerald|forest/i, 'dark jewel green — absolutely not mint, sage or olive'],
        [/black/i, 'true deep black — absolutely not charcoal or grey']
      ];
      const deepNote = deepNotes.find(([pattern]) => pattern.test(color));
      const colourLock = deepNote
        ? `The outfit colour must be ${deepNote[1]}.`
        : pale.test(color)
          ? `The outfit is ${color}.`
          : deep.test(color)
            ? `The outfit must be a deep, saturated ${color}; never pale peach, blush, ivory or white.`
            : `The outfit must clearly read as ${color}.`;
      return `Photorealistic full-length editorial photograph of an Indian ${who} wearing a ${color} ${silhouette} made of ${fabric}. ${colourLock} Styled for ${occasion}, model standing and facing the camera with head and feet fully inside the frame, natural skin texture and realistic facial features, sharp focus, warm stone-grey seamless studio backdrop, soft directional light, luxury Indian ethnic wear e-commerce, head to toe, ${common}`;
    }
  }
}

function sips(args) {
  execFileSync('sips', args, { stdio: 'pipe' });
}

function sourceDimensions(file) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8'
  });
  const width = parseInt(output.match(/pixelWidth:\s*(\d+)/)[1], 10);
  const height = parseInt(output.match(/pixelHeight:\s*(\d+)/)[1], 10);
  return { width, height };
}

function cropResize(input, output, width, height, offsetY, offsetX) {
  sips([
    '-c',
    String(height),
    String(width),
    '--cropOffset',
    String(offsetY),
    String(offsetX),
    input,
    '--out',
    output
  ]);
  sips(['-z', String(TARGET_H), String(TARGET_W), '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', output, '--out', output]);
}

function makeFront(sourceFile, frontFile) {
  const { width, height } = sourceDimensions(sourceFile);
  // Drop the bottom 4% where the Pollinations watermark sits, keeping the head in frame.
  let cropHeight = Math.round(height * 0.96);
  let cropWidth = Math.round(cropHeight * TARGET_ASPECT);
  if (cropWidth > width) {
    cropWidth = width;
    cropHeight = Math.round(cropWidth / TARGET_ASPECT);
  }
  const offsetX = Math.max(0, Math.round((width - cropWidth) / 2));
  cropResize(sourceFile, frontFile, cropWidth, cropHeight, 0, offsetX);
}

function deriveFromFront(frontFile, productId) {
  const out = (view) => path.join(OUT_DIR, `${productId}-${view}.jpg`);

  if (!fs.existsSync(out('back'))) {
    sips(['-f', 'horizontal', frontFile, '--out', out('back')]);
  }
  const windows = {
    side: { width: 630, height: 940, offsetY: 100, offsetX: 240 },
    closeup: { width: 500, height: 746, offsetY: 430, offsetX: 200 },
    tag: { width: 520, height: 775, offsetY: 690, offsetX: 190 }
  };
  for (const [view, win] of Object.entries(windows)) {
    if (fs.existsSync(out(view))) continue;
    cropResize(frontFile, out(view), win.width, win.height, win.offsetY, win.offsetX);
  }
}

function viewsComplete(productId) {
  return VIEWS.every((view) => fs.existsSync(path.join(OUT_DIR, `${productId}-${view}.jpg`)));
}

function isValidImage(file) {
  try {
    if (fs.statSync(file).size < 15000) return false;
    const fd = fs.openSync(file, 'r');
    const header = Buffer.alloc(3);
    fs.readSync(fd, header, 0, 3, 0);
    fs.closeSync(fd);
    return header[0] === 0xff && header[1] === 0xd8;
  } catch {
    return false;
  }
}

let lastRequestAt = 0;

async function downloadSource(prompt, seed, destFile) {
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=1152&seed=${seed}&model=flux&nologo=true`;

  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt += 1) {
    const waitForGap = Math.max(0, MIN_GAP_MS - (Date.now() - lastRequestAt));
    if (waitForGap > 0) await sleep(waitForGap);
    lastRequestAt = Date.now();

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(180000) });
      if (response.status === 402) {
        const body = await response.text();
        const retry = body.match(/Retry after (\d+)s/i);
        const waitMs = retry ? (parseInt(retry[1], 10) + 4) * 1000 : MIN_GAP_MS;
        log(`rate limited, waiting ${Math.round(waitMs / 1000)}s`);
        await sleep(waitMs);
        lastRequestAt = Date.now();
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(destFile, buffer);
      if (!isValidImage(destFile)) throw new Error('response was not a usable JPEG');
      return;
    } catch (error) {
      log(`attempt ${attempt} failed: ${error.message}`);
      if (attempt === RETRY_LIMIT) throw error;
      await sleep(5000 * attempt);
    }
  }
  throw new Error('exhausted retries');
}

async function main() {
  let products = allProducts;
  if (onlyCollection) products = products.filter((p) => p.collection === onlyCollection);
  if (onlyId) products = products.filter((p) => p._id === onlyId);

  if (coverage) {
    const covered = new Set();
    for (const product of products) {
      if (fs.existsSync(path.join(OUT_DIR, `${product._id}-front.jpg`))) {
        covered.add(`${product.collection}|${product.subCategory}`);
      }
    }
    const picked = new Set();
    products = products.filter((product) => {
      const key = `${product.collection}|${product.subCategory}`;
      if (covered.has(key) || picked.has(key)) return false;
      picked.add(key);
      return true;
    });
    log(`coverage queue: ${products.length} subcategories without a generated hero image`);
  }

  const pending = products.filter((p) => force || !viewsComplete(p._id));
  const queue = pending.slice(0, limit);

  log(`queue: ${queue.length} of ${products.length} products (${allProducts.length} total). Output: ${OUT_DIR}`);
  const startedAt = Date.now();

  for (let i = 0; i < queue.length; i += 1) {
    const product = queue[i];
    const frontPath = path.join(OUT_DIR, `${product._id}-front.jpg`);
    const tmpSource = path.join(TMP_DIR, `${product._id}-source.jpg`);

    try {
      if (force || !fs.existsSync(frontPath)) {
        if (force) {
          for (const view of VIEWS) {
            fs.rmSync(path.join(OUT_DIR, `${product._id}-${view}.jpg`), { force: true });
          }
        }
        const prompt = buildPrompt(product);
        log(`[${i + 1}/${queue.length}] generating ${product.title}`);
        await downloadSource(prompt, seedFor(product._id, i) + seedOffset, tmpSource);
        makeFront(tmpSource, frontPath);
        fs.rmSync(tmpSource, { force: true });
      }

      deriveFromFront(frontPath, product._id);
      log(`[${i + 1}/${queue.length}] done ${product._id} ${product.collection}`);

      const elapsed = Date.now() - startedAt;
      const perItem = elapsed / (i + 1);
      const remaining = Math.round((perItem * (queue.length - i - 1)) / 1000);
      if (i + 1 < queue.length) log(`eta ${Math.ceil(remaining / 60)} min`);
    } catch (error) {
      log(`FAILED ${product._id} ${product.title}: ${error.message}`);
    }
  }

  log('generation pass complete');
}

main().catch((error) => {
  log(`fatal: ${error.stack || error.message}`);
  process.exit(1);
});
