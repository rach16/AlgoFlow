import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface SubtreeInput {
  root: (number | null)[];
  subRoot: (number | null)[];
}

function runSubtreeOfAnotherTree(input: unknown): AlgorithmStep[] {
  const { root, subRoot } = input as SubtreeInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(root), tree2: toTreeNodes(subRoot) },
    highlights: [],
    message: `Check if subRoot is a subtree of root`,
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(arr: (number | null)[], i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function isSameTree(ri: number, si: number): boolean {
    const rVal = getVal(root, ri);
    const sVal = getVal(subRoot, si);

    if (rVal === null && sVal === null) return true;
    if (rVal === null || sVal === null) return false;
    if (rVal !== sVal) return false;

    return isSameTree(getLeft(ri), getLeft(si)) && isSameTree(getRight(ri), getRight(si));
  }

  let found = false;

  function dfs(i: number): boolean {
    if (found) return true;
    const rVal = getVal(root, i);
    if (rVal === null) return false;

    steps.push({
      state: { tree: toTreeNodes(root), tree2: toTreeNodes(subRoot) },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${rVal} in main tree`,
      codeLine: 3,
      action: 'visit',
    } as AlgorithmStep);

    // Check if subtree rooted at i matches subRoot
    const matches = isSameTree(i, 0);

    if (matches) {
      steps.push({
        state: { tree: toTreeNodes(root), tree2: toTreeNodes(subRoot) },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: [],
        message: `Subtree rooted at node ${rVal} matches subRoot! Found!`,
        codeLine: 5,
        action: 'found',
      } as AlgorithmStep);
      found = true;
      return true;
    }

    steps.push({
      state: { tree: toTreeNodes(root), tree2: toTreeNodes(subRoot) },
      highlights: [],
      treeHighlights: [i],
      message: `Subtree at node ${rVal} does NOT match subRoot, check children`,
      codeLine: 7,
      action: 'compare',
    } as AlgorithmStep);

    return dfs(getLeft(i)) || dfs(getRight(i));
  }

  const result = dfs(0);

  steps.push({
    state: { tree: toTreeNodes(root), tree2: toTreeNodes(subRoot), result },
    highlights: [],
    message: result ? 'subRoot IS a subtree of root!' : 'subRoot is NOT a subtree of root!',
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const subtreeOfAnotherTree: Algorithm = {
  id: 'subtree-of-another-tree',
  name: 'Subtree of Another Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — check isSameTree at every node',
  description:
    'Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot.',
  problemUrl: 'https://leetcode.com/problems/subtree-of-another-tree/',
  code: {
    python: `def isSubtree(root, subRoot):
    if not root:
        return False
    if isSameTree(root, subRoot):
        return True
    return (isSubtree(root.left, subRoot) or
            isSubtree(root.right, subRoot))

def isSameTree(p, q):
    if not p and not q:
        return True
    if not p or not q:
        return False
    return (p.val == q.val and
            isSameTree(p.left, q.left) and
            isSameTree(p.right, q.right))`,
    javascript: `function isSubtree(root, subRoot) {
    if (!root) return false;
    if (isSameTree(root, subRoot))
        return true;
    return (
        isSubtree(root.left, subRoot) ||
        isSubtree(root.right, subRoot)
    );
}

function isSameTree(p, q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    return (
        p.val === q.val &&
        isSameTree(p.left, q.left) &&
        isSameTree(p.right, q.right)
    );
}`,
    java: `public static boolean isSubtree(TreeNode root, TreeNode subRoot) {
    if (root == null) return false;
    if (isSameTree(root, subRoot)) return true;
    return isSubtree(root.left, subRoot) ||
           isSubtree(root.right, subRoot);
}

private static boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null) return false;
    return p.val == q.val &&
           isSameTree(p.left, q.left) &&
           isSameTree(p.right, q.right);
}`,
  },
  defaultInput: { root: [3, 4, 5, 1, 2], subRoot: [4, 1, 2] },
  run: runSubtreeOfAnotherTree,
};
