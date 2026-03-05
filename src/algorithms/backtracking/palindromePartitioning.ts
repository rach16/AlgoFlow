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
