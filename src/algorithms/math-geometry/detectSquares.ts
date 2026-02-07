import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runDetectSquares(input: unknown): AlgorithmStep[] {
  const operations = input as [string, number[]][];
  const steps: AlgorithmStep[] = [];

  const points: Record<string, number> = {}; // "x,y" -> count
  const pointList: number[][] = [];

  steps.push({
    state: {
      hashMap: {},
      result: 'Processing operations...',
    },
    highlights: [],
    message: `DetectSquares: process ${operations.length} operations (add points and count squares).`,
    codeLine: 1,
  });

  for (let opIdx = 0; opIdx < operations.length; opIdx++) {
    const [op, point] = operations[opIdx];

    if (op === 'add') {
      const [x, y] = point;
      const key = `${x},${y}`;
      points[key] = (points[key] || 0) + 1;
      pointList.push([x, y]);

      steps.push({
        state: {
          hashMap: { ...points },
          result: `Added point (${x},${y}). Total unique keys: ${Object.keys(points).length}`,
        },
        highlights: [],
        message: `Operation ${opIdx}: add(${x},${y}). Count at (${x},${y}) = ${points[key]}.`,
        codeLine: 3,
        action: 'insert',
      });
    } else if (op === 'count') {
      const [x, y] = point;
      let count = 0;

      steps.push({
        state: {
          hashMap: { ...points },
          result: `Counting squares with point (${x},${y})...`,
        },
        highlights: [],
        message: `Operation ${opIdx}: count(${x},${y}). Find all squares with this as one corner.`,
        codeLine: 5,
        action: 'visit',
      });

      // For each point that shares the same x (diagonal candidate)
      for (const [px, py] of pointList) {
        // Need a diagonal: |px-x| == |py-y| and both non-zero
        const dx = Math.abs(px - x);
        const dy = Math.abs(py - y);

        if (dx !== dy || dx === 0) continue;

        // Check the other two corners
        const c1Key = `${px},${y}`;
        const c2Key = `${x},${py}`;
        const c1Count = points[c1Key] || 0;
        const c2Count = points[c2Key] || 0;

        if (c1Count > 0 && c2Count > 0) {
          const squareCount = c1Count * c2Count;
          count += squareCount;

          steps.push({
            state: {
              hashMap: { ...points },
              result: `Squares found so far: ${count}`,
            },
            highlights: [],
            message: `Diagonal (${px},${py}): corners (${px},${y}) x${c1Count}, (${x},${py}) x${c2Count}. +${squareCount} squares.`,
            codeLine: 7,
            action: 'found',
          });
        }
      }

      steps.push({
        state: {
          hashMap: { ...points },
          result: `count(${x},${y}) = ${count}`,
        },
        highlights: [],
        message: `count(${x},${y}) = ${count}.`,
        codeLine: 9,
        action: 'found',
      });
    }
  }

  steps.push({
    state: {
      hashMap: { ...points },
      result: 'All operations processed',
    },
    highlights: [],
    message: `Done! Processed all ${operations.length} operations.`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const detectSquares: Algorithm = {
  id: 'detect-squares',
  name: 'Detect Squares',
  category: 'Math & Geometry',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map — count points, check diagonal pairs for squares',
  description:
    'You are given a stream of points on the X-Y plane. Design an algorithm that adds new points from the stream into a data structure. Duplicate points are allowed and should be treated as different points. Given a query point, counts the number of ways to choose three points from the data structure such that the three points and the query point form an axis-aligned square with positive area.',
  problemUrl: 'https://leetcode.com/problems/detect-squares/',
  code: {
    python: `class DetectSquares:
    def __init__(self):
        self.points = defaultdict(int)
        self.point_list = []

    def add(self, point):
        self.points[tuple(point)] += 1
        self.point_list.append(point)

    def count(self, point):
        res = 0
        px, py = point
        for x, y in self.point_list:
            if abs(px-x) != abs(py-y) or px == x:
                continue
            res += self.points[(x, py)] * self.points[(px, y)]
        return res`,
    javascript: `class DetectSquares {
    constructor() {
        this.points = {};
        this.pointList = [];
    }
    add(point) {
        const key = point.join(',');
        this.points[key] = (this.points[key] || 0) + 1;
        this.pointList.push(point);
    }
    count(point) {
        let res = 0;
        const [px, py] = point;
        for (const [x, y] of this.pointList) {
            if (Math.abs(px-x) !== Math.abs(py-y) || px === x) continue;
            res += (this.points[x+','+py] || 0) * (this.points[px+','+y] || 0);
        }
        return res;
    }
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [
    ['add', [3, 10]],
    ['add', [11, 2]],
    ['add', [3, 2]],
    ['count', [11, 10]],
  ],
  run: runDetectSquares,
};
