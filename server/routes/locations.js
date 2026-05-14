const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getLocations,
  addLocation,
  setPrimary,
  deleteLocation
} = require('../controllers/locationController');

// All location routes require authentication
router.use(authMiddleware);

router.get('/', getLocations);
router.post('/', addLocation);
router.put('/:id/primary', setPrimary);
router.delete('/:id', deleteLocation);

module.exports = router;
