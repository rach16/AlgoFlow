import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runProductExceptSelf(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const n = nums.length;
  const steps: AlgorithmStep[] = [];
  const result = new Array(n).fill(1);

  // Initial state
  steps.push({
    state: { nums: [...nums], result: [...result] },
    highlights: [],
    message: `Compute product of array except self for [${nums.join(', ')}]`,
    codeLine: 1,
  });

  // Pass 1: Prefix products (left to right)
  steps.push({
    state: { nums: [...nums], result: [...result] },
    highlights: [],
    message: 'Pass 1: Calculate prefix products (left to right)',
    codeLine: 2,
  });

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;

    steps.push({
      state: { nums: [...nums], result: [...result], prefix },
      highlights: [i],
      pointers: { i },
      message: `result[${i}] = prefix = ${prefix} (product of all elements to the left)`,
      codeLine: 4,
      action: 'visit',
    });

    prefix *= nums[i];

    steps.push({
      state: { nums: [...nums], result: [...result], prefix },
      highlights: [i],
      pointers: { i },
      message: `Update prefix: ${prefix / nums[i]} * nums[${i}](${nums[i]}) = ${prefix}`,
      codeLine: 5,
      action: 'compare',
    });
  }

  // Pass 2: Suffix products (right to left)
  steps.push({
    state: { nums: [...nums], result: [...result] },
    highlights: [],
    message: 'Pass 2: Multiply by suffix products (right to left)',
    codeLine: 6,
  });

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;

    steps.push({
      state: { nums: [...nums], result: [...result], suffix },
      highlights: [i],
      pointers: { i },
      message: `result[${i}] *= suffix(${suffix}) = ${result[i]} (prefix * suffix)`,
      codeLine: 8,
      action: 'visit',
    });

    suffix *= nums[i];

    steps.push({
      state: { nums: [...nums], result: [...result], suffix },
      highlights: [i],
      pointers: { i },
      message: `Update suffix: ${suffix / nums[i]} * nums[${i}](${nums[i]}) = ${suffix}`,
      codeLine: 9,
      action: 'compare',
    });
  }

  // Final result
  steps.push({
    state: { nums: [...nums], result: [...result] },
    highlights: [],
    message: `Result: [${result.join(', ')}]`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const productExceptSelf: Algorithm = {
  id: 'product-except-self',
  name: 'Product of Array Except Self',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Prefix/Suffix — two-pass product accumulation',
  description:
    'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.',
  problemUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
  code: {
    python: `def productExceptSelf(nums):
    n = len(nums)
    res = [1] * n

    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]

    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= nums[i]

    return res`,
    javascript: `function productExceptSelf(nums) {
    const n = nums.length;
    const res = new Array(n).fill(1);

    let prefix = 1;
    for (let i = 0; i < n; i++) {
        res[i] = prefix;
        prefix *= nums[i];
    }

    let suffix = 1;
    for (let i = n - 1; i >= 0; i--) {
        res[i] *= suffix;
        suffix *= nums[i];
    }

    return res;
}`,
  },
  defaultInput: [1, 2, 3, 4],
  run: runProductExceptSelf,
};
