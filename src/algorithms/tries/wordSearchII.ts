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

function runWordSearchIIPerWordDFS(input: unknown): AlgorithmStep[] {
  const { board, words } = input as WordSearchIIInput;
  const steps: AlgorithmStep[] = [];
  const rows = board.length;
  const cols = board[0].length;
  const foundWords: string[] = [];

  const copyBoard = () => board.map((row) => [...row]);
  const charsView = () => words.map((w) => (foundWords.includes(w) ? `${w} [FOUND]` : w));

  steps.push({
    state: {
      matrix: copyBoard(),
      matrixHighlights: [],
      chars: charsView(),
      result: [],
    },
    highlights: [],
    message: `No trie: run a separate Word-Search-I style backtracking DFS for each of the ${words.length} words. Simpler code, but the board is re-scanned once per word.`,
    codeLine: 1,
  });

  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const path: [number, number][] = [];

  function dfs(r: number, c: number, word: string, i: number): boolean {
    if (r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || board[r][c] !== word[i]) {
      return false;
    }

    visited[r][c] = true;
    path.push([r, c]);

    steps.push({
      state: {
        matrix: copyBoard(),
        matrixHighlights: path.map(([pr, pc]) => [pr, pc]),
        chars: charsView(),
        result: [...foundWords],
      },
      highlights: [],
      message: `"${word}": matched '${word[i]}' at board[${r}][${c}] (${i + 1}/${word.length}) — path "${word.slice(0, i + 1)}"`,
      codeLine: 12,
      action: 'visit',
    });

    if (i + 1 === word.length) {
      steps.push({
        state: {
          matrix: copyBoard(),
          matrixHighlights: path.map(([pr, pc]) => [pr, pc]),
          chars: charsView(),
          result: [...foundWords],
        },
        highlights: [],
        message: `"${word}" fully matched — all ${word.length} letters lie on one connected, non-repeating path!`,
        codeLine: 8,
        action: 'found',
      });
      visited[r][c] = false;
      path.pop();
      return true;
    }

    const directions: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (const [dr, dc] of directions) {
      if (dfs(r + dr, c + dc, word, i + 1)) {
        visited[r][c] = false;
        path.pop();
        return true;
      }
    }

    steps.push({
      state: {
        matrix: copyBoard(),
        matrixHighlights: path.map(([pr, pc]) => [pr, pc]),
        chars: charsView(),
        result: [...foundWords],
      },
      highlights: [],
      message: `"${word}": dead end at board[${r}][${c}] — no unvisited neighbor continues "${word.slice(0, i + 1)}". Backtrack and unmark the cell.`,
      codeLine: 15,
      action: 'pop',
    });

    visited[r][c] = false;
    path.pop();
    return false;
  }

  for (let w = 0; w < words.length; w++) {
    const word = words[w];

    steps.push({
      state: {
        matrix: copyBoard(),
        matrixHighlights: [],
        chars: charsView(),
        result: [...foundWords],
      },
      highlights: [],
      message: `Word ${w + 1}/${words.length}: search the whole board for "${word}" from scratch (this is the cost of skipping the trie)`,
      codeLine: 20,
      action: 'visit',
    });

    const startCells: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === word[0]) startCells.push([r, c]);
      }
    }

    if (startCells.length === 0) {
      steps.push({
        state: {
          matrix: copyBoard(),
          matrixHighlights: [],
          chars: charsView(),
          result: [...foundWords],
        },
        highlights: [],
        message: `"${word}": no cell contains its first letter '${word[0]}' — the word cannot exist on this board`,
        codeLine: 11,
        action: 'compare',
      });
      continue;
    }

    let exists = false;
    for (const [r, c] of startCells) {
      steps.push({
        state: {
          matrix: copyBoard(),
          matrixHighlights: [[r, c]],
          chars: charsView(),
          result: [...foundWords],
        },
        highlights: [],
        message: `"${word}": start DFS at board[${r}][${c}]='${board[r][c]}' (matches first letter)`,
        codeLine: 17,
        action: 'visit',
      });
      if (dfs(r, c, word, 0)) {
        exists = true;
        break;
      }
    }

    if (exists) {
      foundWords.push(word);
      steps.push({
        state: {
          matrix: copyBoard(),
          matrixHighlights: [],
          chars: charsView(),
          result: [...foundWords],
        },
        highlights: [],
        message: `Add "${word}" to results. Found so far: [${foundWords.join(', ')}]`,
        codeLine: 22,
        action: 'found',
      });
    } else {
      steps.push({
        state: {
          matrix: copyBoard(),
          matrixHighlights: [],
          chars: charsView(),
          result: [...foundWords],
        },
        highlights: [],
        message: `"${word}": every starting cell was exhausted — the word is not on the board`,
        codeLine: 21,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: {
      matrix: copyBoard(),
      matrixHighlights: [],
      chars: charsView(),
      result: [...foundWords],
    },
    highlights: [],
    message: `Search complete! Found ${foundWords.length} word(s): [${foundWords.join(', ')}]. The trie version shares prefix work across words; this version repeats it per word.`,
    codeLine: 23,
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
  optimalApproachName: 'Trie + Backtracking',
  approaches: [
    {
      id: 'per-word-dfs',
      name: 'DFS per Word (No Trie)',
      timeComplexity: 'O(W·m·n·4^L)',
      spaceComplexity: 'O(L)',
      description:
        'Skip the trie entirely and run a Word Search I backtracking DFS once per word — much simpler code, but prefix work shared by words like "oat"/"oath" is repeated for every word.',
      code: {
        python: `def findWords(board, words):
    ROWS, COLS = len(board), len(board[0])
    result = []

    def exist(word):
        def dfs(r, c, i):
            if i == len(word):
                return True
            if (r < 0 or r >= ROWS or c < 0 or c >= COLS
                or board[r][c] != word[i]):
                return False
            board[r][c] = "#"
            found = any(dfs(r + dr, c + dc, i + 1)
                        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)])
            board[r][c] = word[i]
            return found
        return any(dfs(r, c, 0)
                   for r in range(ROWS) for c in range(COLS))

    for word in words:
        if exist(word):
            result.append(word)
    return result`,
        javascript: `function findWords(board, words) {
    const ROWS = board.length, COLS = board[0].length;
    const result = [];

    function exist(word) {
        function dfs(r, c, i) {
            if (i === word.length) return true;
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS
                || board[r][c] !== word[i]) return false;
            board[r][c] = "#";
            const found = [[0,1],[0,-1],[1,0],[-1,0]]
                .some(([dr, dc]) => dfs(r + dr, c + dc, i + 1));
            board[r][c] = word[i];
            return found;
        }
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (dfs(r, c, 0)) return true;
        return false;
    }

    for (const word of words)
        if (exist(word)) result.push(word);
    return result;
}`,
        java: `public static List<String> findWords(char[][] board, String[] words) {
    List<String> result = new ArrayList<>();
    for (String word : words) {
        if (exist(board, word)) result.add(word);
    }
    return result;
}

private static boolean exist(char[][] board, String word) {
    for (int r = 0; r < board.length; r++) {
        for (int c = 0; c < board[0].length; c++) {
            if (dfs(board, r, c, word, 0)) return true;
        }
    }
    return false;
}

private static boolean dfs(char[][] board, int r, int c, String word, int i) {
    if (i == word.length()) return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length
        || board[r][c] != word.charAt(i)) return false;
    char saved = board[r][c];
    board[r][c] = '#';
    boolean found = dfs(board, r + 1, c, word, i + 1)
        || dfs(board, r - 1, c, word, i + 1)
        || dfs(board, r, c + 1, word, i + 1)
        || dfs(board, r, c - 1, word, i + 1);
    board[r][c] = saved;
    return found;
}`,
      },
      run: runWordSearchIIPerWordDFS,
      lineExplanations: {
        python: {
          1: 'Define function taking board and word list',
          2: 'Get board dimensions',
          3: 'Init result list',
          5: 'Helper: does one word exist on the board? (Word Search I)',
          6: 'DFS trying to match word[i:] starting at (r, c)',
          7: 'Every character has been matched',
          8: 'The word exists on the board',
          9: 'Out-of-bounds check',
          10: 'Current cell must equal the current character',
          11: 'Prune this path',
          12: "Mark the cell with '#' so it cannot be reused in this word",
          13: 'Try to extend the match in all four directions',
          14: 'Right, left, down, up neighbor offsets',
          15: 'Backtrack: restore the original letter',
          16: 'Report whether any direction completed the word',
          17: 'Try a DFS from every cell of the board',
          18: 'Scan all rows and all columns as starting points',
          20: 'Run the full board search once per word',
          21: 'If that word exists somewhere on the board',
          22: 'Add it to the results',
          23: 'Return every word that was found',
        },
        javascript: {
          1: 'Define function taking board and word list',
          2: 'Get board dimensions',
          3: 'Init result array',
          5: 'Helper: does one word exist on the board? (Word Search I)',
          6: 'DFS trying to match word from index i at (r, c)',
          7: 'Every character matched — the word exists',
          8: 'Out-of-bounds check',
          9: 'Current cell must equal the current character, else prune',
          10: "Mark the cell with '#' so it cannot be reused in this word",
          11: 'Try to extend the match in all four directions',
          12: 'Recurse into each neighbor with the next index',
          13: 'Backtrack: restore the original letter',
          14: 'Report whether any direction completed the word',
          16: 'Scan all rows as starting points',
          17: 'Scan all columns as starting points',
          18: 'A DFS from this cell matched the whole word',
          19: 'No starting cell worked — word not on board',
          22: 'Run the full board search once per word',
          23: 'Word found — collect it',
          24: 'Return every word that was found',
        },
        java: {
          1: 'Define function taking board and word list',
          2: 'Init result list',
          3: 'Run the full board search once per word',
          4: 'Word found — collect it',
          6: 'Return every word that was found',
          9: 'Helper: does one word exist on the board? (Word Search I)',
          10: 'Scan all rows as starting points',
          11: 'Scan all columns as starting points',
          12: 'A DFS from this cell matched the whole word',
          15: 'No starting cell worked — word not on board',
          18: 'DFS trying to match word from index i at (r, c)',
          19: 'Every character matched — the word exists',
          20: 'Out-of-bounds check',
          21: 'Current cell must equal the current character, else prune',
          22: 'Remember the letter before marking',
          23: "Mark the cell with '#' so it cannot be reused in this word",
          24: 'Try extending the match downward',
          25: 'Try extending the match upward',
          26: 'Try extending the match rightward',
          27: 'Try extending the match leftward',
          28: 'Backtrack: restore the original letter',
          29: 'Report whether any direction completed the word',
        },
      },
    },
  ],
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
