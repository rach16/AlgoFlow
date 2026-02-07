import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toTreeNodes(arr: (number | null)[]): { val: number | string | null; id: number }[] {
  return arr.map((v, i) => ({ val: v, id: i }));
}

function runSerializeDeserialize(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr) },
    highlights: [],
    message: 'Demonstrate serialize and deserialize of a binary tree using preorder DFS',
    codeLine: 1,
  });

  function getLeft(i: number): number { return 2 * i + 1; }
  function getRight(i: number): number { return 2 * i + 2; }

  function getVal(i: number): number | null {
    if (i >= arr.length) return null;
    return arr[i];
  }

  // ========== SERIALIZE ==========
  const serialized: string[] = [];

  steps.push({
    state: { tree: toTreeNodes(arr), serialized: [] },
    highlights: [],
    message: '--- PHASE 1: SERIALIZE using preorder DFS ---',
    codeLine: 2,
  });

  function serializeDFS(i: number): void {
    const val = getVal(i);

    if (val === null) {
      serialized.push('N');

      steps.push({
        state: { tree: toTreeNodes(arr), serialized: [...serialized] },
        highlights: [],
        message: `Null node at index ${i}: append "N". Serialized: [${serialized.join(', ')}]`,
        codeLine: 5,
      } as AlgorithmStep);

      return;
    }

    serialized.push(String(val));

    steps.push({
      state: { tree: toTreeNodes(arr), serialized: [...serialized] },
      highlights: [],
      treeHighlights: [i],
      message: `Visit node ${val}: append "${val}". Serialized: [${serialized.join(', ')}]`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    serializeDFS(getLeft(i));
    serializeDFS(getRight(i));
  }

  serializeDFS(0);

  const serializedStr = serialized.join(',');

  steps.push({
    state: { tree: toTreeNodes(arr), serialized: [...serialized], serializedStr },
    highlights: [],
    message: `Serialization complete: "${serializedStr}"`,
    codeLine: 7,
    action: 'found',
  });

  // ========== DESERIALIZE ==========
  steps.push({
    state: { tree: toTreeNodes([]), serialized: [...serialized], serializedStr },
    highlights: [],
    message: '--- PHASE 2: DESERIALIZE from the serialized string ---',
    codeLine: 9,
  });

  const tokens = serialized.slice();
  let tokenIdx = 0;
  const rebuilt: (number | null)[] = new Array(64).fill(null);

  function deserializeDFS(treeIdx: number): void {
    if (tokenIdx >= tokens.length) return;

    const token = tokens[tokenIdx];
    tokenIdx++;

    if (token === 'N') {
      steps.push({
        state: { tree: toTreeNodes(trimTree(rebuilt)), serialized: [...tokens], tokenIdx },
        highlights: [tokenIdx - 1],
        message: `Token "${token}" is null, skip position ${treeIdx}`,
        codeLine: 12,
      } as AlgorithmStep);
      return;
    }

    const val = parseInt(token);
    rebuilt[treeIdx] = val;

    steps.push({
      state: { tree: toTreeNodes(trimTree(rebuilt)), serialized: [...tokens], tokenIdx },
      highlights: [tokenIdx - 1],
      treeHighlights: [treeIdx],
      message: `Token "${token}": place node ${val} at position ${treeIdx}`,
      codeLine: 11,
      action: 'insert',
    } as AlgorithmStep);

    deserializeDFS(2 * treeIdx + 1);
    deserializeDFS(2 * treeIdx + 2);
  }

  function trimTree(t: (number | null)[]): (number | null)[] {
    let last = 0;
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i] !== null) { last = i; break; }
    }
    return t.slice(0, last + 1);
  }

  deserializeDFS(0);

  const finalTree = trimTree(rebuilt);

  steps.push({
    state: { tree: toTreeNodes(finalTree), result: finalTree },
    highlights: [],
    message: `Deserialization complete! Rebuilt tree: [${finalTree.join(', ')}]`,
    codeLine: 15,
    action: 'found',
  });

  // Verify
  const matches = JSON.stringify(arr) === JSON.stringify(finalTree);

  steps.push({
    state: { tree: toTreeNodes(finalTree), original: arr, result: finalTree, matches },
    highlights: [],
    message: matches
      ? 'Verification: Original and deserialized trees MATCH!'
      : `Verification: Trees differ. Original: [${arr.join(', ')}], Rebuilt: [${finalTree.join(', ')}]`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const serializeDeserialize: Algorithm = {
  id: 'serialize-deserialize',
  name: 'Serialize and Deserialize Binary Tree',
  category: 'Trees',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Preorder DFS — use null markers for missing children',
  description:
    'Design an algorithm to serialize and deserialize a binary tree. Serialization is converting a tree to a string, and deserialization is reconstructing the tree from the string.',
  problemUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
  code: {
    python: `class Codec:
    def serialize(self, root):
        res = []
        def dfs(node):
            if not node:
                res.append("N")
                return
            res.append(str(node.val))
            dfs(node.left)
            dfs(node.right)
        dfs(root)
        return ",".join(res)

    def deserialize(self, data):
        vals = data.split(",")
        self.i = 0
        def dfs():
            if vals[self.i] == "N":
                self.i += 1
                return None
            node = TreeNode(int(vals[self.i]))
            self.i += 1
            node.left = dfs()
            node.right = dfs()
            return node
        return dfs()`,
    javascript: `class Codec {
    serialize(root) {
        const res = [];
        function dfs(node) {
            if (!node) { res.push("N"); return; }
            res.push(String(node.val));
            dfs(node.left);
            dfs(node.right);
        }
        dfs(root);
        return res.join(",");
    }

    deserialize(data) {
        const vals = data.split(",");
        let i = 0;
        function dfs() {
            if (vals[i] === "N") { i++; return null; }
            const node = new TreeNode(parseInt(vals[i++]));
            node.left = dfs();
            node.right = dfs();
            return node;
        }
        return dfs();
    }
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [1, 2, 3, null, null, 4, 5],
  run: runSerializeDeserialize,
};
