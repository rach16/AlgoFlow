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
};
