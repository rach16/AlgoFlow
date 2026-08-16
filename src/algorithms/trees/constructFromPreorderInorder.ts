import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

interface ConstructInput {
  preorder: number[];
  inorder: number[];
}

function runConstructFromPreorderInorder(input: unknown): AlgorithmStep[] {
  const { preorder, inorder } = input as ConstructInput;
  const steps: AlgorithmStep[] = [];

  // We'll build the tree as a flat level-order array
  const maxNodes = 64; // enough for visualization
  const tree: (number | null)[] = new Array(maxNodes).fill(null);

  steps.push({
    state: { tree: toTreeNodes([]), preorder: [...preorder], inorder: [...inorder] },
    highlights: preorder.map((_, i) => i),
    message: `Build tree from preorder=[${preorder.join(', ')}] and inorder=[${inorder.join(', ')}]`,
    codeLine: 1,
  });

  let preIdx = 0;
  const inorderMap: Record<number, number> = {};
  for (let i = 0; i < inorder.length; i++) {
    inorderMap[inorder[i]] = i;
  }

  steps.push({
    state: { tree: toTreeNodes([]), preorder: [...preorder], inorder: [...inorder], hashMap: { ...inorderMap } },
    highlights: [],
    message: `Build inorder index map: {${Object.entries(inorderMap).map(([k, v]) => `${k}:${v}`).join(', ')}}`,
    codeLine: 3,
  });

  function build(inLeft: number, inRight: number, treeIdx: number): void {
    if (inLeft > inRight || preIdx >= preorder.length) return;

    const rootVal = preorder[preIdx];
    preIdx++;

    tree[treeIdx] = rootVal;

    // Get current tree snapshot (trimmed)
    const trimmed = tree.slice();
    let lastNonNull = 0;
    for (let i = trimmed.length - 1; i >= 0; i--) {
      if (trimmed[i] !== null) { lastNonNull = i; break; }
    }
    const snapshot = trimmed.slice(0, lastNonNull + 1);

    const inIdx = inorderMap[rootVal];

    steps.push({
      state: {
        tree: toTreeNodes(snapshot),
        preorder: [...preorder],
        inorder: [...inorder],
        preIdx,
        inLeft,
        inRight,
      },
      highlights: [preIdx - 1],
      treeHighlights: [treeIdx],
      message: `Place ${rootVal} (preorder[${preIdx - 1}]) at tree position ${treeIdx}. Inorder index: ${inIdx}, split: [${inLeft}..${inIdx - 1}] | ${rootVal} | [${inIdx + 1}..${inRight}]`,
      codeLine: 6,
      action: 'insert',
    } as AlgorithmStep);

    // Build left subtree
    if (inLeft <= inIdx - 1) {
      steps.push({
        state: { tree: toTreeNodes(snapshot), preorder: [...preorder], inorder: [...inorder] },
        highlights: [],
        treeHighlights: [treeIdx],
        message: `Build left subtree of ${rootVal}: inorder range [${inLeft}..${inIdx - 1}]`,
        codeLine: 8,
        action: 'visit',
      } as AlgorithmStep);
    }
    build(inLeft, inIdx - 1, 2 * treeIdx + 1);

    // Build right subtree
    if (inIdx + 1 <= inRight) {
      const snap2 = tree.slice(0, lastNonNull + 2);
      steps.push({
        state: { tree: toTreeNodes(snap2.length > 0 ? snap2 : snapshot), preorder: [...preorder], inorder: [...inorder] },
        highlights: [],
        treeHighlights: [treeIdx],
        message: `Build right subtree of ${rootVal}: inorder range [${inIdx + 1}..${inRight}]`,
        codeLine: 9,
        action: 'visit',
      } as AlgorithmStep);
    }
    build(inIdx + 1, inRight, 2 * treeIdx + 2);
  }

  build(0, inorder.length - 1, 0);

  // Final trimmed tree
  let lastNonNull = 0;
  for (let i = tree.length - 1; i >= 0; i--) {
    if (tree[i] !== null) { lastNonNull = i; break; }
  }
  const finalTree = tree.slice(0, lastNonNull + 1);

  steps.push({
    state: { tree: toTreeNodes(finalTree), result: finalTree },
    highlights: [],
    message: `Tree construction complete: [${finalTree.join(', ')}]`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runConstructSlicing(input: unknown): AlgorithmStep[] {
  const { preorder, inorder } = input as ConstructInput;
  const steps: AlgorithmStep[] = [];

  const maxNodes = 64;
  const tree: (number | null)[] = new Array(maxNodes).fill(null);

  function snapshot(): (number | null)[] {
    let last = -1;
    for (let i = tree.length - 1; i >= 0; i--) {
      if (tree[i] !== null) { last = i; break; }
    }
    return tree.slice(0, last + 1);
  }

  steps.push({
    state: { tree: toTreeNodes([]), preorder: [...preorder], inorder: [...inorder] },
    highlights: preorder.map((_, i) => i),
    message: `Slicing approach: preorder[0] is always the root — find it in inorder by LINEAR SCAN, then physically slice both arrays into left/right halves`,
    codeLine: 1,
  });

  function build(pre: number[], ino: number[], treeIdx: number): void {
    if (pre.length === 0) return;

    const rootVal = pre[0];
    const mid = ino.indexOf(rootVal);

    tree[treeIdx] = rootVal;

    steps.push({
      state: { tree: toTreeNodes(snapshot()), preorder: [...pre], inorder: [...ino] },
      highlights: [0],
      treeHighlights: [treeIdx],
      message: `Root of this slice is preorder[0] = ${rootVal} — place it at tree position ${treeIdx}`,
      codeLine: 4,
      action: 'insert',
    } as AlgorithmStep);

    steps.push({
      state: { tree: toTreeNodes(snapshot()), preorder: [...pre], inorder: [...ino] },
      highlights: [],
      treeHighlights: [treeIdx],
      message: `Linear-scan inorder [${ino.join(', ')}] for ${rootVal}: found at index ${mid}. This O(n) scan plus O(n) slice copies is what makes the approach O(n²) — the hashmap version replaces it with an O(1) lookup.`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);

    const leftPre = pre.slice(1, mid + 1);
    const leftIn = ino.slice(0, mid);
    const rightPre = pre.slice(mid + 1);
    const rightIn = ino.slice(mid + 1);

    if (leftPre.length > 0) {
      steps.push({
        state: { tree: toTreeNodes(snapshot()), preorder: [...leftPre], inorder: [...leftIn] },
        highlights: [],
        treeHighlights: [treeIdx],
        message: `Everything LEFT of ${rootVal} in inorder is its left subtree: recurse with copied slices preorder=[${leftPre.join(', ')}], inorder=[${leftIn.join(', ')}]`,
        codeLine: 7,
        action: 'visit',
      } as AlgorithmStep);
    }
    build(leftPre, leftIn, 2 * treeIdx + 1);

    if (rightPre.length > 0) {
      steps.push({
        state: { tree: toTreeNodes(snapshot()), preorder: [...rightPre], inorder: [...rightIn] },
        highlights: [],
        treeHighlights: [treeIdx],
        message: `Everything RIGHT of ${rootVal} in inorder is its right subtree: recurse with copied slices preorder=[${rightPre.join(', ')}], inorder=[${rightIn.join(', ')}]`,
        codeLine: 8,
        action: 'visit',
      } as AlgorithmStep);
    }
    build(rightPre, rightIn, 2 * treeIdx + 2);
  }

  build([...preorder], [...inorder], 0);

  const finalTree = snapshot();

  steps.push({
    state: { tree: toTreeNodes(finalTree), result: finalTree },
    highlights: [],
    message: `Tree construction complete: [${finalTree.join(', ')}] — same tree as the hashmap version, but every recursion level copied fresh subarrays`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const constructFromPreorderInorder: Algorithm = {
  id: 'construct-from-preorder-inorder',
  name: 'Construct Binary Tree from Preorder and Inorder',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Recursion — preorder root splits inorder into left/right',
  description:
    'Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.',
  problemUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
  code: {
    python: `def buildTree(preorder, inorder):
    if not preorder or not inorder:
        return None
    inorderMap = {}
    for i, val in enumerate(inorder):
        inorderMap[val] = i
    preIdx = [0]
    def build(left, right):
        if left > right:
            return None
        rootVal = preorder[preIdx[0]]
        preIdx[0] += 1
        root = TreeNode(rootVal)
        mid = inorderMap[rootVal]
        root.left = build(left, mid - 1)
        root.right = build(mid + 1, right)
        return root
    return build(0, len(inorder) - 1)`,
    javascript: `function buildTree(preorder, inorder) {
    const inorderMap = new Map();
    inorder.forEach((val, i) =>
        inorderMap.set(val, i));
    let preIdx = 0;
    function build(left, right) {
        if (left > right) return null;
        const rootVal = preorder[preIdx++];
        const root = new TreeNode(rootVal);
        const mid = inorderMap.get(rootVal);
        root.left = build(left, mid - 1);
        root.right = build(mid + 1, right);
        return root;
    }
    return build(0, inorder.length - 1);
}`,
    java: `private static int preIdx;
private static Map<Integer, Integer> inorderMap;

public static TreeNode buildTree(int[] preorder, int[] inorder) {
    preIdx = 0;
    inorderMap = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) {
        inorderMap.put(inorder[i], i);
    }
    return build(preorder, 0, inorder.length - 1);
}

private static TreeNode build(int[] preorder, int left, int right) {
    if (left > right) return null;
    int rootVal = preorder[preIdx++];
    TreeNode root = new TreeNode(rootVal);
    int mid = inorderMap.get(rootVal);
    root.left = build(preorder, left, mid - 1);
    root.right = build(preorder, mid + 1, right);
    return root;
}`,
  },
  defaultInput: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] },
  run: runConstructFromPreorderInorder,
  optimalApproachName: 'Hash Map Index Lookup',
  approaches: [
    {
      id: 'array-slicing',
      name: 'Array Slicing',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n²)',
      description:
        'The intuitive first solution: find the root in inorder by linear scan and pass physically sliced subarrays to each recursive call, instead of O(1) hashmap lookups over shared index ranges.',
      code: {
        python: `def buildTree(preorder, inorder):
    if not preorder or not inorder:
        return None
    rootVal = preorder[0]
    root = TreeNode(rootVal)
    mid = inorder.index(rootVal)
    root.left = buildTree(preorder[1:mid + 1], inorder[:mid])
    root.right = buildTree(preorder[mid + 1:], inorder[mid + 1:])
    return root`,
        javascript: `function buildTree(preorder, inorder) {
    if (preorder.length === 0) return null;
    const rootVal = preorder[0];
    const root = new TreeNode(rootVal);
    const mid = inorder.indexOf(rootVal);
    root.left = buildTree(preorder.slice(1, mid + 1), inorder.slice(0, mid));
    root.right = buildTree(preorder.slice(mid + 1), inorder.slice(mid + 1));
    return root;
}`,
        java: `public static TreeNode buildTree(int[] preorder, int[] inorder) {
    if (preorder.length == 0) return null;
    int rootVal = preorder[0];
    TreeNode root = new TreeNode(rootVal);
    int mid = 0;
    while (inorder[mid] != rootVal) mid++;
    root.left = buildTree(
        Arrays.copyOfRange(preorder, 1, mid + 1),
        Arrays.copyOfRange(inorder, 0, mid));
    root.right = buildTree(
        Arrays.copyOfRange(preorder, mid + 1, preorder.length),
        Arrays.copyOfRange(inorder, mid + 1, inorder.length));
    return root;
}`,
      },
      run: runConstructSlicing,
      lineExplanations: {
        python: {
          1: 'Define function taking preorder and inorder arrays',
          2: 'Base case: empty slice means no subtree',
          3: 'Return None for empty subtree',
          4: 'First preorder element is always the root of this slice',
          5: 'Create the tree node for this root',
          6: 'Linear scan: find root position in inorder (O(n) each call)',
          7: 'Left subtree: preorder elements after root, inorder elements before mid (copied slices)',
          8: 'Right subtree: remaining preorder and inorder elements after mid (copied slices)',
          9: 'Return constructed node',
        },
        javascript: {
          1: 'Define function taking preorder and inorder arrays',
          2: 'Base case: empty slice means no subtree',
          3: 'First preorder element is always the root of this slice',
          4: 'Create the tree node for this root',
          5: 'Linear scan: find root position in inorder (O(n) each call)',
          6: 'Left subtree: preorder elements after root, inorder elements before mid (copied slices)',
          7: 'Right subtree: remaining preorder and inorder elements after mid (copied slices)',
          8: 'Return constructed node',
        },
        java: {
          1: 'Define function taking preorder and inorder arrays',
          2: 'Base case: empty array means no subtree',
          3: 'First preorder element is always the root of this slice',
          4: 'Create the tree node for this root',
          5: 'Start scan index at 0',
          6: 'Linear scan: find root position in inorder (O(n) each call)',
          7: 'Recursively build left subtree',
          8: 'Left preorder slice: elements after root, mid of them',
          9: 'Left inorder slice: elements before mid',
          10: 'Recursively build right subtree',
          11: 'Right preorder slice: elements after the left subtree',
          12: 'Right inorder slice: elements after mid',
          13: 'Return constructed node',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking preorder and inorder arrays',
      2: 'Base case: empty arrays means no subtree',
      3: 'Return None for empty subtree',
      4: 'Build hashmap for inorder index lookup',
      5: 'Map each value to its inorder index',
      6: 'Store inorder index for each value',
      7: 'Use list to allow mutation in nested scope',
      8: 'Define recursive build with inorder range',
      9: 'Base case: invalid range means no subtree',
      10: 'Return None for empty range',
      11: 'Get root value from preorder at current index',
      12: 'Advance preorder index',
      13: 'Create tree node with root value',
      14: 'Find root position in inorder array',
      15: 'Recursively build left subtree',
      16: 'Recursively build right subtree',
      17: 'Return constructed node',
      18: 'Start building from full inorder range',
    },
    javascript: {
      1: 'Define function taking preorder and inorder arrays',
      2: 'Build hashmap for inorder index lookup',
      3: 'Map each value to its inorder index',
      4: 'Store value-to-index mapping',
      5: 'Init preorder index pointer',
      6: 'Define recursive build with inorder range',
      7: 'Base case: invalid range returns null',
      8: 'Get root value, advance preorder index',
      9: 'Create tree node with root value',
      10: 'Find root position in inorder array',
      11: 'Recursively build left subtree',
      12: 'Recursively build right subtree',
      13: 'Return constructed node',
      15: 'Start building from full inorder range',
    },
    java: {
      1: 'Declare preorder index as class field',
      2: 'Declare inorder map as class field',
      4: 'Define main build function',
      5: 'Reset preorder index to 0',
      6: 'Create hashmap for inorder index lookup',
      7: 'Map each value to its inorder index',
      8: 'Store value-to-index mapping',
      10: 'Start building from full inorder range',
      12: 'Define recursive build with inorder range',
      13: 'Base case: invalid range returns null',
      14: 'Get root value, advance preorder index',
      15: 'Create tree node with root value',
      16: 'Find root position in inorder array',
      17: 'Recursively build left subtree',
      18: 'Recursively build right subtree',
      19: 'Return constructed node',
    },
  },
};
