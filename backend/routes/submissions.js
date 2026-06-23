const express = require('express');
const axios = require('axios');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const streakService = require('../services/streakService');
const { auth } = require('../middleware/auth');
const { executeLocal } = require('../utils/localRunner');

const router = express.Router();

const LANGUAGE_MAP = {
  javascript: { name: 'javascript', extension: 'js' },
  python: { name: 'python', extension: 'py' },
  java: { name: 'java', extension: 'java' },
  cpp: { name: 'cpp', extension: 'cpp' },
};

async function executeCode(code, language, input = '') {
  // We try Piston only if it is explicitly configured in the environment.
  if (process.env.PISTON_URL) {
    try {
      const runtime = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;
      const { data } = await axios.post(process.env.PISTON_URL, {
        language: runtime.name,
        version: '*',
        files: [{ name: `main.${runtime.extension}`, content: code }],
        stdin: input || '',
      }, {
        timeout: 20000,
      });

      if (data && data.run) {
        return {
          stdout: data.run.stdout || '',
          stderr: data.run.stderr || '',
        };
      }
    } catch (err) {
      console.warn(`Piston API execution failed: ${err.message}. Falling back to container native execution...`);
    }
  }

  // Otherwise, compile and execute code natively inside the host/deployment container
  return await executeLocal(code, language, input);
}

function wrapCode(code, language, challengeTitle) {
  const targets = [
    "FizzBuzz", "Two Sum", "Reverse String", "Palindrome Number", "Valid Parentheses",
    "Merge Two Sorted Lists", "Binary Tree Inorder Traversal", "Maximum Subarray",
    "Longest Common Subsequence", "Word Ladder", "Median of Two Sorted Arrays", "N-Queens",
    "Find Maximum Number", "Count Vowels", "Binary Search", "Rotate Array",
    "Coin Change", "Longest Increasing Subsequence", "Edit Distance", "Sliding Window Maximum"
  ];
  if (!targets.includes(challengeTitle)) {
    return code;
  }

  if (language === 'python') {
    if (code.includes('sys.stdin') || code.includes('input(')) {
      return code;
    }
    return `from typing import List, Dict, Tuple, Optional, Set, Union\n\n${code}\n\n# --- Auto-generated Algonix Driver ---\nimport sys\nimport json\n\ndef run_algonix_solution():\n    target_func = None\n    func_names = [\n        'fizz_buzz', 'fizzBuzz', 'two_sum', 'twoSum', 'reverse_string', 'reverseString',\n        'is_palindrome', 'isPalindrome', 'is_valid', 'isValid', 'merge_two_lists', 'mergeTwoLists',\n        'inorder_traversal', 'inorderTraversal', 'max_subarray', 'maxSubArray',\n        'longest_common_subsequence', 'longestCommonSubsequence', 'ladder_length', 'ladderLength',\n        'find_median_sorted_arrays', 'findMedianSortedArrays', 'solve_n_queens', 'solveNQueens',\n        'find_max', 'findMax', 'count_vowels', 'countVowels', 'search', 'binary_search',\n        'rotate', 'coin_change', 'coinChange', 'length_of_lis', 'lengthOfLIS',\n        'min_distance', 'minDistance', 'max_sliding_window', 'maxSlidingWindow'\n    ]\n    for name in func_names:\n        if name in globals():\n            target_func = globals()[name]\n            break\n    if not target_func and 'Solution' in globals():\n        sol_inst = globals()['Solution']()\n        for name in func_names:\n            if hasattr(sol_inst, name):\n                target_func = getattr(sol_inst, name)\n                break\n    if not target_func:\n        return\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    title = "${challengeTitle}"\n    def parse_arr(s):\n        s = s.strip()\n        if s.startswith('[') and s.endswith(']'):\n            return json.loads(s)\n        return [int(x) for x in s.split() if x.strip() != '']\n    def format_res(res, title):\n        if res is None:\n            return ""\n        if title == "FizzBuzz" and isinstance(res, list):\n            return "\\n".join(map(str, res))\n        if title in ["Merge Two Sorted Lists", "Rotate Array", "Sliding Window Maximum"] and isinstance(res, list):\n            return " ".join(map(str, res))\n        if title == "Median of Two Sorted Arrays" and isinstance(res, (int, float)):\n            return f"{float(res):.5f}"\n        if isinstance(res, bool):\n            return str(res).lower()\n        if isinstance(res, list):\n            return json.dumps(res).replace(" ", "")\n        return str(res)\n    res = None\n    if title == "FizzBuzz":\n        res = target_func(int(lines[0]))\n    elif title == "Two Sum":\n        res = target_func(json.loads(lines[0]), int(lines[1]))\n    elif title == "Reverse String":\n        s = json.loads(lines[0])\n        res = target_func(s)\n        if res is None: res = s\n    elif title == "Palindrome Number":\n        res = target_func(int(lines[0]))\n    elif title == "Valid Parentheses":\n        res = target_func(lines[0].strip('"').strip("'"))\n    elif title == "Merge Two Sorted Lists":\n        res = target_func(parse_arr(lines[0]), parse_arr(lines[1]))\n    elif title == "Binary Tree Inorder Traversal":\n        vals = [None if x == 'null' else int(x) for x in lines[0].split()]\n        res = target_func(vals)\n    elif title == "Maximum Subarray":\n        res = target_func(parse_arr(lines[0]))\n    elif title == "Longest Common Subsequence":\n        res = target_func(lines[0], lines[1])\n    elif title == "Word Ladder":\n        res = target_func(lines[0], lines[1], lines[2].split())\n    elif title == "Median of Two Sorted Arrays":\n        res = target_func(parse_arr(lines[0]), parse_arr(lines[1]))\n    elif title == "N-Queens":\n        res = target_func(int(lines[0]))\n        if isinstance(res, list) and not isinstance(res[0], (int, str)):\n            res = len(res)\n    elif title == "Find Maximum Number":\n        res = target_func(parse_arr(lines[0]))\n    elif title == "Count Vowels":\n        res = target_func(lines[0].strip('"').strip("'"))\n    elif title == "Binary Search":\n        res = target_func(parse_arr(lines[0]), int(lines[1]))\n    elif title == "Rotate Array":\n        nums = parse_arr(lines[0])\n        res = target_func(nums, int(lines[1]))\n        if res is None: res = nums\n    elif title == "Coin Change":\n        res = target_func(parse_arr(lines[0]), int(lines[1]))\n    elif title == "Longest Increasing Subsequence":\n        res = target_func(parse_arr(lines[0]))\n    elif title == "Edit Distance":\n        res = target_func(lines[0], lines[1])\n    elif title == "Sliding Window Maximum":\n        res = target_func(parse_arr(lines[0]), int(lines[1]))\n    print(format_res(res, title))\nif __name__ == '__main__':\n    run_algonix_solution()\n`;
  }

  if (language === 'javascript') {
    if (code.includes('fs.readFileSync') || code.includes('process.stdin')) {
      return code;
    }
    return `${code}\n\n// --- Auto-generated Algonix Driver ---\nconst fs = require('fs');\ntry {\n  let targetFunc = null;\n  const funcs = ['twoSum', 'two_sum', 'reverseString', 'reverse_string', 'isPalindrome', 'is_palindrome', 'isValid', 'is_valid'];\n  for (const f of funcs) {\n    if (typeof global[f] === 'function') {\n      targetFunc = global[f];\n      break;\n    }\n    if (typeof eval(\`typeof \${f}\`) !== 'undefined') {\n      targetFunc = eval(f);\n      break;\n    }\n  }\n  if (targetFunc) {\n    const inputData = fs.readFileSync(0, 'utf-8').trim().split('\\n').map(line => line.trim());\n    if (inputData.length > 0 && inputData[0] !== '') {\n      const challengeTitle = "${challengeTitle}";\n      if (challengeTitle === "Two Sum") {\n        const nums = JSON.parse(inputData[0]);\n        const target = parseInt(inputData[1]);\n        const res = targetFunc(nums, target);\n        console.log(JSON.stringify(res));\n      } else if (challengeTitle === "Reverse String") {\n        const s = JSON.parse(inputData[0]);\n        const res = targetFunc(s);\n        if (res !== undefined) {\n          console.log(JSON.stringify(res));\n        } else {\n          console.log(JSON.stringify(s));\n        }\n      } else if (challengeTitle === "Palindrome Number") {\n        const x = parseInt(inputData[0]);\n        const res = targetFunc(x);\n        console.log(res.toString());\n      } else if (challengeTitle === "Valid Parentheses") {\n        let s = inputData[0];\n        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {\n          s = s.slice(1, -1);\n        }\n        const res = targetFunc(s);\n        console.log(res.toString());\n      }\n    }\n  }\n} catch (e) {}\n`;
  }

  if (language === 'cpp') {
    if (code.includes('int main(')) {
      return code;
    }
    const isSolutionClass = code.includes('class Solution');
    const header = isSolutionClass ? '#define SOLUTION_CLASS 1\n' : '';
    return `${header}${code}\n\n// --- Auto-generated Algonix Driver ---\n#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    string line1, line2;\n    if (!getline(cin, line1)) return 0;\n    string challengeTitle = "${challengeTitle}";\n    if (challengeTitle == "Two Sum") {\n        if (!getline(cin, line2)) return 0;\n        vector<int> nums;\n        string clean = "";\n        for (char c : line1) {\n            if (isdigit(c) || c == '-' || c == ',') clean += c;\n        }\n        stringstream ss(clean);\n        string item;\n        while (getline(ss, item, ',')) {\n            if (!item.empty()) nums.push_back(stoi(item));\n        }\n        int target = stoi(line2);\n        #ifdef SOLUTION_CLASS\n        Solution sol;\n        vector<int> res = sol.twoSum(nums, target);\n        #else\n        vector<int> res = twoSum(nums, target);\n        #endif\n        cout << "[" << res[0] << "," << res[1] << "]" << endl;\n    }\n    else if (challengeTitle == "Reverse String") {\n        vector<char> s;\n        for (char c : line1) {\n            if (c != '[' && c != ']' && c != ',' && c != '"' && c != '\\'') {\n                s.push_back(c);\n            }\n        }\n        #ifdef SOLUTION_CLASS\n        Solution sol;\n        sol.reverseString(s);\n        #else\n        reverseString(s);\n        #endif\n        cout << "[";\n        for (size_t i = 0; i < s.size(); ++i) {\n            cout << "\\"" << s[i] << "\\"";\n            if (i < s.size() - 1) cout << ",";\n        }\n        cout << "]" << endl;\n    }\n    else if (challengeTitle == "Palindrome Number") {\n        int x = stoi(line1);\n        #ifdef SOLUTION_CLASS\n        Solution sol;\n        bool res = sol.isPalindrome(x);\n        #else\n        bool res = isPalindrome(x);\n        #endif\n        cout << (res ? "true" : "false") << endl;\n    }\n    else if (challengeTitle == "Valid Parentheses") {\n        string s = "";\n        for (char c : line1) {\n            if (c != '"' && c != '\\'') s += c;\n        }\n        #ifdef SOLUTION_CLASS\n        Solution sol;\n        bool res = sol.isValid(s);\n        #else\n        bool res = isValid(s);\n        #endif\n        cout << (res ? "true" : "false") << endl;\n    }\n    return 0;\n}\n`;
  }

  if (language === 'java') {
    if (code.includes('public static void main(')) {
      return code;
    }
    let wrappedCode = code;
    if (!code.includes('class Solution')) {
      wrappedCode = `class Solution {\n${code}\n}`;
    }
    return `${wrappedCode}\n\n// --- Auto-generated Algonix Driver ---\nimport java.io.BufferedReader;\nimport java.io.InputStreamReader;\nimport java.util.*;\n\nclass Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        if (line1 == null) return;\n        String challengeTitle = "${challengeTitle}";\n        Solution sol = new Solution();\n        if (challengeTitle.equals("Two Sum")) {\n            String line2 = br.readLine();\n            if (line2 == null) return;\n            String clean = line1.replaceAll("[\\\\[\\\\]\\\\s]", "");\n            String[] parts = clean.split(",");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) {\n                nums[i] = Integer.parseInt(parts[i]);\n            }\n            int target = Integer.parseInt(line2.trim());\n            int[] res = sol.twoSum(nums, target);\n            System.out.println("[" + res[0] + "," + res[1] + "]");\n        } else if (challengeTitle.equals("Reverse String")) {\n            String clean = line1.replaceAll("[\\\\[\\\\]\\\\\\"\\\\'\\\\s]", "");\n            char[] s = new char[clean.length()];\n            for (int i = 0; i < clean.length(); i++) {\n                s[i] = clean.charAt(i);\n            }\n            sol.reverseString(s);\n            StringBuilder sb = new StringBuilder();\n            sb.append("[");\n            for (int i = 0; i < s.length; i++) {\n                sb.append("\\"").append(s[i]).append("\\"");\n                if (i < s.length - 1) sb.append(",");\n            }\n            sb.append("]");\n            System.out.println(sb.toString());\n        } else if (challengeTitle.equals("Palindrome Number")) {\n            int x = Integer.parseInt(line1.trim());\n            boolean res = sol.isPalindrome(x);\n            System.out.println(res);\n        } else if (challengeTitle.equals("Valid Parentheses")) {\n            String s = line1.replaceAll("[\\"']", "").trim();\n            boolean res = sol.isValid(s);\n            System.out.println(res);\n        }\n    }\n}\n`;
  }

  return code;
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

    const wrappedUserCode = wrapCode(code, language, challenge.title);

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      try {
        const result = await executeCode(wrappedUserCode, language, tc.input || '');
        const stdout = result.stdout || '';
        const stderr = result.stderr || '';

        const actual = stdout.replace(/\r\n/g, '\n').trim();
        const expected = (tc.expectedOutput || tc.output || '').replace(/\r\n/g, '\n').trim();

        let status = 'Wrong Answer';
        let passed = false;
        let error = stderr.trim() || undefined;

        if (stderr.trim() !== '') {
          status = 'Runtime Error';
        } else if (actual === '') {
          status = 'Wrong Answer';
          error = 'No output produced by code';
        } else if (actual === expected) {
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
