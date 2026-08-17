import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface AnagramInput {
  s: string;
  t: string;
}

function runValidAnagramCountArray(input: unknown): AlgorithmStep[] {
  const { s, t } = input as AnagramInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { s, t, count: {} },
    highlights: [],
    message: `Use ONE int[26] count array: +1 for each letter of "${s}", -1 for each letter of "${t}". Anagram ⇔ everything cancels to 0`,
    codeLine: 1,
  });

  if (s.length !== t.length) {
    steps.push({
      state: { s, t, count: {}, result: false },
      highlights: [],
      message: `Different lengths (${s.length} vs ${t.length}) — can't be anagrams`,
      codeLine: 3,
    });
    return steps;
  }

  const count: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    const sChar = s[i];
    count[sChar] = (count[sChar] || 0) + 1;
    steps.push({
      state: { s, t, count: { ...count } },
      highlights: [i],
      pointers: { i },
      message: `s[${i}] = '${sChar}': count['${sChar}'] +1 → ${count[sChar]}`,
      codeLine: 7,
      action: 'insert',
    });

    const tChar = t[i];
    count[tChar] = (count[tChar] || 0) - 1;
    steps.push({
      state: { s, t, count: { ...count } },
      highlights: [],
      secondary: [i],
      pointers: { i },
      message: `t[${i}] = '${tChar}': count['${tChar}'] -1 → ${count[tChar]} — t's letters cancel s's letters`,
      codeLine: 8,
      action: 'visit',
    });
  }

  const offChar = Object.keys(count).find((c) => count[c] !== 0);
  if (offChar === undefined) {
    steps.push({
      state: { s, t, count: { ...count }, result: true },
      highlights: [],
      message: `Every letter's count returned to exactly 0 — "${t}" is an anagram of "${s}"`,
      codeLine: 10,
      action: 'found',
    });
  } else {
    steps.push({
      state: { s, t, count: { ...count }, result: false },
      highlights: [],
      message: `count['${offChar}'] = ${count[offChar]} ≠ 0 — letters don't cancel, not an anagram`,
      codeLine: 10,
    });
  }

  return steps;
}

function runValidAnagram(input: unknown): AlgorithmStep[] {
  const { s, t } = input as AnagramInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { s, t, count: {} },
    highlights: [],
    message: `One hash map: +1 for each letter of "${s}", -1 for each letter of "${t}". Anagram \u21d4 every count ends at 0`,
    codeLine: 1,
  });

  if (s.length !== t.length) {
    steps.push({
      state: { s, t, count: {}, result: false },
      highlights: [],
      message: `Different lengths (${s.length} vs ${t.length}) \u2014 can't be anagrams, return early`,
      codeLine: 3,
    });
    return steps;
  }

  const count: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    const sChar = s[i];
    count[sChar] = (count[sChar] || 0) + 1;
    steps.push({
      state: { s, t, count: { ...count } },
      highlights: [i],
      pointers: { i },
      message: `s[${i}] = '${sChar}': count['${sChar}'] +1 \u2192 ${count[sChar]}`,
      codeLine: 7,
      action: 'insert',
    });

    const tChar = t[i];
    count[tChar] = (count[tChar] || 0) - 1;
    steps.push({
      state: { s, t, count: { ...count } },
      highlights: [],
      secondary: [i],
      pointers: { i },
      message: `t[${i}] = '${tChar}': count['${tChar}'] -1 \u2192 ${count[tChar]} \u2014 t cancels what s added`,
      codeLine: 8,
      action: 'visit',
    });
  }

  const offChar = Object.keys(count).find((c) => count[c] !== 0);
  if (offChar === undefined) {
    steps.push({
      state: { s, t, count: { ...count }, result: true },
      highlights: [],
      message: `Every count canceled back to 0 \u2014 "${t}" is an anagram of "${s}"`,
      codeLine: 10,
      action: 'found',
    });
  } else {
    steps.push({
      state: { s, t, count: { ...count }, result: false },
      highlights: [],
      message: `count['${offChar}'] = ${count[offChar]} \u2260 0 \u2014 letters don't cancel, not an anagram`,
      codeLine: 10,
    });
  }

  return steps;
}

export const validAnagram: Algorithm = {
  id: 'valid-anagram',
  name: 'Valid Anagram',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Hash Map — one map, +1 for s and -1 for t, anagram if all zero',
  description:
    'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
  problemUrl: 'https://leetcode.com/problems/valid-anagram/',
  code: {
    python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False

    count = {}
    for i in range(len(s)):
        count[s[i]] = count.get(s[i], 0) + 1
        count[t[i]] = count.get(t[i], 0) - 1

    return all(v == 0 for v in count.values())`,
    javascript: `function isAnagram(s, t) {
    if (s.length !== t.length) {
        return false;
    }

    const count = {};
    for (let i = 0; i < s.length; i++) {
        count[s[i]] = (count[s[i]] || 0) + 1;
        count[t[i]] = (count[t[i]] || 0) - 1;
    }

    return Object.values(count).every(v => v === 0);
}`,
    java: `public static boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) {
        return false;
    }

    Map<Character, Integer> count = new HashMap<>();
    for (int i = 0; i < s.length(); i++) {
        count.put(s.charAt(i), count.getOrDefault(s.charAt(i), 0) + 1);
        count.put(t.charAt(i), count.getOrDefault(t.charAt(i), 0) - 1);
    }

    for (int v : count.values()) {
        if (v != 0) return false;
    }
    return true;
}`,
  },
  defaultInput: { s: 'anagram', t: 'nagaram' },
  run: runValidAnagram,
  optimalApproachName: 'Single Hash Map',
  approaches: [
    {
      id: 'count-array',
      name: 'Count Array',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Swaps the hash map for a fixed int[26] array — same +1/-1 cancellation with no hashing overhead, but it assumes lowercase a-z only.',
      code: {
        python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False

    count = [0] * 26
    for i in range(len(s)):
        count[ord(s[i]) - ord('a')] += 1
        count[ord(t[i]) - ord('a')] -= 1

    return all(c == 0 for c in count)`,
        javascript: `function isAnagram(s, t) {
    if (s.length !== t.length) {
        return false;
    }

    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++;
        count[t.charCodeAt(i) - 97]--;
    }

    return count.every(c => c === 0);
}`,
        java: `public static boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) {
        return false;
    }

    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }

    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}`,
      },
      run: runValidAnagramCountArray,
      lineExplanations: {
        python: {
          1: 'Define function taking two strings s and t',
          2: "Quick check: different lengths can't be anagrams",
          3: 'Return False immediately if lengths differ',
          5: 'One fixed array of 26 slots — one per lowercase letter',
          6: 'Single loop over both strings at once',
          7: "Letter from s adds 1 to its slot (ord maps 'a'-'z' to 0-25)",
          8: 'Letter from t subtracts 1 — s and t cancel each other out',
          10: 'Anagram only if every slot canceled back to exactly 0',
        },
        javascript: {
          1: 'Define function taking two strings s and t',
          2: "Quick check: different lengths can't be anagrams",
          3: 'Return false immediately if lengths differ',
          6: 'One fixed array of 26 slots — one per lowercase letter',
          7: 'Single loop over both strings at once',
          8: "Letter from s adds 1 to its slot (97 is charCode of 'a')",
          9: 'Letter from t subtracts 1 — s and t cancel each other out',
          12: 'Anagram only if every slot canceled back to exactly 0',
        },
        java: {
          1: 'Define method taking two strings s and t',
          2: "Quick check: different lengths can't be anagrams",
          3: 'Return false immediately if lengths differ',
          6: 'One fixed int[26] — one slot per lowercase letter',
          7: 'Single loop over both strings at once',
          8: "Letter from s adds 1 to its slot (char minus 'a' gives 0-25)",
          9: 'Letter from t subtracts 1 — s and t cancel each other out',
          12: 'Check every slot in the count array',
          13: 'Any nonzero slot means letters did not cancel — not an anagram',
          15: 'All 26 slots are 0 — it is an anagram',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking two strings s and t',
      2: 'Quick check: different lengths can\'t be anagrams',
      3: 'Return False immediately if lengths differ',
      5: 'One map, not two — it tracks the difference between s and t',
      6: 'Single pass, reading both strings at the same index',
      7: 'Letter from s adds 1 to its count',
      8: 'Letter from t subtracts 1 — a letter in both cancels to 0',
      10: 'Anagram only if every count canceled back to exactly 0',
    },
    javascript: {
      1: 'Define function taking two strings s and t',
      2: 'Quick check: different lengths can\'t be anagrams',
      3: 'Return false immediately if lengths differ',
      6: 'One object, not two — it tracks the difference between s and t',
      7: 'Single pass, reading both strings at the same index',
      8: 'Letter from s adds 1 to its count',
      9: 'Letter from t subtracts 1 — a letter in both cancels to 0',
      12: 'Anagram only if every count canceled back to exactly 0',
    },
    java: {
      1: 'Define method taking two strings s and t',
      2: 'Quick check: different lengths can\'t be anagrams',
      3: 'Return false immediately if lengths differ',
      6: 'One HashMap, not two — it tracks the difference between s and t',
      7: 'Single pass, reading both strings at the same index',
      8: 'Letter from s adds 1 to its count',
      9: 'Letter from t subtracts 1 — a letter in both cancels to 0',
      12: 'Scan the final counts',
      13: 'Any non-zero count means the letters did not cancel',
      15: 'All zero — it is an anagram',
    },
  },
};
