const fs = require('fs');
const path = require('path');
const multer = require('multer');
const GalleryImage = require('../models/GalleryImage');
const BloodCamp = require('../models/BloodCamp');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.'), false);
  }
};

// Multer middleware instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
});

/**
 * POST /api/gallery/upload
 * Upload a new image and create the record in MongoDB.
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const { caption = '', campId = '' } = req.body;

    // Check if campId is valid and exists
    let associatedCampId = null;
    if (campId && campId !== 'null' && campId !== 'undefined') {
      const camp = await BloodCamp.findById(campId);
      if (camp) {
        associatedCampId = camp._id;
      }
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newImage = await GalleryImage.create({
      imageUrl,
      caption,
      campId: associatedCampId,
      uploadedBy: req.admin._id,
    });

    const populatedImage = await GalleryImage.findById(newImage._id)
      .populate('campId', 'name date')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: populatedImage._id,
        imageUrl: populatedImage.imageUrl,
        caption: populatedImage.caption,
        campId: populatedImage.campId?._id || null,
        campName: populatedImage.campId?.name || null,
        createdAt: populatedImage.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload image error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

/**
 * GET /api/gallery
 * Fetch all gallery images (optionally filtered by campId).
 */
const getGalleryImages = async (req, res) => {
  try {
    const { campId } = req.query;
    const query = {};

    if (campId && campId !== 'null' && campId !== 'undefined') {
      query.campId = campId;
    }

    const images = await GalleryImage.find(query)
      .sort({ createdAt: -1 })
      .populate('campId', 'name date status')
      .lean();

    res.status(200).json({
      success: true,
      data: images.map(img => ({
        id: img._id,
        imageUrl: img.imageUrl,
        caption: img.caption,
        campId: img.campId?._id || null,
        campName: img.campId?.name || null,
        createdAt: img.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get gallery images error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/gallery/:id
 * Update image caption or associated camp.
 */
const updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, campId } = req.body;

    const image = await GalleryImage.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    if (caption !== undefined) {
      image.caption = caption;
    }

    if (campId !== undefined) {
      if (campId && campId !== 'null') {
        const camp = await BloodCamp.findById(campId);
        if (camp) {
          image.campId = camp._id;
        }
      } else {
        image.campId = null;
      }
    }

    await image.save();

    const updatedImage = await GalleryImage.findById(id)
      .populate('campId', 'name date')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Image details updated successfully',
      data: {
        id: updatedImage._id,
        imageUrl: updatedImage.imageUrl,
        caption: updatedImage.caption,
        campId: updatedImage.campId?._id || null,
        campName: updatedImage.campId?.name || null,
        createdAt: updatedImage.createdAt,
      },
    });
  } catch (error) {
    console.error('Update gallery image error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * DELETE /api/gallery/:id
 * Delete the gallery image record and unlink the file from disk.
 */
const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await GalleryImage.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Attempt to delete file from disk
    if (image.imageUrl) {
      const filename = path.basename(image.imageUrl);
      const filePath = path.join(uploadDir, filename);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file from disk: ${filePath}`, err.message);
        } else {
          console.log(`Successfully deleted file from disk: ${filePath}`);
        }
      });
    }

    // Delete record from DB
    await GalleryImage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete gallery image error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  upload, // Multer upload middleware exports to routes
  uploadImage,
  getGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
};
