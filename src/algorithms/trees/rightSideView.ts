import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runRightSideView(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const result: number[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), result: [] },
    highlights: [],
    message: 'Find the right side view using BFS (level order traversal)',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  if (getVal(0) === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), result: [] },
      highlights: [],
      message: 'Tree is empty, return []',
      codeLine: 2,
    });
    return steps;
  }

  let queue: number[] = [0];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelIndices = [...queue];

    steps.push({
      state: { tree: toTreeNodes(arr), queue: queue.map(i => arr[i]), result: [...result] },
      highlights: [],
      treeHighlights: levelIndices,
      message: `Processing level ${result.length}: ${levelSize} node(s)`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    const nextQueue: number[] = [];
    let rightmostVal: number | null = null;

    for (let i = 0; i < levelSize; i++) {
      const nodeIdx = queue[i];
      const val = getVal(nodeIdx);
      if (val === null) continue;

      rightmostVal = val;

      const left = getLeft(nodeIdx);
      const right = getRight(nodeIdx);

      if (getVal(left) !== null) nextQueue.push(left);
      if (getVal(right) !== null) nextQueue.push(right);
    }

    if (rightmostVal !== null) {
      result.push(rightmostVal);
      const lastIdx = levelIndices[levelIndices.length - 1];

      steps.push({
        state: { tree: toTreeNodes(arr), result: [...result] },
        highlights: [],
        treeHighlights: [lastIdx],
        treeSecondary: levelIndices.slice(0, -1),
        message: `Rightmost node at level ${result.length - 1} is ${rightmostVal}. Right side view so far: [${result.join(', ')}]`,
        codeLine: 8,
        action: 'found',
      } as AlgorithmStep);
    }

    queue = nextQueue;
  }

  steps.push({
    state: { tree: toTreeNodes(arr), result },
    highlights: [],
    message: `Right side view complete: [${result.join(', ')}]`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runRightSideViewDFS(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const result: number[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), result: [] },
    highlights: [],
    message: 'DFS idea: visit the RIGHT child before the left one — then the first node reached at each depth is exactly the one visible from the right',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  if (getVal(0) === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), result: [] },
      highlights: [],
      message: 'Tree is empty, return []',
      codeLine: 4,
    });
    return steps;
  }

  const seenAtDepth: number[] = []; // index of the node recorded at each depth

  function dfs(i: number, depth: number): void {
    const val = getVal(i);
    if (val === null) return;

    if (depth === result.length) {
      result.push(val);
      seenAtDepth.push(i);

      steps.push({
        state: { tree: toTreeNodes(arr), result: [...result], depth },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: seenAtDepth.slice(0, -1),
        message: `Node ${val} is the FIRST node we reach at depth ${depth} — since we always go right first, it is the rightmost one. Add it: [${result.join(', ')}]`,
        codeLine: 7,
        action: 'found',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(arr), result: [...result], depth },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: [seenAtDepth[depth]],
        message: `Node ${val} is at depth ${depth}, but ${arr[seenAtDepth[depth]]} was already seen there — a node further right hides it`,
        codeLine: 6,
        action: 'visit',
      } as AlgorithmStep);
    }

    dfs(getRight(i), depth + 1);
    dfs(getLeft(i), depth + 1);
  }

  dfs(0, 0);

  steps.push({
    state: { tree: toTreeNodes(arr), result },
    highlights: [],
    message: `DFS complete. Right side view: [${result.join(', ')}]`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const rightSideView: Algorithm = {
  id: 'right-side-view',
  name: 'Binary Tree Right Side View',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'BFS — take last node at each level',
  description:
    'Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.',
  problemUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/',
  code: {
    python: `from collections import deque

def rightSideView(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        rightmost = None
        for _ in range(len(queue)):
            node = queue.popleft()
            rightmost = node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(rightmost)
    return result`,
    javascript: `function rightSideView(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length > 0) {
        let rightmost = null;
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            rightmost = node.val;
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(rightmost);
    }
    return result;
}`,
    java: `public static List<Integer> rightSideView(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int rightmost = 0;
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            rightmost = node.val;
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(rightmost);
    }
    return result;
}`,
  },
  defaultInput: [1, 2, 3, null, 5, null, 4],
  run: runRightSideView,
  optimalApproachName: 'BFS Level Order',
  approaches: [
    {
      id: 'dfs-right-first',
      name: 'DFS Right-First',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      description:
        'Instead of scanning whole levels with a queue, DFS visits the right child first — the first node reached at each depth is the visible one, using only O(h) recursion space.',
      code: {
        python: `def rightSideView(root):
    result = []
    def dfs(node, depth):
        if not node:
            return
        if depth == len(result):
            result.append(node.val)
        dfs(node.right, depth + 1)
        dfs(node.left, depth + 1)
    dfs(root, 0)
    return result`,
        javascript: `function rightSideView(root) {
    const result = [];
    function dfs(node, depth) {
        if (!node) return;
        if (depth === result.length) {
            result.push(node.val);
        }
        dfs(node.right, depth + 1);
        dfs(node.left, depth + 1);
    }
    dfs(root, 0);
    return result;
}`,
        java: `public static List<Integer> rightSideView(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    dfs(root, 0, result);
    return result;
}

private static void dfs(TreeNode node, int depth, List<Integer> result) {
    if (node == null) return;
    if (depth == result.size()) {
        result.add(node.val);
    }
    dfs(node.right, depth + 1, result);
    dfs(node.left, depth + 1, result);
}`,
      },
      run: runRightSideViewDFS,
      lineExplanations: {
        python: {
          1: 'Define function taking tree root',
          2: 'Result list — one entry per depth',
          3: 'DFS helper carrying the current depth',
          4: 'Base case: null node',
          5: 'Nothing to record for null',
          6: 'First time reaching this depth? (result has one value per depth already seen)',
          7: 'Then this node is the rightmost at this depth — record it',
          8: 'Go RIGHT first, so the rightmost node reaches each depth first',
          9: 'Left subtree only fills depths the right side did not reach',
          10: 'Start DFS at the root, depth 0',
          11: 'Return the recorded right side view',
        },
        javascript: {
          1: 'Define function taking tree root',
          2: 'Result array — one entry per depth',
          3: 'DFS helper carrying the current depth',
          4: 'Base case: null node, nothing to record',
          5: 'First time reaching this depth? (result has one value per depth already seen)',
          6: 'Then this node is the rightmost at this depth — record it',
          8: 'Go RIGHT first, so the rightmost node reaches each depth first',
          9: 'Left subtree only fills depths the right side did not reach',
          11: 'Start DFS at the root, depth 0',
          12: 'Return the recorded right side view',
        },
        java: {
          1: 'Define method taking tree root',
          2: 'Result list — one entry per depth',
          3: 'Start DFS at the root, depth 0',
          4: 'Return the recorded right side view',
          7: 'DFS helper carrying the current depth',
          8: 'Base case: null node, nothing to record',
          9: 'First time reaching this depth? (result has one value per depth already seen)',
          10: 'Then this node is the rightmost at this depth — record it',
          12: 'Go RIGHT first, so the rightmost node reaches each depth first',
          13: 'Left subtree only fills depths the right side did not reach',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
      3: 'Define function taking tree root',
      4: 'Base case: empty tree returns empty list',
      5: 'Return empty list for null root',
      6: 'Init result list for right side values',
      7: 'Init queue with root node',
      8: 'Process levels while queue has nodes',
      9: 'Track rightmost node at each level',
      10: 'Iterate over all nodes in current level',
      11: 'Dequeue front node from queue',
      12: 'Update rightmost to current node value',
      13: 'If left child exists, enqueue it',
      14: 'Add left child to queue',
      15: 'If right child exists, enqueue it',
      16: 'Add right child to queue',
      17: 'Append rightmost value to result',
      18: 'Return right side view values',
    },
    javascript: {
      1: 'Define function taking tree root',
      2: 'Base case: empty tree returns empty array',
      3: 'Init result array for right side values',
      4: 'Init queue with root node',
      5: 'Process levels while queue has nodes',
      6: 'Track rightmost node at each level',
      7: 'Save level size before queue changes',
      8: 'Iterate over all nodes in current level',
      9: 'Dequeue front node from queue',
      10: 'Update rightmost to current node value',
      11: 'Enqueue left and right children if exist',
      12: 'Enqueue right child if it exists',
      14: 'Append rightmost value to result',
      16: 'Return right side view values',
    },
    java: {
      1: 'Define function returning right side values',
      2: 'Init result list for right side values',
      3: 'Base case: empty tree returns empty list',
      4: 'Init queue using LinkedList',
      5: 'Add root to queue',
      6: 'Process levels while queue has nodes',
      7: 'Track rightmost value at each level',
      8: 'Save level size before queue changes',
      9: 'Iterate over all nodes in current level',
      10: 'Dequeue front node from queue',
      11: 'Update rightmost to current node value',
      12: 'Enqueue left child if it exists',
      13: 'Enqueue right child if it exists',
      15: 'Append rightmost value to result',
      17: 'Return right side view values',
    },
  },
};
