const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const BloodCamp = require('../models/BloodCamp');

/**
 * GET /api/donation-desk/search
 * Search for a registration by Registration ID, Roll Number, or Phone Number.
 */
const searchRegistration = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchQuery = {};
    const trimmedQuery = query.trim();

    // Check if the query is a valid MongoDB ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(trimmedQuery);

    if (isObjectId) {
      searchQuery._id = trimmedQuery;
    } else {
      // Otherwise, search by exact rollNumber (case-insensitive) or exact phone
      searchQuery.$or = [
        { rollNumber: { $regex: new RegExp(`^${trimmedQuery}$`, 'i') } },
        { phone: trimmedQuery },
      ];
    }

    const registration = await Registration.findOne(searchQuery)
      .populate('campId', 'name date location status organizer targetDonors actualDonors')
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
        rollNumber: registration.rollNumber || 'N/A',
        passoutYear: registration.passoutYear,
        status: registration.status,
        registeredAt: registration.registeredAt,
        camp: registration.campId ? {
          id: registration.campId._id,
          name: registration.campId.name,
          date: registration.campId.date,
          location: registration.campId.location,
          status: registration.campId.status,
          organizer: registration.campId.organizer || 'N/A',
          targetDonors: registration.campId.targetDonors,
          actualDonors: registration.campId.actualDonors,
        } : null,
      },
    });
  } catch (error) {
    console.error('Search registration error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /api/donation-desk/registrations/:id/status
 * Update registration status with duplicate donation prevention.
 */
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['registered', 'attended', 'donated', 'rejected', 'absent'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // PREVENT DUPLICATE DONATION UPDATES:
    // If student has already donated, and uploader tries to update status to donated again.
    if (registration.status === 'donated' && status === 'donated') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Action: This student has already donated blood in this camp.',
      });
    }

    const oldStatus = registration.status;
    registration.status = status;
    await registration.save();

    // Recalculate actualDonors if donation status changed
    if (registration.campId && (oldStatus === 'donated' || status === 'donated')) {
      const donatedCount = await Registration.countDocuments({
        campId: registration.campId,
        status: 'donated',
      });
      await BloodCamp.findByIdAndUpdate(registration.campId, {
        actualDonors: donatedCount,
      });
    }

    // Fetch the updated camp info to return current count
    const updatedCamp = await BloodCamp.findById(registration.campId).select('actualDonors').lean();

    res.status(200).json({
      success: true,
      message: `Status successfully updated to ${status}`,
      data: {
        id: registration._id,
        status: registration.status,
        campActualDonors: updatedCamp?.actualDonors || 0,
      },
    });
  } catch (error) {
    console.error('Update registration status error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  searchRegistration,
  updateRegistrationStatus,
};
