import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runValidateBST(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr) },
    highlights: [],
    message: 'Validate BST using DFS with min/max bounds',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function dfs(i: number, lower: number, upper: number): boolean {
    const val = getVal(i);
    if (val === null) return true;

    steps.push({
      state: { tree: toTreeNodes(arr), lower: lower === -Infinity ? '-inf' : lower, upper: upper === Infinity ? 'inf' : upper },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${val}: valid range is (${lower === -Infinity ? '-inf' : lower}, ${upper === Infinity ? 'inf' : upper})`,
      codeLine: 3,
      action: 'visit',
    } as AlgorithmStep);

    if (val <= lower || val >= upper) {
      steps.push({
        state: { tree: toTreeNodes(arr), valid: false },
        highlights: [],
        treeHighlights: [i],
        message: `Node ${val} violates BST property! Not in range (${lower === -Infinity ? '-inf' : lower}, ${upper === Infinity ? 'inf' : upper})`,
        codeLine: 5,
        action: 'compare',
      } as AlgorithmStep);
      return false;
    }

    steps.push({
      state: { tree: toTreeNodes(arr) },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${val} is valid. Check left subtree with range (${lower === -Infinity ? '-inf' : lower}, ${val}) and right with (${val}, ${upper === Infinity ? 'inf' : upper})`,
      codeLine: 6,
      action: 'found',
    } as AlgorithmStep);

    const leftValid = dfs(getLeft(i), lower, val);
    if (!leftValid) return false;

    const rightValid = dfs(getRight(i), val, upper);
    return rightValid;
  }

  const result = dfs(0, -Infinity, Infinity);

  steps.push({
    state: { tree: toTreeNodes(arr), result, valid: result },
    highlights: [],
    message: result ? 'The tree IS a valid BST!' : 'The tree is NOT a valid BST!',
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const validateBST: Algorithm = {
  id: 'validate-bst',
  name: 'Validate Binary Search Tree',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — pass valid (min, max) range down',
  description:
    'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has the property that for every node, all values in its left subtree are less than the node\'s value, and all values in its right subtree are greater.',
  problemUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
  code: {
    python: `def isValidBST(root):
    def dfs(node, lower, upper):
        if not node:
            return True
        if node.val <= lower or node.val >= upper:
            return False
        return (dfs(node.left, lower, node.val) and
                dfs(node.right, node.val, upper))

    return dfs(root, float('-inf'), float('inf'))`,
    javascript: `function isValidBST(root) {
    function dfs(node, lower, upper) {
        if (!node) return true;
        if (node.val <= lower || node.val >= upper)
            return false;
        return (
            dfs(node.left, lower, node.val) &&
            dfs(node.right, node.val, upper)
        );
    }

    return dfs(root, -Infinity, Infinity);
}`,
    java: `public static boolean isValidBST(TreeNode root) {
    return dfs(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private static boolean dfs(TreeNode node, long lower, long upper) {
    if (node == null) return true;
    if (node.val <= lower || node.val >= upper) return false;
    return dfs(node.left, lower, node.val) &&
           dfs(node.right, node.val, upper);
}`,
  },
  defaultInput: [2, 1, 3],
  run: runValidateBST,
};
