import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runMaxDepthBinaryTree(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr) },
    highlights: [],
    message: 'Find the maximum depth of the binary tree using DFS',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function dfs(i: number, depth: number): number {
    if (i >= arr.length || arr[i] === null) {
      steps.push({
        state: { tree: toTreeNodes(arr), currentDepth: depth },
        highlights: [],
        treeHighlights: [],
        message: `Reached null node at index ${i}, return depth 0`,
        codeLine: 3,
      } as AlgorithmStep);
      return 0;
    }

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${arr[i]} at depth ${depth}`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    const leftDepth = dfs(getLeft(i), depth + 1);

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth, leftDepth },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: left subtree depth = ${leftDepth}`,
      codeLine: 5,
    } as AlgorithmStep);

    const rightDepth = dfs(getRight(i), depth + 1);

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth, leftDepth, rightDepth },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: right subtree depth = ${rightDepth}`,
      codeLine: 6,
    } as AlgorithmStep);

    const maxD = 1 + Math.max(leftDepth, rightDepth);

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth, result: maxD },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: max depth = 1 + max(${leftDepth}, ${rightDepth}) = ${maxD}`,
      codeLine: 7,
      action: 'found',
    } as AlgorithmStep);

    return maxD;
  }

  const result = dfs(0, 1);

  steps.push({
    state: { tree: toTreeNodes(arr), result },
    highlights: [],
    message: `Maximum depth of the binary tree is ${result}`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runMaxDepthBFS(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), depth: 0 },
    highlights: [],
    message: 'BFS idea: instead of recursing, walk the tree level by level and count how many levels exist',
    codeLine: 1,
  });

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  if (getVal(0) === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), depth: 0, result: 0 },
      highlights: [],
      message: 'Tree is empty — depth is 0',
      codeLine: 3,
    });
    return steps;
  }

  let depth = 0;
  let queue: number[] = [0];

  steps.push({
    state: { tree: toTreeNodes(arr), depth, queue: queue.map((i) => arr[i]) },
    highlights: [],
    treeHighlights: [0],
    message: `Start with the root in the queue. Each full pass over the queue = one level of the tree`,
    codeLine: 5,
    action: 'push',
  } as AlgorithmStep);

  while (queue.length > 0) {
    depth++;

    steps.push({
      state: { tree: toTreeNodes(arr), depth, queue: queue.map((i) => arr[i]) },
      highlights: [],
      treeHighlights: [...queue],
      message: `Level ${depth}: queue holds [${queue.map((i) => arr[i]).join(', ')}] — every node here is at the same depth, so increment depth to ${depth}`,
      codeLine: 7,
      action: 'visit',
    } as AlgorithmStep);

    const nextQueue: number[] = [];
    for (const nodeIdx of queue) {
      const left = 2 * nodeIdx + 1;
      const right = 2 * nodeIdx + 2;
      if (getVal(left) !== null) nextQueue.push(left);
      if (getVal(right) !== null) nextQueue.push(right);
    }

    if (nextQueue.length > 0) {
      steps.push({
        state: { tree: toTreeNodes(arr), depth, queue: nextQueue.map((i) => arr[i]) },
        highlights: [],
        treeHighlights: [...nextQueue],
        treeSecondary: [...queue],
        message: `Enqueue the children of level ${depth}: [${nextQueue.map((i) => arr[i]).join(', ')}] — these form level ${depth + 1}`,
        codeLine: 10,
        action: 'push',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(arr), depth, queue: [] },
        highlights: [],
        treeHighlights: [...queue],
        message: `No node on level ${depth} has children — the queue is empty, so we have seen every level`,
        codeLine: 6,
      } as AlgorithmStep);
    }

    queue = nextQueue;
  }

  steps.push({
    state: { tree: toTreeNodes(arr), depth, result: depth },
    highlights: [],
    message: `We processed ${depth} level(s), so the maximum depth is ${depth}`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

export const maxDepthBinaryTree: Algorithm = {
  id: 'max-depth-binary-tree',
  name: 'Maximum Depth of Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS Recursion — 1 + max(left depth, right depth)',
  description:
    'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
  problemUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
  code: {
    python: `def maxDepth(root):
    if not root:
        return 0
    # Visit current node
    left = maxDepth(root.left)
    right = maxDepth(root.right)
    return 1 + max(left, right)
    # Final result`,
    javascript: `function maxDepth(root) {
    if (!root) return 0;
    // Visit current node
    const left = maxDepth(root.left);
    const right = maxDepth(root.right);
    return 1 + Math.max(left, right);
    // Final result
}`,
    java: `public static int maxDepth(TreeNode root) {
    if (root == null) return 0;
    // Visit current node
    int left = maxDepth(root.left);
    int right = maxDepth(root.right);
    return 1 + Math.max(left, right);
}`,
  },
  defaultInput: [3, 9, 20, null, null, 15, 7],
  run: runMaxDepthBinaryTree,
  optimalApproachName: 'Recursive DFS',
  approaches: [
    {
      id: 'bfs-level-counting',
      name: 'BFS Level Counting',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of recursing down (DFS), traverse the tree level by level with a queue and count the levels — no recursion, but the queue can hold up to n/2 nodes.',
      code: {
        python: `def maxDepth(root):
    if not root:
        return 0
    depth = 0
    queue = deque([root])
    while queue:
        depth += 1
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return depth`,
        javascript: `function maxDepth(root) {
    if (!root) return 0;
    let depth = 0;
    const queue = [root];
    while (queue.length > 0) {
        depth++;
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    return depth;
}`,
        java: `public static int maxDepth(TreeNode root) {
    if (root == null) return 0;
    int depth = 0;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        depth++;
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return depth;
}`,
      },
      run: runMaxDepthBFS,
      lineExplanations: {
        python: {
          1: 'Define function taking tree root node',
          2: 'Base case: empty tree',
          3: 'Empty tree has depth 0',
          4: 'Depth counter — one increment per level',
          5: 'Queue seeded with the root (level 1)',
          6: 'Keep going while some level still has nodes',
          7: 'A new level is starting — count it',
          8: 'Process exactly the nodes of the current level',
          9: 'Dequeue the next node of this level',
          10: 'If it has a left child, it belongs to the next level',
          11: 'Enqueue left child',
          12: 'If it has a right child, it belongs to the next level',
          13: 'Enqueue right child',
          14: 'Number of levels processed = maximum depth',
        },
        javascript: {
          1: 'Define function taking tree root node',
          2: 'Empty tree has depth 0',
          3: 'Depth counter — one increment per level',
          4: 'Queue seeded with the root (level 1)',
          5: 'Keep going while some level still has nodes',
          6: 'A new level is starting — count it',
          7: 'Freeze the level size before the queue changes',
          8: 'Process exactly the nodes of the current level',
          9: 'Dequeue the next node of this level',
          10: 'Left child (if any) belongs to the next level',
          11: 'Right child (if any) belongs to the next level',
          14: 'Number of levels processed = maximum depth',
        },
        java: {
          1: 'Define method taking tree root node',
          2: 'Empty tree has depth 0',
          3: 'Depth counter — one increment per level',
          4: 'Queue for level-order traversal',
          5: 'Seed the queue with the root (level 1)',
          6: 'Keep going while some level still has nodes',
          7: 'A new level is starting — count it',
          8: 'Freeze the level size before the queue changes',
          9: 'Process exactly the nodes of the current level',
          10: 'Dequeue the next node of this level',
          11: 'Left child (if any) belongs to the next level',
          12: 'Right child (if any) belongs to the next level',
          15: 'Number of levels processed = maximum depth',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking tree root node',
      2: 'Base case: null node has depth 0',
      3: 'Return 0 for null node',
      5: 'Recursively find depth of left subtree',
      6: 'Recursively find depth of right subtree',
      7: 'Depth is 1 plus the deeper subtree',
    },
    javascript: {
      1: 'Define function taking tree root node',
      2: 'Base case: null node returns depth 0',
      4: 'Recursively find depth of left subtree',
      5: 'Recursively find depth of right subtree',
      6: 'Depth is 1 plus the deeper subtree',
    },
    java: {
      1: 'Define method taking tree root node',
      2: 'Base case: null node returns depth 0',
      4: 'Recursively find depth of left subtree',
      5: 'Recursively find depth of right subtree',
      6: 'Depth is 1 plus the deeper subtree',
    },
  },
};
