const express = require('express');
const {
  getApiStatus,
  getHealthStatus,
} = require('../controllers/healthController');

const router = express.Router();

router.get('/', getApiStatus);
router.get('/api/health', getHealthStatus);

module.exports = router;
