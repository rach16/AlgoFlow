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

interface DeleteNodeInput {
  root: (number | null)[];
  key: number;
}

function runDeleteNodeBST(input: unknown): AlgorithmStep[] {
  const { root: arr, key } = input as DeleteNodeInput;
  const steps: AlgorithmStep[] = [];
  let root = buildTree(arr);

  function emit(
    message: string,
    codeLine: number,
    hl: (TNode | null)[] = [],
    sec: (TNode | null)[] = [],
    action?: AlgorithmStep['action'],
  ): void {
    const { arr: cur, idx } = serializeTree(root);
    const state: Record<string, unknown> = { tree: toTreeNodes(cur), key };
    const h = hl.filter((n): n is TNode => !!n).map(n => idx.get(n)).filter((v): v is number => v !== undefined);
    const s = sec.filter((n): n is TNode => !!n).map(n => idx.get(n)).filter((v): v is number => v !== undefined);
    if (h.length) state.treeHighlights = h;
    if (s.length) state.treeSecondary = s;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(`Delete key ${key} from the BST. The ordering property lets us walk straight to it — no full search needed.`, 1);

  function del(node: TNode | null, k: number): TNode | null {
    if (!node) {
      emit(`Fell off the tree — key ${k} was never in this BST, so nothing changes`, 2);
      return null;
    }
    if (k < node.val) {
      emit(`${k} < ${node.val} — everything smaller lives left, so recurse into the LEFT subtree`, 4, [node], [], 'compare');
      node.left = del(node.left, k);
      return node;
    }
    if (k > node.val) {
      emit(`${k} > ${node.val} — everything larger lives right, so recurse into the RIGHT subtree`, 6, [node], [], 'compare');
      node.right = del(node.right, k);
      return node;
    }

    emit(`Found ${node.val} — this is the node to remove`, 8, [node], [], 'found');

    if (!node.left) {
      emit(
        `${node.val} has no left child, so its right child ${node.right ? node.right.val : 'null'} simply takes its place`,
        10,
        [node],
        node.right ? [node.right] : [],
        'delete',
      );
      return node.right;
    }
    if (!node.right) {
      emit(
        `${node.val} has no right child, so its left child ${node.left.val} simply takes its place`,
        12,
        [node],
        [node.left],
        'delete',
      );
      return node.left;
    }

    const target = node.val;
    emit(
      `${target} has TWO children — we cannot just splice it out. Replace its value with the inorder successor: the smallest value in its right subtree.`,
      13,
      [node],
      [node.right],
    );

    let succ: TNode = node.right;
    emit(`Successor hunt starts at the right child ${succ.val}`, 13, [succ], [node], 'visit');
    while (succ.left) {
      succ = succ.left;
      emit(`A left child exists — walk down to ${succ.val}. Keep going while there is a left child.`, 15, [succ], [node], 'visit');
    }
    emit(`No left child left — ${succ.val} is the inorder successor of ${target}`, 14, [succ], [node], 'found');

    node.val = succ.val;
    emit(`Copy ${succ.val} into the node that held ${target}. The BST ordering still holds — but ${succ.val} now appears twice.`, 16, [node], [succ], 'swap');

    emit(`Now delete the duplicate ${succ.val} from the right subtree. It has at most one child, so this second delete is easy.`, 17, [succ], [node], 'delete');
    node.right = del(node.right, succ.val);
    return node;
  }

  root = del(root, key);

  const { arr: finalArr } = serializeTree(root);
  emit(`Done — key ${key} is gone and the BST is still valid: [${finalArr.map(v => (v === null ? 'null' : v)).join(', ')}]`, 18, [], [], 'found');
  (steps[steps.length - 1].state as Record<string, unknown>).result = finalArr;

  return steps;
}

function runDeleteNodeBSTIterative(input: unknown): AlgorithmStep[] {
  const { root: arr, key } = input as DeleteNodeInput;
  const steps: AlgorithmStep[] = [];
  let root = buildTree(arr);

  function emit(
    message: string,
    codeLine: number,
    hl: (TNode | null)[] = [],
    pointers: Record<string, TNode | null> = {},
    action?: AlgorithmStep['action'],
  ): void {
    const { arr: cur, idx } = serializeTree(root);
    const state: Record<string, unknown> = { tree: toTreeNodes(cur), key };
    const h = hl.filter((n): n is TNode => !!n).map(n => idx.get(n)).filter((v): v is number => v !== undefined);
    if (h.length) state.treeHighlights = h;
    const tp: Record<string, number> = {};
    for (const [label, node] of Object.entries(pointers)) {
      if (!node) continue;
      const i = idx.get(node);
      if (i !== undefined) tp[label] = i;
    }
    if (Object.keys(tp).length) state.treePointers = tp;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(`Same deletion, no recursion: walk down with an explicit "parent" pointer so we can re-link the child ourselves.`, 1);

  let parent: TNode | null = null;
  let cur: TNode | null = root;

  emit(`parent = null, cur = root ${cur ? cur.val : 'null'}`, 2, cur ? [cur] : [], { cur });

  while (cur && cur.val !== key) {
    parent = cur;
    const goLeft = key < cur.val;
    cur = goLeft ? cur.left : cur.right;
    emit(
      `${key} ${goLeft ? '<' : '>'} ${parent.val} — step ${goLeft ? 'LEFT' : 'RIGHT'} to ${cur ? cur.val : 'null'}, remembering ${parent.val} as the parent`,
      5,
      cur ? [cur] : [],
      { parent, cur },
      'compare',
    );
  }

  if (!cur) {
    emit(`Walked off the tree — key ${key} is not present, return the tree unchanged`, 7, [], { parent });
    const { arr: unchanged } = serializeTree(root);
    (steps[steps.length - 1].state as Record<string, unknown>).result = unchanged;
    return steps;
  }

  emit(`cur.val == ${key} — found the node to delete`, 3, [cur], { parent, cur }, 'found');

  if (cur.left && cur.right) {
    emit(`${cur.val} has two children — find its inorder successor and track that successor's parent too`, 8, [cur], { parent, cur });
    let p: TNode = cur;
    let succ: TNode = cur.right;
    emit(`p = ${p.val}, succ = ${succ.val} (start of the right subtree)`, 9, [succ], { p, succ }, 'visit');
    while (succ.left) {
      p = succ;
      succ = succ.left;
      emit(`Walk left: p = ${p.val}, succ = ${succ.val}`, 11, [succ], { p, succ }, 'visit');
    }
    const oldVal = cur.val;
    cur.val = succ.val;
    emit(`Copy successor ${succ.val} over ${oldVal}`, 12, [cur], { p, succ }, 'swap');
    parent = p;
    cur = succ;
    emit(`Retarget the deletion: the node we physically unlink is now the successor ${succ.val}, whose parent is ${p.val}`, 13, [succ], { parent, cur }, 'delete');
  }

  const child: TNode | null = cur.left ? cur.left : cur.right;
  emit(`${cur.val} has at most one child — that child is ${child ? child.val : 'null'}, and it moves up`, 14, child ? [child] : [cur], { parent, cur });

  if (!parent) {
    root = child;
    emit(`No parent — the deleted node was the root, so the child becomes the new root`, 16, child ? [child] : [], {}, 'delete');
  } else if (parent.left === cur) {
    parent.left = child;
    emit(`${cur.val} was the LEFT child of ${parent.val} — set parent.left = ${child ? child.val : 'null'}`, 18, [parent], { parent }, 'delete');
  } else {
    parent.right = child;
    emit(`${cur.val} was the RIGHT child of ${parent.val} — set parent.right = ${child ? child.val : 'null'}`, 20, [parent], { parent }, 'delete');
  }

  const { arr: finalArr } = serializeTree(root);
  emit(`Relinked in O(h) time with O(1) extra space: [${finalArr.map(v => (v === null ? 'null' : v)).join(', ')}]`, 21, [], {}, 'found');
  (steps[steps.length - 1].state as Record<string, unknown>).result = finalArr;

  return steps;
}

export const deleteNodeBST: Algorithm = {
  id: 'delete-node-bst',
  name: 'Delete Node in a BST',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(h)',
  spaceComplexity: 'O(h)',
  pattern: 'BST Property — replace a two-child node with its inorder successor',
  description:
    'Given the root of a binary search tree and a key, delete the node with that key and return the root of the updated tree. The result must still be a valid BST.',
  problemUrl: 'https://leetcode.com/problems/delete-node-in-a-bst/',
  code: {
    python: `def deleteNode(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = deleteNode(root.left, key)
    elif key > root.val:
        root.right = deleteNode(root.right, key)
    else:
        if not root.left:
            return root.right
        if not root.right:
            return root.left
        succ = root.right
        while succ.left:
            succ = succ.left
        root.val = succ.val
        root.right = deleteNode(root.right, succ.val)
    return root`,
    javascript: `function deleteNode(root, key) {
    if (!root) return null;
    if (key < root.val) {
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        root.right = deleteNode(root.right, key);
    } else {
        if (!root.left) return root.right;
        if (!root.right) return root.left;
        let succ = root.right;
        while (succ.left) succ = succ.left;
        root.val = succ.val;
        root.right = deleteNode(root.right, succ.val);
    }
    return root;
}`,
    java: `public static TreeNode deleteNode(TreeNode root, int key) {
    if (root == null) return null;
    if (key < root.val) {
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        root.right = deleteNode(root.right, key);
    } else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        TreeNode succ = root.right;
        while (succ.left != null) succ = succ.left;
        root.val = succ.val;
        root.right = deleteNode(root.right, succ.val);
    }
    return root;
}`,
  },
  defaultInput: { root: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15], key: 4 },
  run: runDeleteNodeBST,
  optimalApproachName: 'Recursive + Inorder Successor',
  approaches: [
    {
      id: 'iterative-parent-pointer',
      name: 'Iterative + Parent Pointer',
      timeComplexity: 'O(h)',
      spaceComplexity: 'O(1)',
      description:
        'Descend with an explicit parent pointer and re-link the child by hand instead of returning subtrees up a recursive call chain — same O(h) time but O(1) space, since there is no call stack.',
      code: {
        python: `def deleteNode(root, key):
    parent, cur = None, root
    while cur and cur.val != key:
        parent = cur
        cur = cur.left if key < cur.val else cur.right
    if not cur:
        return root
    if cur.left and cur.right:
        p, succ = cur, cur.right
        while succ.left:
            p, succ = succ, succ.left
        cur.val = succ.val
        parent, cur = p, succ
    child = cur.left if cur.left else cur.right
    if not parent:
        return child
    if parent.left is cur:
        parent.left = child
    else:
        parent.right = child
    return root`,
        javascript: `function deleteNode(root, key) {
    let parent = null, cur = root;
    while (cur && cur.val !== key) {
        parent = cur;
        cur = key < cur.val ? cur.left : cur.right;
    }
    if (!cur) return root;
    if (cur.left && cur.right) {
        let p = cur, succ = cur.right;
        while (succ.left) { p = succ; succ = succ.left; }
        cur.val = succ.val;
        parent = p;
        cur = succ;
    }
    const child = cur.left ? cur.left : cur.right;
    if (!parent) return child;
    if (parent.left === cur) parent.left = child;
    else parent.right = child;
    return root;
}`,
        java: `public static TreeNode deleteNode(TreeNode root, int key) {
    TreeNode parent = null, cur = root;
    while (cur != null && cur.val != key) {
        parent = cur;
        cur = key < cur.val ? cur.left : cur.right;
    }
    if (cur == null) return root;
    if (cur.left != null && cur.right != null) {
        TreeNode p = cur, succ = cur.right;
        while (succ.left != null) { p = succ; succ = succ.left; }
        cur.val = succ.val;
        parent = p;
        cur = succ;
    }
    TreeNode child = cur.left != null ? cur.left : cur.right;
    if (parent == null) return child;
    if (parent.left == cur) parent.left = child;
    else parent.right = child;
    return root;
}`,
      },
      run: runDeleteNodeBSTIterative,
      lineExplanations: {
        python: {
          1: 'Delete key from the BST rooted at root',
          2: 'Track the node above cur so we can re-link later',
          3: 'Descend while we have not found the key',
          4: 'Remember the current node as the parent',
          5: 'BST property picks the side to descend',
          6: 'Key never appeared in the tree',
          7: 'Nothing to delete — return the tree unchanged',
          8: 'Two-children case needs the inorder successor',
          9: 'p trails succ so we can unlink succ later',
          10: 'Leftmost node of the right subtree is the successor',
          11: 'Advance both pointers together',
          12: 'Overwrite the value instead of moving nodes',
          13: 'Now physically delete the successor node instead',
          14: 'The node to unlink has at most one child',
          15: 'No parent means we deleted the root',
          16: 'The lone child becomes the new root',
          17: 'Was the node hanging off the parent on the left?',
          18: 'Splice the child into the left slot',
          19: 'Otherwise it hung on the right',
          20: 'Splice the child into the right slot',
          21: 'Root is unchanged in this branch',
        },
        javascript: {
          1: 'Delete key from the BST rooted at root',
          2: 'Track the node above cur so we can re-link later',
          3: 'Descend while we have not found the key',
          4: 'Remember the current node as the parent',
          5: 'BST property picks the side to descend',
          7: 'Key never appeared — return the tree unchanged',
          8: 'Two-children case needs the inorder successor',
          9: 'p trails succ so we can unlink succ later',
          10: 'Walk to the leftmost node of the right subtree',
          11: 'Overwrite the value instead of moving nodes',
          12: 'Retarget the parent to the successor’s parent',
          13: 'Retarget the deletion to the successor node',
          15: 'The node to unlink has at most one child',
          16: 'No parent means the root was deleted',
          17: 'Splice the child into the left slot',
          18: 'Otherwise splice it into the right slot',
          19: 'Root is unchanged in this branch',
        },
        java: {
          1: 'Delete key from the BST rooted at root',
          2: 'Track the node above cur so we can re-link later',
          3: 'Descend while we have not found the key',
          4: 'Remember the current node as the parent',
          5: 'BST property picks the side to descend',
          7: 'Key never appeared — return the tree unchanged',
          8: 'Two-children case needs the inorder successor',
          9: 'p trails succ so we can unlink succ later',
          10: 'Walk to the leftmost node of the right subtree',
          11: 'Overwrite the value instead of moving nodes',
          12: 'Retarget the parent to the successor’s parent',
          13: 'Retarget the deletion to the successor node',
          15: 'The node to unlink has at most one child',
          16: 'No parent means the root was deleted',
          17: 'Splice the child into the left slot',
          18: 'Otherwise splice it into the right slot',
          19: 'Root is unchanged in this branch',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Delete key and return the (possibly new) subtree root',
      2: 'Empty subtree — key is not here',
      3: 'Nothing to delete',
      4: 'Key is smaller, so it can only be on the left',
      5: 'Rebuild the left link from the recursive result',
      6: 'Key is larger, so it can only be on the right',
      7: 'Rebuild the right link from the recursive result',
      8: 'Values match — this is the node to remove',
      9: 'No left child?',
      10: 'The right child slides up into this slot',
      11: 'No right child?',
      12: 'The left child slides up into this slot',
      13: 'Two children: start at the right subtree',
      14: 'Walk left as far as possible',
      15: 'That leftmost node is the inorder successor',
      16: 'Copy the successor value here — BST order is preserved',
      17: 'Delete the now-duplicated successor from the right subtree',
      18: 'Return this subtree root to the caller',
    },
    javascript: {
      1: 'Delete key and return the (possibly new) subtree root',
      2: 'Empty subtree — nothing to delete',
      3: 'Key is smaller, so it can only be on the left',
      4: 'Rebuild the left link from the recursive result',
      5: 'Key is larger, so it can only be on the right',
      6: 'Rebuild the right link from the recursive result',
      7: 'Values match — this is the node to remove',
      8: 'No left child: the right child slides up',
      9: 'No right child: the left child slides up',
      10: 'Two children: start at the right subtree',
      11: 'Walk left as far as possible to the inorder successor',
      12: 'Copy the successor value here — BST order is preserved',
      13: 'Delete the now-duplicated successor from the right subtree',
      15: 'Return this subtree root to the caller',
    },
    java: {
      1: 'Delete key and return the (possibly new) subtree root',
      2: 'Empty subtree — nothing to delete',
      3: 'Key is smaller, so it can only be on the left',
      4: 'Rebuild the left link from the recursive result',
      5: 'Key is larger, so it can only be on the right',
      6: 'Rebuild the right link from the recursive result',
      7: 'Values match — this is the node to remove',
      8: 'No left child: the right child slides up',
      9: 'No right child: the left child slides up',
      10: 'Two children: start at the right subtree',
      11: 'Walk left as far as possible to the inorder successor',
      12: 'Copy the successor value here — BST order is preserved',
      13: 'Delete the now-duplicated successor from the right subtree',
      15: 'Return this subtree root to the caller',
    },
  },
};
