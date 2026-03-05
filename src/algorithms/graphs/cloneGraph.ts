import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCloneGraph(input: unknown): AlgorithmStep[] {
  const adjList = input as number[][];
  const steps: AlgorithmStep[] = [];
  const n = adjList.length;

  // Build graph visualization data
  function buildGraphState(
    clonedSoFar: Map<number, number[]>,
    currentHighlights: number[] = [],
    secondaryHighlights: number[] = [],
    visitedEdges: [number, number][] = []
  ) {
    const nodes = [];
    for (let i = 0; i < n; i++) {
      nodes.push({ id: i + 1, label: `${i + 1}` });
    }
    const edges: { from: number; to: number }[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < n; i++) {
      for (const neighbor of adjList[i]) {
        const key = `${Math.min(i + 1, neighbor)}-${Math.max(i + 1, neighbor)}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from: i + 1, to: neighbor });
        }
      }
    }
    return {
      graph: { nodes, edges },
      graphHighlights: currentHighlights,
      graphSecondary: secondaryHighlights,
      graphVisitedEdges: visitedEdges,
      graphDirected: false,
      hashMap: Object.fromEntries(
        Array.from(clonedSoFar.entries()).map(([k, v]) => [`Node ${k}`, `[${v.join(',')}]`])
      ),
    };
  }

  const cloned = new Map<number, number[]>();
  const visitedEdges: [number, number][] = [];

  steps.push({
    state: {
      ...buildGraphState(cloned),
      result: 'Cloning in progress...',
    },
    highlights: [],
    message: `Clone graph with ${n} nodes using BFS. Map original nodes to cloned nodes.`,
    codeLine: 1,
  } as AlgorithmStep);

  // BFS clone
  const queue: number[] = [1];
  cloned.set(1, []);

  steps.push({
    state: {
      ...buildGraphState(cloned, [1]),
      queue: [...queue],
      result: 'Cloning in progress...',
    },
    highlights: [],
    message: `Create clone of node 1. Add node 1 to BFS queue.`,
    codeLine: 4,
    action: 'push',
  } as AlgorithmStep);

  while (queue.length > 0) {
    const node = queue.shift()!;

    steps.push({
      state: {
        ...buildGraphState(cloned, [node], [], visitedEdges),
        queue: [...queue],
        result: 'Cloning in progress...',
      },
      highlights: [],
      message: `Dequeue node ${node}. Process its neighbors: [${adjList[node - 1].join(', ')}]`,
      codeLine: 6,
      action: 'pop',
    } as AlgorithmStep);

    for (const neighbor of adjList[node - 1]) {
      if (!cloned.has(neighbor)) {
        cloned.set(neighbor, []);
        queue.push(neighbor);

        steps.push({
          state: {
            ...buildGraphState(cloned, [node], [neighbor], visitedEdges),
            queue: [...queue],
            result: 'Cloning in progress...',
          },
          highlights: [],
          message: `Neighbor ${neighbor} not yet cloned. Create clone and add to queue.`,
          codeLine: 9,
          action: 'push',
        } as AlgorithmStep);
      }

      // Add edge in cloned graph
      cloned.get(node)!.push(neighbor);
      visitedEdges.push([node, neighbor]);

      steps.push({
        state: {
          ...buildGraphState(cloned, [node], [neighbor], visitedEdges),
          queue: [...queue],
          result: 'Cloning in progress...',
        },
        highlights: [],
        message: `Connect cloned node ${node} -> cloned node ${neighbor}`,
        codeLine: 11,
        action: 'visit',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      ...buildGraphState(cloned, [], [], visitedEdges),
      queue: [],
      result: `Clone complete! ${n} nodes cloned.`,
    },
    highlights: [],
    message: `Done! Successfully cloned all ${n} nodes with their connections.`,
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const cloneGraph: Algorithm = {
  id: 'clone-graph',
  name: 'Clone Graph',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V)',
  pattern: 'BFS/DFS + Hash Map — map old node to cloned node',
  description:
    'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of its neighbors.',
  problemUrl: 'https://leetcode.com/problems/clone-graph/',
  code: {
    python: `def cloneGraph(node):
    if not node:
        return None
    oldToNew = {}

    def dfs(node):
        if node in oldToNew:
            return oldToNew[node]
        copy = Node(node.val)
        oldToNew[node] = copy
        for nei in node.neighbors:
            copy.neighbors.append(dfs(nei))
        return copy

    return dfs(node)`,
    javascript: `function cloneGraph(node) {
    if (!node) return null;
    const oldToNew = new Map();

    function dfs(node) {
        if (oldToNew.has(node))
            return oldToNew.get(node);
        const copy = new Node(node.val);
        oldToNew.set(node, copy);
        for (const nei of node.neighbors) {
            copy.neighbors.push(dfs(nei));
        }
        return copy;
    }

    return dfs(node);
}`,
    java: `public Node cloneGraph(Node node) {
    if (node == null) return null;
    Map<Node, Node> oldToNew = new HashMap<>();
    return dfs(node, oldToNew);
}

private Node dfs(Node node, Map<Node, Node> oldToNew) {
    if (oldToNew.containsKey(node)) {
        return oldToNew.get(node);
    }
    Node copy = new Node(node.val);
    oldToNew.put(node, copy);
    for (Node nei : node.neighbors) {
        copy.neighbors.add(dfs(nei, oldToNew));
    }
    return copy;
}`,
  },
  defaultInput: [[2, 4], [1, 3], [2, 4], [1, 3]],
  run: runCloneGraph,
  lineExplanations: {
    python: {
      1: 'Define function taking a graph node',
      2: 'Handle null input',
      3: 'Return None for empty graph',
      4: 'Map original nodes to their clones',
      6: 'Define recursive DFS clone helper',
      7: 'If node already cloned, return its copy',
      8: 'Return existing clone to avoid cycles',
      9: 'Create new node with same value',
      10: 'Store clone in the map',
      11: 'Recursively clone each neighbor',
      12: 'Add cloned neighbor to copy list',
      13: 'Return the cloned node',
      15: 'Start cloning from the given node',
    },
    javascript: {
      1: 'Define function taking a graph node',
      2: 'Return null for empty graph',
      3: 'Map original nodes to their clones',
      5: 'Define recursive DFS clone helper',
      6: 'If node already cloned, return its copy',
      7: 'Return existing clone',
      8: 'Create new node with same value',
      9: 'Store clone in the map',
      10: 'Recursively clone each neighbor',
      11: 'Add cloned neighbor to copy list',
      13: 'Return the cloned node',
      16: 'Start cloning from the given node',
    },
    java: {
      1: 'Define method taking a graph node',
      2: 'Return null for empty graph',
      3: 'Map original nodes to their clones',
      4: 'Start recursive DFS clone',
      7: 'Define private DFS clone helper',
      8: 'If node already cloned, return copy',
      9: 'Return existing clone',
      11: 'Create new node with same value',
      12: 'Store clone in the map',
      13: 'Recursively clone each neighbor',
      14: 'Add cloned neighbor to copy list',
      16: 'Return the cloned node',
    },
  },
};
