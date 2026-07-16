const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getRegistrations,
  exportRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  createRegistrationPublic,
} = require('../controllers/registrationMgmtController');

const router = express.Router();

// Public route for landing page student registrations
router.post('/api/registrations', createRegistrationPublic);

// Apply protect & role validation (Super Admin, Admin, and Volunteer can manage registrations)
router.get(
  '/api/registration-management',
  protect,
  authorize('Super Admin', 'Admin', 'Volunteer'),
  getRegistrations
);

router.get(
  '/api/registration-management/export',
  protect,
  authorize('Super Admin', 'Admin', 'Volunteer'),
  exportRegistrations
);

router.get(
  '/api/registration-management/:id',
  protect,
  authorize('Super Admin', 'Admin', 'Volunteer'),
  getRegistrationById
);

router.patch(
  '/api/registration-management/:id/status',
  protect,
  authorize('Super Admin', 'Admin', 'Volunteer'),
  updateRegistrationStatus
);

module.exports = router;
