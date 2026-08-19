import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMinCostConnectPoints(input: unknown): AlgorithmStep[] {
  const points = input as number[][];
  const steps: AlgorithmStep[] = [];
  const n = points.length;

  // Build graph nodes and all possible edges
  const nodes = points.map((p, i) => `${i}(${p[0]},${p[1]})`);
  const allEdges: { from: string; to: string; label: string; weight: number }[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
      allEdges.push({
        from: nodes[i],
        to: nodes[j],
        label: `${dist}`,
        weight: dist,
      });
    }
  }

  const graph = { nodes, edges: allEdges.map(e => ({ from: e.from, to: e.to, label: e.label })) };

  steps.push({
    state: {
      graph,
      graphHighlights: [],
      graphVisitedEdges: [],
      result: 'Total cost: 0',
    },
    highlights: [],
    message: `${n} points with ${allEdges.length} possible edges. Using Prim's algorithm to find MST.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Prim's algorithm using a simple min-heap approach
  const inMST = new Set<number>();
  const mstEdges: { from: string; to: string }[] = [];
  let totalCost = 0;

  // Min cost to reach each node
  const minCost = new Array(n).fill(Infinity);
  const minFrom = new Array(n).fill(-1);
  minCost[0] = 0;

  steps.push({
    state: {
      graph,
      graphHighlights: [nodes[0]],
      graphVisitedEdges: [],
      result: 'Total cost: 0',
    },
    highlights: [],
    message: `Start with point 0. Initialize min costs to reach each node.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  for (let iter = 0; iter < n; iter++) {
    // Find the non-MST node with minimum cost
    let minVal = Infinity;
    let minIdx = -1;
    for (let i = 0; i < n; i++) {
      if (!inMST.has(i) && minCost[i] < minVal) {
        minVal = minCost[i];
        minIdx = i;
      }
    }

    if (minIdx === -1) break;

    inMST.add(minIdx);
    totalCost += minVal;

    if (minFrom[minIdx] !== -1) {
      mstEdges.push({ from: nodes[minFrom[minIdx]], to: nodes[minIdx] });
    }

    steps.push({
      state: {
        graph,
        graphHighlights: Array.from(inMST).map(i => nodes[i]),
        graphVisitedEdges: mstEdges.map(e => ({ ...e })),
        result: `Total cost: ${totalCost}`,
      },
      highlights: [],
      message: `Add point ${minIdx} to MST${minFrom[minIdx] !== -1 ? ` (edge from ${minFrom[minIdx]} with cost ${minVal})` : ' (starting point)'}. Total cost = ${totalCost}.`,
      codeLine: 5,
      action: 'insert',
    } as AlgorithmStep);

    // Update costs for neighbors
    for (let j = 0; j < n; j++) {
      if (inMST.has(j)) continue;
      const dist = Math.abs(points[minIdx][0] - points[j][0]) + Math.abs(points[minIdx][1] - points[j][1]);
      if (dist < minCost[j]) {
        minCost[j] = dist;
        minFrom[j] = minIdx;

        steps.push({
          state: {
            graph,
            graphHighlights: Array.from(inMST).map(i => nodes[i]),
            graphVisitedEdges: mstEdges.map(e => ({ ...e })),
            result: `Total cost: ${totalCost}`,
          },
          highlights: [],
          message: `Update min cost to reach point ${j}: ${dist} (from point ${minIdx}).`,
          codeLine: 7,
          action: 'compare',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      graph,
      graphHighlights: Array.from(inMST).map(i => nodes[i]),
      graphVisitedEdges: mstEdges.map(e => ({ ...e })),
      result: `Minimum cost: ${totalCost}`,
    },
    highlights: [],
    message: `Done! Minimum cost to connect all points = ${totalCost}.`,
    codeLine: 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runMinCostKruskal(input: unknown): AlgorithmStep[] {
  const points = input as number[][];
  const steps: AlgorithmStep[] = [];
  const n = points.length;

  const nodes = points.map((p, i) => `${i}(${p[0]},${p[1]})`);
  const allEdges: { from: number; to: number; weight: number }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
      allEdges.push({ from: i, to: j, weight: dist });
    }
  }
  const graph = {
    nodes,
    edges: allEdges.map(e => ({ from: nodes[e.from], to: nodes[e.to], label: `${e.weight}` })),
  };

  steps.push({
    state: {
      graph,
      graphHighlights: [],
      graphVisitedEdges: [],
      result: 'Total cost: 0',
    },
    highlights: [],
    message: `Kruskal's algorithm: build all ${allEdges.length} candidate edges, sort them by weight, then greedily union components.`,
    codeLine: 1,
  } as AlgorithmStep);

  allEdges.sort((a, b) => a.weight - b.weight);

  steps.push({
    state: {
      graph,
      graphHighlights: [],
      graphVisitedEdges: [],
      result: `Sorted weights: [${allEdges.map(e => e.weight).join(', ')}]`,
    },
    highlights: [],
    message: `Sort edges ascending by Manhattan distance — Kruskal's greedy insight: the globally cheapest safe edge always belongs to some MST.`,
    codeLine: 8,
  } as AlgorithmStep);

  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const mstEdges: { from: string; to: string }[] = [];
  const inMST = new Set<number>();
  let total = 0;
  let used = 0;

  for (const { from, to, weight } of allEdges) {
    const ru = find(from);
    const rv = find(to);

    steps.push({
      state: {
        graph,
        graphHighlights: [nodes[from], nodes[to]],
        graphVisitedEdges: mstEdges.map(e => ({ ...e })),
        result: `Total cost: ${total}`,
      },
      highlights: [],
      message: `Consider edge ${from}-${to} (weight ${weight}): find(${from}) = ${ru}, find(${to}) = ${rv}. Same root would mean a cycle.`,
      codeLine: 19,
      action: 'compare',
    } as AlgorithmStep);

    if (ru === rv) {
      steps.push({
        state: {
          graph,
          graphHighlights: Array.from(inMST).map(i => nodes[i]),
          graphVisitedEdges: mstEdges.map(e => ({ ...e })),
          result: `Total cost: ${total}`,
        },
        highlights: [],
        message: `Points ${from} and ${to} are already in the same component — taking this edge would create a cycle. Skip it.`,
        codeLine: 21,
        action: 'compare',
      } as AlgorithmStep);
      continue;
    }

    parent[ru] = rv;
    total += weight;
    used++;
    mstEdges.push({ from: nodes[from], to: nodes[to] });
    inMST.add(from);
    inMST.add(to);

    steps.push({
      state: {
        graph,
        graphHighlights: Array.from(inMST).map(i => nodes[i]),
        graphVisitedEdges: mstEdges.map(e => ({ ...e })),
        result: `Total cost: ${total}`,
      },
      highlights: [],
      message: `Union! Edge ${from}-${to} merges two components for cost ${weight}. Total = ${total} (${used}/${n - 1} edges taken).`,
      codeLine: 23,
      action: 'insert',
    } as AlgorithmStep);

    if (used === n - 1) break;
  }

  steps.push({
    state: {
      graph,
      graphHighlights: Array.from(inMST).map(i => nodes[i]),
      graphVisitedEdges: mstEdges.map(e => ({ ...e })),
      result: `Minimum cost: ${total}`,
    },
    highlights: [],
    message: `Done! ${n - 1} edges chosen without cycles — the MST is complete. Minimum cost = ${total}.`,
    codeLine: 27,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const minCostConnectPoints: Algorithm = {
  id: 'min-cost-connect-points',
  name: 'Min Cost to Connect All Points',
  category: 'Advanced Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(n)',
  pattern: 'Prim MST — min heap of edges, grow tree greedily',
  description:
    'You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi]. The cost of connecting two points [xi, yi] and [xj, yj] is the manhattan distance between them. Return the minimum cost to make all points connected.',
  problemUrl: 'https://leetcode.com/problems/min-cost-to-connect-all-points/',
  code: {
    python: `def minCostConnectPoints(points):
    n = len(points)
    visited = set()
    min_cost = [float('inf')] * n
    min_cost[0] = 0
    total = 0

    for _ in range(n):
        # Find min cost non-visited node
        u = -1
        for i in range(n):
            if i not in visited and (u == -1 or min_cost[i] < min_cost[u]):
                u = i
        visited.add(u)
        total += min_cost[u]

        # Update neighbors
        for v in range(n):
            if v not in visited:
                dist = abs(points[u][0]-points[v][0]) + abs(points[u][1]-points[v][1])
                min_cost[v] = min(min_cost[v], dist)

    return total`,
    javascript: `function minCostConnectPoints(points) {
    const n = points.length;
    const visited = new Set();
    const minCost = new Array(n).fill(Infinity);
    minCost[0] = 0;
    let total = 0;

    for (let iter = 0; iter < n; iter++) {
        let u = -1;
        for (let i = 0; i < n; i++) {
            if (!visited.has(i) && (u === -1 || minCost[i] < minCost[u]))
                u = i;
        }
        visited.add(u);
        total += minCost[u];

        for (let v = 0; v < n; v++) {
            if (!visited.has(v)) {
                const dist = Math.abs(points[u][0]-points[v][0]) + Math.abs(points[u][1]-points[v][1]);
                minCost[v] = Math.min(minCost[v], dist);
            }
        }
    }
    return total;
}`,
    java: `public int minCostConnectPoints(int[][] points) {
    int n = points.length;
    Set<Integer> visited = new HashSet<>();
    int[] minCost = new int[n];
    Arrays.fill(minCost, Integer.MAX_VALUE);
    minCost[0] = 0;
    int total = 0;

    for (int iter = 0; iter < n; iter++) {
        int u = -1;
        for (int i = 0; i < n; i++) {
            if (!visited.contains(i) && (u == -1 || minCost[i] < minCost[u])) {
                u = i;
            }
        }
        visited.add(u);
        total += minCost[u];

        for (int v = 0; v < n; v++) {
            if (!visited.contains(v)) {
                int dist = Math.abs(points[u][0] - points[v][0])
                        + Math.abs(points[u][1] - points[v][1]);
                minCost[v] = Math.min(minCost[v], dist);
            }
        }
    }
    return total;
}`,
  },
  defaultInput: [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]],
  run: runMinCostConnectPoints,
  optimalApproachName: "Prim's Algorithm",
  approaches: [
    {
      id: 'kruskal-union-find',
      name: "Kruskal's + Union-Find",
      timeComplexity: 'O(n² log n)',
      spaceComplexity: 'O(n²)',
      description:
        "Instead of growing one tree from a start node like Prim's, Kruskal's sorts all edges globally and unions components cheapest-first, using Union-Find to reject cycle-forming edges.",
      code: {
        python: `def minCostConnectPoints(points):
    n = len(points)
    edges = []
    for i in range(n):
        for j in range(i + 1, n):
            dist = abs(points[i][0]-points[j][0]) + abs(points[i][1]-points[j][1])
            edges.append((dist, i, j))
    edges.sort()

    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total, used = 0, 0
    for dist, u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            continue
        parent[ru] = rv
        total += dist
        used += 1
        if used == n - 1:
            break
    return total`,
        javascript: `function minCostConnectPoints(points) {
    const n = points.length;
    const edges = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const dist = Math.abs(points[i][0]-points[j][0]) + Math.abs(points[i][1]-points[j][1]);
            edges.push([dist, i, j]);
        }
    }
    edges.sort((a, b) => a[0] - b[0]);

    const parent = Array.from({ length: n }, (_, i) => i);
    function find(x) {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    let total = 0, used = 0;
    for (const [dist, u, v] of edges) {
        const ru = find(u), rv = find(v);
        if (ru === rv) continue;
        parent[ru] = rv;
        total += dist;
        used++;
        if (used === n - 1) break;
    }
    return total;
}`,
        java: `public int minCostConnectPoints(int[][] points) {
    int n = points.length;
    List<int[]> edges = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int dist = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
            edges.add(new int[]{dist, i, j});
        }
    }
    edges.sort((a, b) -> a[0] - b[0]);

    int[] parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    int total = 0, used = 0;
    for (int[] e : edges) {
        int ru = find(parent, e[1]), rv = find(parent, e[2]);
        if (ru == rv) continue;
        parent[ru] = rv;
        total += e[0];
        used++;
        if (used == n - 1) break;
    }
    return total;
}

private int find(int[] parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}`,
      },
      run: runMinCostKruskal,
      lineExplanations: {
        python: {
          1: 'Define function taking list of 2D points',
          2: 'Get total number of points',
          3: 'Collect every candidate edge',
          4: 'Pair each point i...',
          5: '...with every later point j',
          6: 'Manhattan distance is the edge weight',
          7: 'Store (weight, u, v) tuple',
          8: 'Sort edges cheapest-first — the greedy order',
          10: 'Union-Find: each point starts as its own root',
          11: 'find() returns the root of a component',
          12: 'Walk up until we reach the root',
          13: 'Path compression: point at grandparent',
          14: 'Move up the tree',
          15: 'Return the component root',
          17: 'Track total cost and edges taken',
          18: 'Scan edges in ascending weight order',
          19: 'Find the roots of both endpoints',
          20: 'Same root means same component',
          21: 'Skip — this edge would form a cycle',
          22: 'Union: merge the two components',
          23: 'Add edge weight to MST cost',
          24: 'One more MST edge taken',
          25: 'MST complete at n-1 edges',
          26: 'Stop early — remaining edges are useless',
          27: 'Return total MST cost',
        },
        javascript: {
          1: 'Define function taking points array',
          2: 'Get number of points',
          3: 'Collect every candidate edge',
          4: 'Pair each point i...',
          5: '...with every later point j',
          6: 'Manhattan distance is the edge weight',
          7: 'Store [weight, u, v] triple',
          10: 'Sort edges cheapest-first — the greedy order',
          12: 'Union-Find: each point starts as its own root',
          13: 'find() returns the root of a component',
          14: 'Walk up until we reach the root',
          15: 'Path compression: point at grandparent',
          16: 'Move up the tree',
          18: 'Return the component root',
          21: 'Track total cost and edges taken',
          22: 'Scan edges in ascending weight order',
          23: 'Find the roots of both endpoints',
          24: 'Same root = same component = cycle; skip',
          25: 'Union: merge the two components',
          26: 'Add edge weight to MST cost',
          27: 'One more MST edge taken',
          28: 'Stop early once n-1 edges chosen',
          30: 'Return total MST cost',
        },
        java: {
          1: 'Define method taking 2D points array',
          2: 'Get number of points',
          3: 'Collect every candidate edge',
          4: 'Pair each point i...',
          5: '...with every later point j',
          6: 'Manhattan distance is the edge weight',
          7: 'Store {weight, u, v} triple',
          10: 'Sort edges cheapest-first — the greedy order',
          12: 'Union-Find parent array',
          13: 'Each point starts as its own root',
          15: 'Track total cost and edges taken',
          16: 'Scan edges in ascending weight order',
          17: 'Find the roots of both endpoints',
          18: 'Same root = same component = cycle; skip',
          19: 'Union: merge the two components',
          20: 'Add edge weight to MST cost',
          21: 'One more MST edge taken',
          22: 'Stop early once n-1 edges chosen',
          24: 'Return total MST cost',
          27: 'find() returns the root of a component',
          28: 'Walk up until we reach the root',
          29: 'Path compression: point at grandparent',
          30: 'Move up the tree',
          32: 'Return the component root',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking list of 2D points',
      2: 'Get total number of points',
      3: 'Track which points are in the MST',
      4: 'Init min connection cost per point to infinity',
      5: 'Starting point has zero cost',
      6: 'Accumulator for total MST cost',
      8: 'Iterate n times to add all points to MST',
      10: 'Init best candidate index',
      11: 'Check each point',
      12: 'Find unvisited point with smallest cost',
      13: 'Update best candidate',
      14: 'Mark chosen point as visited',
      15: 'Add its cost to total',
      18: 'Check all other points as neighbors',
      19: 'Skip already-visited points',
      20: 'Compute Manhattan distance to neighbor',
      21: 'Update min cost if shorter path found',
      23: 'Return total MST cost',
    },
    javascript: {
      1: 'Define function taking points array',
      2: 'Get number of points',
      3: 'Track visited points in a Set',
      4: 'Init min cost array with Infinity',
      5: 'Starting point has zero cost',
      6: 'Accumulator for total MST cost',
      8: 'Iterate n times to connect all points',
      9: 'Init best candidate',
      10: 'Scan all points for minimum cost',
      11: 'Pick unvisited point with smallest cost',
      12: 'Update best candidate',
      14: 'Mark chosen point as visited',
      15: 'Add its connection cost to total',
      17: 'Update costs for remaining points',
      18: 'Skip visited points',
      19: 'Compute Manhattan distance',
      20: 'Keep the smaller of old and new cost',
      24: 'Return minimum total connection cost',
    },
    java: {
      1: 'Define method taking 2D points array',
      2: 'Get number of points',
      3: 'Track visited points in a HashSet',
      4: 'Init min cost array',
      5: 'Fill costs with max integer value',
      6: 'Starting point has zero cost',
      7: 'Accumulator for total MST cost',
      9: 'Iterate n times to connect all points',
      10: 'Init best candidate index',
      11: 'Scan all points',
      12: 'Find unvisited point with smallest cost',
      13: 'Update best candidate',
      16: 'Mark chosen point as visited',
      17: 'Add its cost to total',
      19: 'Update costs for remaining points',
      20: 'Skip visited points',
      21: 'Compute Manhattan distance',
      22: 'Split across lines for readability',
      23: 'Keep smaller of old and new cost',
      27: 'Return minimum total connection cost',
    },
  },
};
