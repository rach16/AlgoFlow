import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface FourSumInput {
  nums: number[];
  target: number;
}

function runFourSum(input: unknown): AlgorithmStep[] {
  const { nums: raw, target } = input as FourSumInput;
  const nums = [...raw];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  steps.push({
    state: { nums: [...nums], target, result: [] },
    highlights: [],
    message: `Find every unique quadruplet in [${nums.join(', ')}] that sums to ${target}`,
    codeLine: 1,
  });

  nums.sort((a, b) => a - b);
  const n = nums.length;

  steps.push({
    state: { nums: [...nums], target, result: [] },
    highlights: Array.from({ length: n }, (_, k) => k),
    message: `Sort first: [${nums.join(', ')}]. Sorting lets us shrink the search with two pointers and skip duplicates cheaply`,
    codeLine: 2,
  });

  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        state: { nums: [...nums], target, result: [...result] },
        highlights: [i, i - 1],
        pointers: { i },
        message: `nums[${i}] = ${nums[i]} repeats nums[${i - 1}] — any quadruplet starting here was already found. Skip`,
        codeLine: 7,
        action: 'compare',
      });
      continue;
    }

    steps.push({
      state: { nums: [...nums], target, result: [...result] },
      highlights: [i],
      pointers: { i },
      message: `Fix the 1st number: nums[${i}] = ${nums[i]}. The remaining three must sum to ${target - nums[i]}`,
      codeLine: 6,
      action: 'visit',
    });

    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) {
        steps.push({
          state: { nums: [...nums], target, result: [...result] },
          highlights: [j, j - 1],
          secondary: [i],
          pointers: { i, j },
          message: `nums[${j}] = ${nums[j]} repeats nums[${j - 1}] — same 2nd number as before. Skip to avoid duplicate quadruplets`,
          codeLine: 10,
          action: 'compare',
        });
        continue;
      }

      const need = target - nums[i] - nums[j];
      steps.push({
        state: { nums: [...nums], target, result: [...result] },
        highlights: [i, j],
        pointers: { i, j },
        message: `Fix the 2nd number: nums[${j}] = ${nums[j]}. Now it is a 2Sum: find a pair to the right summing to ${need}`,
        codeLine: 9,
        action: 'visit',
      });

      let l = j + 1;
      let r = n - 1;

      steps.push({
        state: { nums: [...nums], target, result: [...result] },
        highlights: [i, j, l, r],
        pointers: { i, j, l, r },
        message: `Two pointers on the suffix: l=${l} (value ${nums[l]}), r=${r} (value ${nums[r]})`,
        codeLine: 12,
      });

      while (l < r) {
        const total = nums[i] + nums[j] + nums[l] + nums[r];

        if (total < target) {
          steps.push({
            state: { nums: [...nums], target, result: [...result], sum: total },
            highlights: [i, j, l, r],
            pointers: { i, j, l, r },
            message: `${nums[i]} + ${nums[j]} + ${nums[l]} + ${nums[r]} = ${total} < ${target} — too small, move l right to grow the sum`,
            codeLine: 15,
            action: 'compare',
          });
          l++;
        } else if (total > target) {
          steps.push({
            state: { nums: [...nums], target, result: [...result], sum: total },
            highlights: [i, j, l, r],
            pointers: { i, j, l, r },
            message: `${nums[i]} + ${nums[j]} + ${nums[l]} + ${nums[r]} = ${total} > ${target} — too big, move r left to shrink the sum`,
            codeLine: 17,
            action: 'compare',
          });
          r--;
        } else {
          const quad = [nums[i], nums[j], nums[l], nums[r]];
          result.push(quad);
          steps.push({
            state: { nums: [...nums], target, result: [...result], sum: total },
            highlights: [i, j, l, r],
            pointers: { i, j, l, r },
            message: `${nums[i]} + ${nums[j]} + ${nums[l]} + ${nums[r]} = ${target} — quadruplet [${quad.join(', ')}] found!`,
            codeLine: 20,
            action: 'found',
          });

          l++;
          while (l < r && nums[l] === nums[l - 1]) {
            steps.push({
              state: { nums: [...nums], target, result: [...result] },
              highlights: [l, l - 1],
              pointers: { i, j, l, r },
              message: `nums[${l}] = ${nums[l]} duplicates the value we just used — skip so the same quadruplet is not added twice`,
              codeLine: 22,
            });
            l++;
          }
        }
      }
    }
  }

  steps.push({
    state: { nums: [...nums], target, result: [...result] },
    highlights: [],
    message: `Done! ${result.length} unique quadruplet(s): ${result.map((q) => `[${q.join(', ')}]`).join(', ')}`,
    codeLine: 24,
    action: 'found',
  });

  return steps;
}

function runFourSumKSum(input: unknown): AlgorithmStep[] {
  const { nums: raw, target } = input as FourSumInput;
  const nums = [...raw];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], target, result: [] },
    highlights: [],
    message: `Same problem, generalized: solve kSum recursively. 4Sum peels off one number and calls 3Sum, which peels one and calls 2Sum`,
    codeLine: 1,
  });

  nums.sort((a, b) => a - b);
  const n = nums.length;

  steps.push({
    state: { nums: [...nums], target, result: [] },
    highlights: Array.from({ length: n }, (_, k) => k),
    message: `Sort once: [${nums.join(', ')}]. Every recursion level relies on this order`,
    codeLine: 2,
  });

  const found: number[][] = [];

  function twoSum(t: number, start: number, prefix: number[]): number[][] {
    const pairs: number[][] = [];
    let l = start;
    let r = n - 1;

    steps.push({
      state: { nums: [...nums], target, result: [...found] },
      highlights: l < r ? [l, r] : [],
      pointers: l < r ? { l, r } : {},
      message: `Base case k=2: with ${prefix.join(' + ')} chosen, find pairs in indices ${start}..${n - 1} summing to ${t}`,
      codeLine: 18,
      action: 'visit',
    });

    while (l < r) {
      const s = nums[l] + nums[r];
      if (s < t) {
        steps.push({
          state: { nums: [...nums], target, result: [...found] },
          highlights: [l, r],
          pointers: { l, r },
          message: `${nums[l]} + ${nums[r]} = ${s} < ${t} — need more, move l right`,
          codeLine: 23,
          action: 'compare',
        });
        l++;
      } else if (s > t) {
        steps.push({
          state: { nums: [...nums], target, result: [...found] },
          highlights: [l, r],
          pointers: { l, r },
          message: `${nums[l]} + ${nums[r]} = ${s} > ${t} — too much, move r left`,
          codeLine: 25,
          action: 'compare',
        });
        r--;
      } else {
        const pair = [nums[l], nums[r]];
        pairs.push(pair);
        found.push([...prefix, ...pair]);
        steps.push({
          state: { nums: [...nums], target, result: [...found] },
          highlights: [l, r],
          pointers: { l, r },
          message: `${nums[l]} + ${nums[r]} = ${t} — pair found. Combined with ${prefix.join(' + ')} it makes [${[...prefix, ...pair].join(', ')}]`,
          codeLine: 28,
          action: 'found',
        });
        l++;
        while (l < r && nums[l] === nums[l - 1]) {
          steps.push({
            state: { nums: [...nums], target, result: [...found] },
            highlights: [l, l - 1],
            pointers: { l, r },
            message: `nums[${l}] duplicates the value just used — skip it`,
            codeLine: 30,
          });
          l++;
        }
      }
    }

    return pairs;
  }

  function kSum(t: number, start: number, k: number, prefix: number[]): number[][] {
    if (k === 2) return twoSum(t, start, prefix);

    const res: number[][] = [];
    steps.push({
      state: { nums: [...nums], target, result: [...found] },
      highlights: [],
      message: `kSum(k=${k}, start=${start}, target=${t}): pick one number from indices ${start}..${n - k}, then recurse for the other ${k - 1}`,
      codeLine: 11,
      action: 'visit',
    });

    for (let i = start; i < n - k + 1; i++) {
      if (i > start && nums[i] === nums[i - 1]) {
        steps.push({
          state: { nums: [...nums], target, result: [...found] },
          highlights: [i, i - 1],
          pointers: { i },
          message: `nums[${i}] = ${nums[i]} repeats its neighbour at this level — skip to keep results unique`,
          codeLine: 12,
          action: 'compare',
        });
        continue;
      }

      steps.push({
        state: { nums: [...nums], target, result: [...found] },
        highlights: [i],
        pointers: { i },
        message: `Take nums[${i}] = ${nums[i]} at level k=${k}. Recurse with k=${k - 1} and target ${t} - ${nums[i]} = ${t - nums[i]}`,
        codeLine: 14,
      });

      const subsets = kSum(t - nums[i], i + 1, k - 1, [...prefix, nums[i]]);
      for (const subset of subsets) {
        res.push([nums[i], ...subset]);
      }
    }

    return res;
  }

  const result = kSum(target, 0, 4, []);

  steps.push({
    state: { nums: [...nums], target, result: [...found] },
    highlights: [],
    message: `Done! ${result.length} unique quadruplet(s): ${result.map((q) => `[${q.join(', ')}]`).join(', ')}. The same code solves 3Sum, 5Sum, kSum — only the initial k changes`,
    codeLine: 3,
    action: 'found',
  });

  return steps;
}

export const fourSum: Algorithm = {
  id: 'four-sum',
  name: '4Sum',
  category: 'Two Pointers',
  difficulty: 'Medium',
  timeComplexity: 'O(n³)',
  spaceComplexity: 'O(1)',
  pattern: 'Sort + Two Pointers — fix two, search pair',
  description:
    'Given an array nums of n integers, return all unique quadruplets [nums[a], nums[b], nums[c], nums[d]] with distinct indices such that their sum equals target. The solution set must not contain duplicate quadruplets.',
  problemUrl: 'https://leetcode.com/problems/4sum/',
  code: {
    python: `def fourSum(nums, target):
    nums.sort()
    res = []
    n = len(nums)

    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            l, r = j + 1, n - 1
            while l < r:
                total = nums[i] + nums[j] + nums[l] + nums[r]
                if total < target:
                    l += 1
                elif total > target:
                    r -= 1
                else:
                    res.append([nums[i], nums[j], nums[l], nums[r]])
                    l += 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
    return res`,
    javascript: `function fourSum(nums, target) {
    nums.sort((a, b) => a - b);
    const res = [];
    const n = nums.length;

    for (let i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        for (let j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            let l = j + 1;
            let r = n - 1;
            while (l < r) {
                const total = nums[i] + nums[j] + nums[l] + nums[r];
                if (total < target) {
                    l++;
                } else if (total > target) {
                    r--;
                } else {
                    res.push([nums[i], nums[j], nums[l], nums[r]]);
                    l++;
                    while (l < r && nums[l] === nums[l - 1]) l++;
                }
            }
        }
    }
    return res;
}`,
    java: `public static List<List<Integer>> fourSum(int[] nums, int target) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    int n = nums.length;

    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            int l = j + 1;
            int r = n - 1;
            while (l < r) {
                long total = (long) nums[i] + nums[j] + nums[l] + nums[r];
                if (total < target) {
                    l++;
                } else if (total > target) {
                    r--;
                } else {
                    res.add(Arrays.asList(nums[i], nums[j], nums[l], nums[r]));
                    l++;
                    while (l < r && nums[l] == nums[l - 1]) l++;
                }
            }
        }
    }
    return res;
}`,
  },
  defaultInput: { nums: [1, 0, -1, 0, -2, 2], target: 0 },
  run: runFourSum,
  optimalApproachName: 'Sort + Two Pointers',
  approaches: [
    {
      id: 'ksum-recursion',
      name: 'kSum Recursion',
      timeComplexity: 'O(n³)',
      spaceComplexity: 'O(n)',
      description:
        'Generalize to kSum: peel off one number per recursion level until k reaches 2, then finish with the same two-pointer scan — one function that solves 3Sum, 4Sum and beyond, at the cost of O(n) recursion stack.',
      code: {
        python: `def fourSum(nums, target):
    nums.sort()
    return kSum(nums, target, 0, 4)

def kSum(nums, target, start, k):
    res = []
    if start == len(nums):
        return res
    if k == 2:
        return twoSum(nums, target, start)
    for i in range(start, len(nums) - k + 1):
        if i > start and nums[i] == nums[i - 1]:
            continue
        for subset in kSum(nums, target - nums[i], i + 1, k - 1):
            res.append([nums[i]] + subset)
    return res

def twoSum(nums, target, start):
    res = []
    l, r = start, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s < target:
            l += 1
        elif s > target:
            r -= 1
        else:
            res.append([nums[l], nums[r]])
            l += 1
            while l < r and nums[l] == nums[l - 1]:
                l += 1
    return res`,
        javascript: `function fourSum(nums, target) {
    nums.sort((a, b) => a - b);
    return kSum(nums, target, 0, 4);
}

function kSum(nums, target, start, k) {
    const res = [];
    if (start === nums.length) return res;
    if (k === 2) return twoSum(nums, target, start);
    for (let i = start; i < nums.length - k + 1; i++) {
        if (i > start && nums[i] === nums[i - 1]) continue;
        for (const subset of kSum(nums, target - nums[i], i + 1, k - 1)) {
            res.push([nums[i], ...subset]);
        }
    }
    return res;
}

function twoSum(nums, target, start) {
    const res = [];
    let l = start;
    let r = nums.length - 1;
    while (l < r) {
        const s = nums[l] + nums[r];
        if (s < target) {
            l++;
        } else if (s > target) {
            r--;
        } else {
            res.push([nums[l], nums[r]]);
            l++;
            while (l < r && nums[l] === nums[l - 1]) l++;
        }
    }
    return res;
}`,
        java: `public static List<List<Integer>> fourSum(int[] nums, int target) {
    Arrays.sort(nums);
    return kSum(nums, target, 0, 4);
}

private static List<List<Integer>> kSum(int[] nums, long target, int start, int k) {
    List<List<Integer>> res = new ArrayList<>();
    if (start == nums.length) return res;
    if (k == 2) return twoSum(nums, target, start);
    for (int i = start; i < nums.length - k + 1; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;
        for (List<Integer> subset : kSum(nums, target - nums[i], i + 1, k - 1)) {
            List<Integer> quad = new ArrayList<>();
            quad.add(nums[i]);
            quad.addAll(subset);
            res.add(quad);
        }
    }
    return res;
}

private static List<List<Integer>> twoSum(int[] nums, long target, int start) {
    List<List<Integer>> res = new ArrayList<>();
    int l = start;
    int r = nums.length - 1;
    while (l < r) {
        long s = nums[l] + nums[r];
        if (s < target) {
            l++;
        } else if (s > target) {
            r--;
        } else {
            res.add(Arrays.asList(nums[l], nums[r]));
            l++;
            while (l < r && nums[l] == nums[l - 1]) l++;
        }
    }
    return res;
}`,
      },
      run: runFourSumKSum,
      lineExplanations: {
        python: {
          1: 'Entry point: 4Sum is just kSum with k = 4',
          2: 'Sort once — every recursion level depends on the order',
          3: 'Kick off the recursion at index 0 with k = 4',
          5: 'Generic kSum over the suffix starting at "start"',
          6: 'Collect the tuples found at this level',
          7: 'Nothing left to pick from',
          8: 'Return the empty list',
          9: 'Base case: two numbers left',
          10: 'Finish with the two-pointer 2Sum scan',
          11: 'Try each value as the next member of the tuple',
          12: 'Skip a repeated value at this level',
          13: 'Continue to the next candidate',
          14: 'Recurse for the remaining k - 1 numbers, target reduced',
          15: 'Prepend the chosen value to each returned subset',
          16: 'Return this level\'s tuples',
          18: 'Two-pointer 2Sum on the sorted suffix',
          19: 'Pairs found here',
          20: 'Pointers at the ends of the suffix',
          21: 'Shrink the window until the pointers meet',
          22: 'Current pair sum',
          23: 'Sum too small',
          24: 'Move left pointer right to increase it',
          25: 'Sum too large',
          26: 'Move right pointer left to decrease it',
          27: 'Exact match',
          28: 'Record the pair',
          29: 'Advance past the used value',
          30: 'Skip duplicates so pairs stay unique',
          31: 'Keep advancing',
          32: 'Return all pairs for this suffix',
        },
        javascript: {
          1: 'Entry point: 4Sum is just kSum with k = 4',
          2: 'Sort once — every recursion level depends on the order',
          3: 'Kick off the recursion at index 0 with k = 4',
          6: 'Generic kSum over the suffix starting at "start"',
          7: 'Collect the tuples found at this level',
          8: 'Nothing left to pick from — return empty',
          9: 'Base case: hand off to the two-pointer 2Sum',
          10: 'Try each value as the next member of the tuple',
          11: 'Skip a repeated value at this level',
          12: 'Recurse for the remaining k - 1 numbers, target reduced',
          13: 'Prepend the chosen value to each returned subset',
          16: 'Return this level\'s tuples',
          19: 'Two-pointer 2Sum on the sorted suffix',
          20: 'Pairs found here',
          21: 'Left pointer at the start of the suffix',
          22: 'Right pointer at the end of the array',
          23: 'Shrink the window until the pointers meet',
          24: 'Current pair sum',
          25: 'Sum too small',
          26: 'Move left pointer right to increase it',
          27: 'Sum too large',
          28: 'Move right pointer left to decrease it',
          30: 'Record the matching pair',
          31: 'Advance past the used value',
          32: 'Skip duplicates so pairs stay unique',
          35: 'Return all pairs for this suffix',
        },
        java: {
          1: 'Entry point: 4Sum is just kSum with k = 4',
          2: 'Sort once — every recursion level depends on the order',
          3: 'Kick off the recursion at index 0 with k = 4',
          6: 'Generic kSum over the suffix starting at "start"',
          7: 'Collect the tuples found at this level',
          8: 'Nothing left to pick from — return empty',
          9: 'Base case: hand off to the two-pointer 2Sum',
          10: 'Try each value as the next member of the tuple',
          11: 'Skip a repeated value at this level',
          12: 'Recurse for the remaining k - 1 numbers, target reduced',
          13: 'Build the combined tuple',
          14: 'Chosen value goes first',
          15: 'Then the values from the deeper level',
          16: 'Store it',
          19: 'Return this level\'s tuples',
          22: 'Two-pointer 2Sum on the sorted suffix',
          24: 'Left pointer at the start of the suffix',
          25: 'Right pointer at the end of the array',
          26: 'Shrink the window until the pointers meet',
          27: 'Current pair sum (long guards against overflow)',
          28: 'Sum too small',
          29: 'Move left pointer right to increase it',
          30: 'Sum too large',
          31: 'Move right pointer left to decrease it',
          33: 'Record the matching pair',
          34: 'Advance past the used value',
          35: 'Skip duplicates so pairs stay unique',
          38: 'Return all pairs for this suffix',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums and the target sum',
      2: 'Sort so two pointers work and duplicates sit together',
      3: 'Result list of unique quadruplets',
      4: 'Cache the length',
      6: 'Choose the 1st number (leave room for three more)',
      7: 'Same 1st number as last iteration?',
      8: 'Skip it — those quadruplets are already recorded',
      9: 'Choose the 2nd number from the remaining suffix',
      10: 'Same 2nd number as last iteration?',
      11: 'Skip it for the same reason',
      12: 'Two pointers bracket the rest of the array',
      13: 'Close in until they meet',
      14: 'Sum of the four candidates',
      15: 'Sum below target',
      16: 'Move left pointer right to increase the sum',
      17: 'Sum above target',
      18: 'Move right pointer left to decrease the sum',
      19: 'Exact hit',
      20: 'Record the quadruplet',
      21: 'Advance past the value we just used',
      22: 'Skip repeats of that value',
      23: 'Keep advancing while they repeat',
      24: 'Return every unique quadruplet',
    },
    javascript: {
      1: 'Define function taking nums and the target sum',
      2: 'Numeric sort so two pointers work and duplicates group',
      3: 'Result array of unique quadruplets',
      4: 'Cache the length',
      6: 'Choose the 1st number (leave room for three more)',
      7: 'Skip a repeated 1st number',
      8: 'Choose the 2nd number from the remaining suffix',
      9: 'Skip a repeated 2nd number',
      10: 'Left pointer just past j',
      11: 'Right pointer at the end',
      12: 'Close in until they meet',
      13: 'Sum of the four candidates',
      14: 'Sum below target',
      15: 'Move left pointer right to increase the sum',
      16: 'Sum above target',
      17: 'Move right pointer left to decrease the sum',
      19: 'Record the quadruplet',
      20: 'Advance past the value we just used',
      21: 'Skip repeats of that value',
      26: 'Return every unique quadruplet',
    },
    java: {
      1: 'Define function taking nums and the target sum',
      2: 'Sort so two pointers work and duplicates group',
      3: 'Result list of unique quadruplets',
      4: 'Cache the length',
      6: 'Choose the 1st number (leave room for three more)',
      7: 'Skip a repeated 1st number',
      8: 'Choose the 2nd number from the remaining suffix',
      9: 'Skip a repeated 2nd number',
      10: 'Left pointer just past j',
      11: 'Right pointer at the end',
      12: 'Close in until they meet',
      13: 'Sum as long — four ints can overflow',
      14: 'Sum below target',
      15: 'Move left pointer right to increase the sum',
      16: 'Sum above target',
      17: 'Move right pointer left to decrease the sum',
      19: 'Record the quadruplet',
      20: 'Advance past the value we just used',
      21: 'Skip repeats of that value',
      26: 'Return every unique quadruplet',
    },
  },
};
