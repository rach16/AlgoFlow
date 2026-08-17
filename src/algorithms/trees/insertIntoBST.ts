import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface InsertBSTInput {
  root: (number | null)[];
  val: number;
}

// Grow the flat level-order array so the deepest occupied level is complete,
// which keeps TreeView's level slicing aligned.
function padToFullLevels(tree: (number | null)[], idx: number): void {
  const level = Math.floor(Math.log2(idx + 1));
  const fullLen = Math.pow(2, level + 1) - 1;
  while (tree.length < fullLen) tree.push(null);
}

function trimTrailingNulls(tree: (number | null)[]): (number | null)[] {
  const copy = tree.slice();
  while (copy.length > 0 && copy[copy.length - 1] === null) copy.pop();
  return copy;
}

function runInsertIntoBSTIterative(input: unknown): AlgorithmStep[] {
  const { root, val } = input as InsertBSTInput;
  const steps: AlgorithmStep[] = [];
  const tree = root.slice();

  const getVal = (i: number): number | null => (i >= 0 && i < tree.length ? tree[i] : null);
  const leftIdx = (i: number) => 2 * i + 1;
  const rightIdx = (i: number) => 2 * i + 2;
  const has = (i: number) => getVal(i) !== null;

  const path: number[] = [];

  steps.push({
    state: { tree: toTreeNodes(tree), result: null },
    highlights: [],
    message: `Insert ${val} into the BST. Because a valid BST already tells us where every value must live, no rebalancing or searching around is needed — one root-to-leaf descent finds the single legal slot.`,
    codeLine: 1,
  });

  if (!has(0)) {
    const only = [val];
    steps.push({
      state: { tree: toTreeNodes(only), result: only },
      highlights: [],
      treeHighlights: [0],
      message: `The tree is empty, so the new node ${val} simply becomes the root`,
      codeLine: 4,
      action: 'insert',
    } as AlgorithmStep);
    return steps;
  }

  steps.push({
    state: { tree: toTreeNodes(tree), result: null },
    highlights: [],
    treeHighlights: [0],
    treePointers: { curr: 0 },
    message: `Build the new node ${val} up front and start the descent at the root ${getVal(0)}. Every comparison from here permanently discards one whole subtree.`,
    codeLine: 2,
  } as AlgorithmStep);

  let curr = 0;

  while (true) {
    const currVal = getVal(curr)!;
    path.push(curr);
    const goLeft = val < currVal;
    const childIdx = goLeft ? leftIdx(curr) : rightIdx(curr);

    steps.push({
      state: { tree: toTreeNodes(tree), result: null },
      highlights: [],
      treeHighlights: [curr],
      treeSecondary: path.filter(x => x !== curr),
      treePointers: { curr },
      message: goLeft
        ? `${val} < ${currVal}, so ${val} belongs somewhere in ${currVal}'s LEFT subtree — the entire right side is ruled out in one comparison.`
        : `${val} >= ${currVal}, so ${val} belongs somewhere in ${currVal}'s RIGHT subtree — the entire left side is ruled out in one comparison.`,
      codeLine: goLeft ? 7 : 12,
      action: 'compare',
    } as AlgorithmStep);

    if (has(childIdx)) {
      curr = childIdx;
      steps.push({
        state: { tree: toTreeNodes(tree), result: null },
        highlights: [],
        treeHighlights: [curr],
        treeSecondary: path.filter(x => x !== curr),
        treePointers: { curr },
        message: `That child slot is occupied by ${getVal(curr)}, so the descent continues one level deeper. Nothing in the tree is modified while we are still walking.`,
        codeLine: goLeft ? 11 : 16,
      } as AlgorithmStep);
      continue;
    }

    padToFullLevels(tree, childIdx);
    tree[childIdx] = val;

    steps.push({
      state: { tree: toTreeNodes(tree), result: null },
      highlights: [],
      treeHighlights: [childIdx],
      treeSecondary: [...path],
      treePointers: { new: childIdx },
      message: `${currVal}'s ${goLeft ? 'left' : 'right'} child is empty — that empty slot IS the answer. Attach ${val} there; exactly one pointer in the whole tree changed.`,
      codeLine: goLeft ? 9 : 14,
      action: 'insert',
    } as AlgorithmStep);

    break;
  }

  const answer = trimTrailingNulls(tree);

  steps.push({
    state: { tree: toTreeNodes(tree), result: answer },
    highlights: [],
    treeSecondary: [...path],
    message: `Done in ${path.length} comparison${path.length > 1 ? 's' : ''} — O(h) time, O(1) extra space. The new node is always inserted as a LEAF, so the existing structure is untouched. Result: [${answer.join(', ')}]`,
    codeLine: 17,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runInsertIntoBSTRecursive(input: unknown): AlgorithmStep[] {
  const { root, val } = input as InsertBSTInput;
  const steps: AlgorithmStep[] = [];
  const tree = root.slice();

  const getVal = (i: number): number | null => (i >= 0 && i < tree.length ? tree[i] : null);
  const leftIdx = (i: number) => 2 * i + 1;
  const rightIdx = (i: number) => 2 * i + 2;
  const has = (i: number) => getVal(i) !== null;

  const path: number[] = [];
  let insertedAt = -1;

  steps.push({
    state: { tree: toTreeNodes(tree), result: null },
    highlights: [],
    message: `Recursive insert reads like the BST definition itself: insert into the correct subtree, then reattach whatever that call returns. The descent is identical to the loop — the difference is what happens on the way back UP.`,
    codeLine: 1,
  });

  function insert(i: number, depth: number, side: string): void {
    if (!has(i)) {
      padToFullLevels(tree, i);
      tree[i] = val;
      insertedAt = i;

      steps.push({
        state: { tree: toTreeNodes(tree), result: null },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: [...path],
        treePointers: { new: i },
        message: `The call bottomed out on a null ${side} at depth ${depth} — the base case creates node ${val} and RETURNS it. That returned node is what the parent will hang onto.`,
        codeLine: 3,
        action: 'insert',
      } as AlgorithmStep);
      return;
    }

    const currVal = getVal(i)!;
    path.push(i);
    const goLeft = val < currVal;

    steps.push({
      state: { tree: toTreeNodes(tree), result: null },
      highlights: [],
      treeHighlights: [i],
      treeSecondary: path.filter(x => x !== i),
      treePointers: { curr: i },
      message: goLeft
        ? `At ${currVal}: ${val} < ${currVal}, so recurse into the left child and assign the result back to ${currVal}.left.`
        : `At ${currVal}: ${val} >= ${currVal}, so recurse into the right child and assign the result back to ${currVal}.right.`,
      codeLine: goLeft ? 4 : 6,
      action: 'compare',
    } as AlgorithmStep);

    insert(goLeft ? leftIdx(i) : rightIdx(i), depth + 1, goLeft ? 'left' : 'right');

    steps.push({
      state: { tree: toTreeNodes(tree), result: null },
      highlights: [],
      treeHighlights: [i],
      treeSecondary: path.filter(x => x !== i),
      treePointers: { curr: i },
      message: `Unwind to ${currVal}: reassign ${currVal}.${goLeft ? 'left' : 'right'} to the subtree the call returned, then return ${currVal} upward. Only the deepest of these reassignments actually changes anything — the rest rewrite a pointer with its own value.`,
      codeLine: goLeft ? 5 : 7,
    } as AlgorithmStep);
  }

  insert(0, 0, 'root');

  const answer = trimTrailingNulls(tree);

  steps.push({
    state: { tree: toTreeNodes(tree), result: answer },
    highlights: [],
    treeHighlights: insertedAt >= 0 ? [insertedAt] : [],
    treeSecondary: [...path],
    message: `The original root bubbles back out unchanged. Result: [${answer.join(', ')}] — identical to the iterative descent, but it consumed O(h) call frames to get there instead of O(1).`,
    codeLine: 8,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const insertIntoBST: Algorithm = {
  id: 'insert-into-bst',
  name: 'Insert into a Binary Search Tree',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(h)',
  spaceComplexity: 'O(1)',
  pattern: 'BST Property — descend left/right until an empty child slot',
  description:
    'Given the root of a binary search tree and a value to insert, insert the value into the BST and return the root of the updated tree. The input is guaranteed not to already contain the value, and any valid BST result is accepted.',
  problemUrl: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/',
  code: {
    python: `def insertIntoBST(root, val):
    node = TreeNode(val)
    if not root:
        return node
    curr = root
    while True:
        if val < curr.val:
            if not curr.left:
                curr.left = node
                break
            curr = curr.left
        else:
            if not curr.right:
                curr.right = node
                break
            curr = curr.right
    return root`,
    javascript: `function insertIntoBST(root, val) {
    const node = new TreeNode(val);
    if (!root) return node;
    let curr = root;
    while (true) {
        if (val < curr.val) {
            if (!curr.left) {
                curr.left = node;
                break;
            }
            curr = curr.left;
        } else {
            if (!curr.right) {
                curr.right = node;
                break;
            }
            curr = curr.right;
        }
    }
    return root;
}`,
    java: `public static TreeNode insertIntoBST(TreeNode root, int val) {
    TreeNode node = new TreeNode(val);
    if (root == null) return node;
    TreeNode curr = root;
    while (true) {
        if (val < curr.val) {
            if (curr.left == null) {
                curr.left = node;
                break;
            }
            curr = curr.left;
        } else {
            if (curr.right == null) {
                curr.right = node;
                break;
            }
            curr = curr.right;
        }
    }
    return root;
}`,
  },
  defaultInput: { root: [8, 3, 10, 1, 6, null, 14], val: 5 },
  run: runInsertIntoBSTIterative,
  optimalApproachName: 'Iterative Descent',
  approaches: [
    {
      id: 'recursive-insert',
      name: 'Recursive Insert',
      timeComplexity: 'O(h)',
      spaceComplexity: 'O(h)',
      description:
        'Expresses the insert as "attach whatever the recursive call returns", which is shorter and mirrors the BST definition, but spends O(h) call frames re-linking pointers that mostly do not change.',
      code: {
        python: `def insertIntoBST(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insertIntoBST(root.left, val)
    else:
        root.right = insertIntoBST(root.right, val)
    return root`,
        javascript: `function insertIntoBST(root, val) {
    if (!root) return new TreeNode(val);
    if (val < root.val) {
        root.left = insertIntoBST(root.left, val);
    } else {
        root.right = insertIntoBST(root.right, val);
    }
    return root;
}`,
        java: `public static TreeNode insertIntoBST(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    if (val < root.val) {
        root.left = insertIntoBST(root.left, val);
    } else {
        root.right = insertIntoBST(root.right, val);
    }
    return root;
}`,
      },
      run: runInsertIntoBSTRecursive,
      lineExplanations: {
        python: {
          1: 'Insert val into the subtree rooted here, return that subtree',
          2: 'Base case: we fell off the tree — this empty spot is the slot',
          3: 'Create the node and return it so the parent links it in',
          4: 'Smaller values live in the left subtree',
          5: 'Recurse left and reattach the returned subtree',
          6: 'Otherwise the value belongs on the right',
          7: 'Recurse right and reattach the returned subtree',
          8: 'Return this node unchanged so the root survives the unwind',
        },
        javascript: {
          1: 'Insert val into the subtree rooted here, return that subtree',
          2: 'Base case: empty spot — create the node and return it',
          3: 'Smaller values live in the left subtree',
          4: 'Recurse left and reattach the returned subtree',
          5: 'Otherwise the value belongs on the right',
          6: 'Recurse right and reattach the returned subtree',
          8: 'Return this node unchanged so the root survives the unwind',
        },
        java: {
          1: 'Insert val into the subtree rooted here, return that subtree',
          2: 'Base case: empty spot — create the node and return it',
          3: 'Smaller values live in the left subtree',
          4: 'Recurse left and reattach the returned subtree',
          5: 'Otherwise the value belongs on the right',
          6: 'Recurse right and reattach the returned subtree',
          8: 'Return this node unchanged so the root survives the unwind',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the BST root and the value to insert',
      2: 'Build the new node once, up front',
      3: 'Empty tree is the only special case',
      4: 'The new node becomes the whole tree',
      5: 'Walk pointer starts at the root',
      6: 'Descend until an empty child slot is found',
      7: 'Smaller values must go left',
      8: 'An empty left slot is the insertion point',
      9: 'Attach the new node there',
      10: 'Descent finished',
      11: 'Otherwise keep walking down the left branch',
      12: 'Values >= current must go right',
      13: 'An empty right slot is the insertion point',
      14: 'Attach the new node there',
      15: 'Descent finished',
      16: 'Otherwise keep walking down the right branch',
      17: 'Return the original root — only one pointer changed',
    },
    javascript: {
      1: 'Define function taking the BST root and the value to insert',
      2: 'Build the new node once, up front',
      3: 'Empty tree: the new node becomes the whole tree',
      4: 'Walk pointer starts at the root',
      5: 'Descend until an empty child slot is found',
      6: 'Smaller values must go left',
      7: 'An empty left slot is the insertion point',
      8: 'Attach the new node there',
      9: 'Descent finished',
      11: 'Otherwise keep walking down the left branch',
      12: 'Values >= current must go right',
      13: 'An empty right slot is the insertion point',
      14: 'Attach the new node there',
      15: 'Descent finished',
      17: 'Otherwise keep walking down the right branch',
      20: 'Return the original root — only one pointer changed',
    },
    java: {
      1: 'Define function taking the BST root and the value to insert',
      2: 'Build the new node once, up front',
      3: 'Empty tree: the new node becomes the whole tree',
      4: 'Walk pointer starts at the root',
      5: 'Descend until an empty child slot is found',
      6: 'Smaller values must go left',
      7: 'An empty left slot is the insertion point',
      8: 'Attach the new node there',
      9: 'Descent finished',
      11: 'Otherwise keep walking down the left branch',
      12: 'Values >= current must go right',
      13: 'An empty right slot is the insertion point',
      14: 'Attach the new node there',
      15: 'Descent finished',
      17: 'Otherwise keep walking down the right branch',
      20: 'Return the original root — only one pointer changed',
    },
  },
};
