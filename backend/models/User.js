const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  stats: {
    totalPoints: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    solvedProblems: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastSolveDate: Date
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  certificates: [{
    name: String,
    level: String,
    earnedAt: { type: Date, default: Date.now },
    pdfUrl: String
  }],
  solvedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  unlockedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);