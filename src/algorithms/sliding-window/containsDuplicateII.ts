import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface ContainsDuplicateIIInput {
  nums: number[];
  k: number;
}

function runContainsDuplicateII(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as ContainsDuplicateIIInput;
  const steps: AlgorithmStep[] = [];
  const window = new Set<number>();

  const windowIndices = (i: number): number[] => {
    const start = Math.max(0, i - k);
    return Array.from({ length: i - start }, (_, idx) => start + idx);
  };

  steps.push({
    state: { nums: [...nums], seen: [], result: false },
    highlights: [],
    message: `Two equal values must sit at most k=${k} apart. Instead of comparing every pair, keep a set holding only the last ${k} values — a duplicate inside that set is automatically within distance ${k}.`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...nums], seen: [], result: false },
    highlights: [],
    message: `Start with an empty window set. It will never hold more than k=${k} values, so lookups stay O(1) and memory stays O(k).`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    if (i > k) {
      const evicted = nums[i - k - 1];
      window.delete(evicted);
      steps.push({
        state: { nums: [...nums], seen: Array.from(window), result: false },
        highlights: windowIndices(i),
        secondary: [i - k - 1],
        pointers: { left: i - k, right: i },
        message: `Index ${i - k - 1} is now ${i - (i - k - 1)} steps behind i=${i} — further than k=${k}. Evict ${evicted} so the set only covers indices ${i - k}..${i - 1}.`,
        codeLine: 6,
        action: 'delete',
      });
    }

    if (window.has(nums[i])) {
      const prevIndex = nums.findIndex((n, idx) => n === nums[i] && idx >= Math.max(0, i - k) && idx < i);
      steps.push({
        state: { nums: [...nums], seen: Array.from(window), result: true },
        highlights: [prevIndex, i],
        pointers: { left: Math.max(0, i - k), right: i },
        message: `nums[${i}] = ${nums[i]} is already in the window! Its twin sits at index ${prevIndex}, and ${i} - ${prevIndex} = ${i - prevIndex} ≤ ${k}. Answer: true.`,
        codeLine: 8,
        action: 'found',
      });

      steps.push({
        state: { nums: [...nums], seen: Array.from(window), result: true },
        highlights: [prevIndex, i],
        message: `Return true — the set membership test alone proved the distance constraint, so no index arithmetic was needed.`,
        codeLine: 8,
        action: 'found',
      });
      return steps;
    }

    window.add(nums[i]);
    steps.push({
      state: { nums: [...nums], seen: Array.from(window), result: false },
      highlights: [i],
      pointers: { left: Math.max(0, i - k), right: i },
      message: `nums[${i}] = ${nums[i]} is not in the window. Add it — window now covers indices ${Math.max(0, i - k)}..${i} = {${Array.from(window).join(', ')}}.`,
      codeLine: 9,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], seen: Array.from(window), result: false },
    highlights: [],
    message: `Scanned every index and never saw a repeat inside a k=${k} window. Answer: false.`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runContainsDuplicateIILastSeen(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as ContainsDuplicateIIInput;
  const steps: AlgorithmStep[] = [];
  const lastSeen: Record<string, number> = {};

  steps.push({
    state: { nums: [...nums], hashMap: {}, result: false },
    highlights: [],
    message: `Alternative: never evict anything. Store each value's most recent index and check the gap directly — only the newest occurrence of a value can ever be the closer one.`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...nums], hashMap: {}, result: false },
    highlights: [],
    message: 'Start with an empty map from value to its last seen index.',
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    const key = String(nums[i]);
    const prev = lastSeen[key];

    if (prev !== undefined && i - prev <= k) {
      steps.push({
        state: { nums: [...nums], hashMap: { ...lastSeen }, result: true },
        highlights: [prev, i],
        pointers: { i },
        message: `${nums[i]} was last seen at index ${prev}. Gap = ${i} - ${prev} = ${i - prev} ≤ k=${k}. Answer: true.`,
        codeLine: 5,
        action: 'found',
      });

      steps.push({
        state: { nums: [...nums], hashMap: { ...lastSeen }, result: true },
        highlights: [prev, i],
        message: 'Return true. This version uses O(n) memory but replaces window eviction with one subtraction.',
        codeLine: 6,
        action: 'found',
      });
      return steps;
    }

    if (prev !== undefined) {
      steps.push({
        state: { nums: [...nums], hashMap: { ...lastSeen }, result: false },
        highlights: [i],
        secondary: [prev],
        pointers: { i },
        message: `${nums[i]} was last seen at index ${prev}, but ${i} - ${prev} = ${i - prev} > k=${k}. Too far apart.`,
        codeLine: 5,
        action: 'compare',
      });
    }

    lastSeen[key] = i;
    steps.push({
      state: { nums: [...nums], hashMap: { ...lastSeen }, result: false },
      highlights: [i],
      pointers: { i },
      message: `Record ${nums[i]} → index ${i}. Overwriting any older index is safe: a nearer occurrence can only help.`,
      codeLine: 7,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], hashMap: { ...lastSeen }, result: false },
    highlights: [],
    message: `No value repeated within k=${k} indices. Answer: false.`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const containsDuplicateII: Algorithm = {
  id: 'contains-duplicate-ii',
  name: 'Contains Duplicate II',
  category: 'Sliding Window',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(k)',
  pattern: 'Sliding Window + Hash Set — keep only the last k values',
  description:
    'Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and the absolute difference between i and j is at most k. Otherwise return false.',
  problemUrl: 'https://leetcode.com/problems/contains-duplicate-ii/',
  code: {
    python: `def containsNearbyDuplicate(nums, k):
    window = set()

    for i in range(len(nums)):
        if i > k:
            window.remove(nums[i - k - 1])
        if nums[i] in window:
            return True
        window.add(nums[i])

    return False`,
    javascript: `function containsNearbyDuplicate(nums, k) {
    const window = new Set();

    for (let i = 0; i < nums.length; i++) {
        if (i > k) {
            window.delete(nums[i - k - 1]);
        }
        if (window.has(nums[i])) {
            return true;
        }
        window.add(nums[i]);
    }

    return false;
}`,
    java: `public static boolean containsNearbyDuplicate(int[] nums, int k) {
    Set<Integer> window = new HashSet<>();

    for (int i = 0; i < nums.length; i++) {
        if (i > k) {
            window.remove(nums[i - k - 1]);
        }
        if (window.contains(nums[i])) {
            return true;
        }
        window.add(nums[i]);
    }

    return false;
}`,
  },
  defaultInput: { nums: [4, 1, 2, 3, 1, 5], k: 3 },
  run: runContainsDuplicateII,
  optimalApproachName: 'Sliding Window Hash Set',
  approaches: [
    {
      id: 'last-seen-index-map',
      name: 'Last-Seen Index Map',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Rather than evicting stale values from a size-k window, keep every value mapped to its most recent index and test the index gap arithmetically — simpler bookkeeping, but O(n) memory instead of O(k).',
      code: {
        python: `def containsNearbyDuplicate(nums, k):
    last_seen = {}

    for i, num in enumerate(nums):
        if num in last_seen and i - last_seen[num] <= k:
            return True
        last_seen[num] = i

    return False`,
        javascript: `function containsNearbyDuplicate(nums, k) {
    const lastSeen = new Map();

    for (let i = 0; i < nums.length; i++) {
        if (lastSeen.has(nums[i]) && i - lastSeen.get(nums[i]) <= k) {
            return true;
        }
        lastSeen.set(nums[i], i);
    }

    return false;
}`,
        java: `public static boolean containsNearbyDuplicate(int[] nums, int k) {
    Map<Integer, Integer> lastSeen = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        if (lastSeen.containsKey(nums[i]) && i - lastSeen.get(nums[i]) <= k) {
            return true;
        }
        lastSeen.put(nums[i], i);
    }

    return false;
}`,
      },
      run: runContainsDuplicateIILastSeen,
      lineExplanations: {
        python: {
          1: 'Take the array and the maximum allowed index distance k',
          2: 'Map each value to the most recent index where it appeared',
          4: 'Walk the array once, carrying the index along',
          5: 'Seen before AND the gap fits inside k?',
          6: 'Yes — a qualifying pair exists',
          7: 'Record (or overwrite) this value\'s latest index',
          9: 'No value ever repeated within k positions',
        },
        javascript: {
          1: 'Take the array and the maximum allowed index distance k',
          2: 'Map each value to the most recent index where it appeared',
          4: 'Walk the array once, carrying the index along',
          5: 'Seen before AND the gap fits inside k?',
          6: 'Yes — a qualifying pair exists',
          8: 'Record (or overwrite) this value\'s latest index',
          11: 'No value ever repeated within k positions',
        },
        java: {
          1: 'Take the array and the maximum allowed index distance k',
          2: 'Map each value to the most recent index where it appeared',
          4: 'Walk the array once, carrying the index along',
          5: 'Seen before AND the gap fits inside k?',
          6: 'Yes — a qualifying pair exists',
          8: 'Record (or overwrite) this value\'s latest index',
          11: 'No value ever repeated within k positions',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Take the array and the maximum allowed index distance k',
      2: 'The window set holds the values at the previous k indices',
      4: 'Slide the right edge of the window across the array',
      5: 'Has index i-k-1 fallen out of range?',
      6: 'Evict it so the set covers exactly indices i-k .. i-1',
      7: 'Is this value already inside the window?',
      8: 'Then its twin is within k positions — done',
      9: 'Otherwise add it as the newest window member',
      11: 'No repeat ever appeared inside a k-wide window',
    },
    javascript: {
      1: 'Take the array and the maximum allowed index distance k',
      2: 'The window set holds the values at the previous k indices',
      4: 'Slide the right edge of the window across the array',
      5: 'Has index i-k-1 fallen out of range?',
      6: 'Evict it so the set covers exactly indices i-k .. i-1',
      8: 'Is this value already inside the window?',
      9: 'Then its twin is within k positions — done',
      11: 'Otherwise add it as the newest window member',
      14: 'No repeat ever appeared inside a k-wide window',
    },
    java: {
      1: 'Take the array and the maximum allowed index distance k',
      2: 'The window set holds the values at the previous k indices',
      4: 'Slide the right edge of the window across the array',
      5: 'Has index i-k-1 fallen out of range?',
      6: 'Evict it so the set covers exactly indices i-k .. i-1',
      8: 'Is this value already inside the window?',
      9: 'Then its twin is within k positions — done',
      11: 'Otherwise add it as the newest window member',
      14: 'No repeat ever appeared inside a k-wide window',
    },
  },
};
