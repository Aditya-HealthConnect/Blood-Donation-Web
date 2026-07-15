const express = require('express');
const { loginAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.post('/api/admin/login', loginAdmin);

// Protected route
router.get('/api/admin/me', protect, getMe);

module.exports = router;
