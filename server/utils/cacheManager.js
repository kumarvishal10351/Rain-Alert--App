const mongoose = require('mongoose');

/**
 * Simple MongoDB-based cache manager
 * Stores API responses with TTL to avoid hitting rate limits
 */

const cacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  cachedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
});

const Cache = mongoose.model('Cache', cacheSchema);

/**
 * Get cached data by key
 * @param {string} key - Cache key
 * @returns {Object|null} - Cached data or null if expired/not found
 */
const getCache = async (key) => {
  try {
    const cached = await Cache.findOne({
      key,
      expiresAt: { $gt: new Date() }
    });
    return cached ? { data: cached.data, cachedAt: cached.cachedAt } : null;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
};

/**
 * Set cache data with TTL
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 * @param {number} ttlMinutes - Time to live in minutes
 */
const setCache = async (key, data, ttlMinutes = 10) => {
  try {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await Cache.findOneAndUpdate(
      { key },
      { key, data, cachedAt: new Date(), expiresAt },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Cache set error:', error.message);
  }
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
const clearCache = async (key) => {
  try {
    await Cache.deleteOne({ key });
  } catch (error) {
    console.error('Cache clear error:', error.message);
  }
};

module.exports = { getCache, setCache, clearCache };
