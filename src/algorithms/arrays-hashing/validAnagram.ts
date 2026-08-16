import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface AnagramInput {
  s: string;
  t: string;
}

function runValidAnagramCountArray(input: unknown): AlgorithmStep[] {
  const { s, t } = input as AnagramInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { s, t, sCount: {} },
    highlights: [],
    message: `Use ONE int[26] count array: +1 for each letter of "${s}", -1 for each letter of "${t}". Anagram ⇔ everything cancels to 0`,
    codeLine: 1,
  });

  if (s.length !== t.length) {
    steps.push({
      state: { s, t, sCount: {} },
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
      state: { s, t, sCount: { ...count } },
      highlights: [i],
      pointers: { i },
      message: `s[${i}] = '${sChar}': count['${sChar}'] +1 → ${count[sChar]}`,
      codeLine: 7,
      action: 'insert',
    });

    const tChar = t[i];
    count[tChar] = (count[tChar] || 0) - 1;
    steps.push({
      state: { s, t, sCount: { ...count } },
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
      state: { s, t, sCount: { ...count }, result: true },
      highlights: [],
      message: `Every letter's count returned to exactly 0 — "${t}" is an anagram of "${s}"`,
      codeLine: 10,
      action: 'found',
    });
  } else {
    steps.push({
      state: { s, t, sCount: { ...count } },
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
    state: { s, t, sCount: {}, tCount: {} },
    highlights: [],
    message: `Check if "${t}" is an anagram of "${s}"`,
    codeLine: 1,
  });

  if (s.length !== t.length) {
    steps.push({
      state: { s, t, sCount: {}, tCount: {} },
      highlights: [],
      message: `Different lengths (${s.length} vs ${t.length}) - not an anagram`,
      codeLine: 2,
    });
    return steps;
  }

  // Count characters in s
  const sCount: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    sCount[char] = (sCount[char] || 0) + 1;
    steps.push({
      state: { s, t, sCount: { ...sCount }, tCount: {} },
      highlights: [i],
      message: `Count '${char}' in s: ${sCount[char]}`,
      codeLine: 4,
      action: 'visit',
    });
  }

  // Count characters in t and compare
  const tCount: Record<string, number> = {};
  for (let i = 0; i < t.length; i++) {
    const char = t[i];
    tCount[char] = (tCount[char] || 0) + 1;
    steps.push({
      state: { s, t, sCount: { ...sCount }, tCount: { ...tCount } },
      highlights: [],
      secondary: [i],
      message: `Count '${char}' in t: ${tCount[char]}`,
      codeLine: 7,
      action: 'visit',
    });
  }

  // Compare counts
  let isAnagram = true;
  for (const char of Object.keys(sCount)) {
    if (sCount[char] !== tCount[char]) {
      isAnagram = false;
      steps.push({
        state: { s, t, sCount, tCount },
        highlights: [],
        message: `'${char}' count differs: s has ${sCount[char]}, t has ${tCount[char] || 0}`,
        codeLine: 9,
      });
      break;
    }
  }

  if (isAnagram) {
    steps.push({
      state: { s, t, sCount, tCount, result: true },
      highlights: [],
      message: `All character counts match - "${t}" is an anagram of "${s}"`,
      codeLine: 10,
      action: 'found',
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
  pattern: 'Hash Map — frequency count and compare',
  description:
    'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
  problemUrl: 'https://leetcode.com/problems/valid-anagram/',
  code: {
    python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False

    count_s = {}
    for c in s:
        count_s[c] = count_s.get(c, 0) + 1

    count_t = {}
    for c in t:
        count_t[c] = count_t.get(c, 0) + 1

    return count_s == count_t`,
    javascript: `function isAnagram(s, t) {
    if (s.length !== t.length) {
        return false;
    }

    const countS = {};
    for (const c of s) {
        countS[c] = (countS[c] || 0) + 1;
    }

    const countT = {};
    for (const c of t) {
        countT[c] = (countT[c] || 0) + 1;
    }

    for (const key of Object.keys(countS)) {
        if (countS[key] !== countT[key]) {
            return false;
        }
    }
    return true;
}`,
    java: `public static boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) {
        return false;
    }

    Map<Character, Integer> countS = new HashMap<>();
    for (char c : s.toCharArray()) {
        countS.put(c, countS.getOrDefault(c, 0) + 1);
    }

    Map<Character, Integer> countT = new HashMap<>();
    for (char c : t.toCharArray()) {
        countT.put(c, countT.getOrDefault(c, 0) + 1);
    }

    return countS.equals(countT);
}`,
  },
  defaultInput: { s: 'anagram', t: 'nagaram' },
  run: runValidAnagram,
  optimalApproachName: 'Two Hash Maps',
  approaches: [
    {
      id: 'count-array',
      name: 'Count Array',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Replaces the two hash maps with a single fixed int[26] array: increment for letters of s, decrement for letters of t — anagram if every slot ends at 0.',
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
      5: 'Create hashmap to count characters in s',
      6: 'Loop through each character in s',
      7: 'Increment count for this character',
      9: 'Create hashmap to count characters in t',
      10: 'Loop through each character in t',
      11: 'Increment count for this character',
      13: 'Anagram if both frequency maps are equal',
    },
    javascript: {
      1: 'Define function taking two strings s and t',
      2: 'Quick check: different lengths can\'t be anagrams',
      3: 'Return false immediately if lengths differ',
      6: 'Create object to count characters in s',
      7: 'Loop through each character in s',
      8: 'Increment count for this character',
      11: 'Create object to count characters in t',
      12: 'Loop through each character in t',
      13: 'Increment count for this character',
      16: 'Compare counts — any mismatch means not an anagram',
      17: 'Counts differ for this character — not an anagram',
      21: 'All counts match — it is an anagram',
    },
    java: {
      1: 'Define method taking two strings s and t',
      2: 'Quick check: different lengths can\'t be anagrams',
      3: 'Return false immediately if lengths differ',
      6: 'Create HashMap to count characters in s',
      7: 'Loop through each character in s',
      8: 'Increment count for this character',
      11: 'Create HashMap to count characters in t',
      12: 'Loop through each character in t',
      13: 'Increment count for this character',
      16: 'Anagram if both frequency maps are equal',
    },
  },
};
