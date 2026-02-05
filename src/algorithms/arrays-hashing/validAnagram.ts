import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface AnagramInput {
  s: string;
  t: string;
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
  },
  defaultInput: { s: 'anagram', t: 'nagaram' },
  run: runValidAnagram,
};
