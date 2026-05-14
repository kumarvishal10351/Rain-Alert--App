/**
 * Application-wide constants
 */

// OpenWeatherMap icon URL template
export const OWM_ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

// Auto-refresh interval (10 minutes)
export const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000;

// Max saved locations per user
export const MAX_LOCATIONS = 5;

// Alert level order for comparison
export const ALERT_LEVEL_ORDER = {
  SAFE: 0,
  WATCH: 1,
  WARNING: 2,
  DANGER: 3
};

// Wind direction labels
export const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW'
];

/**
 * Get wind direction label from degrees
 * @param {number} deg - Wind direction in degrees
 * @returns {string} Cardinal direction label
 */
export const getWindDirection = (deg) => {
  const index = Math.round(deg / 22.5) % 16;
  return WIND_DIRECTIONS[index];
};

// Default location (London) as fallback
export const DEFAULT_LOCATION = {
  name: 'London',
  lat: 51.5074,
  lon: -0.1278,
  country: 'GB'
};
