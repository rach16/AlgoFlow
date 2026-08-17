import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCombinations(input: unknown): AlgorithmStep[] {
  const { n, k } = input as { n: number; k: number };
  const steps: AlgorithmStep[] = [];
  const pool = Array.from({ length: n }, (_, i) => i + 1);
  const result: number[][] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      nums: [...pool],
      stack: [],
      hashMap: { n, k, found: 0 },
      result: [],
    },
    highlights: [],
    message: `Choose ${k} of the numbers 1..${n}. A start index keeps every combination increasing, so order never repeats`,
    codeLine: 1,
  });

  function backtrack(start: number, current: number[]) {
    if (current.length === k) {
      result.push([...current]);

      push({
        state: {
          nums: [...pool],
          stack: [...current],
          hashMap: { n, k, found: result.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: current.map((v) => v - 1),
        message: `Path has ${k} numbers — record [${current.join(', ')}] (total: ${result.length})`,
        codeLine: 6,
        action: 'found',
      });
      return;
    }

    for (let i = start; i <= n; i++) {
      current.push(i);

      push({
        state: {
          nums: [...pool],
          stack: [...current],
          hashMap: { n, k, found: result.length, nextStart: i + 1 },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i - 1],
        secondary: current.slice(0, -1).map((v) => v - 1),
        message: `Pick ${i} → path [${current.join(', ')}]. Children may only use ${i + 1}..${n}, which is what forbids [${i}, ${Math.max(1, i - 1)}]-style reorderings`,
        codeLine: 10,
        action: 'push',
      });

      backtrack(i + 1, current);

      const removed = current.pop()!;

      push({
        state: {
          nums: [...pool],
          stack: [...current],
          hashMap: { n, k, found: result.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i - 1],
        message: `Backtrack: drop ${removed} → path [${current.join(', ')}] and try the next candidate`,
        codeLine: 12,
        action: 'pop',
      });
    }
  }

  backtrack(1, []);

  steps.push({
    state: {
      nums: [...pool],
      stack: [],
      hashMap: { n, k, found: result.length },
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! C(${n}, ${k}) = ${result.length} combinations${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''}`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

function runCombinationsOdometer(input: unknown): AlgorithmStep[] {
  const { n, k } = input as { n: number; k: number };
  const steps: AlgorithmStep[] = [];
  const pool = Array.from({ length: n }, (_, i) => i + 1);
  const result: number[][] = [];
  const combo = Array.from({ length: k }, (_, i) => i + 1);
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      nums: [...pool],
      stack: [...combo],
      hashMap: { n, k, found: 0 },
      result: [],
    },
    highlights: combo.map((v) => v - 1),
    message: `No recursion: treat the combination as an odometer. Start at the smallest one, [${combo.join(', ')}], and repeatedly roll it to the next in lexicographic order`,
    codeLine: 3,
  });

  for (;;) {
    result.push([...combo]);

    push({
      state: {
        nums: [...pool],
        stack: [...combo],
        hashMap: { n, k, found: result.length },
        result: result.map((r) => `[${r.join(',')}]`),
      },
      highlights: combo.map((v) => v - 1),
      message: `Record [${combo.join(', ')}] (total: ${result.length})`,
      codeLine: 6,
      action: 'found',
    });

    // Find the rightmost slot that has not hit its ceiling
    let i = k - 1;
    while (i >= 0 && combo[i] === n - k + 1 + i) i--;

    if (i < 0) {
      push({
        state: {
          nums: [...pool],
          stack: [...combo],
          hashMap: { n, k, found: result.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: combo.map((v) => v - 1),
        message: `Every slot sits at its ceiling (${combo.join(', ')}) — the odometer has rolled over, stop`,
        codeLine: 13,
      });
      break;
    }

    const ceiling = n - k + 1 + i;
    combo[i]++;
    for (let j = i + 1; j < k; j++) combo[j] = combo[j - 1] + 1;

    push({
      state: {
        nums: [...pool],
        stack: [...combo],
        hashMap: { n, k, found: result.length, bumped: `slot ${i}` },
        result: result.map((r) => `[${r.join(',')}]`),
      },
      highlights: [combo[i] - 1],
      secondary: combo.slice(i + 1).map((v) => v - 1),
      message: `Slot ${i} was below its ceiling ${ceiling}, so bump it to ${combo[i]} and reset every slot to its right to the tightest run: [${combo.join(', ')}]`,
      codeLine: 15,
      action: 'insert',
    });
  }

  steps.push({
    state: {
      nums: [...pool],
      stack: [],
      hashMap: { n, k, found: result.length },
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! ${result.length} combinations in lexicographic order${suppressed > 0 ? ` (${suppressed} roll steps not shown)` : ''} — O(k) extra space, no call stack`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

export const combinations: Algorithm = {
  id: 'combinations',
  name: 'Combinations',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(k·C(n, k))',
  spaceComplexity: 'O(k)',
  pattern: 'Backtracking — start index keeps combinations increasing',
  description:
    'Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n]. Order within a combination does not matter, so a start index is carried through the recursion to keep each path strictly increasing.',
  problemUrl: 'https://leetcode.com/problems/combinations/',
  code: {
    python: `def combine(n, k):
    result = []

    def backtrack(start, current):
        if len(current) == k:
            result.append(current[:])
            return

        for i in range(start, n + 1):
            current.append(i)
            backtrack(i + 1, current)
            current.pop()

    backtrack(1, [])
    return result`,
    javascript: `function combine(n, k) {
    const result = [];

    function backtrack(start, current) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }

        for (let i = start; i <= n; i++) {
            current.push(i);
            backtrack(i + 1, current);
            current.pop();
        }
    }

    backtrack(1, []);
    return result;
}`,
    java: `public static List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(1, new ArrayList<>(), n, k, result);
    return result;
}

private static void backtrack(int start, List<Integer> current, int n, int k, List<List<Integer>> result) {
    if (current.size() == k) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = start; i <= n; i++) {
        current.add(i);
        backtrack(i + 1, current, n, k, result);
        current.remove(current.size() - 1);
    }
}`,
  },
  defaultInput: { n: 4, k: 2 },
  run: runCombinations,
  optimalApproachName: 'Backtracking (Start Index)',
  approaches: [
    {
      id: 'iterative-odometer',
      name: 'Iterative Odometer',
      timeComplexity: 'O(k·C(n, k))',
      spaceComplexity: 'O(k)',
      description:
        'Emits combinations in lexicographic order without recursion: keep one array of k slots, find the rightmost slot below its ceiling, bump it, and reset the slots to its right to the tightest increasing run.',
      code: {
        python: `def combine(n, k):
    result = []
    combo = list(range(1, k + 1))

    while True:
        result.append(combo[:])

        # Find rightmost slot below its ceiling
        i = k - 1
        while i >= 0 and combo[i] == n - k + 1 + i:
            i -= 1
        if i < 0:
            break

        combo[i] += 1
        for j in range(i + 1, k):
            combo[j] = combo[j - 1] + 1

    return result`,
        javascript: `function combine(n, k) {
    const result = [];
    const combo = Array.from({length: k}, (_, i) => i + 1);

    while (true) {
        result.push([...combo]);

        // Find rightmost slot below its ceiling
        let i = k - 1;
        while (i >= 0 && combo[i] === n - k + 1 + i) {
            i--;
        }
        if (i < 0) break;

        combo[i]++;
        for (let j = i + 1; j < k; j++) {
            combo[j] = combo[j - 1] + 1;
        }
    }

    return result;
}`,
        java: `public static List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> result = new ArrayList<>();
    int[] combo = new int[k];
    for (int i = 0; i < k; i++) combo[i] = i + 1;

    while (true) {
        List<Integer> snapshot = new ArrayList<>();
        for (int v : combo) snapshot.add(v);
        result.add(snapshot);

        // Find rightmost slot below its ceiling
        int i = k - 1;
        while (i >= 0 && combo[i] == n - k + 1 + i) i--;
        if (i < 0) break;

        combo[i]++;
        for (int j = i + 1; j < k; j++) combo[j] = combo[j - 1] + 1;
    }

    return result;
}`,
      },
      run: runCombinationsOdometer,
      lineExplanations: {
        python: {
          1: 'Define function taking n and k',
          2: 'Collect every combination here',
          3: 'Smallest combination in lexicographic order: 1, 2, ..., k',
          5: 'Loop until the odometer rolls past the last combination',
          6: 'Snapshot the current slot values',
          8: 'Slot i can hold at most n - k + 1 + i and still leave room to its right',
          9: 'Scan right to left for a slot with headroom',
          10: 'This slot is maxed out — keep moving left',
          11: 'Step to the next slot left',
          12: 'No slot has headroom: that was the last combination',
          13: 'Exit the loop',
          15: 'Bump the rightmost slot that can grow',
          16: 'Everything to its right restarts at the tightest run',
          17: 'Each following slot is exactly one more than the previous',
          19: 'Return every combination, already sorted lexicographically',
        },
        javascript: {
          1: 'Define function taking n and k',
          2: 'Collect every combination here',
          3: 'Smallest combination in lexicographic order: 1, 2, ..., k',
          5: 'Loop until the odometer rolls past the last combination',
          6: 'Snapshot the current slot values',
          8: 'Slot i can hold at most n - k + 1 + i and still leave room to its right',
          9: 'Scan right to left for a slot with headroom',
          10: 'This slot is maxed out — keep moving left',
          13: 'No slot has headroom: that was the last combination',
          15: 'Bump the rightmost slot that can grow',
          16: 'Everything to its right restarts at the tightest run',
          17: 'Each following slot is exactly one more than the previous',
          21: 'Return every combination, already sorted lexicographically',
        },
        java: {
          1: 'Define method taking n and k',
          2: 'Collect every combination here',
          3: 'One reusable array of k slots',
          4: 'Seed with the smallest combination 1, 2, ..., k',
          6: 'Loop until the odometer rolls past the last combination',
          7: 'Copy the slots into a fresh list',
          8: 'Combinations must be snapshotted, the array keeps mutating',
          9: 'Record this combination',
          11: 'Slot i can hold at most n - k + 1 + i and still leave room to its right',
          12: 'Scan right to left for a slot with headroom',
          13: 'Skip past maxed-out slots',
          14: 'No slot has headroom: that was the last combination',
          16: 'Bump the rightmost slot that can grow',
          17: 'Reset the slots to its right to the tightest increasing run',
          20: 'Return every combination, already sorted lexicographically',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking n and k',
      2: 'Collect every combination here',
      4: 'start is the smallest number this branch may still use',
      5: 'Base case: the path already holds k numbers',
      6: 'Copy it — current keeps mutating as we backtrack',
      7: 'Nothing deeper to explore below a full path',
      9: 'Try every candidate from start up to n',
      10: 'Choose i',
      11: 'Recurse with start = i + 1 so numbers stay strictly increasing',
      12: 'Unchoose and let the loop try the next candidate',
      14: 'Kick off with an empty path allowed to use 1..n',
      15: 'Return all C(n, k) combinations',
    },
    javascript: {
      1: 'Define function taking n and k',
      2: 'Collect every combination here',
      4: 'start is the smallest number this branch may still use',
      5: 'Base case: the path already holds k numbers',
      6: 'Copy it — current keeps mutating as we backtrack',
      7: 'Nothing deeper to explore below a full path',
      10: 'Try every candidate from start up to n',
      11: 'Choose i',
      12: 'Recurse with start = i + 1 so numbers stay strictly increasing',
      13: 'Unchoose and let the loop try the next candidate',
      17: 'Kick off with an empty path allowed to use 1..n',
      18: 'Return all C(n, k) combinations',
    },
    java: {
      1: 'Define method taking n and k',
      2: 'Collect every combination here',
      3: 'Kick off with an empty path allowed to use 1..n',
      4: 'Return all C(n, k) combinations',
      7: 'Helper carries the start index and the shared path',
      8: 'Base case: the path already holds k numbers',
      9: 'Copy it — current keeps mutating as we backtrack',
      10: 'Nothing deeper to explore below a full path',
      13: 'Try every candidate from start up to n',
      14: 'Choose i',
      15: 'Recurse with start = i + 1 so numbers stay strictly increasing',
      16: 'Unchoose and let the loop try the next candidate',
    },
  },
};
