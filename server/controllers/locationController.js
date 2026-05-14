const Location = require('../models/Location');

const MAX_LOCATIONS = 5;

/**
 * Location Controller
 * Manages user's saved locations (max 5 per user)
 */

/**
 * GET /api/locations
 * Get all saved locations for the current user
 */
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ user: req.user._id }).sort({ isPrimary: -1, createdAt: -1 });

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations'
    });
  }
};

/**
 * POST /api/locations
 * Add a new saved location
 */
const addLocation = async (req, res) => {
  try {
    const { name, country, state, lat, lon, isPrimary } = req.body;

    if (!name || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude and longitude are required'
      });
    }

    // Check limit
    const count = await Location.countDocuments({ user: req.user._id });
    if (count >= MAX_LOCATIONS) {
      return res.status(400).json({
        success: false,
        message: `You can save up to ${MAX_LOCATIONS} locations. Remove one to add a new one.`
      });
    }

    // Check for duplicate
    const existing = await Location.findOne({
      user: req.user._id,
      lat: { $gte: lat - 0.01, $lte: lat + 0.01 },
      lon: { $gte: lon - 0.01, $lte: lon + 0.01 }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This location is already saved'
      });
    }

    // If setting as primary, unset other primaries
    if (isPrimary) {
      await Location.updateMany(
        { user: req.user._id },
        { $set: { isPrimary: false } }
      );
    }

    const location = new Location({
      user: req.user._id,
      name,
      country: country || '',
      state: state || '',
      lat,
      lon,
      isPrimary: isPrimary || count === 0 // First location is auto-primary
    });

    await location.save();

    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add location'
    });
  }
};

/**
 * PUT /api/locations/:id/primary
 * Set a location as primary
 */
const setPrimary = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const location = await Location.findOne({ _id: id, user: req.user._id });
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Unset all primaries, then set this one
    await Location.updateMany(
      { user: req.user._id },
      { $set: { isPrimary: false } }
    );

    location.isPrimary = true;
    await location.save();

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Set primary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary location'
    });
  }
};

/**
 * DELETE /api/locations/:id
 * Remove a saved location
 */
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findOneAndDelete({ _id: id, user: req.user._id });
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // If deleted location was primary, make the first remaining one primary
    if (location.isPrimary) {
      const first = await Location.findOne({ user: req.user._id }).sort({ createdAt: 1 });
      if (first) {
        first.isPrimary = true;
        await first.save();
      }
    }

    res.json({
      success: true,
      message: 'Location removed successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete location'
    });
  }
};

module.exports = { getLocations, addLocation, setPrimary, deleteLocation };
