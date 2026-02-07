import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

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
  timeComplexity: 'O(n·k)',
  spaceComplexity: 'O(n·k)',
  pattern: 'Hash Map — sorted string as key',
  description:
    'Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
  problemUrl: 'https://leetcode.com/problems/group-anagrams/',
  code: {
    python: `def groupAnagrams(strs):
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
};
