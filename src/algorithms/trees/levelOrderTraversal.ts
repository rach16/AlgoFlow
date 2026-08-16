import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runLevelOrderTraversal(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), queue: [0], result: [] },
    highlights: [],
    message: 'Start BFS level-order traversal with root in queue',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  // BFS
  let queue: number[] = [0];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: number[] = [];
    const levelIndices = [...queue];

    steps.push({
      state: { tree: toTreeNodes(arr), queue: queue.map(i => arr[i]), result: [...result] },
      highlights: [],
      treeHighlights: levelIndices,
      message: `Processing level ${result.length} with ${levelSize} node(s): [${levelIndices.map(i => arr[i]).join(', ')}]`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    const nextQueue: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const nodeIdx = queue[i];
      const val = getVal(nodeIdx);

      if (val === null) continue;

      level.push(val);

      steps.push({
        state: { tree: toTreeNodes(arr), queue: queue.map(idx => arr[idx]), result: [...result], currentLevel: [...level] },
        highlights: [],
        treeHighlights: [nodeIdx],
        treeSecondary: levelIndices.filter(x => x !== nodeIdx),
        message: `Dequeue node ${val}, add to current level`,
        codeLine: 6,
        action: 'pop',
      } as AlgorithmStep);

      const left = getLeft(nodeIdx);
      const right = getRight(nodeIdx);

      if (getVal(left) !== null) {
        nextQueue.push(left);
        steps.push({
          state: { tree: toTreeNodes(arr), queue: nextQueue.map(idx => arr[idx]), result: [...result], currentLevel: [...level] },
          highlights: [],
          treeHighlights: [left],
          treePointers: { parent: nodeIdx },
          message: `Enqueue left child ${arr[left]} of node ${val}`,
          codeLine: 8,
          action: 'push',
        } as AlgorithmStep);
      }

      if (getVal(right) !== null) {
        nextQueue.push(right);
        steps.push({
          state: { tree: toTreeNodes(arr), queue: nextQueue.map(idx => arr[idx]), result: [...result], currentLevel: [...level] },
          highlights: [],
          treeHighlights: [right],
          treePointers: { parent: nodeIdx },
          message: `Enqueue right child ${arr[right]} of node ${val}`,
          codeLine: 9,
          action: 'push',
        } as AlgorithmStep);
      }
    }

    result.push(level);

    steps.push({
      state: { tree: toTreeNodes(arr), queue: nextQueue.map(idx => arr[idx]), result: [...result] },
      highlights: [],
      treeHighlights: levelIndices,
      message: `Level ${result.length - 1} complete: [${level.join(', ')}]`,
      codeLine: 11,
      action: 'found',
    } as AlgorithmStep);

    queue = nextQueue;
  }

  steps.push({
    state: { tree: toTreeNodes(arr), result },
    highlights: [],
    message: `Level order traversal complete: [${result.map(l => `[${l.join(', ')}]`).join(', ')}]`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

function runLevelOrderDFS(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }
  function getVal(i: number): number | null {
    return i < arr.length ? arr[i] : null;
  }

  function snapshotResult(): number[][] {
    return result.map(level => [...level]);
  }

  steps.push({
    state: { tree: toTreeNodes(arr), result: [] },
    highlights: [],
    message: 'DFS version: no queue at all — carry a depth counter down the recursion and append each node to result[depth]. Preorder (node → left → right) keeps every level left-to-right',
    codeLine: 1,
  });

  function dfs(i: number, depth: number): void {
    const val = getVal(i);
    if (val === null) return;

    if (depth === result.length) {
      result.push([]);
      steps.push({
        state: { tree: toTreeNodes(arr), result: snapshotResult() },
        highlights: [],
        treeHighlights: [i],
        message: `First node seen at depth ${depth} — create a new empty level result[${depth}]`,
        codeLine: 8,
        action: 'insert',
      } as AlgorithmStep);
    }

    result[depth].push(val);

    steps.push({
      state: { tree: toTreeNodes(arr), result: snapshotResult(), currentLevel: [...result[depth]] },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${val} at depth ${depth}: append to result[${depth}] → [${result[depth].join(', ')}]. DFS may jump between levels, but each level list still fills left-to-right`,
      codeLine: 9,
      action: 'visit',
    } as AlgorithmStep);

    dfs(getLeft(i), depth + 1);
    dfs(getRight(i), depth + 1);
  }

  dfs(0, 0);

  steps.push({
    state: { tree: toTreeNodes(arr), result: snapshotResult() },
    highlights: [],
    message: `DFS complete — same level-order output as BFS: [${result.map(l => `[${l.join(', ')}]`).join(', ')}], using only O(h) recursion space instead of an O(n) queue`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

export const levelOrderTraversal: Algorithm = {
  id: 'level-order-traversal',
  name: 'Binary Tree Level Order Traversal',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'BFS — process level by level using queue',
  description:
    'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
  problemUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
  code: {
    python: `def levelOrder(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
    javascript: `function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length > 0) {
        const level = [];
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}`,
    java: `public static List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}`,
  },
  defaultInput: [3, 9, 20, null, null, 15, 7],
  run: runLevelOrderTraversal,
  optimalApproachName: 'Iterative BFS',
  approaches: [
    {
      id: 'dfs-by-depth',
      name: 'DFS by Depth',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      description:
        'Recursive DFS that passes the current depth down and appends each node to result[depth] — no queue, and preorder traversal keeps each level ordered left-to-right.',
      code: {
        python: `def levelOrder(root):
    result = []

    def dfs(node, depth):
        if not node:
            return
        if depth == len(result):
            result.append([])
        result[depth].append(node.val)
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 0)
    return result`,
        javascript: `function levelOrder(root) {
    const result = [];

    function dfs(node, depth) {
        if (!node) return;
        if (depth === result.length) result.push([]);
        result[depth].push(node.val);
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    }

    dfs(root, 0);
    return result;
}`,
        java: `public static List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    dfs(root, 0, result);
    return result;
}

private static void dfs(TreeNode node, int depth, List<List<Integer>> result) {
    if (node == null) return;
    if (depth == result.size()) result.add(new ArrayList<>());
    result.get(depth).add(node.val);
    dfs(node.left, depth + 1, result);
    dfs(node.right, depth + 1, result);
}`,
      },
      run: runLevelOrderDFS,
      lineExplanations: {
        python: {
          1: 'Define function taking tree root',
          2: 'Result list — one inner list per depth',
          4: 'DFS helper carrying the current depth',
          5: 'Base case: null node',
          6: 'Nothing to add for null node',
          7: 'First time reaching this depth?',
          8: 'Create the empty list for this new level',
          9: 'Append node value to its level (preorder keeps levels left-to-right)',
          10: 'Recurse left with depth + 1',
          11: 'Recurse right with depth + 1',
          13: 'Start DFS at the root, depth 0',
          14: 'Return all levels',
        },
        javascript: {
          1: 'Define function taking tree root',
          2: 'Result array — one inner array per depth',
          4: 'DFS helper carrying the current depth',
          5: 'Base case: null node — nothing to add',
          6: 'First time reaching this depth: create its empty level',
          7: 'Append node value to its level (preorder keeps levels left-to-right)',
          8: 'Recurse left with depth + 1',
          9: 'Recurse right with depth + 1',
          12: 'Start DFS at the root, depth 0',
          13: 'Return all levels',
        },
        java: {
          1: 'Define function returning list of levels',
          2: 'Result list — one inner list per depth',
          3: 'Start DFS at the root, depth 0',
          4: 'Return all levels',
          7: 'DFS helper carrying the current depth',
          8: 'Base case: null node — nothing to add',
          9: 'First time reaching this depth: create its empty level',
          10: 'Append node value to its level (preorder keeps levels left-to-right)',
          11: 'Recurse left with depth + 1',
          12: 'Recurse right with depth + 1',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking tree root',
      2: 'Base case: empty tree returns empty list',
      3: 'Return empty list for null root',
      4: 'Init result list for all levels',
      5: 'Init queue with root node',
      6: 'Process levels while queue has nodes',
      7: 'Init list for current level values',
      8: 'Iterate over all nodes in current level',
      9: 'Dequeue front node from queue',
      10: 'Add node value to current level',
      11: 'If left child exists, enqueue it',
      12: 'Add left child to queue',
      13: 'If right child exists, enqueue it',
      14: 'Add right child to queue',
      15: 'Append completed level to result',
      16: 'Return all levels',
    },
    javascript: {
      1: 'Define function taking tree root',
      2: 'Base case: empty tree returns empty array',
      3: 'Init result array for all levels',
      4: 'Init queue with root node',
      5: 'Process levels while queue has nodes',
      6: 'Init array for current level values',
      7: 'Save level size before queue changes',
      8: 'Iterate over all nodes in current level',
      9: 'Dequeue front node from queue',
      10: 'Add node value to current level',
      11: 'Enqueue left and right children if exist',
      12: 'Enqueue right child if it exists',
      14: 'Append completed level to result',
      16: 'Return all levels',
    },
    java: {
      1: 'Define function returning list of levels',
      2: 'Init result list for all levels',
      3: 'Base case: empty tree returns empty list',
      4: 'Init queue using LinkedList',
      5: 'Add root to queue',
      6: 'Process levels while queue has nodes',
      7: 'Init list for current level values',
      8: 'Save level size before queue changes',
      9: 'Iterate over all nodes in current level',
      10: 'Dequeue front node from queue',
      11: 'Add node value to current level',
      12: 'Enqueue left child if it exists',
      13: 'Enqueue right child if it exists',
      15: 'Append completed level to result',
      17: 'Return all levels',
    },
  },
};
