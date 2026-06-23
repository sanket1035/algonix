const express = require('express');
const axios = require('axios');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const streakService = require('../services/streakService');
const { auth } = require('../middleware/auth');

const router = express.Router();

const LANGUAGE_MAP = {
  javascript: { name: 'javascript', extension: 'js' },
  python: { name: 'python', extension: 'py' },
  java: { name: 'java', extension: 'java' },
  cpp: { name: 'cpp', extension: 'cpp' },
};

async function executeCode(code, language) {
  const token = process.env.GLOT_TOKEN || process.env.GLOT_API_TOKEN;

  // 1. If GLOT_TOKEN is configured (Production/Render), use Glot API
  if (token) {
    const runtime = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;
    const { data } = await axios.post(`https://run.glot.io/languages/${runtime.name}/latest`, {
      files: [{ name: `main.${runtime.extension}`, content: code }]
    }, {
      timeout: 20000,
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!data) {
      throw new Error('Unexpected Glot response');
    }

    return {
      stdout: data.stdout || '',
      stderr: data.stderr || data.error || '',
    };
  }

  // 2. If no GLOT_TOKEN is set (Local Development), fall back to local Piston container
  const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000/api/v2/execute';
  const runtime = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;
  const { data } = await axios.post(PISTON_URL, {
    language: runtime.name,
    version: '*',
    files: [{ name: `main.${runtime.extension}`, content: code }],
  }, {
    timeout: 20000,
  });

  if (!data || !data.run) {
    throw new Error('Unexpected Piston response');
  }

  return {
    stdout: data.run.stdout || '',
    stderr: data.run.stderr || '',
  };
}

router.post('/', auth, async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Code cannot be empty' });
    }

    const codeWithoutComments = code
      .replace(/\/\/.*$/gm, '')
      .replace(/#.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//gm, '')
      .replace(/\s+/g, '');

    if (!codeWithoutComments || ['pass', 'return', 'return;', 'thrownewError', 'thrownewError();'].includes(codeWithoutComments)) {
      return res.status(400).json({ message: 'Code cannot be blank or just placeholder logic.' });
    }

    if (code.length > 10000) {
      return res.status(400).json({ message: 'Code is too long. Maximum 10KB allowed.' });
    }

    if (!['javascript', 'python', 'java', 'cpp'].includes(language)) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const user = req.user;
    const isUnlocked = user.unlockedChallenges.includes(challenge._id) ||
                      challenge.fastTrackUnlock ||
                      challenge.difficulty === 'Beginner' ||
                      user.solvedChallenges.some(solvedId =>
                        challenge.prerequisites.includes(solvedId)
                      );

    if (!isUnlocked) {
      return res.status(403).json({ message: 'Challenge not unlocked' });
    }

    const visibleTestCases = challenge.testCases.filter(tc => !tc.isHidden);
    const testCasesToRun = visibleTestCases.length > 0 ? visibleTestCases : challenge.testCases;

    let testResults = [];
    let allPassed = true;
    let judgeServiceUnavailable = false;
    let executionErrorMessage = null;

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      try {
        const result = await executeCode(code, language);
        const stdout = result.stdout || '';
        const stderr = result.stderr || '';

        const actual = stdout.trim();
        const expected = (tc.output || '').trim();

        let status = 'Wrong Answer';
        let passed = false;
        let error = stderr.trim() || undefined;

        if (stderr.trim() !== '') {
          status = 'Runtime Error';
        } else if (stdout.trim() === '') {
          status = 'Wrong Answer';
          error = 'No output produced by code';
        } else if (stdout.trim() === expected) {
          status = 'Accepted';
          passed = true;
        }

        if (!passed) allPassed = false;

        testResults.push({
          testCase: i + 1,
          status,
          executionTime: 0,
          memoryUsed: 0,
          passed,
          actual,
          expected,
          error,
        });
      } catch (e) {
        const errorMessage = e.response?.data?.message || e.message;
        console.error('Code execution request failed for submission:', {
          challengeId,
          language,
          testCase: i + 1,
          error: errorMessage,
          stack: e.stack,
          responseData: e.response?.data,
          responseStatus: e.response?.status,
        });
        allPassed = false;
        judgeServiceUnavailable = true;
        executionErrorMessage = executionErrorMessage || errorMessage;
        testResults.push({
          testCase: i + 1,
          status: 'Error',
          passed: false,
          executionTime: 0,
          memoryUsed: 0,
          error: errorMessage,
        });
      }
    }

    const correct = allPassed && !judgeServiceUnavailable;
    const message = allPassed
      ? 'Accepted'
      : judgeServiceUnavailable
      ? (executionErrorMessage || 'Judge service unavailable')
      : 'Wrong Answer';
    const status = allPassed ? 'Accepted' : 'Wrong Answer';
    const score = allPassed ? 100 : Math.round((testResults.filter(t => t.passed).length / testResults.length) * 100);
    const pointsEarned = allPassed ? challenge.points : 0;

    // Update user progress only if accepted and not already solved
    if (allPassed) {
      const user = await User.findById(req.user._id);
      if (!user.solvedChallenges.map(id => id.toString()).includes(challengeId)) {
        const newTotalPoints = user.stats.totalPoints + pointsEarned;
        let newLevel = 1;
        if (newTotalPoints >= 900) newLevel = 4;
        else if (newTotalPoints >= 550) newLevel = 3;
        else if (newTotalPoints >= 150) newLevel = 2;

        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { solvedChallenges: challengeId },
          $inc: { 'stats.totalPoints': pointsEarned, 'stats.weeklyPoints': pointsEarned, 'stats.solvedProblems': 1 },
          $set: { 'stats.level': newLevel },
        });

        await streakService.updateStreak(req.user._id);
        const updatedUser = await User.findById(req.user._id);
        await streakService.checkProblemSolverBadges(updatedUser);

        // Unlock next difficulty
        const unlockDifficulty = newLevel === 2 ? 'Intermediate' : newLevel === 3 ? 'Advanced' : newLevel === 4 ? 'Expert' : null;
        if (unlockDifficulty) {
          const toUnlock = await Challenge.find({ difficulty: unlockDifficulty, isActive: true }).select('_id');
          await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { unlockedChallenges: { $each: toUnlock.map(c => c._id) } },
          });
        }
      }
    }

    const submission = await Submission.create({
      user: req.user._id,
      challenge: challengeId,
      code,
      language,
      status,
      testResults,
      pointsEarned,
      score,
    });

    res.json({ submissionId: submission._id, status, message, correct, score, pointsEarned, testResults, judgeServiceUnavailable });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user submissions
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const submissions = await Submission.find({ user: req.user._id })
      .populate('challenge', 'title difficulty points')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Submission.countDocuments({ user: req.user._id });
    res.json({ submissions, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get submission details
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, user: req.user._id })
      .populate('challenge', 'title difficulty points');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
