const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');
require('dotenv').config();

const sampleChallenges = [
  {
    "title": "FizzBuzz",
    "description": "Write a program that outputs the string representation of numbers from 1 to n. But for multiples of three it should output 'Fizz' instead of the number and for the multiples of five output 'Buzz'. For numbers which are multiples of both three and five output 'FizzBuzz'.",
    "difficulty": "Beginner",
    "category": "Logic",
    "points": 50,
    "timeLimit": 30,
    "memoryLimit": 64,
    "constraints": "1 <= n <= 10^4",
    "examples": [
      {
        "input": "n = 3",
        "output": "[\"1\",\"2\",\"Fizz\"]",
        "explanation": "For n=3, output 1, 2, Fizz"
      }
    ],
    "testCases": [
      {
        "input": "3",
        "expectedOutput": "1\n2\nFizz",
        "isHidden": false
      },
      {
        "input": "5",
        "expectedOutput": "1\n2\nFizz\n4\nBuzz",
        "isHidden": true
      }
    ],
    "starterCode": {
      "javascript": "var fizzBuzz = function(n) {\n    \n};",
      "python": "class Solution:\n    def fizzBuzz(self, n: int) -> List[str]:\n        pass",
      "cpp": "class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        \n    }\n};",
      "java": "class Solution {\n    public List<String> fizzBuzz(int n) {\n        \n    }\n}"
    },
    "tags": [
      "logic",
      "array"
    ],
    "order": 0,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": true
  },
  {
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "Beginner",
    "category": "Array",
    "points": 100,
    "timeLimit": 60,
    "memoryLimit": 128,
    "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    "testCases": [
      {
        "input": "[2,7,11,15]\n9",
        "expectedOutput": "[0,1]",
        "isHidden": false
      },
      {
        "input": "[3,2,4]\n6",
        "expectedOutput": "[1,2]",
        "isHidden": true
      }
    ],
    "starterCode": {
      "javascript": "var twoSum = function(nums, target) {\n    \n};",
      "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}"
    },
    "tags": [
      "array",
      "hash-table"
    ],
    "order": 1,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": true
  },
  {
    "title": "Reverse String",
    "description": "Write a function that reverses a string. The input string is given as an array of characters s.",
    "difficulty": "Beginner",
    "category": "String",
    "points": 80,
    "timeLimit": 30,
    "memoryLimit": 64,
    "constraints": "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",
    "examples": [
      {
        "input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]",
        "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]",
        "explanation": "Reverse the array of characters in-place."
      }
    ],
    "testCases": [
      {
        "input": "[\"h\",\"e\",\"l\",\"l\",\"o\"]",
        "expectedOutput": "[\"o\",\"l\",\"l\",\"e\",\"h\"]",
        "isHidden": false
      },
      {
        "input": "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]",
        "expectedOutput": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]",
        "isHidden": true
      }
    ],
    "starterCode": {
      "javascript": "var reverseString = function(s) {\n    \n};",
      "python": "class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        pass",
      "cpp": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};",
      "java": "class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}"
    },
    "tags": [
      "string",
      "two-pointers"
    ],
    "order": 2,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": true
  },
  {
    "title": "Palindrome Number",
    "description": "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
    "difficulty": "Beginner",
    "category": "Math",
    "points": 120,
    "timeLimit": 45,
    "memoryLimit": 64,
    "constraints": "-2^31 <= x <= 2^31 - 1",
    "examples": [
      {
        "input": "x = 121",
        "output": "true",
        "explanation": "121 reads as 121 from left to right and from right to left."
      }
    ],
    "testCases": [
      {
        "input": "121",
        "expectedOutput": "true",
        "isHidden": false
      },
      {
        "input": "-121",
        "expectedOutput": "false",
        "isHidden": true
      },
      {
        "input": "10",
        "expectedOutput": "false",
        "isHidden": true
      }
    ],
    "starterCode": {
      "javascript": "var isPalindrome = function(x) {\n    \n};",
      "python": "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass",
      "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};",
      "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}"
    },
    "tags": [
      "math",
      "palindrome"
    ],
    "order": 3,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": true
  },
  {
    "title": "Valid Parentheses",
    "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    "difficulty": "Intermediate",
    "category": "Stack",
    "points": 200,
    "timeLimit": 60,
    "memoryLimit": 128,
    "constraints": "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true",
        "explanation": "The string is valid."
      }
    ],
    "testCases": [
      {
        "input": "\"()\"",
        "expectedOutput": "true",
        "isHidden": false
      },
      {
        "input": "\"()[]{}\"",
        "expectedOutput": "true",
        "isHidden": true
      },
      {
        "input": "\"(]\"",
        "expectedOutput": "false",
        "isHidden": true
      }
    ],
    "starterCode": {
      "javascript": "var isValid = function(s) {\n    \n};",
      "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass",
      "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
      "java": "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}"
    },
    "tags": [
      "stack",
      "string"
    ],
    "order": 4,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Merge Two Sorted Lists",
    "description": "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted list.",
    "difficulty": "Intermediate",
    "category": "Linked List",
    "points": 250,
    "timeLimit": 90,
    "memoryLimit": 128,
    "constraints": "The number of nodes in both lists is in the range [0, 50].",
    "examples": [
      {
        "input": "list1 = [1,2,4], list2 = [1,3,4]",
        "output": "[1,1,2,3,4,4]",
        "explanation": "Merge two sorted lists"
      }
    ],
    "testCases": [
      {
        "input": "1 2 4\n1 3 4",
        "expectedOutput": "1 1 2 3 4 4",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var mergeTwoLists = function(list1, list2) {\n    \n};",
      "python": "class Solution:\n    def mergeTwoLists(self, list1: List[int], list2: List[int]) -> List[int]:\n        pass",
      "cpp": "class Solution {\npublic:\n    vector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {\n        \n    }\n};",
      "java": "class Solution {\n    public int[] mergeTwoLists(int[] list1, int[] list2) {\n        \n    }\n}"
    },
    "tags": [
      "linked-list",
      "recursion"
    ],
    "order": 5,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Binary Tree Inorder Traversal",
    "description": "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    "difficulty": "Intermediate",
    "category": "Tree",
    "points": 300,
    "timeLimit": 60,
    "memoryLimit": 128,
    "constraints": "The number of nodes in the tree is in the range [0, 100].",
    "examples": [
      {
        "input": "root = [1,null,2,3]",
        "output": "[1,3,2]",
        "explanation": "Inorder traversal"
      }
    ],
    "testCases": [
      {
        "input": "1 null 2 3",
        "expectedOutput": "1 3 2",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var inorderTraversal = function(root) {\n    \n};",
      "python": "class Solution:\n    def inorderTraversal(self, root: List[int]) -> List[int]:\n        pass",
      "cpp": "class Solution {\npublic:\n    vector<int> inorderTraversal(vector<int>& root) {\n        \n    }\n};",
      "java": "class Solution {\n    public List<Integer> inorderTraversal(int[] root) {\n        \n    }\n}"
    },
    "tags": [
      "tree",
      "traversal"
    ],
    "order": 6,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Maximum Subarray",
    "description": "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.",
    "difficulty": "Intermediate",
    "category": "Dynamic Programming",
    "points": 350,
    "timeLimit": 60,
    "memoryLimit": 128,
    "constraints": "1 <= nums.length <= 10^5",
    "examples": [
      {
        "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        "output": "6",
        "explanation": "[4,-1,2,1] has the largest sum = 6."
      }
    ],
    "testCases": [
      {
        "input": "-2 1 -3 4 -1 2 1 -5 4",
        "expectedOutput": "6",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var maxSubArray = function(nums) {\n    \n};",
      "python": "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};",
      "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}"
    },
    "tags": [
      "dynamic-programming",
      "array"
    ],
    "order": 7,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Longest Common Subsequence",
    "description": "Given two strings text1 and text2, return the length of their longest common subsequence.",
    "difficulty": "Advanced",
    "category": "Dynamic Programming",
    "points": 400,
    "timeLimit": 120,
    "memoryLimit": 256,
    "constraints": "1 <= text1.length, text2.length <= 1000",
    "examples": [
      {
        "input": "text1 = 'abcde', text2 = 'ace'",
        "output": "3",
        "explanation": "The longest common subsequence is 'ace' and its length is 3."
      }
    ],
    "testCases": [
      {
        "input": "abcde\nace",
        "expectedOutput": "3",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var longestCommonSubsequence = function(text1, text2) {\n    \n};",
      "python": "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        \n    }\n};",
      "java": "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        \n    }\n}"
    },
    "tags": [
      "dynamic-programming",
      "string"
    ],
    "order": 8,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Word Ladder",
    "description": "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter.",
    "difficulty": "Advanced",
    "category": "Graph",
    "points": 450,
    "timeLimit": 180,
    "memoryLimit": 256,
    "constraints": "1 <= beginWord.length <= 10",
    "examples": [
      {
        "input": "beginWord = 'hit', endWord = 'cog', wordList = ['hot','dot','dog','lot','log','cog']",
        "output": "5",
        "explanation": "One shortest transformation sequence is 'hit' -> 'hot' -> 'dot' -> 'dog' -> 'cog', which is 5 words long."
      }
    ],
    "testCases": [
      {
        "input": "hit\ncog\nhot dot dog lot log cog",
        "expectedOutput": "5",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var ladderLength = function(beginWord, endWord, wordList) {\n    \n};",
      "python": "class Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        \n    }\n};",
      "java": "class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        \n    }\n}"
    },
    "tags": [
      "graph",
      "bfs"
    ],
    "order": 9,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Median of Two Sorted Arrays",
    "description": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    "difficulty": "Expert",
    "category": "Binary Search",
    "points": 500,
    "timeLimit": 240,
    "memoryLimit": 512,
    "constraints": "The overall run time complexity should be O(log (m+n)).",
    "examples": [
      {
        "input": "nums1 = [1,3], nums2 = [2]",
        "output": "2.00000",
        "explanation": "merged array = [1,2,3] and median is 2."
      }
    ],
    "testCases": [
      {
        "input": "1 3\n2",
        "expectedOutput": "2.00000",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var findMedianSortedArrays = function(nums1, nums2) {\n    \n};",
      "python": "class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        pass",
      "cpp": "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};",
      "java": "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}"
    },
    "tags": [
      "binary-search",
      "array"
    ],
    "order": 10,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "N-Queens",
    "description": "The n-queens puzzle is the problem of placing n queens on an n×n chessboard such that no two queens attack each other.",
    "difficulty": "Expert",
    "category": "Backtracking",
    "points": 600,
    "timeLimit": 300,
    "memoryLimit": 512,
    "constraints": "1 <= n <= 9",
    "examples": [
      {
        "input": "n = 4",
        "output": "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"]]",
        "explanation": "There exist two distinct solutions to the 4-queens puzzle."
      }
    ],
    "testCases": [
      {
        "input": "4",
        "expectedOutput": "2",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var solveNQueens = function(n) {\n    \n};",
      "python": "class Solution:\n    def solveNQueens(self, n: int) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int solveNQueens(int n) {\n        \n    }\n};",
      "java": "class Solution {\n    public int solveNQueens(int n) {\n        \n    }\n}"
    },
    "tags": [
      "backtracking",
      "recursion"
    ],
    "order": 11,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Find Maximum Number",
    "description": "Given an array of integers, find and return the maximum number.",
    "difficulty": "Beginner",
    "category": "Array",
    "points": 80,
    "timeLimit": 30,
    "memoryLimit": 64,
    "constraints": "1 <= arr.length <= 1000",
    "examples": [
      {
        "input": "[1, 3, 2, 5, 4]",
        "output": "5",
        "explanation": "5 is the maximum"
      }
    ],
    "testCases": [
      {
        "input": "1 3 2 5 4",
        "expectedOutput": "5",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var findMax = function(nums) {\n    \n};",
      "python": "class Solution:\n    def findMax(self, nums: List[int]) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int findMax(vector<int>& nums) {\n        \n    }\n};",
      "java": "class Solution {\n    public int findMax(int[] nums) {\n        \n    }\n}"
    },
    "tags": [
      "array",
      "math"
    ],
    "order": 12,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": true
  },
  {
    "title": "Count Vowels",
    "description": "Count the number of vowels (a, e, i, o, u) in a given string.",
    "difficulty": "Beginner",
    "category": "String",
    "points": 70,
    "timeLimit": 30,
    "memoryLimit": 64,
    "constraints": "1 <= s.length <= 1000",
    "examples": [
      {
        "input": "hello",
        "output": "2",
        "explanation": "e and o are vowels"
      }
    ],
    "testCases": [
      {
        "input": "hello",
        "expectedOutput": "2",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var countVowels = function(s) {\n    \n};",
      "python": "class Solution:\n    def countVowels(self, s: str) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int countVowels(string s) {\n        \n    }\n};",
      "java": "class Solution {\n    public int countVowels(String s) {\n        \n    }\n}"
    },
    "tags": [
      "string",
      "counting"
    ],
    "order": 13,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": true
  },
  {
    "title": "Binary Search",
    "description": "Implement binary search to find target in sorted array.",
    "difficulty": "Intermediate",
    "category": "Search",
    "points": 280,
    "timeLimit": 60,
    "memoryLimit": 128,
    "constraints": "Array is sorted in ascending order",
    "examples": [
      {
        "input": "[1,2,3,4,5], target=3",
        "output": "2",
        "explanation": "Index of 3 is 2"
      }
    ],
    "testCases": [
      {
        "input": "1 2 3 4 5\n3",
        "expectedOutput": "2",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var search = function(nums, target) {\n    \n};",
      "python": "class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
      "java": "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}"
    },
    "tags": [
      "binary-search",
      "array"
    ],
    "order": 14,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Rotate Array",
    "description": "Rotate array to the right by k steps.",
    "difficulty": "Intermediate",
    "category": "Array",
    "points": 260,
    "timeLimit": 60,
    "memoryLimit": 128,
    "constraints": "1 <= nums.length <= 10^5",
    "examples": [
      {
        "input": "[1,2,3,4,5,6,7], k=3",
        "output": "[5,6,7,1,2,3,4]",
        "explanation": "Rotate right by 3"
      }
    ],
    "testCases": [
      {
        "input": "1 2 3 4 5 6 7\n3",
        "expectedOutput": "5 6 7 1 2 3 4",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var rotate = function(nums, k) {\n    \n};",
      "python": "class Solution:\n    def rotate(self, nums: List[int], k: int) -> None:\n        pass",
      "cpp": "class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        \n    }\n};",
      "java": "class Solution {\n    public void rotate(int[] nums, int k) {\n        \n    }\n}"
    },
    "tags": [
      "array",
      "rotation"
    ],
    "order": 15,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Coin Change",
    "description": "Find minimum number of coins needed to make amount.",
    "difficulty": "Advanced",
    "category": "Dynamic Programming",
    "points": 480,
    "timeLimit": 120,
    "memoryLimit": 256,
    "constraints": "1 <= coins.length <= 12",
    "examples": [
      {
        "input": "coins=[1,3,4], amount=6",
        "output": "2",
        "explanation": "3+3=6, minimum 2 coins"
      }
    ],
    "testCases": [
      {
        "input": "1 3 4\n6",
        "expectedOutput": "2",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var coinChange = function(coins, amount) {\n    \n};",
      "python": "class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        \n    }\n};",
      "java": "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        \n    }\n}"
    },
    "tags": [
      "dynamic-programming",
      "greedy"
    ],
    "order": 16,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Longest Increasing Subsequence",
    "description": "Find length of longest increasing subsequence.",
    "difficulty": "Advanced",
    "category": "Dynamic Programming",
    "points": 520,
    "timeLimit": 120,
    "memoryLimit": 256,
    "constraints": "1 <= nums.length <= 2500",
    "examples": [
      {
        "input": "[10,9,2,5,3,7,101,18]",
        "output": "4",
        "explanation": "[2,3,7,101] is longest"
      }
    ],
    "testCases": [
      {
        "input": "10 9 2 5 3 7 101 18",
        "expectedOutput": "4",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var lengthOfLIS = function(nums) {\n    \n};",
      "python": "class Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        \n    }\n};",
      "java": "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        \n    }\n}"
    },
    "tags": [
      "dynamic-programming",
      "subsequence"
    ],
    "order": 17,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Edit Distance",
    "description": "Find minimum edit distance between two strings.",
    "difficulty": "Expert",
    "category": "Dynamic Programming",
    "points": 650,
    "timeLimit": 180,
    "memoryLimit": 512,
    "constraints": "0 <= word1.length, word2.length <= 500",
    "examples": [
      {
        "input": "horse, ros",
        "output": "3",
        "explanation": "horse -> rorse -> rose -> ros"
      }
    ],
    "testCases": [
      {
        "input": "horse\nros",
        "expectedOutput": "3",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var minDistance = function(word1, word2) {\n    \n};",
      "python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        pass",
      "cpp": "class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        \n    }\n};",
      "java": "class Solution {\n    public int minDistance(String word1, String word2) {\n        \n    }\n}"
    },
    "tags": [
      "dynamic-programming",
      "string"
    ],
    "order": 18,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  },
  {
    "title": "Sliding Window Maximum",
    "description": "Find maximum in each sliding window of size k.",
    "difficulty": "Expert",
    "category": "Sliding Window",
    "points": 700,
    "timeLimit": 180,
    "memoryLimit": 512,
    "constraints": "1 <= nums.length <= 10^5",
    "examples": [
      {
        "input": "[1,3,-1,-3,5,3,6,7], k=3",
        "output": "[3,3,5,5,6,7]",
        "explanation": "Max in each window"
      }
    ],
    "testCases": [
      {
        "input": "1 3 -1 -3 5 3 6 7\n3",
        "expectedOutput": "3 3 5 5 6 7",
        "isHidden": false
      }
    ],
    "starterCode": {
      "javascript": "var maxSlidingWindow = function(nums, k) {\n    \n};",
      "python": "class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        pass",
      "cpp": "class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        \n    }\n};",
      "java": "class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        \n    }\n}"
    },
    "tags": [
      "sliding-window",
      "deque"
    ],
    "order": 19,
    "isActive": true,
    "prerequisites": [],
    "fastTrackUnlock": false
  }
];

module.exports = { sampleChallenges };

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/algonix?authSource=admin');
    
    // Clear existing challenges
    await Challenge.deleteMany({});
    
    // Insert sample challenges
    await Challenge.insertMany(sampleChallenges);
    
    console.log('Sample challenges added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Only run automatically if executed directly
if (require.main === module) {
  seedDatabase();
}
