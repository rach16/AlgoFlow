<div align="center">

# 🌊 AlgoFlow

**Interactive Algorithm Visualizer for NeetCode 250**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://algoflow.vercel.app)
[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)](https://vite.dev)

A comprehensive web application that visualizes **250 essential algorithm problems** with step-by-step execution, supporting **Python**, **JavaScript**, and **Java** implementations. Every problem ships with multiple solution approaches, each independently animated.

[Live Demo](https://algoflow.vercel.app) · [Report Bug](https://github.com/rach16/AlgoFlow/issues) · [Request Feature](https://github.com/rach16/AlgoFlow/issues)

</div>

---

## ✨ Features

- 🎯 **250 Algorithms** across 18 categories (Arrays, Trees, Graphs, DP, etc.)
- 🧠 **Multiple approaches per problem** - compare competing solutions side by side, each with its own animation and complexity
- 🔄 **Step-by-step visualization** with interactive playback controls
- 💻 **Multi-language support**: Python, JavaScript, and Java
- 🎨 **Syntax highlighting** with real-time code execution tracking
- 📱 **Responsive design** optimized for desktop and mobile
- ⚡ **Pattern recognition** - each problem includes algorithm pattern hints
- 🔗 **LeetCode integration** - direct links to original problems

## 📸 Screenshots

<div align="center">

### Algorithm Visualization
*Step-by-step execution with syntax highlighting and interactive controls*

### Multi-Language Support
*Switch between Python, JavaScript, and Java implementations*

### Responsive Design
*Optimized for both desktop and mobile devices*

</div>

> **Note**: Add screenshots of your app here! Take screenshots from https://algoflow.vercel.app and upload them to GitHub.

## 🎓 Algorithm Categories

1. **Arrays & Hashing** (9) - Two Sum, Contains Duplicate, Group Anagrams, etc.
2. **Two Pointers** (5) - Valid Palindrome, Three Sum, Container With Most Water, etc.
3. **Sliding Window** (6) - Longest Substring Without Repeating, Minimum Window, etc.
4. **Stack** (7) - Valid Parentheses, Min Stack, Daily Temperatures, etc.
5. **Binary Search** (7) - Binary Search, Search in Rotated Array, Median of Two Sorted Arrays, etc.
6. **Linked List** (11) - Reverse Linked List, Merge K Sorted Lists, LRU Cache, etc.
7. **Trees** (15) - Invert Binary Tree, Max Depth, Serialize/Deserialize, etc.
8. **Tries** (3) - Implement Trie, Add and Search Words, Word Search II
9. **Heap/Priority Queue** (7) - Kth Largest Element, Find Median from Data Stream, etc.
10. **Backtracking** (9) - Permutations, Subsets, N-Queens, Palindrome Partitioning, etc.
11. **Graphs** (13) - Clone Graph, Course Schedule, Word Ladder, Number of Islands, etc.
12. **Advanced Graphs** (6) - Network Delay Time, Alien Dictionary, Cheapest Flights, etc.
13. **1-D Dynamic Programming** (12) - Climbing Stairs, House Robber, Coin Change, etc.
14. **2-D Dynamic Programming** (11) - Edit Distance, LCS, Unique Paths, Regex Matching, etc.
15. **Greedy** (8) - Jump Game, Maximum Subarray, Gas Station, etc.
16. **Intervals** (6) - Merge Intervals, Meeting Rooms, Insert Interval, etc.
17. **Bit Manipulation** (7) - Single Number, Counting Bits, Reverse Bits, etc.
18. **Math & Geometry** (8) - Rotate Image, Spiral Matrix, Happy Number, Pow(x,n), etc.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Syntax Highlighting**: Prism React Renderer
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/rach16/AlgoFlow.git
cd algoflow

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 Usage

1. **Select an algorithm** from the sidebar categories
2. **Choose your language** (Python, JavaScript, or Java) using the tabs
3. **Customize input** if the algorithm supports it
4. **Play/pause** the visualization to see step-by-step execution
5. **Adjust speed** using the playback controls
6. **View complexity** - time and space complexity displayed for each algorithm

## 📂 Project Structure

```
src/
├── algorithms/          # 250 algorithm implementations
│   ├── arrays-hashing/
│   ├── two-pointers/
│   ├── trees/
│   ├── graphs/
│   ├── dp-1d/
│   ├── dp-2d/
│   └── ...
├── components/
│   ├── common/         # Reusable components
│   ├── layout/         # Layout components
│   └── visualizers/    # Algorithm visualizers
├── store/              # Zustand state management
└── types/              # TypeScript type definitions
```

## 🎯 Algorithm Implementation Pattern

Each algorithm exports an `Algorithm` object with:
- `run()` function that generates `AlgorithmStep[]` for visualization
- Code implementations in Python, JavaScript, and Java
- Complexity analysis and pattern hints
- LeetCode problem link

```typescript
export const twoSum: Algorithm = {
  id: 'two-sum',
  name: 'Two Sum',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map — store complement, check on each pass',
  code: {
    python: `def twoSum(nums, target): ...`,
    javascript: `function twoSum(nums, target) { ... }`,
    java: `public static int[] twoSum(int[] nums, int target) { ... }`
  },
  defaultInput: { nums: [2, 7, 11, 15], target: 9 },
  run: runTwoSum,
};
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Algorithm problems based on [NeetCode 250](https://neetcode.io/)
- Inspired by the need for better algorithm visualization tools
- Built with help from Claude Sonnet 4.5

---

**Happy Coding!** 🚀
