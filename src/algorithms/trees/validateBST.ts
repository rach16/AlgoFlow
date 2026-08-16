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

function runValidateBSTInorder(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), inorder: [] },
    highlights: [],
    message: 'Key insight: an inorder traversal (left, node, right) of a valid BST visits values in strictly increasing order — so just check that each value beats the previous one',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  let prev: number | null = null;
  const visited: number[] = [];
  let valid = true;

  function inorder(i: number): boolean {
    const val = getVal(i);
    if (val === null) return true;

    if (!inorder(getLeft(i))) return false;

    steps.push({
      state: { tree: toTreeNodes(arr), inorder: [...visited, val], prev: prev === null ? 'none' : prev },
      highlights: [],
      treeHighlights: [i],
      message: `Inorder visit: node ${val}. Previous inorder value: ${prev === null ? 'none (this is the smallest so far)' : prev}`,
      codeLine: 9,
      action: 'visit',
    } as AlgorithmStep);

    if (prev !== null && val <= prev) {
      steps.push({
        state: { tree: toTreeNodes(arr), inorder: [...visited, val], prev, valid: false },
        highlights: [],
        treeHighlights: [i],
        message: `Violation! ${val} <= ${prev} — the inorder sequence is not strictly increasing, so this is NOT a valid BST`,
        codeLine: 10,
        action: 'compare',
      } as AlgorithmStep);
      valid = false;
      return false;
    }

    visited.push(val);
    prev = val;

    steps.push({
      state: { tree: toTreeNodes(arr), inorder: [...visited], prev },
      highlights: [],
      treeHighlights: [i],
      message: `${prev === val && visited.length === 1 ? `${val} starts` : `${val} extends`} the increasing sequence: [${visited.join(', ')}]. Continue into the right subtree`,
      codeLine: 11,
      action: 'found',
    } as AlgorithmStep);

    return inorder(getRight(i));
  }

  if (getVal(0) !== null) {
    inorder(0);
  }

  steps.push({
    state: { tree: toTreeNodes(arr), inorder: [...visited], result: valid, valid },
    highlights: [],
    message: valid
      ? `Full inorder sequence [${visited.join(', ')}] is strictly increasing — the tree IS a valid BST!`
      : 'Inorder sequence stopped increasing — the tree is NOT a valid BST!',
    codeLine: 13,
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
  optimalApproachName: 'DFS with Min/Max Bounds',
  approaches: [
    {
      id: 'inorder-traversal',
      name: 'Inorder Traversal',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      description:
        'Instead of passing (min, max) bounds down, exploit the fact that an inorder traversal of a BST must produce strictly increasing values — track only the previously visited value.',
      code: {
        python: `def isValidBST(root):
    prev = None
    def inorder(node):
        nonlocal prev
        if not node:
            return True
        if not inorder(node.left):
            return False
        if prev is not None and node.val <= prev:
            return False
        prev = node.val
        return inorder(node.right)
    return inorder(root)`,
        javascript: `function isValidBST(root) {
    let prev = null;
    function inorder(node) {
        if (!node) return true;
        if (!inorder(node.left)) return false;
        if (prev !== null && node.val <= prev) return false;
        prev = node.val;
        return inorder(node.right);
    }
    return inorder(root);
}`,
        java: `private static Integer prev;

public static boolean isValidBST(TreeNode root) {
    prev = null;
    return inorder(root);
}

private static boolean inorder(TreeNode node) {
    if (node == null) return true;
    if (!inorder(node.left)) return false;
    if (prev != null && node.val <= prev) return false;
    prev = node.val;
    return inorder(node.right);
}`,
      },
      run: runValidateBSTInorder,
      lineExplanations: {
        python: {
          1: 'Define function taking tree root',
          2: 'Last value visited inorder — starts as none',
          3: 'Inorder helper: left, node, right',
          4: 'Allow updating prev from the nested function',
          5: 'Base case: null node',
          6: 'An empty subtree is always valid',
          7: 'Validate the entire left subtree first',
          8: 'A violation anywhere fails the whole tree',
          9: 'Current value must be strictly greater than the previous inorder value',
          10: 'Not increasing — not a BST',
          11: 'This node becomes the new previous value',
          12: 'Finally validate the right subtree',
          13: 'Kick off inorder traversal from the root',
        },
        javascript: {
          1: 'Define function taking tree root',
          2: 'Last value visited inorder — starts as null',
          3: 'Inorder helper: left, node, right',
          4: 'An empty subtree is always valid',
          5: 'Validate the entire left subtree first',
          6: 'Current value must be strictly greater than the previous inorder value',
          7: 'This node becomes the new previous value',
          8: 'Finally validate the right subtree',
          10: 'Kick off inorder traversal from the root',
        },
        java: {
          1: 'Last value visited inorder, as a field (null = none yet)',
          3: 'Define method taking tree root',
          4: 'Reset prev before traversing',
          5: 'Kick off inorder traversal from the root',
          8: 'Inorder helper: left, node, right',
          9: 'An empty subtree is always valid',
          10: 'Validate the entire left subtree first',
          11: 'Current value must be strictly greater than the previous inorder value',
          12: 'This node becomes the new previous value',
          13: 'Finally validate the right subtree',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking tree root',
      2: 'Define DFS helper with node and bounds',
      3: 'Base case: null node is valid',
      4: 'Return True for null node',
      5: 'Check if value violates BST bounds',
      6: 'Value out of range, not a valid BST',
      7: 'Recurse left with upper bound as node val',
      8: 'Recurse right with lower bound as node val',
      10: 'Start DFS with -inf to +inf bounds',
    },
    javascript: {
      1: 'Define function taking tree root',
      2: 'Define DFS helper with node and bounds',
      3: 'Base case: null node is valid',
      4: 'Check if value violates BST bounds',
      5: 'Value out of range, not a valid BST',
      6: 'Return combined result of left and right',
      7: 'Recurse left with upper bound as node val',
      8: 'Recurse right with lower bound as node val',
      12: 'Start DFS with -Infinity to Infinity bounds',
    },
    java: {
      1: 'Define function taking tree root',
      2: 'Start DFS with Long min/max as bounds',
      5: 'Define DFS helper with node and bounds',
      6: 'Base case: null node is valid',
      7: 'Value out of range, not a valid BST',
      8: 'Recurse left with upper bound as node val',
      9: 'Recurse right with lower bound as node val',
    },
  },
};
