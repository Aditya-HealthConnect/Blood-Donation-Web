const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BloodCamp = require('./models/BloodCamp');
const Registration = require('./models/Registration');

dotenv.config();

const branches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'Chemical'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const firstNames = ['Aditya', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavya', 'Arjun', 'Divya', 'Sanjay', 'Meera', 'Karthik', 'Pooja', 'Nikhil', 'Swathi', 'Deepak', 'Lakshmi', 'Suresh', 'Rani'];
const lastNames = ['Sharma', 'Patel', 'Reddy', 'Kumar', 'Singh', 'Verma', 'Gupta', 'Nair', 'Rao', 'Das'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startMonthsAgo, endMonthsAgo) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - startMonthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - endMonthsAgo, 28);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const seedDashboard = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for dashboard seeding');

    // Clear existing data
    await BloodCamp.deleteMany({});
    await Registration.deleteMany({});
    console.log('Cleared existing camps and registrations');

    // Create blood camps
    const campsData = [
      {
        name: 'Spring Blood Drive 2026',
        location: 'Main Auditorium',
        branch: 'CSE',
        date: randomDate(5, 4),
        startTime: '09:00 AM',
        endTime: '04:00 PM',
        status: 'completed',
        targetDonors: 120,
        actualDonors: 98,
        organizer: 'Dr. Ramesh Kumar',
        description: 'Annual spring blood donation camp organized by CSE department.',
      },
      {
        name: 'World Blood Donor Day Camp',
        location: 'Seminar Hall B',
        branch: 'ECE',
        date: randomDate(4, 3),
        startTime: '10:00 AM',
        endTime: '03:00 PM',
        status: 'completed',
        targetDonors: 80,
        actualDonors: 72,
        organizer: 'Prof. Lakshmi Devi',
        description: 'Special camp on World Blood Donor Day.',
      },
      {
        name: 'Monsoon Health Camp',
        location: 'Sports Complex',
        branch: 'Mechanical',
        date: randomDate(3, 2),
        startTime: '09:30 AM',
        endTime: '05:00 PM',
        status: 'completed',
        targetDonors: 100,
        actualDonors: 85,
        organizer: 'Dr. Suresh Patel',
        description: 'Monsoon season blood donation and health check camp.',
      },
      {
        name: 'Engineers Day Blood Drive',
        location: 'Conference Hall',
        branch: 'EEE',
        date: randomDate(2, 1),
        startTime: '08:30 AM',
        endTime: '02:00 PM',
        status: 'completed',
        targetDonors: 90,
        actualDonors: 78,
        organizer: 'Prof. Anita Sharma',
        description: 'Blood donation drive on Engineers Day.',
      },
      {
        name: 'National Blood Donation Drive',
        location: 'Central Library Hall',
        branch: 'IT',
        date: randomDate(1, 0),
        startTime: '09:00 AM',
        endTime: '04:00 PM',
        status: 'completed',
        targetDonors: 110,
        actualDonors: 91,
        organizer: 'Dr. Karthik Rao',
        description: 'National level blood donation awareness camp.',
      },
      {
        name: 'Red Cross Partnership Camp',
        location: 'Main Auditorium',
        branch: 'Civil',
        date: new Date(),
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        status: 'active',
        targetDonors: 150,
        actualDonors: 42,
        organizer: 'Red Cross Society',
        description: 'Blood donation camp in partnership with Red Cross.',
      },
      {
        name: 'IT Department Blood Camp',
        location: 'IT Block Seminar Hall',
        branch: 'IT',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '03:00 PM',
        status: 'active',
        targetDonors: 75,
        actualDonors: 18,
        organizer: 'Prof. Deepak Verma',
        description: 'IT department organized blood donation camp.',
      },
      {
        name: 'Independence Day Blood Drive',
        location: 'Sports Ground',
        branch: 'CSE',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        startTime: '08:00 AM',
        endTime: '01:00 PM',
        status: 'upcoming',
        targetDonors: 200,
        actualDonors: 0,
        organizer: 'College NSS Unit',
        description: 'Special blood donation drive on Independence Day.',
      },
      {
        name: 'Mechanical Dept Mega Camp',
        location: 'Workshop Complex',
        branch: 'Mechanical',
        date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '04:00 PM',
        status: 'upcoming',
        targetDonors: 130,
        actualDonors: 0,
        organizer: 'Dr. Vikram Singh',
        description: 'Mechanical department mega blood camp.',
      },
      {
        name: 'Chemical Dept Awareness Camp',
        location: 'Chemical Block Hall',
        branch: 'Chemical',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '03:00 PM',
        status: 'upcoming',
        targetDonors: 60,
        actualDonors: 0,
        organizer: 'Prof. Meera Das',
        description: 'Blood donation awareness and camp by Chemical department.',
      },
    ];

    const camps = await BloodCamp.insertMany(campsData);
    console.log(`Created ${camps.length} blood camps`);

    // Create registrations spread across camps
    const registrations = [];
    const statuses = ['registered', 'attended', 'donated', 'rejected'];

    for (const camp of camps) {
      // Generate registrations based on camp status
      let regCount;
      if (camp.status === 'completed') {
        regCount = Math.floor(Math.random() * 10) + 10; // 10–19
      } else if (camp.status === 'active') {
        regCount = Math.floor(Math.random() * 8) + 5; // 5–12
      } else {
        regCount = Math.floor(Math.random() * 5) + 2; // 2–6 (upcoming, only registered)
      }

      for (let i = 0; i < regCount; i++) {
        const firstName = randomFrom(firstNames);
        const lastName = randomFrom(lastNames);
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}@email.com`;

        let status;
        if (camp.status === 'upcoming') {
          status = 'registered';
        } else if (camp.status === 'completed') {
          // Weighted: mostly donated for completed camps
          const rand = Math.random();
          if (rand < 0.55) status = 'donated';
          else if (rand < 0.75) status = 'attended';
          else if (rand < 0.9) status = 'registered';
          else status = 'rejected';
        } else {
          // Active camp
          const rand = Math.random();
          if (rand < 0.3) status = 'donated';
          else if (rand < 0.5) status = 'attended';
          else status = 'registered';
        }

        // Spread registeredAt around the camp date
        const dayOffset = Math.floor(Math.random() * 7) - 3;
        const regDate = new Date(camp.date);
        regDate.setDate(regDate.getDate() + dayOffset);

        registrations.push({
          name,
          email,
          phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
          bloodGroup: randomFrom(bloodGroups),
          branch: randomFrom(branches),
          campId: camp._id,
          status,
          registeredAt: regDate,
        });
      }
    }

    await Registration.insertMany(registrations);
    console.log(`Created ${registrations.length} registrations`);

    // Summary
    const donated = registrations.filter(r => r.status === 'donated').length;
    console.log(`\nSeed Summary:`);
    console.log(`  Camps:         ${camps.length}`);
    console.log(`  Registrations: ${registrations.length}`);
    console.log(`  Donated:       ${donated}`);
    console.log(`  Active Camps:  ${camps.filter(c => c.status === 'active').length}`);
    console.log(`  Upcoming Camps:${camps.filter(c => c.status === 'upcoming').length}`);

    await mongoose.disconnect();
    console.log('\nMongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDashboard();
