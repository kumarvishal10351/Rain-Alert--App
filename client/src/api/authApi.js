import api from './axiosConfig';

/**
 * Auth API functions
 */
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  changePassword: (data) => api.put('/auth/password', data),
  savePushSubscription: (subscription) => api.post('/auth/push-subscription', { subscription })
};
