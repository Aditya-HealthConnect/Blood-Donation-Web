const BloodCamp = require('../models/BloodCamp');
const Registration = require('../models/Registration');

/**
 * GET /api/dashboard/stats
 * Aggregate overview statistics.
 */
const getStats = async (_req, res) => {
  try {
    const [
      totalCamps,
      activeCamps,
      upcomingCamps,
      totalRegistrations,
      todayRegistrations,
      totalDonors,
    ] = await Promise.all([
      BloodCamp.countDocuments(),
      BloodCamp.countDocuments({ status: 'active' }),
      BloodCamp.countDocuments({ status: 'upcoming' }),
      Registration.countDocuments(),
      Registration.countDocuments({
        registeredAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Registration.countDocuments({ status: 'donated' }),
    ]);

    // Each donated unit is ~1 unit (~450ml)
    const totalBloodDonated = totalDonors;

    res.status(200).json({
      success: true,
      data: {
        totalCamps,
        activeCamps,
        upcomingCamps,
        totalRegistrations,
        todayRegistrations,
        totalDonors,
        totalBloodDonated,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/dashboard/charts
 * Data for charts: monthly registrations, branch-wise, donation status.
 */
const getChartData = async (_req, res) => {
  try {
    // Monthly registrations (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRaw = await Registration.aggregate([
      { $match: { registeredAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$registeredAt' },
            month: { $month: '$registeredAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Fill in missing months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRegistrations = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthlyRaw.find(m => m._id.year === year && m._id.month === month);
      monthlyRegistrations.push({
        month: monthNames[month - 1],
        year,
        count: found ? found.count : 0,
      });
    }

    // Branch-wise registrations
    const branchWise = await Registration.aggregate([
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    const branchWiseRegistrations = branchWise.map(b => ({
      branch: b._id,
      count: b.count,
    }));

    // Donation status breakdown
    const statusRaw = await Registration.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const donationStatus = statusRaw.map(s => ({
      status: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      count: s.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        monthlyRegistrations,
        branchWiseRegistrations,
        donationStatus,
      },
    });
  } catch (error) {
    console.error('Dashboard charts error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/dashboard/recent-registrations
 * Latest 10 registrations with camp name.
 */
const getRecentRegistrations = async (_req, res) => {
  try {
    const registrations = await Registration.find()
      .sort({ registeredAt: -1 })
      .limit(10)
      .populate('campId', 'name')
      .lean();

    const data = registrations.map(r => ({
      id: r._id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      bloodGroup: r.bloodGroup,
      branch: r.branch,
      campName: r.campId?.name || 'N/A',
      status: r.status,
      registeredAt: r.registeredAt,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Recent registrations error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/dashboard/upcoming-camps
 * Next 5 upcoming camps.
 */
const getUpcomingCamps = async (_req, res) => {
  try {
    const camps = await BloodCamp.find({ status: { $in: ['upcoming', 'active'] } })
      .sort({ date: 1 })
      .limit(5)
      .lean();

    const data = camps.map(c => ({
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
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Upcoming camps error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getStats,
  getChartData,
  getRecentRegistrations,
  getUpcomingCamps,
};
