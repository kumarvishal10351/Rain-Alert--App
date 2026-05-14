const WeatherService = require('../services/weatherService');
const { setCache } = require('../utils/cacheManager');

/**
 * Weather Controller
 * Handles weather data fetching, forecast, and rain risk calculation
 */

/**
 * GET /api/weather/current?lat=xx&lon=xx
 * Get current weather for coordinates
 */
const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const data = await WeatherService.getCurrentWeather(lat, lon);

    // Cache the response
    if (req.cacheKey) {
      await setCache(req.cacheKey, data, req.cacheTTL || 10);
    }

    res.json({
      success: true,
      data,
      cached: false
    });
  } catch (error) {
    console.error('Get current weather error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch current weather data'
    });
  }
};

/**
 * GET /api/weather/forecast?lat=xx&lon=xx
 * Get 5-day forecast for coordinates
 */
const getForecast = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const data = await WeatherService.getForecast(lat, lon);

    // Cache the response
    if (req.cacheKey) {
      await setCache(req.cacheKey, data, req.cacheTTL || 10);
    }

    res.json({
      success: true,
      data,
      cached: false
    });
  } catch (error) {
    console.error('Get forecast error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch forecast data'
    });
  }
};

/**
 * GET /api/weather/risk?lat=xx&lon=xx
 * Get rain risk assessment for coordinates
 */
const getRainRisk = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Get forecast data first
    const forecastData = await WeatherService.getForecast(lat, lon);

    // Calculate rain risk
    const riskAssessment = WeatherService.calculateRainRisk(forecastData);

    // Cache the response
    if (req.cacheKey) {
      await setCache(req.cacheKey, {
        risk: riskAssessment,
        forecast: forecastData
      }, req.cacheTTL || 10);
    }

    res.json({
      success: true,
      data: {
        risk: riskAssessment,
        forecast: forecastData
      },
      cached: false
    });
  } catch (error) {
    console.error('Get rain risk error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to calculate rain risk'
    });
  }
};

/**
 * GET /api/weather/search?city=xx
 * Search for cities by name
 */
const searchCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a city name (at least 2 characters)'
      });
    }

    const data = await WeatherService.searchCity(city.trim());

    res.json({
      success: true,
      data: data.map(loc => ({
        name: loc.name,
        country: loc.country,
        state: loc.state || '',
        lat: loc.lat,
        lon: loc.lon
      }))
    });
  } catch (error) {
    console.error('Search city error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to search for city'
    });
  }
};

/**
 * GET /api/weather/reverse?lat=xx&lon=xx
 * Reverse geocode coordinates to city name
 */
const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const data = await WeatherService.reverseGeocode(lat, lon);

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: {
        name: data[0].name,
        country: data[0].country,
        state: data[0].state || '',
        lat: data[0].lat,
        lon: data[0].lon
      }
    });
  } catch (error) {
    console.error('Reverse geocode error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to reverse geocode location'
    });
  }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getRainRisk,
  searchCity,
  reverseGeocode
};
