import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runPostorderReversed(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const rev: number[] = [];
  const visited: number[] = [];

  const getVal = (i: number): number | null => (i >= 0 && i < arr.length ? arr[i] : null);
  const leftIdx = (i: number) => 2 * i + 1;
  const rightIdx = (i: number) => 2 * i + 2;
  const has = (i: number) => getVal(i) !== null;

  const stack: number[] = [];
  const snapshot = () => ({
    tree: toTreeNodes(arr),
    stack: stack.map(i => getVal(i) as number),
    inorder: [...rev],
    result: [...rev],
  });

  steps.push({
    state: snapshot(),
    highlights: [],
    message:
      'Postorder is LEFT → RIGHT → node, so a node cannot be emitted until BOTH subtrees are done — awkward for a single stack. The trick: run a mirrored preorder (node → right → left), which is postorder read backwards, then reverse the list at the end.',
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
    message: `Seed the stack with the root ${getVal(0)}. In real postorder the root is emitted LAST, so collecting it first is exactly right for a list we intend to reverse.`,
    codeLine: 5,
    action: 'push',
  } as AlgorithmStep);

  while (stack.length > 0) {
    const node = stack.pop()!;
    const val = getVal(node)!;
    rev.push(val);
    visited.push(node);

    steps.push({
      state: snapshot(),
      highlights: [],
      treeHighlights: [node],
      treeSecondary: visited.filter(x => x !== node),
      message: `Pop ${val} and append it to the REVERSED list: [${rev.join(', ')}]. Read that list right-to-left and you are watching postorder appear from the back.`,
      codeLine: 8,
      action: 'visit',
    } as AlgorithmStep);

    const l = leftIdx(node);
    const r = rightIdx(node);

    if (has(l)) {
      stack.push(l);
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [l],
        treeSecondary: [...visited],
        message: `Push the LEFT child ${getVal(l)} first — the mirror image of preorder. Left goes in early so it is popped late, landing near the FRONT after the reversal.`,
        codeLine: 10,
        action: 'push',
      } as AlgorithmStep);
    }

    if (has(r)) {
      stack.push(r);
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [r],
        treeSecondary: [...visited],
        message: `Push the RIGHT child ${getVal(r)} second so it pops next — right before left is what makes the final reversed list read left, right, node.`,
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
        message: `${val} is a leaf, so nothing is pushed. Leaves land near the END of the reversed list — which is the FRONT of the postorder answer, where leaves belong.`,
        codeLine: 11,
      } as AlgorithmStep);
    }
  }

  const answer = [...rev].reverse();

  steps.push({
    state: { tree: toTreeNodes(arr), stack: [], inorder: answer, result: answer },
    highlights: [],
    treeSecondary: [...visited],
    message: `Stack empty. Reverse the collected list [${rev.join(', ')}] to get postorder = [${answer.join(', ')}]. The root ${getVal(0)} ends up last — the property that makes postorder the traversal for deleting a tree or evaluating an expression bottom-up.`,
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runPostorderRecursive(input: unknown): AlgorithmStep[] {
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
      'Recursively, postorder needs no reversal at all: put the append AFTER both recursive calls and the list comes out in true postorder the first time. No second pass, but the tree is emitted only as the calls unwind.',
    codeLine: 1,
  });

  function dfs(i: number, depth: number): void {
    if (!has(i)) return;
    const val = getVal(i)!;
    const l = leftIdx(i);
    const r = rightIdx(i);

    if (has(l)) {
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [l],
        treeSecondary: [...visited],
        treePointers: { parent: i },
        message: `At ${val} (depth ${depth}) — record nothing yet. Descend left into ${getVal(l)}; ${val} is blocked until that entire subtree has reported back.`,
        codeLine: 7,
      } as AlgorithmStep);
    }
    dfs(l, depth + 1);

    if (has(r)) {
      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [r],
        treeSecondary: [...visited],
        treePointers: { parent: i },
        message: `${val}'s left subtree is finished but ${val} still cannot be emitted — the right subtree at ${getVal(r)} has to go first.`,
        codeLine: 8,
      } as AlgorithmStep);
    }
    dfs(r, depth + 1);

    out.push(val);
    visited.push(i);

    steps.push({
      state: snapshot(),
      highlights: [],
      treeHighlights: [i],
      treeSecondary: visited.filter(x => x !== i),
      message: `Both subtrees of ${val} have returned, so now — and only now — append ${val}. Postorder so far: [${out.join(', ')}]`,
      codeLine: 9,
      action: 'visit',
    } as AlgorithmStep);
  }

  dfs(0, 0);

  steps.push({
    state: { tree: toTreeNodes(arr), inorder: [...out], result: [...out] },
    highlights: [],
    treeSecondary: [...visited],
    message: `Every call has unwound. Postorder = [${out.join(', ')}] — the same answer the iterative version reached, except it needed a final reverse and this one never did.`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const postorderTraversal: Algorithm = {
  id: 'postorder-traversal',
  name: 'Binary Tree Postorder Traversal',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'Postorder Traversal — mirrored preorder, then reverse',
  description:
    'Given the root of a binary tree, return the postorder traversal of its nodes\' values: the left subtree, then the right subtree, then the node itself.',
  problemUrl: 'https://leetcode.com/problems/binary-tree-postorder-traversal/',
  code: {
    python: `def postorderTraversal(root):
    if not root:
        return []
    result = []
    stack = [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return result[::-1]`,
    javascript: `function postorderTraversal(root) {
    if (!root) return [];
    const result = [];
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
        result.push(node.val);
        if (node.left) stack.push(node.left);
        if (node.right) stack.push(node.right);
    }
    return result.reverse();
}`,
    java: `public static List<Integer> postorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        result.add(node.val);
        if (node.left != null) stack.push(node.left);
        if (node.right != null) stack.push(node.right);
    }
    Collections.reverse(result);
    return result;
}`,
  },
  defaultInput: [1, 2, 3, 4, 5, null, 6],
  run: runPostorderReversed,
  optimalApproachName: 'Reversed Preorder (Stack)',
  approaches: [
    {
      id: 'recursive-dfs',
      name: 'Recursive DFS',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      description:
        'Emits true postorder directly by appending after both recursive calls, so no reversal pass is needed — at the cost of real call-stack frames that can overflow on a skewed tree.',
      code: {
        python: `def postorderTraversal(root):
    result = []

    def dfs(node):
        if not node:
            return
        dfs(node.left)
        dfs(node.right)
        result.append(node.val)

    dfs(root)
    return result`,
        javascript: `function postorderTraversal(root) {
    const result = [];

    function dfs(node) {
        if (!node) return;
        dfs(node.left);
        dfs(node.right);
        result.push(node.val);
    }

    dfs(root);
    return result;
}`,
        java: `public static List<Integer> postorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    dfs(root, result);
    return result;
}

private static void dfs(TreeNode node, List<Integer> result) {
    if (node == null) return;
    dfs(node.left, result);
    dfs(node.right, result);
    result.add(node.val);
}`,
      },
      run: runPostorderRecursive,
      lineExplanations: {
        python: {
          1: 'Define function taking the tree root',
          2: 'Output list shared by every recursive call',
          4: 'Helper that emits one subtree in postorder',
          5: 'Base case: a missing child contributes nothing',
          6: 'Return without appending',
          7: 'Finish the entire left subtree first',
          8: 'Then finish the entire right subtree',
          9: 'Only now append this node — last line means last visited',
          11: 'Kick off the traversal at the root',
          12: 'Already in postorder — no reversal needed',
        },
        javascript: {
          1: 'Define function taking the tree root',
          2: 'Output array shared by every recursive call',
          4: 'Helper that emits one subtree in postorder',
          5: 'Base case: a missing child contributes nothing',
          6: 'Finish the entire left subtree first',
          7: 'Then finish the entire right subtree',
          8: 'Only now push this node — last line means last visited',
          11: 'Kick off the traversal at the root',
          12: 'Already in postorder — no reversal needed',
        },
        java: {
          1: 'Define function taking the tree root',
          2: 'Output list shared by every recursive call',
          3: 'Kick off the traversal at the root',
          4: 'Already in postorder — no reversal needed',
          7: 'Helper that emits one subtree in postorder',
          8: 'Base case: a missing child contributes nothing',
          9: 'Finish the entire left subtree first',
          10: 'Then finish the entire right subtree',
          11: 'Only now add this node — last line means last visited',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the tree root',
      2: 'Guard against an empty tree',
      3: 'Nothing to traverse',
      4: 'Collects node → right → left, the reverse of postorder',
      5: 'Stack seeded with the root — collected first, emitted last',
      6: 'Keep going while unexpanded subtrees remain',
      7: 'Pop the next subtree root',
      8: 'Append it to the reversed list',
      9: 'If it has a left child...',
      10: 'Push LEFT first — mirrored from preorder, so it pops last',
      11: 'If it has a right child...',
      12: 'Push RIGHT second so it pops next',
      13: 'Reverse the whole list to turn node-right-left into left-right-node',
    },
    javascript: {
      1: 'Define function taking the tree root',
      2: 'Guard against an empty tree',
      3: 'Collects node → right → left, the reverse of postorder',
      4: 'Stack seeded with the root — collected first, emitted last',
      5: 'Keep going while unexpanded subtrees remain',
      6: 'Pop the next subtree root',
      7: 'Append it to the reversed list',
      8: 'Push LEFT first — mirrored from preorder, so it pops last',
      9: 'Push RIGHT second so it pops next',
      11: 'Reverse to turn node-right-left into left-right-node',
    },
    java: {
      1: 'Define function taking the tree root',
      2: 'Collects node → right → left, the reverse of postorder',
      3: 'Guard against an empty tree',
      4: 'Stack of unexpanded subtree roots (ArrayDeque)',
      5: 'Seed it with the root — collected first, emitted last',
      6: 'Keep going while unexpanded subtrees remain',
      7: 'Pop the next subtree root',
      8: 'Append it to the reversed list',
      9: 'Push LEFT first — mirrored from preorder, so it pops last',
      10: 'Push RIGHT second so it pops next',
      12: 'Reverse to turn node-right-left into left-right-node',
      13: 'Return the postorder traversal',
    },
  },
};
