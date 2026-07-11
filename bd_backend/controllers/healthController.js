const mongoose = require('mongoose');

const getApiStatus = (_req, res) => {
  res.json({
    name: 'Blood Donation Web API',
    status: 'running',
  });
};

const getHealthStatus = (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'not_connected',
  });
};

module.exports = {
  getApiStatus,
  getHealthStatus,
};
