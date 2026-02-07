import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface KthSmallestInput {
  root: (number | null)[];
  k: number;
}

function runKthSmallestBST(input: unknown): AlgorithmStep[] {
  const { root, k } = input as KthSmallestInput;
  const steps: AlgorithmStep[] = [];
  let count = 0;
  let result: number | null = null;
  const inorderVisited: number[] = [];

  steps.push({
    state: { tree: toTreeNodes(root), k, count: 0, stack: [] },
    highlights: [],
    message: `Find the ${k}th smallest element using iterative inorder traversal`,
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= root.length) return null;
    return root[i];
  }

  // Iterative inorder traversal using a stack
  const stack: number[] = [];
  let current: number | null = 0;

  while ((current !== null && getVal(current) !== null) || stack.length > 0) {
    // Go left as far as possible
    while (current !== null && current < root.length && getVal(current) !== null) {
      stack.push(current);

      steps.push({
        state: { tree: toTreeNodes(root), k, count, stack: stack.map(i => root[i]), inorder: [...inorderVisited] },
        highlights: [],
        treeHighlights: [current],
        message: `Push node ${root[current]} onto stack, go left`,
        codeLine: 4,
        action: 'push',
      } as AlgorithmStep);

      current = getLeft(current);
      if (current >= root.length || getVal(current) === null) {
        current = null;
      }
    }

    // Pop from stack
    if (stack.length === 0) break;
    const nodeIdx = stack.pop()!;
    const val = getVal(nodeIdx)!;
    count++;
    inorderVisited.push(nodeIdx);

    steps.push({
      state: { tree: toTreeNodes(root), k, count, stack: stack.map(i => root[i]), inorder: [...inorderVisited] },
      highlights: [],
      treeHighlights: [nodeIdx],
      treeSecondary: inorderVisited.filter(x => x !== nodeIdx),
      message: `Pop node ${val} from stack. Inorder count = ${count}`,
      codeLine: 7,
      action: 'pop',
    } as AlgorithmStep);

    if (count === k) {
      result = val;

      steps.push({
        state: { tree: toTreeNodes(root), k, count, result: val },
        highlights: [],
        treeHighlights: [nodeIdx],
        message: `Count = ${k} = k! The ${k}th smallest element is ${val}`,
        codeLine: 9,
        action: 'found',
      } as AlgorithmStep);

      break;
    }

    // Go right
    const rightIdx = getRight(nodeIdx);
    if (rightIdx < root.length && getVal(rightIdx) !== null) {
      current = rightIdx;

      steps.push({
        state: { tree: toTreeNodes(root), k, count, stack: stack.map(i => root[i]) },
        highlights: [],
        treeHighlights: [rightIdx],
        message: `Move to right child ${root[rightIdx]}`,
        codeLine: 11,
        action: 'visit',
      } as AlgorithmStep);
    } else {
      current = null;
    }
  }

  if (result === null) {
    steps.push({
      state: { tree: toTreeNodes(root), k, result: null },
      highlights: [],
      message: `k=${k} exceeds the number of nodes in the tree`,
      codeLine: 12,
    });
  }

  return steps;
}

export const kthSmallestBST: Algorithm = {
  id: 'kth-smallest-bst',
  name: 'Kth Smallest Element in a BST',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(h+k)',
  spaceComplexity: 'O(h)',
  pattern: 'Inorder Traversal — BST inorder gives sorted order',
  description:
    'Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.',
  problemUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
  code: {
    python: `def kthSmallest(root, k):
    stack = []
    curr = root
    n = 0
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        n += 1
        if n == k:
            return curr.val
        curr = curr.right`,
    javascript: `function kthSmallest(root, k) {
    const stack = [];
    let curr = root;
    let n = 0;
    while (curr || stack.length > 0) {
        while (curr) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop();
        n++;
        if (n === k) return curr.val;
        curr = curr.right;
    }
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: { root: [3, 1, 4, null, 2], k: 1 },
  run: runKthSmallestBST,
};
