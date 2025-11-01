const User = require('../models/User');

class StreakService {
  async updateStreak(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastSolveDate = user.stats.lastSolveDate ? new Date(user.stats.lastSolveDate) : null;
      
      if (lastSolveDate) {
        lastSolveDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastSolveDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day, no streak change
          return;
        } else if (daysDiff === 1) {
          // Consecutive day, increment streak
          await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.streak': 1 },
            $set: { 'stats.lastSolveDate': new Date() }
          });
          
          // Check for streak badges
          const updatedUser = await User.findById(userId);
          await this.checkStreakBadges(updatedUser);
        } else {
          // Streak broken, reset to 1
          await User.findByIdAndUpdate(userId, {
            $set: { 
              'stats.streak': 1,
              'stats.lastSolveDate': new Date()
            }
          });
        }
      } else {
        // First solve ever
        await User.findByIdAndUpdate(userId, {
          $set: { 
            'stats.streak': 1,
            'stats.lastSolveDate': new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  async checkStreakBadges(user) {
    const streakBadges = [
      { name: '7 Day Streak', description: 'Solved problems for 7 consecutive days', icon: '🔥', threshold: 7 },
      { name: '30 Day Streak', description: 'Solved problems for 30 consecutive days', icon: '💪', threshold: 30 },
      { name: '50 Day Streak', description: 'Solved problems for 50 consecutive days', icon: '⚡', threshold: 50 },
      { name: '100 Day Streak', description: 'Solved problems for 100 consecutive days', icon: '🏆', threshold: 100 }
    ];

    for (const badge of streakBadges) {
      if (user.stats.streak >= badge.threshold) {
        const hasBadge = user.badges.some(b => b.name === badge.name);
        if (!hasBadge) {
          await User.findByIdAndUpdate(user._id, {
            $push: {
              badges: {
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                earnedAt: new Date()
              }
            }
          });
        }
      }
    }
  }

  async checkProblemSolverBadges(user) {
    const problemBadges = [
      { name: 'Starter', description: 'Solved 1 problem', icon: '🌱', threshold: 1 },
      { name: 'Beginner Solver', description: 'Solved 5 problems', icon: '📚', threshold: 5 },
      { name: 'Rising Coder', description: 'Solved 10 problems', icon: '🚀', threshold: 10 },
      { name: 'Intermediate Solver', description: 'Solved 25 problems', icon: '💻', threshold: 25 },
      { name: 'Advanced Coder', description: 'Solved 50 problems', icon: '⭐', threshold: 50 },
      { name: 'Pro Solver', description: 'Solved 100 problems', icon: '🎯', threshold: 100 },
      { name: 'Expert Coder', description: 'Solved 250 problems', icon: '🔮', threshold: 250 },
      { name: 'Master Solver', description: 'Solved 500 problems', icon: '👑', threshold: 500 },
      { name: 'Grandmaster', description: 'Solved 750 problems', icon: '💎', threshold: 750 },
      { name: 'Legendary Coder', description: 'Solved 1000+ problems', icon: '🏅', threshold: 1000 }
    ];

    for (const badge of problemBadges) {
      if (user.stats.solvedProblems >= badge.threshold) {
        const hasBadge = user.badges.some(b => b.name === badge.name);
        if (!hasBadge) {
          await User.findByIdAndUpdate(user._id, {
            $push: {
              badges: {
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                earnedAt: new Date()
              }
            }
          });
        }
      }
    }
  }

  async checkDailyStreaks() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Reset streaks for users who didn't solve yesterday
      await User.updateMany(
        {
          'stats.lastSolveDate': { $lt: yesterday },
          'stats.streak': { $gt: 0 }
        },
        {
          $set: { 'stats.streak': 0 }
        }
      );
    } catch (error) {
      console.error('Error checking daily streaks:', error);
    }
  }
}

module.exports = new StreakService();