import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runNonOverlappingIntervals(input: unknown): AlgorithmStep[] {
  const intervals = (input as number[][]).map(iv => [...iv]);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: 'Finding minimum removals for non-overlapping...',
    },
    highlights: [],
    message: `Sort intervals by end time, then greedily keep non-overlapping ones.`,
    codeLine: 1,
  } as AlgorithmStep);

  const sorted = intervals.map(iv => [...iv]).sort((a, b) => a[1] - b[1]);

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: `Sorted by end time`,
    },
    highlights: [],
    message: `Sorted by end time: [${sorted.map(s => `[${s.join(',')}]`).join(', ')}].`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  let removals = 0;
  let prevEnd = sorted[0][1];
  const kept: number[] = [0];

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [0],
      intervalSecondary: [],
      result: `Removals: 0, Last end: ${prevEnd}`,
    },
    highlights: [],
    message: `Keep first interval [${sorted[0].join(', ')}]. Previous end = ${prevEnd}.`,
    codeLine: 3,
    action: 'insert',
  } as AlgorithmStep);

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];

    if (start < prevEnd) {
      // Overlapping - remove this interval
      removals++;

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: kept.map(k => k),
          intervalSecondary: [i],
          result: `Removals: ${removals}`,
        },
        highlights: [],
        message: `[${start},${end}] starts at ${start} < prevEnd ${prevEnd}. Overlaps! Remove. Removals = ${removals}.`,
        codeLine: 5,
        action: 'delete',
      } as AlgorithmStep);
    } else {
      // Non-overlapping - keep
      prevEnd = end;
      kept.push(i);

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: kept.map(k => k),
          intervalSecondary: [],
          result: `Removals: ${removals}`,
        },
        highlights: [],
        message: `[${start},${end}] starts at ${start} >= prevEnd ${prevEnd}. Keep! Update prevEnd = ${end}.`,
        codeLine: 7,
        action: 'insert',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: kept.map(k => k),
      intervalSecondary: [],
      result: `Minimum removals: ${removals}`,
    },
    highlights: [],
    message: `Done! Minimum intervals to remove = ${removals}. Kept ${kept.length} intervals.`,
    codeLine: 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const nonOverlappingIntervals: Algorithm = {
  id: 'non-overlapping-intervals',
  name: 'Non-overlapping Intervals',
  category: 'Intervals',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — sort by end, keep non-overlapping, count removals',
  description:
    'Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.',
  problemUrl: 'https://leetcode.com/problems/non-overlapping-intervals/',
  code: {
    python: `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda x: x[1])
    count = 0
    prevEnd = intervals[0][1]

    for start, end in intervals[1:]:
        if start < prevEnd:
            count += 1
        else:
            prevEnd = end

    return count`,
    javascript: `function eraseOverlapIntervals(intervals) {
    intervals.sort((a, b) => a[1] - b[1]);
    let count = 0;
    let prevEnd = intervals[0][1];

    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < prevEnd) {
            count++;
        } else {
            prevEnd = intervals[i][1];
        }
    }

    return count;
}`,
    java: `public static int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
    int count = 0;
    int prevEnd = intervals[0][1];

    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < prevEnd) {
            count++;
        } else {
            prevEnd = intervals[i][1];
        }
    }

    return count;
}`,
  },
  defaultInput: [[1, 2], [2, 3], [3, 4], [1, 3]],
  run: runNonOverlappingIntervals,
};
