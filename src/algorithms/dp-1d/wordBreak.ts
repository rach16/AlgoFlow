import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface WordBreakInput {
  s: string;
  wordDict: string[];
}

function runWordBreak(input: unknown): AlgorithmStep[] {
  const { s, wordDict } = input as WordBreakInput;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');

  // dp[i] = can s[0..i-1] be segmented using wordDict
  const dp: (string | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => i === 0 ? '""' : s.substring(0, i));

  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, result: null, wordDict: [...wordDict] },
    highlights: [],
    message: `Can "${s}" be segmented using dictionary [${wordDict.map(w => `"${w}"`).join(', ')}]?`,
    codeLine: 1,
  });

  dp[0] = 'T';
  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [0], result: null, wordDict: [...wordDict] },
    highlights: [],
    message: `Base case: dp[0] = true (empty string can be segmented)`,
    codeLine: 2,
    action: 'insert',
  });

  const wordSet = new Set(wordDict);

  for (let i = 1; i <= n; i++) {
    dp[i] = 'F';

    for (let j = 0; j < i; j++) {
      const substring = s.substring(j, i);
      const dpjVal = dp[j] === 'T';

      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [j], dpSecondary: [i], result: null, wordDict: [...wordDict] },
        highlights: Array.from({ length: i - j }, (_, k) => j + k),
        pointers: { j, i },
        message: `Check: dp[${j}]=${dp[j]} and "${substring}" in dict? ${wordSet.has(substring) ? 'YES' : 'NO'}`,
        codeLine: 5,
        action: 'compare',
      });

      if (dpjVal && wordSet.has(substring)) {
        dp[i] = 'T';
        steps.push({
          state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i], result: null, wordDict: [...wordDict] },
          highlights: Array.from({ length: i - j }, (_, k) => j + k),
          pointers: { j, i },
          message: `dp[${i}] = true! s[${j}..${i - 1}] = "${substring}" is in dictionary and dp[${j}] is true`,
          codeLine: 6,
          action: 'found',
        });
        break;
      }
    }

    if (dp[i] === 'F') {
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i], result: null, wordDict: [...wordDict] },
        highlights: [],
        message: `dp[${i}] = false. No valid split found for "${s.substring(0, i)}"`,
        codeLine: 7,
        action: 'insert',
      });
    }
  }

  const result = dp[n] === 'T';
  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [n], result, wordDict: [...wordDict] },
    highlights: [],
    message: `Result: "${s}" ${result ? 'CAN' : 'CANNOT'} be segmented using the dictionary`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runWordBreakBFS(input: unknown): AlgorithmStep[] {
  const { s, wordDict } = input as WordBreakInput;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');
  const wordSet = new Set(wordDict);

  // dp[i] marks index i: 'Q' = queued, 'V' = visited (expanded)
  const dp: (string | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? '""' : s.substring(0, i)));

  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, result: null, wordDict: [...wordDict] },
    highlights: [],
    message: `BFS view: indices 0..${n} are nodes; a dictionary word is an edge from its start to its end. "${s}" is breakable iff node ${n} is reachable from node 0`,
    codeLine: 3,
  });

  const queue: number[] = [0];
  const visited = new Set<number>();
  dp[0] = 'Q';

  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [0], result: null, wordDict: [...wordDict] },
    highlights: [],
    message: `Enqueue start index 0 (nothing consumed yet)`,
    codeLine: 5,
    action: 'push',
  });

  while (queue.length > 0) {
    const start = queue.shift() as number;

    if (start === n) {
      dp[n] = 'V';
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [n], result: true, wordDict: [...wordDict] },
        highlights: [],
        message: `Reached index ${n} — the whole string was consumed by dictionary words. Result: true`,
        codeLine: 10,
        action: 'found',
      });
      return steps;
    }

    if (visited.has(start)) {
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [start], result: null, wordDict: [...wordDict] },
        highlights: [],
        pointers: { start },
        message: `Index ${start} already expanded — skip it (the visited set is what keeps BFS linear in revisits)`,
        codeLine: 12,
      });
      continue;
    }
    visited.add(start);
    dp[start] = 'V';

    steps.push({
      state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [start], result: null, wordDict: [...wordDict] },
      highlights: start < n ? [start] : [],
      pointers: { start },
      message: `Expand index ${start}: remaining text is "${s.substring(start)}". Try every dictionary word that could start here`,
      codeLine: 13,
      action: 'visit',
    });

    for (let end = start + 1; end <= n; end++) {
      const piece = s.substring(start, end);
      const inDict = wordSet.has(piece);

      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [start], dpSecondary: [end], result: null, wordDict: [...wordDict] },
        highlights: Array.from({ length: end - start }, (_, k) => start + k),
        pointers: { start, end },
        message: `"${piece}" in dictionary? ${inDict ? 'YES — edge to index ' + end : 'no'}`,
        codeLine: 15,
        action: 'compare',
      });

      if (inDict) {
        queue.push(end);
        if (dp[end] === null) dp[end] = 'Q';
        steps.push({
          state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [end], result: null, wordDict: [...wordDict] },
          highlights: Array.from({ length: end - start }, (_, k) => start + k),
          pointers: { start, end },
          message: `Word "${piece}" consumes s[${start}..${end - 1}] — enqueue index ${end}`,
          codeLine: 16,
          action: 'push',
        });
      }
    }
  }

  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, result: false, wordDict: [...wordDict] },
    highlights: [],
    message: `Queue emptied without reaching index ${n} — "${s}" cannot be segmented. Result: false`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const wordBreak: Algorithm = {
  id: 'word-break',
  name: 'Word Break',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²·m)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[i] = can s[0..i] be segmented using dictionary',
  description:
    'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
  problemUrl: 'https://leetcode.com/problems/word-break/',
  code: {
    python: `def wordBreak(s, wordDict):
    dp = [False] * (len(s) + 1)
    dp[0] = True
    wordSet = set(wordDict)
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in wordSet:
                dp[i] = True
                break
    return dp[len(s)]`,
    javascript: `function wordBreak(s, wordDict) {
    const dp = new Array(s.length + 1).fill(false);
    dp[0] = true;
    const wordSet = new Set(wordDict);
    for (let i = 1; i <= s.length; i++) {
        for (let j = 0; j < i; j++) {
            if (dp[j] && wordSet.has(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length];
}`,
    java: `public boolean wordBreak(String s, List<String> wordDict) {
    boolean[] dp = new boolean[s.length() + 1];
    dp[0] = true;
    Set<String> wordSet = new HashSet<>(wordDict);
    for (int i = 1; i <= s.length(); i++) {
        for (int j = 0; j < i; j++) {
            if (dp[j] && wordSet.contains(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length()];
}`,
  },
  defaultInput: { s: 'leetcode', wordDict: ['leet', 'code'] },
  run: runWordBreak,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'bfs-over-indices',
      name: 'BFS over Indices',
      timeComplexity: 'O(n²·m)',
      spaceComplexity: 'O(n)',
      description:
        'Treat string indices as graph nodes and dictionary words as edges — BFS from index 0 asks "is index n reachable?", exploring each start index at most once via a visited set.',
      code: {
        python: `from collections import deque

def wordBreak(s, wordDict):
    wordSet = set(wordDict)
    queue = deque([0])
    visited = set()
    while queue:
        start = queue.popleft()
        if start == len(s):
            return True
        if start in visited:
            continue
        visited.add(start)
        for end in range(start + 1, len(s) + 1):
            if s[start:end] in wordSet:
                queue.append(end)
    return False`,
        javascript: `function wordBreak(s, wordDict) {
    const wordSet = new Set(wordDict);
    const queue = [0];
    const visited = new Set();
    while (queue.length > 0) {
        const start = queue.shift();
        if (start === s.length) return true;
        if (visited.has(start)) continue;
        visited.add(start);
        for (let end = start + 1; end <= s.length; end++) {
            if (wordSet.has(s.substring(start, end))) {
                queue.push(end);
            }
        }
    }
    return false;
}`,
        java: `public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> wordSet = new HashSet<>(wordDict);
    Deque<Integer> queue = new ArrayDeque<>();
    queue.add(0);
    Set<Integer> visited = new HashSet<>();
    while (!queue.isEmpty()) {
        int start = queue.poll();
        if (start == s.length()) return true;
        if (visited.contains(start)) continue;
        visited.add(start);
        for (int end = start + 1; end <= s.length(); end++) {
            if (wordSet.contains(s.substring(start, end))) {
                queue.add(end);
            }
        }
    }
    return false;
}`,
      },
      run: runWordBreakBFS,
      lineExplanations: {
        python: {
          1: 'Import deque for an efficient FIFO queue',
          3: 'Define function taking string and word list',
          4: 'Convert word list to a set for O(1) lookup',
          5: 'BFS queue of start indices, beginning at 0',
          6: 'Visited set: expand each start index only once',
          7: 'Process indices until the queue is empty',
          8: 'Take the next start index',
          9: 'Reached the end of the string?',
          10: 'The whole string was consumed by words',
          11: 'Skip indices already expanded',
          12: 'Avoids exponential re-exploration',
          13: 'Mark this index as expanded',
          14: 'Try every possible end for the next word',
          15: 'Is s[start:end] a dictionary word?',
          16: 'Yes: index end becomes reachable — enqueue it',
          17: 'Index n never reached: not segmentable',
        },
        javascript: {
          1: 'Define function taking string and word list',
          2: 'Convert word list to a set for O(1) lookup',
          3: 'BFS queue of start indices, beginning at 0',
          4: 'Visited set: expand each start index only once',
          5: 'Process indices until the queue is empty',
          6: 'Take the next start index',
          7: 'Reached the end: whole string consumed by words',
          8: 'Skip indices already expanded (avoids exponential blowup)',
          9: 'Mark this index as expanded',
          10: 'Try every possible end for the next word',
          11: 'Is s.substring(start, end) a dictionary word?',
          12: 'Yes: index end becomes reachable — enqueue it',
          16: 'Index n never reached: not segmentable',
        },
        java: {
          1: 'Define method taking string and word list',
          2: 'Convert word list to a set for O(1) lookup',
          3: 'FIFO queue of start indices',
          4: 'BFS begins at index 0',
          5: 'Visited set: expand each start index only once',
          6: 'Process indices until the queue is empty',
          7: 'Take the next start index',
          8: 'Reached the end: whole string consumed by words',
          9: 'Skip indices already expanded (avoids exponential blowup)',
          10: 'Mark this index as expanded',
          11: 'Try every possible end for the next word',
          12: 'Is the substring a dictionary word?',
          13: 'Yes: index end becomes reachable — enqueue it',
          17: 'Index n never reached: not segmentable',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string and word list',
      2: 'Init DP array: dp[i] = can s[0..i-1] be segmented',
      3: 'Base case: empty string can be segmented',
      4: 'Convert word list to set for O(1) lookup',
      5: 'Try every ending position i',
      6: 'Try every split point j before i',
      7: 'Check if left part valid and right part in dict',
      8: 'Mark dp[i] as true if valid split found',
      9: 'No need to check other splits for this i',
      10: 'Return whether entire string can be segmented',
    },
    javascript: {
      1: 'Define function taking string and word list',
      2: 'Init DP array: dp[i] = can s[0..i-1] be segmented',
      3: 'Base case: empty string can be segmented',
      4: 'Convert word list to set for O(1) lookup',
      5: 'Try every ending position i',
      6: 'Try every split point j before i',
      7: 'Check if left part valid and right part in dict',
      8: 'Mark dp[i] as true if valid split found',
      9: 'No need to check other splits for this i',
      13: 'Return whether entire string can be segmented',
    },
    java: {
      1: 'Define method taking string and word list',
      2: 'Init DP array: dp[i] = can s[0..i-1] be segmented',
      3: 'Base case: empty string can be segmented',
      4: 'Convert word list to set for O(1) lookup',
      5: 'Try every ending position i',
      6: 'Try every split point j before i',
      7: 'Check if left part valid and right part in dict',
      8: 'Mark dp[i] as true if valid split found',
      9: 'No need to check other splits for this i',
      13: 'Return whether entire string can be segmented',
    },
  },
};
