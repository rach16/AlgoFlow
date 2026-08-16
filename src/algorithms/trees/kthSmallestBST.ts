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

function runKthSmallestRecursive(input: unknown): AlgorithmStep[] {
  const { root, k } = input as KthSmallestInput;
  const steps: AlgorithmStep[] = [];
  const values: number[] = [];
  const visitedIdx: number[] = [];

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }
  function getVal(i: number): number | null {
    return i < root.length ? root[i] : null;
  }

  steps.push({
    state: { tree: toTreeNodes(root), k, count: 0, inorder: [] },
    highlights: [],
    message: `Recursive inorder: traverse the WHOLE tree left → node → right. In a BST that visits values in sorted order, so the answer is simply values[k-1]`,
    codeLine: 1,
  });

  function inorder(i: number): void {
    if (getVal(i) === null) return;

    const left = getLeft(i);
    if (getVal(left) !== null) {
      steps.push({
        state: { tree: toTreeNodes(root), k, count: values.length, inorder: [...values] },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: [...visitedIdx],
        message: `At node ${getVal(i)}: recurse into the LEFT subtree first — everything there is smaller`,
        codeLine: 7,
        action: 'visit',
      } as AlgorithmStep);
    }
    inorder(left);

    const val = getVal(i)!;
    values.push(val);
    visitedIdx.push(i);

    steps.push({
      state: { tree: toTreeNodes(root), k, count: values.length, inorder: [...values] },
      highlights: [],
      treeHighlights: [i],
      treeSecondary: visitedIdx.filter(x => x !== i),
      message: `Left side done — visit node ${val}. Collected so far (sorted!): [${values.join(', ')}]`,
      codeLine: 8,
      action: 'insert',
    } as AlgorithmStep);

    const right = getRight(i);
    if (getVal(right) !== null) {
      steps.push({
        state: { tree: toTreeNodes(root), k, count: values.length, inorder: [...values] },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: [...visitedIdx],
        message: `Now recurse into the RIGHT subtree of ${val} — everything there is larger`,
        codeLine: 9,
        action: 'visit',
      } as AlgorithmStep);
    }
    inorder(right);
  }

  inorder(0);

  if (k >= 1 && k <= values.length) {
    const answer = values[k - 1];
    const answerIdx = visitedIdx[k - 1];

    steps.push({
      state: { tree: toTreeNodes(root), k, count: values.length, inorder: [...values], result: answer },
      highlights: [],
      treeHighlights: [answerIdx],
      treeSecondary: visitedIdx.filter(x => x !== answerIdx),
      message: `Traversal complete: [${values.join(', ')}]. The ${k}th smallest is values[${k - 1}] = ${answer}. Unlike the stack version, we visited ALL ${values.length} nodes — no early exit.`,
      codeLine: 12,
      action: 'found',
    } as AlgorithmStep);
  } else {
    steps.push({
      state: { tree: toTreeNodes(root), k, inorder: [...values], result: null },
      highlights: [],
      message: `k=${k} exceeds the number of nodes (${values.length}) in the tree`,
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
    java: `public static int kthSmallest(TreeNode root, int k) {
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode curr = root;
    int n = 0;
    while (curr != null || !stack.isEmpty()) {
        while (curr != null) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop();
        n++;
        if (n == k) return curr.val;
        curr = curr.right;
    }
    return -1;
}`,
  },
  defaultInput: { root: [3, 1, 4, null, 2], k: 1 },
  run: runKthSmallestBST,
  optimalApproachName: 'Iterative Inorder (Stack)',
  approaches: [
    {
      id: 'recursive-inorder',
      name: 'Recursive Inorder',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Recursively collect the full inorder traversal into a list (sorted, since it\'s a BST) and index k-1 — simpler to write, but no early exit at the kth node like the stack version.',
      code: {
        python: `def kthSmallest(root, k):
    values = []

    def inorder(node):
        if not node:
            return
        inorder(node.left)
        values.append(node.val)
        inorder(node.right)

    inorder(root)
    return values[k - 1]`,
        javascript: `function kthSmallest(root, k) {
    const values = [];

    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        values.push(node.val);
        inorder(node.right);
    }

    inorder(root);
    return values[k - 1];
}`,
        java: `public static int kthSmallest(TreeNode root, int k) {
    List<Integer> values = new ArrayList<>();
    inorder(root, values);
    return values.get(k - 1);
}

private static void inorder(TreeNode node, List<Integer> values) {
    if (node == null) return;
    inorder(node.left, values);
    values.add(node.val);
    inorder(node.right, values);
}`,
      },
      run: runKthSmallestRecursive,
      lineExplanations: {
        python: {
          1: 'Define function taking BST root and k',
          2: 'List to collect values in sorted order',
          4: 'Recursive inorder traversal helper',
          5: 'Base case: null node',
          6: 'Nothing to do for null node',
          7: 'Visit the left subtree first (smaller values)',
          8: 'Visit this node — appended values come out sorted',
          9: 'Visit the right subtree last (larger values)',
          11: 'Traverse the entire tree from the root',
          12: 'BST inorder is sorted, so kth smallest is at index k-1',
        },
        javascript: {
          1: 'Define function taking BST root and k',
          2: 'Array to collect values in sorted order',
          4: 'Recursive inorder traversal helper',
          5: 'Base case: null node — nothing to do',
          6: 'Visit the left subtree first (smaller values)',
          7: 'Visit this node — pushed values come out sorted',
          8: 'Visit the right subtree last (larger values)',
          11: 'Traverse the entire tree from the root',
          12: 'BST inorder is sorted, so kth smallest is at index k-1',
        },
        java: {
          1: 'Define function taking BST root and k',
          2: 'List to collect values in sorted order',
          3: 'Traverse the entire tree from the root',
          4: 'BST inorder is sorted, so kth smallest is at index k-1',
          7: 'Recursive inorder traversal helper',
          8: 'Base case: null node — nothing to do',
          9: 'Visit the left subtree first (smaller values)',
          10: 'Visit this node — added values come out sorted',
          11: 'Visit the right subtree last (larger values)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking BST root and k',
      2: 'Init empty stack for iterative traversal',
      3: 'Start current pointer at root',
      4: 'Init counter for inorder position',
      5: 'Loop while nodes remain to process',
      6: 'Traverse left as far as possible',
      7: 'Push current node onto stack',
      8: 'Move to left child',
      9: 'Pop top node from stack (next inorder)',
      10: 'Increment inorder count',
      11: 'Check if count equals k',
      12: 'Found kth smallest, return its value',
      13: 'Move to right subtree',
    },
    javascript: {
      1: 'Define function taking BST root and k',
      2: 'Init empty stack for iterative traversal',
      3: 'Start current pointer at root',
      4: 'Init counter for inorder position',
      5: 'Loop while nodes remain to process',
      6: 'Traverse left as far as possible',
      7: 'Push current node onto stack',
      8: 'Move to left child',
      10: 'Pop top node from stack (next inorder)',
      11: 'Increment inorder count',
      12: 'If count equals k, return value',
      13: 'Move to right subtree',
    },
    java: {
      1: 'Define function taking BST root and k',
      2: 'Init stack using ArrayDeque',
      3: 'Start current pointer at root',
      4: 'Init counter for inorder position',
      5: 'Loop while nodes remain to process',
      6: 'Traverse left as far as possible',
      7: 'Push current node onto stack',
      8: 'Move to left child',
      10: 'Pop top node from stack (next inorder)',
      11: 'Increment inorder count',
      12: 'If count equals k, return value',
      13: 'Move to right subtree',
      15: 'Return -1 if k exceeds node count',
    },
  },
};
