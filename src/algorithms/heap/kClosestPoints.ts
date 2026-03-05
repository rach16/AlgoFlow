import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface KClosestInput {
  points: number[][];
  k: number;
}

function runKClosestPoints(input: unknown): AlgorithmStep[] {
  const { points, k } = input as KClosestInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      hashMap: {},
      nums: [],
    },
    highlights: [],
    message: `Find the ${k} closest point(s) to origin from ${points.length} points.`,
    codeLine: 1,
  });

  // Compute distances
  const distances: { point: number[]; dist: number; idx: number }[] = points.map(
    (p, i) => ({
      point: p,
      dist: p[0] * p[0] + p[1] * p[1],
      idx: i,
    })
  );

  const distMap: Record<string, number> = {};
  for (const d of distances) {
    distMap[`(${d.point[0]},${d.point[1]})`] = d.dist;
  }

  steps.push({
    state: {
      hashMap: distMap,
      nums: distances.map((d) => d.dist),
    },
    highlights: [],
    message: `Calculate squared distances: ${distances.map((d) => `(${d.point[0]},${d.point[1]})=${d.dist}`).join(', ')}`,
    codeLine: 2,
    action: 'visit',
  });

  // Use a max-heap of size k: keep track of k smallest distances
  // We'll simulate with a sorted array (max at front)
  const heap: { point: number[]; dist: number }[] = [];

  for (let i = 0; i < distances.length; i++) {
    const { point, dist } = distances[i];
    const pointLabel = `(${point[0]},${point[1]})`;

    steps.push({
      state: {
        hashMap: {
          ...Object.fromEntries(heap.map((h) => [`(${h.point[0]},${h.point[1]})`, h.dist])),
          current: `${pointLabel}=${dist}`,
        },
        nums: heap.map((h) => h.dist),
      },
      highlights: [],
      message: `Process point ${pointLabel}, distance=${dist}`,
      codeLine: 4,
      action: 'visit',
    });

    heap.push({ point, dist });
    heap.sort((a, b) => b.dist - a.dist); // max-heap: largest first

    if (heap.length > k) {
      const removed = heap.shift()!;
      steps.push({
        state: {
          hashMap: Object.fromEntries(
            heap.map((h) => [`(${h.point[0]},${h.point[1]})`, h.dist])
          ),
          nums: heap.map((h) => h.dist),
        },
        highlights: [0],
        message: `Heap size > k=${k}. Remove farthest point (${removed.point[0]},${removed.point[1]}) with dist=${removed.dist}`,
        codeLine: 6,
        action: 'pop',
      });
    } else {
      steps.push({
        state: {
          hashMap: Object.fromEntries(
            heap.map((h) => [`(${h.point[0]},${h.point[1]})`, h.dist])
          ),
          nums: heap.map((h) => h.dist),
        },
        highlights: [heap.length - 1],
        message: `Added ${pointLabel} to heap. Heap size=${heap.length} <= k=${k}`,
        codeLine: 5,
        action: 'push',
      });
    }
  }

  const result = heap.map((h) => h.point);

  steps.push({
    state: {
      hashMap: Object.fromEntries(
        heap.map((h) => [`(${h.point[0]},${h.point[1]})`, h.dist])
      ),
      nums: heap.map((h) => h.dist),
      result,
    },
    highlights: heap.map((_, idx) => idx),
    message: `Result: ${k} closest point(s) = [${result.map((p) => `[${p.join(',')}]`).join(', ')}]`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const kClosestPoints: Algorithm = {
  id: 'k-closest-points',
  name: 'K Closest Points to Origin',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n log k)',
  spaceComplexity: 'O(k)',
  pattern: 'Max Heap — keep k closest by distance',
  description:
    'Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0). The distance between two points on the X-Y plane is the Euclidean distance.',
  problemUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/',
  code: {
    python: `import heapq

def kClosest(points, k):
    minHeap = []
    for x, y in points:
        dist = x**2 + y**2
        minHeap.append([dist, x, y])
    heapq.heapify(minHeap)

    result = []
    for _ in range(k):
        dist, x, y = heapq.heappop(minHeap)
        result.append([x, y])
    return result`,
    javascript: `function kClosest(points, k) {
    const minHeap = new MinPriorityQueue({
        priority: (p) => p[0] * p[0] + p[1] * p[1]
    });
    for (const p of points)
        minHeap.enqueue(p);

    const result = [];
    for (let i = 0; i < k; i++)
        result.push(minHeap.dequeue().element);
    return result;
}`,
    java: `public static int[][] kClosest(int[][] points, int k) {
    PriorityQueue<int[]> minHeap = new PriorityQueue<>(
        (a, b) -> (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1])
    );
    for (int[] point : points) {
        minHeap.offer(point);
    }

    int[][] result = new int[k][2];
    for (int i = 0; i < k; i++) {
        result[i] = minHeap.poll();
    }
    return result;
}`,
  },
  defaultInput: { points: [[1, 3], [-2, 2]], k: 1 },
  run: runKClosestPoints,
  lineExplanations: {
    python: {
      1: 'Import heapq for priority queue operations',
      3: 'Define function with points and k',
      4: 'Init list to build min-heap',
      5: 'Compute squared distance for each point',
      6: 'Calculate x^2 + y^2 distance',
      7: 'Store distance with coordinates',
      8: 'Convert list to valid min-heap',
      10: 'Init result list',
      11: 'Pop k closest points from heap',
      12: 'Extract closest point from heap',
      13: 'Add point coordinates to result',
      14: 'Return k closest points',
    },
    javascript: {
      1: 'Define function with points and k',
      2: 'Create min priority queue by distance',
      3: 'Priority is squared Euclidean distance',
      5: 'Add all points to the heap',
      6: 'Enqueue each point',
      8: 'Init result array',
      9: 'Pop k closest points from heap',
      10: 'Dequeue and add to result',
      11: 'Return k closest points',
    },
    java: {
      1: 'Define method with points and k',
      2: 'Create min-heap sorted by distance',
      3: 'Compare by squared Euclidean distance',
      5: 'Add all points to the heap',
      6: 'Offer each point to the queue',
      9: 'Init result 2D array',
      10: 'Poll k closest points from heap',
      11: 'Extract closest point from heap',
      13: 'Return k closest points',
    },
  },
};
