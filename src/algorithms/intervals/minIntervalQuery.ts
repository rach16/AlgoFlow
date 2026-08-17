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
  const heap: [number, number][] = [];
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

function runMinIntervalQueryBruteForce(input: unknown): AlgorithmStep[] {
  const { intervals, queries } = input as MinIntervalQueryInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      nums: [...queries],
      result: 'Brute force: scan every interval for every query',
    },
    highlights: [],
    message: `Brute force: for each of the ${queries.length} queries, scan all ${intervals.length} intervals and track the smallest one containing it. No sorting, no heap — O(n·q).`,
    codeLine: 2,
  } as AlgorithmStep);

  const result: number[] = [];

  for (let qIdx = 0; qIdx < queries.length; qIdx++) {
    const q = queries[qIdx];
    let best = -1;
    let bestIdx = -1;

    steps.push({
      state: {
        intervals: intervals.map(iv => [...iv]),
        intervalHighlights: [],
        intervalSecondary: [],
        nums: [...queries],
        result: `Query ${q}: scanning all intervals, best = -1`,
      },
      highlights: [qIdx],
      message: `Query ${q}: reset best size to -1 and scan every interval from scratch.`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    for (let i = 0; i < intervals.length; i++) {
      const [l, r] = intervals[i];

      if (l <= q && q <= r) {
        const size = r - l + 1;

        if (best === -1 || size < best) {
          best = size;
          bestIdx = i;

          steps.push({
            state: {
              intervals: intervals.map(iv => [...iv]),
              intervalHighlights: [i],
              intervalSecondary: [],
              nums: [...queries],
              result: `Query ${q}: new best size = ${size}`,
            },
            highlights: [qIdx],
            message: `[${l},${r}] contains ${q} (${l} <= ${q} <= ${r}), size ${size} — new smallest so far.`,
            codeLine: 10,
            action: 'found',
          } as AlgorithmStep);
        } else {
          steps.push({
            state: {
              intervals: intervals.map(iv => [...iv]),
              intervalHighlights: [i],
              intervalSecondary: bestIdx >= 0 ? [bestIdx] : [],
              nums: [...queries],
              result: `Query ${q}: size ${size} >= best ${best}, skip`,
            },
            highlights: [qIdx],
            message: `[${l},${r}] contains ${q} but its size ${size} is not smaller than the current best ${best}.`,
            codeLine: 9,
            action: 'compare',
          } as AlgorithmStep);
        }
      } else {
        steps.push({
          state: {
            intervals: intervals.map(iv => [...iv]),
            intervalHighlights: [i],
            intervalSecondary: [],
            nums: [...queries],
            result: `Query ${q}: [${l},${r}] does not contain it`,
          },
          highlights: [qIdx],
          message: `[${l},${r}] does not contain ${q} — skip.`,
          codeLine: 7,
          action: 'compare',
        } as AlgorithmStep);
      }
    }

    result.push(best);

    steps.push({
      state: {
        intervals: intervals.map(iv => [...iv]),
        intervalHighlights: bestIdx >= 0 ? [bestIdx] : [],
        intervalSecondary: [],
        nums: [...queries],
        result: `answers[${qIdx}] = ${best}`,
      },
      highlights: [qIdx],
      message: best >= 0
        ? `Query ${q} done: smallest containing interval has size ${best}.`
        : `Query ${q} done: no interval contains it, answer -1.`,
      codeLine: 11,
      action: best >= 0 ? 'found' : 'delete',
    } as AlgorithmStep);
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
    message: `Done! Answers: [${result.join(', ')}]. Same result as the heap approach, but every query re-scans all n intervals.`,
    codeLine: 13,
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
    java: `public static int[] minInterval(int[][] intervals, int[] queries) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    int[][] sortedQueries = new int[queries.length][2];
    for (int i = 0; i < queries.length; i++) {
        sortedQueries[i] = new int[]{queries[i], i};
    }
    Arrays.sort(sortedQueries, (a, b) -> a[0] - b[0]);

    int[] result = new int[queries.length];
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    int i = 0;

    for (int[] query : sortedQueries) {
        int q = query[0], idx = query[1];

        while (i < intervals.length && intervals[i][0] <= q) {
            int l = intervals[i][0], r = intervals[i][1];
            heap.offer(new int[]{r - l + 1, r});
            i++;
        }

        while (!heap.isEmpty() && heap.peek()[1] < q) {
            heap.poll();
        }

        result[idx] = heap.isEmpty() ? -1 : heap.peek()[0];
    }

    return result;
}`,
  },
  defaultInput: {
    intervals: [[1, 4], [2, 4], [3, 6], [4, 4]],
    queries: [2, 3, 4, 5],
  },
  run: runMinIntervalQuery,
  optimalApproachName: 'Sort + Min-Heap',
  approaches: [
    {
      id: 'brute-force-scan',
      name: 'Brute Force Scan',
      timeComplexity: 'O(n · q)',
      spaceComplexity: 'O(q)',
      description:
        'Skips all the sorting and heap machinery: for each query, linearly scan every interval and keep the smallest one that contains it — simple but re-does the work for every query.',
      code: {
        python: `def minInterval(intervals, queries):
    result = []

    for q in queries:
        best = -1
        for l, r in intervals:
            if l <= q <= r:
                size = r - l + 1
                if best == -1 or size < best:
                    best = size
        result.append(best)

    return result`,
        javascript: `function minInterval(intervals, queries) {
    const result = [];

    for (const q of queries) {
        let best = -1;
        for (const [l, r] of intervals) {
            if (l <= q && q <= r) {
                const size = r - l + 1;
                if (best === -1 || size < best) best = size;
            }
        }
        result.push(best);
    }

    return result;
}`,
        java: `public static int[] minInterval(int[][] intervals, int[] queries) {
    int[] result = new int[queries.length];

    for (int j = 0; j < queries.length; j++) {
        int q = queries[j];
        int best = -1;
        for (int[] interval : intervals) {
            if (interval[0] <= q && q <= interval[1]) {
                int size = interval[1] - interval[0] + 1;
                if (best == -1 || size < best) best = size;
            }
        }
        result[j] = best;
    }

    return result;
}`,
      },
      run: runMinIntervalQueryBruteForce,
      lineExplanations: {
        python: {
          1: 'Define function with intervals and queries',
          2: 'Answers in query order',
          4: 'Handle each query independently',
          5: 'Best (smallest) containing size found so far; -1 = none',
          6: 'Scan every interval — no sorting, no pruning',
          7: 'Does this interval contain the query point?',
          8: 'Size = number of integers the interval covers',
          9: 'First hit, or smaller than the current best?',
          10: 'Record the new smallest size',
          11: 'Store the answer for this query',
          13: 'Return all answers',
        },
        javascript: {
          1: 'Define function with intervals and queries',
          2: 'Answers in query order',
          4: 'Handle each query independently',
          5: 'Best (smallest) containing size found so far; -1 = none',
          6: 'Scan every interval — no sorting, no pruning',
          7: 'Does this interval contain the query point?',
          8: 'Size = number of integers the interval covers',
          9: 'Keep it if it is the first hit or the smallest yet',
          12: 'Store the answer for this query',
          15: 'Return all answers',
        },
        java: {
          1: 'Define method with intervals and queries',
          2: 'Answers in query order',
          4: 'Handle each query independently',
          5: 'Current query value',
          6: 'Best (smallest) containing size found so far; -1 = none',
          7: 'Scan every interval — no sorting, no pruning',
          8: 'Does this interval contain the query point?',
          9: 'Size = number of integers the interval covers',
          10: 'Keep it if it is the first hit or the smallest yet',
          13: 'Store the answer for this query',
          16: 'Return all answers',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function with intervals and queries',
      2: 'Sort intervals by start time',
      3: 'Sort queries keeping original indices',
      4: 'Init result array with -1 defaults',
      5: 'Min-heap stores (interval size, end)',
      6: 'Pointer for intervals array',
      8: 'Process each query in sorted order',
      9: 'Add intervals starting at or before query',
      10: 'Extract left and right of interval',
      11: 'Push interval size and end to heap',
      12: 'Move to next interval',
      13: 'Remove expired intervals ending before query',
      14: 'Pop intervals that cannot contain query',
      15: 'Answer is smallest valid interval or -1',
      17: 'Return result array in original order',
    },
    javascript: {
      1: 'Define function with intervals and queries',
      2: 'Sort intervals by start time',
      3: 'Sort queries keeping original indices',
      4: 'Init result array with -1 defaults',
      5: 'Min-heap stores [size, end]',
      6: 'Pointer for intervals array',
      8: 'Process each query in sorted order',
      9: 'Add intervals starting at or before query',
      10: 'Extract left and right of interval',
      11: 'Push interval size and end to heap',
      12: 'Sort heap by size for min extraction',
      13: 'Move to next interval',
      15: 'Remove expired intervals ending before query',
      16: 'Answer is smallest valid interval or -1',
      19: 'Return result array in original order',
    },
    java: {
      1: 'Define method with intervals and queries',
      2: 'Sort intervals by start time',
      3: 'Pair queries with original indices',
      4: 'Store query value and original index',
      5: 'Store each query-index pair',
      7: 'Sort query pairs by value',
      9: 'Init result array',
      10: 'Min-heap sorted by interval size',
      11: 'Pointer for intervals array',
      13: 'Process each query in sorted order',
      14: 'Extract query value and original index',
      16: 'Add intervals starting at or before query',
      17: 'Extract left and right of interval',
      18: 'Push interval size and end to heap',
      19: 'Move to next interval',
      22: 'Remove expired intervals ending before query',
      23: 'Pop intervals that cannot contain query',
      26: 'Answer is smallest valid interval or -1',
      29: 'Return result array in original order',
    },
  },
};
