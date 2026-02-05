import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runRightSideView(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const result: number[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), result: [] },
    highlights: [],
    message: 'Find the right side view using BFS (level order traversal)',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  if (getVal(0) === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), result: [] },
      highlights: [],
      message: 'Tree is empty, return []',
      codeLine: 2,
    });
    return steps;
  }

  let queue: number[] = [0];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelIndices = [...queue];

    steps.push({
      state: { tree: toTreeNodes(arr), queue: queue.map(i => arr[i]), result: [...result] },
      highlights: [],
      treeHighlights: levelIndices,
      message: `Processing level ${result.length}: ${levelSize} node(s)`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    const nextQueue: number[] = [];
    let rightmostVal: number | null = null;

    for (let i = 0; i < levelSize; i++) {
      const nodeIdx = queue[i];
      const val = getVal(nodeIdx);
      if (val === null) continue;

      rightmostVal = val;

      const left = getLeft(nodeIdx);
      const right = getRight(nodeIdx);

      if (getVal(left) !== null) nextQueue.push(left);
      if (getVal(right) !== null) nextQueue.push(right);
    }

    if (rightmostVal !== null) {
      result.push(rightmostVal);
      const lastIdx = levelIndices[levelIndices.length - 1];

      steps.push({
        state: { tree: toTreeNodes(arr), result: [...result] },
        highlights: [],
        treeHighlights: [lastIdx],
        treeSecondary: levelIndices.slice(0, -1),
        message: `Rightmost node at level ${result.length - 1} is ${rightmostVal}. Right side view so far: [${result.join(', ')}]`,
        codeLine: 8,
        action: 'found',
      } as AlgorithmStep);
    }

    queue = nextQueue;
  }

  steps.push({
    state: { tree: toTreeNodes(arr), result },
    highlights: [],
    message: `Right side view complete: [${result.join(', ')}]`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const rightSideView: Algorithm = {
  id: 'right-side-view',
  name: 'Binary Tree Right Side View',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'BFS — take last node at each level',
  description:
    'Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.',
  problemUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/',
  code: {
    python: `def rightSideView(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        rightmost = None
        for _ in range(len(queue)):
            node = queue.popleft()
            rightmost = node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(rightmost)
    return result`,
    javascript: `function rightSideView(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length > 0) {
        let rightmost = null;
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            rightmost = node.val;
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(rightmost);
    }
    return result;
}`,
  },
  defaultInput: [1, 2, 3, null, 5, null, 4],
  run: runRightSideView,
};
