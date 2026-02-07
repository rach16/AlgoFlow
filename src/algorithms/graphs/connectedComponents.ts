import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runConnectedComponents(input: unknown): AlgorithmStep[] {
  const { n, edges } = input as { n: number; edges: number[][] };
  const steps: AlgorithmStep[] = [];

  // Union-Find
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);

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

  function getComponentCount(): number {
    const roots = new Set<number>();
    for (let i = 0; i < n; i++) {
      roots.add(find(i));
    }
    return roots.size;
  }

  function buildGraphState(
    highlights: number[] = [],
    secondary: number[] = [],
    visitedEdges: [number, number][] = []
  ) {
    const nodes = [];
    for (let i = 0; i < n; i++) {
      nodes.push({ id: i, label: `${i}` });
    }
    const graphEdges = edges.map(([a, b]) => ({ from: a, to: b }));
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
      hashMap: Object.fromEntries(parent.map((p, i) => [`Node ${i}`, `parent=${p}`])),
      result: `Components: ${n} (initially each node is its own component)`,
    },
    highlights: [],
    message: `Find connected components in graph with ${n} nodes and ${edges.length} edges using Union-Find.`,
    codeLine: 1,
  } as AlgorithmStep);

  const visitedEdges: [number, number][] = [];

  for (const [a, b] of edges) {
    const rootA = find(a);
    const rootB = find(b);

    steps.push({
      state: {
        ...buildGraphState([a, b], [], visitedEdges),
        hashMap: Object.fromEntries(parent.map((p, i) => [`Node ${i}`, `parent=${p}`])),
        result: `Processing edge [${a}, ${b}]`,
      },
      highlights: [],
      message: `Process edge [${a}, ${b}]. root(${a})=${rootA}, root(${b})=${rootB}`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);

    if (rootA !== rootB) {
      union(a, b);
      visitedEdges.push([a, b]);
      const componentCount = getComponentCount();

      steps.push({
        state: {
          ...buildGraphState([a, b], [], visitedEdges),
          hashMap: Object.fromEntries(parent.map((_p, i) => [`Node ${i}`, `parent=${find(i)}`])),
          result: `Components: ${componentCount}`,
        },
        highlights: [],
        message: `Union(${a}, ${b}): merged two components. Components remaining: ${componentCount}`,
        codeLine: 9,
        action: 'insert',
      } as AlgorithmStep);
    } else {
      visitedEdges.push([a, b]);

      steps.push({
        state: {
          ...buildGraphState([a, b], [], visitedEdges),
          hashMap: Object.fromEntries(parent.map((_p, i) => [`Node ${i}`, `parent=${find(i)}`])),
          result: `Already connected`,
        },
        highlights: [],
        message: `Nodes ${a} and ${b} already in the same component (root=${rootA}). Skip.`,
        codeLine: 7,
        action: 'visit',
      } as AlgorithmStep);
    }
  }

  const finalCount = getComponentCount();

  // Show final component groupings
  const components = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!components.has(root)) components.set(root, []);
    components.get(root)!.push(i);
  }

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: Object.fromEntries(
        Array.from(components.entries()).map(([_root, members], idx) => [
          `Component ${idx + 1}`,
          `[${members.join(', ')}]`,
        ])
      ),
      result: `Total connected components: ${finalCount}`,
    },
    highlights: [],
    message: `Done! Found ${finalCount} connected component(s).`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const connectedComponents: Algorithm = {
  id: 'connected-components',
  name: 'Number of Connected Components',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V)',
  pattern: 'Union-Find — union nodes by edges, count distinct roots',
  description:
    'Given n nodes labeled 0 to n-1 and a list of undirected edges, find the number of connected components in the graph. Uses Union-Find (Disjoint Set Union) with path compression and union by rank.',
  problemUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/',
  code: {
    python: `def countComponents(n, edges):
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
            return 0
        if rank[rootA] < rank[rootB]:
            parent[rootA] = rootB
        elif rank[rootA] > rank[rootB]:
            parent[rootB] = rootA
        else:
            parent[rootB] = rootA
            rank[rootA] += 1
        return 1

    components = n
    for a, b in edges:
        components -= union(a, b)
    return components`,
    javascript: `function countComponents(n, edges) {
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
        if (rootA === rootB) return 0;
        if (rank[rootA] < rank[rootB])
            parent[rootA] = rootB;
        else if (rank[rootA] > rank[rootB])
            parent[rootB] = rootA;
        else {
            parent[rootB] = rootA;
            rank[rootA]++;
        }
        return 1;
    }

    let components = n;
    for (const [a, b] of edges)
        components -= union(a, b);
    return components;
}`,
    java: `public int countComponents(int n, int[][] edges) {
    int[] parent = new int[n];
    int[] rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    int components = n;
    for (int[] edge : edges) {
        if (union(edge[0], edge[1], parent, rank)) {
            components--;
        }
    }
    return components;
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
  defaultInput: { n: 5, edges: [[0, 1], [1, 2], [3, 4]] },
  run: runConnectedComponents,
};
