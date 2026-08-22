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

function runSerializeDeserializeBFS(input: unknown): AlgorithmStep[] {
  const arr = input as (number | null)[];
  const steps: AlgorithmStep[] = [];

  function getVal(a: (number | null)[], i: number): number | null {
    if (i >= a.length) return null;
    return a[i];
  }

  function trimTree(t: (number | null)[]): (number | null)[] {
    let last = 0;
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i] !== null) { last = i; break; }
    }
    return t.slice(0, last + 1);
  }

  steps.push({
    state: { tree: toTreeNodes(arr) },
    highlights: [],
    message: 'BFS codec: instead of preorder DFS, serialize the tree level by level with a queue — the same order LeetCode uses to display trees',
    codeLine: 1,
  });

  if (getVal(arr, 0) === null) {
    steps.push({
      state: { tree: toTreeNodes(arr), serializedStr: '', result: [] },
      highlights: [],
      message: 'Empty tree serializes to an empty string',
      codeLine: 4,
    });
    return steps;
  }

  // ========== SERIALIZE (BFS) ==========
  steps.push({
    state: { tree: toTreeNodes(arr), serialized: [] },
    highlights: [],
    message: '--- PHASE 1: SERIALIZE using BFS (level order) ---',
    codeLine: 6,
    action: 'push',
  });

  const serialized: string[] = [];
  const queue: (number | null)[] = [0]; // indices into arr, null = explicit null child
  let head = 0;

  while (head < queue.length) {
    const idx = queue[head++];
    const val = idx === null ? null : getVal(arr, idx);

    if (val !== null && idx !== null) {
      serialized.push(String(val));
      queue.push(2 * idx + 1 < arr.length && arr[2 * idx + 1] !== null ? 2 * idx + 1 : null);
      queue.push(2 * idx + 2 < arr.length && arr[2 * idx + 2] !== null ? 2 * idx + 2 : null);

      steps.push({
        state: { tree: toTreeNodes(arr), serialized: [...serialized] },
        highlights: [],
        treeHighlights: [idx],
        message: `Dequeue node ${val}: append "${val}" and enqueue BOTH its children (even null ones). Serialized: [${serialized.join(', ')}]`,
        codeLine: 10,
        action: 'visit',
      } as AlgorithmStep);
    } else {
      serialized.push('N');

      steps.push({
        state: { tree: toTreeNodes(arr), serialized: [...serialized] },
        highlights: [],
        message: `Dequeue a null: append "N" — null markers keep every parent's two child slots aligned. Serialized: [${serialized.join(', ')}]`,
        codeLine: 14,
      } as AlgorithmStep);
    }
  }

  const serializedStr = serialized.join(',');

  steps.push({
    state: { tree: toTreeNodes(arr), serialized: [...serialized], serializedStr },
    highlights: [],
    message: `Serialization complete: "${serializedStr}"`,
    codeLine: 15,
    action: 'found',
  });

  // ========== DESERIALIZE (BFS) ==========
  steps.push({
    state: { tree: toTreeNodes([]), serialized: [...serialized], serializedStr },
    highlights: [],
    message: '--- PHASE 2: DESERIALIZE — rebuild level by level, consuming two tokens (left, right) per dequeued parent ---',
    codeLine: 17,
  });

  const tokens = serialized.slice();
  const rebuilt: (number | null)[] = new Array(Math.max(arr.length, 1) * 2 + 2).fill(null);
  rebuilt[0] = parseInt(tokens[0]);

  steps.push({
    state: { tree: toTreeNodes(trimTree(rebuilt)), serialized: [...tokens], tokenIdx: 1 },
    highlights: [0],
    treeHighlights: [0],
    message: `The first token "${tokens[0]}" is always the root — place it and enqueue it as the first parent`,
    codeLine: 21,
    action: 'insert',
  } as AlgorithmStep);

  const buildQueue: number[] = [0]; // tree positions of real nodes awaiting children
  let bHead = 0;
  let ti = 1;

  while (bHead < buildQueue.length && ti < tokens.length) {
    const pos = buildQueue[bHead++];
    const parentVal = rebuilt[pos];

    // left child
    if (tokens[ti] !== 'N') {
      const leftPos = 2 * pos + 1;
      rebuilt[leftPos] = parseInt(tokens[ti]);
      buildQueue.push(leftPos);

      steps.push({
        state: { tree: toTreeNodes(trimTree(rebuilt)), serialized: [...tokens], tokenIdx: ti },
        highlights: [ti],
        treeHighlights: [leftPos],
        treeSecondary: [pos],
        message: `Token "${tokens[ti]}" becomes the LEFT child of ${parentVal}`,
        codeLine: 27,
        action: 'insert',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: { tree: toTreeNodes(trimTree(rebuilt)), serialized: [...tokens], tokenIdx: ti },
        highlights: [ti],
        treeSecondary: [pos],
        message: `Token "N": node ${parentVal} has no left child`,
        codeLine: 26,
      } as AlgorithmStep);
    }
    ti++;

    // right child
    if (ti < tokens.length) {
      if (tokens[ti] !== 'N') {
        const rightPos = 2 * pos + 2;
        rebuilt[rightPos] = parseInt(tokens[ti]);
        buildQueue.push(rightPos);

        steps.push({
          state: { tree: toTreeNodes(trimTree(rebuilt)), serialized: [...tokens], tokenIdx: ti },
          highlights: [ti],
          treeHighlights: [rightPos],
          treeSecondary: [pos],
          message: `Token "${tokens[ti]}" becomes the RIGHT child of ${parentVal}`,
          codeLine: 31,
          action: 'insert',
        } as AlgorithmStep);
      } else {
        steps.push({
          state: { tree: toTreeNodes(trimTree(rebuilt)), serialized: [...tokens], tokenIdx: ti },
          highlights: [ti],
          treeSecondary: [pos],
          message: `Token "N": node ${parentVal} has no right child`,
          codeLine: 30,
        } as AlgorithmStep);
      }
      ti++;
    }
  }

  const finalTree = trimTree(rebuilt);

  steps.push({
    state: { tree: toTreeNodes(finalTree), result: finalTree },
    highlights: [],
    message: `Deserialization complete! Rebuilt tree: [${finalTree.join(', ')}]`,
    codeLine: 34,
    action: 'found',
  });

  const matches = JSON.stringify(arr) === JSON.stringify(finalTree);

  steps.push({
    state: { tree: toTreeNodes(finalTree), original: arr, result: finalTree, matches },
    highlights: [],
    message: matches
      ? 'Verification: Original and deserialized trees MATCH!'
      : `Verification: Trees differ. Original: [${arr.join(', ')}], Rebuilt: [${finalTree.join(', ')}]`,
    codeLine: 34,
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
  optimalApproachName: 'Preorder DFS',
  approaches: [
    {
      id: 'bfs-level-order',
      name: 'BFS Level Order',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Serializes level by level with a queue instead of preorder DFS — the format mirrors how LeetCode displays trees, and deserialization rebuilds parents before children with the same queue discipline.',
      code: {
        python: `from collections import deque

class Codec:
    def serialize(self, root):
        if not root:
            return ""
        res = []
        queue = deque([root])
        while queue:
            node = queue.popleft()
            if node:
                res.append(str(node.val))
                queue.append(node.left)
                queue.append(node.right)
            else:
                res.append("N")
        return ",".join(res)

    def deserialize(self, data):
        if not data:
            return None
        vals = data.split(",")
        root = TreeNode(int(vals[0]))
        queue = deque([root])
        i = 1
        while queue:
            node = queue.popleft()
            if vals[i] != "N":
                node.left = TreeNode(int(vals[i]))
                queue.append(node.left)
            i += 1
            if vals[i] != "N":
                node.right = TreeNode(int(vals[i]))
                queue.append(node.right)
            i += 1
        return root`,
        javascript: `class Codec {
    serialize(root) {
        if (!root) return "";
        const res = [];
        const queue = [root];
        while (queue.length > 0) {
            const node = queue.shift();
            if (node) {
                res.push(String(node.val));
                queue.push(node.left);
                queue.push(node.right);
            } else {
                res.push("N");
            }
        }
        return res.join(",");
    }

    deserialize(data) {
        if (!data) return null;
        const vals = data.split(",");
        const root = new TreeNode(parseInt(vals[0]));
        const queue = [root];
        let i = 1;
        while (queue.length > 0) {
            const node = queue.shift();
            if (vals[i] !== "N") {
                node.left = new TreeNode(parseInt(vals[i]));
                queue.push(node.left);
            }
            i++;
            if (vals[i] !== "N") {
                node.right = new TreeNode(parseInt(vals[i]));
                queue.push(node.right);
            }
            i++;
        }
        return root;
    }
}`,
        java: `public class Codec {
    public String serialize(TreeNode root) {
        if (root == null) return "";
        List<String> res = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node != null) {
                res.add(String.valueOf(node.val));
                queue.offer(node.left);
                queue.offer(node.right);
            } else {
                res.add("N");
            }
        }
        return String.join(",", res);
    }

    public TreeNode deserialize(String data) {
        if (data.isEmpty()) return null;
        String[] vals = data.split(",");
        TreeNode root = new TreeNode(Integer.parseInt(vals[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = 1;
        while (!queue.isEmpty() && i < vals.length) {
            TreeNode node = queue.poll();
            if (!vals[i].equals("N")) {
                node.left = new TreeNode(Integer.parseInt(vals[i]));
                queue.offer(node.left);
            }
            i++;
            if (!vals[i].equals("N")) {
                node.right = new TreeNode(Integer.parseInt(vals[i]));
                queue.offer(node.right);
            }
            i++;
        }
        return root;
    }
}`,
      },
      run: runSerializeDeserializeBFS,
      lineExplanations: {
        python: {
          1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Codec class holding both directions',
          4: 'Serialize: tree -> string',
          5: 'Empty tree edge case',
          6: 'Represent it as an empty string',
          7: 'Collected tokens',
          8: 'BFS queue seeded with the root',
          9: 'Process until every node (and null slot) is emitted',
          10: 'Take the next node in level order',
          11: 'Real node?',
          12: 'Emit its value',
          13: 'Enqueue its left child — even if null',
          14: 'Enqueue its right child — even if null',
          15: 'Null slot dequeued',
          16: 'Emit "N" so child positions stay aligned',
          17: 'Join tokens into the final string',
          19: 'Deserialize: string -> tree',
          20: 'Empty string edge case',
          21: 'Empty string means empty tree',
          22: 'Split back into tokens',
          23: 'First token is always the root',
          24: 'Queue of parents still waiting for their children',
          25: 'Token pointer starts after the root',
          26: 'Each parent consumes exactly two tokens',
          27: 'Next parent in level order',
          28: 'Non-"N" token: build the left child',
          29: 'Attach it and let it become a parent later',
          30: 'It will get its own children from later tokens',
          31: 'Move past the left token either way',
          32: 'Non-"N" token: build the right child',
          33: 'Attach it and let it become a parent later',
          34: 'It will get its own children from later tokens',
          35: 'Move past the right token either way',
          36: 'Root of the fully rebuilt tree',
        },
        javascript: {
          1: 'Codec class holding both directions',
          2: 'Serialize: tree -> string',
          3: 'Empty tree becomes an empty string',
          4: 'Collected tokens',
          5: 'BFS queue seeded with the root',
          6: 'Process until every node (and null slot) is emitted',
          7: 'Take the next node in level order',
          8: 'Real node?',
          9: 'Emit its value',
          10: 'Enqueue its left child — even if null',
          11: 'Enqueue its right child — even if null',
          13: 'Emit "N" so child positions stay aligned',
          16: 'Join tokens into the final string',
          19: 'Deserialize: string -> tree',
          20: 'Empty string means empty tree',
          21: 'Split back into tokens',
          22: 'First token is always the root',
          23: 'Queue of parents still waiting for their children',
          24: 'Token pointer starts after the root',
          25: 'Each parent consumes exactly two tokens',
          26: 'Next parent in level order',
          27: 'Non-"N" token: build the left child',
          28: 'Attach it and let it become a parent later',
          31: 'Move past the left token either way',
          32: 'Non-"N" token: build the right child',
          33: 'Attach it and let it become a parent later',
          36: 'Move past the right token either way',
          38: 'Root of the fully rebuilt tree',
        },
        java: {
          1: 'Codec class holding both directions',
          2: 'Serialize: tree -> string',
          3: 'Empty tree becomes an empty string',
          4: 'Collected tokens',
          5: 'BFS queue for level-order traversal',
          6: 'Seed with the root',
          7: 'Process until every node (and null slot) is emitted',
          8: 'Take the next node in level order',
          9: 'Real node?',
          10: 'Emit its value',
          11: 'Enqueue its left child — even if null',
          12: 'Enqueue its right child — even if null',
          14: 'Emit "N" so child positions stay aligned',
          17: 'Join tokens into the final string',
          20: 'Deserialize: string -> tree',
          21: 'Empty string means empty tree',
          22: 'Split back into tokens',
          23: 'First token is always the root',
          24: 'Queue of parents still waiting for their children',
          25: 'Seed with the root',
          26: 'Token pointer starts after the root',
          27: 'Each parent consumes exactly two tokens',
          28: 'Next parent in level order',
          29: 'Non-"N" token: build the left child',
          30: 'Attach it and let it become a parent later',
          31: 'It will get its own children from later tokens',
          33: 'Move past the left token either way',
          34: 'Non-"N" token: build the right child',
          35: 'Attach it and let it become a parent later',
          36: 'It will get its own children from later tokens',
          38: 'Move past the right token either way',
          40: 'Root of the fully rebuilt tree',
        },
      },
    },
  ],
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
