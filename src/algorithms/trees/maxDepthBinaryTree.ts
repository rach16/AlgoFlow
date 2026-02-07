import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runMaxDepthBinaryTree(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr) },
    highlights: [],
    message: 'Find the maximum depth of the binary tree using DFS',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function dfs(i: number, depth: number): number {
    if (i >= arr.length || arr[i] === null) {
      steps.push({
        state: { tree: toTreeNodes(arr), currentDepth: depth },
        highlights: [],
        treeHighlights: [],
        message: `Reached null node at index ${i}, return depth 0`,
        codeLine: 3,
      } as AlgorithmStep);
      return 0;
    }

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${arr[i]} at depth ${depth}`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    const leftDepth = dfs(getLeft(i), depth + 1);

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth, leftDepth },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: left subtree depth = ${leftDepth}`,
      codeLine: 5,
    } as AlgorithmStep);

    const rightDepth = dfs(getRight(i), depth + 1);

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth, leftDepth, rightDepth },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: right subtree depth = ${rightDepth}`,
      codeLine: 6,
    } as AlgorithmStep);

    const maxD = 1 + Math.max(leftDepth, rightDepth);

    steps.push({
      state: { tree: toTreeNodes(arr), currentDepth: depth, result: maxD },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: max depth = 1 + max(${leftDepth}, ${rightDepth}) = ${maxD}`,
      codeLine: 7,
      action: 'found',
    } as AlgorithmStep);

    return maxD;
  }

  const result = dfs(0, 1);

  steps.push({
    state: { tree: toTreeNodes(arr), result },
    highlights: [],
    message: `Maximum depth of the binary tree is ${result}`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const maxDepthBinaryTree: Algorithm = {
  id: 'max-depth-binary-tree',
  name: 'Maximum Depth of Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS Recursion — 1 + max(left depth, right depth)',
  description:
    'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
  problemUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
  code: {
    python: `def maxDepth(root):
    if not root:
        return 0
    # Visit current node
    left = maxDepth(root.left)
    right = maxDepth(root.right)
    return 1 + max(left, right)
    # Final result`,
    javascript: `function maxDepth(root) {
    if (!root) return 0;
    // Visit current node
    const left = maxDepth(root.left);
    const right = maxDepth(root.right);
    return 1 + Math.max(left, right);
    // Final result
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [3, 9, 20, null, null, 15, 7],
  run: runMaxDepthBinaryTree,
};
