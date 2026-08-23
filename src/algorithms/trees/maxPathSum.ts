import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runMaxPathSum(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  let maxSum = -Infinity;

  steps.push({
    state: { tree: toTreeNodes(arr), maxSum: '-inf' },
    highlights: [],
    message: 'Find the maximum path sum. A path can start and end at any node.',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  // DFS returns the max gain from this node going downward (single path)
  function dfs(i: number): number {
    const val = getVal(i);
    if (val === null) return 0;

    steps.push({
      state: { tree: toTreeNodes(arr), maxSum: maxSum === -Infinity ? '-inf' : maxSum },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${val}: compute max gain`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    // Compute max gain from left and right subtrees
    const leftGain = Math.max(0, dfs(getLeft(i)));
    const rightGain = Math.max(0, dfs(getRight(i)));

    // The path sum through this node (using both children)
    const pathSum = val + leftGain + rightGain;
    const oldMax = maxSum;
    maxSum = Math.max(maxSum, pathSum);

    steps.push({
      state: {
        tree: toTreeNodes(arr),
        maxSum,
        leftGain,
        rightGain,
        pathSum,
        nodeVal: val,
      },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${val}: leftGain=${leftGain}, rightGain=${rightGain}, pathSum=${val}+${leftGain}+${rightGain}=${pathSum}. MaxSum: ${oldMax === -Infinity ? '-inf' : oldMax} -> ${maxSum}`,
      codeLine: 8,
      action: maxSum > oldMax && oldMax !== -Infinity ? 'found' : 'compare',
    } as AlgorithmStep);

    // Return max gain going through this node (can only choose one child)
    const gain = val + Math.max(leftGain, rightGain);

    steps.push({
      state: { tree: toTreeNodes(arr), maxSum, gain },
      highlights: [],
      treeHighlights: [i],
      message: `Node ${val}: return gain = ${val} + max(${leftGain}, ${rightGain}) = ${gain} to parent`,
      codeLine: 10,
    } as AlgorithmStep);

    return gain;
  }

  dfs(0);

  steps.push({
    state: { tree: toTreeNodes(arr), maxSum, result: maxSum },
    highlights: [],
    message: `Maximum path sum is ${maxSum}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runMaxPathSumIterative(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  let maxSum = -Infinity;

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function fmtMax(): number | string {
    return maxSum === -Infinity ? '-inf' : maxSum;
  }

  steps.push({
    state: { tree: toTreeNodes(arr), maxSum: '-inf', stack: [] },
    highlights: [],
    message: 'Iterative version: post-order traversal with an explicit stack — children must be processed BEFORE their parent, so each node is pushed twice (once to expand, once to process)',
    codeLine: 4,
  });

  if (getVal(0) === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), maxSum: '-inf', result: '-inf' },
      highlights: [],
      message: 'Tree is empty — nothing to sum',
      codeLine: 18,
    });
    return steps;
  }

  // Explicit post-order: stack of [index, visited]
  const gain = new Map<number, number>(); // index -> max downward gain
  const stack: [number, boolean][] = [[0, false]];

  function stackView(): string[] {
    return stack.map(([i, v]) => `${arr[i]}${v ? '*' : ''}`);
  }

  steps.push({
    state: { tree: toTreeNodes(arr), maxSum: fmtMax(), stack: stackView() },
    highlights: [],
    treeHighlights: [0],
    message: `Push the root ${arr[0]} unvisited. (* on the stack = children already expanded, ready to process)`,
    codeLine: 4,
    action: 'push',
  } as AlgorithmStep);

  while (stack.length > 0) {
    const [i, visited] = stack.pop()!;
    const val = getVal(i);
    if (val === null) continue;

    if (!visited) {
      stack.push([i, true]);
      const kids: number[] = [];
      if (getVal(getRight(i)) !== null) { stack.push([getRight(i), false]); kids.push(getRight(i)); }
      if (getVal(getLeft(i)) !== null) { stack.push([getLeft(i), false]); kids.push(getLeft(i)); }

      steps.push({
        state: { tree: toTreeNodes(arr), maxSum: fmtMax(), stack: stackView() },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: kids,
        message: kids.length > 0
          ? `First visit of node ${val}: re-push it as "ready" and push its children on top — they must be resolved first`
          : `First visit of leaf ${val}: re-push it as "ready" (no children to wait for)`,
        codeLine: 10,
        action: 'push',
      } as AlgorithmStep);
    } else {
      const leftGain = Math.max(0, gain.get(getLeft(i)) ?? 0);
      const rightGain = Math.max(0, gain.get(getRight(i)) ?? 0);
      const pathSum = val + leftGain + rightGain;
      const oldMax = maxSum;
      maxSum = Math.max(maxSum, pathSum);
      const nodeGain = val + Math.max(leftGain, rightGain);
      gain.set(i, nodeGain);

      steps.push({
        state: {
          tree: toTreeNodes(arr),
          maxSum: fmtMax(),
          stack: stackView(),
          leftGain,
          rightGain,
          pathSum,
          gain: nodeGain,
        },
        highlights: [],
        treeHighlights: [i],
        message: `Process node ${val} (children done): pathSum = ${val}+${leftGain}+${rightGain} = ${pathSum}. MaxSum: ${oldMax === -Infinity ? '-inf' : oldMax} -> ${fmtMax()}. Store gain ${nodeGain} for the parent`,
        codeLine: 16,
        action: maxSum > oldMax ? 'found' : 'compare',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: { tree: toTreeNodes(arr), maxSum, result: maxSum },
    highlights: [],
    message: `Stack empty — every node processed exactly once. Maximum path sum is ${maxSum}`,
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

export const maxPathSum: Algorithm = {
  id: 'max-path-sum',
  name: 'Binary Tree Maximum Path Sum',
  category: 'Trees',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — at each node, max gain is node + best child path',
  description:
    'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge connecting them. A node can only appear in the path at most once. The path does not need to pass through the root. Return the maximum path sum of any non-empty path.',
  problemUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
  code: {
    python: `def maxPathSum(root):
    maxSum = float('-inf')

    def dfs(node):
        nonlocal maxSum
        if not node:
            return 0
        leftGain = max(0, dfs(node.left))
        rightGain = max(0, dfs(node.right))
        pathSum = node.val + leftGain + rightGain
        maxSum = max(maxSum, pathSum)
        return node.val + max(leftGain, rightGain)

    dfs(root)
    return maxSum`,
    javascript: `function maxPathSum(root) {
    let maxSum = -Infinity;

    function dfs(node) {
        if (!node) return 0;
        const leftGain = Math.max(0, dfs(node.left));
        const rightGain = Math.max(0, dfs(node.right));
        const pathSum = node.val + leftGain + rightGain;
        maxSum = Math.max(maxSum, pathSum);
        return node.val + Math.max(leftGain, rightGain);
    }

    dfs(root);
    return maxSum;
}`,
    java: `private static int maxSum;

public static int maxPathSum(TreeNode root) {
    maxSum = Integer.MIN_VALUE;
    dfs(root);
    return maxSum;
}

private static int dfs(TreeNode node) {
    if (node == null) return 0;
    int leftGain = Math.max(0, dfs(node.left));
    int rightGain = Math.max(0, dfs(node.right));
    int pathSum = node.val + leftGain + rightGain;
    maxSum = Math.max(maxSum, pathSum);
    return node.val + Math.max(leftGain, rightGain);
}`,
  },
  defaultInput: [1, 2, 3],
  run: runMaxPathSum,
  optimalApproachName: 'Recursive DFS with Global Max',
  approaches: [
    {
      id: 'iterative-postorder',
      name: 'Iterative Post-order',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Same gain logic, but replaces recursion with an explicit post-order stack and a gain map — each node is pushed twice (expand, then process once its children are resolved), avoiding call-stack overflow on deep trees.',
      code: {
        python: `def maxPathSum(root):
    maxSum = float('-inf')
    gain = {None: 0}
    stack = [(root, False)]
    while stack:
        node, visited = stack.pop()
        if not node:
            continue
        if not visited:
            stack.append((node, True))
            stack.append((node.right, False))
            stack.append((node.left, False))
        else:
            leftGain = max(0, gain[node.left])
            rightGain = max(0, gain[node.right])
            maxSum = max(maxSum, node.val + leftGain + rightGain)
            gain[node] = node.val + max(leftGain, rightGain)
    return maxSum`,
        javascript: `function maxPathSum(root) {
    let maxSum = -Infinity;
    const gain = new Map([[null, 0]]);
    const stack = [[root, false]];
    while (stack.length > 0) {
        const [node, visited] = stack.pop();
        if (!node) continue;
        if (!visited) {
            stack.push([node, true]);
            stack.push([node.right, false]);
            stack.push([node.left, false]);
        } else {
            const leftGain = Math.max(0, gain.get(node.left));
            const rightGain = Math.max(0, gain.get(node.right));
            maxSum = Math.max(maxSum, node.val + leftGain + rightGain);
            gain.set(node, node.val + Math.max(leftGain, rightGain));
        }
    }
    return maxSum;
}`,
        java: `public static int maxPathSum(TreeNode root) {
    int maxSum = Integer.MIN_VALUE;
    Map<TreeNode, Integer> gain = new HashMap<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    Set<TreeNode> expanded = new HashSet<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.peek();
        if (!expanded.contains(node)) {
            expanded.add(node);
            if (node.right != null) stack.push(node.right);
            if (node.left != null) stack.push(node.left);
        } else {
            stack.pop();
            int leftGain = Math.max(0, gain.getOrDefault(node.left, 0));
            int rightGain = Math.max(0, gain.getOrDefault(node.right, 0));
            maxSum = Math.max(maxSum, node.val + leftGain + rightGain);
            gain.put(node, node.val + Math.max(leftGain, rightGain));
        }
    }
    return maxSum;
}`,
      },
      run: runMaxPathSumIterative,
      lineExplanations: {
        python: {
          1: 'Define function taking tree root',
          2: 'Best path sum seen anywhere, starts at -infinity',
          3: 'Gain map: max downward gain per node (null contributes 0)',
          4: 'Stack of (node, visited) — visited=False means children not expanded yet',
          5: 'Keep going until every node is processed',
          6: 'Pop the top entry',
          7: 'Skip null children',
          8: 'Nothing to do for null',
          9: 'First time seeing this node?',
          10: 'Re-push it marked visited — it will be processed after its children',
          11: 'Push right child (popped last)',
          12: 'Push left child (popped first)',
          13: 'Second visit: both children already have gains recorded',
          14: 'Left gain, clamped to 0 (never take a negative branch)',
          15: 'Right gain, clamped to 0',
          16: 'Path through this node may use BOTH children — candidate for the answer',
          17: 'But the gain passed upward can only use ONE child',
          18: 'Return the best path sum found',
        },
        javascript: {
          1: 'Define function taking tree root',
          2: 'Best path sum seen anywhere, starts at -Infinity',
          3: 'Gain map: max downward gain per node (null contributes 0)',
          4: 'Stack of [node, visited] — visited=false means children not expanded yet',
          5: 'Keep going until every node is processed',
          6: 'Pop the top entry',
          7: 'Skip null children',
          8: 'First time seeing this node?',
          9: 'Re-push it marked visited — it will be processed after its children',
          10: 'Push right child (popped last)',
          11: 'Push left child (popped first)',
          12: 'Second visit: both children already have gains recorded',
          13: 'Left gain, clamped to 0 (never take a negative branch)',
          14: 'Right gain, clamped to 0',
          15: 'Path through this node may use BOTH children — candidate for the answer',
          16: 'But the gain passed upward can only use ONE child',
          19: 'Return the best path sum found',
        },
        java: {
          1: 'Define method taking tree root',
          2: 'Best path sum seen anywhere, starts at MIN_VALUE',
          3: 'Gain map: max downward gain per node',
          4: 'Explicit stack replacing the call stack',
          5: 'Tracks nodes whose children are already pushed',
          6: 'Start with the root',
          7: 'Keep going until every node is processed',
          8: 'Peek (do not pop yet) at the top node',
          9: 'First time seeing this node?',
          10: 'Mark it expanded — next time it is processed',
          11: 'Push right child (popped last)',
          12: 'Push left child (popped first)',
          13: 'Second visit: both children already have gains recorded',
          14: 'Now actually remove it from the stack',
          15: 'Left gain, clamped to 0 (never take a negative branch)',
          16: 'Right gain, clamped to 0',
          17: 'Path through this node may use BOTH children — candidate for the answer',
          18: 'But the gain passed upward can only use ONE child',
          21: 'Return the best path sum found',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking tree root',
      2: 'Init max sum to negative infinity',
      4: 'Define DFS helper returning max single path',
      5: 'Allow modification of outer maxSum variable',
      6: 'Base case: null node contributes 0',
      7: 'Return 0 for null node',
      8: 'Get max gain from left (clamp to 0)',
      9: 'Get max gain from right (clamp to 0)',
      10: 'Compute path sum through this node',
      11: 'Update global max if this path is better',
      12: 'Return gain with best single child to parent',
      14: 'Start DFS from root',
      15: 'Return the maximum path sum found',
    },
    javascript: {
      1: 'Define function taking tree root',
      2: 'Init max sum to negative infinity',
      4: 'Define DFS helper returning max single path',
      5: 'Base case: null node contributes 0',
      6: 'Get max gain from left (clamp to 0)',
      7: 'Get max gain from right (clamp to 0)',
      8: 'Compute path sum through this node',
      9: 'Update global max if this path is better',
      10: 'Return gain with best single child to parent',
      13: 'Start DFS from root',
      14: 'Return the maximum path sum found',
    },
    java: {
      1: 'Declare max sum as class field',
      3: 'Define main function taking tree root',
      4: 'Init max sum to minimum integer value',
      5: 'Start DFS from root',
      6: 'Return the maximum path sum found',
      9: 'Define DFS helper returning max single path',
      10: 'Base case: null node contributes 0',
      11: 'Get max gain from left (clamp to 0)',
      12: 'Get max gain from right (clamp to 0)',
      13: 'Compute path sum through this node',
      14: 'Update global max if this path is better',
      15: 'Return gain with best single child to parent',
    },
  },
};
