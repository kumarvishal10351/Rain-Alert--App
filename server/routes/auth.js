const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  getProfile,
  updatePreferences,
  changePassword,
  savePushSubscription
} = require('../controllers/authController');

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', authMiddleware, getProfile);
router.put('/preferences', authMiddleware, updatePreferences);
router.put('/password', authMiddleware, changePassword);
router.post('/push-subscription', authMiddleware, savePushSubscription);

module.exports = router;
