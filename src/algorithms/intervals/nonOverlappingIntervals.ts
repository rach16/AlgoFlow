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

function runNonOverlappingIntervalsSortByStart(input: unknown): AlgorithmStep[] {
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
    message: `Sort by start time instead of end time. On each overlap, greedily discard the interval with the LARGER end — it threatens more future intervals.`,
    codeLine: 2,
  } as AlgorithmStep);

  const sorted = intervals.map(iv => [...iv]).sort((a, b) => a[0] - b[0]);

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: `Sorted by start time`,
    },
    highlights: [],
    message: `Sorted by start time: [${sorted.map(s => `[${s.join(',')}]`).join(', ')}].`,
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
      result: `Removals: 0, prevEnd: ${prevEnd}`,
    },
    highlights: [],
    message: `Keep first interval [${sorted[0].join(', ')}]. prevEnd = ${prevEnd}.`,
    codeLine: 4,
    action: 'insert',
  } as AlgorithmStep);

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];

    if (start < prevEnd) {
      removals++;

      if (end < prevEnd) {
        // Current interval ends earlier: drop the previously kept one instead
        kept.pop();
        kept.push(i);

        steps.push({
          state: {
            intervals: sorted.map(iv => [...iv]),
            intervalHighlights: kept.map(k => k),
            intervalSecondary: [i],
            result: `Removals: ${removals}, prevEnd: ${end}`,
          },
          highlights: [],
          message: `[${start},${end}] overlaps (start ${start} < prevEnd ${prevEnd}), but ends earlier — drop the PREVIOUS interval and keep this one. prevEnd = ${end}. Removals = ${removals}.`,
          codeLine: 9,
          action: 'delete',
        } as AlgorithmStep);

        prevEnd = end;
      } else {
        steps.push({
          state: {
            intervals: sorted.map(iv => [...iv]),
            intervalHighlights: kept.map(k => k),
            intervalSecondary: [i],
            result: `Removals: ${removals}, prevEnd: ${prevEnd}`,
          },
          highlights: [],
          message: `[${start},${end}] overlaps (start ${start} < prevEnd ${prevEnd}) and ends later — drop IT, since the longer reach could only cause more overlaps. Removals = ${removals}.`,
          codeLine: 8,
          action: 'delete',
        } as AlgorithmStep);
      }
    } else {
      prevEnd = end;
      kept.push(i);

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: kept.map(k => k),
          intervalSecondary: [],
          result: `Removals: ${removals}, prevEnd: ${prevEnd}`,
        },
        highlights: [],
        message: `[${start},${end}] starts at ${start} >= prevEnd — no overlap. Keep it and update prevEnd = ${end}.`,
        codeLine: 11,
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
    message: `Done! Minimum intervals to remove = ${removals}. The min(prevEnd, end) trick makes sort-by-start match the sort-by-end greedy.`,
    codeLine: 13,
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
  optimalApproachName: 'Greedy (Sort by End)',
  approaches: [
    {
      id: 'sort-by-start-max-end',
      name: 'Greedy (Sort by Start)',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      description:
        'Sorts by start instead of end: on every overlap, count a removal and keep whichever interval ends sooner (prevEnd = min), discarding the far-reaching one — equivalent greedy, different invariant.',
      code: {
        python: `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda x: x[0])
    count = 0
    prevEnd = intervals[0][1]

    for start, end in intervals[1:]:
        if start < prevEnd:
            count += 1
            prevEnd = min(prevEnd, end)
        else:
            prevEnd = end

    return count`,
        javascript: `function eraseOverlapIntervals(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    let count = 0;
    let prevEnd = intervals[0][1];

    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < prevEnd) {
            count++;
            prevEnd = Math.min(prevEnd, intervals[i][1]);
        } else {
            prevEnd = intervals[i][1];
        }
    }

    return count;
}`,
        java: `public static int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    int count = 0;
    int prevEnd = intervals[0][1];

    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < prevEnd) {
            count++;
            prevEnd = Math.min(prevEnd, intervals[i][1]);
        } else {
            prevEnd = intervals[i][1];
        }
    }

    return count;
}`,
      },
      run: runNonOverlappingIntervalsSortByStart,
      lineExplanations: {
        python: {
          1: 'Define function taking intervals list',
          2: 'Sort intervals by START time (not end)',
          3: 'Count of intervals to remove',
          4: 'End of the last kept interval',
          6: 'Iterate remaining intervals in start order',
          7: 'Current starts before the kept interval ends — overlap',
          8: 'One of the two must be removed',
          9: 'Keep whichever ends sooner: the smaller end threatens fewer future intervals',
          10: 'Otherwise no overlap',
          11: 'Keep current interval; its end becomes prevEnd',
          13: 'Return minimum number of removals',
        },
        javascript: {
          1: 'Define function taking intervals array',
          2: 'Sort intervals by START time (not end)',
          3: 'Count of intervals to remove',
          4: 'End of the last kept interval',
          6: 'Iterate remaining intervals in start order',
          7: 'Current starts before the kept interval ends — overlap',
          8: 'One of the two must be removed',
          9: 'Keep whichever ends sooner: the smaller end threatens fewer future intervals',
          11: 'No overlap: keep current, its end becomes prevEnd',
          15: 'Return minimum number of removals',
        },
        java: {
          1: 'Define method taking intervals 2D array',
          2: 'Sort intervals by START time (not end)',
          3: 'Count of intervals to remove',
          4: 'End of the last kept interval',
          6: 'Iterate remaining intervals in start order',
          7: 'Current starts before the kept interval ends — overlap',
          8: 'One of the two must be removed',
          9: 'Keep whichever ends sooner: the smaller end threatens fewer future intervals',
          11: 'No overlap: keep current, its end becomes prevEnd',
          15: 'Return minimum number of removals',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking intervals list',
      2: 'Sort intervals by end time for greedy',
      3: 'Count of intervals to remove',
      4: 'Track end time of last kept interval',
      6: 'Iterate remaining intervals after first',
      7: 'Check if current overlaps with previous',
      8: 'Overlap found: increment removal count',
      10: 'No overlap: update previous end time',
      12: 'Return minimum number of removals',
    },
    javascript: {
      1: 'Define function taking intervals array',
      2: 'Sort intervals by end time for greedy',
      3: 'Count of intervals to remove',
      4: 'Track end time of last kept interval',
      6: 'Iterate from second interval onward',
      7: 'Check if current overlaps with previous',
      8: 'Overlap found: increment removal count',
      10: 'No overlap: update previous end time',
      14: 'Return minimum number of removals',
    },
    java: {
      1: 'Define method taking intervals 2D array',
      2: 'Sort intervals by end time for greedy',
      3: 'Count of intervals to remove',
      4: 'Track end time of last kept interval',
      6: 'Iterate from second interval onward',
      7: 'Check if current overlaps with previous',
      8: 'Overlap found: increment removal count',
      10: 'No overlap: update previous end time',
      14: 'Return minimum number of removals',
    },
  },
};
