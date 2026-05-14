const Alert = require('../models/Alert');
const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * Alert Controller
 * Manages alert history — CRUD operations + read status + email notifications
 */

/**
 * GET /api/alerts
 * Get user's alert history (last 20, most recent first)
 */
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Alert.countDocuments({
      user: req.user._id,
      read: false
    });

    res.json({
      success: true,
      data: {
        alerts,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
};

/**
 * POST /api/alerts
 * Create a new alert entry + send email notification if enabled
 */
const createAlert = async (req, res) => {
  try {
    const { location, level, riskScore, message, peakWindow } = req.body;

    if (!location || !level || riskScore === undefined || !message) {
      return res.status(400).json({
        success: false,
        message: 'Location, level, riskScore and message are required'
      });
    }

    const alert = new Alert({
      user: req.user._id,
      location,
      level,
      riskScore,
      message,
      peakWindow: peakWindow || null
    });

    await alert.save();

    // Keep only last 20 alerts per user — delete older ones
    const alertCount = await Alert.countDocuments({ user: req.user._id });
    if (alertCount > 20) {
      const oldAlerts = await Alert.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(20)
        .select('_id');
      
      const idsToDelete = oldAlerts.map(a => a._id);
      await Alert.deleteMany({ _id: { $in: idsToDelete } });
    }

    // 📧 Send email notification if user has it enabled
    const user = await User.findById(req.user._id);
    if (user?.preferences?.emailNotifications !== false && user?.email) {
      // Send email asynchronously — don't block the response
      emailService.sendRainAlert(user.email, {
        level,
        riskScore,
        message,
        locationName: location.name || 'Unknown',
        peakWindow
      }).catch(err => console.error('Email send error:', err.message));
    }

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert'
    });
  }
};

/**
 * PUT /api/alerts/:id/read
 * Mark a single alert as read
 */
const markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read'
    });
  }
};

/**
 * PUT /api/alerts/read-all
 * Mark all alerts as read for the current user
 */
const markAllAsRead = async (req, res) => {
  try {
    await Alert.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All alerts marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alerts as read'
    });
  }
};

/**
 * POST /api/alerts/test-email
 * Send a test email to verify email notifications work
 */
const sendTestEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.email) {
      return res.status(400).json({ success: false, message: 'No email on file' });
    }

    const result = await emailService.sendTestEmail(user.email);
    if (result) {
      res.json({ success: true, message: `Test email sent to ${user.email}` });
    } else {
      res.status(500).json({ success: false, message: 'Email service not configured or failed' });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email' });
  }
};

module.exports = { getAlerts, createAlert, markAsRead, markAllAsRead, sendTestEmail };

