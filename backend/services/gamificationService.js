const User = require('../models/User');
const Challenge = require('../models/Challenge');

class GamificationService {
  constructor() {
    this.badges = {
      FIRST_SOLVE: {
        name: 'First Solve',
        description: 'Solved your first problem',
        icon: '🎯'
      },
      DAILY_STREAK_7: {
        name: 'Week Warrior',
        description: 'Solved problems for 7 consecutive days',
        icon: '🔥'
      },
      DAILY_STREAK_30: {
        name: 'Month Master',
        description: 'Solved problems for 30 consecutive days',
        icon: '🏆'
      },
      PROBLEM_SLAYER_10: {
        name: 'Problem Slayer',
        description: 'Solved 10 problems',
        icon: '⚔️'
      },
      PROBLEM_SLAYER_50: {
        name: 'Problem Destroyer',
        description: 'Solved 50 problems',
        icon: '🗡️'
      },
      PROBLEM_SLAYER_100: {
        name: 'Problem Annihilator',
        description: 'Solved 100 problems',
        icon: '💀'
      },
      SPEED_DEMON: {
        name: 'Speed Demon',
        description: 'Solved a problem in under 5 minutes',
        icon: '⚡'
      },
      PERFECTIONIST: {
        name: 'Perfectionist',
        description: 'Solved 10 problems on first try',
        icon: '💎'
      }
    };

    this.levelThresholds = [
      0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000
    ];
  }

  async handleSolve(userId, challenge) {
    const user = await User.findById(userId);
    const solveTime = new Date();
    
    // Update streak
    await this.updateStreak(user, solveTime);
    
    // Check for new badges
    await this.checkBadges(user, challenge, solveTime);
    
    // Update level
    await this.updateLevel(user);
    
    // Check for certificates
    await this.checkCertificates(user);
  }

  async updateStreak(user, solveTime) {
    const lastSolve = user.stats.lastSolveDate;
    const today = new Date(solveTime.getFullYear(), solveTime.getMonth(), solveTime.getDate());
    
    if (!lastSolve) {
      user.stats.streak = 1;
    } else {
      const lastSolveDay = new Date(lastSolve.getFullYear(), lastSolve.getMonth(), lastSolve.getDate());
      const daysDiff = Math.floor((today - lastSolveDay) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        user.stats.streak += 1;
      } else if (daysDiff > 1) {
        user.stats.streak = 1;
      }
      // If daysDiff === 0, streak remains the same (same day)
    }
    
    user.stats.lastSolveDate = solveTime;
    await user.save();
  }

  async checkBadges(user, challenge, solveTime) {
    const newBadges = [];
    const existingBadgeNames = user.badges.map(b => b.name);

    // First solve badge
    if (user.stats.solvedProblems === 1 && !existingBadgeNames.includes('First Solve')) {
      newBadges.push(this.badges.FIRST_SOLVE);
    }

    // Streak badges
    if (user.stats.streak >= 7 && !existingBadgeNames.includes('Week Warrior')) {
      newBadges.push(this.badges.DAILY_STREAK_7);
    }
    if (user.stats.streak >= 30 && !existingBadgeNames.includes('Month Master')) {
      newBadges.push(this.badges.DAILY_STREAK_30);
    }

    // Problem count badges
    if (user.stats.solvedProblems >= 10 && !existingBadgeNames.includes('Problem Slayer')) {
      newBadges.push(this.badges.PROBLEM_SLAYER_10);
    }
    if (user.stats.solvedProblems >= 50 && !existingBadgeNames.includes('Problem Destroyer')) {
      newBadges.push(this.badges.PROBLEM_SLAYER_50);
    }
    if (user.stats.solvedProblems >= 100 && !existingBadgeNames.includes('Problem Annihilator')) {
      newBadges.push(this.badges.PROBLEM_SLAYER_100);
    }

    // Add new badges
    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(user._id, {
        $push: { badges: { $each: newBadges } }
      });
    }

    return newBadges;
  }

  async updateLevel(user) {
    const currentPoints = user.stats.totalPoints;
    let newLevel = 1;

    for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
      if (currentPoints >= this.levelThresholds[i]) {
        newLevel = i + 1;
        break;
      }
    }

    if (newLevel !== user.stats.level) {
      await User.findByIdAndUpdate(user._id, {
        'stats.level': newLevel
      });
      return newLevel;
    }

    return user.stats.level;
  }

  async checkCertificates(user) {
    const certificates = [];
    const existingCerts = user.certificates.map(c => c.name);

    // Beginner certificate (10 beginner problems)
    if (!existingCerts.includes('Beginner Mastery')) {
      const beginnerCount = await Challenge.countDocuments({
        _id: { $in: user.solvedChallenges },
        difficulty: 'Beginner'
      });
      
      if (beginnerCount >= 10) {
        certificates.push({
          name: 'Beginner Mastery',
          level: 'Beginner',
          earnedAt: new Date()
        });
      }
    }

    // Intermediate certificate (15 intermediate problems)
    if (!existingCerts.includes('Intermediate Mastery')) {
      const intermediateCount = await Challenge.countDocuments({
        _id: { $in: user.solvedChallenges },
        difficulty: 'Intermediate'
      });
      
      if (intermediateCount >= 15) {
        certificates.push({
          name: 'Intermediate Mastery',
          level: 'Intermediate',
          earnedAt: new Date()
        });
      }
    }

    // Advanced certificate (20 advanced problems)
    if (!existingCerts.includes('Advanced Mastery')) {
      const advancedCount = await Challenge.countDocuments({
        _id: { $in: user.solvedChallenges },
        difficulty: 'Advanced'
      });
      
      if (advancedCount >= 20) {
        certificates.push({
          name: 'Advanced Mastery',
          level: 'Advanced',
          earnedAt: new Date()
        });
      }
    }

    if (certificates.length > 0) {
      await User.findByIdAndUpdate(user._id, {
        $push: { certificates: { $each: certificates } }
      });
    }

    return certificates;
  }

  getPointsForNextLevel(currentPoints) {
    for (let i = 0; i < this.levelThresholds.length; i++) {
      if (currentPoints < this.levelThresholds[i]) {
        return this.levelThresholds[i] - currentPoints;
      }
    }
    return 0; // Max level reached
  }
}

module.exports = new GamificationService();