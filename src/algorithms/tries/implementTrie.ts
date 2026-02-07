import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type TrieOp = [string, string];

interface TrieNode {
  children: Record<string, TrieNode>;
  isEnd: boolean;
}

function trieToTree(root: TrieNode): { val: number | string | null; id: number }[] {
  // BFS level-order traversal of trie for tree visualization
  const result: { val: number | string | null; id: number }[] = [];
  let id = 0;
  const queue: { node: TrieNode; label: string }[] = [{ node: root, label: 'root' }];

  while (queue.length > 0) {
    const { node, label } = queue.shift()!;
    result.push({ val: node.isEnd ? `${label}*` : label, id: id++ });
    const childKeys = Object.keys(node.children).sort();
    for (const key of childKeys) {
      queue.push({ node: node.children[key], label: key });
    }
  }

  return result;
}

function getChildrenMap(node: TrieNode): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of Object.keys(node.children).sort()) {
    map[key] = node.children[key].isEnd ? 'end' : 'node';
  }
  return map;
}

function runImplementTrie(input: unknown): AlgorithmStep[] {
  const operations = input as TrieOp[];
  const steps: AlgorithmStep[] = [];

  const root: TrieNode = { children: {}, isEnd: false };

  steps.push({
    state: {
      tree: [{ val: 'root', id: 0 }],
      hashMap: {},
      chars: operations.map((op) => `${op[0]}("${op[1]}")`),
    },
    highlights: [],
    message: 'Initialize empty Trie with root node',
    codeLine: 1,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, word] = operations[i];

    steps.push({
      state: {
        tree: trieToTree(root),
        hashMap: getChildrenMap(root),
        chars: operations.map((o) => `${o[0]}("${o[1]}")`),
      },
      highlights: [i],
      pointers: { op: i },
      message: `Operation: ${op}("${word}")`,
      codeLine: 4,
      action: 'visit',
    });

    if (op === 'insert') {
      let node = root;
      for (let j = 0; j < word.length; j++) {
        const ch = word[j];
        if (!node.children[ch]) {
          node.children[ch] = { children: {}, isEnd: false };

          steps.push({
            state: {
              tree: trieToTree(root),
              hashMap: getChildrenMap(node),
              chars: operations.map((o) => `${o[0]}("${o[1]}")`),
            },
            highlights: [i],
            message: `Insert: Create new node for '${ch}' (char ${j + 1}/${word.length} of "${word}")`,
            codeLine: 7,
            action: 'insert',
          });
        } else {
          steps.push({
            state: {
              tree: trieToTree(root),
              hashMap: getChildrenMap(node),
              chars: operations.map((o) => `${o[0]}("${o[1]}")`),
            },
            highlights: [i],
            message: `Insert: Node '${ch}' already exists, traverse down (char ${j + 1}/${word.length} of "${word}")`,
            codeLine: 6,
            action: 'visit',
          });
        }
        node = node.children[ch];
      }
      node.isEnd = true;

      steps.push({
        state: {
          tree: trieToTree(root),
          hashMap: getChildrenMap(node),
          chars: operations.map((o) => `${o[0]}("${o[1]}")`),
        },
        highlights: [i],
        message: `Insert: Mark end of word "${word}"`,
        codeLine: 8,
        action: 'found',
      });
    } else if (op === 'search') {
      let node: TrieNode | null = root;
      let found = true;
      for (let j = 0; j < word.length; j++) {
        const ch = word[j];
        if (!node!.children[ch]) {
          steps.push({
            state: {
              tree: trieToTree(root),
              hashMap: getChildrenMap(node!),
              chars: operations.map((o) => `${o[0]}("${o[1]}")`),
              result: false,
            },
            highlights: [i],
            message: `Search: '${ch}' not found in children — "${word}" does NOT exist`,
            codeLine: 11,
            action: 'compare',
          });
          found = false;
          break;
        }
        steps.push({
          state: {
            tree: trieToTree(root),
            hashMap: getChildrenMap(node!),
            chars: operations.map((o) => `${o[0]}("${o[1]}")`),
          },
          highlights: [i],
          message: `Search: Found '${ch}', move to next (char ${j + 1}/${word.length} of "${word}")`,
          codeLine: 10,
          action: 'visit',
        });
        node = node!.children[ch];
      }

      if (found) {
        const result = node!.isEnd;
        steps.push({
          state: {
            tree: trieToTree(root),
            hashMap: getChildrenMap(node!),
            chars: operations.map((o) => `${o[0]}("${o[1]}")`),
            result,
          },
          highlights: [i],
          message: result
            ? `Search: End of word reached and isEnd=true — "${word}" EXISTS`
            : `Search: End of word reached but isEnd=false — "${word}" is only a prefix, NOT a complete word`,
          codeLine: 12,
          action: result ? 'found' : 'compare',
        });
      }
    } else if (op === 'startsWith') {
      let node: TrieNode | null = root;
      let found = true;
      for (let j = 0; j < word.length; j++) {
        const ch = word[j];
        if (!node!.children[ch]) {
          steps.push({
            state: {
              tree: trieToTree(root),
              hashMap: getChildrenMap(node!),
              chars: operations.map((o) => `${o[0]}("${o[1]}")`),
              result: false,
            },
            highlights: [i],
            message: `StartsWith: '${ch}' not found — no word starts with "${word}"`,
            codeLine: 15,
            action: 'compare',
          });
          found = false;
          break;
        }
        steps.push({
          state: {
            tree: trieToTree(root),
            hashMap: getChildrenMap(node!),
            chars: operations.map((o) => `${o[0]}("${o[1]}")`),
          },
          highlights: [i],
          message: `StartsWith: Found '${ch}' (char ${j + 1}/${word.length} of "${word}")`,
          codeLine: 14,
          action: 'visit',
        });
        node = node!.children[ch];
      }

      if (found) {
        steps.push({
          state: {
            tree: trieToTree(root),
            hashMap: getChildrenMap(node!),
            chars: operations.map((o) => `${o[0]}("${o[1]}")`),
            result: true,
          },
          highlights: [i],
          message: `StartsWith: All characters found — a word with prefix "${word}" EXISTS`,
          codeLine: 16,
          action: 'found',
        });
      }
    }
  }

  steps.push({
    state: {
      tree: trieToTree(root),
      hashMap: getChildrenMap(root),
      chars: operations.map((o) => `${o[0]}("${o[1]}")`),
    },
    highlights: [],
    message: 'All operations complete',
    codeLine: 16,
  });

  return steps;
}

export const implementTrie: Algorithm = {
  id: 'implement-trie',
  name: 'Implement Trie (Prefix Tree)',
  category: 'Tries',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Trie — character-by-character prefix tree',
  description:
    'A trie (prefix tree) is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class with insert, search, and startsWith methods.',
  problemUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
  code: {
    python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.isEnd = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.isEnd = True

    def search(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                return False
            node = node.children[c]
        return node.isEnd

    def startsWith(self, prefix):
        node = self.root
        for c in prefix:
            if c not in node.children:
                return False
            node = node.children[c]
        return True`,
    javascript: `class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const c of word) {
            if (!node.children[c]) {
                node.children[c] = new TrieNode();
            }
            node = node.children[c];
        }
        node.isEnd = true;
    }

    search(word) {
        let node = this.root;
        for (const c of word) {
            if (!node.children[c]) return false;
            node = node.children[c];
        }
        return node.isEnd;
    }

    startsWith(prefix) {
        let node = this.root;
        for (const c of prefix) {
            if (!node.children[c]) return false;
            node = node.children[c];
        }
        return true;
    }
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [
    ['insert', 'apple'],
    ['search', 'apple'],
    ['search', 'app'],
    ['startsWith', 'app'],
    ['insert', 'app'],
    ['search', 'app'],
  ],
  run: runImplementTrie,
};
