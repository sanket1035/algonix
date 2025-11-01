const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get weekly leaderboard
router.get('/weekly', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const leaderboard = await User.find({ 'stats.weeklyPoints': { $gt: 0 } })
      .select('username profile.firstName profile.lastName profile.avatar stats.weeklyPoints stats.level')
      .sort({ 'stats.weeklyPoints': -1, 'stats.totalPoints': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: (page - 1) * limit + index + 1
    }));

    // Get current user's rank
    const currentUserRank = await User.countDocuments({
      'stats.weeklyPoints': { $gt: req.user.stats.weeklyPoints }
    }) + 1;

    res.json({
      leaderboard: rankedLeaderboard,
      currentUserRank,
      totalUsers: await User.countDocuments({ 'stats.weeklyPoints': { $gt: 0 } })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all-time leaderboard
router.get('/all-time', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const leaderboard = await User.find({ 'stats.totalPoints': { $gt: 0 } })
      .select('username profile.firstName profile.lastName profile.avatar stats.totalPoints stats.level stats.solvedProblems')
      .sort({ 'stats.totalPoints': -1, 'stats.solvedProblems': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: (page - 1) * limit + index + 1
    }));

    const currentUserRank = await User.countDocuments({
      'stats.totalPoints': { $gt: req.user.stats.totalPoints }
    }) + 1;

    res.json({
      leaderboard: rankedLeaderboard,
      currentUserRank,
      totalUsers: await User.countDocuments({ 'stats.totalPoints': { $gt: 0 } })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's position and nearby users
router.get('/around-me', auth, async (req, res) => {
  try {
    const { type = 'weekly' } = req.query;
    const pointsField = type === 'weekly' ? 'stats.weeklyPoints' : 'stats.totalPoints';
    
    const currentUserPoints = req.user.stats[type === 'weekly' ? 'weeklyPoints' : 'totalPoints'];
    
    // Get users above current user
    const usersAbove = await User.find({ [pointsField]: { $gt: currentUserPoints } })
      .select('username profile.firstName profile.lastName profile.avatar stats')
      .sort({ [pointsField]: 1 })
      .limit(5);

    // Get users below current user
    const usersBelow = await User.find({ [pointsField]: { $lt: currentUserPoints } })
      .select('username profile.firstName profile.lastName profile.avatar stats')
      .sort({ [pointsField]: -1 })
      .limit(5);

    // Get current user rank
    const currentUserRank = await User.countDocuments({
      [pointsField]: { $gt: currentUserPoints }
    }) + 1;

    res.json({
      usersAbove: usersAbove.reverse(),
      currentUser: {
        ...req.user.toObject(),
        rank: currentUserRank
      },
      usersBelow
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;