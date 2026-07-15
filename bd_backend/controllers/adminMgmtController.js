const Admin = require('../models/Admin');

/**
 * GET /api/admin-management
 * List admins with search and pagination. Excludes Super Admins.
 */
const getAdmins = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { role: 'Admin' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Admin.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Admin.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get admins error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/admin-management
 * Create a new Admin.
 */
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    if (!name || !email || !password || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and mobile number are required' });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      mobileNumber,
      role: 'Admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { id: admin._id, name: admin.name, email: admin.email, mobileNumber: admin.mobileNumber, role: admin.role, isActive: admin.isActive, createdAt: admin.createdAt },
    });
  } catch (error) {
    console.error('Create admin error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/admin-management/:id
 * Update an Admin. Cannot modify Super Admins.
 */
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, mobileNumber } = req.body;

    const admin = await Admin.findById(id).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify Super Admin accounts' });
    }

    if (name) admin.name = name;
    if (mobileNumber !== undefined) admin.mobileNumber = mobileNumber;
    if (email) {
      const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }
      admin.email = email;
    }
    if (password) admin.password = password;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: { id: admin._id, name: admin.name, email: admin.email, mobileNumber: admin.mobileNumber, role: admin.role, isActive: admin.isActive, createdAt: admin.createdAt },
    });
  } catch (error) {
    console.error('Update admin error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * DELETE /api/admin-management/:id
 * Delete an Admin. Cannot delete Super Admins or yourself.
 */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.admin._id.toString() === id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin accounts' });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /api/admin-management/:id/toggle-active
 * Toggle isActive for an Admin.
 */
const toggleAdminActive = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify Super Admin accounts' });
    }

    if (req.admin._id.toString() === id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: admin._id, isActive: admin.isActive },
    });
  } catch (error) {
    console.error('Toggle admin active error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminActive,
};
