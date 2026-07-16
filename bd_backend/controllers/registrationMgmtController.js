const Registration = require('../models/Registration');
const BloodCamp = require('../models/BloodCamp');

/**
 * GET /api/registration-management
 * Get paginated list of registrations with search and filtering, plus dropdown options.
 */
const getRegistrations = async (req, res) => {
  try {
    const {
      search = '',
      campId = '',
      branch = '',
      passoutYear = '',
      status = '',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query object
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (campId) {
      query.campId = campId;
    }

    if (branch) {
      query.branch = branch;
    }

    if (passoutYear) {
      query.passoutYear = parseInt(passoutYear);
    }

    if (status) {
      query.status = status;
    }

    // Fetch paginated data and total count
    const [data, total] = await Promise.all([
      Registration.find(query)
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('campId', 'name location date status')
        .lean(),
      Registration.countDocuments(query),
    ]);

    // Fetch dynamic options for frontend filters
    const [allCamps, uniqueBranches, uniquePassoutYears] = await Promise.all([
      BloodCamp.find().select('name date status').sort({ date: -1 }).lean(),
      Registration.distinct('branch'),
      Registration.distinct('passoutYear'),
    ]);

    const filters = {
      camps: allCamps.map(c => ({ id: c._id, name: c.name, status: c.status })),
      branches: uniqueBranches.filter(Boolean).sort(),
      passoutYears: uniquePassoutYears.filter(Number).sort((a, b) => b - a), // descending order
      statuses: ['registered', 'attended', 'donated', 'rejected'],
    };

    res.status(200).json({
      success: true,
      data: data.map(r => ({
        id: r._id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        bloodGroup: r.bloodGroup,
        branch: r.branch,
        passoutYear: r.passoutYear,
        campId: r.campId?._id || '',
        campName: r.campId?.name || 'N/A',
        status: r.status,
        registeredAt: r.registeredAt,
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      filters,
    });
  } catch (error) {
    console.error('Get registrations error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/registration-management/export
 * Export filtered list of registrations (without pagination limit) as CSV.
 */
const exportRegistrations = async (req, res) => {
  try {
    const {
      search = '',
      campId = '',
      branch = '',
      passoutYear = '',
      status = '',
    } = req.query;

    // Build query object
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (campId) {
      query.campId = campId;
    }

    if (branch) {
      query.branch = branch;
    }

    if (passoutYear) {
      query.passoutYear = parseInt(passoutYear);
    }

    if (status) {
      query.status = status;
    }

    // Fetch all matching registrations
    const registrations = await Registration.find(query)
      .sort({ registeredAt: -1 })
      .populate('campId', 'name')
      .lean();

    // Generate CSV
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Blood Group',
      'Branch',
      'Passout Year',
      'Camp Name',
      'Status',
      'Registration Date',
    ];

    const rows = registrations.map(r => {
      const formattedDate = new Date(r.registeredAt).toISOString().split('T')[0];
      return [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.email.replace(/"/g, '""')}"`,
        `"${r.phone.replace(/"/g, '""')}"`,
        `"${r.bloodGroup}"`,
        `"${r.branch}"`,
        r.passoutYear || 'N/A',
        `"${(r.campId?.name || 'N/A').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        formattedDate,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export registrations error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/registration-management/:id
 * Get details of a single registration.
 */
const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id)
      .populate('campId', 'name date location status')
      .lean();

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        bloodGroup: registration.bloodGroup,
        branch: registration.branch,
        passoutYear: registration.passoutYear,
        status: registration.status,
        registeredAt: registration.registeredAt,
        camp: registration.campId ? {
          id: registration.campId._id,
          name: registration.campId.name,
          date: registration.campId.date,
          location: registration.campId.location,
          status: registration.campId.status,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get registration detail error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /api/registration-management/:id/status
 * Update registration status.
 */
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['registered', 'attended', 'donated', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    registration.status = status;
    await registration.save();

    // If status updated to donated or from donated, we can update actualDonors in BloodCamp
    // Let's find the camp and recalculate its actualDonors for consistency
    if (registration.campId) {
      const donatedCount = await Registration.countDocuments({
        campId: registration.campId,
        status: 'donated',
      });
      await BloodCamp.findByIdAndUpdate(registration.campId, {
        actualDonors: donatedCount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration status updated successfully',
      data: {
        id: registration._id,
        status: registration.status,
      },
    });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/registrations (Public)
 * Create a new student registration from the landing homepage.
 */
const createRegistrationPublic = async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, branch, rollNumber, passoutYear, campId } = req.body;

    // Validate inputs
    if (!name || !email || !phone || !bloodGroup || !branch || !rollNumber || !passoutYear || !campId) {
      return res.status(400).json({ success: false, message: 'All registration fields are required' });
    }

    // Verify camp exists
    const camp = await BloodCamp.findById(campId);
    if (!camp) {
      return res.status(404).json({ success: false, message: 'Blood camp not found' });
    }

    if (camp.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot register for a completed blood camp drive' });
    }

    // Check for duplicate registration in the SAME camp
    const trimmedRoll = rollNumber.trim().toUpperCase();
    const existing = await Registration.findOne({
      campId,
      $or: [
        { email: email.toLowerCase() },
        { rollNumber: trimmedRoll }
      ]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this blood camp drive.'
      });
    }

    const newReg = await Registration.create({
      name,
      email: email.toLowerCase(),
      phone,
      bloodGroup,
      branch,
      rollNumber: trimmedRoll,
      passoutYear: parseInt(passoutYear),
      campId,
      status: 'registered',
    });

    res.status(201).json({
      success: true,
      message: 'Registration created successfully! See you at the camp.',
      data: newReg,
    });
  } catch (error) {
    console.error('Create public registration error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getRegistrations,
  exportRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  createRegistrationPublic,
};
