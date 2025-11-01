// MongoDB initialization script
db = db.getSiblingDB('algonix');

// Create collections
db.createCollection('users');
db.createCollection('challenges');
db.createCollection('submissions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "stats.totalPoints": -1 });
db.users.createIndex({ "stats.weeklyPoints": -1 });

db.challenges.createIndex({ "difficulty": 1 });
db.challenges.createIndex({ "isActive": 1 });
db.challenges.createIndex({ "order": 1 });

db.submissions.createIndex({ "user": 1 });
db.submissions.createIndex({ "challenge": 1 });
db.submissions.createIndex({ "createdAt": -1 });

// Insert sample challenges
db.challenges.insertMany([
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    difficulty: "Beginner",
    category: "Array",
    points: 100,
    timeLimit: 60,
    memoryLimit: 128,
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isHidden: false
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isHidden: true
      }
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n    // Your code here\n}",
      python: "def two_sum(nums, target):\n    # Your code here\n    pass",
      java: "public int[] twoSum(int[] nums, int target) {\n    // Your code here\n}",
      cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}"
    },
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    tags: ["Array", "Hash Table"],
    order: 1,
    isActive: true,
    prerequisites: [],
    fastTrackUnlock: true
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    difficulty: "Beginner",
    category: "String",
    points: 80,
    timeLimit: 30,
    memoryLimit: 64,
    testCases: [
      {
        input: "['h','e','l','l','o']",
        expectedOutput: "['o','l','l','e','h']",
        isHidden: false
      },
      {
        input: "['H','a','n','n','a','h']",
        expectedOutput: "['h','a','n','n','a','H']",
        isHidden: false
      }
    ],
    starterCode: {
      javascript: "function reverseString(s) {\n    // Your code here\n}",
      python: "def reverse_string(s):\n    # Your code here\n    pass",
      java: "public void reverseString(char[] s) {\n    // Your code here\n}",
      cpp: "void reverseString(vector<char>& s) {\n    // Your code here\n}"
    },
    constraints: "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",
    examples: [
      {
        input: "s = ['h','e','l','l','o']",
        output: "['o','l','l','e','h']",
        explanation: "Reverse the array of characters in-place."
      }
    ],
    tags: ["String", "Two Pointers"],
    order: 2,
    isActive: true,
    prerequisites: [],
    fastTrackUnlock: true
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "Intermediate",
    category: "Tree",
    points: 200,
    timeLimit: 120,
    memoryLimit: 256,
    testCases: [
      {
        input: "[1,null,2,3]",
        expectedOutput: "[1,3,2]",
        isHidden: false
      },
      {
        input: "[]",
        expectedOutput: "[]",
        isHidden: false
      },
      {
        input: "[1]",
        expectedOutput: "[1]",
        isHidden: true
      }
    ],
    starterCode: {
      javascript: "function inorderTraversal(root) {\n    // Your code here\n}",
      python: "def inorder_traversal(root):\n    # Your code here\n    pass",
      java: "public List<Integer> inorderTraversal(TreeNode root) {\n    // Your code here\n}",
      cpp: "vector<int> inorderTraversal(TreeNode* root) {\n    // Your code here\n}"
    },
    constraints: "The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
        explanation: "Inorder traversal visits left subtree, root, then right subtree."
      }
    ],
    tags: ["Tree", "Stack", "Recursion"],
    order: 10,
    isActive: true,
    prerequisites: [],
    fastTrackUnlock: false
  }
]);

print('Database initialized with sample data');