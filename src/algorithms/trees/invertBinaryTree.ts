import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runInvertBinaryTree(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const tree = arr.slice();

  steps.push({
    state: { tree: toTreeNodes(tree) },
    highlights: [],
    message: 'Start inverting the binary tree using DFS (post-order)',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  // We need to swap children at each level from bottom up
  // Collect all valid node indices in post-order
  const postOrder: number[] = [];
  function dfs(i: number): void {
    if (i >= tree.length || tree[i] === null) return;
    dfs(getLeft(i));
    dfs(getRight(i));
    postOrder.push(i);
  }
  dfs(0);

  // Helper to swap entire subtrees in the flat array
  function swapSubtrees(i: number): void {
    const left = getLeft(i);
    const right = getRight(i);
    // We need to swap the children and all their descendants
    // For a flat array, we swap left and right child values, then recurse
    const queue: [number, number][] = [[left, right]];
    while (queue.length > 0) {
      const [l, r] = queue.shift()!;
      if (l < tree.length || r < tree.length) {
        const lVal = l < tree.length ? tree[l] : null;
        const rVal = r < tree.length ? tree[r] : null;
        // Ensure array is large enough
        while (tree.length <= Math.max(l, r)) tree.push(null);
        tree[l] = rVal;
        tree[r] = lVal;
        queue.push([getLeft(l), getLeft(r)]);
        queue.push([getRight(l), getRight(r)]);
      }
    }
  }

  for (const idx of postOrder) {
    const left = getLeft(idx);
    const right = getRight(idx);

    steps.push({
      state: { tree: toTreeNodes(tree) },
      highlights: [],
      treeHighlights: [idx],
      message: `Visit node ${tree[idx]} at index ${idx}`,
      codeLine: 3,
      action: 'visit',
    } as AlgorithmStep);

    const hasLeft = left < tree.length && tree[left] !== null;
    const hasRight = right < tree.length && tree[right] !== null;

    if (hasLeft || hasRight) {
      const leftVal = hasLeft ? tree[left] : 'null';
      const rightVal = hasRight ? tree[right] : 'null';

      steps.push({
        state: { tree: toTreeNodes(tree) },
        highlights: [],
        treeHighlights: [left < tree.length ? left : -1, right < tree.length ? right : -1].filter(x => x >= 0),
        message: `Swap children of node ${tree[idx]}: left=${leftVal}, right=${rightVal}`,
        codeLine: 5,
        action: 'swap',
      } as AlgorithmStep);

      swapSubtrees(idx);

      steps.push({
        state: { tree: toTreeNodes(tree) },
        highlights: [],
        treeHighlights: [idx],
        message: `Swapped children of node ${tree[idx]}`,
        codeLine: 6,
        action: 'swap',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(tree) },
        highlights: [],
        treeHighlights: [idx],
        message: `Node ${tree[idx]} is a leaf, nothing to swap`,
        codeLine: 4,
      } as AlgorithmStep);
    }
  }

  // Trim trailing nulls
  while (tree.length > 0 && tree[tree.length - 1] === null) tree.pop();

  steps.push({
    state: { tree: toTreeNodes(tree), result: tree },
    highlights: [],
    message: `Tree inversion complete! Result: [${tree.join(', ')}]`,
    codeLine: 8,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const invertBinaryTree: Algorithm = {
  id: 'invert-binary-tree',
  name: 'Invert Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS Recursion — swap left and right at each node',
  description:
    'Given the root of a binary tree, invert the tree, and return its root. Inverting means swapping every left child with its right child at every node.',
  problemUrl: 'https://leetcode.com/problems/invert-binary-tree/',
  code: {
    python: `def invertTree(root):
    if not root:
        return None
    # Swap children
    root.left, root.right = root.right, root.left
    # Recurse
    invertTree(root.left)
    invertTree(root.right)
    return root`,
    javascript: `function invertTree(root) {
    if (!root) return null;
    // Swap children
    const temp = root.left;
    root.left = root.right;
    root.right = temp;
    // Recurse
    invertTree(root.left);
    invertTree(root.right);
    return root;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [4, 2, 7, 1, 3, 6, 9],
  run: runInvertBinaryTree,
};
