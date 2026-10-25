const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const COLLECTIONS = {
  users: 'rentique_users',
  products: 'rentique_products',
  rentals: 'rentique_rentals',
  evidence: 'rentique_evidence',
  payments: 'rentique_payments',
  inspections: 'rentique_inspections',
  penalties: 'rentique_penalties',
  notifications: 'rentique_notifications'
};

let storeRef = null;
let enabled = false;
let pending = new Map();
let refreshPromise = null;
let initPromise = null;

function dbCollection(key) {
  return mongoose.connection.db.collection(COLLECTIONS[key]);
}

async function seedIfEmpty(key) {
  const items = storeRef[key];
  if (!Array.isArray(items) || items.length === 0) return;

  const collection = dbCollection(key);
  const existing = await collection.estimatedDocumentCount();
  if (existing > 0) return;

  const operations = items.map(item => {
    const { _id, ...rest } = JSON.parse(JSON.stringify(item));
    return {
      replaceOne: { filter: { _id }, replacement: rest, upsert: true }
    };
  });

  try {
    await collection.bulkWrite(operations, { ordered: false });
  } catch (error) {
    const duplicateOnly =
      error.code === 11000 ||
      (Array.isArray(error.writeErrors) && error.writeErrors.every(err => err.code === 11000));
    if (!duplicateOnly) throw error;
  }
}

async function hydrate() {
  for (const key of Object.keys(COLLECTIONS)) {
    const documents = await dbCollection(key).find({}).toArray();
    storeRef[key] = documents.map(document => JSON.parse(JSON.stringify(document)));
  }
}

async function init(store) {
  if (initPromise) return initPromise;
  storeRef = store;

  initPromise = (async () => {
    const connected = await connectDB();
    if (!connected) return false;

    try {
      for (const key of Object.keys(COLLECTIONS)) {
        await seedIfEmpty(key);
      }
      await hydrate();
      enabled = true;
      console.log('MongoDB persistent store ready.');
    } catch (error) {
      enabled = false;
      console.error(`MongoDB store initialization failed: ${error.message}`);
    }
    return enabled;
  })();

  return initPromise;
}

async function refresh() {
  if (!enabled) return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = hydrate().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function queue(key, document) {
  if (!enabled || !document || document._id === undefined) return;
  const copy = JSON.parse(JSON.stringify(document));
  pending.set(`${key}:${copy._id}`, { key, document: copy });
}

async function flush() {
  if (!enabled || pending.size === 0) return;

  const batch = [...pending.values()];
  pending.clear();

  const grouped = new Map();
  for (const item of batch) {
    if (!grouped.has(item.key)) grouped.set(item.key, []);
    grouped.get(item.key).push(item.document);
  }

  try {
    for (const [key, documents] of grouped) {
      const operations = documents.map(document => {
        const { _id, ...rest } = document;
        return {
          replaceOne: { filter: { _id }, replacement: rest, upsert: true }
        };
      });
      await dbCollection(key).bulkWrite(operations, { ordered: false });
    }
  } catch (error) {
    for (const item of batch) {
      pending.set(`${item.key}:${item.document._id}`, item);
    }
    throw error;
  }
}

module.exports = {
  init,
  refresh,
  queue,
  flush,
  isEnabled: () => enabled
};
