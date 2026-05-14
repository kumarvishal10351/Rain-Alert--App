/**
 * Time formatting utilities
 * All times are displayed in the user's local timezone
 */

/**
 * Format Unix timestamp to readable time string
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTime = (unixTimestamp, options = {}) => {
  const date = new Date(unixTimestamp * 1000);
  const defaultOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  return date.toLocaleTimeString('en-US', defaultOptions);
};

/**
 * Format Unix timestamp to readable date string
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string (e.g., "Mon, Jan 15")
 */
export const formatDate = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date string to day name
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Day name (e.g., "Monday")
 */
export const formatDayName = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Format Unix timestamp to hour only
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {string} Hour string (e.g., "3 PM")
 */
export const formatHour = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diffHours = Math.abs(date - now) / (1000 * 60 * 60);
  
  if (diffHours < 1) return 'Now';
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  });
};

/**
 * Get relative time string (e.g., "5 min ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
