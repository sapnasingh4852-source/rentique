const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (process.env.VERCEL && !process.env.MONGODB_URI) {
    console.log('No MONGODB_URI on Vercel; using the in-memory data store.');
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_rental';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // Quick timeout to fallback if MongoDB daemon isn't running
    });
    isConnected = true;
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(` MongoDB local connection failed (${error.message}). Using High-Resilience Data Store.`);
    isConnected = false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
