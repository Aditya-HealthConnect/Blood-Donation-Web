const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createDonor,
  getDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
} = require('../controllers/donorController');

const router = express.Router();

// Get list & details: Accessible by Super Admin, Admin, Volunteer
router.get('/api/donors', protect, authorize('Super Admin', 'Admin', 'Volunteer'), getDonors);
router.get('/api/donors/:id', protect, authorize('Super Admin', 'Admin', 'Volunteer'), getDonorById);

// Create donor: Accessible by Super Admin, Admin, Volunteer (Volunteers can enter walk-in donors at camps)
router.post('/api/donors', protect, authorize('Super Admin', 'Admin', 'Volunteer'), createDonor);

// Edit & Delete: Restricted to Super Admin and Admin roles only
router.put('/api/donors/:id', protect, authorize('Super Admin', 'Admin'), updateDonor);
router.delete('/api/donors/:id', protect, authorize('Super Admin', 'Admin'), deleteDonor);

module.exports = router;
