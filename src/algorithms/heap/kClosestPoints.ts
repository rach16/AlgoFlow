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

function runKClosestPointsSort(input: unknown): AlgorithmStep[] {
  const { points, k } = input as KClosestInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      hashMap: {},
      nums: [],
    },
    highlights: [],
    message: `Find the ${k} closest point(s) to origin from ${points.length} points — by simply sorting ALL points by distance.`,
    codeLine: 1,
  });

  const dists = points.map((p) => ({
    point: p,
    dist: p[0] * p[0] + p[1] * p[1],
  }));

  const distMap: Record<string, number> = {};
  for (const d of dists) {
    distMap[`(${d.point[0]},${d.point[1]})`] = d.dist;
  }

  steps.push({
    state: {
      hashMap: distMap,
      nums: dists.map((d) => d.dist),
    },
    highlights: [],
    message: `Compute squared distances (no sqrt needed — order is preserved): ${dists.map((d) => `(${d.point[0]},${d.point[1]})=${d.dist}`).join(', ')}`,
    codeLine: 2,
    action: 'visit',
  });

  dists.sort((a, b) => a.dist - b.dist);

  steps.push({
    state: {
      hashMap: Object.fromEntries(
        dists.map((d) => [`(${d.point[0]},${d.point[1]})`, d.dist])
      ),
      nums: dists.map((d) => d.dist),
    },
    highlights: [],
    message: `Sort all points by distance ascending: [${dists.map((d) => d.dist).join(', ')}]. Closest points move to the front.`,
    codeLine: 3,
    action: 'swap',
  });

  for (let i = 0; i < k; i++) {
    steps.push({
      state: {
        hashMap: Object.fromEntries(
          dists.map((d) => [`(${d.point[0]},${d.point[1]})`, d.dist])
        ),
        nums: dists.map((d) => d.dist),
      },
      highlights: [i],
      secondary: Array.from({ length: i }, (_, j) => j),
      message: `Take dists[${i}]: point (${dists[i].point[0]},${dists[i].point[1]}) with distance ${dists[i].dist}`,
      codeLine: 4,
      action: 'visit',
    });
  }

  const result = dists.slice(0, k).map((d) => d.point);

  steps.push({
    state: {
      hashMap: Object.fromEntries(
        dists.slice(0, k).map((d) => [`(${d.point[0]},${d.point[1]})`, d.dist])
      ),
      nums: dists.slice(0, k).map((d) => d.dist),
      result,
    },
    highlights: Array.from({ length: k }, (_, i) => i),
    message: `Result: first ${k} of the sorted list = [${result.map((p) => `[${p.join(',')}]`).join(', ')}]. Simpler than a heap, but sorts all n points.`,
    codeLine: 4,
    action: 'found',
  });

  return steps;
}

export const kClosestPoints: Algorithm = {
  id: 'k-closest-points',
  name: 'K Closest Points to Origin',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n + k log n)',
  spaceComplexity: 'O(n)',
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
  optimalApproachName: 'Min-Heap of Distances',
  approaches: [
    {
      id: 'sort-by-distance',
      name: 'Sort by Distance',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Sort every point by squared distance and take the first k — a two-liner that beats the heap for readability, but sorts all n points instead of maintaining just k.',
      code: {
        python: `def kClosest(points, k):
    dists = [(x * x + y * y, [x, y]) for x, y in points]
    dists.sort()
    return [p for _, p in dists[:k]]`,
        javascript: `function kClosest(points, k) {
    const sorted = [...points].sort(
        (a, b) => (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1])
    );
    return sorted.slice(0, k);
}`,
        java: `public static int[][] kClosest(int[][] points, int k) {
    Arrays.sort(points, (a, b) ->
        (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1]));
    return Arrays.copyOf(points, k);
}`,
      },
      run: runKClosestPointsSort,
      lineExplanations: {
        python: {
          1: 'Define function with points and k',
          2: 'Pair each point with its squared distance (sqrt unnecessary — order is the same)',
          3: 'Sort by distance ascending — closest points first',
          4: 'Return the points from the first k pairs',
        },
        javascript: {
          1: 'Define function with points and k',
          2: 'Copy the array and sort it',
          3: 'Compare by squared Euclidean distance',
          5: 'First k of the sorted array are the k closest',
        },
        java: {
          1: 'Define method with points and k',
          2: 'Sort points in place with a comparator',
          3: 'Compare by squared Euclidean distance',
          4: 'First k of the sorted array are the k closest',
        },
      },
    },
  ],
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
