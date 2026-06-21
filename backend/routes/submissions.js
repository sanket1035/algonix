const express = require('express');
const axios = require('axios');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const streakService = require('../services/streakService');
const { auth } = require('../middleware/auth');

const router = express.Router();

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

async function runOnJudge0(code, languageId, input) {
  const url = `${process.env.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`;
  const { data } = await axios.post(url, {
    source_code: code,
    language_id: languageId,
    stdin: input,
  }, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
  return data;
}

function normalizeOutput(str) {
  return (str || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

router.post('/', auth, async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Code cannot be empty' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const languageId = LANGUAGE_IDS[language] || 63;
    const visibleTestCases = challenge.testCases.filter(tc => !tc.isHidden);
    const testCasesToRun = visibleTestCases.length > 0 ? visibleTestCases : challenge.testCases;

    let testResults = [];
    let allPassed = true;

    // Try Judge0, fall back to basic check if API key missing
    if (process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY !== 'your_rapidapi_key_here') {
      for (let i = 0; i < testCasesToRun.length; i++) {
        const tc = testCasesToRun[i];
        try {
          const result = await runOnJudge0(code, languageId, tc.input || '');
          const actual = normalizeOutput(result.stdout);
          const expected = normalizeOutput(tc.expectedOutput);
          const passed = result.status?.id === 3 && actual === expected;
          if (!passed) allPassed = false;

          testResults.push({
            testCase: i + 1,
            status: passed ? 'Accepted' : (result.status?.description || 'Wrong Answer'),
            executionTime: parseFloat(result.time) || 0,
            memoryUsed: result.memory || 0,
            passed,
            actual: passed ? undefined : actual,
            expected: passed ? undefined : expected,
            error: result.stderr || result.compile_output || undefined,
          });
        } catch (e) {
          allPassed = false;
          testResults.push({ testCase: i + 1, status: 'Error', passed: false, error: e.message });
        }
      }
    } else {
      // No Judge0 key — do not mark code as correct without actual execution
      const reason = 'Judge service unavailable';
      console.warn('Judge0 API key missing: unable to verify submission.');
      allPassed = false;
      testResults = testCasesToRun.map((_, i) => ({
        testCase: i + 1,
        status: 'Wrong Answer',
        passed: false,
        executionTime: 0,
        memoryUsed: 0,
        error: reason,
      }));
    }

    const judgeServiceUnavailable = !(process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY !== 'your_rapidapi_key_here');
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

    res.json({ submissionId: submission._id, status, score, pointsEarned, testResults, judgeServiceUnavailable });

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
