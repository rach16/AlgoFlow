import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface TNode {
  val: number;
  left: TNode | null;
  right: TNode | null;
}

/** Build a real node tree from the level-order (heap-indexed) array the visualizer uses. */
function buildTree(arr: (number | null)[]): TNode | null {
  const nodes: (TNode | null)[] = arr.map(v => (v === null ? null : { val: v, left: null, right: null }));
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n) continue;
    n.left = 2 * i + 1 < nodes.length ? nodes[2 * i + 1] : null;
    n.right = 2 * i + 2 < nodes.length ? nodes[2 * i + 2] : null;
  }
  return nodes.length > 0 ? nodes[0] : null;
}

/** Serialize back to the level-order array, plus a node -> index map for highlights. */
function serializeTree(root: TNode | null): { arr: (number | null)[]; idx: Map<TNode, number> } {
  const arr: (number | null)[] = [];
  const idx = new Map<TNode, number>();
  function place(node: TNode | null, i: number): void {
    if (!node) return;
    while (arr.length <= i) arr.push(null);
    arr[i] = node.val;
    idx.set(node, i);
    place(node.left, 2 * i + 1);
    place(node.right, 2 * i + 2);
  }
  place(root, 0);
  return { arr, idx };
}

interface DeleteLeavesInput {
  root: (number | null)[];
  target: number;
}

function runDeleteLeavesGivenValue(input: unknown): AlgorithmStep[] {
  const { root: arr, target } = input as DeleteLeavesInput;
  const steps: AlgorithmStep[] = [];
  let root = buildTree(arr);
  // Nodes removed so far, kept for the "already pruned" message text only.
  let removed = 0;

  function emit(
    message: string,
    codeLine: number,
    hl: (TNode | null)[] = [],
    sec: (TNode | null)[] = [],
    action?: AlgorithmStep['action'],
    extra: Record<string, unknown> = {},
  ): void {
    const { arr: cur, idx } = serializeTree(root);
    const state: Record<string, unknown> = { tree: toTreeNodes(cur), target, removed, ...extra };
    const h = hl.filter((n): n is TNode => !!n).map(n => idx.get(n)).filter((v): v is number => v !== undefined);
    const s = sec.filter((n): n is TNode => !!n).map(n => idx.get(n)).filter((v): v is number => v !== undefined);
    if (h.length) state.treeHighlights = h;
    if (s.length) state.treeSecondary = s;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(
    `Delete every leaf equal to ${target} — and repeat, because deleting a leaf can turn its parent into a new ${target} leaf. Post-order does this in ONE pass: children are pruned before the parent is judged.`,
    1,
  );

  function prune(node: TNode | null, parent: TNode | null): TNode | null {
    if (!node) return null;

    emit(`Descend to node ${node.val} — do not judge it yet, its children come first`, 2, [node], parent ? [parent] : [], 'visit');

    node.left = prune(node.left, node);
    emit(`Left subtree of ${node.val} is finished — it is now ${node.left ? node.left.val : 'null'}`, 4, [node], node.left ? [node.left] : []);

    node.right = prune(node.right, node);
    emit(`Right subtree of ${node.val} is finished — it is now ${node.right ? node.right.val : 'null'}`, 5, [node], node.right ? [node.right] : []);

    const isLeaf = !node.left && !node.right;
    if (isLeaf && node.val === target) {
      removed++;
      emit(`${node.val} is now a LEAF and equals target ${target} → return null, cutting it off from its parent`, 7, [node], parent ? [parent] : [], 'delete');
      return null;
    }

    if (isLeaf) {
      emit(`${node.val} is a leaf but ≠ ${target} → keep it`, 8, [node], [], 'found');
    } else {
      emit(`${node.val} still has a child, so it is not a leaf → keep it`, 8, [node], [node.left, node.right].filter((n): n is TNode => !!n), 'found');
    }
    return node;
  }

  root = prune(root, null);

  const { arr: finalArr } = serializeTree(root);
  emit(
    `One post-order pass removed ${removed} node${removed === 1 ? '' : 's'}. Result: [${finalArr.map(v => (v === null ? 'null' : v)).join(', ')}]`,
    8,
    [],
    [],
    'found',
    { result: finalArr },
  );

  return steps;
}

function runDeleteLeavesGivenValueIterative(input: unknown): AlgorithmStep[] {
  const { root: arr, target } = input as DeleteLeavesInput;
  const steps: AlgorithmStep[] = [];
  let root = buildTree(arr);

  type Frame = { node: TNode | null; parent: TNode | null; visited: boolean };
  const stack: Frame[] = [{ node: root, parent: null, visited: false }];

  function stackView(): string[] {
    return stack.map(f => `${f.node ? f.node.val : 'null'}${f.visited ? '*' : ''}`);
  }

  function emit(
    message: string,
    codeLine: number,
    hl: (TNode | null)[] = [],
    sec: (TNode | null)[] = [],
    action?: AlgorithmStep['action'],
    extra: Record<string, unknown> = {},
  ): void {
    const { arr: cur, idx } = serializeTree(root);
    const state: Record<string, unknown> = { tree: toTreeNodes(cur), target, stack: stackView(), ...extra };
    const h = hl.filter((n): n is TNode => !!n).map(n => idx.get(n)).filter((v): v is number => v !== undefined);
    const s = sec.filter((n): n is TNode => !!n).map(n => idx.get(n)).filter((v): v is number => v !== undefined);
    if (h.length) state.treeHighlights = h;
    if (s.length) state.treeSecondary = s;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(
    'Same post-order, no recursion: each node is pushed TWICE — once unvisited (expand children) and once visited (marked *, now safe to judge). The parent rides along in the frame so we can unlink the child.',
    2,
  );

  while (stack.length > 0) {
    const frame = stack.pop()!;
    const { node, parent, visited } = frame;

    if (!node) {
      emit('Popped a null child frame — skip it', 6, [], [], 'pop');
      continue;
    }

    if (!visited) {
      emit(`Pop ${node.val} (unvisited) — push it back as visited, then push its children on top`, 8, [node], [], 'pop');
      stack.push({ node, parent, visited: true });
      stack.push({ node: node.right, parent: node, visited: false });
      stack.push({ node: node.left, parent: node, visited: false });
      emit(`Stack now holds ${node.val}* under its children — the children will be judged first`, 10, [node], [node.left, node.right].filter((n): n is TNode => !!n), 'push');
      continue;
    }

    const isLeaf = !node.left && !node.right;
    if (isLeaf && node.val === target) {
      if (!parent) {
        root = null;
        emit(`Root ${node.val} became a leaf equal to ${target} — the whole tree disappears`, 13, [], [], 'delete');
        continue;
      }
      if (parent.left === node) {
        parent.left = null;
        emit(`${node.val}* is a leaf equal to ${target} — it was the LEFT child of ${parent.val}, so set parent.left = null`, 15, [parent], [], 'delete');
      } else {
        parent.right = null;
        emit(`${node.val}* is a leaf equal to ${target} — it was the RIGHT child of ${parent.val}, so set parent.right = null`, 17, [parent], [], 'delete');
      }
      continue;
    }

    emit(
      isLeaf
        ? `${node.val}* is a leaf but ≠ ${target} → keep it`
        : `${node.val}* still has a child → not a leaf, keep it`,
      11,
      [node],
      [node.left, node.right].filter((n): n is TNode => !!n),
      'found',
    );
  }

  const { arr: finalArr } = serializeTree(root);
  emit(
    `Stack empty — every node was judged after its children. Result: [${finalArr.map(v => (v === null ? 'null' : v)).join(', ')}]`,
    18,
    [],
    [],
    'found',
    { result: finalArr },
  );

  return steps;
}

export const deleteLeavesGivenValue: Algorithm = {
  id: 'delete-leaves-given-value',
  name: 'Delete Leaves With a Given Value',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'Post-order DFS — prune children before judging the parent',
  description:
    'Given a binary tree and an integer target, delete all leaf nodes whose value equals target. Deleting a leaf may create a new leaf with that value, so keep deleting until no such leaf remains.',
  problemUrl: 'https://leetcode.com/problems/delete-leaves-with-a-given-value/',
  code: {
    python: `def removeLeafNodes(root, target):
    if not root:
        return None
    root.left = removeLeafNodes(root.left, target)
    root.right = removeLeafNodes(root.right, target)
    if not root.left and not root.right and root.val == target:
        return None
    return root`,
    javascript: `function removeLeafNodes(root, target) {
    if (!root) return null;
    root.left = removeLeafNodes(root.left, target);
    root.right = removeLeafNodes(root.right, target);
    if (!root.left && !root.right && root.val === target) return null;
    return root;
}`,
    java: `public static TreeNode removeLeafNodes(TreeNode root, int target) {
    if (root == null) return null;
    root.left = removeLeafNodes(root.left, target);
    root.right = removeLeafNodes(root.right, target);
    if (root.left == null && root.right == null && root.val == target) return null;
    return root;
}`,
  },
  defaultInput: { root: [1, 2, 3, 2, null, 2, 4], target: 2 },
  run: runDeleteLeavesGivenValue,
  optimalApproachName: 'Post-order Recursion',
  approaches: [
    {
      id: 'iterative-postorder-stack',
      name: 'Iterative Post-order Stack',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      description:
        'Simulate the same post-order with an explicit stack of (node, parent, visited) frames instead of the call stack — useful when recursion depth would overflow, at the cost of carrying the parent pointer manually.',
      code: {
        python: `def removeLeafNodes(root, target):
    stack = [(root, None, False)]
    while stack:
        node, parent, visited = stack.pop()
        if not node:
            continue
        if not visited:
            stack.append((node, parent, True))
            stack.append((node.right, node, False))
            stack.append((node.left, node, False))
        elif not node.left and not node.right and node.val == target:
            if parent is None:
                return None
            if parent.left is node:
                parent.left = None
            else:
                parent.right = None
    return root`,
        javascript: `function removeLeafNodes(root, target) {
    const stack = [[root, null, false]];
    while (stack.length > 0) {
        const [node, parent, visited] = stack.pop();
        if (!node) continue;
        if (!visited) {
            stack.push([node, parent, true]);
            stack.push([node.right, node, false]);
            stack.push([node.left, node, false]);
        } else if (!node.left && !node.right && node.val === target) {
            if (parent === null) return null;
            if (parent.left === node) parent.left = null;
            else parent.right = null;
        }
    }
    return root;
}`,
        java: `public static TreeNode removeLeafNodes(TreeNode root, int target) {
    Deque<Object[]> stack = new ArrayDeque<>();
    stack.push(new Object[]{root, null, false});
    while (!stack.isEmpty()) {
        Object[] frame = stack.pop();
        TreeNode node = (TreeNode) frame[0];
        TreeNode parent = (TreeNode) frame[1];
        boolean visited = (boolean) frame[2];
        if (node == null) continue;
        if (!visited) {
            stack.push(new Object[]{node, parent, true});
            stack.push(new Object[]{node.right, node, false});
            stack.push(new Object[]{node.left, node, false});
        } else if (node.left == null && node.right == null && node.val == target) {
            if (parent == null) return null;
            if (parent.left == node) parent.left = null;
            else parent.right = null;
        }
    }
    return root;
}`,
      },
      run: runDeleteLeavesGivenValueIterative,
      lineExplanations: {
        python: {
          1: 'Prune target leaves without recursion',
          2: 'Seed the stack with (node, parent, visited)',
          3: 'Keep going until every frame is handled',
          4: 'Pop the next frame',
          5: 'Null child slot',
          6: 'Nothing to do for it',
          7: 'First time we see this node',
          8: 'Push it back marked visited — it is judged after its children',
          9: 'Push the right child (popped second)',
          10: 'Push the left child (popped first)',
          11: 'Second visit: children are already final, so the leaf test is trustworthy',
          12: 'Deleting the root itself',
          13: 'The whole tree disappears',
          14: 'Which side was this node hanging off?',
          15: 'Unlink it from the left slot',
          16: 'Otherwise it was the right child',
          17: 'Unlink it from the right slot',
          18: 'Stack empty — return the pruned tree',
        },
        javascript: {
          1: 'Prune target leaves without recursion',
          2: 'Seed the stack with [node, parent, visited]',
          3: 'Keep going until every frame is handled',
          4: 'Pop the next frame',
          5: 'Null child slot — nothing to do',
          6: 'First time we see this node',
          7: 'Push it back marked visited — judged after its children',
          8: 'Push the right child (popped second)',
          9: 'Push the left child (popped first)',
          10: 'Second visit: the leaf test is now trustworthy',
          11: 'Deleting the root itself wipes the tree',
          12: 'Unlink it from the parent’s left slot',
          13: 'Otherwise unlink it from the right slot',
          16: 'Stack empty — return the pruned tree',
        },
        java: {
          1: 'Prune target leaves without recursion',
          2: 'Explicit stack of frames',
          3: 'Seed with the root and a null parent',
          4: 'Keep going until every frame is handled',
          5: 'Pop the next frame',
          6: 'Unpack the node',
          7: 'Unpack its parent',
          8: 'Unpack the visited flag',
          9: 'Null child slot — nothing to do',
          10: 'First time we see this node',
          11: 'Push it back marked visited — judged after its children',
          12: 'Push the right child (popped second)',
          13: 'Push the left child (popped first)',
          14: 'Second visit: the leaf test is now trustworthy',
          15: 'Deleting the root itself wipes the tree',
          16: 'Unlink it from the parent’s left slot',
          17: 'Otherwise unlink it from the right slot',
          20: 'Stack empty — return the pruned tree',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Remove every leaf equal to target',
      2: 'Empty subtree',
      3: 'Nothing to prune',
      4: 'Prune the left subtree FIRST and rebind the link',
      5: 'Then prune the right subtree and rebind',
      6: 'Only now is the leaf test valid — children are final',
      7: 'Return null so the parent unlinks this node',
      8: 'Otherwise this node survives',
    },
    javascript: {
      1: 'Remove every leaf equal to target',
      2: 'Empty subtree — nothing to prune',
      3: 'Prune the left subtree FIRST and rebind the link',
      4: 'Then prune the right subtree and rebind',
      5: 'Only now is the leaf test valid — return null so the parent unlinks it',
      6: 'Otherwise this node survives',
    },
    java: {
      1: 'Remove every leaf equal to target',
      2: 'Empty subtree — nothing to prune',
      3: 'Prune the left subtree FIRST and rebind the link',
      4: 'Then prune the right subtree and rebind',
      5: 'Only now is the leaf test valid — return null so the parent unlinks it',
      6: 'Otherwise this node survives',
    },
  },
};
