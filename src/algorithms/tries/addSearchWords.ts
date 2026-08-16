import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type WordOp = [string, string];

interface TrieNode {
  children: Record<string, TrieNode>;
  isEnd: boolean;
}

function trieToTree(root: TrieNode): { val: number | string | null; id: number }[] {
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

function runAddSearchWords(input: unknown): AlgorithmStep[] {
  const operations = input as WordOp[];
  const steps: AlgorithmStep[] = [];

  const root: TrieNode = { children: {}, isEnd: false };

  steps.push({
    state: {
      tree: [{ val: 'root', id: 0 }],
      hashMap: {},
      chars: operations.map((op) => `${op[0]}("${op[1]}")`),
    },
    highlights: [],
    message: 'Initialize empty WordDictionary with root node',
    codeLine: 1,
  });

  function dfsSearch(node: TrieNode, word: string, idx: number, path: string, opIdx: number): boolean {
    if (idx === word.length) {
      const result = node.isEnd;
      steps.push({
        state: {
          tree: trieToTree(root),
          hashMap: getChildrenMap(node),
          chars: operations.map((o) => `${o[0]}("${o[1]}")`),
          result,
        },
        highlights: [opIdx],
        message: result
          ? `Search: Reached end of "${word}", path="${path}" — isEnd=true, FOUND!`
          : `Search: Reached end of "${word}", path="${path}" — isEnd=false, not a complete word`,
        codeLine: 14,
        action: result ? 'found' : 'compare',
      });
      return result;
    }

    const ch = word[idx];

    if (ch === '.') {
      // Wildcard: try all children
      const childKeys = Object.keys(node.children).sort();
      steps.push({
        state: {
          tree: trieToTree(root),
          hashMap: getChildrenMap(node),
          chars: operations.map((o) => `${o[0]}("${o[1]}")`),
        },
        highlights: [opIdx],
        message: `Search: Wildcard '.' at index ${idx} — try all children: [${childKeys.join(', ')}]`,
        codeLine: 11,
        action: 'visit',
      });

      for (const key of childKeys) {
        steps.push({
          state: {
            tree: trieToTree(root),
            hashMap: getChildrenMap(node.children[key]),
            chars: operations.map((o) => `${o[0]}("${o[1]}")`),
          },
          highlights: [opIdx],
          message: `Search: Wildcard '.' matching '${key}', exploring path "${path}${key}"`,
          codeLine: 12,
          action: 'visit',
        });
        if (dfsSearch(node.children[key], word, idx + 1, path + key, opIdx)) {
          return true;
        }
      }

      steps.push({
        state: {
          tree: trieToTree(root),
          hashMap: getChildrenMap(node),
          chars: operations.map((o) => `${o[0]}("${o[1]}")`),
          result: false,
        },
        highlights: [opIdx],
        message: `Search: No wildcard match found for '.' at index ${idx} in path "${path}"`,
        codeLine: 13,
        action: 'compare',
      });
      return false;
    } else {
      if (!node.children[ch]) {
        steps.push({
          state: {
            tree: trieToTree(root),
            hashMap: getChildrenMap(node),
            chars: operations.map((o) => `${o[0]}("${o[1]}")`),
            result: false,
          },
          highlights: [opIdx],
          message: `Search: '${ch}' not in children — "${word}" NOT FOUND`,
          codeLine: 10,
          action: 'compare',
        });
        return false;
      }

      steps.push({
        state: {
          tree: trieToTree(root),
          hashMap: getChildrenMap(node),
          chars: operations.map((o) => `${o[0]}("${o[1]}")`),
        },
        highlights: [opIdx],
        message: `Search: Found '${ch}', move down (char ${idx + 1}/${word.length} of "${word}")`,
        codeLine: 10,
        action: 'visit',
      });
      return dfsSearch(node.children[ch], word, idx + 1, path + ch, opIdx);
    }
  }

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

    if (op === 'addWord') {
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
            message: `addWord: Create node for '${ch}' (char ${j + 1}/${word.length} of "${word}")`,
            codeLine: 6,
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
            message: `addWord: '${ch}' already exists, traverse (char ${j + 1}/${word.length} of "${word}")`,
            codeLine: 5,
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
        message: `addWord: Mark end of "${word}"`,
        codeLine: 7,
        action: 'found',
      });
    } else if (op === 'search') {
      dfsSearch(root, word, 0, '', i);
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

function runAddSearchWordsBuckets(input: unknown): AlgorithmStep[] {
  const operations = input as WordOp[];
  const steps: AlgorithmStep[] = [];

  const buckets: Record<number, string[]> = {};
  const opLabels = operations.map((op) => `${op[0]}("${op[1]}")`);
  const bucketsView = (): Record<string, string> => {
    const view: Record<string, string> = {};
    for (const len of Object.keys(buckets).sort((a, b) => Number(a) - Number(b))) {
      view[`len ${len}`] = buckets[Number(len)].join(', ');
    }
    return view;
  };

  steps.push({
    state: { hashMap: bucketsView(), chars: [...opLabels] },
    highlights: [],
    message:
      'Skip the trie: group words into buckets by length. A search pattern (dots included) can only ever match words of exactly its own length.',
    codeLine: 5,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, word] = operations[i];

    if (op === 'addWord') {
      if (!buckets[word.length]) buckets[word.length] = [];
      buckets[word.length].push(word);
      steps.push({
        state: { hashMap: bucketsView(), chars: [...opLabels] },
        highlights: [i],
        pointers: { op: i },
        message: `addWord("${word}"): append to the length-${word.length} bucket — O(1), no tree nodes to build`,
        codeLine: 8,
        action: 'insert',
      });
    } else if (op === 'search') {
      const candidates = buckets[word.length] ?? [];
      steps.push({
        state: { hashMap: bucketsView(), chars: [...opLabels] },
        highlights: [i],
        pointers: { op: i },
        message: `search("${word}"): only the length-${word.length} bucket can match — scan ${candidates.length} candidate(s): [${candidates.join(', ')}]`,
        codeLine: 11,
        action: 'visit',
      });

      let matched = false;
      for (const candidate of candidates) {
        let mismatchAt = -1;
        for (let j = 0; j < word.length; j++) {
          if (word[j] !== '.' && word[j] !== candidate[j]) {
            mismatchAt = j;
            break;
          }
        }

        if (mismatchAt === -1) {
          steps.push({
            state: { hashMap: bucketsView(), chars: [...opLabels], result: true },
            highlights: [i],
            pointers: { op: i },
            message: `Candidate "${candidate}" matches "${word}" — every position is either equal or a wildcard '.'. Return true.`,
            codeLine: 13,
            action: 'found',
          });
          matched = true;
          break;
        }

        steps.push({
          state: { hashMap: bucketsView(), chars: [...opLabels] },
          highlights: [i],
          pointers: { op: i },
          message: `Candidate "${candidate}": mismatch at index ${mismatchAt} ('${word[mismatchAt]}' vs '${candidate[mismatchAt]}') — try the next candidate`,
          codeLine: 12,
          action: 'compare',
        });
      }

      if (!matched) {
        steps.push({
          state: { hashMap: bucketsView(), chars: [...opLabels], result: false },
          highlights: [i],
          pointers: { op: i },
          message: `search("${word}"): no candidate in the length-${word.length} bucket matches — return false`,
          codeLine: 14,
          action: 'compare',
        });
      }
    }
  }

  steps.push({
    state: { hashMap: bucketsView(), chars: [...opLabels] },
    highlights: [],
    message:
      'All operations complete. Trade-off vs the trie: adds are O(1), but each search linearly scans every same-length word instead of pruning shared prefixes.',
    codeLine: 14,
  });

  return steps;
}

export const addSearchWords: Algorithm = {
  id: 'add-search-words',
  name: 'Design Add and Search Words Data Structure',
  category: 'Tries',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Trie + DFS — wildcard triggers branching search',
  description:
    'Design a data structure that supports adding new words and finding if a string matches any previously added string. The search word can contain dots "." where dots can be matched with any letter.',
  problemUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/',
  code: {
    python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.isEnd = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.isEnd = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.isEnd
            if word[i] == ".":
                for child in node.children.values():
                    if dfs(child, i + 1):
                        return True
                return False
            if word[i] not in node.children:
                return False
            return dfs(node.children[word[i]], i + 1)
        return dfs(self.root, 0)`,
    javascript: `class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
    }
}

class WordDictionary {
    constructor() {
        this.root = new TrieNode();
    }

    addWord(word) {
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
        function dfs(node, i) {
            if (i === word.length) return node.isEnd;
            if (word[i] === ".") {
                for (const child of Object.values(node.children)) {
                    if (dfs(child, i + 1)) return true;
                }
                return false;
            }
            if (!node.children[word[i]]) return false;
            return dfs(node.children[word[i]], i + 1);
        }
        return dfs(this.root, 0);
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

class WordDictionary {
    private TrieNode root;

    public WordDictionary() {
        root = new TrieNode();
    }

    public void addWord(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        return dfs(root, word, 0);
    }

    private boolean dfs(TrieNode node, String word, int i) {
        if (i == word.length()) return node.isEnd;
        char c = word.charAt(i);
        if (c == '.') {
            for (TrieNode child : node.children.values()) {
                if (dfs(child, word, i + 1)) return true;
            }
            return false;
        }
        if (!node.children.containsKey(c)) return false;
        return dfs(node.children.get(c), word, i + 1);
    }
}`,
  },
  defaultInput: [
    ['addWord', 'bad'],
    ['addWord', 'dad'],
    ['addWord', 'mad'],
    ['search', 'pad'],
    ['search', '.ad'],
    ['search', 'b..'],
  ],
  run: runAddSearchWords,
  optimalApproachName: 'Trie + Wildcard DFS',
  approaches: [
    {
      id: 'length-buckets',
      name: 'Length Buckets + Scan',
      timeComplexity: 'O(1) add, O(N·L) search',
      spaceComplexity: 'O(N·L)',
      description:
        'Instead of a trie with branching DFS, bucket words by length and linearly compare the pattern against every same-length word, letting dots match any character — trivial adds, but searches scan the whole bucket.',
      code: {
        python: `from collections import defaultdict

class WordDictionary:
    def __init__(self):
        self.buckets = defaultdict(list)

    def addWord(self, word):
        self.buckets[len(word)].append(word)

    def search(self, word):
        for candidate in self.buckets[len(word)]:
            if all(c == "." or c == w for c, w in zip(word, candidate)):
                return True
        return False`,
        javascript: `class WordDictionary {
    constructor() {
        this.buckets = new Map();
    }

    addWord(word) {
        if (!this.buckets.has(word.length)) this.buckets.set(word.length, []);
        this.buckets.get(word.length).push(word);
    }

    search(word) {
        const candidates = this.buckets.get(word.length) || [];
        for (const candidate of candidates) {
            let match = true;
            for (let i = 0; i < word.length; i++) {
                if (word[i] !== "." && word[i] !== candidate[i]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        return false;
    }
}`,
        java: `class WordDictionary {
    private Map<Integer, List<String>> buckets;

    public WordDictionary() {
        buckets = new HashMap<>();
    }

    public void addWord(String word) {
        buckets.computeIfAbsent(word.length(), k -> new ArrayList<>()).add(word);
    }

    public boolean search(String word) {
        for (String candidate : buckets.getOrDefault(word.length(), List.of())) {
            boolean match = true;
            for (int i = 0; i < word.length(); i++) {
                if (word.charAt(i) != '.' && word.charAt(i) != candidate.charAt(i)) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        return false;
    }
}`,
      },
      run: runAddSearchWordsBuckets,
      lineExplanations: {
        python: {
          1: 'Import defaultdict so buckets auto-create on first use',
          3: 'Define WordDictionary class (no trie nodes)',
          4: 'Initialize constructor',
          5: 'Map word length → list of all words of that length',
          7: 'Define addWord method',
          8: 'Append the word to its length bucket — O(1)',
          10: 'Define search method',
          11: 'Only same-length words can match; scan that bucket',
          12: "Position-by-position: '.' matches anything, letters must be equal",
          13: 'A candidate matched every position — return True',
          14: 'No candidate in the bucket matched — return False',
        },
        javascript: {
          1: 'Define WordDictionary class (no trie nodes)',
          2: 'Initialize constructor',
          3: 'Map word length → list of all words of that length',
          6: 'Define addWord method',
          7: 'Create the bucket for this length if missing',
          8: 'Append the word to its length bucket — O(1)',
          11: 'Define search method',
          12: 'Fetch same-length candidates (empty if none)',
          13: 'Scan every candidate in the bucket',
          14: 'Assume this candidate matches until proven otherwise',
          15: 'Compare the pattern to the candidate position by position',
          16: "A non-dot letter must equal the candidate's letter",
          17: 'Mark the mismatch',
          18: 'Stop comparing this candidate early',
          21: 'A candidate matched every position — return true',
          23: 'No candidate matched — return false',
        },
        java: {
          1: 'Define WordDictionary class (no trie nodes)',
          2: 'Declare map of word length → words of that length',
          4: 'Initialize constructor',
          5: 'Create empty HashMap of buckets',
          8: 'Define addWord method',
          9: 'Create bucket if missing, then append — O(1)',
          12: 'Define search method',
          13: 'Scan every same-length candidate (empty list if none)',
          14: 'Assume this candidate matches until proven otherwise',
          15: 'Compare the pattern to the candidate position by position',
          16: "A non-dot letter must equal the candidate's letter",
          17: 'Mark the mismatch',
          18: 'Stop comparing this candidate early',
          21: 'A candidate matched every position — return true',
          23: 'No candidate matched — return false',
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
      6: 'Define WordDictionary class',
      7: 'Initialize WordDictionary constructor',
      8: 'Create root TrieNode',
      10: 'Define addWord method',
      11: 'Start at root node',
      12: 'Iterate through each character',
      13: 'If character not in children',
      14: 'Create new TrieNode for character',
      15: 'Move to child node',
      16: 'Mark end of word',
      18: 'Define search method',
      19: 'Define DFS helper with node and index',
      20: 'Base case: reached end of word',
      21: 'Return whether current node is end of word',
      22: 'Check if current char is wildcard dot',
      23: 'Try all children for wildcard',
      24: 'If any child path matches, return True',
      25: 'Return True on match',
      26: 'No wildcard match found, return False',
      27: 'Check if character exists in children',
      28: 'Character not found, return False',
      29: 'Continue DFS with matched character',
      30: 'Start search DFS from root at index 0',
    },
    javascript: {
      1: 'Define TrieNode class',
      2: 'Initialize TrieNode constructor',
      3: 'Init empty children object',
      4: 'Init isEnd flag as false',
      8: 'Define WordDictionary class',
      9: 'Initialize WordDictionary constructor',
      10: 'Create root TrieNode',
      13: 'Define addWord method',
      14: 'Start at root node',
      15: 'Iterate through each character',
      16: 'If character not in children',
      17: 'Create new TrieNode for character',
      19: 'Move to child node',
      21: 'Mark end of word',
      24: 'Define search method',
      25: 'Define DFS helper with node and index',
      26: 'Base case: return isEnd at word end',
      27: 'Check if current char is wildcard dot',
      28: 'Try all children for wildcard',
      29: 'If any child path matches, return true',
      31: 'No wildcard match, return false',
      33: 'Char not in children, return false',
      34: 'Continue DFS with matched character',
      36: 'Start search DFS from root at index 0',
    },
    java: {
      1: 'Define TrieNode class',
      2: 'Declare children map field',
      3: 'Declare isEnd boolean field',
      5: 'Initialize TrieNode constructor',
      6: 'Init children as HashMap',
      7: 'Init isEnd as false',
      11: 'Define WordDictionary class',
      12: 'Declare root TrieNode field',
      14: 'Initialize WordDictionary constructor',
      15: 'Create root TrieNode',
      18: 'Define addWord method',
      19: 'Start at root node',
      20: 'Iterate through each character',
      21: 'Add new TrieNode if char missing',
      22: 'Move to child node',
      24: 'Mark end of word',
      27: 'Define search method delegating to DFS',
      28: 'Start DFS from root at index 0',
      31: 'Define DFS helper with node, word, index',
      32: 'Base case: return isEnd at word end',
      33: 'Get current character',
      34: 'Check if current char is wildcard dot',
      35: 'Try all children for wildcard',
      36: 'If any child path matches, return true',
      38: 'No wildcard match, return false',
      40: 'Char not in children, return false',
      41: 'Continue DFS with matched character',
    },
  },
};
