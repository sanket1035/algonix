const mongoose = require('mongoose');
const User = require('./models/User');
const streakService = require('./services/streakService');
require('dotenv').config();

async function fixBadges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/algonix?authSource=admin');
    
    const users = await User.find({});
    console.log(`Found ${users.length} users to check`);
    
    for (const user of users) {
      console.log(`Checking badges for user: ${user.username}`);
      console.log(`Problems solved: ${user.stats.solvedProblems}, Streak: ${user.stats.streak}`);
      
      // Check problem solver badges
      await streakService.checkProblemSolverBadges(user);
      
      // Check streak badges
      await streakService.checkStreakBadges(user);
      
      // Get updated user to see badges
      const updatedUser = await User.findById(user._id);
      console.log(`Badges awarded: ${updatedUser.badges.length}`);
      updatedUser.badges.forEach(badge => {
        console.log(`- ${badge.icon} ${badge.name}: ${badge.description}`);
      });
      console.log('---');
    }
    
    console.log('Badge fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing badges:', error);
    process.exit(1);
  }
}

fixBadges();