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

function runDetectSquaresColumnBuckets(input: unknown): AlgorithmStep[] {
  const operations = input as [string, number[]][];
  const steps: AlgorithmStep[] = [];

  const points: Record<string, number> = {}; // "x,y" -> count
  const cols: Record<number, number[]> = {}; // x -> list of y values (with duplicates)

  steps.push({
    state: {
      hashMap: {},
      result: 'Processing operations...',
    },
    highlights: [],
    message: `DetectSquares with column buckets: group points by x-coordinate, so count() only scans points in the query's own column instead of every point ever added.`,
    codeLine: 1,
  });

  for (let opIdx = 0; opIdx < operations.length; opIdx++) {
    const [op, point] = operations[opIdx];

    if (op === 'add') {
      const [x, y] = point;
      const key = `${x},${y}`;
      points[key] = (points[key] || 0) + 1;
      (cols[x] = cols[x] || []).push(y);

      steps.push({
        state: {
          hashMap: { ...points },
          result: `Added (${x},${y}). Column x=${x} now holds [${cols[x].join(', ')}]`,
        },
        highlights: [],
        message: `Operation ${opIdx}: add(${x},${y}). Count at (${x},${y}) = ${points[key]}; y=${y} appended to column bucket x=${x}.`,
        codeLine: 8,
        action: 'insert',
      });
    } else if (op === 'count') {
      const [px, py] = point;
      let count = 0;
      const bucket = cols[px] || [];

      steps.push({
        state: {
          hashMap: { ...points },
          result: `count(${px},${py}): scanning column x=${px} -> [${bucket.join(', ')}]`,
        },
        highlights: [],
        message: `Operation ${opIdx}: count(${px},${py}). Any square with this corner needs a vertical edge in column x=${px}, so scan only that bucket: [${bucket.join(', ')}].`,
        codeLine: 14,
        action: 'visit',
      });

      for (const y of bucket) {
        const d = Math.abs(y - py);
        if (d === 0) continue;

        for (const x2 of [px + d, px - d]) {
          const c1 = points[`${x2},${py}`] || 0;
          const c2 = points[`${x2},${y}`] || 0;

          if (c1 > 0 && c2 > 0) {
            count += c1 * c2;

            steps.push({
              state: {
                hashMap: { ...points },
                result: `Squares so far: ${count}`,
              },
              highlights: [],
              message: `Vertical edge (${px},${py})-(${px},${y}) has side ${d}. Corners at x=${x2}: (${x2},${py}) x${c1} and (${x2},${y}) x${c2} exist -> +${c1 * c2} square${c1 * c2 > 1 ? 's' : ''}.`,
              codeLine: 19,
              action: 'found',
            });
          } else {
            steps.push({
              state: {
                hashMap: { ...points },
                result: `Squares so far: ${count}`,
              },
              highlights: [],
              message: `Vertical edge of side ${d}: checking corners (${x2},${py}) and (${x2},${y}) — ${c1 === 0 ? `(${x2},${py}) missing` : `(${x2},${y}) missing`}, no square on this side.`,
              codeLine: 19,
              action: 'compare',
            });
          }
        }
      }

      steps.push({
        state: {
          hashMap: { ...points },
          result: `count(${px},${py}) = ${count}`,
        },
        highlights: [],
        message: `count(${px},${py}) = ${count}.`,
        codeLine: 20,
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
    message: `Done! Processed all ${operations.length} operations using column buckets.`,
    codeLine: 20,
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
    java: `class DetectSquares {
    private Map<String, Integer> pointCount;

    public DetectSquares() {
        pointCount = new HashMap<>();
    }

    public void add(int[] point) {
        String key = point[0] + "," + point[1];
        pointCount.put(key, pointCount.getOrDefault(key, 0) + 1);
    }

    public int count(int[] point) {
        int x1 = point[0], y1 = point[1];
        int result = 0;

        for (String key : pointCount.keySet()) {
            String[] parts = key.split(",");
            int x3 = Integer.parseInt(parts[0]);
            int y3 = Integer.parseInt(parts[1]);

            if (Math.abs(x1 - x3) != Math.abs(y1 - y3) || x1 == x3 || y1 == y3) continue;

            String p2 = x1 + "," + y3;
            String p4 = x3 + "," + y1;
            result += pointCount.get(key) *
                     pointCount.getOrDefault(p2, 0) *
                     pointCount.getOrDefault(p4, 0);
        }
        return result;
    }
}`,
  },
  defaultInput: [
    ['add', [3, 10]],
    ['add', [11, 2]],
    ['add', [3, 2]],
    ['count', [11, 10]],
  ],
  run: runDetectSquares,
  optimalApproachName: 'Diagonal Point Scan',
  approaches: [
    {
      id: 'column-buckets',
      name: 'X-Coordinate Buckets',
      timeComplexity: 'O(k) per count (k = points sharing the query x)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of scanning every stored point looking for diagonals, bucket points by x-coordinate: a square needs a vertical edge in the query column, so count() only inspects that one bucket.',
      code: {
        python: `class DetectSquares:
    def __init__(self):
        self.points = defaultdict(int)
        self.cols = defaultdict(list)

    def add(self, point):
        x, y = point
        self.points[(x, y)] += 1
        self.cols[x].append(y)

    def count(self, point):
        px, py = point
        res = 0
        for y in self.cols[px]:
            d = abs(y - py)
            if d == 0:
                continue
            for x2 in (px + d, px - d):
                res += self.points[(x2, py)] * self.points[(x2, y)]
        return res`,
        javascript: `class DetectSquares {
    constructor() {
        this.points = {};
        this.cols = {};
    }
    add(point) {
        const [x, y] = point;
        const key = x + ',' + y;
        this.points[key] = (this.points[key] || 0) + 1;
        (this.cols[x] = this.cols[x] || []).push(y);
    }
    count(point) {
        const [px, py] = point;
        let res = 0;
        for (const y of this.cols[px] || []) {
            const d = Math.abs(y - py);
            if (d === 0) continue;
            for (const x2 of [px + d, px - d]) {
                res += (this.points[x2 + ',' + py] || 0) * (this.points[x2 + ',' + y] || 0);
            }
        }
        return res;
    }
}`,
        java: `class DetectSquares {
    private Map<String, Integer> points = new HashMap<>();
    private Map<Integer, List<Integer>> cols = new HashMap<>();

    public void add(int[] point) {
        int x = point[0], y = point[1];
        String key = x + "," + y;
        points.put(key, points.getOrDefault(key, 0) + 1);
        cols.computeIfAbsent(x, k -> new ArrayList<>()).add(y);
    }

    public int count(int[] point) {
        int px = point[0], py = point[1];
        int res = 0;
        for (int y : cols.getOrDefault(px, new ArrayList<>())) {
            int d = Math.abs(y - py);
            if (d == 0) continue;
            for (int x2 : new int[] { px + d, px - d }) {
                res += points.getOrDefault(x2 + "," + py, 0)
                     * points.getOrDefault(x2 + "," + y, 0);
            }
        }
        return res;
    }
}`,
      },
      run: runDetectSquaresColumnBuckets,
      lineExplanations: {
        python: {
          1: 'Define DetectSquares class',
          2: 'Initialize constructor',
          3: 'Map counting occurrences of each exact point',
          4: 'Buckets: x-coordinate -> list of y values (duplicates kept)',
          6: 'Define add method for new point',
          7: 'Unpack coordinates',
          8: 'Increment count for this exact point',
          9: 'Record y in the bucket for column x',
          11: 'Define count method for query point',
          12: 'Unpack query coordinates',
          13: 'Initialize square count',
          14: 'Scan only the query column — each y here is a vertical-edge partner',
          15: 'Side length of the candidate square',
          16: 'Same point as the query?',
          17: 'Zero side means no area — skip',
          18: 'The square can extend right (px+d) or left (px-d)',
          19: 'Multiply counts of the two remaining corners',
          20: 'Return total number of squares',
        },
        javascript: {
          1: 'Define DetectSquares class',
          2: 'Initialize constructor',
          3: 'Map counting occurrences of each exact point',
          4: 'Buckets: x-coordinate -> list of y values (duplicates kept)',
          6: 'Define add method for new point',
          7: 'Unpack coordinates',
          8: 'Build string key from coordinates',
          9: 'Increment count for this exact point',
          10: 'Record y in the bucket for column x',
          12: 'Define count method for query point',
          13: 'Unpack query coordinates',
          14: 'Initialize square count',
          15: 'Scan only the query column — each y is a vertical-edge partner',
          16: 'Side length of the candidate square',
          17: 'Zero side means no area — skip',
          18: 'The square can extend right (px+d) or left (px-d)',
          19: 'Multiply counts of the two remaining corners',
          22: 'Return total number of squares',
        },
        java: {
          1: 'Define DetectSquares class',
          2: 'Map counting occurrences of each exact point',
          3: 'Buckets: x-coordinate -> list of y values (duplicates kept)',
          5: 'Define add method for new point',
          6: 'Unpack coordinates',
          7: 'Build string key from coordinates',
          8: 'Increment count for this exact point',
          9: 'Record y in the bucket for column x',
          12: 'Define count method for query point',
          13: 'Unpack query coordinates',
          14: 'Initialize square count',
          15: 'Scan only the query column — each y is a vertical-edge partner',
          16: 'Side length of the candidate square',
          17: 'Zero side means no area — skip',
          18: 'The square can extend right (px+d) or left (px-d)',
          19: 'Multiply count of corner (x2, py)...',
          20: '...by count of corner (x2, y)',
          23: 'Return total number of squares',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define DetectSquares class',
      2: 'Initialize constructor',
      3: 'Map to count occurrences of each point',
      4: 'List to store all added points',
      6: 'Define add method for new point',
      7: 'Increment count for this point',
      8: 'Append point to list',
      10: 'Define count method for query point',
      11: 'Initialize square count to 0',
      12: 'Extract query point coordinates',
      13: 'Check each stored point as diagonal',
      14: 'Skip if not a valid diagonal match',
      15: 'Continue to next point',
      16: 'Multiply counts of two other corners',
      17: 'Return total number of squares',
    },
    javascript: {
      1: 'Define DetectSquares class',
      2: 'Initialize constructor',
      3: 'Map to count occurrences of each point',
      4: 'List to store all added points',
      6: 'Define add method for new point',
      7: 'Create string key from coordinates',
      8: 'Increment count for this point',
      9: 'Append point to list',
      11: 'Define count method for query point',
      12: 'Initialize square count to 0',
      13: 'Extract query point coordinates',
      14: 'Check each stored point as diagonal',
      15: 'Skip if not a valid diagonal match',
      16: 'Multiply counts of two other corners',
      18: 'Return total number of squares',
    },
    java: {
      1: 'Define DetectSquares class',
      2: 'Map to count occurrences of each point',
      4: 'Initialize constructor',
      5: 'Create new HashMap for point counts',
      8: 'Define add method for new point',
      9: 'Create string key from coordinates',
      10: 'Increment count for this point',
      13: 'Define count method for query point',
      14: 'Extract query coordinates',
      15: 'Initialize result count to 0',
      17: 'Iterate over all stored points',
      18: 'Parse key into coordinates',
      19: 'Parse x coordinate',
      20: 'Parse y coordinate',
      22: 'Skip if not valid diagonal match',
      24: 'Build key for corner (x1, y3)',
      25: 'Build key for corner (x3, y1)',
      26: 'Multiply counts of diagonal and corners',
      27: 'Multiply by other two corner counts',
      28: 'Include count of the third corner',
      30: 'Return total number of squares',
    },
  },
};
