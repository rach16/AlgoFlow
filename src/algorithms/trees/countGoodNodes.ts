import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runCountGoodNodes(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];
  let goodCount = 0;
  const goodNodes: number[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), goodCount: 0, goodNodes: [] },
    highlights: [],
    message: 'Count good nodes: a node is "good" if no node on the path from root has a greater value',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  function dfs(i: number, maxSoFar: number): void {
    const val = getVal(i);
    if (val === null) return;

    steps.push({
      state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar },
      highlights: [],
      treeHighlights: [i],
      treeSecondary: [...goodNodes],
      message: `Visit node ${val}, max value on path so far = ${maxSoFar}`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    if (val >= maxSoFar) {
      goodCount++;
      goodNodes.push(i);

      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar },
        highlights: [],
        treeHighlights: [i],
        treeSecondary: goodNodes.filter(x => x !== i),
        message: `Node ${val} >= ${maxSoFar}: it's a GOOD node! Total good: ${goodCount}`,
        codeLine: 6,
        action: 'found',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(arr), goodCount, goodNodes: [...goodNodes], maxSoFar },
        highlights: [],
        treeHighlights: [i],
        message: `Node ${val} < ${maxSoFar}: NOT a good node`,
        codeLine: 7,
        action: 'compare',
      } as AlgorithmStep);
    }

    const newMax = Math.max(maxSoFar, val);
    dfs(getLeft(i), newMax);
    dfs(getRight(i), newMax);
  }

  if (getVal(0) !== null) {
    dfs(0, arr[0]! as number);
  }

  steps.push({
    state: { tree: toTreeNodes(arr), goodCount, goodNodes, result: goodCount },
    highlights: [],
    treeHighlights: goodNodes,
    message: `Total good nodes: ${goodCount}`,
    codeLine: 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const countGoodNodes: Algorithm = {
  id: 'count-good-nodes',
  name: 'Count Good Nodes in Binary Tree',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
  pattern: 'DFS — pass max value seen on path from root',
  description:
    'Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X. Return the number of good nodes in the binary tree.',
  problemUrl: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/',
  code: {
    python: `def goodNodes(root):
    def dfs(node, maxVal):
        if not node:
            return 0
        count = 1 if node.val >= maxVal else 0
        maxVal = max(maxVal, node.val)
        count += dfs(node.left, maxVal)
        count += dfs(node.right, maxVal)
        return count

    return dfs(root, root.val)`,
    javascript: `function goodNodes(root) {
    function dfs(node, maxVal) {
        if (!node) return 0;
        let count = node.val >= maxVal ? 1 : 0;
        maxVal = Math.max(maxVal, node.val);
        count += dfs(node.left, maxVal);
        count += dfs(node.right, maxVal);
        return count;
    }

    return dfs(root, root.val);
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [3, 1, 4, 3, null, 1, 5],
  run: runCountGoodNodes,
};
