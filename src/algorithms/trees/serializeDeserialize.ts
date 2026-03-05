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
    java: `public class Codec {
    public String serialize(TreeNode root) {
        List<String> res = new ArrayList<>();
        serializeDFS(root, res);
        return String.join(",", res);
    }

    private void serializeDFS(TreeNode node, List<String> res) {
        if (node == null) {
            res.add("N");
            return;
        }
        res.add(String.valueOf(node.val));
        serializeDFS(node.left, res);
        serializeDFS(node.right, res);
    }

    public TreeNode deserialize(String data) {
        String[] vals = data.split(",");
        int[] i = {0};
        return deserializeDFS(vals, i);
    }

    private TreeNode deserializeDFS(String[] vals, int[] i) {
        if (vals[i[0]].equals("N")) {
            i[0]++;
            return null;
        }
        TreeNode node = new TreeNode(Integer.parseInt(vals[i[0]++]));
        node.left = deserializeDFS(vals, i);
        node.right = deserializeDFS(vals, i);
        return node;
    }
}`,
  },
  defaultInput: [1, 2, 3, null, null, 4, 5],
  run: runSerializeDeserialize,
  lineExplanations: {
    python: {
      1: 'Define Codec class for serialize/deserialize',
      2: 'Define serialize method taking root',
      3: 'Init result list for serialized values',
      4: 'Define DFS helper for preorder traversal',
      5: 'Base case: null node',
      6: 'Append "N" as null marker',
      7: 'Return after marking null',
      8: 'Append node value as string',
      9: 'Recurse into left subtree',
      10: 'Recurse into right subtree',
      11: 'Start DFS from root',
      12: 'Join values with commas and return',
      14: 'Define deserialize method taking data string',
      15: 'Split string into token array',
      16: 'Init index pointer for tokens',
      17: 'Define DFS helper to rebuild tree',
      18: 'Check if current token is null marker',
      19: 'Advance index past null marker',
      20: 'Return None for null node',
      21: 'Create node from current token value',
      22: 'Advance index past this token',
      23: 'Recursively build left subtree',
      24: 'Recursively build right subtree',
      25: 'Return constructed node',
      26: 'Start DFS to rebuild tree',
    },
    javascript: {
      1: 'Define Codec class for serialize/deserialize',
      2: 'Define serialize method taking root',
      3: 'Init result array for serialized values',
      4: 'Define DFS helper for preorder traversal',
      5: 'Null node: push "N" and return',
      6: 'Append node value as string',
      7: 'Recurse into left subtree',
      8: 'Recurse into right subtree',
      10: 'Start DFS from root',
      11: 'Join values with commas and return',
      14: 'Define deserialize method taking data string',
      15: 'Split string into token array',
      16: 'Init index pointer for tokens',
      17: 'Define DFS helper to rebuild tree',
      18: 'Null marker: advance index, return null',
      19: 'Create node from current token, advance index',
      20: 'Recursively build left subtree',
      21: 'Recursively build right subtree',
      22: 'Return constructed node',
      24: 'Start DFS to rebuild tree',
    },
    java: {
      1: 'Define Codec class for serialize/deserialize',
      2: 'Define serialize method taking root',
      3: 'Init list for serialized values',
      4: 'Start DFS serialization from root',
      5: 'Join values with commas and return',
      8: 'Define DFS helper for serialization',
      9: 'Base case: null node',
      10: 'Append "N" as null marker',
      11: 'Return after marking null',
      13: 'Append node value as string',
      14: 'Recurse into left subtree',
      15: 'Recurse into right subtree',
      18: 'Define deserialize method taking data string',
      19: 'Split string into token array',
      20: 'Init index pointer as array for mutation',
      21: 'Start DFS to rebuild tree',
      24: 'Define DFS helper for deserialization',
      25: 'Check if current token is null marker',
      26: 'Advance index past null marker',
      27: 'Return null for null node',
      29: 'Create node from current token, advance index',
      30: 'Recursively build left subtree',
      31: 'Recursively build right subtree',
      32: 'Return constructed node',
    },
  },
};
