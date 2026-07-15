const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getStats,
  getChartData,
  getRecentRegistrations,
  getUpcomingCamps,
} = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes are protected
router.get('/api/dashboard/stats', protect, getStats);
router.get('/api/dashboard/charts', protect, getChartData);
router.get('/api/dashboard/recent-registrations', protect, getRecentRegistrations);
router.get('/api/dashboard/upcoming-camps', protect, getUpcomingCamps);

module.exports = router;
