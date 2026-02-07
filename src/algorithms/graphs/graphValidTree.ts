import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runGraphValidTree(input: unknown): AlgorithmStep[] {
  const { n, edges } = input as { n: number; edges: number[][] };
  const steps: AlgorithmStep[] = [];

  function buildGraphState(
    highlights: number[] = [],
    secondary: number[] = [],
    visitedEdges: [number, number][] = []
  ) {
    const nodes = [];
    for (let i = 0; i < n; i++) {
      nodes.push({ id: i, label: `${i}` });
    }
    const graphEdges: { from: number; to: number }[] = edges.map(([a, b]) => ({ from: a, to: b }));
    return {
      graph: { nodes, edges: graphEdges },
      graphHighlights: highlights,
      graphSecondary: secondary,
      graphVisitedEdges: visitedEdges,
      graphDirected: false,
    };
  }

  steps.push({
    state: {
      ...buildGraphState(),
      result: 'Checking if graph is a valid tree...',
    },
    highlights: [],
    message: `Check if graph with ${n} nodes and ${edges.length} edges forms a valid tree using Union-Find.`,
    codeLine: 1,
  } as AlgorithmStep);

  // A valid tree: n-1 edges and all nodes connected (no cycle)
  if (edges.length !== n - 1) {
    steps.push({
      state: {
        ...buildGraphState(),
        result: 'false - Not a valid tree',
      },
      highlights: [],
      message: `A tree with ${n} nodes must have exactly ${n - 1} edges, but found ${edges.length}. Not a tree.`,
      codeLine: 3,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  steps.push({
    state: {
      ...buildGraphState(),
      result: `Edge count: ${edges.length} = ${n} - 1. Correct!`,
    },
    highlights: [],
    message: `Edge count check passed (${edges.length} = ${n} - 1). Now check for cycles using Union-Find.`,
    codeLine: 3,
  } as AlgorithmStep);

  // Union-Find
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: Object.fromEntries(parent.map((p, i) => [`Node ${i}`, `parent=${p}, rank=${rank[i]}`])),
      result: 'Initialize Union-Find: each node is its own parent',
    },
    highlights: [],
    message: `Initialize Union-Find. Each node is its own root.`,
    codeLine: 5,
  } as AlgorithmStep);

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
    if (rootA === rootB) return false; // cycle
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

  const visitedEdges: [number, number][] = [];
  let isTree = true;

  for (const [a, b] of edges) {
    const rootA = find(a);
    const rootB = find(b);

    steps.push({
      state: {
        ...buildGraphState([a, b], [], visitedEdges),
        hashMap: Object.fromEntries(parent.map((p, i) => [`Node ${i}`, `parent=${p}, rank=${rank[i]}`])),
        result: `Processing edge [${a}, ${b}]: root(${a})=${rootA}, root(${b})=${rootB}`,
      },
      highlights: [],
      message: `Process edge [${a}, ${b}]. Find roots: root(${a})=${rootA}, root(${b})=${rootB}`,
      codeLine: 8,
      action: 'compare',
    } as AlgorithmStep);

    if (rootA === rootB) {
      isTree = false;

      steps.push({
        state: {
          ...buildGraphState([a, b], [], visitedEdges),
          hashMap: Object.fromEntries(parent.map((p, i) => [`Node ${i}`, `parent=${p}, rank=${rank[i]}`])),
          result: 'CYCLE DETECTED - Not a tree!',
        },
        highlights: [],
        message: `Cycle detected! Nodes ${a} and ${b} already in the same component (root=${rootA}).`,
        codeLine: 10,
        action: 'found',
      } as AlgorithmStep);

      break;
    }

    union(a, b);
    visitedEdges.push([a, b]);

    steps.push({
      state: {
        ...buildGraphState([a, b], [], visitedEdges),
        hashMap: Object.fromEntries(parent.map((p, i) => [`Node ${i}`, `parent=${p}, rank=${rank[i]}`])),
        result: `Union(${a}, ${b}) successful`,
      },
      highlights: [],
      message: `Union nodes ${a} and ${b}. No cycle.`,
      codeLine: 11,
      action: 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      ...buildGraphState(),
      result: isTree ? 'true - Valid tree!' : 'false - Not a valid tree',
    },
    highlights: [],
    message: isTree
      ? `Done! Graph is a valid tree: ${n - 1} edges, all connected, no cycles.`
      : `Done! Graph is NOT a valid tree (cycle detected).`,
    codeLine: 14,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const graphValidTree: Algorithm = {
  id: 'graph-valid-tree',
  name: 'Graph Valid Tree',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V+E)',
  pattern: 'Union-Find — tree iff connected and edges = n-1',
  description:
    'Given n nodes labeled from 0 to n-1 and a list of undirected edges, determine if these edges form a valid tree. A valid tree has exactly n-1 edges and is fully connected with no cycles. Uses Union-Find.',
  problemUrl: 'https://leetcode.com/problems/graph-valid-tree/',
  code: {
    python: `def validTree(n, edges):
    if len(edges) != n - 1:
        return False

    parent = list(range(n))
    rank = [0] * n

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
            return False
    return True`,
    javascript: `function validTree(n, edges) {
    if (edges.length !== n - 1) return false;

    const parent = Array.from({length: n}, (_, i) => i);
    const rank = new Array(n).fill(0);

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
        if (!union(a, b)) return false;
    return true;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: { n: 5, edges: [[0, 1], [0, 2], [0, 3], [1, 4]] },
  run: runGraphValidTree,
};
