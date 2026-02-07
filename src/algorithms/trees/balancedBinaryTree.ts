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
};
