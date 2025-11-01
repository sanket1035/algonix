const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/algonix?authSource=admin');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@algonix.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@algonix.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      username: 'admin',
      email: 'admin@algonix.com',
      password: hashedPassword,
      profile: { 
        firstName: 'Admin', 
        lastName: 'User' 
      },
      isAdmin: true,
      stats: {
        totalPoints: 0,
        weeklyPoints: 0,
        level: 1,
        solvedProblems: 0,
        streak: 0
      }
    });

    await admin.save();
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@algonix.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();