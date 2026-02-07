import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runLevelOrderTraversal(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), queue: [0], result: [] },
    highlights: [],
    message: 'Start BFS level-order traversal with root in queue',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  // BFS
  let queue: number[] = [0];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: number[] = [];
    const levelIndices = [...queue];

    steps.push({
      state: { tree: toTreeNodes(arr), queue: queue.map(i => arr[i]), result: [...result] },
      highlights: [],
      treeHighlights: levelIndices,
      message: `Processing level ${result.length} with ${levelSize} node(s): [${levelIndices.map(i => arr[i]).join(', ')}]`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    const nextQueue: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const nodeIdx = queue[i];
      const val = getVal(nodeIdx);

      if (val === null) continue;

      level.push(val);

      steps.push({
        state: { tree: toTreeNodes(arr), queue: queue.map(idx => arr[idx]), result: [...result], currentLevel: [...level] },
        highlights: [],
        treeHighlights: [nodeIdx],
        treeSecondary: levelIndices.filter(x => x !== nodeIdx),
        message: `Dequeue node ${val}, add to current level`,
        codeLine: 6,
        action: 'pop',
      } as AlgorithmStep);

      const left = getLeft(nodeIdx);
      const right = getRight(nodeIdx);

      if (getVal(left) !== null) {
        nextQueue.push(left);
        steps.push({
          state: { tree: toTreeNodes(arr), queue: nextQueue.map(idx => arr[idx]), result: [...result], currentLevel: [...level] },
          highlights: [],
          treeHighlights: [left],
          treePointers: { parent: nodeIdx },
          message: `Enqueue left child ${arr[left]} of node ${val}`,
          codeLine: 8,
          action: 'push',
        } as AlgorithmStep);
      }

      if (getVal(right) !== null) {
        nextQueue.push(right);
        steps.push({
          state: { tree: toTreeNodes(arr), queue: nextQueue.map(idx => arr[idx]), result: [...result], currentLevel: [...level] },
          highlights: [],
          treeHighlights: [right],
          treePointers: { parent: nodeIdx },
          message: `Enqueue right child ${arr[right]} of node ${val}`,
          codeLine: 9,
          action: 'push',
        } as AlgorithmStep);
      }
    }

    result.push(level);

    steps.push({
      state: { tree: toTreeNodes(arr), queue: nextQueue.map(idx => arr[idx]), result: [...result] },
      highlights: [],
      treeHighlights: levelIndices,
      message: `Level ${result.length - 1} complete: [${level.join(', ')}]`,
      codeLine: 11,
      action: 'found',
    } as AlgorithmStep);

    queue = nextQueue;
  }

  steps.push({
    state: { tree: toTreeNodes(arr), result },
    highlights: [],
    message: `Level order traversal complete: [${result.map(l => `[${l.join(', ')}]`).join(', ')}]`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

export const levelOrderTraversal: Algorithm = {
  id: 'level-order-traversal',
  name: 'Binary Tree Level Order Traversal',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'BFS — process level by level using queue',
  description:
    'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
  problemUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
  code: {
    python: `def levelOrder(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
    javascript: `function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length > 0) {
        const level = [];
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}`,
    java: `public static List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}`,
  },
  defaultInput: [3, 9, 20, null, null, 15, 7],
  run: runLevelOrderTraversal,
};
