const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { weatherLimiter } = require('../middleware/rateLimiter');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const {
  getCurrentWeather,
  getForecast,
  getRainRisk,
  searchCity,
  reverseGeocode
} = require('../controllers/weatherController');

// All weather routes are protected + rate limited
router.use(authMiddleware);
router.use(weatherLimiter);

// Weather endpoints with caching
router.get('/current', cacheMiddleware('weather', 10), getCurrentWeather);
router.get('/forecast', cacheMiddleware('forecast', 10), getForecast);
router.get('/risk', cacheMiddleware('risk', 10), getRainRisk);

// Geocoding (no cache needed — responses are small)
router.get('/search', searchCity);
router.get('/reverse', reverseGeocode);

module.exports = router;
