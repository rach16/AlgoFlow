import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MinIntervalQueryInput {
  intervals: number[][];
  queries: number[];
}

function runMinIntervalQuery(input: unknown): AlgorithmStep[] {
  const { intervals, queries } = input as MinIntervalQueryInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      nums: [...queries],
      result: 'Finding minimum interval for each query...',
    },
    highlights: [],
    message: `For each query, find the smallest interval that contains it. Sort intervals and queries.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Sort intervals by start
  const sortedIntervals = intervals.map((iv, idx) => ({ start: iv[0], end: iv[1], idx }))
    .sort((a, b) => a.start - b.start);

  // Sort queries but keep original index
  const sortedQueries = queries.map((q, idx) => ({ val: q, idx }))
    .sort((a, b) => a.val - b.val);

  steps.push({
    state: {
      intervals: sortedIntervals.map(iv => [iv.start, iv.end]),
      intervalHighlights: [],
      intervalSecondary: [],
      nums: sortedQueries.map(q => q.val),
      result: 'Sorted intervals and queries',
    },
    highlights: [],
    message: `Sorted intervals by start. Process queries in sorted order using a min-heap approach.`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  const result: number[] = new Array(queries.length).fill(-1);
  // Simple priority queue: [size, end]
  let heap: [number, number][] = [];
  let i = 0;

  for (const query of sortedQueries) {
    const q = query.val;

    // Add all intervals that start <= query
    while (i < sortedIntervals.length && sortedIntervals[i].start <= q) {
      const iv = sortedIntervals[i];
      const size = iv.end - iv.start + 1;
      heap.push([size, iv.end]);

      steps.push({
        state: {
          intervals: sortedIntervals.map(iv2 => [iv2.start, iv2.end]),
          intervalHighlights: [i],
          intervalSecondary: [],
          nums: [...queries],
          result: `Query ${q}: added [${iv.start},${iv.end}] (size ${size}) to heap`,
        },
        highlights: [query.idx],
        message: `Query=${q}: interval [${iv.start},${iv.end}] starts at ${iv.start} <= ${q}. Add to heap (size=${size}).`,
        codeLine: 4,
        action: 'push',
      } as AlgorithmStep);

      i++;
    }

    // Remove intervals from heap that end before query
    heap.sort((a, b) => a[0] - b[0]);
    while (heap.length > 0 && heap[0][1] < q) {
      const removed = heap.shift()!;

      steps.push({
        state: {
          intervals: sortedIntervals.map(iv2 => [iv2.start, iv2.end]),
          intervalHighlights: [],
          intervalSecondary: [],
          nums: [...queries],
          result: `Query ${q}: removed expired interval (size ${removed[0]}, end ${removed[1]})`,
        },
        highlights: [query.idx],
        message: `Query=${q}: remove interval ending at ${removed[1]} < ${q} from heap.`,
        codeLine: 6,
        action: 'pop',
      } as AlgorithmStep);
    }

    if (heap.length > 0) {
      result[query.idx] = heap[0][0];

      steps.push({
        state: {
          intervals: sortedIntervals.map(iv2 => [iv2.start, iv2.end]),
          intervalHighlights: [],
          intervalSecondary: [],
          nums: [...queries],
          result: `answers[${query.idx}] = ${heap[0][0]}`,
        },
        highlights: [query.idx],
        message: `Query=${q}: smallest containing interval has size ${heap[0][0]}. Answer[${query.idx}] = ${heap[0][0]}.`,
        codeLine: 8,
        action: 'found',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: {
          intervals: sortedIntervals.map(iv2 => [iv2.start, iv2.end]),
          intervalHighlights: [],
          intervalSecondary: [],
          nums: [...queries],
          result: `answers[${query.idx}] = -1`,
        },
        highlights: [query.idx],
        message: `Query=${q}: no interval contains this query. Answer[${query.idx}] = -1.`,
        codeLine: 9,
        action: 'delete',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      nums: [...queries],
      result: `Result: [${result.join(', ')}]`,
    },
    highlights: [],
    message: `Done! Answers: [${result.join(', ')}].`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const minIntervalQuery: Algorithm = {
  id: 'min-interval-query',
  name: 'Minimum Interval to Include Each Query',
  category: 'Intervals',
  difficulty: 'Hard',
  timeComplexity: 'O(n log n + q log q)',
  spaceComplexity: 'O(n+q)',
  pattern: 'Sort + Min Heap — process queries in order, heap by interval size',
  description:
    'You are given a 2D integer array intervals, where intervals[i] = [lefti, righti] describes the ith interval starting at lefti and ending at righti (inclusive). The size of an interval is defined as the number of integers it contains, or more formally righti - lefti + 1. You are also given an integer array queries. The answer to the jth query is the size of the smallest interval i such that lefti <= queries[j] <= righti. If no such interval exists, the answer is -1.',
  problemUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/',
  code: {
    python: `def minInterval(intervals, queries):
    intervals.sort()
    sortedQueries = sorted(enumerate(queries), key=lambda x: x[1])
    result = [-1] * len(queries)
    heap = []  # (size, end)
    i = 0

    for idx, q in sortedQueries:
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(heap, (r - l + 1, r))
            i += 1
        while heap and heap[0][1] < q:
            heapq.heappop(heap)
        result[idx] = heap[0][0] if heap else -1

    return result`,
    javascript: `function minInterval(intervals, queries) {
    intervals.sort((a, b) => a[0] - b[0]);
    const sorted = queries.map((q, i) => [q, i]).sort((a, b) => a[0] - b[0]);
    const result = new Array(queries.length).fill(-1);
    const heap = []; // [size, end]
    let i = 0;

    for (const [q, idx] of sorted) {
        while (i < intervals.length && intervals[i][0] <= q) {
            const [l, r] = intervals[i];
            heap.push([r - l + 1, r]);
            heap.sort((a, b) => a[0] - b[0]);
            i++;
        }
        while (heap.length && heap[0][1] < q) heap.shift();
        result[idx] = heap.length ? heap[0][0] : -1;
    }

    return result;
}`,
  },
  defaultInput: {
    intervals: [[1, 4], [2, 4], [3, 6], [4, 4]],
    queries: [2, 3, 4, 5],
  },
  run: runMinIntervalQuery,
};
