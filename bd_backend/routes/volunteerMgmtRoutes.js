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
  getMyCamp,
} = require('../controllers/volunteerMgmtController');

const router = express.Router();

// Fetch assigned camp: Volunteer, Admin, Super Admin
router.get('/api/volunteer-management/my-camp', protect, authorize('Volunteer', 'Super Admin', 'Admin'), getMyCamp);

// View volunteers & camps for assignment: Super Admin + Admin
router.get('/api/volunteer-management', protect, authorize('Super Admin', 'Admin'), getVolunteers);
router.get('/api/volunteer-management/camps', protect, authorize('Super Admin', 'Admin'), getCampsForAssignment);

// Assign volunteers: Super Admin + Admin
router.patch('/api/volunteer-management/:id/assign-camp', protect, authorize('Super Admin', 'Admin'), assignCamp);

// Write operations (Create, Edit, Delete, Toggle Active): Super Admin only
router.post('/api/volunteer-management', protect, authorize('Super Admin'), createVolunteer);
router.put('/api/volunteer-management/:id', protect, authorize('Super Admin'), updateVolunteer);
router.delete('/api/volunteer-management/:id', protect, authorize('Super Admin'), deleteVolunteer);
router.patch('/api/volunteer-management/:id/toggle-active', protect, authorize('Super Admin'), toggleVolunteerActive);

module.exports = router;
