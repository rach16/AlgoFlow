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
    java: `private static int diameter;

public static int diameterOfBinaryTree(TreeNode root) {
    diameter = 0;
    dfs(root);
    return diameter;
}

private static int dfs(TreeNode node) {
    if (node == null) return 0;
    int left = dfs(node.left);
    int right = dfs(node.right);
    diameter = Math.max(diameter, left + right);
    return 1 + Math.max(left, right);
}`,
  },
  defaultInput: [1, 2, 3, 4, 5],
  run: runDiameterBinaryTree,
  lineExplanations: {
    python: {
      1: 'Define function taking tree root node',
      2: 'Track maximum diameter found so far',
      4: 'Define DFS helper to compute heights',
      5: 'Allow inner function to update outer diameter',
      6: 'Base case: null node has height 0',
      7: 'Return 0 for null node',
      8: 'Recursively get left subtree height',
      9: 'Recursively get right subtree height',
      10: 'Update diameter if path through node is longer',
      11: 'Return height: 1 plus taller subtree',
      13: 'Start DFS from root node',
      14: 'Return the maximum diameter found',
    },
    javascript: {
      1: 'Define function taking tree root node',
      2: 'Track maximum diameter found so far',
      4: 'Define DFS helper to compute heights',
      5: 'Base case: null node returns height 0',
      6: 'Recursively get left subtree height',
      7: 'Recursively get right subtree height',
      8: 'Update diameter if path through node is longer',
      9: 'Return height: 1 plus taller subtree',
      12: 'Start DFS from root node',
      13: 'Return the maximum diameter found',
    },
    java: {
      1: 'Class-level variable to track max diameter',
      3: 'Define method taking tree root node',
      4: 'Reset diameter to 0',
      5: 'Start DFS from root node',
      6: 'Return the maximum diameter found',
      9: 'DFS helper returns subtree height',
      10: 'Base case: null node returns height 0',
      11: 'Recursively get left subtree height',
      12: 'Recursively get right subtree height',
      13: 'Update diameter if path through node is longer',
      14: 'Return height: 1 plus taller subtree',
    },
  },
};
