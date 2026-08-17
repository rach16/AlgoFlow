import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MHTInput {
  n: number;
  edges: number[][];
}

function buildTreeGraph(
  n: number,
  edges: number[][],
  highlights: number[] = [],
  secondary: number[] = [],
  visitedEdges: [number, number][] = []
) {
  return {
    graph: {
      nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: `${i}` })),
      edges: edges.map(([a, b]) => ({ from: a, to: b })),
    },
    graphHighlights: highlights,
    graphSecondary: secondary,
    graphVisitedEdges: visitedEdges,
    graphDirected: false,
  };
}

function runMinimumHeightTrees(input: unknown): AlgorithmStep[] {
  const { n, edges } = input as MHTInput;
  const steps: AlgorithmStep[] = [];

  if (n === 1) {
    return [
      {
        state: {
          ...buildTreeGraph(n, edges, [0]),
          result: '[0]',
        },
        highlights: [],
        message: 'A single node is trivially its own centroid — return [0].',
        codeLine: 3,
        action: 'found',
      } as AlgorithmStep,
    ];
  }

  const adj: Set<number>[] = Array.from({ length: n }, () => new Set<number>());
  for (const [a, b] of edges) {
    adj[a].add(b);
    adj[b].add(a);
  }

  const degreeMap = () =>
    Object.fromEntries(Array.from({ length: n }, (_, i) => [`Node ${i}`, `degree=${adj[i].size}`]));

  steps.push({
    state: {
      ...buildTreeGraph(n, edges),
      result: 'Finding the centroid(s)...',
    },
    highlights: [],
    message: `A tree with ${n} nodes has at most 2 roots that minimise height, and they sit dead centre. Instead of rooting at every node, shave the outermost layer of leaves off repeatedly until 1 or 2 nodes survive.`,
    codeLine: 1,
  } as AlgorithmStep);

  steps.push({
    state: {
      ...buildTreeGraph(n, edges),
      hashMap: degreeMap(),
      result: 'Degrees computed',
    },
    highlights: [],
    message: `Degrees: [${Array.from({ length: n }, (_, i) => adj[i].size).join(', ')}]. A node with degree 1 is a leaf — the farthest possible thing from the centre.`,
    codeLine: 7,
  } as AlgorithmStep);

  let leaves: number[] = [];
  for (let i = 0; i < n; i++) if (adj[i].size === 1) leaves.push(i);
  let remaining = n;
  const removed: number[] = [];
  const peeledEdges: [number, number][] = [];

  steps.push({
    state: {
      ...buildTreeGraph(n, edges, [...leaves]),
      hashMap: degreeMap(),
      queue: [...leaves],
      result: `${remaining} nodes remaining`,
    },
    highlights: [],
    message: `Layer 0 leaves: [${leaves.join(', ')}]. These can never be a minimum-height root while anything sits inside them.`,
    codeLine: 9,
    action: 'push',
  } as AlgorithmStep);

  let layer = 0;
  while (remaining > 2) {
    layer++;
    remaining -= leaves.length;

    steps.push({
      state: {
        ...buildTreeGraph(n, edges, [...leaves], [...removed], peeledEdges.map(e => [...e] as [number, number])),
        hashMap: degreeMap(),
        queue: [...leaves],
        result: `${remaining} node(s) will remain after this peel`,
      },
      highlights: [],
      message: `${remaining + leaves.length} nodes left, which is more than 2 — peel layer ${layer}: strip all ${leaves.length} current leaf/leaves, leaving ${remaining}.`,
      codeLine: 12,
      action: 'compare',
    } as AlgorithmStep);

    const next: number[] = [];
    for (const leaf of leaves) {
      const nei = [...adj[leaf]][0];
      adj[leaf].delete(nei);
      adj[nei].delete(leaf);
      removed.push(leaf);
      peeledEdges.push([leaf, nei]);
      const becameLeaf = adj[nei].size === 1;
      if (becameLeaf) next.push(nei);

      steps.push({
        state: {
          ...buildTreeGraph(n, edges, [nei], [...removed], peeledEdges.map(e => [...e] as [number, number])),
          hashMap: degreeMap(),
          queue: [...next],
          result: `Removed ${leaf}`,
        },
        highlights: [],
        message: `Cut leaf ${leaf} from ${nei}. Node ${nei} now has degree ${adj[nei].size}${becameLeaf ? ' — it just became the new outermost layer, queue it.' : ' — still interior.'}`,
        codeLine: 16,
        action: becameLeaf ? 'push' : 'delete',
      } as AlgorithmStep);
    }

    leaves = next;

    steps.push({
      state: {
        ...buildTreeGraph(n, edges, [...leaves], [...removed], peeledEdges.map(e => [...e] as [number, number])),
        hashMap: degreeMap(),
        queue: [...leaves],
        result: `${remaining} node(s) remaining`,
      },
      highlights: [],
      message: `Layer ${layer} peeled. New leaf frontier: [${leaves.join(', ')}]; ${remaining} node(s) still standing.`,
      codeLine: 19,
      action: 'visit',
    } as AlgorithmStep);
  }

  const answer = [...leaves].sort((a, b) => a - b);

  steps.push({
    state: {
      ...buildTreeGraph(n, edges, answer, [...removed], peeledEdges.map(e => [...e] as [number, number])),
      hashMap: degreeMap(),
      result: `[${answer.join(', ')}]`,
    },
    highlights: [],
    message: `Only ${remaining} node(s) survive, so the peeling stops. The last layer standing is the centre: [${answer.join(', ')}].`,
    codeLine: 20,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runMinimumHeightTreesDiameter(input: unknown): AlgorithmStep[] {
  const { n, edges } = input as MHTInput;
  const steps: AlgorithmStep[] = [];

  if (n === 1) {
    return [
      {
        state: {
          ...buildTreeGraph(n, edges, [0]),
          result: '[0]',
        },
        highlights: [],
        message: 'A single node is trivially its own centroid — return [0].',
        codeLine: 3,
        action: 'found',
      } as AlgorithmStep,
    ];
  }

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  steps.push({
    state: {
      ...buildTreeGraph(n, edges),
      result: 'Finding the centroid(s)...',
    },
    highlights: [],
    message: `Different lens: the minimum-height roots are exactly the middle of the tree's longest path (its diameter). Two BFS sweeps find that path, then we take its centre.`,
    codeLine: 1,
  } as AlgorithmStep);

  function bfs(src: number, label: string): { last: number; parent: number[] } {
    const parent = new Array(n).fill(-1);
    const seen = new Array(n).fill(false);
    const dist = new Array(n).fill(-1);
    seen[src] = true;
    dist[src] = 0;
    const order = [src];
    const walked: [number, number][] = [];

    for (let i = 0; i < order.length; i++) {
      const node = order[i];
      for (const nei of adj[node]) {
        if (seen[nei]) continue;
        seen[nei] = true;
        parent[nei] = node;
        dist[nei] = dist[node] + 1;
        order.push(nei);
        walked.push([node, nei]);
      }

      steps.push({
        state: {
          ...buildTreeGraph(n, edges, [node], order.filter(o => o !== node), walked.map(e => [...e] as [number, number])),
          hashMap: Object.fromEntries(
            Array.from({ length: n }, (_, k) => [`Node ${k}`, dist[k] < 0 ? 'unreached' : `dist=${dist[k]}`])
          ),
          queue: order.slice(i + 1),
          result: `${label}: visiting ${node} at distance ${dist[node]}`,
        },
        highlights: [],
        message: `${label}: expand node ${node} (distance ${dist[node]} from ${src}). Discovery order so far: ${order.join(' → ')}.`,
        codeLine: 14,
        action: 'visit',
      } as AlgorithmStep);
    }

    return { last: order[order.length - 1], parent };
  }

  const first = bfs(0, 'BFS #1 from node 0');
  const u = first.last;

  steps.push({
    state: {
      ...buildTreeGraph(n, edges, [u]),
      result: `Diameter endpoint u = ${u}`,
    },
    highlights: [],
    message: `The last node BFS #1 reached is ${u} — from any start, the farthest node is guaranteed to be an endpoint of the tree's diameter.`,
    codeLine: 22,
    action: 'found',
  } as AlgorithmStep);

  const second = bfs(u, `BFS #2 from node ${u}`);
  let v = second.last;
  const parent = second.parent;

  steps.push({
    state: {
      ...buildTreeGraph(n, edges, [u, v]),
      result: `Diameter runs ${u} … ${v}`,
    },
    highlights: [],
    message: `BFS #2 from ${u} ends at ${v}. So ${u} … ${v} is a longest path in the tree.`,
    codeLine: 23,
    action: 'found',
  } as AlgorithmStep);

  const path: number[] = [];
  while (v !== -1) {
    path.push(v);
    v = parent[v];
  }

  steps.push({
    state: {
      ...buildTreeGraph(n, edges, [...path]),
      result: `Diameter path: ${path.join(' → ')}`,
    },
    highlights: [],
    message: `Follow parent pointers back to ${u}: the diameter is ${path.join(' → ')} (${path.length} nodes, ${path.length - 1} edges).`,
    codeLine: 27,
    action: 'visit',
  } as AlgorithmStep);

  const mid = Math.floor(path.length / 2);
  const answer =
    path.length % 2 === 1 ? [path[mid]] : [path[mid - 1], path[mid]].sort((a, b) => a - b);

  steps.push({
    state: {
      ...buildTreeGraph(n, edges, answer, path.filter(p => !answer.includes(p))),
      result: `[${answer.join(', ')}]`,
    },
    highlights: [],
    message:
      path.length % 2 === 1
        ? `The path has an odd number of nodes, so it has one exact middle: [${answer.join(', ')}]. Same answer as leaf-peeling.`
        : `The path has an even number of nodes, so two nodes tie for the middle: [${answer.join(', ')}]. Same answer as leaf-peeling.`,
    codeLine: 33,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const minimumHeightTrees: Algorithm = {
  id: 'minimum-height-trees',
  name: 'Minimum Height Trees',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V+E)',
  pattern: 'Topological Sort — peel leaves inward until the centroids remain',
  description:
    'Given a tree of n nodes labeled 0..n-1 described by n-1 edges, you may root it at any node. Return every root that gives the tree its minimum possible height. Such roots are called minimum height trees, and there are always one or two of them.',
  problemUrl: 'https://leetcode.com/problems/minimum-height-trees/',
  code: {
    python: `def findMinHeightTrees(n, edges):
    if n == 1:
        return [0]
    adj = [set() for _ in range(n)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)

    leaves = [i for i in range(n) if len(adj[i]) == 1]
    remaining = n
    while remaining > 2:
        remaining -= len(leaves)
        new_leaves = []
        for leaf in leaves:
            nei = adj[leaf].pop()
            adj[nei].remove(leaf)
            if len(adj[nei]) == 1:
                new_leaves.append(nei)
        leaves = new_leaves
    return leaves`,
    javascript: `function findMinHeightTrees(n, edges) {
    if (n === 1) return [0];
    const adj = Array.from({length: n}, () => new Set());
    for (const [a, b] of edges) {
        adj[a].add(b);
        adj[b].add(a);
    }

    let leaves = [];
    for (let i = 0; i < n; i++) if (adj[i].size === 1) leaves.push(i);
    let remaining = n;
    while (remaining > 2) {
        remaining -= leaves.length;
        const next = [];
        for (const leaf of leaves) {
            const nei = [...adj[leaf]][0];
            adj[leaf].delete(nei);
            adj[nei].delete(leaf);
            if (adj[nei].size === 1) next.push(nei);
        }
        leaves = next;
    }
    return leaves;
}`,
    java: `public static List<Integer> findMinHeightTrees(int n, int[][] edges) {
    if (n == 1) return List.of(0);
    List<Set<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new HashSet<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);
    }

    List<Integer> leaves = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        if (adj.get(i).size() == 1) leaves.add(i);
    }
    int remaining = n;
    while (remaining > 2) {
        remaining -= leaves.size();
        List<Integer> next = new ArrayList<>();
        for (int leaf : leaves) {
            int nei = adj.get(leaf).iterator().next();
            adj.get(leaf).remove(nei);
            adj.get(nei).remove(leaf);
            if (adj.get(nei).size() == 1) next.add(nei);
        }
        leaves = next;
    }
    return leaves;
}`,
  },
  defaultInput: { n: 6, edges: [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]] },
  run: runMinimumHeightTrees,
  optimalApproachName: 'Leaf Peeling',
  approaches: [
    {
      id: 'double-bfs-diameter',
      name: 'Double BFS (Diameter)',
      timeComplexity: 'O(V+E)',
      spaceComplexity: 'O(V+E)',
      description:
        'Uses the tree-diameter trick instead of peeling: BFS from any node to find one endpoint of the longest path, BFS again to find the other, then the middle one or two nodes of that path are the centroids.',
      code: {
        python: `def findMinHeightTrees(n, edges):
    if n == 1:
        return [0]
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    def bfs(src):
        parent = [-1] * n
        seen = [False] * n
        seen[src] = True
        order = [src]
        for node in order:
            for nei in adj[node]:
                if not seen[nei]:
                    seen[nei] = True
                    parent[nei] = node
                    order.append(nei)
        return order[-1], parent

    u, _ = bfs(0)
    v, parent = bfs(u)

    path = []
    while v != -1:
        path.append(v)
        v = parent[v]

    mid = len(path) // 2
    if len(path) % 2 == 1:
        return [path[mid]]
    return [path[mid - 1], path[mid]]`,
        javascript: `function findMinHeightTrees(n, edges) {
    if (n === 1) return [0];
    const adj = Array.from({length: n}, () => []);
    for (const [a, b] of edges) {
        adj[a].push(b);
        adj[b].push(a);
    }

    function bfs(src) {
        const parent = new Array(n).fill(-1);
        const seen = new Array(n).fill(false);
        seen[src] = true;
        const order = [src];
        for (let i = 0; i < order.length; i++) {
            for (const nei of adj[order[i]]) {
                if (seen[nei]) continue;
                seen[nei] = true;
                parent[nei] = order[i];
                order.push(nei);
            }
        }
        return [order[order.length - 1], parent];
    }

    const [u] = bfs(0);
    let [v, parent] = bfs(u);

    const path = [];
    while (v !== -1) {
        path.push(v);
        v = parent[v];
    }
    const mid = Math.floor(path.length / 2);
    return path.length % 2 === 1 ? [path[mid]] : [path[mid - 1], path[mid]];
}`,
        java: `public static List<Integer> findMinHeightTrees(int n, int[][] edges) {
    if (n == 1) return List.of(0);
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);
    }

    int[] parent = new int[n];
    int u = bfs(0, adj, n, parent);
    int v = bfs(u, adj, n, parent);

    List<Integer> path = new ArrayList<>();
    while (v != -1) {
        path.add(v);
        v = parent[v];
    }
    int mid = path.size() / 2;
    if (path.size() % 2 == 1) return List.of(path.get(mid));
    return List.of(path.get(mid - 1), path.get(mid));
}

private static int bfs(int src, List<List<Integer>> adj, int n, int[] parent) {
    Arrays.fill(parent, -1);
    boolean[] seen = new boolean[n];
    seen[src] = true;
    List<Integer> order = new ArrayList<>();
    order.add(src);
    for (int i = 0; i < order.size(); i++) {
        for (int nei : adj.get(order.get(i))) {
            if (seen[nei]) continue;
            seen[nei] = true;
            parent[nei] = order.get(i);
            order.add(nei);
        }
    }
    return order.get(order.size() - 1);
}`,
      },
      run: runMinimumHeightTreesDiameter,
      lineExplanations: {
        python: {
          1: 'Node count and the n-1 tree edges',
          2: 'Single-node tree is its own centre',
          3: 'Return it directly',
          4: 'Adjacency list, one bucket per node',
          5: 'Read each edge',
          6: 'Undirected: record both directions',
          7: 'Second direction',
          9: 'BFS returning the farthest node and parents',
          10: 'parent[x] rebuilds the path later',
          11: 'Visited flags',
          12: 'The source is reached at distance 0',
          13: 'order doubles as the BFS queue',
          14: 'Walk the queue as it grows',
          15: 'Try each neighbour',
          16: 'Skip anything already reached',
          17: 'Mark it reached',
          18: 'Remember who discovered it',
          19: 'Append it to the frontier',
          20: 'Last discovered = farthest node',
          22: 'First sweep finds one diameter endpoint',
          23: 'Second sweep finds the opposite endpoint',
          25: 'Rebuild the diameter path',
          26: 'Walk parents back to the root of BFS #2',
          27: 'Collect the node',
          28: 'Step to its parent',
          30: 'The centre of the path is the answer',
          31: 'Odd length: exactly one middle node',
          32: 'Return that single centroid',
          33: 'Even length: two nodes tie for the middle',
        },
        javascript: {
          1: 'Node count and the n-1 tree edges',
          2: 'Single-node tree is its own centre',
          3: 'Adjacency list, one bucket per node',
          4: 'Read each edge',
          5: 'Undirected: record both directions',
          6: 'Second direction',
          9: 'BFS returning the farthest node and parents',
          10: 'parent[x] rebuilds the path later',
          11: 'Visited flags',
          12: 'The source is reached first',
          13: 'order doubles as the BFS queue',
          14: 'Walk the queue as it grows',
          15: 'Try each neighbour',
          16: 'Skip anything already reached',
          17: 'Mark it reached',
          18: 'Remember who discovered it',
          19: 'Append it to the frontier',
          22: 'Last discovered = farthest node',
          25: 'First sweep finds one diameter endpoint',
          26: 'Second sweep finds the opposite endpoint',
          28: 'Rebuild the diameter path',
          29: 'Walk parents back to the root of BFS #2',
          30: 'Collect the node',
          31: 'Step to its parent',
          33: 'The centre of the path is the answer',
          34: 'One middle node if odd, two if even',
        },
        java: {
          1: 'Node count and the n-1 tree edges',
          2: 'Single-node tree is its own centre',
          3: 'Adjacency list, one bucket per node',
          5: 'Read each edge',
          6: 'Undirected: record both directions',
          7: 'Second direction',
          10: 'parent[] rebuilds the path later',
          11: 'First sweep finds one diameter endpoint',
          12: 'Second sweep finds the opposite endpoint',
          14: 'Rebuild the diameter path',
          15: 'Walk parents back to the root of BFS #2',
          16: 'Collect the node',
          17: 'Step to its parent',
          19: 'The centre of the path is the answer',
          20: 'Odd length: exactly one middle node',
          21: 'Even length: two nodes tie for the middle',
          24: 'BFS returning the farthest node',
          25: 'Reset parents for this sweep',
          26: 'Visited flags',
          27: 'The source is reached first',
          28: 'order doubles as the BFS queue',
          30: 'Walk the queue as it grows',
          31: 'Try each neighbour',
          32: 'Skip anything already reached',
          33: 'Mark it reached',
          34: 'Remember who discovered it',
          35: 'Append it to the frontier',
          38: 'Last discovered = farthest node',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Node count and the n-1 tree edges',
      2: 'Single-node tree is its own centre',
      3: 'Return it directly',
      4: 'Adjacency as sets so removal is O(1)',
      5: 'Read each edge',
      6: 'Undirected: record both directions',
      7: 'Second direction',
      9: 'Layer 0: every node of degree 1',
      10: 'How many nodes are still standing',
      11: '1 or 2 survivors means we found the centre',
      12: 'This peel removes the whole current layer',
      13: 'Collect the nodes exposed by the peel',
      14: 'Strip each leaf of the current layer',
      15: 'A leaf has exactly one neighbour',
      16: 'Detach it from that neighbour too',
      17: 'Did the neighbour just become a leaf?',
      18: 'Then it forms the next layer',
      19: 'Move inward one ring',
      20: 'The final survivors are the centroids',
    },
    javascript: {
      1: 'Node count and the n-1 tree edges',
      2: 'Single-node tree is its own centre',
      3: 'Adjacency as Sets so removal is O(1)',
      4: 'Read each edge',
      5: 'Undirected: record both directions',
      6: 'Second direction',
      9: 'Current layer of leaves',
      10: 'Layer 0: every node of degree 1',
      11: 'How many nodes are still standing',
      12: '1 or 2 survivors means we found the centre',
      13: 'This peel removes the whole current layer',
      14: 'Collect the nodes exposed by the peel',
      15: 'Strip each leaf of the current layer',
      16: 'A leaf has exactly one neighbour',
      17: 'Detach the edge from the leaf side',
      18: 'Detach it from the neighbour side',
      19: 'Neighbour became a leaf: next layer',
      21: 'Move inward one ring',
      23: 'The final survivors are the centroids',
    },
    java: {
      1: 'Node count and the n-1 tree edges',
      2: 'Single-node tree is its own centre',
      3: 'Adjacency as Sets so removal is O(1)',
      4: 'One bucket per node',
      5: 'Read each edge',
      6: 'Undirected: record both directions',
      7: 'Second direction',
      10: 'Current layer of leaves',
      11: 'Scan every node',
      12: 'Layer 0: every node of degree 1',
      14: 'How many nodes are still standing',
      15: '1 or 2 survivors means we found the centre',
      16: 'This peel removes the whole current layer',
      17: 'Collect the nodes exposed by the peel',
      18: 'Strip each leaf of the current layer',
      19: 'A leaf has exactly one neighbour',
      20: 'Detach the edge from the leaf side',
      21: 'Detach it from the neighbour side',
      22: 'Neighbour became a leaf: next layer',
      24: 'Move inward one ring',
      26: 'The final survivors are the centroids',
    },
  },
};
