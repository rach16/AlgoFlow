import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSortColors(input: unknown): AlgorithmStep[] {
  const arr = [...(input as number[])];
  const steps: AlgorithmStep[] = [];

  let low = 0;
  let mid = 0;
  let high = arr.length - 1;

  steps.push({
    state: { nums: [...arr], hashMap: { low: '0', mid: '0', high: String(high) } },
    highlights: [],
    pointers: { low, mid, high },
    message: `Dutch National Flag: everything left of low is 0, everything right of high is 2, and mid sweeps the unknown middle. One pass, no counting.`,
    codeLine: 2,
  });

  while (mid <= high) {
    const v = arr[mid];

    if (v === 0) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      steps.push({
        state: { nums: [...arr], hashMap: { low: String(low + 1), mid: String(mid + 1), high: String(high) } },
        highlights: [low, mid],
        pointers: { low, mid, high },
        message: `nums[${mid}] = 0 — swap it down to index ${low} (the 0-boundary). Both low and mid advance, since the value swapped in was already checked.`,
        codeLine: 5,
        action: 'swap',
      });
      low++;
      mid++;
    } else if (v === 1) {
      steps.push({
        state: { nums: [...arr], hashMap: { low: String(low), mid: String(mid + 1), high: String(high) } },
        highlights: [mid],
        pointers: { low, mid, high },
        message: `nums[${mid}] = 1 — a 1 belongs exactly where the middle region is forming. Leave it and move mid to ${mid + 1}.`,
        codeLine: 9,
        action: 'compare',
      });
      mid++;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      steps.push({
        state: { nums: [...arr], hashMap: { low: String(low), mid: String(mid), high: String(high - 1) } },
        highlights: [mid, high],
        pointers: { low, mid, high },
        message: `nums[${mid}] = 2 — swap it up to index ${high} and shrink high to ${high - 1}. mid does NOT advance: the value pulled in from the back is still unexamined.`,
        codeLine: 11,
        action: 'swap',
      });
      high--;
    }
  }

  steps.push({
    state: { nums: [...arr], hashMap: { low: String(low), mid: String(mid), high: String(high) }, result: [...arr] },
    highlights: arr.map((_, i) => i),
    message: `mid passed high — the unknown region is empty. Sorted in one pass: [${arr.join(', ')}]`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

function runSortColorsCountingSort(input: unknown): AlgorithmStep[] {
  const original = input as number[];
  const arr = [...original];
  const steps: AlgorithmStep[] = [];
  const counts = [0, 0, 0];

  const countMap = () => ({ '0s': String(counts[0]), '1s': String(counts[1]), '2s': String(counts[2]) });

  steps.push({
    state: { nums: [...arr], count: countMap() },
    highlights: [],
    message: `Only three possible values, so just tally them. Pass 1 counts, pass 2 rewrites the array from the tallies.`,
    codeLine: 2,
  });

  for (let i = 0; i < arr.length; i++) {
    counts[arr[i]]++;
    steps.push({
      state: { nums: [...arr], count: countMap() },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${arr[i]} → ${arr[i]}s tally is now ${counts[arr[i]]}`,
      codeLine: 4,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...arr], count: countMap() },
    highlights: [],
    message: `Tallies: ${counts[0]} zeros, ${counts[1]} ones, ${counts[2]} twos. Now overwrite the array in that order.`,
    codeLine: 5,
  });

  let w = 0;
  for (let color = 0; color < 3; color++) {
    for (let c = 0; c < counts[color]; c++) {
      arr[w] = color;
      steps.push({
        state: { nums: [...arr], count: countMap() },
        highlights: [w],
        secondary: Array.from({ length: w }, (_, k) => k),
        pointers: { i: w },
        message: `Write ${color} at index ${w} (${c + 1} of ${counts[color]} ${color}s)`,
        codeLine: 8,
        action: 'insert',
      });
      w++;
    }
  }

  steps.push({
    state: { nums: [...arr], count: countMap(), result: [...arr] },
    highlights: arr.map((_, i) => i),
    message: `Two passes done: [${arr.join(', ')}]. Same O(n) time as the flag partition, but it reads the array twice instead of once.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const sortColors: Algorithm = {
  id: 'sort-colors',
  name: 'Sort Colors',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Three Pointers — Dutch National Flag partition',
  description:
    'Given an array nums with n objects colored red, white, or blue (represented as 0, 1, and 2), sort them in-place so that objects of the same color are adjacent, in the order 0, 1, 2. You must solve it without using the library sort function.',
  problemUrl: 'https://leetcode.com/problems/sort-colors/',
  code: {
    python: `def sortColors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
    return nums`,
    javascript: `function sortColors(nums) {
    let low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] === 0) {
            [nums[low], nums[mid]] = [nums[mid], nums[low]];
            low++;
            mid++;
        } else if (nums[mid] === 1) {
            mid++;
        } else {
            [nums[mid], nums[high]] = [nums[high], nums[mid]];
            high--;
        }
    }
    return nums;
}`,
    java: `public static void sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            int tmp = nums[low];
            nums[low] = nums[mid];
            nums[mid] = tmp;
            low++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            int tmp = nums[mid];
            nums[mid] = nums[high];
            nums[high] = tmp;
            high--;
        }
    }
}`,
  },
  defaultInput: [2, 0, 2, 1, 1, 0],
  run: runSortColors,
  optimalApproachName: 'Dutch National Flag',
  approaches: [
    {
      id: 'counting-sort',
      name: 'Counting Sort',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'With only three possible values, tally 0s, 1s, and 2s in one pass and rewrite the array from the tallies in a second — simpler to reason about than the flag partition, but it touches the array twice.',
      code: {
        python: `def sortColors(nums):
    counts = [0, 0, 0]
    for num in nums:
        counts[num] += 1
    i = 0
    for color in range(3):
        for _ in range(counts[color]):
            nums[i] = color
            i += 1
    return nums`,
        javascript: `function sortColors(nums) {
    const counts = [0, 0, 0];
    for (const num of nums) {
        counts[num]++;
    }
    let i = 0;
    for (let color = 0; color < 3; color++) {
        for (let c = 0; c < counts[color]; c++) {
            nums[i] = color;
            i++;
        }
    }
    return nums;
}`,
        java: `public static void sortColors(int[] nums) {
    int[] counts = new int[3];
    for (int num : nums) {
        counts[num]++;
    }
    int i = 0;
    for (int color = 0; color < 3; color++) {
        for (int c = 0; c < counts[color]; c++) {
            nums[i] = color;
            i++;
        }
    }
}`,
      },
      run: runSortColorsCountingSort,
      lineExplanations: {
        python: {
          1: 'Define function taking the colors array',
          2: 'One counter per color (0, 1, 2)',
          3: 'First pass over the array',
          4: 'Tally this color',
          5: 'Write pointer for the rebuild pass',
          6: 'Emit colors in ascending order',
          7: 'Emit this color as many times as it was counted',
          8: 'Overwrite the slot',
          9: 'Advance the write pointer',
          10: 'Array is now sorted in place',
        },
        javascript: {
          1: 'Define function taking the colors array',
          2: 'One counter per color (0, 1, 2)',
          3: 'First pass over the array',
          4: 'Tally this color',
          6: 'Write pointer for the rebuild pass',
          7: 'Emit colors in ascending order',
          8: 'Emit this color as many times as it was counted',
          9: 'Overwrite the slot',
          13: 'Array is now sorted in place',
        },
        java: {
          1: 'Define function taking the colors array',
          2: 'One counter per color (0, 1, 2)',
          3: 'First pass over the array',
          4: 'Tally this color',
          6: 'Write pointer for the rebuild pass',
          7: 'Emit colors in ascending order',
          8: 'Emit this color as many times as it was counted',
          9: 'Overwrite the slot',
          10: 'Advance the write pointer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the colors array',
      2: 'low bounds the 0s, high bounds the 2s, mid scans the unknown region',
      3: 'Keep going while unexamined elements remain',
      4: 'A 0 belongs at the front',
      5: 'Swap it into the 0 region',
      6: 'The 0 boundary grows',
      7: 'The swapped-in value was already checked, so mid advances too',
      8: 'A 1 is already in the right region',
      9: 'Just move past it',
      11: 'A 2 belongs at the back — swap it to high',
      12: 'Shrink the 2 boundary; mid stays put to inspect the new value',
      13: 'Array is sorted in place',
    },
    javascript: {
      1: 'Define function taking the colors array',
      2: 'low bounds the 0s, high bounds the 2s, mid scans the unknown region',
      3: 'Keep going while unexamined elements remain',
      4: 'A 0 belongs at the front',
      5: 'Swap it into the 0 region',
      6: 'The 0 boundary grows',
      7: 'The swapped-in value was already checked, so mid advances too',
      8: 'A 1 is already in the right region — just move past it',
      11: 'A 2 belongs at the back — swap it to high',
      12: 'Shrink the 2 boundary; mid stays put to inspect the new value',
      15: 'Array is sorted in place',
    },
    java: {
      1: 'Define function taking the colors array',
      2: 'low bounds the 0s, high bounds the 2s, mid scans the unknown region',
      3: 'Keep going while unexamined elements remain',
      4: 'A 0 belongs at the front',
      5: 'Swap nums[low] and nums[mid]',
      8: 'The 0 boundary grows',
      9: 'The swapped-in value was already checked, so mid advances too',
      10: 'A 1 is already in the right region — just move past it',
      13: 'A 2 belongs at the back — swap it to high',
      16: 'Shrink the 2 boundary; mid stays put to inspect the new value',
    },
  },
};
