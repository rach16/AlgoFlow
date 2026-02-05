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
  },
  defaultInput: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] },
  run: runConstructFromPreorderInorder,
};
