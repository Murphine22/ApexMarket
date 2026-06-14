const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
