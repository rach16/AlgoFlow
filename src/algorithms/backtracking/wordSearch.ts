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

function runWordSearchIterative(input: unknown): AlgorithmStep[] {
  const { board, word } = input as { board: string[][]; word: string };
  const steps: AlgorithmStep[] = [];
  const rows = board.length;
  const cols = board[0].length;

  interface Frame {
    r: number;
    c: number;
    idx: number;
    path: [number, number][];
  }

  const stack: Frame[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === word[0]) {
        stack.push({ r, c, idx: 0, path: [] });
      }
    }
  }

  steps.push({
    state: {
      matrix: board.map((row) => [...row]),
      matrixHighlights: stack.map((f) => [f.r, f.c]) as [number, number][],
      chars: word.split(''),
      hashMap: { word, seededFrames: stack.length },
    },
    highlights: [],
    message: `No recursion: seed an explicit stack with ${stack.length} frame${stack.length !== 1 ? 's' : ''} — one per cell matching '${word[0]}'. Each frame carries its own path, so there is nothing to un-mark`,
    codeLine: 8,
  });

  const STEP_BUDGET = 65;
  let suppressed = 0;
  let found = false;

  while (stack.length > 0 && !found) {
    const { r, c, idx, path } = stack.pop()!;

    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (path.some(([pr, pc]) => pr === r && pc === c)) continue;

    if (board[r][c] !== word[idx]) {
      if (steps.length < STEP_BUDGET) {
        steps.push({
          state: {
            matrix: board.map((row) => [...row]),
            matrixHighlights: [...path, [r, c]] as [number, number][],
            chars: word.split(''),
            hashMap: { word, matched: idx, frames: stack.length },
          },
          highlights: idx > 0 ? Array.from({ length: idx }, (_, i) => i) : [],
          message: `Pop frame at [${r},${c}]: "${board[r][c]}" != "${word[idx]}" — discard frame (its siblings are untouched on the stack)`,
          codeLine: 14,
          action: 'pop',
        });
      } else {
        suppressed++;
      }
      continue;
    }

    const newPath = [...path, [r, c]] as [number, number][];

    if (idx === word.length - 1) {
      found = true;
      steps.push({
        state: {
          matrix: board.map((row) => [...row]),
          matrixHighlights: [...newPath] as [number, number][],
          chars: word.split(''),
          hashMap: { word, matched: word.length },
        },
        highlights: Array.from({ length: word.length }, (_, i) => i),
        message: `Match "${word[idx]}" at [${r},${c}] completes "${word}" — found! Path highlighted on the board`,
        codeLine: 17,
        action: 'found',
      });
      break;
    }

    if (steps.length < STEP_BUDGET) {
      steps.push({
        state: {
          matrix: board.map((row) => [...row]),
          matrixHighlights: [...newPath] as [number, number][],
          chars: word.split(''),
          hashMap: { word, matched: idx + 1, frames: stack.length },
        },
        highlights: Array.from({ length: idx + 1 }, (_, i) => i),
        message: `Match "${word[idx]}" at [${r},${c}] (${idx + 1}/${word.length}) — push 4 neighbor frames, each carrying this path`,
        codeLine: 15,
        action: 'visit',
      });
    } else {
      suppressed++;
    }

    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of directions) {
      stack.push({ r: r + dr, c: c + dc, idx: idx + 1, path: newPath });
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
      message: `Stack drained without completing "${word}" — word not in the board${suppressed > 0 ? ` (${suppressed} similar frames not shown)` : ''}`,
      codeLine: 21,
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
    java: `public static boolean exist(char[][] board, String word) {
    int rows = board.length;
    int cols = board[0].length;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (backtrack(board, word, r, c, 0)) {
                return true;
            }
        }
    }
    return false;
}

private static boolean backtrack(char[][] board, String word, int r, int c, int idx) {
    if (idx == word.length()) return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length ||
        board[r][c] != word.charAt(idx)) return false;

    char temp = board[r][c];
    board[r][c] = '#';

    boolean found = backtrack(board, word, r + 1, c, idx + 1) ||
                   backtrack(board, word, r - 1, c, idx + 1) ||
                   backtrack(board, word, r, c + 1, idx + 1) ||
                   backtrack(board, word, r, c - 1, idx + 1);

    board[r][c] = temp;
    return found;
}`,
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
  optimalApproachName: 'Recursive DFS Backtracking',
  approaches: [
    {
      id: 'iterative-dfs-stack',
      name: 'Iterative DFS (Explicit Stack)',
      timeComplexity: 'O(m·n·4^L)',
      spaceComplexity: 'O(m·n + L²)',
      description:
        'Replaces recursion with an explicit stack of frames that each carry their own path — no board mutation or un-marking on backtrack, at the cost of copying paths into child frames.',
      code: {
        python: `def exist(board, word):
    rows, cols = len(board), len(board[0])
    # Each frame: (r, c, idx, path)
    stack = []
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == word[0]:
                stack.append((r, c, 0, []))

    while stack:
        r, c, idx, path = stack.pop()
        if (r < 0 or r >= rows or c < 0 or c >= cols
                or (r, c) in path or board[r][c] != word[idx]):
            continue
        path = path + [(r, c)]
        if idx == len(word) - 1:
            return True
        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            stack.append((r + dr, c + dc, idx + 1, path))

    return False`,
        javascript: `function exist(board, word) {
    const rows = board.length, cols = board[0].length;
    // Each frame: [r, c, idx, path]
    const stack = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (board[r][c] === word[0]) stack.push([r, c, 0, []]);

    while (stack.length) {
        const [r, c, idx, path] = stack.pop();
        if (r < 0 || r >= rows || c < 0 || c >= cols ||
            path.some(([pr, pc]) => pr === r && pc === c) ||
            board[r][c] !== word[idx]) continue;
        const newPath = [...path, [r, c]];
        if (idx === word.length - 1) return true;
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            stack.push([r + dr, c + dc, idx + 1, newPath]);
        }
    }

    return false;
}`,
        java: `public static boolean exist(char[][] board, String word) {
    int rows = board.length, cols = board[0].length;
    // Each frame: {r, c, idx, path}
    Deque<Object[]> stack = new ArrayDeque<>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (board[r][c] == word.charAt(0))
                stack.push(new Object[]{r, c, 0, new ArrayList<int[]>()});

    while (!stack.isEmpty()) {
        Object[] frame = stack.pop();
        int r = (int) frame[0], c = (int) frame[1], idx = (int) frame[2];
        List<int[]> path = (List<int[]>) frame[3];
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        final int fr = r, fc = c;
        if (path.stream().anyMatch(p -> p[0] == fr && p[1] == fc)) continue;
        if (board[r][c] != word.charAt(idx)) continue;
        List<int[]> newPath = new ArrayList<>(path);
        newPath.add(new int[]{r, c});
        if (idx == word.length() - 1) return true;
        int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
        for (int[] d : dirs)
            stack.push(new Object[]{r + d[0], c + d[1], idx + 1, newPath});
    }
    return false;
}`,
      },
      run: runWordSearchIterative,
      lineExplanations: {
        python: {
          1: 'Define function taking board and word',
          2: 'Get board dimensions',
          3: 'A frame carries position, match index, and its own path',
          4: 'Explicit stack replaces the call stack',
          5: 'Scan every row ...',
          6: '... and column',
          7: 'Only cells matching the first letter can start the word',
          8: 'Seed a frame with an empty path for each starting cell',
          10: 'Depth-first: keep popping until the stack drains',
          11: 'Pop the most recent frame (LIFO)',
          12: 'Reject out-of-bounds cells ...',
          13: "... cells already on this frame's path, or wrong letters",
          14: 'Invalid frame — just discard it, nothing to undo',
          15: 'Extend the path with a copy (frames never share mutable state)',
          16: 'Matched the final letter?',
          17: 'Word found — done',
          18: 'Otherwise fan out in all four directions',
          19: 'Each child frame inherits the extended path',
          21: 'Stack empty: no path spells the word',
        },
        javascript: {
          1: 'Define function taking board and word',
          2: 'Get board dimensions',
          3: 'A frame carries position, match index, and its own path',
          4: 'Explicit stack replaces the call stack',
          5: 'Scan every row ...',
          6: '... and column',
          7: 'Seed a frame for each cell matching the first letter',
          9: 'Depth-first: keep popping until the stack drains',
          10: 'Pop the most recent frame (LIFO)',
          11: 'Reject out-of-bounds cells ...',
          12: "... cells already on this frame's path ...",
          13: '... or wrong letters — discard frame, nothing to undo',
          14: 'Extend the path with a copy (frames never share mutable state)',
          15: 'Matched the final letter — word found',
          16: 'Otherwise fan out in all four directions',
          17: 'Each child frame inherits the extended path',
          21: 'Stack empty: no path spells the word',
        },
        java: {
          1: 'Define method taking board and word',
          2: 'Get board dimensions',
          3: 'A frame carries position, match index, and its own path',
          4: 'Explicit stack replaces the call stack',
          5: 'Scan every row ...',
          6: '... and column',
          7: 'Only cells matching the first letter can start the word',
          8: 'Seed a frame with an empty path for each starting cell',
          10: 'Depth-first: keep popping until the stack drains',
          11: 'Pop the most recent frame (LIFO)',
          12: 'Unpack position and match index',
          13: "Unpack this frame's path",
          14: 'Reject out-of-bounds cells',
          15: 'Effectively-final copies for the lambda below',
          16: "Reject cells already on this frame's path",
          17: 'Reject wrong letters — discard frame, nothing to undo',
          18: 'Copy the path (frames never share mutable state)',
          19: 'Extend it with the current cell',
          20: 'Matched the final letter — word found',
          21: 'The four exploration directions',
          22: 'Fan out in all four directions',
          23: 'Each child frame inherits the extended path',
          25: 'Stack empty: no path spells the word',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking board and word',
      2: 'Get board dimensions',
      4: 'Define recursive DFS backtrack helper',
      5: 'Base case: all chars matched, word found',
      6: 'Return True for successful match',
      7: 'Check bounds and character match',
      8: 'Continuation of boundary check',
      9: 'Return False if out of bounds or mismatch',
      11: 'Save current cell value before marking',
      12: 'Mark cell as visited with "#"',
      14: 'Try all four directions (right,left,down,up)',
      15: 'Recurse in each direction with next index',
      16: 'If any direction finds word, return True',
      18: 'Restore cell value (backtrack)',
      19: 'No direction worked, return False',
      21: 'Try each cell as a starting point',
      22: 'Iterate over columns',
      23: 'Start DFS from this cell',
      24: 'Return True if word found',
      25: 'Word not found in any starting cell',
    },
    javascript: {
      1: 'Define function taking board and word',
      2: 'Get number of rows',
      3: 'Get number of columns',
      5: 'Define recursive DFS backtrack helper',
      6: 'Base case: all chars matched, word found',
      7: 'Check bounds and character match',
      8: 'Continuation of boundary check',
      9: 'Return false if invalid',
      11: 'Save current cell value before marking',
      12: 'Mark cell as visited with "#"',
      14: 'Define four directions array',
      15: 'Try each direction',
      16: 'Recurse in direction with next index',
      17: 'Return true if found',
      20: 'Restore cell value (backtrack)',
      21: 'No direction worked, return false',
      24: 'Try each cell as a starting point',
      25: 'Iterate over columns',
      26: 'Start DFS from cell, return if found',
      27: 'Word not found in any starting cell',
    },
    java: {
      1: 'Define method taking board and word',
      2: 'Get number of rows',
      3: 'Get number of columns',
      5: 'Try each cell as a starting point',
      6: 'Iterate over columns',
      7: 'Start DFS from this cell',
      8: 'Return true if word found',
      12: 'Return false if no start works',
      15: 'Define recursive backtrack helper',
      16: 'Base case: all chars matched',
      17: 'Check bounds and character match',
      18: 'Return false if invalid',
      20: 'Save current cell value',
      21: 'Mark cell as visited',
      23: 'Try all four directions recursively',
      24: 'Check down, up, right, left',
      25: 'Continuation of direction checks',
      26: 'Continuation of direction checks',
      28: 'Restore cell value (backtrack)',
      29: 'Return whether any direction succeeded',
    },
  },
};
