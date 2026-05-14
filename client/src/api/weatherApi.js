import api from './axiosConfig';

/**
 * Weather & Location & Alert API functions
 */
export const weatherApi = {
  // Weather
  getCurrentWeather: (lat, lon) => api.get('/weather/current', { params: { lat, lon } }),
  getForecast: (lat, lon) => api.get('/weather/forecast', { params: { lat, lon } }),
  getRainRisk: (lat, lon) => api.get('/weather/risk', { params: { lat, lon } }),
  searchCity: (city) => api.get('/weather/search', { params: { city } }),
  reverseGeocode: (lat, lon) => api.get('/weather/reverse', { params: { lat, lon } }),

  // Locations
  getLocations: () => api.get('/locations'),
  addLocation: (data) => api.post('/locations', data),
  setPrimaryLocation: (id) => api.put(`/locations/${id}/primary`),
  deleteLocation: (id) => api.delete(`/locations/${id}`),

  // Alerts
  getAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
  markAlertRead: (id) => api.put(`/alerts/${id}/read`),
  markAllAlertsRead: () => api.put('/alerts/read-all')
};
