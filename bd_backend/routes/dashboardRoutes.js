const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getStats,
  getChartData,
  getRecentRegistrations,
  getUpcomingCamps,
} = require('../controllers/dashboardController');

const router = express.Router();

// Public dashboard routes (no auth required)
router.get('/api/public/dashboard/stats', getStats);
router.get('/api/public/dashboard/charts', getChartData);
router.get('/api/public/dashboard/recent-registrations', getRecentRegistrations);
router.get('/api/public/dashboard/upcoming-camps', getUpcomingCamps);

// Protected dashboard routes (admin/volunteer only)
router.get('/api/dashboard/stats', protect, getStats);
router.get('/api/dashboard/charts', protect, getChartData);
router.get('/api/dashboard/recent-registrations', protect, getRecentRegistrations);
router.get('/api/dashboard/upcoming-camps', protect, getUpcomingCamps);

module.exports = router;
