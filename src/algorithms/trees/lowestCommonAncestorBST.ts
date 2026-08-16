import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface LCAInput {
  root: (number | null)[];
  p: number;
  q: number;
}

function runLowestCommonAncestorBST(input: unknown): AlgorithmStep[] {
  const { root, p, q } = input as LCAInput;
  const steps: AlgorithmStep[] = [];

  // Find indices of p and q for highlighting
  const pIdx = root.indexOf(p);
  const qIdx = root.indexOf(q);

  steps.push({
    state: { tree: toTreeNodes(root), p, q },
    highlights: [],
    treeHighlights: [pIdx, qIdx].filter(x => x >= 0),
    message: `Find the lowest common ancestor of ${p} and ${q} in the BST`,
    codeLine: 1,
  } as AlgorithmStep);

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  let current = 0;

  while (current < root.length && root[current] !== null) {
    const val = root[current]!;

    steps.push({
      state: { tree: toTreeNodes(root), p, q, current: val },
      highlights: [],
      treeHighlights: [current],
      treeSecondary: [pIdx, qIdx].filter(x => x >= 0),
      message: `At node ${val}: compare with p=${p} and q=${q}`,
      codeLine: 3,
      action: 'visit',
    } as AlgorithmStep);

    if (p < val && q < val) {
      steps.push({
        state: { tree: toTreeNodes(root), p, q, current: val },
        highlights: [],
        treeHighlights: [current],
        message: `Both ${p} and ${q} < ${val}, go LEFT`,
        codeLine: 5,
        action: 'compare',
      } as AlgorithmStep);
      current = getLeft(current);
    } else if (p > val && q > val) {
      steps.push({
        state: { tree: toTreeNodes(root), p, q, current: val },
        highlights: [],
        treeHighlights: [current],
        message: `Both ${p} and ${q} > ${val}, go RIGHT`,
        codeLine: 7,
        action: 'compare',
      } as AlgorithmStep);
      current = getRight(current);
    } else {
      // This is the split point - the LCA
      steps.push({
        state: { tree: toTreeNodes(root), p, q, result: val },
        highlights: [],
        treeHighlights: [current],
        message: `Found LCA! Node ${val} is where p=${p} and q=${q} split. This is the lowest common ancestor.`,
        codeLine: 9,
        action: 'found',
      } as AlgorithmStep);
      break;
    }
  }

  return steps;
}

function runLCARecursive(input: unknown): AlgorithmStep[] {
  const { root, p, q } = input as LCAInput;
  const steps: AlgorithmStep[] = [];

  const pIdx = root.indexOf(p);
  const qIdx = root.indexOf(q);

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  steps.push({
    state: { tree: toTreeNodes(root), p, q },
    highlights: [],
    treeHighlights: [pIdx, qIdx].filter(x => x >= 0),
    message: `Recursive descent: each call looks at one node and delegates to the correct subtree — the call stack replaces the iterative loop`,
    codeLine: 1,
  } as AlgorithmStep);

  function lca(i: number, depth: number): number | null {
    if (i >= root.length || root[i] === null) return null;
    const val = root[i]!;

    steps.push({
      state: { tree: toTreeNodes(root), p, q, current: val, depth },
      highlights: [],
      treeHighlights: [i],
      treeSecondary: [pIdx, qIdx].filter(x => x >= 0),
      message: `Recursive call (depth ${depth}) at node ${val}: where do p=${p} and q=${q} live relative to it?`,
      codeLine: 2,
      action: 'visit',
    } as AlgorithmStep);

    if (p < val && q < val) {
      steps.push({
        state: { tree: toTreeNodes(root), p, q, current: val, depth },
        highlights: [],
        treeHighlights: [i],
        message: `Both ${p} and ${q} < ${val} — the whole answer lives in the LEFT subtree, recurse left`,
        codeLine: 3,
        action: 'compare',
      } as AlgorithmStep);
      return lca(getLeft(i), depth + 1);
    }

    if (p > val && q > val) {
      steps.push({
        state: { tree: toTreeNodes(root), p, q, current: val, depth },
        highlights: [],
        treeHighlights: [i],
        message: `Both ${p} and ${q} > ${val} — the whole answer lives in the RIGHT subtree, recurse right`,
        codeLine: 5,
        action: 'compare',
      } as AlgorithmStep);
      return lca(getRight(i), depth + 1);
    }

    steps.push({
      state: { tree: toTreeNodes(root), p, q, result: val },
      highlights: [],
      treeHighlights: [i],
      message: `Split point! p=${p} and q=${q} fall on different sides of ${val} (or one equals it) — node ${val} is the LCA. The recursion unwinds, passing it back up`,
      codeLine: 6,
      action: 'found',
    } as AlgorithmStep);

    return val;
  }

  lca(0, 0);

  return steps;
}

export const lowestCommonAncestorBST: Algorithm = {
  id: 'lowest-common-ancestor-bst',
  name: 'Lowest Common Ancestor of a BST',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(h)',
  spaceComplexity: 'O(1)',
  pattern: 'BST Property — split point where p and q diverge',
  description:
    'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST. The LCA is the lowest node that has both p and q as descendants (a node can be a descendant of itself).',
  problemUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
  code: {
    python: `def lowestCommonAncestor(root, p, q):
    cur = root
    while cur:
        if p.val < cur.val and q.val < cur.val:
            cur = cur.left
        elif p.val > cur.val and q.val > cur.val:
            cur = cur.right
        else:
            return cur`,
    javascript: `function lowestCommonAncestor(root, p, q) {
    let cur = root;
    while (cur) {
        if (p.val < cur.val && q.val < cur.val) {
            cur = cur.left;
        } else if (p.val > cur.val && q.val > cur.val) {
            cur = cur.right;
        } else {
            return cur;
        }
    }
}`,
    java: `public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    TreeNode cur = root;
    while (cur != null) {
        if (p.val < cur.val && q.val < cur.val) {
            cur = cur.left;
        } else if (p.val > cur.val && q.val > cur.val) {
            cur = cur.right;
        } else {
            return cur;
        }
    }
    return null;
}`,
  },
  defaultInput: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 2, q: 8 },
  run: runLowestCommonAncestorBST,
  optimalApproachName: 'Iterative Walk',
  approaches: [
    {
      id: 'recursive-descent',
      name: 'Recursive Descent',
      timeComplexity: 'O(h)',
      spaceComplexity: 'O(h)',
      description:
        'The same BST split-point logic expressed as recursion — elegant one-liner branches, but each descent adds a call-stack frame (O(h) space) where the iterative walk stays O(1).',
      code: {
        python: `def lowestCommonAncestor(root, p, q):
    if p.val < root.val and q.val < root.val:
        return lowestCommonAncestor(root.left, p, q)
    if p.val > root.val and q.val > root.val:
        return lowestCommonAncestor(root.right, p, q)
    return root`,
        javascript: `function lowestCommonAncestor(root, p, q) {
    if (p.val < root.val && q.val < root.val) {
        return lowestCommonAncestor(root.left, p, q);
    }
    if (p.val > root.val && q.val > root.val) {
        return lowestCommonAncestor(root.right, p, q);
    }
    return root;
}`,
        java: `public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (p.val < root.val && q.val < root.val) {
        return lowestCommonAncestor(root.left, p, q);
    }
    if (p.val > root.val && q.val > root.val) {
        return lowestCommonAncestor(root.right, p, q);
    }
    return root;
}`,
      },
      run: runLCARecursive,
      lineExplanations: {
        python: {
          1: 'Define function taking root, p, and q nodes',
          2: 'Both targets smaller than current node?',
          3: 'LCA must be in the left subtree — recurse left',
          4: 'Both targets larger than current node?',
          5: 'LCA must be in the right subtree — recurse right',
          6: 'p and q split here (or one equals this node) — this is the LCA',
        },
        javascript: {
          1: 'Define function taking root, p, and q nodes',
          2: 'Both targets smaller than current node?',
          3: 'LCA must be in the left subtree — recurse left',
          5: 'Both targets larger than current node?',
          6: 'LCA must be in the right subtree — recurse right',
          8: 'p and q split here (or one equals this node) — this is the LCA',
        },
        java: {
          1: 'Define function taking root, p, and q nodes',
          2: 'Both targets smaller than current node?',
          3: 'LCA must be in the left subtree — recurse left',
          5: 'Both targets larger than current node?',
          6: 'LCA must be in the right subtree — recurse right',
          8: 'p and q split here (or one equals this node) — this is the LCA',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking root, p, and q nodes',
      2: 'Start traversal at root',
      3: 'Traverse while current node exists',
      4: 'Both targets are smaller, go left',
      5: 'Move to left child',
      6: 'Both targets are larger, go right',
      7: 'Move to right child',
      9: 'Split point found, return LCA',
    },
    javascript: {
      1: 'Define function taking root, p, and q nodes',
      2: 'Start traversal at root',
      3: 'Traverse while current node exists',
      4: 'Both targets are smaller, go left',
      5: 'Move to left child',
      6: 'Both targets are larger, go right',
      7: 'Move to right child',
      9: 'Split point found, return LCA',
    },
    java: {
      1: 'Define function taking root, p, and q nodes',
      2: 'Start traversal at root',
      3: 'Traverse while current node exists',
      4: 'Both targets are smaller, go left',
      5: 'Move to left child',
      6: 'Both targets are larger, go right',
      7: 'Move to right child',
      9: 'Split point found, return LCA',
      12: 'Return null if no ancestor found',
    },
  },
};
