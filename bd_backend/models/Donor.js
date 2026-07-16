const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Donor must be at least 18 years old'],
    max: [65, 'Donor must be at most 65 years old'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other',
    },
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Invalid blood group',
    },
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodCamp',
    required: [true, 'Camp selection is required'],
  },
  donationDate: {
    type: Date,
    required: [true, 'Donation date is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
