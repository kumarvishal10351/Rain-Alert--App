const { getCache, setCache } = require('../utils/cacheManager');

/**
 * Cache middleware factory
 * Creates a middleware that checks MongoDB cache before proceeding
 * @param {string} prefix - Cache key prefix (e.g., 'weather', 'forecast')
 * @param {number} ttlMinutes - Time-to-live in minutes (default 10)
 */
const cacheMiddleware = (prefix, ttlMinutes = 10) => {
  return async (req, res, next) => {
    try {
      // Build cache key from prefix + query params
      const keyParts = [prefix];
      if (req.query.lat && req.query.lon) {
        // Round to 2 decimal places to increase cache hits
        keyParts.push(parseFloat(req.query.lat).toFixed(2));
        keyParts.push(parseFloat(req.query.lon).toFixed(2));
      }
      if (req.query.city) {
        keyParts.push(req.query.city.toLowerCase().trim());
      }
      const cacheKey = keyParts.join(':');

      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached.data,
          cached: true,
          cachedAt: cached.cachedAt
        });
      }

      // Attach cache key and TTL to request for controller use
      req.cacheKey = cacheKey;
      req.cacheTTL = ttlMinutes;
      next();
    } catch (error) {
      // If cache fails, just proceed without cache
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

module.exports = cacheMiddleware;
