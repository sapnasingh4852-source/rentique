const mongoose = require('mongoose');

let isConnected = false;
let connectPromise = null;

const connectDB = () => {
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    if (process.env.VERCEL && !process.env.MONGODB_URI) {
      console.log('No MONGODB_URI on Vercel; using the in-memory data store.');
      return false;
    }

    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_rental';
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: uri.startsWith('mongodb+srv://') ? 10000 : 2000
      });
      isConnected = true;
      console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.warn(` MongoDB connection failed (${error.message}). Using High-Resilience Data Store.`);
      isConnected = false;
    }
    return isConnected;
  })();

  return connectPromise;
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
