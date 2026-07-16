const BloodCamp = require('../models/BloodCamp');

/**
 * POST /api/blood-camps
 * Create a new blood camp. (Super Admin only)
 */
const createCamp = async (req, res) => {
  try {
    const { name, location, branch, date, startTime, endTime, status, targetDonors, organizer, description } = req.body;

    if (!name || !location || !branch || !date) {
      return res.status(400).json({ success: false, message: 'Name, Location, Branch, and Date are required' });
    }

    const newCamp = await BloodCamp.create({
      name,
      location,
      branch,
      date,
      startTime: startTime || '09:00 AM',
      endTime: endTime || '04:00 PM',
      status: status || 'upcoming',
      targetDonors: targetDonors ? parseInt(targetDonors) : 100,
      organizer,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Blood camp created successfully',
      data: newCamp,
    });
  } catch (error) {
    console.error('Create camp error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

/**
 * GET /api/blood-camps
 * Get paginated list of camps for admin workspace.
 */
const getCamps = async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const [data, total] = await Promise.all([
      BloodCamp.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BloodCamp.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: data.map(c => ({
        id: c._id,
        name: c.name,
        location: c.location,
        branch: c.branch,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        status: c.status,
        targetDonors: c.targetDonors,
        actualDonors: c.actualDonors,
        organizer: c.organizer || '',
        description: c.description || '',
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get camps error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/blood-camps/public
 * Get all upcoming and active camps for public landing timeline.
 */
const getPublicCamps = async (_req, res) => {
  try {
    const camps = await BloodCamp.find({ status: { $in: ['active', 'upcoming'] } })
      .sort({ date: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: camps.map(c => ({
        id: c._id,
        name: c.name,
        location: c.location,
        branch: c.branch,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        status: c.status,
        targetDonors: c.targetDonors,
        actualDonors: c.actualDonors,
        organizer: c.organizer || '',
        description: c.description || '',
      })),
    });
  } catch (error) {
    console.error('Get public camps error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/blood-camps/:id
 * Retrieve a single blood camp's details.
 */
const getCampById = async (req, res) => {
  try {
    const { id } = req.params;

    const camp = await BloodCamp.findById(id).lean();

    if (!camp) {
      return res.status(404).json({ success: false, message: 'Blood camp not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: camp._id,
        name: camp.name,
        location: camp.location,
        branch: camp.branch,
        date: camp.date,
        startTime: camp.startTime,
        endTime: camp.endTime,
        status: camp.status,
        targetDonors: camp.targetDonors,
        actualDonors: camp.actualDonors,
        organizer: camp.organizer || '',
        description: camp.description || '',
      },
    });
  } catch (error) {
    console.error('Get camp detail error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/blood-camps/:id
 * Update camp details. (Super Admin only)
 */
const updateCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, branch, date, startTime, endTime, status, targetDonors, organizer, description } = req.body;

    const camp = await BloodCamp.findById(id);
    if (!camp) {
      return res.status(404).json({ success: false, message: 'Blood camp not found' });
    }

    if (name) camp.name = name;
    if (location) camp.location = location;
    if (branch) camp.branch = branch;
    if (date) camp.date = date;
    if (startTime) camp.startTime = startTime;
    if (endTime) camp.endTime = endTime;
    if (status) camp.status = status;
    if (targetDonors) camp.targetDonors = parseInt(targetDonors);
    if (organizer !== undefined) camp.organizer = organizer;
    if (description !== undefined) camp.description = description;

    await camp.save();

    res.status(200).json({
      success: true,
      message: 'Blood camp updated successfully',
      data: camp,
    });
  } catch (error) {
    console.error('Update camp error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/blood-camps/:id
 * Delete a blood camp record. (Super Admin only)
 */
const deleteCamp = async (req, res) => {
  try {
    const { id } = req.params;

    const camp = await BloodCamp.findById(id);
    if (!camp) {
      return res.status(404).json({ success: false, message: 'Blood camp not found' });
    }

    await BloodCamp.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blood camp deleted successfully',
    });
  } catch (error) {
    console.error('Delete camp error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createCamp,
  getCamps,
  getPublicCamps,
  getCampById,
  updateCamp,
  deleteCamp,
};
