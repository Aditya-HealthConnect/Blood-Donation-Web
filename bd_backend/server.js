const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminMgmtRoutes = require('./routes/adminMgmtRoutes');
const volunteerMgmtRoutes = require('./routes/volunteerMgmtRoutes');
const registrationMgmtRoutes = require('./routes/registrationMgmtRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const donationDeskRoutes = require('./routes/donationDeskRoutes');
const donorRoutes = require('./routes/donorRoutes');
const campRoutes = require('./routes/campRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
// Serve static image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(healthRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(adminMgmtRoutes);
app.use(volunteerMgmtRoutes);
app.use(registrationMgmtRoutes);
app.use(galleryRoutes);
app.use(donationDeskRoutes);
app.use(donorRoutes);
app.use(campRoutes);

const startServer = async () => {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected');
    } else {
      console.log('MONGODB_URI not set; starting API without database connection');
    }

    const server = app.listen(PORT, () => {
      console.log(`Blood Donation API running on port ${PORT}`);
    });

    server.on('error', (error) => {
      console.error(`Failed to listen on port ${PORT}:`, error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
