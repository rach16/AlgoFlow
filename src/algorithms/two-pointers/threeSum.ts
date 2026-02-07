import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runThreeSum(input: unknown): AlgorithmStep[] {
  const nums = [...(input as number[])];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  // Line 1: def threeSum(nums):
  steps.push({
    state: { nums: [...nums], result: [] },
    highlights: [],
    message: `Find all triplets in [${nums.join(', ')}] that sum to 0`,
    codeLine: 1,
  });

  // Line 2: nums.sort()
  nums.sort((a, b) => a - b);
  steps.push({
    state: { nums: [...nums], result: [] },
    highlights: Array.from({ length: nums.length }, (_, i) => i),
    message: `Sort array: [${nums.join(', ')}]`,
    codeLine: 2,
  });

  // Line 4: for i in range(len(nums)):
  for (let i = 0; i < nums.length; i++) {
    // Line 5: if nums[i] > 0: break
    if (nums[i] > 0) {
      steps.push({
        state: { nums: [...nums], result: [...result] },
        highlights: [i],
        pointers: { i },
        message: `nums[${i}] = ${nums[i]} > 0. No more triplets possible since array is sorted. Break.`,
        codeLine: 5,
      });
      break;
    }

    // Line 7: if i > 0 and nums[i] == nums[i-1]: continue
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        state: { nums: [...nums], result: [...result] },
        highlights: [i, i - 1],
        pointers: { i },
        message: `nums[${i}] = ${nums[i]} equals nums[${i - 1}]. Skip duplicate.`,
        codeLine: 7,
        action: 'compare',
      });
      continue;
    }

    steps.push({
      state: { nums: [...nums], result: [...result] },
      highlights: [i],
      pointers: { i },
      message: `Fix i=${i} (value ${nums[i]}). Find pairs that sum to ${-nums[i]}`,
      codeLine: 4,
      action: 'visit',
    });

    let left = i + 1;
    let right = nums.length - 1;

    // Line 9: l, r = i + 1, len(nums) - 1
    steps.push({
      state: { nums: [...nums], result: [...result] },
      highlights: [i, left, right],
      pointers: { i, left, right },
      message: `Set left=${left}, right=${right}`,
      codeLine: 9,
    });

    // Line 10: while l < r:
    while (left < right) {
      const threeSum = nums[i] + nums[left] + nums[right];

      // Line 11: threeSum = nums[i] + nums[l] + nums[r]
      steps.push({
        state: { nums: [...nums], result: [...result], sum: threeSum },
        highlights: [i, left, right],
        pointers: { i, left, right },
        message: `Sum: nums[${i}] + nums[${left}] + nums[${right}] = ${nums[i]} + ${nums[left]} + ${nums[right]} = ${threeSum}`,
        codeLine: 11,
        action: 'compare',
      });

      if (threeSum > 0) {
        // Line 13: if threeSum > 0: r -= 1
        steps.push({
          state: { nums: [...nums], result: [...result], sum: threeSum },
          highlights: [i, left, right],
          pointers: { i, left, right },
          message: `${threeSum} > 0, sum too large. Move right pointer left`,
          codeLine: 13,
          action: 'compare',
        });
        right--;
      } else if (threeSum < 0) {
        // Line 15: elif threeSum < 0: l += 1
        steps.push({
          state: { nums: [...nums], result: [...result], sum: threeSum },
          highlights: [i, left, right],
          pointers: { i, left, right },
          message: `${threeSum} < 0, sum too small. Move left pointer right`,
          codeLine: 15,
          action: 'compare',
        });
        left++;
      } else {
        // Line 17: res.append([nums[i], nums[l], nums[r]])
        const triplet = [nums[i], nums[left], nums[right]];
        result.push(triplet);

        steps.push({
          state: { nums: [...nums], result: [...result], sum: threeSum },
          highlights: [i, left, right],
          pointers: { i, left, right },
          message: `Found triplet! [${triplet.join(', ')}]. Add to result.`,
          codeLine: 17,
          action: 'found',
        });

        // Line 18: l += 1
        left++;

        // Line 19: while nums[l] == nums[l-1] and l < r: l += 1
        while (left < right && nums[left] === nums[left - 1]) {
          steps.push({
            state: { nums: [...nums], result: [...result] },
            highlights: [i, left, right],
            pointers: { i, left, right },
            message: `nums[${left}] = ${nums[left]} equals previous. Skip duplicate left pointer.`,
            codeLine: 19,
          });
          left++;
        }

        steps.push({
          state: { nums: [...nums], result: [...result] },
          highlights: [i, left, right],
          pointers: { i, left, right },
          message: `After skipping duplicates: left=${left}, right=${right}`,
          codeLine: 18,
        });
      }
    }
  }

  // Line 20: return res
  steps.push({
    state: { nums: [...nums], result: [...result] },
    highlights: [],
    message: `Complete! Found ${result.length} triplet(s): [${result.map((t) => `[${t.join(', ')}]`).join(', ')}]`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

export const threeSum: Algorithm = {
  id: 'three-sum',
  name: '3Sum',
  category: 'Two Pointers',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  pattern: 'Sort + Two Pointers — fix one, search pair',
  description:
    'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.',
  problemUrl: 'https://leetcode.com/problems/3sum/',
  code: {
    python: `def threeSum(nums):
    nums.sort()
    res = []

    for i in range(len(nums)):
        if nums[i] > 0:
            break

        if i > 0 and nums[i] == nums[i - 1]:
            continue

        l, r = i + 1, len(nums) - 1
        while l < r:
            threeSum = nums[i] + nums[l] + nums[r]

            if threeSum > 0:
                r -= 1
            elif threeSum < 0:
                l += 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                while nums[l] == nums[l - 1] and l < r:
                    l += 1
    return res`,
    javascript: `function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const res = [];

    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > 0) break;

        if (i > 0 && nums[i] === nums[i - 1]) continue;

        let l = i + 1;
        let r = nums.length - 1;
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r];

            if (sum > 0) {
                r--;
            } else if (sum < 0) {
                l++;
            } else {
                res.push([nums[i], nums[l], nums[r]]);
                l++;
                while (nums[l] === nums[l - 1] && l < r) {
                    l++;
                }
            }
        }
    }
    return res;
}`,
    java: `public static List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();

    for (int i = 0; i < nums.length; i++) {
        if (nums[i] > 0) break;

        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int l = i + 1;
        int r = nums.length - 1;
        while (l < r) {
            int sum = nums[i] + nums[l] + nums[r];

            if (sum > 0) {
                r--;
            } else if (sum < 0) {
                l++;
            } else {
                res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                l++;
                while (nums[l] == nums[l - 1] && l < r) {
                    l++;
                }
            }
        }
    }
    return res;
}`,
  },
  defaultInput: [-1, 0, 1, 2, -1, -4],
  run: runThreeSum,
};
