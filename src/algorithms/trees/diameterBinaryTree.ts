import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runDiameterBinaryTree(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  let diameter = 0;

  steps.push({
    state: { tree: toTreeNodes(arr), diameter: 0 },
    highlights: [],
    message: 'Find the diameter (longest path between any two nodes) using DFS',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function dfs(i: number): number {
    if (i >= arr.length || arr[i] === null) {
      return 0;
    }

    steps.push({
      state: { tree: toTreeNodes(arr), diameter },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${arr[i]}: computing height`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    const leftHeight = dfs(getLeft(i));
    const rightHeight = dfs(getRight(i));

    // The diameter through this node is leftHeight + rightHeight
    const pathThroughNode = leftHeight + rightHeight;
    const oldDiameter = diameter;
    diameter = Math.max(diameter, pathThroughNode);

    steps.push({
      state: { tree: toTreeNodes(arr), diameter, leftHeight, rightHeight, pathThroughNode },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${arr[i]}: left height=${leftHeight}, right height=${rightHeight}, path through node=${pathThroughNode}. Diameter: ${oldDiameter} -> ${diameter}`,
      codeLine: 8,
      action: diameter > oldDiameter ? 'found' : 'compare',
    } as AlgorithmStep);

    return 1 + Math.max(leftHeight, rightHeight);
  }

  dfs(0);

  steps.push({
    state: { tree: toTreeNodes(arr), diameter, result: diameter },
    highlights: [],
    message: `Diameter of the binary tree is ${diameter}`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const diameterBinaryTree: Algorithm = {
  id: 'diameter-binary-tree',
  name: 'Diameter of Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — track max left + right depth at each node',
  description:
    'Given the root of a binary tree, return the length of the diameter of the tree. The diameter is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.',
  problemUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/',
  code: {
    python: `def diameterOfBinaryTree(root):
    diameter = 0

    def dfs(node):
        nonlocal diameter
        if not node:
            return 0
        left = dfs(node.left)
        right = dfs(node.right)
        diameter = max(diameter, left + right)
        return 1 + max(left, right)

    dfs(root)
    return diameter`,
    javascript: `function diameterOfBinaryTree(root) {
    let diameter = 0;

    function dfs(node) {
        if (!node) return 0;
        const left = dfs(node.left);
        const right = dfs(node.right);
        diameter = Math.max(diameter, left + right);
        return 1 + Math.max(left, right);
    }

    dfs(root);
    return diameter;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [1, 2, 3, 4, 5],
  run: runDiameterBinaryTree,
};
