import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface SameTreeInput {
  p: (number | null)[];
  q: (number | null)[];
}

function runSameTree(input: unknown): AlgorithmStep[] {
  const { p, q } = input as SameTreeInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
    highlights: [],
    message: `Compare two trees: p=[${p.join(', ')}] and q=[${q.join(', ')}]`,
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(arr: (number | null)[], i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function dfs(i: number): boolean {
    const pVal = getVal(p, i);
    const qVal = getVal(q, i);

    if (pVal === null && qVal === null) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
        highlights: [],
        treeHighlights: [],
        message: `Index ${i}: both nodes are null, match!`,
        codeLine: 3,
      } as AlgorithmStep);
      return true;
    }

    if (pVal === null || qVal === null) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
        highlights: [],
        treeHighlights: [i],
        message: `Index ${i}: one node is null (p=${pVal}, q=${qVal}), trees differ!`,
        codeLine: 5,
        action: 'compare',
      } as AlgorithmStep);
      return false;
    }

    steps.push({
      state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
      highlights: [],
      treeHighlights: [i],
      message: `Compare nodes at index ${i}: p=${pVal}, q=${qVal}`,
      codeLine: 7,
      action: 'visit',
    } as AlgorithmStep);

    if (pVal !== qVal) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
        highlights: [],
        treeHighlights: [i],
        message: `Values differ! p=${pVal} != q=${qVal}. Trees are NOT the same.`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);
      return false;
    }

    steps.push({
      state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
      highlights: [],
      treeHighlights: [i],
      message: `Values match! p=${pVal} == q=${qVal}. Check children.`,
      codeLine: 9,
      action: 'found',
    } as AlgorithmStep);

    return dfs(getLeft(i)) && dfs(getRight(i));
  }

  const result = dfs(0);

  steps.push({
    state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), result },
    highlights: [],
    message: result ? 'The two trees ARE the same!' : 'The two trees are NOT the same!',
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const sameTree: Algorithm = {
  id: 'same-tree',
  name: 'Same Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — compare node values recursively',
  description:
    'Given the roots of two binary trees p and q, write a function to check if they are the same or not. Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.',
  problemUrl: 'https://leetcode.com/problems/same-tree/',
  code: {
    python: `def isSameTree(p, q):
    if not p and not q:
        return True
    if not p or not q:
        return False
    if p.val != q.val:
        return False
    return (isSameTree(p.left, q.left) and
            isSameTree(p.right, q.right))
    # Check children
    # Final result`,
    javascript: `function isSameTree(p, q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    if (p.val !== q.val) return false;
    return (
        isSameTree(p.left, q.left) &&
        isSameTree(p.right, q.right)
    );
    // Check children
    // Final result
}`,
  },
  defaultInput: { p: [1, 2, 3], q: [1, 2, 3] },
  run: runSameTree,
};
