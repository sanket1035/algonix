const mongoose = require('mongoose');
const User = require('./models/User');

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/algonix');
    
    const result = await User.updateOne(
      { email: 'admin@algonix.com' },
      { $set: { isAdmin: true } }
    );
    
    console.log('Admin flag updated:', result);
    
    const user = await User.findOne({ email: 'admin@algonix.com' });
    console.log('User isAdmin status:', user?.isAdmin);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdmin();