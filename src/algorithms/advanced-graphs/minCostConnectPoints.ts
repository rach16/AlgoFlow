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

export const minCostConnectPoints: Algorithm = {
  id: 'min-cost-connect-points',
  name: 'Min Cost to Connect All Points',
  category: 'Advanced Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(n² log n)',
  spaceComplexity: 'O(n²)',
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
    java: `// Java implementation coming soon`,
  },
  defaultInput: [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]],
  run: runMinCostConnectPoints,
};
