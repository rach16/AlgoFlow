import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function rangeIndices(from: number, to: number): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i++) out.push(i);
  return out;
}

function isPalindromeSlice(chars: string[], from: number, to: number): boolean {
  let i = from;
  let j = to;
  while (i < j) {
    if (chars[i] !== chars[j]) return false;
    i++;
    j--;
  }
  return true;
}

function runValidPalindromeII(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const chars = s.split('');
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { chars },
    highlights: [],
    message: `Can "${s}" become a palindrome by deleting at most ONE character? Walk inward from both ends and spend the single deletion only when forced`,
    codeLine: 1,
  });

  let left = 0;
  let right = chars.length - 1;

  steps.push({
    state: { chars },
    highlights: [left, right],
    pointers: { left, right },
    message: `left=0, right=${right}. While the ends agree, no deletion is needed — a palindrome must match at every mirrored pair`,
    codeLine: 2,
  });

  while (left < right) {
    steps.push({
      state: { chars },
      highlights: [left, right],
      pointers: { left, right },
      message: `Compare '${chars[left]}' at ${left} with '${chars[right]}' at ${right}`,
      codeLine: 5,
      action: 'compare',
    });

    if (chars[left] !== chars[right]) {
      steps.push({
        state: { chars },
        highlights: [left, right],
        pointers: { left, right },
        message: `'${chars[left]}' ≠ '${chars[right]}' — the mismatch must be fixed by deleting ONE of these two characters. Nothing outside this pair can help, so there are exactly two candidates`,
        codeLine: 5,
      });

      const leftSlice = chars.slice(left + 1, right + 1).join('');
      const leftOk = isPalindromeSlice(chars, left + 1, right);

      steps.push({
        state: { chars },
        highlights: [left],
        secondary: rangeIndices(left + 1, right),
        pointers: { delete: left },
        message: `Candidate 1 — delete '${chars[left]}' at index ${left}. What remains between the pointers is "${leftSlice}": ${leftOk ? 'a palindrome ✓' : 'NOT a palindrome ✗'}`,
        codeLine: 6,
        action: leftOk ? 'found' : 'compare',
      });

      const rightSlice = chars.slice(left, right).join('');
      const rightOk = isPalindromeSlice(chars, left, right - 1);

      steps.push({
        state: { chars },
        highlights: [right],
        secondary: rangeIndices(left, right - 1),
        pointers: { delete: right },
        message: `Candidate 2 — delete '${chars[right]}' at index ${right}. What remains is "${rightSlice}": ${rightOk ? 'a palindrome ✓' : 'NOT a palindrome ✗'}`,
        codeLine: 7,
        action: rightOk ? 'found' : 'compare',
      });

      steps.push({
        state: { chars, result: leftOk || rightOk },
        highlights: [left, right],
        pointers: { left, right },
        message: leftOk || rightOk
          ? `One deletion was enough — return True. Note the outer characters already matched, so only this inner window ever needed checking`
          : `Neither deletion rescues it, and we are not allowed a second one — return False`,
        codeLine: 8,
        action: 'found',
      });

      return steps;
    }

    steps.push({
      state: { chars },
      highlights: [left, right],
      pointers: { left, right },
      message: `'${chars[left]}' === '${chars[right]}' — this mirrored pair is fine, no deletion spent. Move both pointers inward`,
      codeLine: 9,
    });

    left++;
    right--;
  }

  steps.push({
    state: { chars, result: true },
    highlights: [],
    message: `The pointers met without a single mismatch — "${s}" is already a palindrome, so zero deletions (which is "at most one") suffice`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runValidPalindromeIIHelper(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const chars = s.split('');
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { chars },
    highlights: [],
    message: `Same greedy idea, but the candidate check is a helper that scans with two pointers instead of building a reversed copy — O(1) extra space`,
    codeLine: 1,
  });

  let left = 0;
  let right = chars.length - 1;

  steps.push({
    state: { chars },
    highlights: [left, right],
    pointers: { left, right },
    message: `Outer scan starts at left=0, right=${right}`,
    codeLine: 10,
  });

  const checkWithSteps = (from: number, to: number, label: string): boolean => {
    let i = from;
    let j = to;
    let verdict = true;

    steps.push({
      state: { chars },
      highlights: [],
      secondary: rangeIndices(from, to),
      pointers: { i, j },
      message: `${label}: call is_palindrome(${from}, ${to}) — it re-uses the two-pointer scan on just this window`,
      codeLine: 2,
    });

    while (i < j) {
      steps.push({
        state: { chars },
        highlights: [i, j],
        secondary: rangeIndices(from, to),
        pointers: { i, j },
        message: `${label}: '${chars[i]}' vs '${chars[j]}' — ${chars[i] === chars[j] ? 'match, keep scanning' : 'mismatch, this candidate fails'}`,
        codeLine: 4,
        action: 'compare',
      });

      if (chars[i] !== chars[j]) {
        verdict = false;
        steps.push({
          state: { chars },
          highlights: [i, j],
          pointers: { i, j },
          message: `${label}: return False — deleting that character does not produce a palindrome`,
          codeLine: 5,
        });
        break;
      }

      i++;
      j--;
    }

    if (verdict) {
      steps.push({
        state: { chars },
        highlights: [],
        secondary: rangeIndices(from, to),
        message: `${label}: pointers met with every pair matching — return True`,
        codeLine: 8,
        action: 'found',
      });
    }

    return verdict;
  };

  while (left < right) {
    steps.push({
      state: { chars },
      highlights: [left, right],
      pointers: { left, right },
      message: `Compare '${chars[left]}' at ${left} with '${chars[right]}' at ${right}`,
      codeLine: 12,
      action: 'compare',
    });

    if (chars[left] !== chars[right]) {
      const leftOk = checkWithSteps(left + 1, right, `Skip left '${chars[left]}'`);
      let rightOk = false;
      if (!leftOk) {
        rightOk = checkWithSteps(left, right - 1, `Skip right '${chars[right]}'`);
      } else {
        steps.push({
          state: { chars },
          highlights: [left],
          pointers: { left, right },
          message: `The first helper call already returned True, so Python's \`or\` short-circuits and the second call never runs`,
          codeLine: 13,
        });
      }

      steps.push({
        state: { chars, result: leftOk || rightOk },
        highlights: [left, right],
        pointers: { left, right },
        message: leftOk || rightOk
          ? `is_palindrome(...) or is_palindrome(...) evaluated True — one deletion is enough`
          : `Both helper calls returned False — one deletion cannot fix this string`,
        codeLine: 13,
        action: 'found',
      });

      return steps;
    }

    steps.push({
      state: { chars },
      highlights: [left, right],
      pointers: { left, right },
      message: `Match — advance both pointers without spending the deletion`,
      codeLine: 14,
    });

    left++;
    right--;
  }

  steps.push({
    state: { chars, result: true },
    highlights: [],
    message: `No mismatch ever occurred — already a palindrome, return True`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const validPalindromeII: Algorithm = {
  id: 'valid-palindrome-ii',
  name: 'Valid Palindrome II',
  category: 'Two Pointers',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Two Pointers — converge from both ends',
  description:
    'Given a string s, return true if it can be a palindrome after deleting at most one character from it. The scan is greedy: at the first mismatched pair, the deletion must remove one of those two characters.',
  problemUrl: 'https://leetcode.com/problems/valid-palindrome-ii/',
  code: {
    python: `def validPalindrome(s):
    left, right = 0, len(s) - 1

    while left < right:
        if s[left] != s[right]:
            skip_left = s[left + 1:right + 1]
            skip_right = s[left:right]
            return skip_left == skip_left[::-1] or skip_right == skip_right[::-1]
        left += 1
        right -= 1

    return True`,
    javascript: `function validPalindrome(s) {
    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        if (s[left] !== s[right]) {
            const skipLeft = s.slice(left + 1, right + 1);
            const skipRight = s.slice(left, right);
            const rev = (t) => t.split('').reverse().join('');
            return skipLeft === rev(skipLeft) || skipRight === rev(skipRight);
        }
        left++;
        right--;
    }

    return true;
}`,
    java: `public static boolean validPalindrome(String s) {
    int left = 0;
    int right = s.length() - 1;

    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) {
            String skipLeft = s.substring(left + 1, right + 1);
            String skipRight = s.substring(left, right);
            return isSame(skipLeft) || isSame(skipRight);
        }
        left++;
        right--;
    }

    return true;
}

private static boolean isSame(String t) {
    return t.equals(new StringBuilder(t).reverse().toString());
}`,
  },
  defaultInput: 'abccdba',
  run: runValidPalindromeII,
  optimalApproachName: 'Two Pointers + One Deletion',
  approaches: [
    {
      id: 'helper-greedy-check',
      name: 'Helper Greedy Check',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Verify each deletion candidate with a two-pointer helper over an index range instead of slicing and reversing, dropping the extra O(n) substring copies to O(1) space.',
      code: {
        python: `def validPalindrome(s):
    def is_palindrome(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True

    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return is_palindrome(left + 1, right) or is_palindrome(left, right - 1)
        left += 1
        right -= 1

    return True`,
        javascript: `function validPalindrome(s) {
    const isPalindrome = (i, j) => {
        while (i < j) {
            if (s[i] !== s[j]) return false;
            i++;
            j--;
        }
        return true;
    };

    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) {
            return isPalindrome(left + 1, right) || isPalindrome(left, right - 1);
        }
        left++;
        right--;
    }

    return true;
}`,
        java: `public static boolean validPalindrome(String s) {
    int left = 0;
    int right = s.length() - 1;

    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) {
            return isPalindrome(s, left + 1, right) || isPalindrome(s, left, right - 1);
        }
        left++;
        right--;
    }

    return true;
}

private static boolean isPalindrome(String s, int i, int j) {
    while (i < j) {
        if (s.charAt(i) != s.charAt(j)) return false;
        i++;
        j--;
    }
    return true;
}`,
      },
      run: runValidPalindromeIIHelper,
      lineExplanations: {
        python: {
          1: 'Define function taking the string',
          2: 'Helper checks one index window without copying the string',
          3: 'Standard two-pointer palindrome scan over [i, j]',
          4: 'Mirrored characters must be equal',
          5: 'A mismatch inside the window means this candidate fails',
          6: 'Advance the left index of the window',
          7: 'Retreat the right index of the window',
          8: 'Pointers met with no mismatch — window is a palindrome',
          10: 'Outer scan pointers at both ends of the string',
          11: 'Walk inward while the ends agree',
          12: 'First mismatch — the one deletion must land here',
          13: 'Try deleting the left char, else the right char (or short-circuits)',
          14: 'Ends matched, move the left pointer inward',
          15: 'Move the right pointer inward',
          17: 'Never mismatched — already a palindrome',
        },
        javascript: {
          1: 'Define function taking the string',
          2: 'Helper checks one index window without copying the string',
          3: 'Standard two-pointer palindrome scan over [i, j]',
          4: 'A mismatch inside the window means this candidate fails',
          5: 'Advance the left index of the window',
          6: 'Retreat the right index of the window',
          8: 'Pointers met with no mismatch — window is a palindrome',
          11: 'Outer left pointer at the start',
          12: 'Outer right pointer at the end',
          13: 'Walk inward while the ends agree',
          14: 'First mismatch — the one deletion must land here',
          15: 'Try deleting the left char, else the right char (|| short-circuits)',
          17: 'Ends matched, move the left pointer inward',
          18: 'Move the right pointer inward',
          21: 'Never mismatched — already a palindrome',
        },
        java: {
          1: 'Define function taking the string',
          2: 'Outer left pointer at the start',
          3: 'Outer right pointer at the end',
          5: 'Walk inward while the ends agree',
          6: 'First mismatch — the one deletion must land here',
          7: 'Try deleting the left char, else the right char (|| short-circuits)',
          9: 'Ends matched, move the left pointer inward',
          10: 'Move the right pointer inward',
          13: 'Never mismatched — already a palindrome',
          16: 'Helper checks one index window without copying the string',
          17: 'Standard two-pointer palindrome scan over [i, j]',
          18: 'A mismatch inside the window means this candidate fails',
          19: 'Advance the left index of the window',
          20: 'Retreat the right index of the window',
          22: 'Pointers met with no mismatch — window is a palindrome',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the string',
      2: 'Place pointers at both ends',
      4: 'Walk inward while the ends still agree',
      5: 'First mismatch — the single deletion has to remove s[left] or s[right]',
      6: 'Candidate 1: the window left after deleting s[left]',
      7: 'Candidate 2: the window left after deleting s[right]',
      8: 'True if either candidate window reads the same reversed',
      9: 'Ends matched, move the left pointer inward',
      10: 'Move the right pointer inward',
      12: 'Never mismatched — already a palindrome, zero deletions needed',
    },
    javascript: {
      1: 'Define function taking the string',
      2: 'Left pointer at the start',
      3: 'Right pointer at the end',
      5: 'Walk inward while the ends still agree',
      6: 'First mismatch — the single deletion has to remove s[left] or s[right]',
      7: 'Candidate 1: the window left after deleting s[left]',
      8: 'Candidate 2: the window left after deleting s[right]',
      9: 'Small helper that reverses a string',
      10: 'True if either candidate window reads the same reversed',
      12: 'Ends matched, move the left pointer inward',
      13: 'Move the right pointer inward',
      16: 'Never mismatched — already a palindrome, zero deletions needed',
    },
    java: {
      1: 'Define function taking the string',
      2: 'Left pointer at the start',
      3: 'Right pointer at the end',
      5: 'Walk inward while the ends still agree',
      6: 'First mismatch — the single deletion has to remove s[left] or s[right]',
      7: 'Candidate 1: the window left after deleting s.charAt(left)',
      8: 'Candidate 2: the window left after deleting s.charAt(right)',
      9: 'True if either candidate window reads the same reversed',
      11: 'Ends matched, move the left pointer inward',
      12: 'Move the right pointer inward',
      15: 'Never mismatched — already a palindrome, zero deletions needed',
      18: 'Helper compares a string against its reverse',
      19: 'StringBuilder.reverse() builds the reversed copy',
    },
  },
};
