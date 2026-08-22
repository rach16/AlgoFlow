import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runCountGoodNodes(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  let goodCount = 0;
  const goodNodes: number[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), goodCount: 0, goodNodes: [] },
    highlights: [],
    message: 'Count good nodes: a node is "good" if no node on the path from root has a greater value',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function dfs(i: number, maxSoFar: number): void {
    const val = getVal(i);
    if (val === null) return;

    steps.push({
      state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar },
      highlights: [],
      treeHighlights: [i],
      treeSecondary: [...goodNodes],
      message: `Visit node ${val}, max value on path so far = ${maxSoFar}`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    if (val >= maxSoFar) {
      goodCount++;
      goodNodes.push(i);

      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: goodNodes.filter(x => x !== i),
        message: `Node ${val} >= ${maxSoFar}: it's a GOOD node! Total good: ${goodCount}`,
        codeLine: 6,
        action: 'found',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar },
        highlights: [],
        treeHighlights: [i],
        message: `Node ${val} < ${maxSoFar}: NOT a good node`,
        codeLine: 7,
        action: 'compare',
      } as AlgorithmStep);
    }

    const newMax = Math.max(maxSoFar, val);
    dfs(getLeft(i), newMax);
    dfs(getRight(i), newMax);
  }

  if (getVal(0) !== null) {
    dfs(0, arr[0]! as number);
  }

  steps.push({
    state: { tree: toTreeNodes(arr), goodCount, goodNodes, result: goodCount },
    highlights: [],
    treeHighlights: goodNodes,
    message: `Total good nodes: ${goodCount}`,
    codeLine: 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runCountGoodNodesBFS(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  let goodCount = 0;
  const goodNodes: number[] = [];

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  steps.push({
    state: { tree: toTreeNodes(arr), goodCount: 0, goodNodes: [], queue: [] },
    highlights: [],
    message: 'BFS version: instead of recursion, carry each node\'s path-maximum through the queue as (node, maxSoFar) pairs',
    codeLine: 1,
  });

  if (getVal(0) === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), goodCount: 0, result: 0 },
      highlights: [],
      message: 'Empty tree — 0 good nodes',
      codeLine: 3,
    });
    return steps;
  }

  const queue: [number, number][] = [[0, arr[0] as number]];

  steps.push({
    state: { tree: toTreeNodes(arr), goodCount: 0, goodNodes: [], queue: queue.map(([i]) => arr[i]) },
    highlights: [],
    treeHighlights: [0],
    message: `Seed the queue with (root=${arr[0]}, maxSoFar=${arr[0]}) — the root is always good since nothing sits above it`,
    codeLine: 5,
    action: 'push',
  } as AlgorithmStep);

  while (queue.length > 0) {
    const [i, maxSoFar] = queue.shift()!;
    const val = getVal(i)!;

    steps.push({
      state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar, queue: queue.map(([j]) => arr[j]) },
      highlights: [],
      treeHighlights: [i],
      treeSecondary: [...goodNodes],
      message: `Dequeue node ${val} along with the max on its root path so far: ${maxSoFar}`,
      codeLine: 7,
      action: 'pop',
    } as AlgorithmStep);

    if (val >= maxSoFar) {
      goodCount++;
      goodNodes.push(i);

      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar, queue: queue.map(([j]) => arr[j]) },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: goodNodes.filter(x => x !== i),
        message: `Node ${val} >= ${maxSoFar}: it's a GOOD node! Total good: ${goodCount}`,
        codeLine: 9,
        action: 'found',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar, queue: queue.map(([j]) => arr[j]) },
        highlights: [],
        treeHighlights: [i],
        message: `Node ${val} < ${maxSoFar}: NOT good — a bigger value sits on its path from the root`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);
    }

    const newMax = Math.max(maxSoFar, val);
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (getVal(left) !== null) {
      queue.push([left, newMax]);
      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], queue: queue.map(([j]) => arr[j]) },
        highlights: [],
        treeHighlights: [left],
        treeSecondary: [...goodNodes],
        message: `Enqueue left child ${arr[left]} with its path max ${newMax}`,
        codeLine: 12,
        action: 'push',
      } as AlgorithmStep);
    }

    if (getVal(right) !== null) {
      queue.push([right, newMax]);
      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], queue: queue.map(([j]) => arr[j]) },
        highlights: [],
        treeHighlights: [right],
        treeSecondary: [...goodNodes],
        message: `Enqueue right child ${arr[right]} with its path max ${newMax}`,
        codeLine: 14,
        action: 'push',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: { tree: toTreeNodes(arr), goodCount, goodNodes, result: goodCount },
    highlights: [],
    treeHighlights: goodNodes,
    message: `Queue empty — every node was compared against its own path max. Total good nodes: ${goodCount}`,
    codeLine: 15,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const countGoodNodes: Algorithm = {
  id: 'count-good-nodes',
  name: 'Count Good Nodes in Binary Tree',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — pass max value seen on path from root',
  description:
    'Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X. Return the number of good nodes in the binary tree.',
  problemUrl: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/',
  code: {
    python: `def goodNodes(root):
    def dfs(node, maxVal):
        if not node:
            return 0
        count = 1 if node.val >= maxVal else 0
        maxVal = max(maxVal, node.val)
        count += dfs(node.left, maxVal)
        count += dfs(node.right, maxVal)
        return count

    return dfs(root, root.val)`,
    javascript: `function goodNodes(root) {
    function dfs(node, maxVal) {
        if (!node) return 0;
        let count = node.val >= maxVal ? 1 : 0;
        maxVal = Math.max(maxVal, node.val);
        count += dfs(node.left, maxVal);
        count += dfs(node.right, maxVal);
        return count;
    }

    return dfs(root, root.val);
}`,
    java: `public static int goodNodes(TreeNode root) {
    return dfs(root, root.val);
}

private static int dfs(TreeNode node, int maxVal) {
    if (node == null) return 0;
    int count = node.val >= maxVal ? 1 : 0;
    maxVal = Math.max(maxVal, node.val);
    count += dfs(node.left, maxVal);
    count += dfs(node.right, maxVal);
    return count;
}`,
  },
  defaultInput: [3, 1, 4, 3, null, 1, 5],
  run: runCountGoodNodes,
  optimalApproachName: 'Recursive DFS',
  approaches: [
    {
      id: 'iterative-bfs',
      name: 'Iterative BFS',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Same counting logic, but level by level with an explicit queue that carries each node\'s path-maximum — no recursion, at the cost of O(n) queue space instead of O(h) stack space.',
      code: {
        python: `from collections import deque

def goodNodes(root):
    if not root:
        return 0
    count = 0
    queue = deque([(root, root.val)])
    while queue:
        node, maxVal = queue.popleft()
        if node.val >= maxVal:
            count += 1
        newMax = max(maxVal, node.val)
        if node.left:
            queue.append((node.left, newMax))
        if node.right:
            queue.append((node.right, newMax))
    return count`,
        javascript: `function goodNodes(root) {
    if (!root) return 0;
    let count = 0;
    const queue = [[root, root.val]];
    while (queue.length > 0) {
        const [node, maxVal] = queue.shift();
        if (node.val >= maxVal) count++;
        const newMax = Math.max(maxVal, node.val);
        if (node.left) queue.push([node.left, newMax]);
        if (node.right) queue.push([node.right, newMax]);
    }
    return count;
}`,
        java: `public static int goodNodes(TreeNode root) {
    if (root == null) return 0;
    int count = 0;
    Queue<TreeNode> queue = new LinkedList<>();
    Queue<Integer> maxes = new LinkedList<>();
    queue.offer(root);
    maxes.offer(root.val);
    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        int maxVal = maxes.poll();
        if (node.val >= maxVal) count++;
        int newMax = Math.max(maxVal, node.val);
        if (node.left != null) { queue.offer(node.left); maxes.offer(newMax); }
        if (node.right != null) { queue.offer(node.right); maxes.offer(newMax); }
    }
    return count;
}`,
      },
      run: runCountGoodNodesBFS,
      lineExplanations: {
        python: {
          1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Define function taking tree root',
          4: 'Base case: empty tree',
          5: 'Return 0 good nodes for null root',
          6: 'Init counter of good nodes',
          7: 'Queue holds (node, max value on its root path) pairs',
          8: 'Process until queue is empty',
          9: 'Dequeue a node with the max seen on its path',
          10: 'Node is good if nothing bigger sits above it',
          11: 'Count this good node',
          12: 'Children inherit the updated path max',
          13: 'If left child exists...',
          14: 'Enqueue left child with the new max',
          15: 'If right child exists...',
          16: 'Enqueue right child with the new max',
          17: 'Return total good nodes',
        },
        javascript: {
          1: 'Define function taking tree root',
          2: 'Base case: empty tree returns 0',
          3: 'Init counter of good nodes',
          4: 'Queue holds [node, max value on its root path] pairs',
          5: 'Process until queue is empty',
          6: 'Dequeue a node with the max seen on its path',
          7: 'Node is good if nothing bigger sits above it',
          8: 'Children inherit the updated path max',
          9: 'Enqueue left child with the new max',
          10: 'Enqueue right child with the new max',
          12: 'Return total good nodes',
        },
        java: {
          1: 'Define function taking tree root',
          2: 'Base case: empty tree returns 0',
          3: 'Init counter of good nodes',
          4: 'Queue of nodes to process',
          5: 'Parallel queue of each node\'s path max',
          6: 'Seed with the root node',
          7: 'Root\'s path max is its own value',
          8: 'Process until queue is empty',
          9: 'Dequeue the next node',
          10: 'Dequeue its matching path max',
          11: 'Node is good if nothing bigger sits above it',
          12: 'Children inherit the updated path max',
          13: 'Enqueue left child with the new max',
          14: 'Enqueue right child with the new max',
          16: 'Return total good nodes',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking tree root',
      2: 'Define DFS helper with node and max so far',
      3: 'Base case: null node returns 0',
      4: 'Return 0 for null node',
      5: 'Count 1 if node value >= max on path',
      6: 'Update max value seen on path',
      7: 'Add good nodes from left subtree',
      8: 'Add good nodes from right subtree',
      9: 'Return total count for this subtree',
      11: 'Start DFS from root with root value as max',
    },
    javascript: {
      1: 'Define function taking tree root',
      2: 'Define DFS helper with node and max so far',
      3: 'Base case: null node returns 0',
      4: 'Count 1 if node value >= max on path',
      5: 'Update max value seen on path',
      6: 'Add good nodes from left subtree',
      7: 'Add good nodes from right subtree',
      8: 'Return total count for this subtree',
      11: 'Start DFS from root with root value as max',
    },
    java: {
      1: 'Define function taking tree root',
      2: 'Start DFS from root with root value as max',
      5: 'Define DFS helper with node and max so far',
      6: 'Base case: null node returns 0',
      7: 'Count 1 if node value >= max on path',
      8: 'Update max value seen on path',
      9: 'Add good nodes from left subtree',
      10: 'Add good nodes from right subtree',
      11: 'Return total count for this subtree',
    },
  },
};
