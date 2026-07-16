const Volunteer = require('../models/Volunteer');
const BloodCamp = require('../models/BloodCamp');

/**
 * GET /api/volunteer-management
 * List volunteers with search and pagination.
 */
const getVolunteers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Volunteer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('assignedCampId', 'name date status')
        .lean(),
      Volunteer.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get volunteers error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/volunteer-management
 * Create a new Volunteer.
 */
const createVolunteer = async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    if (!name || !email || !password || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and mobile number are required' });
    }

    const existing = await Volunteer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A volunteer with this email already exists' });
    }

    const volunteer = await Volunteer.create({ name, email, password, mobileNumber });

    res.status(201).json({
      success: true,
      message: 'Volunteer created successfully',
      data: {
        id: volunteer._id, name: volunteer.name, email: volunteer.email,
        mobileNumber: volunteer.mobileNumber, isActive: volunteer.isActive,
        assignedCampId: volunteer.assignedCampId, createdAt: volunteer.createdAt,
      },
    });
  } catch (error) {
    console.error('Create volunteer error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A volunteer with this email already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/volunteer-management/:id
 * Update a Volunteer.
 */
const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, mobileNumber } = req.body;

    const volunteer = await Volunteer.findById(id).select('+password');
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    if (name) volunteer.name = name;
    if (mobileNumber) volunteer.mobileNumber = mobileNumber;
    if (email) {
      const existing = await Volunteer.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A volunteer with this email already exists' });
      }
      volunteer.email = email;
    }
    if (password) volunteer.password = password;

    await volunteer.save();

    const updated = await Volunteer.findById(id).populate('assignedCampId', 'name date status').lean();

    res.status(200).json({
      success: true,
      message: 'Volunteer updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Update volunteer error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * DELETE /api/volunteer-management/:id
 * Delete a Volunteer.
 */
const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    await Volunteer.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error('Delete volunteer error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /api/volunteer-management/:id/toggle-active
 * Toggle isActive for a Volunteer.
 */
const toggleVolunteerActive = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    volunteer.isActive = !volunteer.isActive;
    await volunteer.save();

    res.status(200).json({
      success: true,
      message: `Volunteer ${volunteer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: volunteer._id, isActive: volunteer.isActive },
    });
  } catch (error) {
    console.error('Toggle volunteer active error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /api/volunteer-management/:id/assign-camp
 * Assign a volunteer to a blood camp.
 */
const assignCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const { campId } = req.body;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    if (campId) {
      const camp = await BloodCamp.findById(campId);
      if (!camp) {
        return res.status(404).json({ success: false, message: 'Blood camp not found' });
      }
      volunteer.assignedCampId = campId;
    } else {
      volunteer.assignedCampId = null;
    }

    await volunteer.save();

    const updated = await Volunteer.findById(id).populate('assignedCampId', 'name date status').lean();

    res.status(200).json({
      success: true,
      message: campId ? 'Volunteer assigned to camp successfully' : 'Volunteer unassigned from camp',
      data: updated,
    });
  } catch (error) {
    console.error('Assign camp error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/volunteer-management/camps
 * List all active/upcoming camps for assignment dropdown.
 */
const getCampsForAssignment = async (_req, res) => {
  try {
    const camps = await BloodCamp.find({ status: { $in: ['upcoming', 'active'] } })
      .sort({ date: 1 })
      .select('name date status location')
      .lean();

    res.status(200).json({ success: true, data: camps });
  } catch (error) {
    console.error('Get camps for assignment error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/volunteer-management/my-camp
 * Get the assigned camp for the currently logged-in Volunteer.
 */
const getMyCamp = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.admin._id)
      .populate('assignedCampId')
      .lean();

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    res.status(200).json({
      success: true,
      data: volunteer.assignedCampId || null,
    });
  } catch (error) {
    console.error('Get my camp error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  toggleVolunteerActive,
  assignCamp,
  getCampsForAssignment,
  getMyCamp,
};
