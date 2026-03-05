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
    java: `public static List<Integer> rightSideView(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int rightmost = 0;
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            rightmost = node.val;
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(rightmost);
    }
    return result;
}`,
  },
  defaultInput: [1, 2, 3, null, 5, null, 4],
  run: runRightSideView,
  lineExplanations: {
    python: {
      1: 'Define function taking tree root',
      2: 'Base case: empty tree returns empty list',
      3: 'Return empty list for null root',
      4: 'Init result list for right side values',
      5: 'Init queue with root node',
      6: 'Process levels while queue has nodes',
      7: 'Track rightmost node at each level',
      8: 'Iterate over all nodes in current level',
      9: 'Dequeue front node from queue',
      10: 'Update rightmost to current node value',
      11: 'If left child exists, enqueue it',
      12: 'Add left child to queue',
      13: 'If right child exists, enqueue it',
      14: 'Add right child to queue',
      15: 'Append rightmost value to result',
      16: 'Return right side view values',
    },
    javascript: {
      1: 'Define function taking tree root',
      2: 'Base case: empty tree returns empty array',
      3: 'Init result array for right side values',
      4: 'Init queue with root node',
      5: 'Process levels while queue has nodes',
      6: 'Track rightmost node at each level',
      7: 'Save level size before queue changes',
      8: 'Iterate over all nodes in current level',
      9: 'Dequeue front node from queue',
      10: 'Update rightmost to current node value',
      11: 'Enqueue left and right children if exist',
      12: 'Enqueue right child if it exists',
      14: 'Append rightmost value to result',
      16: 'Return right side view values',
    },
    java: {
      1: 'Define function returning right side values',
      2: 'Init result list for right side values',
      3: 'Base case: empty tree returns empty list',
      4: 'Init queue using LinkedList',
      5: 'Add root to queue',
      6: 'Process levels while queue has nodes',
      7: 'Track rightmost value at each level',
      8: 'Save level size before queue changes',
      9: 'Iterate over all nodes in current level',
      10: 'Dequeue front node from queue',
      11: 'Update rightmost to current node value',
      12: 'Enqueue left child if it exists',
      13: 'Enqueue right child if it exists',
      15: 'Append rightmost value to result',
      17: 'Return right side view values',
    },
  },
};
