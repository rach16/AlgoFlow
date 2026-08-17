import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runHouseRobberIII(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  const getLeft = (i: number): number => 2 * i + 1;
  const getRight = (i: number): number => 2 * i + 2;
  const getVal = (i: number): number | null => (i < arr.length ? arr[i] : null);
  const label = (i: number): string => `house ${getVal(i)} (#${i})`;

  // hashMap of solved subtrees, shown next to the tree
  const solved: Record<string, string> = {};
  const solvedIdx: number[] = [];

  function emit(
    message: string,
    codeLine: number,
    hl: number[] = [],
    sec: number[] = [],
    action?: AlgorithmStep['action'],
    extra: Record<string, unknown> = {},
  ): void {
    const state: Record<string, unknown> = { tree: toTreeNodes(arr), hashMap: { ...solved }, ...extra };
    if (hl.length) state.treeHighlights = hl;
    if (sec.length) state.treeSecondary = sec;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(
    'Robbing a node forbids robbing its direct children. Bottom-up DFS returns a PAIR per subtree: (rob this node, skip this node) — so the parent never has to guess.',
    1,
  );

  function dfs(i: number): [number, number] {
    const val = getVal(i);
    if (val === null) return [0, 0];

    emit(`Visit ${label(i)} — first solve both of its subtrees`, 5, [i], solvedIdx.slice(), 'visit');

    const l = getLeft(i);
    const r = getRight(i);
    const left = dfs(l);
    const right = dfs(r);

    const robNode = val + left[1] + right[1];
    const skipNode = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);

    emit(
      `ROB ${val}: children must be skipped, so ${val} + ${left[1]} (left skipped) + ${right[1]} (right skipped) = ${robNode}`,
      7,
      [i],
      [l, r].filter(x => getVal(x) !== null),
      'compare',
    );
    emit(
      `SKIP ${val}: each child is free to do whatever is best — max(${left[0]}, ${left[1]}) + max(${right[0]}, ${right[1]}) = ${skipNode}`,
      8,
      [i],
      [l, r].filter(x => getVal(x) !== null),
      'compare',
    );

    solved[label(i)] = `rob=${robNode}, skip=${skipNode}`;
    if (!solvedIdx.includes(i)) solvedIdx.push(i);

    emit(`Return (rob=${robNode}, skip=${skipNode}) for the subtree at ${label(i)}`, 9, [i], solvedIdx.filter(x => x !== i), 'found');

    return [robNode, skipNode];
  }

  const [robRoot, skipRoot] = dfs(0);
  const best = Math.max(robRoot, skipRoot);

  emit(
    `At the root the two options are ${robRoot} (rob it) and ${skipRoot} (skip it) — take the larger: ${best}`,
    10,
    [0],
    solvedIdx.filter(x => x !== 0),
    'found',
    { result: best },
  );

  return steps;
}

function runHouseRobberIIIMemo(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  const getLeft = (i: number): number => 2 * i + 1;
  const getRight = (i: number): number => 2 * i + 2;
  const getVal = (i: number): number | null => (i < arr.length ? arr[i] : null);
  const label = (i: number): string => `house ${getVal(i)} (#${i})`;

  const memo = new Map<number, number>();
  const memoView: Record<string, string> = {};

  function emit(
    message: string,
    codeLine: number,
    hl: number[] = [],
    sec: number[] = [],
    action?: AlgorithmStep['action'],
    extra: Record<string, unknown> = {},
  ): void {
    const state: Record<string, unknown> = { tree: toTreeNodes(arr), hashMap: { ...memoView }, ...extra };
    if (hl.length) state.treeHighlights = hl;
    if (sec.length) state.treeSecondary = sec;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(
    'Single-value recursion instead of pairs: rob(node) = max(node + grandchildren, children). That double-counts subtrees, so a memo keyed by node is what keeps it linear.',
    1,
  );

  function dfs(i: number): number {
    const val = getVal(i);
    if (val === null) return 0;

    if (memo.has(i)) {
      emit(`${label(i)} is already in the memo → reuse ${memo.get(i)} instantly instead of re-exploring the subtree`, 7, [i], [...memo.keys()].filter(x => x !== i), 'found');
      return memo.get(i)!;
    }

    emit(`Visit ${label(i)} — not memoized yet, so compute both options`, 8, [i], [...memo.keys()], 'visit');

    const l = getLeft(i);
    const r = getRight(i);

    let take = val;
    if (getVal(l) !== null) {
      take += dfs(getLeft(l)) + dfs(getRight(l));
    }
    if (getVal(r) !== null) {
      take += dfs(getLeft(r)) + dfs(getRight(r));
    }
    emit(`TAKE ${val}: skip both children and jump to the four grandchildren → ${take}`, 12, [i], [getLeft(l), getRight(l), getLeft(r), getRight(r)].filter(x => getVal(x) !== null), 'compare');

    const skip = dfs(l) + dfs(r);
    emit(`SKIP ${val}: take the best of each child instead → ${skip}`, 13, [i], [l, r].filter(x => getVal(x) !== null), 'compare');

    const best = Math.max(take, skip);
    memo.set(i, best);
    memoView[label(i)] = `${best}`;

    emit(`Store memo[${label(i)}] = max(${take}, ${skip}) = ${best}`, 14, [i], [...memo.keys()].filter(x => x !== i), 'insert');

    return best;
  }

  const answer = dfs(0);

  emit(`Every node was solved exactly once thanks to the memo — the answer is ${answer}`, 16, [0], [...memo.keys()].filter(x => x !== 0), 'found', { result: answer });

  return steps;
}

export const houseRobberIII: Algorithm = {
  id: 'house-robber-iii',
  name: 'House Robber III',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — return (rob, skip) pair from every subtree',
  description:
    'Houses are arranged in a binary tree and the alarm goes off if two directly-linked houses are robbed on the same night. Return the maximum amount of money that can be robbed without alerting the police.',
  problemUrl: 'https://leetcode.com/problems/house-robber-iii/',
  code: {
    python: `def rob(root):
    def dfs(node):
        if not node:
            return (0, 0)
        left = dfs(node.left)
        right = dfs(node.right)
        with_node = node.val + left[1] + right[1]
        without_node = max(left) + max(right)
        return (with_node, without_node)
    return max(dfs(root))`,
    javascript: `function rob(root) {
    function dfs(node) {
        if (!node) return [0, 0];
        const left = dfs(node.left);
        const right = dfs(node.right);
        const withNode = node.val + left[1] + right[1];
        const withoutNode = Math.max(...left) + Math.max(...right);
        return [withNode, withoutNode];
    }
    return Math.max(...dfs(root));
}`,
    java: `public static int rob(TreeNode root) {
    int[] res = dfs(root);
    return Math.max(res[0], res[1]);
}

private static int[] dfs(TreeNode node) {
    if (node == null) return new int[]{0, 0};
    int[] left = dfs(node.left);
    int[] right = dfs(node.right);
    int withNode = node.val + left[1] + right[1];
    int withoutNode = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
    return new int[]{withNode, withoutNode};
}`,
  },
  defaultInput: [3, 4, 5, 1, 3, null, 1],
  run: runHouseRobberIII,
  optimalApproachName: 'DFS Pair (rob, skip)',
  approaches: [
    {
      id: 'memoized-recursion',
      name: 'Memoized Recursion',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Return a single number per node — max(node + grandchildren, children) — which revisits grandchildren twice, so a hash-map memo is needed to avoid the exponential blowup that the (rob, skip) pair avoids for free.',
      code: {
        python: `def rob(root):
    memo = {}
    def dfs(node):
        if not node:
            return 0
        if node in memo:
            return memo[node]
        take = node.val
        if node.left:
            take += dfs(node.left.left) + dfs(node.left.right)
        if node.right:
            take += dfs(node.right.left) + dfs(node.right.right)
        skip = dfs(node.left) + dfs(node.right)
        memo[node] = max(take, skip)
        return memo[node]
    return dfs(root)`,
        javascript: `function rob(root) {
    const memo = new Map();
    function dfs(node) {
        if (!node) return 0;
        if (memo.has(node)) return memo.get(node);
        let take = node.val;
        if (node.left) take += dfs(node.left.left) + dfs(node.left.right);
        if (node.right) take += dfs(node.right.left) + dfs(node.right.right);
        const skip = dfs(node.left) + dfs(node.right);
        memo.set(node, Math.max(take, skip));
        return memo.get(node);
    }
    return dfs(root);
}`,
        java: `public static int rob(TreeNode root) {
    return dfs(root, new HashMap<>());
}

private static int dfs(TreeNode node, Map<TreeNode, Integer> memo) {
    if (node == null) return 0;
    if (memo.containsKey(node)) return memo.get(node);
    int take = node.val;
    if (node.left != null) take += dfs(node.left.left, memo) + dfs(node.left.right, memo);
    if (node.right != null) take += dfs(node.right.left, memo) + dfs(node.right.right, memo);
    int skip = dfs(node.left, memo) + dfs(node.right, memo);
    memo.put(node, Math.max(take, skip));
    return memo.get(node);
}`,
      },
      run: runHouseRobberIIIMemo,
      lineExplanations: {
        python: {
          1: 'Maximum money robbable from this tree',
          2: 'Memo keyed by node object',
          3: 'Best total for the subtree at node',
          4: 'Empty subtree',
          5: 'Contributes nothing',
          6: 'Have we solved this exact node before?',
          7: 'Reuse the stored answer — this is what keeps it O(n)',
          8: 'Option A: rob this house',
          9: 'Left child must be skipped...',
          10: '...so jump straight to the left grandchildren',
          11: 'Right child must be skipped...',
          12: '...so jump straight to the right grandchildren',
          13: 'Option B: skip this house and take the best of both children',
          14: 'Store the better of the two options',
          15: 'Return the memoized value',
          16: 'Answer is the best total at the root',
        },
        javascript: {
          1: 'Maximum money robbable from this tree',
          2: 'Memo keyed by node reference',
          3: 'Best total for the subtree at node',
          4: 'Empty subtree contributes nothing',
          5: 'Reuse the stored answer — this is what keeps it O(n)',
          6: 'Option A: rob this house',
          7: 'Left child is off-limits, so jump to its children',
          8: 'Right child is off-limits, so jump to its children',
          9: 'Option B: skip this house, take the best of both children',
          10: 'Store the better of the two options',
          11: 'Return the memoized value',
          13: 'Answer is the best total at the root',
        },
        java: {
          1: 'Maximum money robbable from this tree',
          2: 'Kick off the recursion with an empty memo',
          5: 'Best total for the subtree at node',
          6: 'Empty subtree contributes nothing',
          7: 'Reuse the stored answer — this is what keeps it O(n)',
          8: 'Option A: rob this house',
          9: 'Left child is off-limits, so jump to its children',
          10: 'Right child is off-limits, so jump to its children',
          11: 'Option B: skip this house, take the best of both children',
          12: 'Store the better of the two options',
          13: 'Return the memoized value',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Maximum money robbable from this tree',
      2: 'Return a (rob, skip) pair for the subtree at node',
      3: 'Empty subtree',
      4: 'Both options are worth 0',
      5: 'Solve the left subtree first (bottom-up)',
      6: 'Then the right subtree',
      7: 'Rob here: children are off-limits, so add their SKIP values',
      8: 'Skip here: each child freely picks its own better option',
      9: 'Hand both options up to the parent — no guessing needed',
      10: 'At the root, take the better of the two options',
    },
    javascript: {
      1: 'Maximum money robbable from this tree',
      2: 'Return a [rob, skip] pair for the subtree at node',
      3: 'Empty subtree: both options are worth 0',
      4: 'Solve the left subtree first (bottom-up)',
      5: 'Then the right subtree',
      6: 'Rob here: children are off-limits, so add their skip values',
      7: 'Skip here: each child freely picks its own better option',
      8: 'Hand both options up to the parent',
      10: 'At the root, take the better of the two options',
    },
    java: {
      1: 'Maximum money robbable from this tree',
      2: 'Get the (rob, skip) pair for the whole tree',
      3: 'Take the better of the two options',
      6: 'Return a [rob, skip] pair for the subtree at node',
      7: 'Empty subtree: both options are worth 0',
      8: 'Solve the left subtree first (bottom-up)',
      9: 'Then the right subtree',
      10: 'Rob here: children are off-limits, so add their skip values',
      11: 'Skip here: each child freely picks its own better option',
      12: 'Hand both options up to the parent',
    },
  },
};
