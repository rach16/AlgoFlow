import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface WordSearchIIInput {
  board: string[][];
  words: string[];
}

interface TrieNode {
  children: Record<string, TrieNode>;
  word: string | null;
}

function runWordSearchII(input: unknown): AlgorithmStep[] {
  const { board, words } = input as WordSearchIIInput;
  const steps: AlgorithmStep[] = [];
  const rows = board.length;
  const cols = board[0].length;
  const foundWords: string[] = [];

  const copyBoard = () => board.map((row) => [...row]);

  // Build trie from words
  const root: TrieNode = { children: {}, word: null };
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = { children: {}, word: null };
      }
      node = node.children[ch];
    }
    node.word = word;
  }

  steps.push({
    state: {
      matrix: copyBoard(),
      matrixHighlights: [],
      chars: words.map((w) => w),
      hashMap: { words: words.join(', ') },
      result: [],
    },
    highlights: [],
    message: `Build trie from words: [${words.join(', ')}]. Search ${rows}x${cols} board.`,
    codeLine: 1,
  });

  steps.push({
    state: {
      matrix: copyBoard(),
      matrixHighlights: [],
      chars: words.map((w) => w),
      hashMap: { trieBuilt: 'true', wordCount: String(words.length) },
      result: [],
    },
    highlights: [],
    message: `Trie built with ${words.length} words. Begin DFS from each cell.`,
    codeLine: 5,
  });

  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );
  const currentPath: [number, number][] = [];

  function dfs(r: number, c: number, node: TrieNode): void {
    if (
      r < 0 ||
      r >= rows ||
      c < 0 ||
      c >= cols ||
      visited[r][c] ||
      !node.children[board[r][c]]
    ) {
      return;
    }

    const ch = board[r][c];
    const nextNode = node.children[ch];
    visited[r][c] = true;
    currentPath.push([r, c]);

    steps.push({
      state: {
        matrix: copyBoard(),
        matrixHighlights: currentPath.map(([pr, pc]) => [pr, pc]),
        chars: words.map((w) => (foundWords.includes(w) ? `${w} [FOUND]` : w)),
        result: [...foundWords],
      },
      highlights: [],
      message: `DFS: Visit board[${r}][${c}]='${ch}', path: "${currentPath.map(([pr, pc]) => board[pr][pc]).join('')}"`,
      codeLine: 9,
      action: 'visit',
    });

    if (nextNode.word !== null) {
      foundWords.push(nextNode.word);
      const foundWord = nextNode.word;
      nextNode.word = null; // avoid duplicates

      steps.push({
        state: {
          matrix: copyBoard(),
          matrixHighlights: currentPath.map(([pr, pc]) => [pr, pc]),
          chars: words.map((w) => (foundWords.includes(w) ? `${w} [FOUND]` : w)),
          result: [...foundWords],
        },
        highlights: [],
        message: `FOUND word "${foundWord}"! Results so far: [${foundWords.join(', ')}]`,
        codeLine: 11,
        action: 'found',
      });
    }

    const directions: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (const [dr, dc] of directions) {
      dfs(r + dr, c + dc, nextNode);
    }

    visited[r][c] = false;
    currentPath.pop();
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (root.children[board[r][c]]) {
        steps.push({
          state: {
            matrix: copyBoard(),
            matrixHighlights: [[r, c]],
            chars: words.map((w) => (foundWords.includes(w) ? `${w} [FOUND]` : w)),
            result: [...foundWords],
          },
          highlights: [],
          message: `Start DFS from board[${r}][${c}]='${board[r][c]}' (matches trie root child)`,
          codeLine: 7,
          action: 'visit',
        });
        dfs(r, c, root);
      }
    }
  }

  steps.push({
    state: {
      matrix: copyBoard(),
      matrixHighlights: [],
      chars: words.map((w) => (foundWords.includes(w) ? `${w} [FOUND]` : w)),
      result: [...foundWords],
    },
    highlights: [],
    message: `Search complete! Found ${foundWords.length} word(s): [${foundWords.join(', ')}]`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const wordSearchII: Algorithm = {
  id: 'word-search-ii',
  name: 'Word Search II',
  category: 'Tries',
  difficulty: 'Hard',
  timeComplexity: 'O(m·n·4^L)',
  spaceComplexity: 'O(W·L)',
  pattern: 'Trie + Backtracking — build trie from words, DFS on board',
  description:
    'Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.',
  problemUrl: 'https://leetcode.com/problems/word-search-ii/',
  code: {
    python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

def findWords(board, words):
    root = TrieNode()
    for word in words:
        node = root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.word = word

    ROWS, COLS = len(board), len(board[0])
    result, visited = [], set()

    def dfs(r, c, node):
        if (r < 0 or r >= ROWS or c < 0 or c >= COLS
            or (r, c) in visited
            or board[r][c] not in node.children):
            return
        visited.add((r, c))
        node = node.children[board[r][c]]
        if node.word:
            result.append(node.word)
            node.word = None
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            dfs(r + dr, c + dc, node)
        visited.remove((r, c))

    for r in range(ROWS):
        for c in range(COLS):
            dfs(r, c, root)
    return result`,
    javascript: `function findWords(board, words) {
    const root = { children: {}, word: null };
    for (const word of words) {
        let node = root;
        for (const c of word) {
            if (!node.children[c])
                node.children[c] = { children: {}, word: null };
            node = node.children[c];
        }
        node.word = word;
    }

    const ROWS = board.length, COLS = board[0].length;
    const result = [], visited = new Set();

    function dfs(r, c, node) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS
            || visited.has(r + "," + c)
            || !node.children[board[r][c]]) return;
        visited.add(r + "," + c);
        node = node.children[board[r][c]];
        if (node.word) {
            result.push(node.word);
            node.word = null;
        }
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]])
            dfs(r + dr, c + dc, node);
        visited.delete(r + "," + c);
    }

    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
            dfs(r, c, root);
    return result;
}`,
    java: `class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    String word = null;
}

public static List<String> findWords(char[][] board, String[] words) {
    TrieNode root = new TrieNode();
    for (String word : words) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.word = word;
    }

    int ROWS = board.length, COLS = board[0].length;
    List<String> result = new ArrayList<>();
    boolean[][] visited = new boolean[ROWS][COLS];

    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c < COLS; c++) {
            dfs(board, r, c, root, visited, result);
        }
    }
    return result;
}

private static void dfs(char[][] board, int r, int c, TrieNode node,
                       boolean[][] visited, List<String> result) {
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length ||
        visited[r][c] || !node.children.containsKey(board[r][c])) return;

    visited[r][c] = true;
    node = node.children.get(board[r][c]);
    if (node.word != null) {
        result.add(node.word);
        node.word = null;
    }

    dfs(board, r + 1, c, node, visited, result);
    dfs(board, r - 1, c, node, visited, result);
    dfs(board, r, c + 1, node, visited, result);
    dfs(board, r, c - 1, node, visited, result);
    visited[r][c] = false;
}`,
  },
  defaultInput: {
    board: [
      ['o', 'a', 'a', 'n'],
      ['e', 't', 'a', 'e'],
      ['i', 'h', 'k', 'r'],
      ['i', 'f', 'l', 'v'],
    ],
    words: ['oath', 'pea', 'eat', 'rain'],
  },
  run: runWordSearchII,
  lineExplanations: {
    python: {
      1: 'Define TrieNode class',
      2: 'Initialize TrieNode constructor',
      3: 'Init empty children dictionary',
      4: 'Init word as None (stores full word at end)',
      6: 'Define function taking board and word list',
      7: 'Create trie root node',
      8: 'Insert each word into trie',
      9: 'Start at root for each word',
      10: 'Iterate through each character',
      11: 'If character not in children',
      12: 'Create new TrieNode for character',
      13: 'Move to child node',
      14: 'Store complete word at leaf node',
      16: 'Get board dimensions',
      17: 'Init result list and visited set',
      19: 'Define DFS taking row, col, and trie node',
      20: 'Bounds check and visited/trie child check',
      21: 'Check if cell visited',
      22: 'Check if char exists in trie children',
      23: 'Return if any check fails',
      24: 'Mark cell as visited',
      25: 'Move to trie child for this character',
      26: 'If trie node has a stored word',
      27: 'Add found word to result',
      28: 'Clear word to avoid duplicates',
      29: 'Explore all four directions',
      30: 'Recurse into adjacent cells',
      31: 'Unmark cell for backtracking',
      33: 'Iterate over all board rows',
      34: 'Iterate over all board columns',
      35: 'Start DFS from each cell with root',
      36: 'Return all found words',
    },
    javascript: {
      1: 'Define function taking board and word list',
      2: 'Create trie root node',
      3: 'Insert each word into trie',
      4: 'Start at root for each word',
      5: 'Iterate through each character',
      6: 'If character not in children',
      7: 'Create new TrieNode for character',
      8: 'Move to child node',
      10: 'Store complete word at leaf node',
      13: 'Get board dimensions',
      14: 'Init result array and visited set',
      16: 'Define DFS taking row, col, and trie node',
      17: 'Bounds check and visited/trie child check',
      18: 'Check if cell visited',
      19: 'Return if any check fails',
      20: 'Mark cell as visited',
      21: 'Move to trie child for this character',
      22: 'If trie node has a stored word',
      23: 'Add found word to result',
      24: 'Clear word to avoid duplicates',
      26: 'Explore all four directions',
      27: 'Recurse into adjacent cells',
      28: 'Unmark cell for backtracking',
      31: 'Iterate over all board rows',
      32: 'Iterate over all board columns',
      33: 'Start DFS from each cell with root',
      34: 'Return all found words',
    },
    java: {
      1: 'Define TrieNode class',
      2: 'Init children map and word field',
      3: 'Word is null until leaf node stores it',
      6: 'Define function taking board and word list',
      7: 'Create trie root node',
      8: 'Insert each word into trie',
      9: 'Start at root for each word',
      10: 'Iterate through each character',
      11: 'Add new TrieNode if char missing',
      12: 'Move to child node',
      14: 'Store complete word at leaf node',
      17: 'Get board dimensions',
      18: 'Init result list',
      19: 'Init visited boolean grid',
      21: 'Iterate over all board rows',
      22: 'Iterate over all board columns',
      23: 'Start DFS from each cell with root',
      26: 'Return all found words',
      29: 'Define DFS helper method',
      30: 'Signature with board, position, node, state',
      31: 'Bounds and visited/trie child checks',
      32: 'Return if any check fails',
      34: 'Mark cell as visited',
      35: 'Move to trie child for this character',
      36: 'If trie node has a stored word',
      37: 'Add found word to result',
      38: 'Clear word to avoid duplicates',
      41: 'Recurse down',
      42: 'Recurse up',
      43: 'Recurse right',
      44: 'Recurse left',
      45: 'Unmark cell for backtracking',
    },
  },
};
