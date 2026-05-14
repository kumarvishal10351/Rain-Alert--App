const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

/**
 * OpenWeatherMap API Service
 * Centralizes all external API calls to OpenWeatherMap
 */
class WeatherService {
  /**
   * Get current weather data for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Current weather data
   */
  static async getCurrentWeather(lat, lon) {
    const response = await axios.get(`${BASE_URL}/data/2.5/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  }

  /**
   * Get 5-day / 3-hour forecast data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Forecast data with list of 3-hour intervals
   */
  static async getForecast(lat, lon) {
    const response = await axios.get(`${BASE_URL}/data/2.5/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  }

  /**
   * Search for cities by name using Geocoding API
   * @param {string} query - City name to search
   * @param {number} limit - Max results (default 5)
   * @returns {Array} List of matching locations
   */
  static async searchCity(query, limit = 5) {
    const response = await axios.get(`${BASE_URL}/geo/1.0/direct`, {
      params: {
        q: query,
        limit,
        appid: API_KEY
      }
    });
    return response.data;
  }

  /**
   * Reverse geocode coordinates to city name
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Array} Location data
   */
  static async reverseGeocode(lat, lon) {
    const response = await axios.get(`${BASE_URL}/geo/1.0/reverse`, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: API_KEY
      }
    });
    return response.data;
  }

  /**
   * Calculate Rain Risk Score from forecast data
   * This is the core algorithm of the application
   * 
   * ALGORITHM EXPLANATION:
   * The RainRiskScore is a weighted composite score (0-100) that predicts
   * the likelihood and severity of rainfall in the next 24 hours.
   * 
   * Weights:
   *   - Probability of Precipitation (pop): 40% — Most direct indicator
   *   - Rainfall Amount (rain.3h): 30% — Severity indicator
   *   - Humidity: 15% — Atmospheric moisture content
   *   - Cloud Cover: 15% — Visual and atmospheric indicator
   * 
   * Each factor is normalized to 0-100, then multiplied by its weight.
   * The final score maps to alert levels:
   *   0-24: SAFE, 25-49: WATCH, 50-74: WARNING, 75-100: DANGER
   * 
   * @param {Object} forecastData - Raw forecast data from OpenWeatherMap
   * @returns {Object} Risk assessment with score, level, message, and peak window
   */
  static calculateRainRisk(forecastData) {
    if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
      return {
        score: 0,
        level: 'SAFE',
        message: 'No rain expected',
        advice: 'Enjoy the clear weather! ☀️',
        peakWindow: null,
        hourlyRisks: []
      };
    }

    // Get next 24 hours of data (8 intervals × 3 hours = 24 hours)
    const next24h = forecastData.list.slice(0, 8);

    let totalScore = 0;
    let maxRainHour = null;
    let maxRainAmount = 0;
    const hourlyRisks = [];

    for (const interval of next24h) {
      // Factor 1: Probability of Precipitation (0-1 → 0-100)
      const popScore = (interval.pop || 0) * 100;

      // Factor 2: Rain amount (0-50mm/3h → 0-100, capped at 50mm)
      const rainAmount = interval.rain ? (interval.rain['3h'] || 0) : 0;
      const rainScore = Math.min((rainAmount / 50) * 100, 100);

      // Factor 3: Humidity (0-100%)
      const humidityScore = interval.main.humidity || 0;

      // Factor 4: Cloud cover (0-100%)
      const cloudScore = interval.clouds ? interval.clouds.all : 0;

      // Weighted composite score for this interval
      const intervalScore = (
        popScore * 0.40 +
        rainScore * 0.30 +
        humidityScore * 0.15 +
        cloudScore * 0.15
      );

      totalScore += intervalScore;

      // Track peak rain window
      if (rainAmount > maxRainAmount || (rainAmount === 0 && popScore > maxRainAmount)) {
        maxRainAmount = Math.max(rainAmount, popScore);
        maxRainHour = interval;
      }

      hourlyRisks.push({
        dt: interval.dt,
        time: interval.dt_txt,
        score: Math.round(intervalScore),
        pop: interval.pop || 0,
        rain: rainAmount,
        temp: interval.main.temp,
        humidity: interval.main.humidity,
        clouds: interval.clouds ? interval.clouds.all : 0,
        weather: interval.weather[0]
      });
    }

    // Average score across all intervals
    const avgScore = Math.round(totalScore / next24h.length);
    // Clamp to 0-100
    const finalScore = Math.min(Math.max(avgScore, 0), 100);

    // Determine alert level
    let level, message, advice;
    if (finalScore <= 24) {
      level = 'SAFE';
      message = 'No rain expected';
      advice = 'Enjoy the clear weather! ☀️';
    } else if (finalScore <= 49) {
      level = 'WATCH';
      message = 'Light rain possible, carry an umbrella';
      advice = 'Keep an umbrella handy just in case 🌂';
    } else if (finalScore <= 74) {
      level = 'WARNING';
      message = 'Moderate rain likely, avoid outdoor activities';
      advice = 'Consider postponing outdoor plans 🌧️';
    } else {
      level = 'DANGER';
      message = 'Heavy rain expected, stay indoors';
      advice = 'Stay safe and avoid unnecessary travel! ⛈️';
    }

    // Determine peak rain window
    let peakWindow = null;
    if (maxRainHour && finalScore > 24) {
      const peakStart = new Date(maxRainHour.dt * 1000);
      const peakEnd = new Date(peakStart.getTime() + 3 * 60 * 60 * 1000);
      const formatTime = (d) => d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      peakWindow = `Rain expected between ${formatTime(peakStart)} – ${formatTime(peakEnd)}`;
    }

    return {
      score: finalScore,
      level,
      message,
      advice,
      peakWindow,
      hourlyRisks
    };
  }
}

module.exports = WeatherService;
