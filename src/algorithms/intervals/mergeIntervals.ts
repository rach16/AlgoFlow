import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMergeIntervals(input: unknown): AlgorithmStep[] {
  const intervals = (input as number[][]).map(iv => [...iv]);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: [],
      result: 'Merging overlapping intervals...',
    },
    highlights: [],
    message: `Merge overlapping intervals. First, sort by start time.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Sort by start time
  const sorted = intervals.map(iv => [...iv]).sort((a, b) => a[0] - b[0]);

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: [],
      result: `Sorted: [${sorted.map(s => `[${s.join(',')}]`).join(', ')}]`,
    },
    highlights: [],
    message: `Sorted intervals: [${sorted.map(s => `[${s.join(',')}]`).join(', ')}].`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  const merged: number[][] = [sorted[0]];

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [0],
      intervalSecondary: [],
      resultIntervals: merged.map(m => [...m]),
      result: `Merged: [[${sorted[0].join(',')}]]`,
    },
    highlights: [],
    message: `Start with first interval [${sorted[0].join(', ')}].`,
    codeLine: 3,
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
      message: `Compare last merged [${last.join(', ')}] with current [${current.join(', ')}].`,
      codeLine: 5,
      action: 'compare',
    } as AlgorithmStep);

    if (current[0] <= last[1]) {
      // Overlapping - merge
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
        message: `Overlap! Merge: [${last.join(', ')}].`,
        codeLine: 6,
        action: 'swap',
      } as AlgorithmStep);
    } else {
      // Non-overlapping - add new
      merged.push([...current]);

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: [i],
          intervalSecondary: [],
          resultIntervals: merged.map(m => [...m]),
          result: `Added new interval [${current.join(',')}]`,
        },
        highlights: [],
        message: `No overlap. Add [${current.join(', ')}] as new interval.`,
        codeLine: 8,
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
    message: `Done! Merged intervals: [${merged.map(m => `[${m.join(',')}]`).join(', ')}].`,
    codeLine: 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const mergeIntervals: Algorithm = {
  id: 'merge-intervals',
  name: 'Merge Intervals',
  category: 'Intervals',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Sort + Merge — sort by start, merge if overlapping',
  description:
    'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
  problemUrl: 'https://leetcode.com/problems/merge-intervals/',
  code: {
    python: `def merge(intervals):
    intervals.sort(key=lambda i: i[0])
    merged = [intervals[0]]

    for start, end in intervals[1:]:
        lastEnd = merged[-1][1]
        if start <= lastEnd:
            merged[-1][1] = max(lastEnd, end)
        else:
            merged.append([start, end])

    return merged`,
    javascript: `function merge(intervals) {
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
    java: `// Java implementation coming soon`,
  },
  defaultInput: [[1, 3], [2, 6], [8, 10], [15, 18]],
  run: runMergeIntervals,
};
