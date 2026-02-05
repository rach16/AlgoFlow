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
  },
  defaultInput: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 2, q: 8 },
  run: runLowestCommonAncestorBST,
};
