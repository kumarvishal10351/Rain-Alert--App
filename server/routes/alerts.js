const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAlerts,
  createAlert,
  markAsRead,
  markAllAsRead,
  sendTestEmail
} = require('../controllers/alertController');

// All alert routes require authentication
router.use(authMiddleware);

router.get('/', getAlerts);
router.post('/', createAlert);
router.post('/test-email', sendTestEmail);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;

