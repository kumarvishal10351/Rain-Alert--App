/**
 * Temperature conversion utilities
 */

export const celsiusToFahrenheit = (celsius) => {
  return Math.round((celsius * 9 / 5) + 32);
};

export const fahrenheitToCelsius = (fahrenheit) => {
  return Math.round((fahrenheit - 32) * 5 / 9);
};

/**
 * Format temperature with unit symbol
 * @param {number} temp - Temperature in Celsius
 * @param {string} unit - 'C' or 'F'
 * @returns {string} Formatted temperature string
 */
export const formatTemp = (temp, unit = 'C') => {
  if (temp === null || temp === undefined) return '--';
  const value = unit === 'F' ? celsiusToFahrenheit(temp) : Math.round(temp);
  return `${value}°${unit}`;
};
