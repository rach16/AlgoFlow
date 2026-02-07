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
};
