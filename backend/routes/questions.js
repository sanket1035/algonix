const express = require('express');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all MCQ questions
router.get('/', adminAuth, async (req, res) => {
  try {
    const mcqQuestions = {
      'Beginner': [
        {
          id: 1,
          question: "What is the time complexity of accessing an element in an array by index?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
          correct: 0,
          explanation: "Array access by index is constant time O(1)"
        },
        {
          id: 2,
          question: "Which data structure follows LIFO (Last In First Out) principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correct: 1,
          explanation: "Stack follows LIFO principle"
        },
        {
          id: 3,
          question: "What does 'null' represent in programming?",
          options: ["Zero", "Empty string", "No value/reference", "False"],
          correct: 2,
          explanation: "Null represents absence of value or reference"
        }
      ],
      'Intermediate': [
        {
          id: 4,
          question: "What is the average time complexity of QuickSort?",
          options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
          correct: 1,
          explanation: "QuickSort has average time complexity of O(n log n)"
        },
        {
          id: 5,
          question: "Which traversal visits nodes in ascending order in a BST?",
          options: ["Preorder", "Postorder", "Inorder", "Level order"],
          correct: 2,
          explanation: "Inorder traversal of BST gives nodes in ascending order"
        },
        {
          id: 6,
          question: "What is dynamic programming?",
          options: ["Runtime code generation", "Optimization technique using memoization", "Object-oriented programming", "Parallel programming"],
          correct: 1,
          explanation: "Dynamic programming uses memoization to optimize recursive solutions"
        }
      ],
      'Advanced': [
        {
          id: 7,
          question: "What is the space complexity of merge sort?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correct: 2,
          explanation: "Merge sort requires O(n) extra space for merging"
        },
        {
          id: 8,
          question: "Which algorithm is used to find shortest path in weighted graphs?",
          options: ["BFS", "DFS", "Dijkstra's", "Binary Search"],
          correct: 2,
          explanation: "Dijkstra's algorithm finds shortest path in weighted graphs"
        },
        {
          id: 9,
          question: "What is the purpose of hashing?",
          options: ["Sorting data", "Fast data retrieval", "Data compression", "Memory allocation"],
          correct: 1,
          explanation: "Hashing provides fast O(1) average case data retrieval"
        }
      ],
      'Expert': [
        {
          id: 10,
          question: "What is the time complexity of building a suffix array?",
          options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
          correct: 1,
          explanation: "Suffix array can be built in O(n log n) time"
        },
        {
          id: 11,
          question: "Which data structure is used in Dijkstra's algorithm for efficiency?",
          options: ["Stack", "Queue", "Priority Queue", "Hash Table"],
          correct: 2,
          explanation: "Priority queue (min-heap) is used for efficient implementation"
        },
        {
          id: 12,
          question: "What is the maximum flow problem?",
          options: ["Finding shortest path", "Maximum capacity flow in network", "Sorting algorithm", "Tree traversal"],
          correct: 1,
          explanation: "Maximum flow finds the maximum flow capacity in a flow network"
        }
      ]
    };

    res.json(mcqQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;