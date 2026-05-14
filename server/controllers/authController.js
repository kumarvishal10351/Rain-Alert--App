const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Controller
 * Handles user registration, login, profile management
 */

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * POST /api/auth/register
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create user
    const user = new User({ email, password, name });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * PUT /api/auth/preferences
 * Update user preferences (temp unit, dark mode, etc.)
 */
const updatePreferences = async (req, res) => {
  try {
    const { temperatureUnit, pushNotifications, emailNotifications, darkMode, alertThreshold } = req.body;
    const updateFields = {};

    if (temperatureUnit !== undefined) updateFields['preferences.temperatureUnit'] = temperatureUnit;
    if (pushNotifications !== undefined) updateFields['preferences.pushNotifications'] = pushNotifications;
    if (emailNotifications !== undefined) updateFields['preferences.emailNotifications'] = emailNotifications;
    if (darkMode !== undefined) updateFields['preferences.darkMode'] = darkMode;
    if (alertThreshold !== undefined) updateFields['preferences.alertThreshold'] = alertThreshold;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

/**
 * PUT /api/auth/password
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

/**
 * POST /api/auth/push-subscription
 * Save push notification subscription
 */
const savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      pushSubscription: subscription
    });

    res.json({
      success: true,
      message: 'Push subscription saved'
    });
  } catch (error) {
    console.error('Save push subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save push subscription'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updatePreferences,
  changePassword,
  savePushSubscription
};
