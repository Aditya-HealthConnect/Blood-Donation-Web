const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  upload,
  uploadImage,
  getGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
} = require('../controllers/galleryController');

const router = express.Router();

// Fetch gallery list: Accessible by Super Admin, Admin, and Volunteer
router.get(
  '/api/gallery',
  protect,
  authorize('Super Admin', 'Admin', 'Volunteer'),
  getGalleryImages
);

// Upload image: Super Admin & Admin only
router.post(
  '/api/gallery/upload',
  protect,
  authorize('Super Admin', 'Admin'),
  upload.single('image'),
  uploadImage
);

// Update image info: Super Admin & Admin only
router.put(
  '/api/gallery/:id',
  protect,
  authorize('Super Admin', 'Admin'),
  updateGalleryImage
);

// Delete image: Super Admin & Admin only
router.delete(
  '/api/gallery/:id',
  protect,
  authorize('Super Admin', 'Admin'),
  deleteGalleryImage
);

module.exports = router;
