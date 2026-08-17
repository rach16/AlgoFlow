import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface JumpVIIInput {
  s: string;
  minJump: number;
  maxJump: number;
}

function runJumpGameVII(input: unknown): AlgorithmStep[] {
  const { s, minJump, maxJump } = input as JumpVIIInput;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');
  const dpLabels = chars.map((_, i) => `${i}`);

  const dp: boolean[] = new Array(n).fill(false);
  dp[0] = true;

  const dpView = () => dp.map((v) => (v ? 'T' : 'F'));

  steps.push({
    state: {
      chars: [...chars],
      dp: dpView(),
      dpLabels,
      dpHighlights: [0],
      result: 'Can we reach the last index?',
    },
    highlights: [0],
    message: `From index i you may jump to any j in [i+${minJump}, i+${maxJump}] provided s[j] = '0'. dp[i] = "index i is reachable". dp[0] = true; we start there.`,
    codeLine: 4,
    action: 'insert',
  });

  let pre = 0;

  for (let i = 1; i < n; i++) {
    const notes: string[] = [];

    if (i >= minJump) {
      pre += dp[i - minJump] ? 1 : 0;
      notes.push(`index ${i - minJump} enters the jump window (dp = ${dp[i - minJump] ? 'T' : 'F'})`);
    }
    if (i > maxJump) {
      pre -= dp[i - maxJump - 1] ? 1 : 0;
      notes.push(`index ${i - maxJump - 1} falls out of it (dp = ${dp[i - maxJump - 1] ? 'T' : 'F'})`);
    }

    dp[i] = pre > 0 && s[i] === '0';

    const windowLo = Math.max(0, i - maxJump);
    const windowHi = i - minJump;
    const windowIdx: number[] = [];
    for (let j = windowLo; j <= windowHi; j++) windowIdx.push(j);

    steps.push({
      state: {
        chars: [...chars],
        dp: dpView(),
        dpLabels,
        dpHighlights: [i],
        dpSecondary: windowIdx,
        result: dp[n - 1] ? 'true' : 'searching...',
      },
      highlights: [i],
      secondary: windowIdx,
      pointers: { i },
      message: `i = ${i}: window of possible take-off points is [${windowLo}, ${windowHi < 0 ? '-' : windowHi}]${notes.length ? ` — ${notes.join(', ')}` : ' (still empty)'}. It holds ${pre} reachable index(es) and s[${i}] = '${s[i]}', so dp[${i}] = ${dp[i] ? 'true' : 'false'}.`,
      codeLine: 11,
      action: dp[i] ? 'insert' : 'compare',
    });
  }

  const answer = dp[n - 1];

  steps.push({
    state: {
      chars: [...chars],
      dp: dpView(),
      dpLabels,
      dpHighlights: [n - 1],
      result: answer ? 'true - the last index is reachable!' : 'false - the last index is unreachable',
    },
    highlights: [n - 1],
    message: `dp[${n - 1}] = ${answer ? 'true' : 'false'}. ${answer ? 'A chain of legal jumps lands on the last index.' : 'No chain of legal jumps ever lands on the last index.'}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runJumpGameVIIBfs(input: unknown): AlgorithmStep[] {
  const { s, minJump, maxJump } = input as JumpVIIInput;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');

  const queue: number[] = [0];
  let farthest = 0;

  steps.push({
    state: { chars: [...chars], queue: [...queue], result: 'Can we reach the last index?' },
    highlights: [0],
    message: `BFS framing: index 0 is the source. Each popped index opens a whole range of successors, and 'farthest' remembers how far we have already enqueued so no index is scanned twice — that is what keeps this linear.`,
    codeLine: 5,
    action: 'push',
  });

  while (queue.length) {
    const i = queue.shift() as number;

    if (i === n - 1) {
      steps.push({
        state: { chars: [...chars], queue: [...queue], result: 'true - the last index is reachable!' },
        highlights: [i],
        pointers: { i },
        message: `Popped index ${i} — that is the last index. Reachable, return true.`,
        codeLine: 10,
        action: 'found',
      });
      return steps;
    }

    const start = Math.max(i + minJump, farthest + 1);
    const end = Math.min(i + maxJump, n - 1);
    const added: number[] = [];
    for (let j = start; j <= end; j++) {
      if (s[j] === '0') {
        queue.push(j);
        added.push(j);
      }
    }
    const prevFarthest = farthest;
    farthest = Math.max(farthest, end);

    const range: number[] = [];
    for (let j = start; j <= end; j++) range.push(j);

    steps.push({
      state: { chars: [...chars], queue: [...queue], result: 'searching...' },
      highlights: added.length ? added : [i],
      secondary: range,
      pointers: { i },
      message: `Pop index ${i}. Its jump range is [${i + minJump}, ${Math.min(i + maxJump, n - 1)}]. ${
        start > end
          ? `Everything there was already scanned (farthest = ${prevFarthest}) or falls off the end, so there is nothing new to expand.`
          : `Trimmed to [${start}, ${end}] since indices up to ${prevFarthest} were already scanned. ${
              added.length ? `Enqueue the landable '0' slots: ${added.join(', ')}.` : `No landable '0' slots in that range.`
            }`
      } Queue: [${queue.join(', ')}].`,
      codeLine: 15,
      action: added.length ? 'push' : 'pop',
    });
  }

  steps.push({
    state: { chars: [...chars], queue: [], result: 'false - the last index is unreachable' },
    highlights: [],
    message: `The queue drained without ever reaching index ${n - 1}. Return false.`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const jumpGameVII: Algorithm = {
  id: 'jump-game-vii',
  name: 'Jump Game VII',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Greedy — sliding window over reachable prefix states',
  description:
    "You are given a binary string s and two integers minJump and maxJump. Starting at index 0, you may move from index i to any index j with i + minJump <= j <= i + maxJump and s[j] == '0'. Return true if you can reach the last index.",
  problemUrl: 'https://leetcode.com/problems/jump-game-vii/',
  code: {
    python: `def canReach(s, minJump, maxJump):
    n = len(s)
    dp = [False] * n
    dp[0] = True
    pre = 0
    for i in range(1, n):
        if i >= minJump:
            pre += dp[i - minJump]
        if i > maxJump:
            pre -= dp[i - maxJump - 1]
        dp[i] = pre > 0 and s[i] == '0'
    return dp[n - 1]`,
    javascript: `function canReach(s, minJump, maxJump) {
    const n = s.length;
    const dp = new Array(n).fill(false);
    dp[0] = true;
    let pre = 0;
    for (let i = 1; i < n; i++) {
        if (i >= minJump) pre += dp[i - minJump] ? 1 : 0;
        if (i > maxJump) pre -= dp[i - maxJump - 1] ? 1 : 0;
        dp[i] = pre > 0 && s[i] === '0';
    }
    return dp[n - 1];
}`,
    java: `public static boolean canReach(String s, int minJump, int maxJump) {
    int n = s.length();
    boolean[] dp = new boolean[n];
    dp[0] = true;
    int pre = 0;
    for (int i = 1; i < n; i++) {
        if (i >= minJump) pre += dp[i - minJump] ? 1 : 0;
        if (i > maxJump) pre -= dp[i - maxJump - 1] ? 1 : 0;
        dp[i] = pre > 0 && s.charAt(i) == '0';
    }
    return dp[n - 1];
}`,
  },
  defaultInput: { s: '0110100010', minJump: 2, maxJump: 3 },
  run: runJumpGameVII,
  optimalApproachName: 'Sliding Window DP',
  approaches: [
    {
      id: 'bfs-ranges',
      name: 'BFS Over Ranges',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Rather than a prefix count, run a breadth-first search where each popped index expands an entire range of successors, using a farthest pointer so every index is enqueued at most once.',
      code: {
        python: `from collections import deque

def canReach(s, minJump, maxJump):
    n = len(s)
    queue = deque([0])
    farthest = 0
    while queue:
        i = queue.popleft()
        if i == n - 1:
            return True
        start = max(i + minJump, farthest + 1)
        end = min(i + maxJump, n - 1)
        for j in range(start, end + 1):
            if s[j] == '0':
                queue.append(j)
        farthest = max(farthest, end)
    return False`,
        javascript: `function canReach(s, minJump, maxJump) {
    const n = s.length;
    const queue = [0];
    let farthest = 0;
    while (queue.length) {
        const i = queue.shift();
        if (i === n - 1) return true;
        const start = Math.max(i + minJump, farthest + 1);
        const end = Math.min(i + maxJump, n - 1);
        for (let j = start; j <= end; j++) {
            if (s[j] === '0') queue.push(j);
        }
        farthest = Math.max(farthest, end);
    }
    return false;
}`,
        java: `public static boolean canReach(String s, int minJump, int maxJump) {
    int n = s.length();
    Queue<Integer> queue = new ArrayDeque<>();
    queue.add(0);
    int farthest = 0;
    while (!queue.isEmpty()) {
        int i = queue.poll();
        if (i == n - 1) return true;
        int start = Math.max(i + minJump, farthest + 1);
        int end = Math.min(i + maxJump, n - 1);
        for (int j = start; j <= end; j++) {
            if (s.charAt(j) == '0') queue.add(j);
        }
        farthest = Math.max(farthest, end);
    }
    return false;
}`,
      },
      run: runJumpGameVIIBfs,
      lineExplanations: {
        python: {
          1: 'Deque gives O(1) pops from the front',
          3: 'Define function taking s, minJump, maxJump',
          4: 'Length of the string',
          5: 'BFS frontier, seeded with the starting index',
          6: 'Highest index already expanded — never rescan below it',
          7: 'Standard BFS loop',
          8: 'Take the next reachable index',
          9: 'Is it the goal?',
          10: 'Reached the last index',
          11: 'First unscanned index in this jump range',
          12: 'Last index in this jump range, clipped to the array',
          13: 'Sweep the fresh part of the range',
          14: "Only '0' slots can be landed on",
          15: 'Enqueue the newly reachable index',
          16: 'Everything up to end is now scanned',
          17: 'Frontier drained without reaching the goal',
        },
        javascript: {
          1: 'Define function taking s, minJump, maxJump',
          2: 'Length of the string',
          3: 'BFS frontier, seeded with the starting index',
          4: 'Highest index already expanded — never rescan below it',
          5: 'Standard BFS loop',
          6: 'Take the next reachable index',
          7: 'Reached the last index',
          8: 'First unscanned index in this jump range',
          9: 'Last index in this jump range, clipped to the array',
          10: 'Sweep the fresh part of the range',
          11: "Enqueue '0' slots — the only landable ones",
          13: 'Everything up to end is now scanned',
          15: 'Frontier drained without reaching the goal',
        },
        java: {
          1: 'Define method taking s, minJump, maxJump',
          2: 'Length of the string',
          3: 'BFS frontier',
          4: 'Seed it with the starting index',
          5: 'Highest index already expanded — never rescan below it',
          6: 'Standard BFS loop',
          7: 'Take the next reachable index',
          8: 'Reached the last index',
          9: 'First unscanned index in this jump range',
          10: 'Last index in this jump range, clipped to the array',
          11: 'Sweep the fresh part of the range',
          12: "Enqueue '0' slots — the only landable ones",
          14: 'Everything up to end is now scanned',
          16: 'Frontier drained without reaching the goal',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking s, minJump, maxJump',
      2: 'Length of the string',
      3: 'dp[i] = can we stand on index i?',
      4: 'We start on index 0',
      5: 'pre = how many reachable indices sit in the current take-off window',
      6: 'Fill dp left to right',
      7: 'A new take-off point enters the window at i - minJump',
      8: 'Add its dp value to the running count',
      9: 'The window slid past i - maxJump - 1',
      10: 'Remove that stale dp value',
      11: "Reachable iff some take-off point exists and this slot is a '0'",
      12: 'The answer is the last dp entry',
    },
    javascript: {
      1: 'Define function taking s, minJump, maxJump',
      2: 'Length of the string',
      3: 'dp[i] = can we stand on index i?',
      4: 'We start on index 0',
      5: 'pre = how many reachable indices sit in the current take-off window',
      6: 'Fill dp left to right',
      7: 'A new take-off point enters the window at i - minJump',
      8: 'The window slid past i - maxJump - 1, drop it',
      9: "Reachable iff some take-off point exists and this slot is a '0'",
      11: 'The answer is the last dp entry',
    },
    java: {
      1: 'Define method taking s, minJump, maxJump',
      2: 'Length of the string',
      3: 'dp[i] = can we stand on index i?',
      4: 'We start on index 0',
      5: 'pre = how many reachable indices sit in the current take-off window',
      6: 'Fill dp left to right',
      7: 'A new take-off point enters the window at i - minJump',
      8: 'The window slid past i - maxJump - 1, drop it',
      9: "Reachable iff some take-off point exists and this slot is a '0'",
      11: 'The answer is the last dp entry',
    },
  },
};
