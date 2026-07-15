const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  toggleVolunteerActive,
  assignCamp,
  getCampsForAssignment,
} = require('../controllers/volunteerMgmtController');

const router = express.Router();

// All routes: Super Admin + Admin
router.get('/api/volunteer-management', protect, authorize('Super Admin', 'Admin'), getVolunteers);
router.get('/api/volunteer-management/camps', protect, authorize('Super Admin', 'Admin'), getCampsForAssignment);
router.post('/api/volunteer-management', protect, authorize('Super Admin', 'Admin'), createVolunteer);
router.put('/api/volunteer-management/:id', protect, authorize('Super Admin', 'Admin'), updateVolunteer);
router.delete('/api/volunteer-management/:id', protect, authorize('Super Admin', 'Admin'), deleteVolunteer);
router.patch('/api/volunteer-management/:id/toggle-active', protect, authorize('Super Admin', 'Admin'), toggleVolunteerActive);
router.patch('/api/volunteer-management/:id/assign-camp', protect, authorize('Super Admin', 'Admin'), assignCamp);

module.exports = router;
