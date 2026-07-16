const Donor = require('../models/Donor');
const Registration = require('../models/Registration');
const BloodCamp = require('../models/BloodCamp');

// Helper function to update actual donors count in BloodCamp
const updateCampActualDonors = async (campId) => {
  if (!campId) return;
  try {
    const [donatedRegs, manualDonors] = await Promise.all([
      Registration.countDocuments({ campId, status: 'donated' }),
      Donor.countDocuments({ campId }),
    ]);
    await BloodCamp.findByIdAndUpdate(campId, {
      actualDonors: donatedRegs + manualDonors,
    });
  } catch (error) {
    console.error(`Failed to update actual donors count for camp ${campId}:`, error.message);
  }
};

/**
 * POST /api/donors
 * Create a manual donor entry.
 */
const createDonor = async (req, res) => {
  try {
    const { name, mobileNumber, age, gender, bloodGroup, address, campId, donationDate } = req.body;

    // Validate fields
    if (!name || !mobileNumber || !age || !gender || !bloodGroup || !address || !campId || !donationDate) {
      return res.status(400).json({ success: false, message: 'All form fields are required' });
    }

    const donorAge = parseInt(age);
    if (isNaN(donorAge) || donorAge < 18 || donorAge > 65) {
      return res.status(400).json({ success: false, message: 'Donor must be between 18 and 65 years old' });
    }

    const camp = await BloodCamp.findById(campId);
    if (!camp) {
      return res.status(404).json({ success: false, message: 'Blood camp not found' });
    }

    const newDonor = await Donor.create({
      name,
      mobileNumber,
      age: donorAge,
      gender,
      bloodGroup,
      address,
      campId,
      donationDate,
    });

    // Update actual donors in BloodCamp
    await updateCampActualDonors(campId);

    res.status(201).json({
      success: true,
      message: 'Manual donor entry created successfully',
      data: newDonor,
    });
  } catch (error) {
    console.error('Create donor error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

/**
 * GET /api/donors
 * Get paginated list of donors with search and filtering.
 */
const getDonors = async (req, res) => {
  try {
    const { search = '', campId = '', page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (campId) {
      query.campId = campId;
    }

    const [data, total] = await Promise.all([
      Donor.find(query)
        .sort({ donationDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('campId', 'name location date')
        .lean(),
      Donor.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: data.map(d => ({
        id: d._id,
        name: d.name,
        mobileNumber: d.mobileNumber,
        age: d.age,
        gender: d.gender,
        bloodGroup: d.bloodGroup,
        address: d.address,
        campId: d.campId?._id || '',
        campName: d.campId?.name || 'N/A',
        donationDate: d.donationDate,
        createdAt: d.createdAt,
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get donors list error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/donors/:id
 * Retrieve a single donor's details.
 */
const getDonorById = async (req, res) => {
  try {
    const { id } = req.params;

    const donor = await Donor.findById(id).populate('campId', 'name date location').lean();

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: donor._id,
        name: donor.name,
        mobileNumber: donor.mobileNumber,
        age: donor.age,
        gender: donor.gender,
        bloodGroup: donor.bloodGroup,
        address: donor.address,
        campId: donor.campId?._id || '',
        campName: donor.campId?.name || 'N/A',
        donationDate: donor.donationDate,
      },
    });
  } catch (error) {
    console.error('Get donor detail error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/donors/:id
 * Update donor details.
 */
const updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobileNumber, age, gender, bloodGroup, address, campId, donationDate } = req.body;

    const donor = await Donor.findById(id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const oldCampId = donor.campId;

    if (name) donor.name = name;
    if (mobileNumber) donor.mobileNumber = mobileNumber;
    if (age) {
      const donorAge = parseInt(age);
      if (isNaN(donorAge) || donorAge < 18 || donorAge > 65) {
        return res.status(400).json({ success: false, message: 'Donor must be between 18 and 65 years old' });
      }
      donor.age = donorAge;
    }
    if (gender) donor.gender = gender;
    if (bloodGroup) donor.bloodGroup = bloodGroup;
    if (address) donor.address = address;
    if (donationDate) donor.donationDate = donationDate;

    if (campId && campId.toString() !== oldCampId?.toString()) {
      const camp = await BloodCamp.findById(campId);
      if (!camp) {
        return res.status(404).json({ success: false, message: 'New blood camp not found' });
      }
      donor.campId = campId;
    }

    await donor.save();

    // Update actual donors for both camps if camp association changed
    await updateCampActualDonors(donor.campId);
    if (campId && campId.toString() !== oldCampId?.toString()) {
      await updateCampActualDonors(oldCampId);
    }

    res.status(200).json({
      success: true,
      message: 'Donor updated successfully',
      data: donor,
    });
  } catch (error) {
    console.error('Update donor error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/donors/:id
 * Delete a donor record.
 */
const deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;

    const donor = await Donor.findById(id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const campId = donor.campId;

    await Donor.findByIdAndDelete(id);

    // Update actual donors in BloodCamp
    await updateCampActualDonors(campId);

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully',
    });
  } catch (error) {
    console.error('Delete donor error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createDonor,
  getDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};
