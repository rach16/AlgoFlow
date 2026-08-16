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

function runImplementTrieHashSets(input: unknown): AlgorithmStep[] {
  const operations = input as TrieOp[];
  const steps: AlgorithmStep[] = [];

  const words = new Set<string>();
  const prefixes = new Set<string>();
  const opLabels = operations.map((op) => `${op[0]}("${op[1]}")`);
  const setsView = (): Record<string, string> => ({
    words: [...words].join(', ') || '(empty)',
    prefixes: [...prefixes].join(', ') || '(empty)',
  });

  steps.push({
    state: { hashMap: setsView(), chars: [...opLabels] },
    highlights: [],
    message:
      'No tree needed! Keep two hash sets: one holding complete words (for search) and one holding every prefix of every word (for startsWith).',
    codeLine: 3,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, word] = operations[i];

    if (op === 'insert') {
      words.add(word);
      steps.push({
        state: { hashMap: setsView(), chars: [...opLabels] },
        highlights: [i],
        pointers: { op: i },
        message: `insert("${word}"): add the full word to the words set — search("${word}") is now an O(1) average lookup`,
        codeLine: 7,
        action: 'insert',
      });

      for (let j = 1; j <= word.length; j++) {
        const prefix = word.slice(0, j);
        const isNew = !prefixes.has(prefix);
        prefixes.add(prefix);
        steps.push({
          state: { hashMap: setsView(), chars: [...opLabels] },
          highlights: [i],
          pointers: { op: i },
          message: isNew
            ? `insert: record prefix "${prefix}" (${j}/${word.length}) so startsWith("${prefix}") answers in O(1)`
            : `insert: prefix "${prefix}" is already in the set (shared with an earlier word) — sets deduplicate for free`,
          codeLine: 9,
          action: 'insert',
        });
      }
    } else if (op === 'search') {
      const found = words.has(word);
      steps.push({
        state: { hashMap: setsView(), chars: [...opLabels], result: found },
        highlights: [i],
        pointers: { op: i },
        message: found
          ? `search("${word}"): "${word}" is in the words set — EXISTS. One hash lookup instead of walking ${word.length} trie nodes.`
          : `search("${word}"): "${word}" is NOT in the words set — it was never inserted as a complete word (being a prefix is not enough)`,
        codeLine: 12,
        action: found ? 'found' : 'compare',
      });
    } else if (op === 'startsWith') {
      const found = prefixes.has(word);
      steps.push({
        state: { hashMap: setsView(), chars: [...opLabels], result: found },
        highlights: [i],
        pointers: { op: i },
        message: found
          ? `startsWith("${word}"): "${word}" is in the prefixes set — some inserted word starts with it`
          : `startsWith("${word}"): "${word}" is NOT in the prefixes set — no inserted word starts with it`,
        codeLine: 15,
        action: found ? 'found' : 'compare',
      });
    }
  }

  steps.push({
    state: { hashMap: setsView(), chars: [...opLabels] },
    highlights: [],
    message:
      'All operations complete. Trade-off vs the trie: O(1) queries, but insert stores L prefixes (O(L²) character work) and shared prefixes are not compressed.',
    codeLine: 15,
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
    java: `class TrieNode {
    Map<Character, TrieNode> children;
    boolean isEnd;

    TrieNode() {
        children = new HashMap<>();
        isEnd = false;
    }
}

class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            if (!node.children.containsKey(c)) return false;
            node = node.children.get(c);
        }
        return node.isEnd;
    }

    public boolean startsWith(String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            if (!node.children.containsKey(c)) return false;
            node = node.children.get(c);
        }
        return true;
    }
}`,
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
  optimalApproachName: 'Trie (Prefix Tree)',
  approaches: [
    {
      id: 'prefix-hash-sets',
      name: 'Two Hash Sets',
      timeComplexity: 'O(L²) insert, O(1) lookup',
      spaceComplexity: 'O(N·L²)',
      description:
        'Instead of a character tree, store every complete word in one hash set and every prefix of every word in another — queries become single O(1) set lookups at the cost of heavier inserts and no prefix sharing.',
      code: {
        python: `class Trie:
    def __init__(self):
        self.words = set()
        self.prefixes = set()

    def insert(self, word):
        self.words.add(word)
        for i in range(1, len(word) + 1):
            self.prefixes.add(word[:i])

    def search(self, word):
        return word in self.words

    def startsWith(self, prefix):
        return prefix in self.prefixes`,
        javascript: `class Trie {
    constructor() {
        this.words = new Set();
        this.prefixes = new Set();
    }

    insert(word) {
        this.words.add(word);
        for (let i = 1; i <= word.length; i++) {
            this.prefixes.add(word.slice(0, i));
        }
    }

    search(word) {
        return this.words.has(word);
    }

    startsWith(prefix) {
        return this.prefixes.has(prefix);
    }
}`,
        java: `class Trie {
    private Set<String> words;
    private Set<String> prefixes;

    public Trie() {
        words = new HashSet<>();
        prefixes = new HashSet<>();
    }

    public void insert(String word) {
        words.add(word);
        for (int i = 1; i <= word.length(); i++) {
            prefixes.add(word.substring(0, i));
        }
    }

    public boolean search(String word) {
        return words.contains(word);
    }

    public boolean startsWith(String prefix) {
        return prefixes.contains(prefix);
    }
}`,
      },
      run: runImplementTrieHashSets,
      lineExplanations: {
        python: {
          1: 'Define Trie class (no TrieNode needed)',
          2: 'Initialize constructor',
          3: 'Hash set of complete words — powers search()',
          4: 'Hash set of every prefix — powers startsWith()',
          6: 'Define insert method',
          7: 'Add the full word to the words set',
          8: 'Loop over every prefix length from 1 to len(word)',
          9: 'Add each prefix word[:i] to the prefixes set',
          11: 'Define search method',
          12: 'Word exists iff it is in the words set — O(1) average',
          14: 'Define startsWith method',
          15: 'Prefix exists iff some insert recorded it — O(1) average',
        },
        javascript: {
          1: 'Define Trie class (no TrieNode needed)',
          2: 'Initialize constructor',
          3: 'Hash set of complete words — powers search()',
          4: 'Hash set of every prefix — powers startsWith()',
          7: 'Define insert method',
          8: 'Add the full word to the words set',
          9: 'Loop over every prefix length from 1 to word.length',
          10: 'Add each prefix slice to the prefixes set',
          14: 'Define search method',
          15: 'Word exists iff it is in the words set — O(1) average',
          18: 'Define startsWith method',
          19: 'Prefix exists iff some insert recorded it — O(1) average',
        },
        java: {
          1: 'Define Trie class (no TrieNode needed)',
          2: 'Declare set of complete words — powers search()',
          3: 'Declare set of every prefix — powers startsWith()',
          5: 'Initialize constructor',
          6: 'Create empty HashSet for words',
          7: 'Create empty HashSet for prefixes',
          10: 'Define insert method',
          11: 'Add the full word to the words set',
          12: 'Loop over every prefix length from 1 to word.length()',
          13: 'Add each substring(0, i) to the prefixes set',
          17: 'Define search method',
          18: 'Word exists iff it is in the words set — O(1) average',
          21: 'Define startsWith method',
          22: 'Prefix exists iff some insert recorded it — O(1) average',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define TrieNode class',
      2: 'Initialize TrieNode constructor',
      3: 'Init empty children dictionary',
      4: 'Init isEnd flag as False',
      6: 'Define Trie class',
      7: 'Initialize Trie constructor',
      8: 'Create root TrieNode',
      10: 'Define insert method',
      11: 'Start at root node',
      12: 'Iterate through each character',
      13: 'If character not in children',
      14: 'Create new TrieNode for character',
      15: 'Move to child node',
      16: 'Mark end of word',
      18: 'Define search method',
      19: 'Start at root node',
      20: 'Iterate through each character',
      21: 'If character not in children',
      22: 'Word not found, return False',
      23: 'Move to child node',
      24: 'Return True only if node marks end of word',
      26: 'Define startsWith method',
      27: 'Start at root node',
      28: 'Iterate through each character',
      29: 'If character not in children',
      30: 'Prefix not found, return False',
      31: 'Move to child node',
      32: 'All prefix chars found, return True',
    },
    javascript: {
      1: 'Define TrieNode class',
      2: 'Initialize TrieNode constructor',
      3: 'Init empty children object',
      4: 'Init isEnd flag as false',
      8: 'Define Trie class',
      9: 'Initialize Trie constructor',
      10: 'Create root TrieNode',
      13: 'Define insert method',
      14: 'Start at root node',
      15: 'Iterate through each character',
      16: 'If character not in children',
      17: 'Create new TrieNode for character',
      19: 'Move to child node',
      21: 'Mark end of word',
      24: 'Define search method',
      25: 'Start at root node',
      26: 'Iterate through each character',
      27: 'Char not in children, return false',
      28: 'Move to child node',
      30: 'Return true only if node marks end of word',
      33: 'Define startsWith method',
      34: 'Start at root node',
      35: 'Iterate through each character',
      36: 'Char not in children, return false',
      37: 'Move to child node',
      39: 'All prefix chars found, return true',
    },
    java: {
      1: 'Define TrieNode class',
      2: 'Declare children map field',
      3: 'Declare isEnd boolean field',
      5: 'Initialize TrieNode constructor',
      6: 'Init children as HashMap',
      7: 'Init isEnd as false',
      11: 'Define Trie class',
      12: 'Declare root TrieNode field',
      14: 'Initialize Trie constructor',
      15: 'Create root TrieNode',
      18: 'Define insert method',
      19: 'Start at root node',
      20: 'Iterate through each character',
      21: 'Add new TrieNode if char missing',
      22: 'Move to child node',
      24: 'Mark end of word',
      27: 'Define search method',
      28: 'Start at root node',
      29: 'Iterate through each character',
      30: 'Char not in children, return false',
      31: 'Move to child node',
      33: 'Return true only if node marks end of word',
      36: 'Define startsWith method',
      37: 'Start at root node',
      38: 'Iterate through each character',
      39: 'Char not in children, return false',
      40: 'Move to child node',
      42: 'All prefix chars found, return true',
    },
  },
};
