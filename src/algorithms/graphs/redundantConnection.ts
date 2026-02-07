import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runRedundantConnection(input: unknown): AlgorithmStep[] {
  const edges = input as number[][];
  const steps: AlgorithmStep[] = [];

  // Determine number of nodes (nodes are 1-indexed)
  const n = edges.length;

  // Union-Find (1-indexed)
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const rank = new Array(n + 1).fill(0);

  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression
      x = parent[x];
    }
    return x;
  }

  function union(a: number, b: number): boolean {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return false;
    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;
    } else {
      parent[rootB] = rootA;
      rank[rootA]++;
    }
    return true;
  }

  function buildGraphState(
    processedEdges: number[][],
    highlights: number[] = [],
    secondary: number[] = [],
    redundantEdge?: [number, number]
  ) {
    const nodeSet = new Set<number>();
    for (const [a, b] of edges) {
      nodeSet.add(a);
      nodeSet.add(b);
    }
    const nodes = Array.from(nodeSet).sort((a, b) => a - b).map(id => ({ id, label: `${id}` }));
    const graphEdges = edges.map(([a, b]) => ({ from: a, to: b }));
    const visitedEdges: [number, number][] = processedEdges.map(([a, b]) => [a, b]);
    return {
      graph: { nodes, edges: graphEdges },
      graphHighlights: highlights,
      graphSecondary: secondary,
      graphVisitedEdges: visitedEdges,
      graphDirected: false,
      ...(redundantEdge ? { result: `Redundant edge: [${redundantEdge[0]}, ${redundantEdge[1]}]` } : {}),
    };
  }

  steps.push({
    state: {
      ...buildGraphState([]),
      hashMap: Object.fromEntries(
        Array.from({ length: n }, (_, i) => [`Node ${i + 1}`, `parent=${i + 1}`])
      ),
      result: 'Finding the redundant connection...',
    },
    highlights: [],
    message: `Find the edge that creates a cycle in a graph with ${n} nodes and ${n} edges using Union-Find.`,
    codeLine: 1,
  } as AlgorithmStep);

  const processedEdges: number[][] = [];
  let redundantEdge: [number, number] | null = null;

  for (const [a, b] of edges) {
    const rootA = find(a);
    const rootB = find(b);

    steps.push({
      state: {
        ...buildGraphState(processedEdges, [a, b]),
        hashMap: Object.fromEntries(
          Array.from({ length: n }, (_, i) => [`Node ${i + 1}`, `parent=${parent[i + 1]}, root=${find(i + 1)}`])
        ),
        result: `Processing edge [${a}, ${b}]: root(${a})=${rootA}, root(${b})=${rootB}`,
      },
      highlights: [],
      message: `Process edge [${a}, ${b}]. root(${a})=${rootA}, root(${b})=${rootB}`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);

    if (rootA === rootB) {
      redundantEdge = [a, b];

      steps.push({
        state: {
          ...buildGraphState(processedEdges, [a, b], [], redundantEdge),
          hashMap: Object.fromEntries(
            Array.from({ length: n }, (_, i) => [`Node ${i + 1}`, `parent=${parent[i + 1]}`])
          ),
          result: `Redundant edge found: [${a}, ${b}]`,
        },
        highlights: [],
        message: `Cycle detected! Nodes ${a} and ${b} already connected (same root = ${rootA}). Edge [${a}, ${b}] is redundant.`,
        codeLine: 8,
        action: 'found',
      } as AlgorithmStep);

      break;
    }

    union(a, b);
    processedEdges.push([a, b]);

    steps.push({
      state: {
        ...buildGraphState(processedEdges, [a, b]),
        hashMap: Object.fromEntries(
          Array.from({ length: n }, (_, i) => [`Node ${i + 1}`, `parent=${parent[i + 1]}`])
        ),
        result: `Union(${a}, ${b}) successful`,
      },
      highlights: [],
      message: `Union(${a}, ${b}): no cycle. Components merged.`,
      codeLine: 10,
      action: 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      ...buildGraphState(processedEdges, redundantEdge ? [redundantEdge[0], redundantEdge[1]] : []),
      result: redundantEdge ? `Answer: [${redundantEdge[0]}, ${redundantEdge[1]}]` : 'No redundant connection',
    },
    highlights: [],
    message: redundantEdge
      ? `Done! The redundant connection is [${redundantEdge[0]}, ${redundantEdge[1]}].`
      : `Done! No redundant connection found.`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const redundantConnection: Algorithm = {
  id: 'redundant-connection',
  name: 'Redundant Connection',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Union-Find — first edge that connects already-connected nodes',
  description:
    'Given a graph that started as a tree with n nodes (1 to n) and one additional edge added, find that redundant edge. Return the edge that, if removed, results in a tree. Uses Union-Find to detect the cycle-creating edge.',
  problemUrl: 'https://leetcode.com/problems/redundant-connection/',
  code: {
    python: `def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))
    rank = [0] * (len(edges) + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        rootA, rootB = find(a), find(b)
        if rootA == rootB:
            return False
        if rank[rootA] < rank[rootB]:
            parent[rootA] = rootB
        elif rank[rootA] > rank[rootB]:
            parent[rootB] = rootA
        else:
            parent[rootB] = rootA
            rank[rootA] += 1
        return True

    for a, b in edges:
        if not union(a, b):
            return [a, b]`,
    javascript: `function findRedundantConnection(edges) {
    const n = edges.length;
    const parent = Array.from({length: n+1}, (_, i) => i);
    const rank = new Array(n + 1).fill(0);

    function find(x) {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    function union(a, b) {
        const rootA = find(a), rootB = find(b);
        if (rootA === rootB) return false;
        if (rank[rootA] < rank[rootB])
            parent[rootA] = rootB;
        else if (rank[rootA] > rank[rootB])
            parent[rootB] = rootA;
        else {
            parent[rootB] = rootA;
            rank[rootA]++;
        }
        return true;
    }

    for (const [a, b] of edges)
        if (!union(a, b)) return [a, b];
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [[1, 2], [1, 3], [2, 3]],
  run: runRedundantConnection,
};
