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

function runGraphValidTreeDFS(input: unknown): AlgorithmStep[] {
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
    message: `DFS approach: a graph with exactly n-1 edges is a tree if and only if it is connected. So check the edge count, then check reachability from node 0.`,
    codeLine: 1,
  } as AlgorithmStep);

  if (edges.length !== n - 1) {
    steps.push({
      state: {
        ...buildGraphState(),
        result: 'false - Not a valid tree',
      },
      highlights: [],
      message: `A tree with ${n} nodes needs exactly ${n - 1} edges, but found ${edges.length}. ${edges.length > n - 1 ? 'Too many edges force a cycle.' : 'Too few edges leave the graph disconnected.'} Return false.`,
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
    message: `Edge count passes (${edges.length} = ${n} - 1). With that guaranteed, "connected" and "acyclic" are equivalent — one DFS from node 0 settles both.`,
    codeLine: 2,
  } as AlgorithmStep);

  // Build adjacency list
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: Object.fromEntries(adj.map((neighbors, i) => [`Node ${i}`, `[${neighbors.join(', ')}]`])),
      result: 'Adjacency list built',
    },
    highlights: [],
    message: `Build the adjacency list, adding each undirected edge in both directions.`,
    codeLine: 5,
  } as AlgorithmStep);

  const visited = new Array(n).fill(false);
  const visitedEdges: [number, number][] = [];
  const reached: number[] = [];

  function dfs(node: number) {
    visited[node] = true;
    reached.push(node);

    steps.push({
      state: {
        ...buildGraphState([...reached], [], visitedEdges),
        result: `Reached ${reached.length}/${n} nodes`,
      },
      highlights: [],
      message: `DFS reaches node ${node} (${reached.length}/${n} nodes so far). Neighbors: [${adj[node].join(', ')}]`,
      codeLine: 13,
      action: 'visit',
    } as AlgorithmStep);

    for (const nei of adj[node]) {
      if (!visited[nei]) {
        visitedEdges.push([node, nei]);
        dfs(nei);
      }
    }
  }

  dfs(0);

  const isTree = reached.length === n;

  steps.push({
    state: {
      ...buildGraphState(isTree ? [] : [...reached]),
      result: isTree ? 'true - Valid tree!' : 'false - Not a valid tree',
    },
    highlights: [],
    message: isTree
      ? `Done! DFS from node 0 reached all ${n} nodes with ${n - 1} edges — connected and acyclic. Valid tree.`
      : `Done! DFS reached only ${reached.length}/${n} nodes — the graph is disconnected (so the ${n - 1} edges must form a cycle somewhere else). Not a tree.`,
    codeLine: 19,
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
    java: `public boolean validTree(int n, int[][] edges) {
    if (edges.length != n - 1) return false;

    int[] parent = new int[n];
    int[] rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    for (int[] edge : edges) {
        if (!union(edge[0], edge[1], parent, rank)) return false;
    }
    return true;
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
  defaultInput: { n: 5, edges: [[0, 1], [0, 2], [0, 3], [1, 4]] },
  run: runGraphValidTree,
  optimalApproachName: 'Union-Find',
  approaches: [
    {
      id: 'dfs-connectivity',
      name: 'DFS Connectivity',
      timeComplexity: 'O(V+E)',
      spaceComplexity: 'O(V+E)',
      description:
        'Uses the counting insight instead of Union-Find: with exactly n-1 edges, the graph is a tree if and only if one DFS from node 0 reaches every node.',
      code: {
        python: `def validTree(n, edges):
    if len(edges) != n - 1:
        return False

    adj = {i: [] for i in range(n)}
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    visited = set()

    def dfs(node):
        visited.add(node)
        for nei in adj[node]:
            if nei not in visited:
                dfs(nei)

    dfs(0)
    return len(visited) == n`,
        javascript: `function validTree(n, edges) {
    if (edges.length !== n - 1) return false;

    const adj = Array.from({length: n}, () => []);
    for (const [a, b] of edges) {
        adj[a].push(b);
        adj[b].push(a);
    }

    const visited = new Set();
    function dfs(node) {
        visited.add(node);
        for (const nei of adj[node]) {
            if (!visited.has(nei)) dfs(nei);
        }
    }

    dfs(0);
    return visited.size === n;
}`,
        java: `public boolean validTree(int n, int[][] edges) {
    if (edges.length != n - 1) return false;

    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);
    }

    boolean[] visited = new boolean[n];
    dfs(0, adj, visited);

    for (boolean v : visited) {
        if (!v) return false;
    }
    return true;
}

private void dfs(int node, List<List<Integer>> adj, boolean[] visited) {
    visited[node] = true;
    for (int nei : adj.get(node)) {
        if (!visited[nei]) dfs(nei, adj, visited);
    }
}`,
      },
      run: runGraphValidTreeDFS,
      lineExplanations: {
        python: {
          1: 'Define function with node count and edges',
          2: 'A tree must have exactly n-1 edges',
          3: 'Wrong edge count — cannot be a tree',
          5: 'Create an empty adjacency list per node',
          6: 'Process each undirected edge',
          7: 'Record b as a neighbor of a',
          8: 'Record a as a neighbor of b',
          10: 'Track which nodes DFS reaches',
          12: 'Define DFS flood-fill helper',
          13: 'Mark the current node as reached',
          14: 'Walk each neighbor',
          15: 'Only recurse into unreached neighbors',
          16: 'DFS spreads through the whole component',
          18: 'Explore everything reachable from node 0',
          19: 'Tree iff all n nodes were reached',
        },
        javascript: {
          1: 'Define function with node count and edges',
          2: 'A tree must have exactly n-1 edges',
          4: 'Create an empty adjacency list per node',
          5: 'Process each undirected edge',
          6: 'Record b as a neighbor of a',
          7: 'Record a as a neighbor of b',
          10: 'Track which nodes DFS reaches',
          11: 'Define DFS flood-fill helper',
          12: 'Mark the current node as reached',
          13: 'Walk each neighbor',
          14: 'Only recurse into unreached neighbors',
          18: 'Explore everything reachable from node 0',
          19: 'Tree iff all n nodes were reached',
        },
        java: {
          1: 'Define method returning boolean',
          2: 'A tree must have exactly n-1 edges',
          4: 'Create adjacency list container',
          5: 'Add an empty neighbor list per node',
          6: 'Process each undirected edge',
          7: 'Record e[1] as a neighbor of e[0]',
          8: 'Record e[0] as a neighbor of e[1]',
          11: 'Track which nodes DFS reaches',
          12: 'Explore everything reachable from node 0',
          14: 'Check every node was reached',
          15: 'Unreached node means disconnected — not a tree',
          17: 'All nodes reached with n-1 edges: valid tree',
          20: 'Define DFS flood-fill helper',
          21: 'Mark the current node as reached',
          22: 'Walk each neighbor',
          23: 'Only recurse into unreached neighbors',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function with node count and edges',
      2: 'Tree must have exactly n-1 edges',
      3: 'Return False if edge count is wrong',
      5: 'Each node starts as its own parent',
      6: 'Initialize rank array for union by rank',
      8: 'Define find with path compression',
      9: 'Traverse up until root is found',
      10: 'Path compression: point to grandparent',
      11: 'Move to the compressed parent',
      12: 'Return the root of the set',
      14: 'Define union to merge two sets',
      15: 'Find roots of both nodes',
      16: 'If same root, cycle detected',
      17: 'Return False since nodes already connected',
      18: 'Attach smaller rank under larger',
      19: 'Attach rootA under rootB',
      20: 'Attach larger rank under smaller',
      21: 'Attach rootB under rootA',
      23: 'Equal rank: pick rootA as new root',
      24: 'Increment rank of new root',
      25: 'Return True for successful union',
      27: 'Process each edge for cycle check',
      28: 'If union fails, cycle exists',
      29: 'Return False since not a tree',
      30: 'All edges processed with no cycle',
    },
    javascript: {
      1: 'Define function with node count and edges',
      2: 'Tree must have exactly n-1 edges',
      4: 'Each node starts as its own parent',
      5: 'Initialize rank array for union by rank',
      7: 'Define find with path compression',
      8: 'Traverse up until root is found',
      9: 'Path compression: point to grandparent',
      10: 'Move to the compressed parent',
      12: 'Return the root of the set',
      15: 'Define union to merge two sets',
      16: 'Find roots of both nodes',
      17: 'If same root, already connected',
      18: 'Attach smaller rank under larger',
      19: 'Attach rootA under rootB',
      20: 'Attach larger rank under smaller',
      21: 'Attach rootB under rootA',
      23: 'Equal rank: pick rootA as new root',
      24: 'Increment rank of new root',
      26: 'Return true for successful union',
      29: 'Process each edge for cycle check',
      30: 'If union fails, not a valid tree',
      31: 'All edges processed, graph is a tree',
    },
    java: {
      1: 'Define method returning boolean',
      2: 'Tree must have exactly n-1 edges',
      4: 'Create parent array for union-find',
      5: 'Create rank array for union by rank',
      6: 'Initialize each node as its own parent',
      8: 'Process each edge for cycle check',
      9: 'If union fails, cycle detected',
      11: 'All edges processed, graph is a tree',
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
