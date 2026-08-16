import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runTrappingRainWater(input: unknown): AlgorithmStep[] {
  const height = input as number[];
  const steps: AlgorithmStep[] = [];

  // Line 1: def trap(height):
  steps.push({
    state: { nums: [...height], totalWater: 0 },
    highlights: [],
    message: `Calculate trapped rain water for heights [${height.join(', ')}]`,
    codeLine: 1,
  });

  if (height.length === 0) {
    steps.push({
      state: { nums: [], totalWater: 0, result: 0 },
      highlights: [],
      message: 'Empty array, no water can be trapped. Return 0.',
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  let left = 0;
  let right = height.length - 1;
  let leftMax = height[left];
  let rightMax = height[right];
  let totalWater = 0;

  // Line 3-5: Initialize pointers and max heights
  steps.push({
    state: { nums: [...height], totalWater, leftMax, rightMax },
    highlights: [left, right],
    pointers: { left, right },
    message: `Initialize: left=0, right=${right}, leftMax=${leftMax}, rightMax=${rightMax}, totalWater=0`,
    codeLine: 5,
  });

  // Line 7: while l < r:
  while (left < right) {
    // Line 8-9: if height[l] <= height[r]:
    if (height[left] <= height[right]) {
      steps.push({
        state: { nums: [...height], totalWater, leftMax, rightMax },
        highlights: [left, right],
        pointers: { left, right },
        message: `height[${left}]=${height[left]} <= height[${right}]=${height[right]}. Process left side.`,
        codeLine: 8,
        action: 'compare',
      });

      // Line 9: l += 1
      left++;

      steps.push({
        state: { nums: [...height], totalWater, leftMax, rightMax },
        highlights: [left, right],
        pointers: { left, right },
        message: `Move left pointer to index ${left} (height ${height[left]})`,
        codeLine: 9,
      });

      // Line 10: leftMax = max(leftMax, height[l])
      const prevLeftMax = leftMax;
      leftMax = Math.max(leftMax, height[left]);

      if (height[left] > prevLeftMax) {
        steps.push({
          state: { nums: [...height], totalWater, leftMax, rightMax },
          highlights: [left],
          pointers: { left, right },
          message: `height[${left}]=${height[left]} > leftMax=${prevLeftMax}. Update leftMax=${leftMax}`,
          codeLine: 10,
          action: 'visit',
        });
      } else {
        // Line 11: res += leftMax - height[l]
        const water = leftMax - height[left];
        totalWater += water;

        steps.push({
          state: { nums: [...height], totalWater, leftMax, rightMax, waterAtIndex: water },
          highlights: [left],
          pointers: { left, right },
          message: `Water at index ${left}: leftMax(${leftMax}) - height(${height[left]}) = ${water}. Total water = ${totalWater}`,
          codeLine: 11,
          action: water > 0 ? 'found' : 'visit',
        });
      }
    } else {
      // Line 13: else (height[l] > height[r])
      steps.push({
        state: { nums: [...height], totalWater, leftMax, rightMax },
        highlights: [left, right],
        pointers: { left, right },
        message: `height[${left}]=${height[left]} > height[${right}]=${height[right]}. Process right side.`,
        codeLine: 13,
        action: 'compare',
      });

      // Line 14: r -= 1
      right--;

      steps.push({
        state: { nums: [...height], totalWater, leftMax, rightMax },
        highlights: [left, right],
        pointers: { left, right },
        message: `Move right pointer to index ${right} (height ${height[right]})`,
        codeLine: 14,
      });

      // Line 15: rightMax = max(rightMax, height[r])
      const prevRightMax = rightMax;
      rightMax = Math.max(rightMax, height[right]);

      if (height[right] > prevRightMax) {
        steps.push({
          state: { nums: [...height], totalWater, leftMax, rightMax },
          highlights: [right],
          pointers: { left, right },
          message: `height[${right}]=${height[right]} > rightMax=${prevRightMax}. Update rightMax=${rightMax}`,
          codeLine: 15,
          action: 'visit',
        });
      } else {
        // Line 16: res += rightMax - height[r]
        const water = rightMax - height[right];
        totalWater += water;

        steps.push({
          state: { nums: [...height], totalWater, leftMax, rightMax, waterAtIndex: water },
          highlights: [right],
          pointers: { left, right },
          message: `Water at index ${right}: rightMax(${rightMax}) - height(${height[right]}) = ${water}. Total water = ${totalWater}`,
          codeLine: 16,
          action: water > 0 ? 'found' : 'visit',
        });
      }
    }
  }

  // Line 17: return res
  steps.push({
    state: { nums: [...height], totalWater, result: totalWater },
    highlights: [],
    message: `Complete! Total trapped water = ${totalWater}`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

function runTrappingRainWaterPrefixMax(input: unknown): AlgorithmStep[] {
  const height = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...height], totalWater: 0 },
    highlights: [],
    message: `Water above each bar = min(tallest wall to its left, tallest wall to its right) - its own height. Precompute both walls for every bar`,
    codeLine: 1,
  });

  if (height.length === 0) {
    steps.push({
      state: { nums: [], totalWater: 0, result: 0 },
      highlights: [],
      message: 'Empty array, no water can be trapped. Return 0.',
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  const n = height.length;
  const leftMaxArr = new Array<number>(n).fill(0);
  const rightMaxArr = new Array<number>(n).fill(0);

  leftMaxArr[0] = height[0];
  steps.push({
    state: { nums: [...height], totalWater: 0, leftMax: leftMaxArr[0] },
    highlights: [0],
    pointers: { i: 0 },
    message: `Left-to-right pass: leftMax[0] = height[0] = ${height[0]}`,
    codeLine: 7,
    action: 'visit',
  });

  for (let i = 1; i < n; i++) {
    const prev = leftMaxArr[i - 1];
    leftMaxArr[i] = Math.max(prev, height[i]);
    steps.push({
      state: { nums: [...height], totalWater: 0, leftMax: leftMaxArr[i] },
      highlights: [i],
      pointers: { i },
      message: `leftMax[${i}] = max(${prev}, ${height[i]}) = ${leftMaxArr[i]} — the tallest wall at or left of index ${i}`,
      codeLine: 9,
      action: 'visit',
    });
  }

  rightMaxArr[n - 1] = height[n - 1];
  steps.push({
    state: { nums: [...height], totalWater: 0, rightMax: rightMaxArr[n - 1] },
    highlights: [n - 1],
    pointers: { i: n - 1 },
    message: `Right-to-left pass: rightMax[${n - 1}] = height[${n - 1}] = ${height[n - 1]}`,
    codeLine: 10,
    action: 'visit',
  });

  for (let i = n - 2; i >= 0; i--) {
    const prev = rightMaxArr[i + 1];
    rightMaxArr[i] = Math.max(prev, height[i]);
    steps.push({
      state: { nums: [...height], totalWater: 0, rightMax: rightMaxArr[i] },
      highlights: [i],
      pointers: { i },
      message: `rightMax[${i}] = max(${prev}, ${height[i]}) = ${rightMaxArr[i]} — the tallest wall at or right of index ${i}`,
      codeLine: 12,
      action: 'visit',
    });
  }

  let totalWater = 0;
  for (let i = 0; i < n; i++) {
    const water = Math.min(leftMaxArr[i], rightMaxArr[i]) - height[i];
    totalWater += water;
    steps.push({
      state: {
        nums: [...height],
        totalWater,
        leftMax: leftMaxArr[i],
        rightMax: rightMaxArr[i],
        waterAtIndex: water,
      },
      highlights: [i],
      pointers: { i },
      message: `Index ${i}: min(leftMax ${leftMaxArr[i]}, rightMax ${rightMaxArr[i]}) - height ${height[i]} = ${water} water. Total = ${totalWater}`,
      codeLine: 15,
      action: water > 0 ? 'found' : 'visit',
    });
  }

  steps.push({
    state: { nums: [...height], totalWater, result: totalWater },
    highlights: [],
    message: `Complete! Total trapped water = ${totalWater} — same O(n) time as two pointers, but O(n) extra space for the two arrays`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const trappingRainWater: Algorithm = {
  id: 'trapping-rain-water',
  name: 'Trapping Rain Water',
  category: 'Two Pointers',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — track left max and right max',
  description:
    'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
  problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
  code: {
    python: `def trap(height):
    if not height:
        return 0

    l, r = 0, len(height) - 1
    leftMax, rightMax = height[l], height[r]
    res = 0

    while l < r:
        if height[l] <= height[r]:
            l += 1
            leftMax = max(leftMax, height[l])
            res += leftMax - height[l]
        else:
            r -= 1
            rightMax = max(rightMax, height[r])
            res += rightMax - height[r]

    return res`,
    javascript: `function trap(height) {
    if (!height.length) return 0;

    let l = 0;
    let r = height.length - 1;
    let leftMax = height[l];
    let rightMax = height[r];
    let res = 0;

    while (l < r) {
        if (height[l] <= height[r]) {
            l++;
            leftMax = Math.max(leftMax, height[l]);
            res += leftMax - height[l];
        } else {
            r--;
            rightMax = Math.max(rightMax, height[r]);
            res += rightMax - height[r];
        }
    }

    return res;
}`,
    java: `public static int trap(int[] height) {
    if (height.length == 0) return 0;

    int l = 0;
    int r = height.length - 1;
    int leftMax = height[l];
    int rightMax = height[r];
    int res = 0;

    while (l < r) {
        if (height[l] <= height[r]) {
            l++;
            leftMax = Math.max(leftMax, height[l]);
            res += leftMax - height[l];
        } else {
            r--;
            rightMax = Math.max(rightMax, height[r]);
            res += rightMax - height[r];
        }
    }

    return res;
}`,
  },
  defaultInput: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
  run: runTrappingRainWater,
  optimalApproachName: 'Two Pointers',
  approaches: [
    {
      id: 'prefix-max-arrays',
      name: 'Prefix Max Arrays',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Precompute leftMax and rightMax arrays in two passes, then sum min(leftMax, rightMax) - height per bar — same O(n) time as two pointers but with O(n) extra space.',
      code: {
        python: `def trap(height):
    if not height:
        return 0
    n = len(height)
    leftMax = [0] * n
    rightMax = [0] * n
    leftMax[0] = height[0]
    for i in range(1, n):
        leftMax[i] = max(leftMax[i - 1], height[i])
    rightMax[n - 1] = height[n - 1]
    for i in range(n - 2, -1, -1):
        rightMax[i] = max(rightMax[i + 1], height[i])
    res = 0
    for i in range(n):
        res += min(leftMax[i], rightMax[i]) - height[i]
    return res`,
        javascript: `function trap(height) {
    if (!height.length) return 0;

    const n = height.length;
    const leftMax = new Array(n).fill(0);
    const rightMax = new Array(n).fill(0);
    leftMax[0] = height[0];
    for (let i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1], height[i]);
    }
    rightMax[n - 1] = height[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1], height[i]);
    }
    let res = 0;
    for (let i = 0; i < n; i++) {
        res += Math.min(leftMax[i], rightMax[i]) - height[i];
    }
    return res;
}`,
        java: `public static int trap(int[] height) {
    if (height.length == 0) return 0;

    int n = height.length;
    int[] leftMax = new int[n];
    int[] rightMax = new int[n];
    leftMax[0] = height[0];
    for (int i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1], height[i]);
    }
    rightMax[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1], height[i]);
    }
    int res = 0;
    for (int i = 0; i < n; i++) {
        res += Math.min(leftMax[i], rightMax[i]) - height[i];
    }
    return res;
}`,
      },
      run: runTrappingRainWaterPrefixMax,
      lineExplanations: {
        python: {
          1: 'Define function taking height array',
          2: 'Handle empty array edge case',
          3: 'Return 0 if no bars exist',
          4: 'Number of bars',
          5: 'leftMax[i] will hold the tallest wall at or left of i',
          6: 'rightMax[i] will hold the tallest wall at or right of i',
          7: 'First bar: its left wall is itself',
          8: 'Left-to-right pass',
          9: 'Carry the running max from the left',
          10: 'Last bar: its right wall is itself',
          11: 'Right-to-left pass',
          12: 'Carry the running max from the right',
          13: 'Accumulator for total trapped water',
          14: 'Final pass over every bar',
          15: 'Water above bar i = shorter surrounding wall minus bar height',
          16: 'Return total trapped water',
        },
        javascript: {
          1: 'Define function taking height array',
          2: 'Return 0 if array is empty',
          4: 'Number of bars',
          5: 'leftMax[i] will hold the tallest wall at or left of i',
          6: 'rightMax[i] will hold the tallest wall at or right of i',
          7: 'First bar: its left wall is itself',
          8: 'Left-to-right pass',
          9: 'Carry the running max from the left',
          11: 'Last bar: its right wall is itself',
          12: 'Right-to-left pass',
          13: 'Carry the running max from the right',
          15: 'Accumulator for total trapped water',
          16: 'Final pass over every bar',
          17: 'Water above bar i = shorter surrounding wall minus bar height',
          19: 'Return total trapped water',
        },
        java: {
          1: 'Define function taking height array',
          2: 'Return 0 if array is empty',
          4: 'Number of bars',
          5: 'leftMax[i] will hold the tallest wall at or left of i',
          6: 'rightMax[i] will hold the tallest wall at or right of i',
          7: 'First bar: its left wall is itself',
          8: 'Left-to-right pass',
          9: 'Carry the running max from the left',
          11: 'Last bar: its right wall is itself',
          12: 'Right-to-left pass',
          13: 'Carry the running max from the right',
          15: 'Accumulator for total trapped water',
          16: 'Final pass over every bar',
          17: 'Water above bar i = shorter surrounding wall minus bar height',
          19: 'Return total trapped water',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking height array',
      2: 'Handle empty array edge case',
      3: 'Return 0 if no bars exist',
      5: 'Init two pointers at both ends',
      6: 'Track max height seen from each side',
      7: 'Accumulator for total trapped water',
      9: 'Process until pointers meet',
      10: 'If left height <= right height',
      11: 'Advance left pointer inward',
      12: 'Update leftMax if current is taller',
      13: 'Add trapped water at current position',
      15: 'Move right pointer inward',
      16: 'Update rightMax if current is taller',
      17: 'Add trapped water at current position',
      19: 'Return total trapped water',
    },
    javascript: {
      1: 'Define function taking height array',
      2: 'Return 0 if array is empty',
      4: 'Init left pointer at start',
      5: 'Init right pointer at end',
      6: 'Track max height from the left',
      7: 'Track max height from the right',
      8: 'Accumulator for total trapped water',
      10: 'Process until pointers meet',
      11: 'If left height <= right height',
      12: 'Advance left pointer inward',
      13: 'Update leftMax if current is taller',
      14: 'Add trapped water at current position',
      16: 'Move right pointer inward',
      17: 'Update rightMax if current is taller',
      18: 'Add trapped water at current position',
      22: 'Return total trapped water',
    },
    java: {
      1: 'Define function taking height array',
      2: 'Return 0 if array is empty',
      4: 'Init left pointer at start',
      5: 'Init right pointer at end',
      6: 'Track max height from the left',
      7: 'Track max height from the right',
      8: 'Accumulator for total trapped water',
      10: 'Process until pointers meet',
      11: 'If left height <= right height',
      12: 'Advance left pointer inward',
      13: 'Update leftMax if current is taller',
      14: 'Add trapped water at current position',
      16: 'Move right pointer inward',
      17: 'Update rightMax if current is taller',
      18: 'Add trapped water at current position',
      22: 'Return total trapped water',
    },
  },
};
