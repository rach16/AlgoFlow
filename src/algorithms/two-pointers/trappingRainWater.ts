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
};
