const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  searchRegistration,
  updateRegistrationStatus,
} = require('../controllers/donationDeskController');

const router = express.Router();

// Apply protect & role validation (Super Admin, Admin, and Volunteer have access to Donation Desk)
router.get(
  '/api/donation-desk/search',
  protect,
  authorize('Super Admin', 'Admin', 'Volunteer'),
  searchRegistration
);

router.patch(
  '/api/donation-desk/registrations/:id/status',
  protect,
  authorize('Super Admin', 'Admin', 'Volunteer'),
  updateRegistrationStatus
);

module.exports = router;
