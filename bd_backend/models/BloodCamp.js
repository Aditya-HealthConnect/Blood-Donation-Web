const mongoose = require('mongoose');

const bloodCampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Camp name is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  startTime: {
    type: String,
    default: '09:00 AM',
  },
  endTime: {
    type: String,
    default: '04:00 PM',
  },
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'active', 'completed'],
      message: 'Status must be upcoming, active, or completed',
    },
    default: 'upcoming',
  },
  targetDonors: {
    type: Number,
    default: 100,
  },
  actualDonors: {
    type: Number,
    default: 0,
  },
  organizer: {
    type: String,
    trim: true,
  },
  organizers: {
    type: [{
      name: { type: String, trim: true, required: true },
      location: { type: String, trim: true, required: true },
      roomNumber: { type: String, trim: true },
      actualDonors: { type: Number, default: 0 }
    }],
    default: [],
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BloodCamp = mongoose.model('BloodCamp', bloodCampSchema);

module.exports = BloodCamp;
