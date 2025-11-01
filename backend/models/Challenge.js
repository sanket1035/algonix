const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true 
  },
  category: String,
  points: { type: Number, required: true },
  timeLimit: { type: Number, default: 60 }, // seconds
  memoryLimit: { type: Number, default: 128 }, // MB
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  constraints: String,
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  tags: [String],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  fastTrackUnlock: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);