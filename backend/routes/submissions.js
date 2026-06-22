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

const LANGUAGE_VERSIONS = {
  javascript: '18.15.0',
  python: '3.10.0',
  java: '15.0.2',
  cpp: '10.2.0',
};

const GLOT_API_URL = process.env.GLOT_API_URL || 'https://glot.io/api/run';
const GLOT_API_TOKEN = process.env.GLOT_API_TOKEN;
const PISTON_EXECUTE_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';

async function runGlot(code, language, input) {
  const runtime = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;
  if (!GLOT_API_TOKEN) {
    throw new Error('GLOT_API_TOKEN is not configured');
  }

  const { data } = await axios.post(`${GLOT_API_URL}/${runtime.name}/latest`, {
    files: [{ name: `main.${runtime.extension}`, content: code }],
    stdin: input || '',
  }, {
    timeout: 20000,
    headers: {
      Authorization: `Token ${GLOT_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!data) {
    throw new Error('Unexpected Glot response');
  }

  return {
    stdout: data.stdout || '',
    stderr: data.stderr || data.error || '',
    code: typeof data.exitCode === 'number' ? data.exitCode : (data.error ? 1 : 0),
    output: data.stdout || '',
  };
}

async function runPiston(code, language, input) {
  const runtime = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;

  const { data } = await axios.post(PISTON_EXECUTE_URL, {
    language: runtime.name,
    version: LANGUAGE_VERSIONS[language] || '*',
    files: [{ name: `Main.${runtime.extension}`, content: code }],
    stdin: input || '',
  }, {
    timeout: 20000,
  });

  if (!data || !data.run) {
    throw new Error('Unexpected Piston response');
  }

  return {
    stdout: data.run.stdout,
    stderr: data.run.stderr,
    code: data.run.code,
    output: data.run.output,
  };
}

async function runCodeExecution(code, language, input) {
  if (GLOT_API_TOKEN) {
    return runGlot(code, language, input);
  }
  return runPiston(code, language, input);
}

function normalizeOutput(str) {
  return (str || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function parseOutput(value) {
  const normalized = normalizeOutput(value);
  try {
    return JSON.parse(normalized);
  } catch {
    return normalized;
  }
}

function compareOutputs(actualRaw, expectedRaw) {
  const actual = parseOutput(actualRaw);
  const expected = parseOutput(expectedRaw);

  if (typeof actual === 'string' && typeof expected === 'string') {
    if (actual === expected) return true;
    const whitespaceNormalizedActual = actual.replace(/\s+/g, ' ').trim();
    const whitespaceNormalizedExpected = expected.replace(/\s+/g, ' ').trim();
    return whitespaceNormalizedActual === whitespaceNormalizedExpected;
  }

  if (typeof actual === 'boolean' && typeof expected === 'boolean') {
    return actual === expected;
  }

  if (typeof actual === 'number' && typeof expected === 'number') {
    return actual === expected;
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    return actual.every((item, idx) => JSON.stringify(item) === JSON.stringify(expected[idx]));
  }

  if (actual && expected && typeof actual === 'object' && typeof expected === 'object') {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  return actual === expected;
}

router.post('/', auth, async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Code cannot be empty' });
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

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      try {
        const result = await runCodeExecution(code, language, tc.input || '');
        const actual = normalizeOutput(result.stdout || result.output);
        const expected = normalizeOutput(tc.expectedOutput || tc.output);
        const passed = (result.code === 0 || result.code === undefined) && compareOutputs(actual, expected);
        if (!passed) allPassed = false;

        testResults.push({
          testCase: i + 1,
          status: passed ? 'Accepted' : (result.stderr ? 'Runtime Error' : 'Wrong Answer'),
          executionTime: 0,
          memoryUsed: 0,
          passed,
          actual,
          expected,
          error: result.stderr || undefined,
        });
      } catch (e) {
        console.error('Code execution request failed for submission:', {
          challengeId,
          language,
          testCase: i + 1,
          error: e.message,
          stack: e.stack,
          responseData: e.response?.data,
          responseStatus: e.response?.status,
        });
        allPassed = false;
        judgeServiceUnavailable = true;
        testResults.push({
          testCase: i + 1,
          status: 'Error',
          passed: false,
          executionTime: 0,
          memoryUsed: 0,
          error: e.response?.data?.message || e.message,
        });
      }
    }
    const correct = allPassed && !judgeServiceUnavailable;
    const message = allPassed
      ? 'Accepted'
      : judgeServiceUnavailable
      ? 'Judge service unavailable'
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
