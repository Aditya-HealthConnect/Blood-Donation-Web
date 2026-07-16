const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  caption: {
    type: String,
    trim: true,
    default: '',
  },
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodCamp',
    default: null,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Uploader Admin is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

module.exports = GalleryImage;
