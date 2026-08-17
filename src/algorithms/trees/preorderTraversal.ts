import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runPreorderIterative(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const out: number[] = [];
  const visited: number[] = [];

  const getVal = (i: number): number | null => (i >= 0 && i < arr.length ? arr[i] : null);
  const leftIdx = (i: number) => 2 * i + 1;
  const rightIdx = (i: number) => 2 * i + 2;
  const has = (i: number) => getVal(i) !== null;

  const stack: number[] = [];
  const snapshot = () => ({
    tree: toTreeNodes(arr),
    stack: stack.map(i => getVal(i) as number),
    inorder: [...out],
    result: [...out],
  });

  steps.push({
    state: snapshot(),
    highlights: [],
    message:
      'Preorder means node → LEFT subtree → RIGHT subtree. Unlike inorder, a node is recorded the instant we reach it — nothing has to finish first — so one stack of "not yet expanded" nodes is enough.',
    codeLine: 1,
  });

  if (!has(0)) {
    steps.push({
      state: { tree: toTreeNodes(arr), stack: [], inorder: [], result: [] },
      highlights: [],
      message: 'Empty tree — the traversal is the empty list',
      codeLine: 3,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  stack.push(0);
  steps.push({
    state: snapshot(),
    highlights: [],
    treeHighlights: [0],
    treePointers: { root: 0 },
    message: `Seed the stack with the root ${getVal(0)}. The stack always holds subtrees we still owe output for, in the order we must expand them.`,
    codeLine: 5,
    action: 'push',
  } as AlgorithmStep);

  while (stack.length > 0) {
    const node = stack.pop()!;
    const val = getVal(node)!;
    out.push(val);
    visited.push(node);

    steps.push({
      state: snapshot(),
      highlights: [],
      treeHighlights: [node],
      treeSecondary: visited.filter(x => x !== node),
      message: `Pop ${val} and record it immediately — in preorder the parent always comes before both of its subtrees. Output: [${out.join(', ')}]`,
      codeLine: 8,
      action: 'visit',
    } as AlgorithmStep);

    const r = rightIdx(node);
    const l = leftIdx(node);

    if (has(r)) {
      stack.push(r);
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [r],
        treeSecondary: [...visited],
        message: `Push the RIGHT child ${getVal(r)} first. A stack reverses order, so pushing right before left is what makes left come out first.`,
        codeLine: 10,
        action: 'push',
      } as AlgorithmStep);
    }

    if (has(l)) {
      stack.push(l);
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [l],
        treeSecondary: [...visited],
        message: `Push the LEFT child ${getVal(l)} second so it sits on top — it will be the very next node popped, exactly as preorder demands.`,
        codeLine: 12,
        action: 'push',
      } as AlgorithmStep);
    }

    if (!has(l) && !has(r)) {
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [node],
        treeSecondary: visited.filter(x => x !== node),
        message: `${val} is a leaf — nothing to push. The stack rewinds to the nearest right subtree we parked earlier.`,
        codeLine: 11,
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: { tree: toTreeNodes(arr), stack: [], inorder: [...out], result: [...out] },
    highlights: [],
    treeSecondary: [...visited],
    message: `Stack empty — done. Preorder = [${out.join(', ')}]. The root ${getVal(0)} leads the list, which is why preorder is the traversal used to serialize or clone a tree.`,
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runPreorderRecursive(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const out: number[] = [];
  const visited: number[] = [];

  const getVal = (i: number): number | null => (i >= 0 && i < arr.length ? arr[i] : null);
  const leftIdx = (i: number) => 2 * i + 1;
  const rightIdx = (i: number) => 2 * i + 2;
  const has = (i: number) => getVal(i) !== null;

  const snapshot = () => ({
    tree: toTreeNodes(arr),
    inorder: [...out],
    result: [...out],
  });

  steps.push({
    state: snapshot(),
    highlights: [],
    message:
      'Recursive preorder writes the visit order straight into the source: append, then recurse left, then recurse right. The call stack replaces the explicit stack — same O(h) memory, just held by the runtime.',
    codeLine: 1,
  });

  function dfs(i: number, depth: number): void {
    if (!has(i)) return;
    const val = getVal(i)!;
    out.push(val);
    visited.push(i);

    steps.push({
      state: snapshot(),
      highlights: [],
      treeHighlights: [i],
      treeSecondary: visited.filter(x => x !== i),
      message: `Enter ${val} at depth ${depth} and append it right away — the append sits ABOVE both recursive calls, and that single line placement is the whole difference from inorder and postorder. Output: [${out.join(', ')}]`,
      codeLine: 7,
      action: 'visit',
    } as AlgorithmStep);

    const l = leftIdx(i);
    if (has(l)) {
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [l],
        treeSecondary: [...visited],
        message: `Recurse into ${val}'s left child ${getVal(l)} — the entire left subtree is emitted before the right one is even touched.`,
        codeLine: 8,
      } as AlgorithmStep);
      dfs(l, depth + 1);
    }

    const r = rightIdx(i);
    if (has(r)) {
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [r],
        treeSecondary: [...visited],
        message: `${val}'s left side is fully emitted, so unwind back to ${val} and recurse right into ${getVal(r)}.`,
        codeLine: 9,
      } as AlgorithmStep);
      dfs(r, depth + 1);
    }
  }

  dfs(0, 0);

  steps.push({
    state: { tree: toTreeNodes(arr), inorder: [...out], result: [...out] },
    highlights: [],
    treeSecondary: [...visited],
    message: `All calls returned. Preorder = [${out.join(', ')}] — the same list as the stack version, since pushing right-then-left is exactly how the runtime schedules the two calls.`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const preorderTraversal: Algorithm = {
  id: 'preorder-traversal',
  name: 'Binary Tree Preorder Traversal',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'Preorder Traversal — record on arrival, push right before left',
  description:
    'Given the root of a binary tree, return the preorder traversal of its nodes\' values: the node itself first, then its left subtree, then its right subtree.',
  problemUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/',
  code: {
    python: `def preorderTraversal(root):
    if not root:
        return []
    result = []
    stack = [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return result`,
    javascript: `function preorderTraversal(root) {
    if (!root) return [];
    const result = [];
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
        result.push(node.val);
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    return result;
}`,
    java: `public static List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        result.add(node.val);
        if (node.right != null) stack.push(node.right);
        if (node.left != null) stack.push(node.left);
    }
    return result;
}`,
  },
  defaultInput: [1, 2, 3, 4, 5, null, 6],
  run: runPreorderIterative,
  optimalApproachName: 'Iterative Stack',
  approaches: [
    {
      id: 'recursive-dfs',
      name: 'Recursive DFS',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      description:
        'Lets the call stack do the bookkeeping instead of an explicit stack — shorter to write, but it costs real stack frames and can overflow on a degenerate (linked-list shaped) tree.',
      code: {
        python: `def preorderTraversal(root):
    result = []

    def dfs(node):
        if not node:
            return
        result.append(node.val)
        dfs(node.left)
        dfs(node.right)

    dfs(root)
    return result`,
        javascript: `function preorderTraversal(root) {
    const result = [];

    function dfs(node) {
        if (!node) return;
        result.push(node.val);
        dfs(node.left);
        dfs(node.right);
    }

    dfs(root);
    return result;
}`,
        java: `public static List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    dfs(root, result);
    return result;
}

private static void dfs(TreeNode node, List<Integer> result) {
    if (node == null) return;
    result.add(node.val);
    dfs(node.left, result);
    dfs(node.right, result);
}`,
      },
      run: runPreorderRecursive,
      lineExplanations: {
        python: {
          1: 'Define function taking the tree root',
          2: 'Output list shared by every recursive call',
          4: 'Helper that emits one subtree in preorder',
          5: 'Base case: a missing child contributes nothing',
          6: 'Return without appending',
          7: 'Append BEFORE recursing — this line position defines preorder',
          8: 'Emit the whole left subtree next',
          9: 'Emit the whole right subtree last',
          11: 'Kick off the traversal at the root',
          12: 'Return the completed traversal',
        },
        javascript: {
          1: 'Define function taking the tree root',
          2: 'Output array shared by every recursive call',
          4: 'Helper that emits one subtree in preorder',
          5: 'Base case: a missing child contributes nothing',
          6: 'Push BEFORE recursing — this line position defines preorder',
          7: 'Emit the whole left subtree next',
          8: 'Emit the whole right subtree last',
          11: 'Kick off the traversal at the root',
          12: 'Return the completed traversal',
        },
        java: {
          1: 'Define function taking the tree root',
          2: 'Output list shared by every recursive call',
          3: 'Kick off the traversal at the root',
          4: 'Return the completed traversal',
          7: 'Helper that emits one subtree in preorder',
          8: 'Base case: a missing child contributes nothing',
          9: 'Add BEFORE recursing — this line position defines preorder',
          10: 'Emit the whole left subtree next',
          11: 'Emit the whole right subtree last',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the tree root',
      2: 'Guard against an empty tree',
      3: 'Nothing to traverse',
      4: 'Output list, filled in preorder',
      5: 'Stack seeded with the root — the first node to emit',
      6: 'Keep going while unexpanded subtrees remain',
      7: 'Pop the next subtree root',
      8: 'Record it at once — no subtree has to finish first',
      9: 'If it has a right child...',
      10: 'Push right FIRST so it is popped last',
      11: 'If it has a left child...',
      12: 'Push left SECOND so it lands on top and pops next',
      13: 'Stack drained — return the traversal',
    },
    javascript: {
      1: 'Define function taking the tree root',
      2: 'Guard against an empty tree',
      3: 'Output array, filled in preorder',
      4: 'Stack seeded with the root — the first node to emit',
      5: 'Keep going while unexpanded subtrees remain',
      6: 'Pop the next subtree root',
      7: 'Record it at once — no subtree has to finish first',
      8: 'Push right FIRST so it is popped last',
      9: 'Push left SECOND so it lands on top and pops next',
      11: 'Stack drained — return the traversal',
    },
    java: {
      1: 'Define function taking the tree root',
      2: 'Output list, filled in preorder',
      3: 'Guard against an empty tree',
      4: 'Stack of unexpanded subtree roots (ArrayDeque)',
      5: 'Seed it with the root — the first node to emit',
      6: 'Keep going while unexpanded subtrees remain',
      7: 'Pop the next subtree root',
      8: 'Record it at once — no subtree has to finish first',
      9: 'Push right FIRST so it is popped last',
      10: 'Push left SECOND so it lands on top and pops next',
      12: 'Stack drained — return the traversal',
    },
  },
};
