const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Invalid blood group',
    },
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true,
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true,
  },
  passoutYear: {
    type: Number,
    required: [true, 'Passout year is required'],
  },
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodCamp',
    required: [true, 'Camp ID is required'],
  },
  organizer: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ['registered', 'attended', 'donated', 'rejected', 'absent'],
      message: 'Status must be registered, attended, donated, rejected, or absent',
    },
    default: 'registered',
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
