import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runContainerWithMostWater(input: unknown): AlgorithmStep[] {
  const height = input as number[];
  const steps: AlgorithmStep[] = [];

  // Line 1: def maxArea(height):
  steps.push({
    state: { nums: [...height], maxArea: 0 },
    highlights: [],
    message: `Find container with most water in heights [${height.join(', ')}]`,
    codeLine: 1,
  });

  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;

  // Line 2: l, r = 0, len(height) - 1
  steps.push({
    state: { nums: [...height], maxArea },
    highlights: [left, right],
    pointers: { left, right },
    message: `Initialize pointers: left=0, right=${right}. maxArea=0`,
    codeLine: 2,
  });

  // Line 5: while l < r:
  while (left < right) {
    const width = right - left;
    const minHeight = Math.min(height[left], height[right]);
    const area = width * minHeight;

    // Line 6: area = (r - l) * min(height[l], height[r])
    // Show all indices between left and right as the area zone
    const areaIndices: number[] = [];
    for (let k = left; k <= right; k++) {
      areaIndices.push(k);
    }

    steps.push({
      state: { nums: [...height], maxArea, area, width, minHeight },
      highlights: [left, right],
      secondary: areaIndices,
      pointers: { left, right },
      message: `Area = width * min height = (${right} - ${left}) * min(${height[left]}, ${height[right]}) = ${width} * ${minHeight} = ${area}`,
      codeLine: 6,
      action: 'compare',
    });

    // Line 7: res = max(res, area)
    const prevMax = maxArea;
    maxArea = Math.max(maxArea, area);

    if (area > prevMax) {
      steps.push({
        state: { nums: [...height], maxArea, area },
        highlights: [left, right],
        secondary: areaIndices,
        pointers: { left, right },
        message: `New max area! ${area} > ${prevMax}. maxArea = ${maxArea}`,
        codeLine: 7,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...height], maxArea, area },
        highlights: [left, right],
        pointers: { left, right },
        message: `Area ${area} <= maxArea ${maxArea}. No update.`,
        codeLine: 7,
      });
    }

    // Line 9-12: move the pointer with smaller height
    if (height[left] < height[right]) {
      // Line 9: if height[l] < height[r]:
      steps.push({
        state: { nums: [...height], maxArea },
        highlights: [left, right],
        pointers: { left, right },
        message: `height[${left}]=${height[left]} < height[${right}]=${height[right]}. Move left pointer right`,
        codeLine: 9,
        action: 'compare',
      });
      left++;
      // Line 10: l += 1
      steps.push({
        state: { nums: [...height], maxArea },
        highlights: [left, right],
        pointers: { left, right },
        message: `Left pointer moved to index ${left} (height ${height[left]})`,
        codeLine: 10,
      });
    } else if (height[left] > height[right]) {
      // Line 11: elif height[l] > height[r]:
      steps.push({
        state: { nums: [...height], maxArea },
        highlights: [left, right],
        pointers: { left, right },
        message: `height[${left}]=${height[left]} > height[${right}]=${height[right]}. Move right pointer left`,
        codeLine: 11,
        action: 'compare',
      });
      right--;
      // Line 12: r -= 1
      steps.push({
        state: { nums: [...height], maxArea },
        highlights: [left, right],
        pointers: { left, right },
        message: `Right pointer moved to index ${right} (height ${height[right]})`,
        codeLine: 12,
      });
    } else {
      // Line 14: l += 1; r -= 1
      steps.push({
        state: { nums: [...height], maxArea },
        highlights: [left, right],
        pointers: { left, right },
        message: `height[${left}]=${height[left]} == height[${right}]=${height[right]}. Move both pointers`,
        codeLine: 14,
        action: 'compare',
      });
      left++;
      right--;
      steps.push({
        state: { nums: [...height], maxArea },
        highlights: [left, right],
        pointers: { left, right },
        message: `Pointers moved: left=${left}, right=${right}`,
        codeLine: 14,
      });
    }
  }

  // Line 16: return res
  steps.push({
    state: { nums: [...height], maxArea, result: maxArea },
    highlights: [],
    message: `Complete! Maximum water area = ${maxArea}`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const containerWithMostWater: Algorithm = {
  id: 'container-with-most-water',
  name: 'Container With Most Water',
  category: 'Two Pointers',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — move the shorter side inward',
  description:
    'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
  problemUrl: 'https://leetcode.com/problems/container-with-most-water/',
  code: {
    python: `def maxArea(height):
    l, r = 0, len(height) - 1
    res = 0

    while l < r:
        area = (r - l) * min(height[l], height[r])
        res = max(res, area)

        if height[l] < height[r]:
            l += 1
        elif height[l] > height[r]:
            r -= 1
        else:
            l += 1
            r -= 1

    return res`,
    javascript: `function maxArea(height) {
    let l = 0;
    let r = height.length - 1;
    let res = 0;

    while (l < r) {
        const area = (r - l) * Math.min(height[l], height[r]);
        res = Math.max(res, area);

        if (height[l] < height[r]) {
            l++;
        } else if (height[l] > height[r]) {
            r--;
        } else {
            l++;
            r--;
        }
    }

    return res;
}`,
    java: `public static int maxArea(int[] height) {
    int l = 0;
    int r = height.length - 1;
    int res = 0;

    while (l < r) {
        int area = (r - l) * Math.min(height[l], height[r]);
        res = Math.max(res, area);

        if (height[l] < height[r]) {
            l++;
        } else if (height[l] > height[r]) {
            r--;
        } else {
            l++;
            r--;
        }
    }

    return res;
}`,
  },
  defaultInput: [1, 8, 6, 2, 5, 4, 8, 3, 7],
  run: runContainerWithMostWater,
};
