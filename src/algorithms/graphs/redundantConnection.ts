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
    java: `public int[] findRedundantConnection(int[][] edges) {
    int[] parent = new int[edges.length + 1];
    int[] rank = new int[edges.length + 1];
    for (int i = 0; i <= edges.length; i++) parent[i] = i;

    for (int[] edge : edges) {
        if (!union(edge[0], edge[1], parent, rank)) {
            return edge;
        }
    }
    return new int[0];
}

private int find(int x, int[] parent) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

private boolean union(int a, int b, int[] parent, int[] rank) {
    int rootA = find(a, parent);
    int rootB = find(b, parent);
    if (rootA == rootB) return false;
    if (rank[rootA] < rank[rootB]) {
        parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
        parent[rootB] = rootA;
    } else {
        parent[rootB] = rootA;
        rank[rootA]++;
    }
    return true;
}`,
  },
  defaultInput: [[1, 2], [1, 3], [2, 3]],
  run: runRedundantConnection,
  lineExplanations: {
    python: {
      1: 'Define function taking edge list',
      2: 'Each node starts as its own parent',
      3: 'Initialize rank array for union by rank',
      5: 'Define find with path compression',
      6: 'Traverse up until root is found',
      7: 'Path compression: point to grandparent',
      8: 'Move to the compressed parent',
      9: 'Return the root of the set',
      11: 'Define union to merge two sets',
      12: 'Find roots of both nodes',
      13: 'If same root, cycle detected',
      14: 'Return False since nodes already connected',
      15: 'Attach smaller rank under larger',
      16: 'Attach rootA under rootB',
      17: 'Attach larger rank under smaller',
      18: 'Attach rootB under rootA',
      20: 'Equal rank: pick rootA as new root',
      21: 'Increment rank of new root',
      22: 'Return True for successful union',
      24: 'Process each edge in order',
      25: 'If union fails, this edge creates cycle',
      26: 'Return the redundant edge',
    },
    javascript: {
      1: 'Define function taking edge list',
      2: 'Get number of nodes from edge count',
      3: 'Each node starts as its own parent',
      4: 'Initialize rank array for union by rank',
      6: 'Define find with path compression',
      7: 'Traverse up until root is found',
      8: 'Path compression: point to grandparent',
      9: 'Move to the compressed parent',
      11: 'Return the root of the set',
      14: 'Define union to merge two sets',
      15: 'Find roots of both nodes',
      16: 'If same root, already connected',
      17: 'Attach smaller rank under larger',
      18: 'Attach rootA under rootB',
      19: 'Attach larger rank under smaller',
      20: 'Attach rootB under rootA',
      22: 'Equal rank: pick rootA as new root',
      23: 'Increment rank of new root',
      25: 'Return true for successful union',
      28: 'Process each edge in order',
      29: 'If union fails, return redundant edge',
    },
    java: {
      1: 'Define method taking edge array',
      2: 'Create parent array for union-find',
      3: 'Create rank array for union by rank',
      4: 'Initialize each node as its own parent',
      6: 'Process each edge',
      7: 'If union fails, edge creates a cycle',
      8: 'Return the redundant edge',
      11: 'Return empty array if no cycle found',
      14: 'Define find with path compression',
      15: 'Traverse up until root is found',
      16: 'Path compression: point to grandparent',
      17: 'Move to the compressed parent',
      19: 'Return the root of the set',
      22: 'Define union to merge two sets',
      23: 'Find root of first node',
      24: 'Find root of second node',
      25: 'If same root, cycle detected',
      26: 'Attach smaller rank under larger',
      27: 'Attach rootA under rootB',
      28: 'Attach larger rank under smaller',
      29: 'Attach rootB under rootA',
      31: 'Equal rank: pick rootA as new root',
      32: 'Increment rank of new root',
      34: 'Return true for successful union',
    },
  },
};
