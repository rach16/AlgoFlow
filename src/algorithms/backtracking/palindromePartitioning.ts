import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPalindromePartitioning(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const result: string[][] = [];

  steps.push({
    state: {
      chars: s.split(''),
      stack: [],
      result: [],
    },
    highlights: [],
    message: `Partition "${s}" into all possible palindrome substrings`,
    codeLine: 1,
  });

  function isPalindrome(str: string, left: number, right: number): boolean {
    while (left < right) {
      if (str[left] !== str[right]) return false;
      left++;
      right--;
    }
    return true;
  }

  function backtrack(start: number, current: string[]) {
    if (start === s.length) {
      result.push([...current]);

      steps.push({
        state: {
          chars: s.split(''),
          stack: [...current],
          result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
        },
        highlights: Array.from({ length: s.length }, (_, i) => i),
        message: `Found partition: [${current.map((p) => `"${p}"`).join(', ')}] (total: ${result.length})`,
        codeLine: 5,
        action: 'found',
      });
      return;
    }

    for (let end = start; end < s.length; end++) {
      const substr = s.substring(start, end + 1);

      // Highlight the substring being checked
      const substringIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);

      if (!isPalindrome(s, start, end)) {
        steps.push({
          state: {
            chars: s.split(''),
            stack: [...current],
            result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
          },
          highlights: substringIndices,
          message: `Check "${substr}" (index ${start}-${end}): not a palindrome, skip`,
          codeLine: 8,
        });
        continue;
      }

      steps.push({
        state: {
          chars: s.split(''),
          stack: [...current],
          result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
        },
        highlights: substringIndices,
        message: `Check "${substr}" (index ${start}-${end}): is a palindrome!`,
        codeLine: 10,
        action: 'compare',
      });

      // Choose
      current.push(substr);

      steps.push({
        state: {
          chars: s.split(''),
          stack: [...current],
          result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
        },
        highlights: substringIndices,
        message: `Add "${substr}" to partition -> [${current.map((p) => `"${p}"`).join(', ')}]`,
        codeLine: 12,
        action: 'push',
      });

      // Explore from end + 1
      backtrack(end + 1, current);

      // Unchoose
      const removed = current.pop()!;

      steps.push({
        state: {
          chars: s.split(''),
          stack: [...current],
          result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
        },
        highlights: substringIndices,
        message: `Backtrack: remove "${removed}" -> [${current.map((p) => `"${p}"`).join(', ')}]`,
        codeLine: 14,
        action: 'pop',
      });
    }
  }

  backtrack(0, []);

  steps.push({
    state: {
      chars: s.split(''),
      stack: [],
      result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
    },
    highlights: [],
    message: `Done! Found ${result.length} palindrome partitions`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

function runPalindromePartitioningDP(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const n = s.length;
  const steps: AlgorithmStep[] = [];
  const result: string[][] = [];
  const STEP_BUDGET = 70;
  let suppressed = 0;

  const isPal: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));

  steps.push({
    state: { chars: s.split(''), stack: [], result: [] },
    highlights: [],
    message: `Phase 1: precompute an isPal[start][end] table so the DFS never re-scans a substring. Short palindromes prove longer ones: s[i..j] is a palindrome iff s[i] == s[j] and s[i+1..j-1] is`,
    codeLine: 4,
  });

  for (let end = 0; end < n; end++) {
    const foundHere: string[] = [];
    const starts: number[] = [];
    for (let start = 0; start <= end; start++) {
      if (s[start] === s[end] && (end - start < 2 || isPal[start + 1][end - 1])) {
        isPal[start][end] = true;
        foundHere.push(`"${s.substring(start, end + 1)}"`);
        starts.push(start);
      }
    }

    steps.push({
      state: { chars: s.split(''), stack: [], result: [] },
      highlights: [end],
      secondary: starts,
      message: `end = ${end} ('${s[end]}'): palindromes ending here: ${foundHere.length > 0 ? foundHere.join(', ') : 'none'}`,
      codeLine: 9,
      action: 'compare',
    });
  }

  steps.push({
    state: { chars: s.split(''), stack: [], result: [] },
    highlights: [],
    message: `Phase 2: run the same DFS, but every palindrome check is now an O(1) table lookup instead of an O(n) scan`,
    codeLine: 13,
  });

  function backtrack(start: number, current: string[]) {
    if (start === n) {
      result.push([...current]);

      steps.push({
        state: {
          chars: s.split(''),
          stack: [...current],
          result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
        },
        highlights: Array.from({ length: n }, (_, i) => i),
        message: `Found partition: [${current.map((p) => `"${p}"`).join(', ')}] (total: ${result.length})`,
        codeLine: 15,
        action: 'found',
      });
      return;
    }

    for (let end = start; end < n; end++) {
      const substr = s.substring(start, end + 1);
      const substringIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);

      if (!isPal[start][end]) {
        if (steps.length < STEP_BUDGET) {
          steps.push({
            state: {
              chars: s.split(''),
              stack: [...current],
              result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
            },
            highlights: substringIndices,
            message: `isPal[${start}][${end}] is false — skip "${substr}" without scanning it`,
            codeLine: 18,
          });
        } else {
          suppressed++;
        }
        continue;
      }

      if (steps.length < STEP_BUDGET) {
        steps.push({
          state: {
            chars: s.split(''),
            stack: [...current, substr],
            result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
          },
          highlights: substringIndices,
          message: `isPal[${start}][${end}] is true — add "${substr}" via table lookup, no re-scan`,
          codeLine: 19,
          action: 'push',
        });
      } else {
        suppressed++;
      }

      current.push(substr);
      backtrack(end + 1, current);
      const removed = current.pop()!;

      if (steps.length < STEP_BUDGET) {
        steps.push({
          state: {
            chars: s.split(''),
            stack: [...current],
            result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
          },
          highlights: substringIndices,
          message: `Backtrack: remove "${removed}" -> [${current.map((p) => `"${p}"`).join(', ')}]`,
          codeLine: 21,
          action: 'pop',
        });
      } else {
        suppressed++;
      }
    }
  }

  backtrack(0, []);

  steps.push({
    state: {
      chars: s.split(''),
      stack: [],
      result: result.map((r) => `[${r.map((p) => `"${p}"`).join(',')}]`),
    },
    highlights: [],
    message: `Done! Found ${result.length} palindrome partitions${suppressed > 0 ? ` (${suppressed} similar steps not shown)` : ''} — the O(n²) table paid for itself by making every check O(1)`,
    codeLine: 24,
    action: 'found',
  });

  return steps;
}

export const palindromePartitioning: Algorithm = {
  id: 'palindrome-partitioning',
  name: 'Palindrome Partitioning',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(n·2ⁿ)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — partition at each index if prefix is palindrome',
  description:
    'Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s. Use backtracking: at each position, try all substrings starting there and recurse if palindrome.',
  problemUrl: 'https://leetcode.com/problems/palindrome-partitioning/',
  code: {
    python: `def partition(s):
    result = []

    def backtrack(start, current):
        if start == len(s):
            result.append(current[:])
            return

        for end in range(start, len(s)):
            substring = s[start:end + 1]
            if isPalindrome(s, start, end):
                current.append(substring)
                backtrack(end + 1, current)
                current.pop()

    def isPalindrome(s, l, r):
        while l < r:
            if s[l] != s[r]:
                return False
            l += 1
            r -= 1
        return True

    backtrack(0, [])
    return result`,
    javascript: `function partition(s) {
    const result = [];

    function isPalindrome(str, l, r) {
        while (l < r) {
            if (str[l] !== str[r]) return false;
            l++;
            r--;
        }
        return true;
    }

    function backtrack(start, current) {
        if (start === s.length) {
            result.push([...current]);
            return;
        }

        for (let end = start; end < s.length; end++) {
            if (isPalindrome(s, start, end)) {
                current.push(s.substring(start, end + 1));
                backtrack(end + 1, current);
                current.pop();
            }
        }
    }

    backtrack(0, []);
    return result;
}`,
    java: `public static List<List<String>> partition(String s) {
    List<List<String>> result = new ArrayList<>();
    backtrack(0, new ArrayList<>(), s, result);
    return result;
}

private static void backtrack(int start, List<String> current, String s, List<List<String>> result) {
    if (start == s.length()) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int end = start; end < s.length(); end++) {
        if (isPalindrome(s, start, end)) {
            current.add(s.substring(start, end + 1));
            backtrack(end + 1, current, s, result);
            current.remove(current.size() - 1);
        }
    }
}

private static boolean isPalindrome(String s, int l, int r) {
    while (l < r) {
        if (s.charAt(l) != s.charAt(r)) return false;
        l++;
        r--;
    }
    return true;
}`,
  },
  defaultInput: 'aab',
  run: runPalindromePartitioning,
  optimalApproachName: 'Backtracking (On-the-fly Check)',
  approaches: [
    {
      id: 'dp-table-dfs',
      name: 'DP Table + DFS',
      timeComplexity: 'O(n·2ⁿ)',
      spaceComplexity: 'O(n²)',
      description:
        'Precomputes an O(n²) palindrome table with interval DP so the DFS replaces every repeated two-pointer scan with an O(1) lookup — trading memory for time on the checks.',
      code: {
        python: `def partition(s):
    n = len(s)
    # isPal[i][j]: s[i..j] is a palindrome
    isPal = [[False] * n for _ in range(n)]
    for end in range(n):
        for start in range(end + 1):
            if s[start] == s[end] and (end - start < 2
                    or isPal[start + 1][end - 1]):
                isPal[start][end] = True

    result = []

    def backtrack(start, current):
        if start == n:
            result.append(current[:])
            return
        for end in range(start, n):
            if isPal[start][end]:
                current.append(s[start:end + 1])
                backtrack(end + 1, current)
                current.pop()

    backtrack(0, [])
    return result`,
        javascript: `function partition(s) {
    const n = s.length;
    // isPal[i][j]: s[i..j] is a palindrome
    const isPal = Array.from({length: n}, () => new Array(n).fill(false));
    for (let end = 0; end < n; end++) {
        for (let start = 0; start <= end; start++) {
            if (s[start] === s[end] &&
                (end - start < 2 || isPal[start + 1][end - 1])) {
                isPal[start][end] = true;
            }
        }
    }

    const result = [];

    function backtrack(start, current) {
        if (start === n) {
            result.push([...current]);
            return;
        }
        for (let end = start; end < n; end++) {
            if (isPal[start][end]) {
                current.push(s.substring(start, end + 1));
                backtrack(end + 1, current);
                current.pop();
            }
        }
    }

    backtrack(0, []);
    return result;
}`,
        java: `public static List<List<String>> partition(String s) {
    int n = s.length();
    boolean[][] isPal = new boolean[n][n];
    for (int end = 0; end < n; end++) {
        for (int start = 0; start <= end; start++) {
            if (s.charAt(start) == s.charAt(end) &&
                (end - start < 2 || isPal[start + 1][end - 1])) {
                isPal[start][end] = true;
            }
        }
    }

    List<List<String>> result = new ArrayList<>();
    backtrack(0, new ArrayList<>(), s, isPal, result);
    return result;
}

private static void backtrack(int start, List<String> current, String s,
                              boolean[][] isPal, List<List<String>> result) {
    if (start == s.length()) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (int end = start; end < s.length(); end++) {
        if (isPal[start][end]) {
            current.add(s.substring(start, end + 1));
            backtrack(end + 1, current, s, isPal, result);
            current.remove(current.size() - 1);
        }
    }
}`,
      },
      run: runPalindromePartitioningDP,
      lineExplanations: {
        python: {
          1: 'Define function taking string s',
          2: 'Cache the string length',
          3: 'Table answer: is s[i..j] a palindrome?',
          4: 'Initialize the n x n table to False',
          5: 'Fill by increasing end index ...',
          6: '... considering every start up to end',
          7: 'Palindrome iff the outer chars match and ...',
          8: '... the inside is short (< 2 chars) or already a palindrome',
          9: 'Record the verdict — computed once, reused forever',
          11: 'Initialize list to store partitions',
          13: 'Same DFS as the main solution',
          14: 'Base case: reached end of string',
          15: 'Save copy of current partition',
          16: 'Return after saving',
          17: 'Try every cut point from start onward',
          18: 'The check is now an O(1) table lookup, not a scan',
          19: 'Choose: add the palindrome substring',
          20: 'Recurse from just past the cut',
          21: 'Unchoose: remove last substring',
          23: 'Start backtracking from index 0',
          24: 'Return all palindrome partitions',
        },
        javascript: {
          1: 'Define function taking string s',
          2: 'Cache the string length',
          3: 'Table answers: is s[i..j] a palindrome?',
          4: 'Initialize the n x n table to false',
          5: 'Fill by increasing end index ...',
          6: '... considering every start up to end',
          7: 'Palindrome iff the outer chars match and ...',
          8: '... the inside is short (< 2 chars) or already a palindrome',
          9: 'Record the verdict — computed once, reused forever',
          14: 'Initialize array to store partitions',
          16: 'Same DFS as the main solution',
          17: 'Base case: reached end of string',
          18: 'Save copy of current partition',
          19: 'Return after saving',
          21: 'Try every cut point from start onward',
          22: 'The check is now an O(1) table lookup, not a scan',
          23: 'Choose: add the palindrome substring',
          24: 'Recurse from just past the cut',
          25: 'Unchoose: remove last substring',
          30: 'Start backtracking from index 0',
          31: 'Return all palindrome partitions',
        },
        java: {
          1: 'Define method returning list of partitions',
          2: 'Cache the string length',
          3: 'Table answers: is s[i..j] a palindrome?',
          4: 'Fill by increasing end index ...',
          5: '... considering every start up to end',
          6: 'Palindrome iff the outer chars match and ...',
          7: '... the inside is short (< 2 chars) or already a palindrome',
          8: 'Record the verdict — computed once, reused forever',
          13: 'Initialize result list',
          14: 'Start backtracking from index 0',
          15: 'Return all palindrome partitions',
          18: 'Same DFS as the main solution',
          19: 'Helper receives the precomputed table',
          20: 'Base case: reached end of string',
          21: 'Save copy of current partition',
          22: 'Return after saving',
          24: 'Try every cut point from start onward',
          25: 'The check is now an O(1) table lookup, not a scan',
          26: 'Choose: add the palindrome substring',
          27: 'Recurse from just past the cut',
          28: 'Unchoose: remove last substring',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s',
      2: 'Initialize list to store partitions',
      4: 'Define recursive backtrack helper',
      5: 'Base case: reached end of string',
      6: 'Save copy of current partition to result',
      7: 'Return after saving partition',
      9: 'Try all substrings from start to end',
      10: 'Extract substring from start to end+1',
      11: 'Only proceed if substring is palindrome',
      12: 'Choose: add palindrome to partition',
      13: 'Recurse from position after substring',
      14: 'Unchoose: remove last substring',
      16: 'Define palindrome check helper',
      17: 'Compare chars moving inward',
      18: 'If mismatch found, not a palindrome',
      19: 'Return False on mismatch',
      20: 'Move left pointer right',
      21: 'Move right pointer left',
      22: 'All chars matched, is palindrome',
      24: 'Start backtracking from index 0',
      25: 'Return all palindrome partitions',
    },
    javascript: {
      1: 'Define function taking string s',
      2: 'Initialize array to store partitions',
      4: 'Define palindrome check helper',
      5: 'Compare chars moving inward',
      6: 'If mismatch, not a palindrome',
      7: 'Move left pointer right',
      8: 'Move right pointer left',
      10: 'All chars matched, return true',
      12: 'Define recursive backtrack helper',
      13: 'Base case: reached end of string',
      14: 'Save copy of current partition',
      15: 'Return after saving',
      18: 'Try all end positions from start onward',
      19: 'Only proceed if substring is palindrome',
      20: 'Choose: add palindrome substring',
      21: 'Recurse from position after substring',
      22: 'Unchoose: remove last substring',
      26: 'Start backtracking from index 0',
      27: 'Return all palindrome partitions',
    },
    java: {
      1: 'Define method returning list of partitions',
      2: 'Initialize result list',
      3: 'Start backtracking from index 0',
      4: 'Return all palindrome partitions',
      7: 'Define recursive backtrack helper',
      8: 'Base case: reached end of string',
      9: 'Save copy of current partition',
      10: 'Return after saving',
      13: 'Try all end positions from start onward',
      14: 'Only proceed if substring is palindrome',
      15: 'Choose: add palindrome substring',
      16: 'Recurse from position after substring',
      17: 'Unchoose: remove last substring',
      22: 'Define palindrome check helper',
      23: 'Compare chars moving inward',
      24: 'If mismatch, return false',
      25: 'Move left pointer right',
      26: 'Move right pointer left',
      28: 'All chars matched, return true',
    },
  },
};
