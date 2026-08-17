import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface IntersectionInput {
  nums1: number[];
  nums2: number[];
}

function runIntersectionSortTwoPointers(input: unknown): AlgorithmStep[] {
  const { nums1, nums2 } = input as IntersectionInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums1], nums2: [...nums2] },
    highlights: [],
    message: `Sorting alternative: no hash map at all. Sort both arrays, then walk them with two pointers — the smaller value always advances, and equal values are a match.`,
    codeLine: 1,
  });

  const a = [...nums1].sort((x, y) => x - y);
  const b = [...nums2].sort((x, y) => x - y);

  steps.push({
    state: { nums: [...a], nums2: [...b] },
    highlights: [],
    pointers: { i: 0 },
    message: `Sorted: nums1 = [${a.join(', ')}], nums2 = [${b.join(', ')}]. Pointers i = 0 on nums1 (shown above) and j = 0 on nums2.`,
    codeLine: 3,
  });

  if (a.length === 0 || b.length === 0) {
    steps.push({
      state: { nums: [...a], nums2: [...b], result: [] },
      highlights: [],
      message: `One array is empty — the while condition fails immediately and the intersection is empty.`,
      codeLine: 14,
      action: 'found',
    });
    return steps;
  }

  let i = 0;
  let j = 0;
  const res: number[] = [];
  const matched: number[] = [];

  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) {
      steps.push({
        state: { nums: [...a], nums2: [...b], result: [...res] },
        highlights: [i],
        secondary: [...matched],
        pointers: { i, j },
        message: `nums1[${i}] = ${a[i]} < nums2[${j}] = ${b[j]} — ${a[i]} cannot appear later in the sorted nums2, so discard it and advance i.`,
        codeLine: 6,
        action: 'compare',
      });
      i++;
    } else if (a[i] > b[j]) {
      steps.push({
        state: { nums: [...a], nums2: [...b], result: [...res] },
        highlights: [i],
        secondary: [...matched],
        pointers: { i, j },
        message: `nums1[${i}] = ${a[i]} > nums2[${j}] = ${b[j]} — advance j past ${b[j]}, it has no partner left in nums1.`,
        codeLine: 8,
        action: 'compare',
      });
      j++;
    } else {
      res.push(a[i]);
      matched.push(i);
      steps.push({
        state: { nums: [...a], nums2: [...b], result: [...res] },
        highlights: [i],
        secondary: matched.slice(0, -1),
        pointers: { i, j },
        message: `nums1[${i}] = nums2[${j}] = ${a[i]} — match! Append it and advance BOTH pointers, which is exactly how each duplicate gets counted only once. Result: [${res.join(', ')}]`,
        codeLine: 11,
        action: 'found',
      });
      i++;
      j++;
    }
  }

  steps.push({
    state: { nums: [...a], nums2: [...b], result: [...res] },
    highlights: [],
    secondary: [...matched],
    pointers: {},
    message: `${i >= a.length ? 'i' : 'j'} ran off the end — nothing left to pair. Intersection: [${res.join(', ')}]. O(n log n + m log m) time from the sorts, but only O(1) extra space beyond the output.`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

function runIntersection(input: unknown): AlgorithmStep[] {
  const { nums1, nums2 } = input as IntersectionInput;
  const steps: AlgorithmStep[] = [];

  // Count the SMALLER array so the map stays as small as possible.
  const swap = nums1.length > nums2.length;
  const small = swap ? [...nums2] : [...nums1];
  const large = swap ? [...nums1] : [...nums2];

  steps.push({
    state: { nums: [...small], hashMap: {} },
    highlights: [],
    message: `Intersection WITH duplicates: an element repeated min(count1, count2) times must appear that many times. Count the smaller array, then decrement while scanning the other.`,
    codeLine: 1,
  });

  if (small.length === 0) {
    steps.push({
      state: { nums: [], hashMap: {}, result: [] },
      highlights: [],
      message: `One array is empty — the intersection is empty. Name this case first; it needs no special branch.`,
      codeLine: 12,
      action: 'found',
    });
    return steps;
  }

  steps.push({
    state: { nums: [...small], hashMap: {} },
    highlights: [],
    message: swap
      ? `nums1 has ${nums1.length} elements and nums2 has ${nums2.length}, so swap and hash the shorter one (nums2) — the map is bounded by min(n, m).`
      : `nums1 (${nums1.length}) is already the shorter array, so hash it directly. Counting the smaller side keeps the map bounded by min(n, m).`,
    codeLine: 2,
  });

  const count: Record<number, number> = {};
  for (let i = 0; i < small.length; i++) {
    const v = small[i];
    count[v] = (count[v] || 0) + 1;
    steps.push({
      state: { nums: [...small], hashMap: { ...count } },
      highlights: [i],
      pointers: { i },
      message: `Count ${v}: now ${count[v]}. A count, not a set — a set would collapse duplicates and this variant keeps them.`,
      codeLine: 6,
      action: 'insert',
    });
  }

  const res: number[] = [];

  steps.push({
    state: { nums: [...large], hashMap: { ...count } },
    highlights: [],
    message: `Map built: {${Object.entries(count)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')}}. Now scan the other array [${large.join(', ')}] (shown above) and spend from those counts.`,
    codeLine: 8,
  });

  for (let j = 0; j < large.length; j++) {
    const v = large[j];
    if ((count[v] || 0) > 0) {
      count[v] -= 1;
      res.push(v);
      steps.push({
        state: { nums: [...large], hashMap: { ...count }, result: [...res] },
        highlights: [j],
        pointers: { j },
        message: `${v} has ${count[v] + 1} left in the map — take it and decrement to ${count[v]}. Result so far: [${res.join(', ')}]`,
        codeLine: 10,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...large], hashMap: { ...count }, result: [...res] },
        highlights: [],
        secondary: [j],
        pointers: { j },
        message:
          v in count
            ? `${v} is in the map but its count is already 0 — we have used up every copy the other array had. Skip it (this is what stops duplicates from over-counting).`
            : `${v} never appears in the other array — skip it.`,
        codeLine: 9,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...large], hashMap: { ...count }, result: [...res] },
    highlights: [],
    message: `Scan complete. Intersection: [${res.join(', ')}] — ${res.length} element(s). O(n + m) time, O(min(n, m)) space. Order is not specified by the problem.`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const intersectionOfTwoArrays: Algorithm = {
  id: 'intersection-of-two-arrays',
  name: 'Intersection of Two Arrays II',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n + m)',
  spaceComplexity: 'O(min(n, m))',
  pattern: 'Hash Map — count the smaller array, decrement while scanning the other',
  description:
    'Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays, and you may return the result in any order.',
  problemUrl: 'https://leetcode.com/problems/intersection-of-two-arrays-ii/',
  code: {
    python: `def intersect(nums1, nums2):
    if len(nums1) > len(nums2):
        return intersect(nums2, nums1)
    count = {}
    for num in nums1:
        count[num] = count.get(num, 0) + 1
    res = []
    for num in nums2:
        if count.get(num, 0) > 0:
            res.append(num)
            count[num] -= 1
    return res`,
    javascript: `function intersect(nums1, nums2) {
    if (nums1.length > nums2.length) {
        return intersect(nums2, nums1);
    }
    const count = {};
    for (const num of nums1) {
        count[num] = (count[num] || 0) + 1;
    }
    const res = [];
    for (const num of nums2) {
        if (count[num] > 0) {
            res.push(num);
            count[num]--;
        }
    }
    return res;
}`,
    java: `public static int[] intersect(int[] nums1, int[] nums2) {
    if (nums1.length > nums2.length) {
        return intersect(nums2, nums1);
    }
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums1) {
        count.put(num, count.getOrDefault(num, 0) + 1);
    }
    List<Integer> res = new ArrayList<>();
    for (int num : nums2) {
        if (count.getOrDefault(num, 0) > 0) {
            res.add(num);
            count.put(num, count.get(num) - 1);
        }
    }
    int[] out = new int[res.size()];
    for (int i = 0; i < out.length; i++) {
        out[i] = res.get(i);
    }
    return out;
}`,
  },
  defaultInput: { nums1: [3, 1, 2, 2, 8], nums2: [1, 7, 2, 2, 3, 3, 9] },
  run: runIntersection,
  optimalApproachName: 'Hash Map of Counts',
  approaches: [
    {
      id: 'sort-two-pointers',
      name: 'Sort + Two Pointers',
      timeComplexity: 'O(n log n + m log m)',
      spaceComplexity: 'O(1)',
      description:
        'Sort both arrays and walk them together — slower than hashing because of the sorts, but it uses no auxiliary map and is the answer interviewers want when nums2 is huge and streamed from disk.',
      code: {
        python: `def intersect(nums1, nums2):
    nums1.sort()
    nums2.sort()
    i, j, res = 0, 0, []
    while i < len(nums1) and j < len(nums2):
        if nums1[i] < nums2[j]:
            i += 1
        elif nums1[i] > nums2[j]:
            j += 1
        else:
            res.append(nums1[i])
            i += 1
            j += 1
    return res`,
        javascript: `function intersect(nums1, nums2) {
    nums1.sort((a, b) => a - b);
    nums2.sort((a, b) => a - b);
    let i = 0, j = 0;
    const res = [];
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
            i++;
        } else if (nums1[i] > nums2[j]) {
            j++;
        } else {
            res.push(nums1[i]);
            i++;
            j++;
        }
    }
    return res;
}`,
        java: `public static int[] intersect(int[] nums1, int[] nums2) {
    Arrays.sort(nums1);
    Arrays.sort(nums2);
    int i = 0, j = 0, k = 0;
    int[] res = new int[Math.min(nums1.length, nums2.length)];
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
            i++;
        } else if (nums1[i] > nums2[j]) {
            j++;
        } else {
            res[k++] = nums1[i];
            i++;
            j++;
        }
    }
    return Arrays.copyOf(res, k);
}`,
      },
      run: runIntersectionSortTwoPointers,
      lineExplanations: {
        python: {
          1: 'Define function taking both arrays',
          2: 'Sort the first array ascending',
          3: 'Sort the second array ascending',
          4: 'Two pointers plus the output list',
          5: 'Stop as soon as either array is exhausted',
          6: 'nums1 value is smaller — it can never match later',
          7: 'Advance i past it',
          8: 'nums2 value is smaller',
          9: 'Advance j past it',
          10: 'Values are equal — a genuine match',
          11: 'Record the shared value',
          12: 'Advance i so this copy is consumed once',
          13: 'Advance j so this copy is consumed once',
          14: 'Return the collected intersection',
        },
        javascript: {
          1: 'Define function taking both arrays',
          2: 'Numeric sort (default sort is lexicographic!)',
          3: 'Numeric sort for the second array too',
          4: 'Two pointers, one per array',
          5: 'Output list',
          6: 'Stop as soon as either array is exhausted',
          7: 'nums1 value is smaller — it can never match later',
          9: 'nums2 value is smaller',
          12: 'Values are equal — record the shared value',
          13: 'Consume this copy from nums1',
          14: 'Consume this copy from nums2',
          17: 'Return the collected intersection',
        },
        java: {
          1: 'Define method taking both arrays',
          2: 'Sort the first array ascending',
          3: 'Sort the second array ascending',
          4: 'Two read pointers plus a write index k',
          5: 'Output can never exceed the shorter array',
          6: 'Stop as soon as either array is exhausted',
          7: 'nums1 value is smaller — it can never match later',
          9: 'nums2 value is smaller',
          12: 'Values are equal — write the shared value',
          13: 'Consume this copy from nums1',
          14: 'Consume this copy from nums2',
          17: 'Trim the output to the k values actually written',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking both arrays',
      2: 'Check which array is shorter',
      3: 'Recurse with the arguments swapped so the map is the smaller one',
      4: 'Map of value to remaining available copies',
      5: 'Count every value in the shorter array',
      6: 'get(num, 0) handles first sightings',
      7: 'Output list',
      8: 'Scan the longer array once',
      9: 'Is a copy of this value still unspent?',
      10: 'Yes — it belongs in the intersection',
      11: 'Spend it so duplicates are matched at most min(count1, count2) times',
      12: 'Return the collected intersection',
    },
    javascript: {
      1: 'Define function taking both arrays',
      2: 'Check which array is shorter',
      3: 'Recurse with the arguments swapped so the map is the smaller one',
      5: 'Object of value to remaining available copies',
      6: 'Count every value in the shorter array',
      7: '(count[num] || 0) handles first sightings',
      9: 'Output list',
      10: 'Scan the longer array once',
      11: 'Is a copy of this value still unspent?',
      12: 'Yes — it belongs in the intersection',
      13: 'Spend it so duplicates are matched at most min(count1, count2) times',
      16: 'Return the collected intersection',
    },
    java: {
      1: 'Define method taking both arrays',
      2: 'Check which array is shorter',
      3: 'Recurse with the arguments swapped so the map is the smaller one',
      5: 'HashMap of value to remaining available copies',
      6: 'Count every value in the shorter array',
      7: 'getOrDefault avoids a containsKey check',
      9: 'ArrayList because the output size is unknown up front',
      10: 'Scan the longer array once',
      11: 'Is a copy of this value still unspent?',
      12: 'Yes — it belongs in the intersection',
      13: 'Spend it so duplicates are matched at most min(count1, count2) times',
      16: 'Unbox the list into the int[] the signature demands',
      20: 'Return the collected intersection',
    },
  },
};
