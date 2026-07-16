const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Volunteer = require('../models/Volunteer');

/**
 * POST /api/admin/login
 * Authenticate admin or volunteer with email & password, return JWT.
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email (first in Admin, then in Volunteer)
    const lowerEmail = email.toLowerCase();
    let user = await Admin.findOne({ email: lowerEmail }).select('+password');
    let role = '';

    if (user) {
      role = user.role;
    } else {
      user = await Volunteer.findOne({ email: lowerEmail }).select('+password');
      if (user) {
        role = 'Volunteer';
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    // Compare passwords
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Send response (exclude password)
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * GET /api/admin/me
 * Return the currently authenticated admin's or volunteer's profile.
 * Requires protect middleware.
 */
const getMe = async (req, res) => {
  try {
    let user = await Admin.findById(req.admin.id);
    let role = '';

    if (user) {
      role = user.role;
    } else {
      user = await Volunteer.findById(req.admin.id);
      if (user) {
        role = 'Volunteer';
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  loginAdmin,
  getMe,
};
