<div align="center">

# 🧪 SDETPrep

**One place to prepare for an SDET interview loop**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://algoflow-ruby.vercel.app)
[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)](https://vite.dev)

SDET interview prep that shows you the algorithm running instead of describing it. **254 problems** — all of NeetCode 250 plus four staples SDET loops ask constantly — each with two independently animated approaches in **Python**, **JavaScript** and **Java**, a derivation of its complexity, and a spaced-repetition schedule so it comes back before you forget it.

The animated visualizer is called **AlgoFlow** and lives under Practice. Tooling craft (Playwright, Selenium, CI) and AI in testing are still to come — see [the build plan](#-roadmap).

[Live Demo](https://algoflow-ruby.vercel.app) · [Report Bug](https://github.com/rach16/AlgoFlow/issues) · [Request Feature](https://github.com/rach16/AlgoFlow/issues)

</div>

---

## ✨ Features

- 🎯 **254 problems** across 18 categories — all of NeetCode 250, plus 4 staples that SDET interviews ask constantly but the list omits
- 🧠 **Two approaches per problem**, each independently animated, so you can compare a hash map against sorting rather than reading about it
- 🔄 **Step-by-step playback** with the current line highlighted and a per-line explanation
- 💻 **Python, JavaScript and Java** for every approach
- 🧮 **Complexity derivations** for all 508 approaches — how the bound is reached, not just what it is, plus the mistake people make on each
- 📚 **Method reference** in the language you are writing: 126 operations across 12 structures, with `String` and `char` kept separate because they are different APIs
- 🗂️ **Three ways to browse** — Categories (the curriculum), Patterns (the technique), Topics (the data type)
- 🎯 **Filter by who asks** — big tech, staffing agencies or startups, across every browse axis and the review queue
- 🧭 **Test design** — 475 reference cases across 24 “how would you test X?” exercises in five kinds (interface, API, flow, data, physical), each with a worked answer and answered follow-ups behind a reveal. Write your list first, then compare and mark what you had; the score that matters is which *dimensions* you never reached, tracked across every attempt
- 🏗️ **Testability reference** — six case-design techniques with their traps, where each case belongs and what it costs there, ten design-for-testability levers, and the flake arithmetic that makes the argument
- 🗣️ **Behavioral bank** — all 16 Amazon Leadership Principles, what each is really probing, the anti-patterns, and a STAR scaffold you fill in; one story can cover several principles, and finished stories join the review queue
- ⏱️ **Timed drill** — plain editor, no autocomplete, no hints, clock running: two problems in 45 minutes, then grade yourself and watch the pass rate
- 🧪 **Coding round** — the problems SDET loops actually ask, tiered by how consistently public reports name them, with sources cited
- 🔁 **Spaced repetition** — rate a problem and it returns on a schedule; all local, no account
- 🔍 **Search** (<kbd>⌘K</kbd>) across name, category, pattern and topic
- ⌨️ **Keyboard driven** — arrows step, <kbd>space</kbd> plays, <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> switches language, <kbd>[</kbd><kbd>]</kbd> switches approach
- 📱 Works on mobile
- ✅ **9,500+ tests** in CI, which execute every approach of every problem and assert the emitted state is renderable

## 🧭 Navigation

Three sections. Practice holds the reference material you reach for mid-problem.

| Section | View | What it is for |
|---|---|---|
| **Practice** | AlgoFlow | Watch an approach run step by step against the code, with a "Why?" panel deriving its complexity |
| | Complexity | How to derive a bound yourself, plus a worked derivation for all 508 approaches |
| | Methods | Language-aware API reference — what the method is *called* in Python vs JavaScript vs Java |
| **Coding round** | | The ~67 problems SDET interviews actually ask, in three tiers, with sources cited |
| **Drill** | | Timed, hint-free practice against the clock — the coding round as it is actually run |
| **Test design** | Exercises | 24 “How would you test X?” subjects, filterable by kind — enumerate first, then compare against the reference and find your blind spots |
| | Testability | Technique, layer and design-for-testability: the questions asked once your list is on the table |
| **Behavioral** | | Amazon's 16 Leadership Principles, with STAR scaffolds you fill in yourself |
| **Review** | | Spaced-repetition queue of what is due |

## 🗺️ Roadmap

Planned, in dependency order. Each phase exists to de-risk the next.

| # | Phase | State |
|---|---|---|
| 1 | Rename and restructure navigation | ✅ done |
| 2 | Company and audience tags — filter the catalogue and review queue by who asks | ✅ done |
| 3 | Timed drill mode — plain editor, no autocomplete, 2 problems in 45 min | ✅ done |
| 4 | Amazon Leadership Principles story bank | ✅ done |
| 5 | Test design and design-for-testability | ✅ done |
| 6 | Craft cards — waits, Selenium, Playwright, POM, CI — and the flake animations | next |
| 7 | AI in testing | planned |
| 8 | SQL and twenty-minute build exercises | planned |

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
- **Testing**: Vitest — 9,500+ tests, run in CI on every push
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

1. **Select a problem** from the sidebar — browse by Categories, Patterns or Topics, or hit <kbd>⌘K</kbd>
2. **Step through it** with the arrow keys; <kbd>space</kbd> plays, <kbd>r</kbd> resets
3. **Switch language** with <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>, and approaches with <kbd>[</kbd> <kbd>]</kbd>
4. **Open "Why?"** for the complexity derivation and the mistake people make on it
5. **Rate it** when you are done — it returns on a spaced-repetition schedule

## 📂 Project Structure

```
src/
├── algorithms/          # 254 algorithm implementations
│   ├── arrays-hashing/
│   ├── two-pointers/
│   ├── trees/
│   ├── graphs/
│   ├── dp-1d/
│   ├── dp-2d/
│   └── ...
├── components/
│   ├── common/         # Reusable components
│   ├── layout/         # Header, sidebar, navigation model
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
