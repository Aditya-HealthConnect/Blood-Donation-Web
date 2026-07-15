const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding');

    // Check if Super Admin already exists
    const existingAdmin = await Admin.findOne({ email: 'sudheerimmidisetti@gmail.com' });

    if (existingAdmin) {
      console.log('Super Admin already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role:  ${existingAdmin.role}`);
      console.log('Skipping seed.');
    } else {
      const superAdmin = await Admin.create({
        name: 'Super Admin',
        email: 'sudheerimmidisetti@gmail.com',
        password: 'SuperAdmin@123',
        role: 'Super Admin',
        isActive: true,
      });

      console.log('Super Admin created successfully:');
      console.log(`  Name:  ${superAdmin.name}`);
      console.log(`  Email: ${superAdmin.email}`);
      console.log(`  Role:  ${superAdmin.role}`);
      console.log(`  Password: SuperAdmin@123`);
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
