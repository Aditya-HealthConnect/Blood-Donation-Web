const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createCamp,
  getCamps,
  getPublicCamps,
  getCampById,
  updateCamp,
  deleteCamp,
} = require('../controllers/campController');

const router = express.Router();

// Public route for landing page timeline list
router.get('/api/blood-camps/public', getPublicCamps);

// Admin / Super Admin routes
router.get('/api/blood-camps', protect, authorize('Super Admin', 'Admin'), getCamps);
router.get('/api/blood-camps/:id', protect, authorize('Super Admin', 'Admin'), getCampById);

// Create, Edit, Delete: Restricted to Super Admin only
router.post('/api/blood-camps', protect, authorize('Super Admin'), createCamp);
router.put('/api/blood-camps/:id', protect, authorize('Super Admin'), updateCamp);
router.delete('/api/blood-camps/:id', protect, authorize('Super Admin'), deleteCamp);

module.exports = router;
