import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runInorderIterative(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const out: number[] = [];
  const visited: number[] = [];

  const getVal = (i: number): number | null => (i >= 0 && i < arr.length ? arr[i] : null);
  const leftIdx = (i: number) => 2 * i + 1;
  const rightIdx = (i: number) => 2 * i + 2;
  const has = (i: number) => getVal(i) !== null;

  const snapshot = (stack: number[]) => ({
    tree: toTreeNodes(arr),
    stack: stack.map(i => getVal(i) as number),
    inorder: [...out],
    result: [...out],
  });

  const stack: number[] = [];

  steps.push({
    state: snapshot(stack),
    highlights: [],
    message:
      'Inorder means LEFT subtree → node → RIGHT subtree. The rule that drives everything: a node may only be recorded once its entire left subtree is finished, so we stack nodes up on the way down and record them on the way back.',
    codeLine: 1,
  });

  if (!has(0)) {
    steps.push({
      state: { tree: toTreeNodes(arr), stack: [], inorder: [], result: [] },
      highlights: [],
      message: 'Empty tree — the traversal is the empty list',
      codeLine: 12,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  let curr: number | null = 0;

  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      stack.push(curr);
      const v = getVal(curr)!;
      const l = leftIdx(curr);
      const goesLeft = has(l);

      steps.push({
        state: snapshot(stack),
        highlights: [],
        treeHighlights: [curr],
        treeSecondary: [...visited],
        treePointers: { curr },
        message: goesLeft
          ? `Push ${v} onto the stack — it is NOT recorded yet, because ${getVal(l)} and everything under it is smaller in inorder position. Walk left to ${getVal(l)}.`
          : `Push ${v} onto the stack. It has no left child, so nothing owes a visit before it — ${v} is the next node to come off.`,
        codeLine: 7,
        action: 'push',
      } as AlgorithmStep);

      curr = goesLeft ? l : null;
    }

    const node = stack.pop()!;
    const val = getVal(node)!;
    out.push(val);
    visited.push(node);

    steps.push({
      state: snapshot(stack),
      highlights: [],
      treeHighlights: [node],
      treeSecondary: visited.filter(x => x !== node),
      message: `Left side exhausted — pop ${val} and record it now. Inorder so far: [${out.join(', ')}]`,
      codeLine: 10,
      action: 'visit',
    } as AlgorithmStep);

    const r = rightIdx(node);
    if (has(r)) {
      curr = r;
      steps.push({
        state: snapshot(stack),
        highlights: [],
        treeHighlights: [r],
        treeSecondary: [...visited],
        treePointers: { curr: r },
        message: `${val} is done, so its RIGHT subtree comes next. Move to ${getVal(r)} and start the dive-left loop again from there.`,
        codeLine: 11,
      } as AlgorithmStep);
    } else {
      curr = null;
    }
  }

  steps.push({
    state: { tree: toTreeNodes(arr), stack: [], inorder: [...out], result: [...out] },
    highlights: [],
    treeSecondary: [...visited],
    message: `Stack empty and no node to descend into — traversal complete. Inorder = [${out.join(', ')}]. Notice the root ${getVal(0)} appears in the MIDDLE, not first.`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runInorderMorris(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  const out: number[] = [];
  const visited: number[] = [];
  const threads = new Map<number, number>();

  const getVal = (i: number): number | null => (i >= 0 && i < arr.length ? arr[i] : null);
  const leftOf = (i: number): number | null => {
    const l = 2 * i + 1;
    return getVal(l) !== null ? l : null;
  };
  const rightOf = (i: number): number | null => {
    if (threads.has(i)) return threads.get(i)!;
    const r = 2 * i + 2;
    return getVal(r) !== null ? r : null;
  };

  const snapshot = () => ({
    tree: toTreeNodes(arr),
    inorder: [...out],
    result: [...out],
  });

  steps.push({
    state: snapshot(),
    highlights: [],
    message:
      'Morris traversal gets the same inorder order with O(1) extra space: instead of a stack of ancestors, it temporarily rewires each subtree\'s rightmost node to point back at its ancestor — a "thread" that carries us home.',
    codeLine: 1,
  });

  let curr: number | null = getVal(0) !== null ? 0 : null;

  if (curr === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), inorder: [], result: [] },
      highlights: [],
      message: 'Empty tree — the traversal is the empty list',
      codeLine: 19,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  while (curr !== null) {
    const val = getVal(curr)!;
    const l = leftOf(curr);

    if (l === null) {
      out.push(val);
      visited.push(curr);
      const next = rightOf(curr);
      const viaThread = threads.get(curr) !== undefined;

      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [curr],
        treeSecondary: visited.filter(x => x !== curr),
        message:
          `${val} has no left child, so nothing precedes it — record it. Inorder so far: [${out.join(', ')}]. ` +
          (next === null
            ? 'Its right link is empty too, so the walk ends here.'
            : viaThread
              ? `Its right link is a THREAD back up to ${getVal(next)}, so we climb there for free.`
              : `Follow its real right link to ${getVal(next)}.`),
        codeLine: 6,
        action: 'visit',
      } as AlgorithmStep);

      curr = next;
      continue;
    }

    // Find the inorder predecessor: rightmost node of the left subtree
    let pred = l;
    let hops = 0;
    while (rightOf(pred) !== null && rightOf(pred) !== curr) {
      pred = rightOf(pred)!;
      hops++;
    }

    if (rightOf(pred) === null) {
      threads.set(pred, curr);

      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [curr],
        treeSecondary: [...visited],
        treePointers: { curr, pred },
        message:
          `First time at ${val}. Its inorder predecessor is ${getVal(pred)}` +
          (hops > 0 ? ` (walk left once, then right ${hops} time${hops > 1 ? 's' : ''})` : '') +
          `. Thread ${getVal(pred)}.right → ${val} so we can return here without a stack, then descend left.`,
        codeLine: 13,
        action: 'insert',
      } as AlgorithmStep);

      curr = l;
    } else {
      threads.delete(pred);
      out.push(val);
      visited.push(curr);
      const next = rightOf(curr);

      steps.push({
        state: snapshot(),
        highlights: [],
        treeHighlights: [curr],
        treeSecondary: visited.filter(x => x !== curr),
        treePointers: { curr, pred },
        message:
          `Back at ${val} via the thread from ${getVal(pred)} — that means the whole left subtree is done, so record ${val} and remove the thread to restore the tree. Inorder so far: [${out.join(', ')}]. ` +
          (next === null ? 'No right link left — the walk ends.' : `Now move right to ${getVal(next)}.`),
        codeLine: 17,
        action: 'visit',
      } as AlgorithmStep);

      curr = next;
    }
  }

  steps.push({
    state: { tree: toTreeNodes(arr), inorder: [...out], result: [...out] },
    highlights: [],
    treeSecondary: [...visited],
    message: `Every thread has been created and torn down again, so the tree is exactly as it started. Inorder = [${out.join(', ')}] — identical to the stack version, but with O(1) extra memory.`,
    codeLine: 19,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const inorderTraversal: Algorithm = {
  id: 'inorder-traversal',
  name: 'Binary Tree Inorder Traversal',
  category: 'Trees',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'Inorder Traversal — dive left, pop to visit, then go right',
  description:
    'Given the root of a binary tree, return the inorder traversal of its nodes\' values: left subtree, then the node itself, then the right subtree.',
  problemUrl: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
  code: {
    python: `def inorderTraversal(root):
    result = []
    stack = []
    curr = root
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result`,
    javascript: `function inorderTraversal(root) {
    const result = [];
    const stack = [];
    let curr = root;
    while (curr || stack.length > 0) {
        while (curr) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop();
        result.push(curr.val);
        curr = curr.right;
    }
    return result;
}`,
    java: `public static List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode curr = root;
    while (curr != null || !stack.isEmpty()) {
        while (curr != null) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop();
        result.add(curr.val);
        curr = curr.right;
    }
    return result;
}`,
  },
  defaultInput: [1, 2, 3, 4, 5, null, 6],
  run: runInorderIterative,
  optimalApproachName: 'Iterative Stack',
  approaches: [
    {
      id: 'morris-threading',
      name: 'Morris Threading',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Replaces the ancestor stack with temporary "threads" from each left subtree\'s rightmost node back to its ancestor, so the walk returns upward with no extra memory at all.',
      code: {
        python: `def inorderTraversal(root):
    result = []
    curr = root
    while curr:
        if not curr.left:
            result.append(curr.val)
            curr = curr.right
        else:
            pred = curr.left
            while pred.right and pred.right is not curr:
                pred = pred.right
            if not pred.right:
                pred.right = curr
                curr = curr.left
            else:
                pred.right = None
                result.append(curr.val)
                curr = curr.right
    return result`,
        javascript: `function inorderTraversal(root) {
    const result = [];
    let curr = root;
    while (curr) {
        if (!curr.left) {
            result.push(curr.val);
            curr = curr.right;
        } else {
            let pred = curr.left;
            while (pred.right && pred.right !== curr) {
                pred = pred.right;
            }
            if (!pred.right) {
                pred.right = curr;
                curr = curr.left;
            } else {
                pred.right = null;
                result.push(curr.val);
                curr = curr.right;
            }
        }
    }
    return result;
}`,
        java: `public static List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    TreeNode curr = root;
    while (curr != null) {
        if (curr.left == null) {
            result.add(curr.val);
            curr = curr.right;
        } else {
            TreeNode pred = curr.left;
            while (pred.right != null && pred.right != curr) {
                pred = pred.right;
            }
            if (pred.right == null) {
                pred.right = curr;
                curr = curr.left;
            } else {
                pred.right = null;
                result.add(curr.val);
                curr = curr.right;
            }
        }
    }
    return result;
}`,
      },
      run: runInorderMorris,
      lineExplanations: {
        python: {
          1: 'Define function taking the tree root',
          2: 'Output list of values in inorder',
          3: 'Walk pointer starts at the root',
          4: 'Keep walking until we fall off the tree',
          5: 'No left child means nothing precedes this node',
          6: 'So it is safe to record it immediately',
          7: 'Move right — possibly along a thread we planted earlier',
          8: 'Otherwise there is a left subtree to handle first',
          9: 'Start hunting for the inorder predecessor',
          10: 'Walk right until the end, or until we meet our own thread',
          11: 'Keep stepping right',
          12: 'Empty right link — this is the first visit to curr',
          13: 'Plant the thread: predecessor.right points back to curr',
          14: 'Descend into the left subtree',
          15: 'Else the thread already exists — this is the second visit',
          16: 'Tear the thread down to restore the original tree',
          17: 'Left subtree is finished, so record curr now',
          18: 'Continue into the right subtree',
          19: 'Tree is unchanged and the list is complete',
        },
        javascript: {
          1: 'Define function taking the tree root',
          2: 'Output array of values in inorder',
          3: 'Walk pointer starts at the root',
          4: 'Keep walking until we fall off the tree',
          5: 'No left child means nothing precedes this node',
          6: 'So it is safe to record it immediately',
          7: 'Move right — possibly along a thread we planted earlier',
          8: 'Otherwise there is a left subtree to handle first',
          9: 'Start hunting for the inorder predecessor',
          10: 'Walk right until the end, or until we meet our own thread',
          11: 'Keep stepping right',
          13: 'Empty right link — this is the first visit to curr',
          14: 'Plant the thread: predecessor.right points back to curr',
          15: 'Descend into the left subtree',
          16: 'Else the thread already exists — second visit',
          17: 'Tear the thread down to restore the original tree',
          18: 'Left subtree is finished, so record curr now',
          19: 'Continue into the right subtree',
          23: 'Tree is unchanged and the list is complete',
        },
        java: {
          1: 'Define function taking the tree root',
          2: 'Output list of values in inorder',
          3: 'Walk pointer starts at the root',
          4: 'Keep walking until we fall off the tree',
          5: 'No left child means nothing precedes this node',
          6: 'So it is safe to record it immediately',
          7: 'Move right — possibly along a thread we planted earlier',
          8: 'Otherwise there is a left subtree to handle first',
          9: 'Start hunting for the inorder predecessor',
          10: 'Walk right until the end, or until we meet our own thread',
          11: 'Keep stepping right',
          13: 'Empty right link — this is the first visit to curr',
          14: 'Plant the thread: predecessor.right points back to curr',
          15: 'Descend into the left subtree',
          16: 'Else the thread already exists — second visit',
          17: 'Tear the thread down to restore the original tree',
          18: 'Left subtree is finished, so record curr now',
          19: 'Continue into the right subtree',
          23: 'Tree is unchanged and the list is complete',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the tree root',
      2: 'Output list, filled in inorder order',
      3: 'Stack of ancestors that still owe us a visit',
      4: 'Walk pointer starts at the root',
      5: 'Work remains while a node is pending or the stack is non-empty',
      6: 'Dive as far left as the tree allows',
      7: 'Stack the node — its left subtree must be visited first',
      8: 'Step to the left child',
      9: 'No further left: the top of the stack is the next node in order',
      10: 'Record it — its whole left subtree is already recorded',
      11: 'Switch to the right subtree and dive left again from there',
      12: 'Nothing pending anywhere — return the traversal',
    },
    javascript: {
      1: 'Define function taking the tree root',
      2: 'Output array, filled in inorder order',
      3: 'Stack of ancestors that still owe us a visit',
      4: 'Walk pointer starts at the root',
      5: 'Work remains while a node is pending or the stack is non-empty',
      6: 'Dive as far left as the tree allows',
      7: 'Stack the node — its left subtree must be visited first',
      8: 'Step to the left child',
      10: 'No further left: the top of the stack is next in order',
      11: 'Record it — its whole left subtree is already recorded',
      12: 'Switch to the right subtree and dive left again from there',
      14: 'Nothing pending anywhere — return the traversal',
    },
    java: {
      1: 'Define function taking the tree root',
      2: 'Output list, filled in inorder order',
      3: 'Stack of ancestors that still owe us a visit (ArrayDeque)',
      4: 'Walk pointer starts at the root',
      5: 'Work remains while a node is pending or the stack is non-empty',
      6: 'Dive as far left as the tree allows',
      7: 'Stack the node — its left subtree must be visited first',
      8: 'Step to the left child',
      10: 'No further left: the top of the stack is next in order',
      11: 'Record it — its whole left subtree is already recorded',
      12: 'Switch to the right subtree and dive left again from there',
      14: 'Nothing pending anywhere — return the traversal',
    },
  },
};
