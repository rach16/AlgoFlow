import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runInvertBinaryTree(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const tree = arr.slice();

  steps.push({
    state: { tree: toTreeNodes(tree) },
    highlights: [],
    message: 'Start inverting the binary tree using DFS (post-order)',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  // We need to swap children at each level from bottom up
  // Collect all valid node indices in post-order
  const postOrder: number[] = [];
  function dfs(i: number): void {
    if (i >= tree.length || tree[i] === null) return;
    dfs(getLeft(i));
    dfs(getRight(i));
    postOrder.push(i);
  }
  dfs(0);

  // Helper to swap entire subtrees in the flat array
  function swapSubtrees(i: number): void {
    const left = getLeft(i);
    const right = getRight(i);
    // We need to swap the children and all their descendants
    // For a flat array, we swap left and right child values, then recurse
    const queue: [number, number][] = [[left, right]];
    while (queue.length > 0) {
      const [l, r] = queue.shift()!;
      if (l < tree.length || r < tree.length) {
        const lVal = l < tree.length ? tree[l] : null;
        const rVal = r < tree.length ? tree[r] : null;
        // Ensure array is large enough
        while (tree.length <= Math.max(l, r)) tree.push(null);
        tree[l] = rVal;
        tree[r] = lVal;
        queue.push([getLeft(l), getLeft(r)]);
        queue.push([getRight(l), getRight(r)]);
      }
    }
  }

  for (const idx of postOrder) {
    const left = getLeft(idx);
    const right = getRight(idx);

    steps.push({
      state: { tree: toTreeNodes(tree) },
      highlights: [],
      treeHighlights: [idx],
      message: `Visit node ${tree[idx]} at index ${idx}`,
      codeLine: 3,
      action: 'visit',
    } as AlgorithmStep);

    const hasLeft = left < tree.length && tree[left] !== null;
    const hasRight = right < tree.length && tree[right] !== null;

    if (hasLeft || hasRight) {
      const leftVal = hasLeft ? tree[left] : 'null';
      const rightVal = hasRight ? tree[right] : 'null';

      steps.push({
        state: { tree: toTreeNodes(tree) },
        highlights: [],
        treeHighlights: [left < tree.length ? left : -1, right < tree.length ? right : -1].filter(x => x >= 0),
        message: `Swap children of node ${tree[idx]}: left=${leftVal}, right=${rightVal}`,
        codeLine: 5,
        action: 'swap',
      } as AlgorithmStep);

      swapSubtrees(idx);

      steps.push({
        state: { tree: toTreeNodes(tree) },
        highlights: [],
        treeHighlights: [idx],
        message: `Swapped children of node ${tree[idx]}`,
        codeLine: 6,
        action: 'swap',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(tree) },
        highlights: [],
        treeHighlights: [idx],
        message: `Node ${tree[idx]} is a leaf, nothing to swap`,
        codeLine: 4,
      } as AlgorithmStep);
    }
  }

  // Trim trailing nulls
  while (tree.length > 0 && tree[tree.length - 1] === null) tree.pop();

  steps.push({
    state: { tree: toTreeNodes(tree), result: tree },
    highlights: [],
    message: `Tree inversion complete! Result: [${tree.join(', ')}]`,
    codeLine: 8,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runInvertBinaryTreeBFS(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const tree = arr.slice();

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }
  function getVal(i: number): number | null {
    return i < tree.length ? tree[i] : null;
  }

  // Swap the entire left/right subtrees of node i in the flat level-order array
  function swapSubtrees(i: number): void {
    const pairs: [number, number][] = [[getLeft(i), getRight(i)]];
    while (pairs.length > 0) {
      const [l, r] = pairs.shift()!;
      if (l < tree.length || r < tree.length) {
        const lVal = l < tree.length ? tree[l] : null;
        const rVal = r < tree.length ? tree[r] : null;
        while (tree.length <= Math.max(l, r)) tree.push(null);
        tree[l] = rVal;
        tree[r] = lVal;
        pairs.push([getLeft(l), getLeft(r)]);
        pairs.push([getRight(l), getRight(r)]);
      }
    }
  }

  steps.push({
    state: { tree: toTreeNodes(tree), queue: [] },
    highlights: [],
    message: 'BFS version: process nodes level by level with a queue, swapping each node\'s children as it is dequeued — no recursion needed',
    codeLine: 1,
  });

  if (getVal(0) === null) {
    steps.push({
      state: { tree: toTreeNodes(tree), result: [] },
      highlights: [],
      message: 'Empty tree — nothing to invert',
      codeLine: 3,
    });
    return steps;
  }

  const queue: number[] = [0];

  steps.push({
    state: { tree: toTreeNodes(tree), queue: queue.map(i => tree[i]) },
    highlights: [],
    treeHighlights: [0],
    message: `Seed the queue with the root ${tree[0]}`,
    codeLine: 4,
    action: 'push',
  } as AlgorithmStep);

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const val = getVal(idx);

    steps.push({
      state: { tree: toTreeNodes(tree), queue: queue.map(i => tree[i]) },
      highlights: [],
      treeHighlights: [idx],
      message: `Dequeue node ${val}`,
      codeLine: 6,
      action: 'pop',
    } as AlgorithmStep);

    const left = getLeft(idx);
    const right = getRight(idx);
    const hasLeft = getVal(left) !== null;
    const hasRight = getVal(right) !== null;

    if (hasLeft || hasRight) {
      swapSubtrees(idx);

      steps.push({
        state: { tree: toTreeNodes(tree), queue: queue.map(i => tree[i]) },
        highlights: [],
        treeHighlights: [left, right].filter(x => getVal(x) !== null),
        message: `Swap children of node ${val}: left is now ${getVal(left) ?? 'null'}, right is now ${getVal(right) ?? 'null'}`,
        codeLine: 7,
        action: 'swap',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(tree), queue: queue.map(i => tree[i]) },
        highlights: [],
        treeHighlights: [idx],
        message: `Node ${val} is a leaf — swapping two nulls changes nothing`,
        codeLine: 7,
      } as AlgorithmStep);
    }

    if (getVal(left) !== null) {
      queue.push(left);
      steps.push({
        state: { tree: toTreeNodes(tree), queue: queue.map(i => tree[i]) },
        highlights: [],
        treeHighlights: [left],
        message: `Enqueue (new) left child ${getVal(left)} so its own children get swapped later`,
        codeLine: 9,
        action: 'push',
      } as AlgorithmStep);
    }

    if (getVal(right) !== null) {
      queue.push(right);
      steps.push({
        state: { tree: toTreeNodes(tree), queue: queue.map(i => tree[i]) },
        highlights: [],
        treeHighlights: [right],
        message: `Enqueue (new) right child ${getVal(right)} so its own children get swapped later`,
        codeLine: 11,
        action: 'push',
      } as AlgorithmStep);
    }
  }

  while (tree.length > 0 && tree[tree.length - 1] === null) tree.pop();

  steps.push({
    state: { tree: toTreeNodes(tree), result: tree },
    highlights: [],
    message: `Queue empty — every node's children have been swapped exactly once. Result: [${tree.join(', ')}]`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const invertBinaryTree: Algorithm = {
  id: 'invert-binary-tree',
  name: 'Invert Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS Recursion — swap left and right at each node',
  description:
    'Given the root of a binary tree, invert the tree, and return its root. Inverting means swapping every left child with its right child at every node.',
  problemUrl: 'https://leetcode.com/problems/invert-binary-tree/',
  code: {
    python: `def invertTree(root):
    if not root:
        return None
    # Swap children
    root.left, root.right = root.right, root.left
    # Recurse
    invertTree(root.left)
    invertTree(root.right)
    return root`,
    javascript: `function invertTree(root) {
    if (!root) return null;
    // Swap children
    const temp = root.left;
    root.left = root.right;
    root.right = temp;
    // Recurse
    invertTree(root.left);
    invertTree(root.right);
    return root;
}`,
    java: `public static TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    // Swap children
    TreeNode temp = root.left;
    root.left = root.right;
    root.right = temp;
    // Recurse
    invertTree(root.left);
    invertTree(root.right);
    return root;
}`,
  },
  defaultInput: [4, 2, 7, 1, 3, 6, 9],
  run: runInvertBinaryTree,
  optimalApproachName: 'Recursive DFS',
  approaches: [
    {
      id: 'iterative-bfs',
      name: 'Iterative BFS',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Swap children level by level with an explicit queue instead of recursion — same O(n) work, but queue space grows to the widest level (O(n)) rather than the tree height.',
      code: {
        python: `from collections import deque

def invertTree(root):
    if not root:
        return None
    queue = deque([root])
    while queue:
        node = queue.popleft()
        node.left, node.right = node.right, node.left
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return root`,
        javascript: `function invertTree(root) {
    if (!root) return null;
    const queue = [root];
    while (queue.length > 0) {
        const node = queue.shift();
        const temp = node.left;
        node.left = node.right;
        node.right = temp;
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return root;
}`,
        java: `public static TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        TreeNode temp = node.left;
        node.left = node.right;
        node.right = temp;
        if (node.left != null) queue.offer(node.left);
        if (node.right != null) queue.offer(node.right);
    }
    return root;
}`,
      },
      run: runInvertBinaryTreeBFS,
      lineExplanations: {
        python: {
          1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Define function taking tree root',
          4: 'Base case: empty tree',
          5: 'Return None for null root',
          6: 'Init queue with the root node',
          7: 'Process until queue is empty',
          8: 'Dequeue the next node',
          9: 'Swap its left and right children in place',
          10: 'If the (new) left child exists...',
          11: 'Enqueue it so its children get swapped too',
          12: 'If the (new) right child exists...',
          13: 'Enqueue it so its children get swapped too',
          14: 'All nodes processed — return the inverted root',
        },
        javascript: {
          1: 'Define function taking tree root',
          2: 'Base case: empty tree returns null',
          3: 'Init queue with the root node',
          4: 'Process until queue is empty',
          5: 'Dequeue the next node',
          6: 'Save left child in temp variable',
          7: 'Set left child to right child',
          8: 'Set right child to saved left child (swap complete)',
          9: 'Enqueue new left child so its children get swapped too',
          10: 'Enqueue new right child so its children get swapped too',
          12: 'All nodes processed — return the inverted root',
        },
        java: {
          1: 'Define function taking tree root',
          2: 'Base case: empty tree returns null',
          3: 'Init queue using LinkedList',
          4: 'Seed the queue with the root node',
          5: 'Process until queue is empty',
          6: 'Dequeue the next node',
          7: 'Save left child in temp variable',
          8: 'Set left child to right child',
          9: 'Set right child to saved left child (swap complete)',
          10: 'Enqueue new left child so its children get swapped too',
          11: 'Enqueue new right child so its children get swapped too',
          13: 'All nodes processed — return the inverted root',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define recursive function taking a tree node',
      2: 'Base case: if node is null, nothing to invert',
      3: 'Return null for empty subtree',
      5: 'Swap left and right children of this node',
      7: 'Recursively invert the left subtree',
      8: 'Recursively invert the right subtree',
      9: 'Return the root of the inverted subtree',
    },
    javascript: {
      1: 'Define recursive function taking a tree node',
      2: 'Base case: if node is null, return null',
      4: 'Save left child in temp variable',
      5: 'Set left child to right child',
      6: 'Set right child to saved left child (swap complete)',
      8: 'Recursively invert the left subtree',
      9: 'Recursively invert the right subtree',
      10: 'Return the root of the inverted subtree',
    },
    java: {
      1: 'Define recursive function taking a tree node',
      2: 'Base case: if node is null, return null',
      4: 'Save left child in temp variable',
      5: 'Set left child to right child',
      6: 'Set right child to saved left child (swap complete)',
      8: 'Recursively invert the left subtree',
      9: 'Recursively invert the right subtree',
      10: 'Return the root of the inverted subtree',
    },
  },
};
