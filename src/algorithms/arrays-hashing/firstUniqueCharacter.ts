import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runFirstUniqueCharacterCountArray(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const chars = s.split('');
  const steps: AlgorithmStep[] = [];
  const base = 'a'.charCodeAt(0);

  steps.push({
    state: { chars: [...chars], count: {} },
    highlights: [],
    message: `Same two passes, but the tally is a fixed int[26] indexed by c - 'a'. No hashing, no boxing — and the space is O(1) because 26 never grows with the input.`,
    codeLine: 1,
  });

  if (chars.length === 0) {
    steps.push({
      state: { chars: [], count: {}, result: -1 },
      highlights: [],
      message: `Empty string — no characters to tally, so no unique character exists. Return -1.`,
      codeLine: 8,
      action: 'found',
    });
    return steps;
  }

  const slots = new Array(26).fill(0) as number[];
  const asMap = () => {
    const out: Record<string, number> = {};
    for (let k = 0; k < 26; k++) {
      if (slots[k] > 0) out[String.fromCharCode(base + k)] = slots[k];
    }
    return out;
  };

  for (let i = 0; i < chars.length; i++) {
    const idx = chars[i].charCodeAt(0) - base;
    slots[idx] += 1;
    steps.push({
      state: { chars: [...chars], count: asMap() },
      highlights: [i],
      pointers: { i },
      message: `Pass 1 — s[${i}] = '${chars[i]}' maps to slot ${idx}; count[${idx}] becomes ${slots[idx]}.`,
      codeLine: 4,
      action: 'insert',
    });
  }

  for (let i = 0; i < chars.length; i++) {
    const idx = chars[i].charCodeAt(0) - base;
    if (slots[idx] === 1) {
      steps.push({
        state: { chars: [...chars], count: asMap(), result: i },
        highlights: [i],
        pointers: { i },
        message: `Pass 2 — count[${idx}] for '${chars[i]}' is 1. First non-repeating character is '${chars[i]}' at index ${i}.`,
        codeLine: 7,
        action: 'found',
      });
      return steps;
    }
    steps.push({
      state: { chars: [...chars], count: asMap() },
      highlights: [],
      secondary: [i],
      pointers: { i },
      message: `Pass 2 — '${chars[i]}' has count ${slots[idx]} > 1, so it repeats. Keep scanning left to right.`,
      codeLine: 6,
      action: 'compare',
    });
  }

  steps.push({
    state: { chars: [...chars], count: asMap(), result: -1 },
    highlights: [],
    message: `Every character repeated (the "all duplicates" edge case) — return -1.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runFirstUniqueCharacter(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const chars = s.split('');
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { chars: [...chars], hashMap: {} },
    highlights: [],
    message: `Find the FIRST non-repeating character. Two passes are unavoidable: you cannot know a character is unique until you have seen the whole string. Pass 1 counts, pass 2 returns the earliest count == 1.`,
    codeLine: 1,
  });

  if (chars.length === 0) {
    steps.push({
      state: { chars: [], hashMap: {}, result: -1 },
      highlights: [],
      message: `Empty string — no index to return, so -1. Always state this case before you start coding.`,
      codeLine: 8,
      action: 'found',
    });
    return steps;
  }

  const count: Record<string, number> = {};

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    count[c] = (count[c] || 0) + 1;
    steps.push({
      state: { chars: [...chars], hashMap: { ...count } },
      highlights: [i],
      pointers: { i },
      message: `Pass 1 — s[${i}] = '${c}': count['${c}'] ${count[c] === 1 ? 'is new, set to 1' : `bumped to ${count[c]}`}.`,
      codeLine: 4,
      action: 'insert',
    });
  }

  steps.push({
    state: { chars: [...chars], hashMap: { ...count } },
    highlights: [],
    message: `Frequencies complete. Now walk the string again IN ORDER — iterating the map instead would lose the original positions and is the classic wrong answer here.`,
    codeLine: 5,
  });

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (count[c] === 1) {
      steps.push({
        state: { chars: [...chars], hashMap: { ...count }, result: i },
        highlights: [i],
        pointers: { i },
        message: `Pass 2 — count['${c}'] == 1. '${c}' at index ${i} is the first non-repeating character. Return ${i}.`,
        codeLine: 7,
        action: 'found',
      });
      return steps;
    }
    steps.push({
      state: { chars: [...chars], hashMap: { ...count } },
      highlights: [],
      secondary: [i],
      pointers: { i },
      message: `Pass 2 — '${c}' appears ${count[c]} times, not unique. Move to index ${i + 1}.`,
      codeLine: 6,
      action: 'compare',
    });
  }

  steps.push({
    state: { chars: [...chars], hashMap: { ...count }, result: -1 },
    highlights: [],
    message: `No character had count 1 — the all-duplicates edge case (e.g. "aabb"). Return -1.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const firstUniqueCharacter: Algorithm = {
  id: 'first-unique-character',
  name: 'First Unique Character in a String',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Hash Map — count frequencies, then rescan in order for the first count of 1',
  description:
    'Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.',
  problemUrl: 'https://leetcode.com/problems/first-unique-character-in-a-string/',
  code: {
    python: `def firstUniqChar(s):
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for i, c in enumerate(s):
        if count[c] == 1:
            return i
    return -1`,
    javascript: `function firstUniqChar(s) {
    const count = {};
    for (const c of s) {
        count[c] = (count[c] || 0) + 1;
    }
    for (let i = 0; i < s.length; i++) {
        if (count[s[i]] === 1) {
            return i;
        }
    }
    return -1;
}`,
    java: `public static int firstUniqChar(String s) {
    Map<Character, Integer> count = new HashMap<>();
    for (char c : s.toCharArray()) {
        count.put(c, count.getOrDefault(c, 0) + 1);
    }
    for (int i = 0; i < s.length(); i++) {
        if (count.get(s.charAt(i)) == 1) {
            return i;
        }
    }
    return -1;
}`,
  },
  defaultInput: 'loveleetcode',
  run: runFirstUniqueCharacter,
  optimalApproachName: 'Frequency Map + Rescan',
  approaches: [
    {
      id: 'count-array-26',
      name: 'int[26] Count Array',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        "Replace the hash map with a fixed 26-slot array indexed by c - 'a' — identical logic, but no hashing or boxing, and the O(1) space bound is explicit rather than argued.",
      code: {
        python: `def firstUniqChar(s):
    count = [0] * 26
    for c in s:
        count[ord(c) - ord('a')] += 1
    for i, c in enumerate(s):
        if count[ord(c) - ord('a')] == 1:
            return i
    return -1`,
        javascript: `function firstUniqChar(s) {
    const count = new Array(26).fill(0);
    const base = 'a'.charCodeAt(0);
    for (const c of s) {
        count[c.charCodeAt(0) - base]++;
    }
    for (let i = 0; i < s.length; i++) {
        if (count[s.charCodeAt(i) - base] === 1) {
            return i;
        }
    }
    return -1;
}`,
        java: `public static int firstUniqChar(String s) {
    int[] count = new int[26];
    for (char c : s.toCharArray()) {
        count[c - 'a']++;
    }
    for (int i = 0; i < s.length(); i++) {
        if (count[s.charAt(i) - 'a'] == 1) {
            return i;
        }
    }
    return -1;
}`,
      },
      run: runFirstUniqueCharacterCountArray,
      lineExplanations: {
        python: {
          1: 'Define function taking the string',
          2: 'Fixed 26 slots — constant space regardless of input length',
          3: 'Pass 1: tally every character',
          4: "ord(c) - ord('a') maps 'a'..'z' to 0..25",
          5: 'Pass 2: walk the original string in order',
          6: 'Slot value of exactly 1 means the character never repeats',
          7: 'Return the first such index',
          8: 'All characters repeated (or empty string) — return -1',
        },
        javascript: {
          1: 'Define function taking the string',
          2: 'Fixed 26 slots — constant space regardless of input length',
          3: "Cache the char code of 'a' as the offset",
          4: 'Pass 1: tally every character',
          5: 'Map the character to its 0..25 slot and increment',
          7: 'Pass 2: walk the original string in order',
          8: 'Slot value of exactly 1 means the character never repeats',
          9: 'Return the first such index',
          12: 'All characters repeated (or empty string) — return -1',
        },
        java: {
          1: 'Define method taking the string',
          2: 'Fixed 26 slots — constant space regardless of input length',
          3: 'Pass 1: tally every character',
          4: "c - 'a' maps 'a'..'z' to 0..25",
          6: 'Pass 2: walk the original string in order',
          7: 'Slot value of exactly 1 means the character never repeats',
          8: 'Return the first such index',
          11: 'All characters repeated (or empty string) — return -1',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the string',
      2: 'Map of character to how many times it occurs',
      3: 'Pass 1: one full sweep to build the counts',
      4: 'get(c, 0) handles the first sighting without a branch',
      5: 'Pass 2: iterate the STRING, not the map — order matters',
      6: 'The first character whose count is 1 wins',
      7: 'Return its index',
      8: 'Empty string or all duplicates — no unique character',
    },
    javascript: {
      1: 'Define function taking the string',
      2: 'Object of character to how many times it occurs',
      3: 'Pass 1: one full sweep to build the counts',
      4: '(count[c] || 0) handles the first sighting without a branch',
      6: 'Pass 2: iterate the STRING, not the map — order matters',
      7: 'The first character whose count is 1 wins',
      8: 'Return its index',
      11: 'Empty string or all duplicates — no unique character',
    },
    java: {
      1: 'Define method taking the string',
      2: 'HashMap of character to how many times it occurs',
      3: 'Pass 1: one full sweep to build the counts',
      4: 'getOrDefault avoids a containsKey check',
      6: 'Pass 2: iterate the STRING, not the map — order matters',
      7: 'The first character whose count is 1 wins',
      8: 'Return its index',
      11: 'Empty string or all duplicates — no unique character',
    },
  },
};
