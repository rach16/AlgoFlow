import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runGroupAnagramsCharCount(input: unknown): AlgorithmStep[] {
  const strs = input as string[];
  const steps: AlgorithmStep[] = [];
  const hashMap: Record<string, string[]> = {};

  steps.push({
    state: { chars: [...strs], hashMap: {} },
    highlights: [],
    message: `Group anagrams WITHOUT sorting: build a letter-count signature for each word — anagrams share identical counts`,
    codeLine: 1,
  });

  const countKeyOf = (word: string): string => {
    const counts: Record<string, number> = {};
    for (const c of word) counts[c] = (counts[c] || 0) + 1;
    return Object.keys(counts)
      .sort()
      .map((c) => `${c}${counts[c]}`)
      .join('');
  };

  for (let i = 0; i < strs.length; i++) {
    const word = strs[i];

    steps.push({
      state: { chars: [...strs], hashMap: snapshotGroups(hashMap) },
      highlights: [i],
      pointers: { i },
      message: `Processing "${word}" — count its letters instead of sorting them`,
      codeLine: 3,
      action: 'visit',
    });

    const key = countKeyOf(word);
    steps.push({
      state: { chars: [...strs], hashMap: snapshotGroups(hashMap), currentWord: word, countKey: key },
      highlights: [i],
      pointers: { i },
      message: `Letter counts of "${word}" → signature "${key}" (O(k) counting, no O(k log k) sort)`,
      codeLine: 6,
      action: 'compare',
    });

    if (!hashMap[key]) {
      hashMap[key] = [];
    }
    hashMap[key].push(word);

    steps.push({
      state: { chars: [...strs], hashMap: snapshotGroups(hashMap) },
      highlights: [i],
      pointers: { i },
      message: `Add "${word}" to group "${key}" -> [${hashMap[key].map((s) => `"${s}"`).join(', ')}]`,
      codeLine: 7,
      action: 'insert',
    });
  }

  const result = Object.values(hashMap);
  steps.push({
    state: { chars: [...strs], hashMap: snapshotGroups(hashMap), result },
    highlights: [],
    message: `Result: ${result.map((g) => `[${g.map((s) => `"${s}"`).join(', ')}]`).join(', ')}`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function snapshotGroups(hashMap: Record<string, string[]>): Record<string, string[]> {
  const snapshot: Record<string, string[]> = {};
  for (const key of Object.keys(hashMap)) {
    snapshot[key] = [...hashMap[key]];
  }
  return snapshot;
}

function runGroupAnagrams(input: unknown): AlgorithmStep[] {
  const strs = input as string[];
  const steps: AlgorithmStep[] = [];
  const hashMap: Record<string, string[]> = {};

  // Initial state
  steps.push({
    state: { chars: [...strs], hashMap: {} },
    highlights: [],
    message: `Group anagrams from [${strs.map(s => `"${s}"`).join(', ')}]`,
    codeLine: 1,
  });

  for (let i = 0; i < strs.length; i++) {
    const word = strs[i];
    const sorted = word.split('').sort().join('');

    // Show current word
    steps.push({
      state: { chars: [...strs], hashMap: { ...hashMap } },
      highlights: [i],
      pointers: { i },
      message: `Processing word "${word}"`,
      codeLine: 3,
      action: 'visit',
    });

    // Show sorting step
    steps.push({
      state: { chars: [...strs], hashMap: { ...hashMap }, currentWord: word, sortedKey: sorted },
      highlights: [i],
      pointers: { i },
      message: `Sort "${word}" -> key "${sorted}"`,
      codeLine: 4,
      action: 'compare',
    });

    // Add to hashmap group
    if (!hashMap[sorted]) {
      hashMap[sorted] = [];
    }
    hashMap[sorted].push(word);

    // Deep copy hashMap for state snapshot
    const hashMapSnapshot: Record<string, string[]> = {};
    for (const key of Object.keys(hashMap)) {
      hashMapSnapshot[key] = [...hashMap[key]];
    }

    steps.push({
      state: { chars: [...strs], hashMap: hashMapSnapshot },
      highlights: [i],
      pointers: { i },
      message: `Add "${word}" to group "${sorted}" -> [${hashMap[sorted].map(s => `"${s}"`).join(', ')}]`,
      codeLine: 5,
      action: 'insert',
    });
  }

  // Show final result
  const result = Object.values(hashMap);
  const finalHashMap: Record<string, string[]> = {};
  for (const key of Object.keys(hashMap)) {
    finalHashMap[key] = [...hashMap[key]];
  }

  steps.push({
    state: { chars: [...strs], hashMap: finalHashMap, result },
    highlights: [],
    message: `Result: ${result.map(g => `[${g.map(s => `"${s}"`).join(', ')}]`).join(', ')}`,
    codeLine: 6,
    action: 'found',
  });

  return steps;
}

export const groupAnagrams: Algorithm = {
  id: 'group-anagrams',
  name: 'Group Anagrams',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n·k log k)',
  spaceComplexity: 'O(n·k)',
  pattern: 'Hash Map — sorted string as key',
  description:
    'Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
  problemUrl: 'https://leetcode.com/problems/group-anagrams/',
  code: {
    python: `from collections import defaultdict

def groupAnagrams(strs):
    res = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))
        res[key].append(s)
    return list(res.values())`,
    javascript: `function groupAnagrams(strs) {
    const map = {};
    for (const s of strs) {
        const key = s.split('').sort().join('');
        map[key] = map[key] || [];
        map[key].push(s);
    }
    return Object.values(map);
}`,
    java: `public static List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        map.putIfAbsent(key, new ArrayList<>());
        map.get(key).add(s);
    }
    return new ArrayList<>(map.values());
}`,
  },
  defaultInput: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
  run: runGroupAnagrams,
  optimalApproachName: 'Sorted String Key',
  approaches: [
    {
      id: 'char-count-key',
      name: 'Char Count Key',
      timeComplexity: 'O(n·k)',
      spaceComplexity: 'O(n·k)',
      description:
        'Instead of sorting each word (O(k log k)) to build the group key, count its letters into an int[26] signature in O(k) — anagrams produce identical counts.',
      code: {
        python: `from collections import defaultdict

def groupAnagrams(strs):
    res = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        res[tuple(count)].append(s)
    return list(res.values())`,
        javascript: `function groupAnagrams(strs) {
    const map = {};
    for (const s of strs) {
        const count = new Array(26).fill(0);
        for (const c of s) {
            count[c.charCodeAt(0) - 97]++;
        }
        const key = count.join(',');
        map[key] = map[key] || [];
        map[key].push(s);
    }
    return Object.values(map);
}`,
        java: `public static List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    for (String s : strs) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) {
            count[c - 'a']++;
        }
        String key = Arrays.toString(count);
        map.putIfAbsent(key, new ArrayList<>());
        map.get(key).add(s);
    }
    return new ArrayList<>(map.values());
}`,
      },
      run: runGroupAnagramsCharCount,
      lineExplanations: {
        python: {
          1: 'defaultdict creates the empty value on first touch, so no "is this key here?" check',
          3: 'Define function taking list of strings',
          4: 'Create defaultdict mapping count signatures to groups',
          5: 'Iterate over each string',
          6: 'Fresh int[26] letter counter for this word',
          7: 'Loop over each character of the word',
          8: "Increment the slot for this letter (ord maps 'a'-'z' to 0-25)",
          9: 'Use the count tuple as the key — anagrams collide, no sorting',
          10: 'Return all grouped anagram lists',
        },
        javascript: {
          1: 'Define function taking array of strings',
          2: 'Create empty object as hash map',
          3: 'Iterate over each string',
          4: 'Fresh 26-slot letter counter for this word',
          5: 'Loop over each character of the word',
          6: "Increment the slot for this letter (97 is charCode of 'a')",
          8: 'Join counts into a string key — anagrams produce the same key',
          9: 'Initialize group array if key is new',
          10: 'Push string into its anagram group',
          12: 'Return all grouped anagram arrays',
        },
        java: {
          1: 'Define function taking array of strings',
          2: 'Create HashMap mapping count signatures to groups',
          3: 'Iterate over each string',
          4: 'Fresh int[26] letter counter for this word',
          5: 'Loop over each character of the word',
          6: "Increment the slot for this letter (char minus 'a' gives 0-25)",
          8: 'Stringify the counts as the key — anagrams collide, no sorting',
          9: 'Initialize list for key if absent',
          10: 'Add string to its anagram group',
          12: 'Return all grouped anagram lists',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'defaultdict creates the empty value on first touch, so no "is this key here?" check',
      3: 'Define function taking list of strings',
      4: 'Create defaultdict mapping keys to groups',
      5: 'Iterate over each string',
      6: 'Sort chars to create anagram key',
      7: 'Append string to its anagram group',
      8: 'Return all grouped anagram lists',
    },
    javascript: {
      1: 'Define function taking array of strings',
      2: 'Create empty object as hash map',
      3: 'Iterate over each string',
      4: 'Sort chars to create anagram key',
      5: 'Initialize group array if key is new',
      6: 'Push string into its anagram group',
      8: 'Return all grouped anagram arrays',
    },
    java: {
      1: 'Define function taking array of strings',
      2: 'Create HashMap mapping keys to groups',
      3: 'Iterate over each string',
      4: 'Convert string to char array for sorting',
      5: 'Sort characters alphabetically',
      6: 'Build sorted key string from char array',
      7: 'Initialize list for key if absent',
      8: 'Add string to its anagram group',
      10: 'Return all grouped anagram lists',
    },
  },
};
