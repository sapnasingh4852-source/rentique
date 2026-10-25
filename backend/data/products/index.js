const fs = require('fs');
const path = require('path');

const { lehengas } = require('./lehengas');
const { sarees } = require('./sarees');
const { suits, gowns } = require('./dressesAndGowns');
const { mensEthnic } = require('./mensEthnic');
const { jewellery } = require('./jewellery');
const { bags, footwear } = require('./accessoriesAndShoes');

const collectionProducts = {
  lehengas,
  sarees,
  suits,
  gowns,
  menswear: mensEthnic,
  jewellery,
  bags,
  footwear
};

const MEDIA_DIR = path.join(__dirname, '../../../frontend/public/media/products');
const VIEWS = ['front', 'back', 'side', 'closeup', 'tag'];

const hasOwnMedia = (product) =>
  Boolean(product.listingImages?.[0]?.secureUrl?.startsWith('/media/products/'));

for (const products of Object.values(collectionProducts)) {
  products.sort((a, b) => Number(hasOwnMedia(b)) - Number(hasOwnMedia(a)));
}

const allProducts = Object.values(collectionProducts).flat();

for (const product of allProducts) {
  product.mediaStatus = hasOwnMedia(product) ? 'OWN' : 'CATEGORY';
}

const heroIdOf = (product) => {
  const match = product.listingImages?.[0]?.secureUrl?.match(/\/media\/products\/([a-f0-9]+)-front\.jpg$/);
  return match ? match[1] : null;
};

const hasFullSet = (id) => VIEWS.every((view) => fs.existsSync(path.join(MEDIA_DIR, `${id}-${view}.jpg`)));

function applyCategoryFallbacks(products) {
  const bySubCategory = new Map();
  const byCollection = new Map();

  for (const product of products) {
    if (!hasOwnMedia(product)) continue;
    const id = heroIdOf(product);
    if (!id || !hasFullSet(id)) continue;

    const subKey = `${product.collection}|${product.subCategory}`;
    if (!bySubCategory.has(subKey)) bySubCategory.set(subKey, []);
    bySubCategory.get(subKey).push(id);

    if (!byCollection.has(product.collection)) byCollection.set(product.collection, []);
    byCollection.get(product.collection).push(id);
  }

  for (const product of products) {
    if (hasOwnMedia(product)) continue;
    const candidates =
      bySubCategory.get(`${product.collection}|${product.subCategory}`) ||
      byCollection.get(product.collection);
    if (!candidates?.length) continue;

    const hash = [...product._id].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0);
    const heroId = candidates[hash % candidates.length];

    product.listingImages = product.listingImages.map((image, index) => ({
      ...image,
      secureUrl: `/media/products/${heroId}-${VIEWS[index] || 'front'}.jpg`,
      sourceUrl: `/media/products/${heroId}-${VIEWS[index] || 'front'}.jpg`,
      format: 'jpg'
    }));
  }
}

applyCategoryFallbacks(allProducts);

const AUTH_TAG_URL = '/media/brand/authenticity-tag.jpg';
for (const product of allProducts) {
  for (const image of product.listingImages || []) {
    if (image.viewType !== 'TAG') continue;
    image.publicId = 'rentique/brand/authenticity-card';
    image.cloudinaryPublicId = 'rentique/brand/authenticity-card';
    image.secureUrl = AUTH_TAG_URL;
    image.sourceUrl = AUTH_TAG_URL;
    image.format = 'jpg';
    image.width = 900;
    image.height = 1342;
  }

  for (const entry of product.conditionHistory || []) {
    for (const evidence of entry.evidence || []) {
      if (evidence.viewType !== 'TAG') continue;
      evidence.publicId = 'rentique/brand/authenticity-card';
      evidence.secureUrl = AUTH_TAG_URL;
    }
  }
}

module.exports = {
  allProducts,
  collectionProducts,
  lehengas,
  sarees,
  suits,
  gowns,
  mensEthnic,
  jewellery,
  bags,
  footwear
};
