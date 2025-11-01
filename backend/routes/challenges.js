const express = require('express');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all challenges with user progress
router.get('/', auth, async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    const filter = { isActive: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const challenges = await Challenge.find(filter).sort({ order: 1, difficulty: 1 });
    const user = await User.findById(req.user._id);

    const challengesWithProgress = challenges.map(challenge => ({
      ...challenge.toObject(),
      isSolved: user.solvedChallenges.includes(challenge._id),
      isUnlocked: user.unlockedChallenges.includes(challenge._id) || 
                  challenge.fastTrackUnlock ||
                  user.solvedChallenges.some(solvedId => 
                    challenge.prerequisites.includes(solvedId)
                  )
    }));

    res.json(challengesWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single challenge
router.get('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const user = await User.findById(req.user._id);
    const isUnlocked = user.unlockedChallenges.includes(challenge._id) || 
                      challenge.fastTrackUnlock ||
                      user.solvedChallenges.some(solvedId => 
                        challenge.prerequisites.includes(solvedId)
                      );

    if (!isUnlocked) {
      return res.status(403).json({ message: 'Challenge not unlocked' });
    }

    // Hide hidden test cases from response
    const challengeData = challenge.toObject();
    challengeData.testCases = challengeData.testCases.filter(tc => !tc.isHidden);

    res.json({
      ...challengeData,
      isSolved: user.solvedChallenges.includes(challenge._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fast-track skill test
router.post('/skill-test', auth, async (req, res) => {
  try {
    const { difficulty } = req.body;
    
    // MCQ questions based on difficulty
    const mcqQuestions = {
      'Beginner': [
        {
          question: "What is the time complexity of accessing an element in an array by index?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
          correct: 0
        },
        {
          question: "Which data structure follows LIFO (Last In First Out) principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correct: 1
        },
        {
          question: "What does 'null' represent in programming?",
          options: ["Zero", "Empty string", "No value/reference", "False"],
          correct: 2
        },
        {
          question: "What is the result of 5 % 3 in most programming languages?",
          options: ["1", "2", "0", "5"],
          correct: 1
        },
        {
          question: "Which loop is guaranteed to execute at least once?",
          options: ["for loop", "while loop", "do-while loop", "foreach loop"],
          correct: 2
        }
      ],
      'Intermediate': [
        {
          question: "What is the average time complexity of QuickSort?",
          options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
          correct: 1
        },
        {
          question: "Which traversal visits nodes in ascending order in a BST?",
          options: ["Preorder", "Postorder", "Inorder", "Level order"],
          correct: 2
        },
        {
          question: "What is dynamic programming?",
          options: ["Runtime code generation", "Optimization technique using memoization", "Object-oriented programming", "Parallel programming"],
          correct: 1
        },
        {
          question: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
          correct: 1
        },
        {
          question: "Which data structure is used for BFS traversal?",
          options: ["Stack", "Queue", "Priority Queue", "Hash Table"],
          correct: 1
        }
      ],
      'Advanced': [
        {
          question: "What is the space complexity of merge sort?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correct: 2
        },
        {
          question: "Which algorithm is used to find shortest path in weighted graphs?",
          options: ["BFS", "DFS", "Dijkstra's", "Binary Search"],
          correct: 2
        },
        {
          question: "What is the purpose of hashing?",
          options: ["Sorting data", "Fast data retrieval", "Data compression", "Memory allocation"],
          correct: 1
        }
      ],
      'Expert': [
        {
          question: "What is the time complexity of building a suffix array?",
          options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
          correct: 1
        },
        {
          question: "Which data structure is used in Dijkstra's algorithm for efficiency?",
          options: ["Stack", "Queue", "Priority Queue", "Hash Table"],
          correct: 2
        },
        {
          question: "What is the maximum flow problem?",
          options: ["Finding shortest path", "Maximum capacity flow in network", "Sorting algorithm", "Tree traversal"],
          correct: 1
        }
      ]
    };

    const questions = mcqQuestions[difficulty] || mcqQuestions['Beginner'];
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;