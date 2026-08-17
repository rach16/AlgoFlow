import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface InsertIntervalInput {
  intervals: number[][];
  newInterval: number[];
}

function runInsertInterval(input: unknown): AlgorithmStep[] {
  const { intervals, newInterval } = input as InsertIntervalInput;
  const steps: AlgorithmStep[] = [];

  const allIntervals = intervals.map(iv => [...iv]);
  const toInsert = [...newInterval];
  const result: number[][] = [];

  steps.push({
    state: {
      intervals: allIntervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: [],
      result: `Insert [${toInsert.join(', ')}] into intervals`,
    },
    highlights: [],
    message: `Insert [${toInsert.join(', ')}] into ${allIntervals.length} sorted non-overlapping intervals.`,
    codeLine: 1,
  } as AlgorithmStep);

  let i = 0;

  // Add all intervals that come before newInterval
  while (i < allIntervals.length && allIntervals[i][1] < toInsert[0]) {
    result.push([...allIntervals[i]]);

    steps.push({
      state: {
        intervals: allIntervals.map(iv => [...iv]),
        intervalHighlights: [i],
        intervalSecondary: [],
        resultIntervals: result.map(r => [...r]),
        result: `Added [${allIntervals[i].join(', ')}] before new interval`,
      },
      highlights: [],
      message: `[${allIntervals[i].join(', ')}] ends before new interval starts. Add to result.`,
      codeLine: 3,
      action: 'insert',
    } as AlgorithmStep);

    i++;
  }

  // Merge overlapping intervals
  while (i < allIntervals.length && allIntervals[i][0] <= toInsert[1]) {
    toInsert[0] = Math.min(toInsert[0], allIntervals[i][0]);
    toInsert[1] = Math.max(toInsert[1], allIntervals[i][1]);

    steps.push({
      state: {
        intervals: allIntervals.map(iv => [...iv]),
        intervalHighlights: [i],
        intervalSecondary: [],
        resultIntervals: result.map(r => [...r]),
        result: `Merging: [${toInsert.join(', ')}]`,
      },
      highlights: [],
      message: `[${allIntervals[i].join(', ')}] overlaps. Merge: new interval = [${toInsert.join(', ')}].`,
      codeLine: 5,
      action: 'compare',
    } as AlgorithmStep);

    i++;
  }

  result.push([...toInsert]);

  steps.push({
    state: {
      intervals: allIntervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: result.map(r => [...r]),
      result: `Inserted merged interval [${toInsert.join(', ')}]`,
    },
    highlights: [],
    message: `Add merged interval [${toInsert.join(', ')}] to result.`,
    codeLine: 7,
    action: 'insert',
  } as AlgorithmStep);

  // Add remaining intervals
  while (i < allIntervals.length) {
    result.push([...allIntervals[i]]);

    steps.push({
      state: {
        intervals: allIntervals.map(iv => [...iv]),
        intervalHighlights: [i],
        intervalSecondary: [],
        resultIntervals: result.map(r => [...r]),
        result: `Added [${allIntervals[i].join(', ')}] after merged interval`,
      },
      highlights: [],
      message: `[${allIntervals[i].join(', ')}] starts after merged interval. Add to result.`,
      codeLine: 9,
      action: 'insert',
    } as AlgorithmStep);

    i++;
  }

  steps.push({
    state: {
      intervals: allIntervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: result.map(r => [...r]),
      result: `Result: [${result.map(r => `[${r.join(',')}]`).join(', ')}]`,
    },
    highlights: [],
    message: `Done! Result: [${result.map(r => `[${r.join(',')}]`).join(', ')}].`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runInsertIntervalAppendMerge(input: unknown): AlgorithmStep[] {
  const { intervals, newInterval } = input as InsertIntervalInput;
  const steps: AlgorithmStep[] = [];

  const combined = [...intervals.map(iv => [...iv]), [...newInterval]];
  const newIdx = combined.length - 1;

  steps.push({
    state: {
      intervals: combined.map(iv => [...iv]),
      intervalHighlights: [newIdx],
      intervalSecondary: [],
      resultIntervals: [],
      result: `Appended [${newInterval.join(', ')}] to the list`,
    },
    highlights: [],
    message: `Reduce to a problem we already know: append [${newInterval.join(', ')}] to the list, then run standard Merge Intervals on everything.`,
    codeLine: 2,
    action: 'insert',
  } as AlgorithmStep);

  const sorted = combined.map(iv => [...iv]).sort((a, b) => a[0] - b[0]);

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: [],
      result: `Sorted: [${sorted.map(s => `[${s.join(',')}]`).join(', ')}]`,
    },
    highlights: [],
    message: `Sort all ${sorted.length} intervals by start time. The new interval loses its special status — it is just one interval among many.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  const merged: number[][] = [[...sorted[0]]];

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [0],
      intervalSecondary: [],
      resultIntervals: merged.map(m => [...m]),
      result: `Merged: [[${sorted[0].join(',')}]]`,
    },
    highlights: [],
    message: `Seed the merged list with the first interval [${sorted[0].join(', ')}].`,
    codeLine: 4,
    action: 'insert',
  } as AlgorithmStep);

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];

    steps.push({
      state: {
        intervals: sorted.map(iv => [...iv]),
        intervalHighlights: [i],
        intervalSecondary: [],
        resultIntervals: merged.map(m => [...m]),
        result: `Comparing [${last.join(',')}] with [${current.join(',')}]`,
      },
      highlights: [],
      message: `Does [${current.join(', ')}] start (${current[0]}) at or before the last merged end (${last[1]})?`,
      codeLine: 8,
      action: 'compare',
    } as AlgorithmStep);

    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: [i],
          intervalSecondary: [],
          resultIntervals: merged.map(m => [...m]),
          result: `Merged into [${last.join(',')}]`,
        },
        highlights: [],
        message: `Yes — overlap. Extend the last merged interval to [${last.join(', ')}].`,
        codeLine: 9,
        action: 'swap',
      } as AlgorithmStep);
    } else {
      merged.push([...current]);

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: [i],
          intervalSecondary: [],
          resultIntervals: merged.map(m => [...m]),
          result: `Added [${current.join(',')}]`,
        },
        highlights: [],
        message: `No overlap — start a fresh merged interval [${current.join(', ')}].`,
        codeLine: 11,
        action: 'insert',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: merged.map(m => [...m]),
      result: `Result: [${merged.map(m => `[${m.join(',')}]`).join(', ')}]`,
    },
    highlights: [],
    message: `Done! Result: [${merged.map(m => `[${m.join(',')}]`).join(', ')}]. Same answer as the linear scan, at the cost of an O(n log n) sort.`,
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const insertInterval: Algorithm = {
  id: 'insert-interval',
  name: 'Insert Interval',
  category: 'Intervals',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Intervals — add non-overlapping, merge overlapping, add rest',
  description:
    'You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] represent the start and the end of the ith interval and intervals is sorted in ascending order by starti. You are also given an interval newInterval = [start, end] that represents the start and end of another interval. Insert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals (merge overlapping intervals if necessary).',
  problemUrl: 'https://leetcode.com/problems/insert-interval/',
  code: {
    python: `def insert(intervals, newInterval):
    result = []
    i = 0

    while i < len(intervals) and intervals[i][1] < newInterval[0]:
        result.append(intervals[i])
        i += 1

    while i < len(intervals) and intervals[i][0] <= newInterval[1]:
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i += 1
    result.append(newInterval)

    while i < len(intervals):
        result.append(intervals[i])
        i += 1

    return result`,
    javascript: `function insert(intervals, newInterval) {
    const result = [];
    let i = 0;

    while (i < intervals.length && intervals[i][1] < newInterval[0]) {
        result.push(intervals[i]);
        i++;
    }

    while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.push(newInterval);

    while (i < intervals.length) {
        result.push(intervals[i]);
        i++;
    }

    return result;
}`,
    java: `public static int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> result = new ArrayList<>();
    int i = 0;

    while (i < intervals.length && intervals[i][1] < newInterval[0]) {
        result.add(intervals[i]);
        i++;
    }

    while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.add(newInterval);

    while (i < intervals.length) {
        result.add(intervals[i]);
        i++;
    }

    return result.toArray(new int[result.size()][]);
}`,
  },
  defaultInput: { intervals: [[1, 3], [6, 9]], newInterval: [2, 5] },
  run: runInsertInterval,
  optimalApproachName: 'Three-Phase Linear Scan',
  approaches: [
    {
      id: 'append-and-merge',
      name: 'Append + Merge',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of exploiting the sorted input with a three-phase scan, append the new interval and rerun standard Merge Intervals — simpler to reason about but pays for a redundant sort.',
      code: {
        python: `def insert(intervals, newInterval):
    intervals.append(newInterval)
    intervals.sort(key=lambda i: i[0])
    merged = [intervals[0]]

    for start, end in intervals[1:]:
        lastEnd = merged[-1][1]
        if start <= lastEnd:
            merged[-1][1] = max(lastEnd, end)
        else:
            merged.append([start, end])

    return merged`,
        javascript: `function insert(intervals, newInterval) {
    intervals.push(newInterval);
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
        const last = merged[merged.length - 1];
        if (intervals[i][0] <= last[1]) {
            last[1] = Math.max(last[1], intervals[i][1]);
        } else {
            merged.push([...intervals[i]]);
        }
    }

    return merged;
}`,
        java: `public static int[][] insert(int[][] intervals, int[] newInterval) {
    int[][] all = new int[intervals.length + 1][];
    for (int i = 0; i < intervals.length; i++) all[i] = intervals[i];
    all[intervals.length] = newInterval;
    Arrays.sort(all, (a, b) -> a[0] - b[0]);

    List<int[]> merged = new ArrayList<>();
    merged.add(all[0]);
    for (int i = 1; i < all.length; i++) {
        int[] last = merged.get(merged.size() - 1);
        if (all[i][0] <= last[1]) {
            last[1] = Math.max(last[1], all[i][1]);
        } else {
            merged.add(all[i]);
        }
    }

    return merged.toArray(new int[merged.size()][]);
}`,
      },
      run: runInsertIntervalAppendMerge,
      lineExplanations: {
        python: {
          1: 'Define function with intervals and newInterval',
          2: 'Append newInterval — reduce to plain Merge Intervals',
          3: 'Sort everything by start time (loses the sorted-input advantage)',
          4: 'Seed merged list with the first interval',
          6: 'Walk the remaining intervals in start order',
          7: 'End of the last merged interval',
          8: 'Current starts at or before last end — overlap',
          9: 'Extend the last merged interval to cover both',
          10: 'Otherwise no overlap',
          11: 'Start a fresh merged interval',
          13: 'Return the merged result',
        },
        javascript: {
          1: 'Define function with intervals and newInterval',
          2: 'Push newInterval — reduce to plain Merge Intervals',
          3: 'Sort everything by start time (loses the sorted-input advantage)',
          4: 'Seed merged array with the first interval',
          6: 'Walk the remaining intervals in start order',
          7: 'Reference the last merged interval',
          8: 'Current starts at or before last end — overlap',
          9: 'Extend the last merged interval to cover both',
          11: 'No overlap: start a fresh merged interval',
          15: 'Return the merged result',
        },
        java: {
          1: 'Define method with intervals and newInterval',
          2: 'Allocate an array with room for one extra interval',
          3: 'Copy the existing intervals over',
          4: 'Append newInterval — reduce to plain Merge Intervals',
          5: 'Sort everything by start time (loses the sorted-input advantage)',
          7: 'Result list of merged intervals',
          8: 'Seed merged list with the first interval',
          9: 'Walk the remaining intervals in start order',
          10: 'Reference the last merged interval',
          11: 'Current starts at or before last end — overlap',
          12: 'Extend the last merged interval to cover both',
          14: 'No overlap: start a fresh merged interval',
          18: 'Convert list to 2D array and return',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function with intervals and newInterval',
      2: 'Init result list for merged intervals',
      3: 'Pointer to track current interval index',
      5: 'Add intervals that end before newInterval starts',
      6: 'Append non-overlapping interval to result',
      7: 'Move to next interval',
      9: 'Merge all overlapping intervals with newInterval',
      10: 'Expand newInterval start to cover overlap',
      11: 'Expand newInterval end to cover overlap',
      12: 'Move past merged interval',
      13: 'Add the merged newInterval to result',
      15: 'Add remaining intervals after newInterval',
      16: 'Append remaining interval to result',
      17: 'Move to next interval',
      19: 'Return the merged result',
    },
    javascript: {
      1: 'Define function with intervals and newInterval',
      2: 'Init result array for merged intervals',
      3: 'Pointer to track current interval index',
      5: 'Add intervals ending before newInterval starts',
      6: 'Push non-overlapping interval to result',
      7: 'Move to next interval',
      10: 'Merge all overlapping intervals',
      11: 'Expand start to cover overlap',
      12: 'Expand end to cover overlap',
      13: 'Move past merged interval',
      15: 'Add the merged newInterval to result',
      17: 'Add remaining intervals after newInterval',
      18: 'Push remaining interval to result',
      19: 'Move to next interval',
      22: 'Return the merged result',
    },
    java: {
      1: 'Define method with intervals and newInterval',
      2: 'Init result list for merged intervals',
      3: 'Pointer to track current interval index',
      5: 'Add intervals ending before newInterval starts',
      6: 'Add non-overlapping interval to result',
      7: 'Move to next interval',
      10: 'Merge all overlapping intervals',
      11: 'Expand start to cover overlap',
      12: 'Expand end to cover overlap',
      13: 'Move past merged interval',
      15: 'Add the merged newInterval to result',
      17: 'Add remaining intervals after newInterval',
      18: 'Add remaining interval to result',
      19: 'Move to next interval',
      22: 'Convert result list to 2D array and return',
    },
  },
};
