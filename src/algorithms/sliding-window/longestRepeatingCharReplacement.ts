import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CharReplacementInput {
  s: string;
  k: number;
}

function runLongestRepeatingCharReplacement(input: unknown): AlgorithmStep[] {
  const { s, k } = input as CharReplacementInput;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');
  const count: Record<string, number> = {};

  // Initial state
  steps.push({
    state: { chars: [...chars], count: {}, result: 0, k },
    highlights: [],
    message: `Find the longest substring with at most ${k} character replacements in "${s}"`,
    codeLine: 1,
  });

  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;

  for (let right = 0; right < chars.length; right++) {
    const char = chars[right];

    // Increment count for current character
    count[char] = (count[char] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[char]);

    steps.push({
      state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Add '${char}' to window. count['${char}'] = ${count[char]}. maxFreq = ${maxFreq}`,
      codeLine: 5,
      action: 'visit',
    });

    // Window size - maxFreq > k means we need more than k replacements
    const windowSize = right - left + 1;
    const replacementsNeeded = windowSize - maxFreq;

    steps.push({
      state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Window size=${windowSize}, maxFreq=${maxFreq}, replacements needed=${replacementsNeeded} (k=${k})`,
      codeLine: 7,
      action: 'compare',
    });

    if (replacementsNeeded > k) {
      // Shrink window from left
      const removedChar = chars[left];
      count[removedChar]--;

      steps.push({
        state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
        highlights: Array.from({ length: right - left }, (_, i) => left + 1 + i),
        pointers: { left: left + 1, right },
        message: `Replacements needed (${replacementsNeeded}) > k (${k}). Remove '${removedChar}' from left, shrink window.`,
        codeLine: 9,
        action: 'delete',
      });

      left++;
    } else {
      // Update max length
      const currentLen = right - left + 1;
      if (currentLen > maxLen) {
        maxLen = currentLen;
        steps.push({
          state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
          highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
          pointers: { left, right },
          message: `Valid window! "${s.slice(left, right + 1)}" length=${currentLen}. Update maxLen = ${maxLen}`,
          codeLine: 11,
          action: 'found',
        });
      }
    }
  }

  // Final result
  steps.push({
    state: { chars: [...chars], count: { ...count }, result: maxLen, k },
    highlights: [],
    message: `Longest repeating character replacement substring has length ${maxLen}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runCharReplacementBinarySearch(input: unknown): AlgorithmStep[] {
  const { s, k } = input as CharReplacementInput;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');
  let best = 0;

  steps.push({
    state: { chars: [...chars], count: {}, result: 0, k },
    highlights: [],
    message: `Binary search the answer: if a window of length L needs at most ${k} replacements, so does every shorter length — feasibility is monotone, so we can binary search L`,
    codeLine: 1,
  });

  const valid = (length: number): boolean => {
    const count: Record<string, number> = {};
    let maxFreq = 0;

    for (let right = 0; right < chars.length; right++) {
      const c = chars[right];
      count[c] = (count[c] || 0) + 1;
      maxFreq = Math.max(maxFreq, count[c]);

      if (right >= length) {
        count[chars[right - length]]--;
      }

      if (right >= length - 1) {
        const leftIdx = right - length + 1;
        const ok = length - maxFreq <= k;

        steps.push({
          state: { chars: [...chars], count: { ...count }, result: best, k, maxFreq },
          highlights: Array.from({ length }, (_, i) => leftIdx + i),
          pointers: { left: leftIdx, right },
          message: ok
            ? `Window "${s.slice(leftIdx, right + 1)}": ${length} - maxFreq(${maxFreq}) = ${length - maxFreq} <= k — length ${length} is achievable!`
            : `Window "${s.slice(leftIdx, right + 1)}": needs ${length - maxFreq} replacements > k=${k} — slide the fixed window on`,
          codeLine: 10,
          action: ok ? 'found' : 'compare',
        });

        if (ok) return true;
      }
    }
    return false;
  };

  let lo = 1;
  let hi = chars.length;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    steps.push({
      state: { chars: [...chars], count: {}, result: best, k },
      highlights: [],
      message: `Search range [${lo}, ${hi}] — test whether some window of length ${mid} is fixable with ${k} replacements`,
      codeLine: 16,
      action: 'visit',
    });

    if (valid(mid)) {
      best = Math.max(best, mid);
      lo = mid + 1;
      steps.push({
        state: { chars: [...chars], count: {}, result: best, k },
        highlights: [],
        message: `Length ${mid} works — be greedy and search for something even longer (lo = ${lo})`,
        codeLine: 18,
        action: 'visit',
      });
    } else {
      hi = mid - 1;
      steps.push({
        state: { chars: [...chars], count: {}, result: best, k },
        highlights: [],
        message: `No window of length ${mid} works — search shorter lengths (hi = ${hi})`,
        codeLine: 20,
        action: 'visit',
      });
    }
  }

  steps.push({
    state: { chars: [...chars], count: {}, result: best, k },
    highlights: [],
    message: `Binary search converged: longest achievable length is ${best}. Cost O(n log n) vs the sliding window's O(n) — a classic trade of speed for a simpler invariant`,
    codeLine: 21,
    action: 'found',
  });

  return steps;
}

export const longestRepeatingCharReplacement: Algorithm = {
  id: 'longest-repeating-character-replacement',
  name: 'Longest Repeating Character Replacement',
  category: 'Sliding Window',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Sliding Window — window size minus max freq ≤ k',
  description:
    'You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.',
  problemUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
  code: {
    python: `def characterReplacement(s, k):
    count = {}
    left = 0
    max_freq = 0
    max_len = 0

    for right in range(len(s)):
        count[s[right]] = count.get(s[right], 0) + 1
        max_freq = max(max_freq, count[s[right]])

        if (right - left + 1) - max_freq > k:
            count[s[left]] -= 1
            left += 1
        else:
            max_len = max(max_len, right - left + 1)

    return max_len`,
    javascript: `function characterReplacement(s, k) {
    const count = {};
    let left = 0;
    let maxFreq = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        count[s[right]] = (count[s[right]] || 0) + 1;
        maxFreq = Math.max(maxFreq, count[s[right]]);

        if ((right - left + 1) - maxFreq > k) {
            count[s[left]]--;
            left++;
        } else {
            maxLen = Math.max(maxLen, right - left + 1);
        }
    }

    return maxLen;
}`,
    java: `public static int characterReplacement(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int left = 0;
    int maxFreq = 0;
    int maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        count.put(c, count.getOrDefault(c, 0) + 1);
        maxFreq = Math.max(maxFreq, count.get(c));

        if ((right - left + 1) - maxFreq > k) {
            count.put(s.charAt(left), count.get(s.charAt(left)) - 1);
            left++;
        } else {
            maxLen = Math.max(maxLen, right - left + 1);
        }
    }

    return maxLen;
}`,
  },
  defaultInput: { s: 'AABABBA', k: 1 },
  run: runLongestRepeatingCharReplacement,
  optimalApproachName: 'Sliding Window',
  approaches: [
    {
      id: 'binary-search-length',
      name: 'Binary Search on Length',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(m)',
      description:
        'Rather than growing and shrinking one adaptive window, binary search the answer length L and check each candidate with a fixed-size window scan — feasibility is monotone in L.',
      code: {
        python: `def characterReplacement(s, k):
    def valid(length):
        count = {}
        max_freq = 0
        for right in range(len(s)):
            count[s[right]] = count.get(s[right], 0) + 1
            max_freq = max(max_freq, count[s[right]])
            if right >= length:
                count[s[right - length]] -= 1
            if right >= length - 1 and length - max_freq <= k:
                return True
        return False

    lo, hi = 1, len(s)
    while lo <= hi:
        mid = (lo + hi) // 2
        if valid(mid):
            lo = mid + 1
        else:
            hi = mid - 1
    return hi`,
        javascript: `function characterReplacement(s, k) {
    const valid = (length) => {
        const count = {};
        let maxFreq = 0;
        for (let right = 0; right < s.length; right++) {
            count[s[right]] = (count[s[right]] || 0) + 1;
            maxFreq = Math.max(maxFreq, count[s[right]]);
            if (right >= length) count[s[right - length]]--;
            if (right >= length - 1 && length - maxFreq <= k) return true;
        }
        return false;
    };

    let lo = 1, hi = s.length;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (valid(mid)) lo = mid + 1;
        else hi = mid - 1;
    }
    return hi;
}`,
        java: `public static int characterReplacement(String s, int k) {
    int lo = 1, hi = s.length();
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (valid(s, k, mid)) lo = mid + 1;
        else hi = mid - 1;
    }
    return hi;
}

private static boolean valid(String s, int k, int length) {
    Map<Character, Integer> count = new HashMap<>();
    int maxFreq = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        count.put(c, count.getOrDefault(c, 0) + 1);
        maxFreq = Math.max(maxFreq, count.get(c));
        if (right >= length) {
            char out = s.charAt(right - length);
            count.put(out, count.get(out) - 1);
        }
        if (right >= length - 1 && length - maxFreq <= k) return true;
    }
    return false;
}`,
      },
      run: runCharReplacementBinarySearch,
      lineExplanations: {
        python: {
          1: 'Define function taking string s and int k',
          2: 'Feasibility check: can SOME window of this length work?',
          3: 'Frequency map for the fixed-size window',
          4: 'Highest frequency of any char seen (monotone is safe here)',
          5: 'Slide the fixed window across the string',
          6: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
          7: 'Update the max frequency',
          8: 'Window exceeds the target length?',
          9: 'Drop the outgoing left character',
          10: 'Full window needing at most k replacements?',
          11: 'Yes — this length is achievable',
          12: 'No window of this length worked',
          14: 'Binary search bounds: answer lies in [1, n]',
          15: 'Standard binary search loop',
          16: 'Midpoint candidate length',
          17: 'If achievable, the answer is at least mid',
          18: 'Search longer lengths',
          19: 'Otherwise mid is too long',
          20: 'Search shorter lengths',
          21: 'hi settles on the longest feasible length',
        },
        javascript: {
          1: 'Define function taking string s and int k',
          2: 'Feasibility check: can SOME window of this length work?',
          3: 'Frequency map for the fixed-size window',
          4: 'Highest frequency of any char seen (monotone is safe here)',
          5: 'Slide the fixed window across the string',
          6: 'Add the incoming right character',
          7: 'Update the max frequency',
          8: 'Drop the outgoing left character once window exceeds length',
          9: 'Full window needing at most k replacements? Achievable!',
          11: 'No window of this length worked',
          14: 'Binary search bounds: answer lies in [1, n]',
          15: 'Standard binary search loop',
          16: 'Midpoint candidate length',
          17: 'Achievable — search longer lengths',
          18: 'Too long — search shorter lengths',
          20: 'hi settles on the longest feasible length',
        },
        java: {
          1: 'Define function taking string s and int k',
          2: 'Binary search bounds: answer lies in [1, n]',
          3: 'Standard binary search loop',
          4: 'Midpoint candidate length',
          5: 'Achievable — search longer lengths',
          6: 'Too long — search shorter lengths',
          8: 'hi settles on the longest feasible length',
          11: 'Feasibility check: can SOME window of this length work?',
          12: 'Frequency map for the fixed-size window',
          13: 'Highest frequency of any char seen (monotone is safe here)',
          14: 'Slide the fixed window across the string',
          15: 'Get the incoming right character',
          16: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
          17: 'Update the max frequency',
          18: 'Window exceeds the target length?',
          19: 'Get the outgoing left character',
          20: 'Drop it from the window count',
          22: 'Full window needing at most k replacements? Achievable!',
          24: 'No window of this length worked',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s and int k',
      2: 'Frequency map for chars in window',
      3: 'Left boundary of sliding window',
      4: 'Track highest frequency of any char in window',
      5: 'Track longest valid window found',
      7: 'Expand window by moving right pointer',
      8: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
      9: 'Update max frequency seen in window',
      11: 'If replacements needed exceed k',
      12: 'Decrement count of leftmost char',
      13: 'Shrink window from the left',
      15: 'Window is valid, update max length',
      17: 'Return the longest valid window length',
    },
    javascript: {
      1: 'Define function taking string s and int k',
      2: 'Frequency map for chars in window',
      3: 'Left boundary of sliding window',
      4: 'Track highest frequency of any char in window',
      5: 'Track longest valid window found',
      7: 'Expand window by moving right pointer',
      8: 'Increment count for current character',
      9: 'Update max frequency seen in window',
      11: 'If replacements needed exceed k',
      12: 'Decrement count of leftmost char',
      13: 'Shrink window from the left',
      15: 'Window is valid, update max length',
      18: 'Return the longest valid window length',
    },
    java: {
      1: 'Define function taking string s and int k',
      2: 'Frequency map for chars in window',
      3: 'Left boundary of sliding window',
      4: 'Track highest frequency of any char in window',
      5: 'Track longest valid window found',
      7: 'Expand window by moving right pointer',
      8: 'Get current character at right pointer',
      9: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
      10: 'Update max frequency seen in window',
      12: 'If replacements needed exceed k',
      13: 'Decrement count of leftmost char',
      14: 'Shrink window from the left',
      16: 'Window is valid, update max length',
      20: 'Return the longest valid window length',
    },
  },
};
