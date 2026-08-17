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

function runMergeIntervalsSweepLine(input: unknown): AlgorithmStep[] {
  const intervals = (input as number[][]).map(iv => [...iv]);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: [],
      result: 'Building sweep line events...',
    },
    highlights: [],
    message: `Sweep line idea: turn each interval into two events — +1 where it starts, -1 where it ends — and sweep left to right counting coverage.`,
    codeLine: 2,
  } as AlgorithmStep);

  const events: { pos: number; delta: number; ivIdx: number }[] = [];
  intervals.forEach((iv, idx) => {
    events.push({ pos: iv[0], delta: 1, ivIdx: idx });
    events.push({ pos: iv[1], delta: -1, ivIdx: idx });
  });
  // Starts before ends at the same coordinate, so touching intervals merge
  events.sort((a, b) => a.pos - b.pos || b.delta - a.delta);

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: [],
      result: `Events: ${events.map(e => `${e.pos}${e.delta > 0 ? '+' : '-'}`).join(' ')}`,
    },
    highlights: [],
    message: `Sorted ${events.length} events by position (starts before ends on ties, so touching intervals still merge): ${events.map(e => `(${e.pos}, ${e.delta > 0 ? '+1' : '-1'})`).join(', ')}.`,
    codeLine: 6,
    action: 'visit',
  } as AlgorithmStep);

  const merged: number[][] = [];
  let count = 0;
  let openStart = 0;

  for (const e of events) {
    if (count === 0 && e.delta === 1) {
      openStart = e.pos;
      count += e.delta;

      steps.push({
        state: {
          intervals: intervals.map(iv => [...iv]),
          intervalHighlights: [e.ivIdx],
          intervalSecondary: [],
          resultIntervals: merged.map(m => [...m]),
          result: `Coverage 0 → 1 at ${e.pos}: open a merged region`,
        },
        highlights: [],
        message: `Start event at ${e.pos}: coverage rises from 0 to 1 — a new merged region opens here.`,
        codeLine: 12,
        action: 'push',
      } as AlgorithmStep);
    } else {
      count += e.delta;

      if (count === 0) {
        merged.push([openStart, e.pos]);

        steps.push({
          state: {
            intervals: intervals.map(iv => [...iv]),
            intervalHighlights: [e.ivIdx],
            intervalSecondary: [],
            resultIntervals: merged.map(m => [...m]),
            result: `Coverage back to 0: close [${openStart}, ${e.pos}]`,
          },
          highlights: [],
          message: `End event at ${e.pos}: coverage drops back to 0 — close the merged region [${openStart}, ${e.pos}].`,
          codeLine: 15,
          action: 'insert',
        } as AlgorithmStep);
      } else {
        steps.push({
          state: {
            intervals: intervals.map(iv => [...iv]),
            intervalHighlights: [e.ivIdx],
            intervalSecondary: [],
            resultIntervals: merged.map(m => [...m]),
            result: `Coverage now ${count}: still inside a merged region`,
          },
          highlights: [],
          message: `${e.delta > 0 ? 'Start' : 'End'} event at ${e.pos}: coverage is now ${count} — still inside an open region, nothing closes yet.`,
          codeLine: 13,
          action: e.delta > 0 ? 'push' : 'pop',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      resultIntervals: merged.map(m => [...m]),
      result: `Result: [${merged.map(m => `[${m.join(',')}]`).join(', ')}]`,
    },
    highlights: [],
    message: `Done! Every stretch where coverage stayed above 0 became one merged interval: [${merged.map(m => `[${m.join(',')}]`).join(', ')}].`,
    codeLine: 17,
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
    java: `public static int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> merged = new ArrayList<>();
    merged.add(intervals[0]);

    for (int i = 1; i < intervals.length; i++) {
        int[] last = merged.get(merged.size() - 1);
        if (intervals[i][0] <= last[1]) {
            last[1] = Math.max(last[1], intervals[i][1]);
        } else {
            merged.add(intervals[i]);
        }
    }

    return merged.toArray(new int[merged.size()][]);
}`,
  },
  defaultInput: [[1, 3], [2, 6], [8, 10], [15, 18]],
  run: runMergeIntervals,
  optimalApproachName: 'Sort + Linear Merge',
  approaches: [
    {
      id: 'sweep-line-events',
      name: 'Sweep Line (Events)',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of merging interval objects pairwise, split each interval into +1/-1 boundary events and sweep left to right — a merged interval is any stretch where the coverage counter stays above zero.',
      code: {
        python: `def merge(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    events.sort(key=lambda e: (e[0], -e[1]))

    merged = []
    count = 0
    for pos, delta in events:
        if count == 0 and delta == 1:
            openStart = pos
        count += delta
        if count == 0:
            merged.append([openStart, pos])

    return merged`,
        javascript: `function merge(intervals) {
    const events = [];
    for (const [start, end] of intervals) {
        events.push([start, 1]);
        events.push([end, -1]);
    }
    events.sort((a, b) => a[0] - b[0] || b[1] - a[1]);

    const merged = [];
    let count = 0, openStart = 0;
    for (const [pos, delta] of events) {
        if (count === 0 && delta === 1) openStart = pos;
        count += delta;
        if (count === 0) merged.push([openStart, pos]);
    }

    return merged;
}`,
        java: `public static int[][] merge(int[][] intervals) {
    int n = intervals.length;
    int[][] events = new int[2 * n][2];
    for (int i = 0; i < n; i++) {
        events[2 * i] = new int[] { intervals[i][0], 1 };
        events[2 * i + 1] = new int[] { intervals[i][1], -1 };
    }
    Arrays.sort(events, (a, b) -> a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);

    List<int[]> merged = new ArrayList<>();
    int count = 0, openStart = 0;
    for (int[] e : events) {
        if (count == 0 && e[1] == 1) openStart = e[0];
        count += e[1];
        if (count == 0) merged.add(new int[] { openStart, e[0] });
    }

    return merged.toArray(new int[merged.size()][]);
}`,
      },
      run: runMergeIntervalsSweepLine,
      lineExplanations: {
        python: {
          1: 'Define function taking intervals list',
          2: 'Event list: interval boundaries with +1/-1 deltas',
          3: 'Split every interval into two events',
          4: 'Start event: coverage rises by 1',
          5: 'End event: coverage falls by 1',
          6: 'Sort by position; starts before ends on ties so touching intervals merge',
          8: 'Output list of merged intervals',
          9: 'Coverage counter: how many intervals overlap here',
          10: 'Sweep across events left to right',
          11: 'Coverage rising from 0 means a merged region opens',
          12: 'Remember where the region opened',
          13: 'Apply the +1/-1 delta',
          14: 'Coverage back to 0 means the region ends',
          15: 'Record the completed merged interval',
          17: 'Return all merged intervals',
        },
        javascript: {
          1: 'Define function taking intervals array',
          2: 'Event list: interval boundaries with +1/-1 deltas',
          3: 'Split every interval into two events',
          4: 'Start event: coverage rises by 1',
          5: 'End event: coverage falls by 1',
          7: 'Sort by position; starts before ends on ties so touching intervals merge',
          9: 'Output array of merged intervals',
          10: 'Coverage counter and current region start',
          11: 'Sweep across events left to right',
          12: 'Coverage rising from 0 opens a merged region',
          13: 'Apply the +1/-1 delta',
          14: 'Coverage back to 0 closes and records the region',
          17: 'Return all merged intervals',
        },
        java: {
          1: 'Define method taking intervals 2D array',
          2: 'Number of intervals',
          3: 'Two events per interval: boundary position + delta',
          4: 'Split every interval into two events',
          5: 'Start event: coverage rises by 1',
          6: 'End event: coverage falls by 1',
          8: 'Sort by position; starts before ends on ties so touching intervals merge',
          10: 'Output list of merged intervals',
          11: 'Coverage counter and current region start',
          12: 'Sweep across events left to right',
          13: 'Coverage rising from 0 opens a merged region',
          14: 'Apply the +1/-1 delta',
          15: 'Coverage back to 0 closes and records the region',
          18: 'Convert list to 2D array and return',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking intervals list',
      2: 'Sort intervals by start time',
      3: 'Init merged list with first interval',
      5: 'Iterate remaining intervals',
      6: 'Get end time of last merged interval',
      7: 'Check if current overlaps with last merged',
      8: 'Extend last merged interval end time',
      10: 'No overlap: add as new merged interval',
      12: 'Return all merged intervals',
    },
    javascript: {
      1: 'Define function taking intervals array',
      2: 'Sort intervals by start time',
      3: 'Init merged array with first interval',
      5: 'Iterate from second interval onward',
      6: 'Reference last merged interval',
      7: 'Check if current overlaps with last merged',
      8: 'Extend last merged interval end time',
      10: 'No overlap: push as new merged interval',
      14: 'Return all merged intervals',
    },
    java: {
      1: 'Define method taking intervals 2D array',
      2: 'Sort intervals by start time',
      3: 'Init merged list',
      4: 'Add first interval to merged list',
      6: 'Iterate from second interval onward',
      7: 'Reference last merged interval',
      8: 'Check if current overlaps with last merged',
      9: 'Extend last merged interval end time',
      11: 'No overlap: add as new merged interval',
      15: 'Convert list to 2D array and return',
    },
  },
};
