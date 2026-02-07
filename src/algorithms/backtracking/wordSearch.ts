import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runWordSearch(input: unknown): AlgorithmStep[] {
  const { board, word } = input as { board: string[][]; word: string };
  const steps: AlgorithmStep[] = [];
  const rows = board.length;
  const cols = board[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false));
  let found = false;

  steps.push({
    state: {
      matrix: board.map((row) => [...row]),
      matrixHighlights: [] as [number, number][],
      chars: word.split(''),
      hashMap: { word, matched: 0 },
    },
    highlights: [],
    message: `Search for word "${word}" in the ${rows}x${cols} board`,
    codeLine: 1,
  });

  function backtrack(r: number, c: number, idx: number, path: [number, number][]): boolean {
    if (idx === word.length) {
      found = true;

      steps.push({
        state: {
          matrix: board.map((row) => [...row]),
          matrixHighlights: [...path] as [number, number][],
          chars: word.split(''),
          hashMap: { word, matched: word.length },
        },
        highlights: Array.from({ length: word.length }, (_, i) => i),
        message: `Found "${word}"! Path highlighted on board`,
        codeLine: 5,
        action: 'found',
      });
      return true;
    }

    // Boundary and validity checks
    if (r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || board[r][c] !== word[idx]) {
      if (r >= 0 && r < rows && c >= 0 && c < cols && !visited[r][c] && board[r][c] !== word[idx]) {
        steps.push({
          state: {
            matrix: board.map((row) => [...row]),
            matrixHighlights: [...path, [r, c]] as [number, number][],
            chars: word.split(''),
            hashMap: { word, matched: idx, checking: `board[${r}][${c}]="${board[r][c]}" != "${word[idx]}"` },
          },
          highlights: idx > 0 ? Array.from({ length: idx }, (_, i) => i) : [],
          message: `board[${r}][${c}] = "${board[r][c]}" != "${word[idx]}", no match`,
          codeLine: 7,
        });
      }
      return false;
    }

    // Mark visited and add to path
    visited[r][c] = true;
    path.push([r, c]);

    steps.push({
      state: {
        matrix: board.map((row) => [...row]),
        matrixHighlights: [...path] as [number, number][],
        chars: word.split(''),
        hashMap: { word, matched: idx + 1, position: `[${r},${c}]` },
      },
      highlights: Array.from({ length: idx + 1 }, (_, i) => i),
      message: `Match "${word[idx]}" at board[${r}][${c}] (${idx + 1}/${word.length} matched)`,
      codeLine: 9,
      action: 'visit',
    });

    // Explore 4 directions
    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const dirNames = ['right', 'left', 'down', 'up'];

    for (let d = 0; d < directions.length; d++) {
      const [dr, dc] = directions[d];
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        steps.push({
          state: {
            matrix: board.map((row) => [...row]),
            matrixHighlights: [...path, [nr, nc]] as [number, number][],
            chars: word.split(''),
            hashMap: { word, matched: idx + 1, exploring: dirNames[d] },
          },
          highlights: Array.from({ length: idx + 1 }, (_, i) => i),
          message: `Explore ${dirNames[d]}: board[${nr}][${nc}] = "${board[nr][nc]}", need "${word[idx + 1] || 'done'}"`,
          codeLine: 11,
        });
      }

      if (backtrack(nr, nc, idx + 1, path)) {
        return true;
      }
    }

    // Backtrack
    visited[r][c] = false;
    path.pop();

    steps.push({
      state: {
        matrix: board.map((row) => [...row]),
        matrixHighlights: [...path] as [number, number][],
        chars: word.split(''),
        hashMap: { word, matched: idx, backtrack: `from [${r},${c}]` },
      },
      highlights: idx > 0 ? Array.from({ length: idx }, (_, i) => i) : [],
      message: `Backtrack from board[${r}][${c}] = "${board[r][c]}"`,
      codeLine: 15,
      action: 'pop',
    });

    return false;
  }

  // Try each cell as starting point
  for (let r = 0; r < rows && !found; r++) {
    for (let c = 0; c < cols && !found; c++) {
      if (board[r][c] === word[0]) {
        steps.push({
          state: {
            matrix: board.map((row) => [...row]),
            matrixHighlights: [[r, c]] as [number, number][],
            chars: word.split(''),
            hashMap: { word, startingAt: `[${r},${c}]` },
          },
          highlights: [0],
          message: `Try starting at board[${r}][${c}] = "${board[r][c]}" (matches "${word[0]}")`,
          codeLine: 17,
          action: 'visit',
        });

        backtrack(r, c, 0, []);
      }
    }
  }

  if (!found) {
    steps.push({
      state: {
        matrix: board.map((row) => [...row]),
        matrixHighlights: [] as [number, number][],
        chars: word.split(''),
        hashMap: { word, result: 'Not found' },
      },
      highlights: [],
      message: `Word "${word}" not found in the board`,
      codeLine: 19,
    });
  }

  return steps;
}

export const wordSearch: Algorithm = {
  id: 'word-search',
  name: 'Word Search',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n·4^L)',
  spaceComplexity: 'O(L)',
  pattern: 'DFS Backtracking — explore 4 directions, mark visited',
  description:
    'Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically). Each cell may be used only once.',
  problemUrl: 'https://leetcode.com/problems/word-search/',
  code: {
    python: `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def backtrack(r, c, idx):
        if idx == len(word):
            return True
        if (r < 0 or r >= rows or c < 0 or
            c >= cols or board[r][c] != word[idx]):
            return False

        temp = board[r][c]
        board[r][c] = "#"  # mark visited

        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            if backtrack(r + dr, c + dc, idx + 1):
                return True

        board[r][c] = temp  # backtrack
        return False

    for r in range(rows):
        for c in range(cols):
            if backtrack(r, c, 0):
                return True
    return False`,
    javascript: `function exist(board, word) {
    const rows = board.length;
    const cols = board[0].length;

    function backtrack(r, c, idx) {
        if (idx === word.length) return true;
        if (r < 0 || r >= rows || c < 0 ||
            c >= cols || board[r][c] !== word[idx])
            return false;

        const temp = board[r][c];
        board[r][c] = "#"; // mark visited

        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        for (const [dr, dc] of dirs) {
            if (backtrack(r+dr, c+dc, idx+1))
                return true;
        }

        board[r][c] = temp; // backtrack
        return false;
    }

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (backtrack(r, c, 0)) return true;
    return false;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: {
    board: [
      ['A', 'B', 'C', 'E'],
      ['S', 'F', 'C', 'S'],
      ['A', 'D', 'E', 'E'],
    ],
    word: 'ABCCED',
  },
  run: runWordSearch,
};
