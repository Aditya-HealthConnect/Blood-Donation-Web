const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminActive,
} = require('../controllers/adminMgmtController');

const router = express.Router();

// All routes: Super Admin only
router.get('/api/admin-management', protect, authorize('Super Admin'), getAdmins);
router.post('/api/admin-management', protect, authorize('Super Admin'), createAdmin);
router.put('/api/admin-management/:id', protect, authorize('Super Admin'), updateAdmin);
router.delete('/api/admin-management/:id', protect, authorize('Super Admin'), deleteAdmin);
router.patch('/api/admin-management/:id/toggle-active', protect, authorize('Super Admin'), toggleAdminActive);

module.exports = router;
