import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runBalancedBinaryTree(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), balanced: true },
    highlights: [],
    message: 'Check if the binary tree is height-balanced using bottom-up DFS',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  // Returns height if balanced, -1 if not balanced
  function dfs(i: number): number {
    if (i >= arr.length || arr[i] === null) {
      return 0;
    }

    steps.push({
      state: { tree: toTreeNodes(arr) },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${arr[i]}: checking balance`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    const leftHeight = dfs(getLeft(i));
    if (leftHeight === -1) return -1;

    const rightHeight = dfs(getRight(i));
    if (rightHeight === -1) return -1;

    const diff = Math.abs(leftHeight - rightHeight);

    if (diff > 1) {
      steps.push({
        state: { tree: toTreeNodes(arr), balanced: false },
        highlights: [],
        treeHighlights: [i],
        message: `Node ${arr[i]}: NOT balanced! |left(${leftHeight}) - right(${rightHeight})| = ${diff} > 1`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);
      return -1;
    }

    const height = 1 + Math.max(leftHeight, rightHeight);

    steps.push({
      state: { tree: toTreeNodes(arr), balanced: true },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: balanced. left=${leftHeight}, right=${rightHeight}, height=${height}`,
      codeLine: 9,
      action: 'found',
    } as AlgorithmStep);

    return height;
  }

  const result = dfs(0) !== -1;

  steps.push({
    state: { tree: toTreeNodes(arr), result, balanced: result },
    highlights: [],
    message: result ? 'The tree IS height-balanced!' : 'The tree is NOT height-balanced!',
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runBalancedTopDown(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }
  function isNull(i: number): boolean { return i >= arr.length || arr[i] === null; }

  // Plain height helper — recomputed from scratch at every node (the inefficiency to observe)
  function height(i: number): number {
    if (isNull(i)) return 0;
    return 1 + Math.max(height(getLeft(i)), height(getRight(i)));
  }

  steps.push({
    state: { tree: toTreeNodes(arr), balanced: true },
    highlights: [],
    message: 'Top-down check: at EVERY node, recompute both subtree heights from scratch, then recurse into the children',
    codeLine: 1,
  });

  let balanced = true;

  function check(i: number): boolean {
    if (isNull(i)) return true;

    const leftHeight = height(getLeft(i));
    const rightHeight = height(getRight(i));

    steps.push({
      state: { tree: toTreeNodes(arr), balanced, leftHeight, rightHeight },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: measure both subtrees from scratch — left=${leftHeight}, right=${rightHeight}. Deep nodes get re-measured by every ancestor, which is why this is O(n²).`,
      codeLine: 9,
      action: 'visit',
    } as AlgorithmStep);

    const diff = Math.abs(leftHeight - rightHeight);
    if (diff > 1) {
      balanced = false;
      steps.push({
        state: { tree: toTreeNodes(arr), balanced: false },
        highlights: [],
        treeHighlights: [i],
        message: `Node ${arr[i]}: |left(${leftHeight}) - right(${rightHeight})| = ${diff} > 1 — NOT balanced, stop here`,
        codeLine: 12,
        action: 'compare',
      } as AlgorithmStep);
      return false;
    }

    steps.push({
      state: { tree: toTreeNodes(arr), balanced: true },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: |${leftHeight} - ${rightHeight}| = ${diff} ≤ 1 here — but that alone isn't enough: BOTH subtrees must pass the same check recursively`,
      codeLine: 13,
      action: 'compare',
    } as AlgorithmStep);

    return check(getLeft(i)) && check(getRight(i));
  }

  const result = check(0);

  steps.push({
    state: { tree: toTreeNodes(arr), result, balanced: result },
    highlights: [],
    message: result
      ? 'Every node passed the height check — the tree IS balanced. (The bottom-up version reaches the same answer in a single O(n) pass by returning heights upward.)'
      : 'A node failed the height check — the tree is NOT height-balanced.',
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

export const balancedBinaryTree: Algorithm = {
  id: 'balanced-binary-tree',
  name: 'Balanced Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — return -1 if unbalanced, else height',
  description:
    'Given a binary tree, determine if it is height-balanced. A height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.',
  problemUrl: 'https://leetcode.com/problems/balanced-binary-tree/',
  code: {
    python: `def isBalanced(root):
    def dfs(node):
        if not node:
            return 0
        left = dfs(node.left)
        if left == -1:
            return -1
        right = dfs(node.right)
        if abs(left - right) > 1:
            return -1
        return 1 + max(left, right)

    return dfs(root) != -1`,
    javascript: `function isBalanced(root) {
    function dfs(node) {
        if (!node) return 0;
        const left = dfs(node.left);
        if (left === -1) return -1;
        const right = dfs(node.right);
        if (Math.abs(left - right) > 1)
            return -1;
        return 1 + Math.max(left, right);
    }

    return dfs(root) !== -1;
}`,
    java: `public static boolean isBalanced(TreeNode root) {
    return dfs(root) != -1;
}

private static int dfs(TreeNode node) {
    if (node == null) return 0;
    int left = dfs(node.left);
    if (left == -1) return -1;
    int right = dfs(node.right);
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
}`,
  },
  defaultInput: [3, 9, 20, null, null, 15, 7],
  run: runBalancedBinaryTree,
  optimalApproachName: 'Bottom-Up DFS',
  approaches: [
    {
      id: 'top-down-recursion',
      name: 'Top-Down Recursion',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(h)',
      description:
        'The naive editorial solution: at every node recompute both subtree heights with a separate helper, instead of returning heights upward in one bottom-up pass.',
      code: {
        python: `def isBalanced(root):
    def height(node):
        if not node:
            return 0
        return 1 + max(height(node.left), height(node.right))

    if not root:
        return True
    left = height(root.left)
    right = height(root.right)
    if abs(left - right) > 1:
        return False
    return isBalanced(root.left) and isBalanced(root.right)`,
        javascript: `function isBalanced(root) {
    function height(node) {
        if (!node) return 0;
        return 1 + Math.max(height(node.left), height(node.right));
    }

    if (!root) return true;
    const left = height(root.left);
    const right = height(root.right);
    if (Math.abs(left - right) > 1) return false;
    return isBalanced(root.left) && isBalanced(root.right);
}`,
        java: `public static boolean isBalanced(TreeNode root) {
    if (root == null) return true;
    int left = height(root.left);
    int right = height(root.right);
    if (Math.abs(left - right) > 1) return false;
    return isBalanced(root.left) && isBalanced(root.right);
}

private static int height(TreeNode node) {
    if (node == null) return 0;
    return 1 + Math.max(height(node.left), height(node.right));
}`,
      },
      run: runBalancedTopDown,
      lineExplanations: {
        python: {
          1: 'Define function taking tree root node',
          2: 'Helper that measures the height of a subtree',
          3: 'Base case: null node has height 0',
          4: 'Return 0 for null node',
          5: 'Height is 1 plus the taller child subtree',
          7: 'An empty tree is trivially balanced',
          8: 'Return True for null root',
          9: 'Recompute left subtree height from scratch',
          10: 'Recompute right subtree height from scratch',
          11: 'Heights differ by more than 1?',
          12: 'This node is unbalanced — whole tree fails',
          13: 'This node is fine — both subtrees must also be balanced (repeats work: O(n²))',
        },
        javascript: {
          1: 'Define function taking tree root node',
          2: 'Helper that measures the height of a subtree',
          3: 'Base case: null node has height 0',
          4: 'Height is 1 plus the taller child subtree',
          7: 'An empty tree is trivially balanced',
          8: 'Recompute left subtree height from scratch',
          9: 'Recompute right subtree height from scratch',
          10: 'If heights differ by more than 1, tree fails',
          11: 'This node is fine — both subtrees must also be balanced (repeats work: O(n²))',
        },
        java: {
          1: 'Define method taking tree root node',
          2: 'An empty tree is trivially balanced',
          3: 'Recompute left subtree height from scratch',
          4: 'Recompute right subtree height from scratch',
          5: 'If heights differ by more than 1, tree fails',
          6: 'This node is fine — both subtrees must also be balanced (repeats work: O(n²))',
          9: 'Helper that measures the height of a subtree',
          10: 'Base case: null node has height 0',
          11: 'Height is 1 plus the taller child subtree',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking tree root node',
      2: 'Define DFS helper returning height or -1',
      3: 'Base case: null node has height 0',
      4: 'Return 0 for null node',
      5: 'Recursively get left subtree height',
      6: 'If left is unbalanced, propagate -1 up',
      7: 'Return -1 to signal imbalance',
      8: 'Recursively get right subtree height',
      9: 'If height difference > 1, tree is unbalanced',
      10: 'Return -1 to signal imbalance',
      11: 'Return height: 1 plus taller subtree',
      13: 'Tree is balanced if DFS does not return -1',
    },
    javascript: {
      1: 'Define function taking tree root node',
      2: 'Define DFS helper returning height or -1',
      3: 'Base case: null node returns height 0',
      4: 'Recursively get left subtree height',
      5: 'If left is unbalanced, propagate -1 up',
      6: 'Recursively get right subtree height',
      7: 'If height difference > 1, return -1',
      8: 'Signal imbalance',
      9: 'Return height: 1 plus taller subtree',
      12: 'Tree is balanced if DFS does not return -1',
    },
    java: {
      1: 'Define method taking tree root node',
      2: 'Tree is balanced if DFS does not return -1',
      5: 'DFS helper returns height or -1 if unbalanced',
      6: 'Base case: null node returns height 0',
      7: 'Recursively get left subtree height',
      8: 'If left is unbalanced, propagate -1 up',
      9: 'Recursively get right subtree height',
      10: 'If height difference > 1, return -1',
      11: 'Return height: 1 plus taller subtree',
    },
  },
};
