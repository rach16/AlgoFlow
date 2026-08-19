import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface SameTreeInput {
  p: (number | null)[];
  q: (number | null)[];
}

function runSameTree(input: unknown): AlgorithmStep[] {
  const { p, q } = input as SameTreeInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
    highlights: [],
    message: `Compare two trees: p=[${p.join(', ')}] and q=[${q.join(', ')}]`,
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(arr: (number | null)[], i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function dfs(i: number): boolean {
    const pVal = getVal(p, i);
    const qVal = getVal(q, i);

    if (pVal === null && qVal === null) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
        highlights: [],
        treeHighlights: [],
        message: `Index ${i}: both nodes are null, match!`,
        codeLine: 3,
      } as AlgorithmStep);
      return true;
    }

    if (pVal === null || qVal === null) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
        highlights: [],
        treeHighlights: [i],
        message: `Index ${i}: one node is null (p=${pVal}, q=${qVal}), trees differ!`,
        codeLine: 5,
        action: 'compare',
      } as AlgorithmStep);
      return false;
    }

    steps.push({
      state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
      highlights: [],
      treeHighlights: [i],
      message: `Compare nodes at index ${i}: p=${pVal}, q=${qVal}`,
      codeLine: 7,
      action: 'visit',
    } as AlgorithmStep);

    if (pVal !== qVal) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
        highlights: [],
        treeHighlights: [i],
        message: `Values differ! p=${pVal} != q=${qVal}. Trees are NOT the same.`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);
      return false;
    }

    steps.push({
      state: { tree: toTreeNodes(p), tree2: toTreeNodes(q) },
      highlights: [],
      treeHighlights: [i],
      message: `Values match! p=${pVal} == q=${qVal}. Check children.`,
      codeLine: 9,
      action: 'found',
    } as AlgorithmStep);

    return dfs(getLeft(i)) && dfs(getRight(i));
  }

  const result = dfs(0);

  steps.push({
    state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), result },
    highlights: [],
    message: result ? 'The two trees ARE the same!' : 'The two trees are NOT the same!',
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runSameTreeIterative(input: unknown): AlgorithmStep[] {
  const { p, q } = input as SameTreeInput;
  const steps: AlgorithmStep[] = [];

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(arr: (number | null)[], i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function fmt(v: number | null): string {
    return v === null ? 'null' : String(v);
  }

  // Stack of index pairs — because both trees are compared in lockstep,
  // the same structural position (index) is used for both.
  const stack: number[] = [0];

  function stackView(s: number[]): string[] {
    return s.map((i) => `(${fmt(getVal(p, i))}, ${fmt(getVal(q, i))})`);
  }

  steps.push({
    state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), stack: stackView(stack) },
    highlights: [],
    message: 'Iterative version: replace the recursion with an explicit stack of node pairs — push the two roots to start',
    codeLine: 2,
    action: 'push',
  });

  while (stack.length > 0) {
    const i = stack.pop()!;
    const pVal = getVal(p, i);
    const qVal = getVal(q, i);

    steps.push({
      state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), stack: stackView(stack) },
      highlights: [],
      treeHighlights: pVal !== null || qVal !== null ? [i] : [],
      message: `Pop pair (${fmt(pVal)}, ${fmt(qVal)}) from the stack and compare`,
      codeLine: 4,
      action: 'pop',
    } as AlgorithmStep);

    if (pVal === null && qVal === null) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), stack: stackView(stack) },
        highlights: [],
        message: `Both positions are null — nothing to compare here, move on to the next pair`,
        codeLine: 6,
      });
      continue;
    }

    if (pVal === null || qVal === null) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), stack: stackView(stack), result: false },
        highlights: [],
        treeHighlights: [i],
        message: `Structural mismatch: one side is null (p=${fmt(pVal)}, q=${fmt(qVal)}). Trees are NOT the same.`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);
      return steps;
    }

    if (pVal !== qVal) {
      steps.push({
        state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), stack: stackView(stack), result: false },
        highlights: [],
        treeHighlights: [i],
        message: `Values differ: p=${pVal} != q=${qVal}. Trees are NOT the same.`,
        codeLine: 10,
        action: 'compare',
      } as AlgorithmStep);
      return steps;
    }

    stack.push(getLeft(i));
    stack.push(getRight(i));

    steps.push({
      state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), stack: stackView(stack) },
      highlights: [],
      treeHighlights: [i],
      message: `p=${pVal} == q=${qVal} — match! Push both children pairs onto the stack to check them later`,
      codeLine: 11,
      action: 'push',
    } as AlgorithmStep);
  }

  steps.push({
    state: { tree: toTreeNodes(p), tree2: toTreeNodes(q), stack: [], result: true },
    highlights: [],
    message: 'Stack emptied without finding any mismatch — the two trees ARE the same!',
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

export const sameTree: Algorithm = {
  id: 'same-tree',
  name: 'Same Tree',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — compare node values recursively',
  description:
    'Given the roots of two binary trees p and q, write a function to check if they are the same or not. Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.',
  problemUrl: 'https://leetcode.com/problems/same-tree/',
  code: {
    python: `def isSameTree(p, q):
    if not p and not q:
        return True
    if not p or not q:
        return False
    if p.val != q.val:
        return False
    return (isSameTree(p.left, q.left) and
            isSameTree(p.right, q.right))
    # Check children
    # Final result`,
    javascript: `function isSameTree(p, q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    if (p.val !== q.val) return false;
    return (
        isSameTree(p.left, q.left) &&
        isSameTree(p.right, q.right)
    );
    // Check children
    // Final result
}`,
    java: `public static boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null) return false;
    if (p.val != q.val) return false;
    return isSameTree(p.left, q.left) &&
           isSameTree(p.right, q.right);
    // Check children
    // Final result
}`,
  },
  defaultInput: { p: [1, 2, 3], q: [1, 2, 3] },
  run: runSameTree,
  optimalApproachName: 'Recursive DFS',
  approaches: [
    {
      id: 'iterative-stack-of-pairs',
      name: 'Iterative Stack of Pairs',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      description:
        'Replaces the recursion with an explicit stack of (p, q) node pairs — the same comparisons in the same order, but no risk of call-stack overflow on deep trees.',
      code: {
        python: `def isSameTree(p, q):
    stack = [(p, q)]
    while stack:
        a, b = stack.pop()
        if not a and not b:
            continue
        if not a or not b:
            return False
        if a.val != b.val:
            return False
        stack.append((a.left, b.left))
        stack.append((a.right, b.right))
    return True`,
        javascript: `function isSameTree(p, q) {
    const stack = [[p, q]];
    while (stack.length > 0) {
        const [a, b] = stack.pop();
        if (!a && !b) continue;
        if (!a || !b) return false;
        if (a.val !== b.val) return false;
        stack.push([a.left, b.left]);
        stack.push([a.right, b.right]);
    }
    return true;
}`,
        java: `public static boolean isSameTree(TreeNode p, TreeNode q) {
    Deque<TreeNode[]> stack = new ArrayDeque<>();
    stack.push(new TreeNode[] { p, q });
    while (!stack.isEmpty()) {
        TreeNode[] pair = stack.pop();
        TreeNode a = pair[0], b = pair[1];
        if (a == null && b == null) continue;
        if (a == null || b == null) return false;
        if (a.val != b.val) return false;
        stack.push(new TreeNode[] { a.left, b.left });
        stack.push(new TreeNode[] { a.right, b.right });
    }
    return true;
}`,
      },
      run: runSameTreeIterative,
      lineExplanations: {
        python: {
          1: 'Define function taking two tree roots p and q',
          2: 'Stack seeded with the pair of roots',
          3: 'Keep comparing while pairs remain',
          4: 'Pop the next pair of corresponding nodes',
          5: 'Both null: this position matches in both trees',
          6: 'Nothing more to check here, take the next pair',
          7: 'Exactly one null: shapes differ',
          8: 'Structural mismatch — not the same tree',
          9: 'Same position, different values?',
          10: 'Value mismatch — not the same tree',
          11: 'Values match: defer the left children as a pair',
          12: 'And defer the right children as a pair',
          13: 'Every pair matched — the trees are identical',
        },
        javascript: {
          1: 'Define function taking two tree roots p and q',
          2: 'Stack seeded with the pair of roots',
          3: 'Keep comparing while pairs remain',
          4: 'Pop the next pair of corresponding nodes',
          5: 'Both null: this position matches, take the next pair',
          6: 'Exactly one null: shapes differ — not the same tree',
          7: 'Value mismatch — not the same tree',
          8: 'Values match: defer the left children as a pair',
          9: 'And defer the right children as a pair',
          11: 'Every pair matched — the trees are identical',
        },
        java: {
          1: 'Define method taking two tree roots p and q',
          2: 'Explicit stack of node pairs (arrays of length 2)',
          3: 'Seed with the pair of roots',
          4: 'Keep comparing while pairs remain',
          5: 'Pop the next pair of corresponding nodes',
          6: 'Unpack the two nodes',
          7: 'Both null: this position matches, take the next pair',
          8: 'Exactly one null: shapes differ — not the same tree',
          9: 'Value mismatch — not the same tree',
          10: 'Values match: defer the left children as a pair',
          11: 'And defer the right children as a pair',
          13: 'Every pair matched — the trees are identical',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking two tree roots p and q',
      2: 'If both nodes are null, trees match here',
      3: 'Return True for matching null nodes',
      4: 'If only one node is null, trees differ',
      5: 'Return False for structural mismatch',
      6: 'If values at current nodes differ',
      7: 'Return False for value mismatch',
      8: 'Recursively compare left and right subtrees',
      9: 'Both subtrees must match for equality',
    },
    javascript: {
      1: 'Define function taking two tree roots p and q',
      2: 'Both null means trees match at this node',
      3: 'One null means structural mismatch',
      4: 'Different values means trees are not same',
      5: 'Recursively compare left subtrees',
      6: 'And recursively compare right subtrees',
      7: 'Both sides must match',
    },
    java: {
      1: 'Define method taking two tree roots p and q',
      2: 'Both null means trees match at this node',
      3: 'One null means structural mismatch',
      4: 'Different values means trees are not same',
      5: 'Recursively compare left subtrees',
      6: 'And recursively compare right subtrees',
    },
  },
};
