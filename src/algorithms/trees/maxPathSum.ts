import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runMaxPathSum(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  let maxSum = -Infinity;

  steps.push({
    state: { tree: toTreeNodes(arr), maxSum: '-inf' },
    highlights: [],
    message: 'Find the maximum path sum. A path can start and end at any node.',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  // DFS returns the max gain from this node going downward (single path)
  function dfs(i: number): number {
    const val = getVal(i);
    if (val === null) return 0;

    steps.push({
      state: { tree: toTreeNodes(arr), maxSum: maxSum === -Infinity ? '-inf' : maxSum },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${val}: compute max gain`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    // Compute max gain from left and right subtrees
    const leftGain = Math.max(0, dfs(getLeft(i)));
    const rightGain = Math.max(0, dfs(getRight(i)));

    // The path sum through this node (using both children)
    const pathSum = val + leftGain + rightGain;
    const oldMax = maxSum;
    maxSum = Math.max(maxSum, pathSum);

    steps.push({
      state: {
        tree: toTreeNodes(arr),
        maxSum,
        leftGain,
        rightGain,
        pathSum,
        nodeVal: val,
      },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${val}: leftGain=${leftGain}, rightGain=${rightGain}, pathSum=${val}+${leftGain}+${rightGain}=${pathSum}. MaxSum: ${oldMax === -Infinity ? '-inf' : oldMax} -> ${maxSum}`,
      codeLine: 8,
      action: maxSum > oldMax && oldMax !== -Infinity ? 'found' : 'compare',
    } as AlgorithmStep);

    // Return max gain going through this node (can only choose one child)
    const gain = val + Math.max(leftGain, rightGain);

    steps.push({
      state: { tree: toTreeNodes(arr), maxSum, gain },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${val}: return gain = ${val} + max(${leftGain}, ${rightGain}) = ${gain} to parent`,
      codeLine: 10,
    } as AlgorithmStep);

    return gain;
  }

  dfs(0);

  steps.push({
    state: { tree: toTreeNodes(arr), maxSum, result: maxSum },
    highlights: [],
    message: `Maximum path sum is ${maxSum}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const maxPathSum: Algorithm = {
  id: 'max-path-sum',
  name: 'Binary Tree Maximum Path Sum',
  category: 'Trees',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — at each node, max gain is node + best child path',
  description:
    'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge connecting them. A node can only appear in the path at most once. The path does not need to pass through the root. Return the maximum path sum of any non-empty path.',
  problemUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
  code: {
    python: `def maxPathSum(root):
    maxSum = float('-inf')

    def dfs(node):
        nonlocal maxSum
        if not node:
            return 0
        leftGain = max(0, dfs(node.left))
        rightGain = max(0, dfs(node.right))
        pathSum = node.val + leftGain + rightGain
        maxSum = max(maxSum, pathSum)
        return node.val + max(leftGain, rightGain)

    dfs(root)
    return maxSum`,
    javascript: `function maxPathSum(root) {
    let maxSum = -Infinity;

    function dfs(node) {
        if (!node) return 0;
        const leftGain = Math.max(0, dfs(node.left));
        const rightGain = Math.max(0, dfs(node.right));
        const pathSum = node.val + leftGain + rightGain;
        maxSum = Math.max(maxSum, pathSum);
        return node.val + Math.max(leftGain, rightGain);
    }

    dfs(root);
    return maxSum;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [1, 2, 3],
  run: runMaxPathSum,
};
