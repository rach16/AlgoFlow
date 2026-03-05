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
    java: `public static int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] res = new int[n];
    Arrays.fill(res, 1);

    int prefix = 1;
    for (int i = 0; i < n; i++) {
        res[i] = prefix;
        prefix *= nums[i];
    }

    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) {
        res[i] *= suffix;
        suffix *= nums[i];
    }

    return res;
}`,
  },
  defaultInput: [1, 2, 3, 4],
  run: runProductExceptSelf,
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Get the length of the array',
      3: 'Initialize result array with all 1s',
      5: 'Initialize prefix running product as 1',
      6: 'Forward pass: left to right',
      7: 'Store prefix product at current index',
      8: 'Multiply prefix by current element',
      10: 'Initialize suffix running product as 1',
      11: 'Backward pass: right to left',
      12: 'Multiply result[i] by suffix product',
      13: 'Multiply suffix by current element',
      15: 'Return the product-except-self array',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Get the length of the array',
      3: 'Initialize result array with all 1s',
      5: 'Initialize prefix running product as 1',
      6: 'Forward pass: left to right',
      7: 'Store prefix product at current index',
      8: 'Multiply prefix by current element',
      11: 'Initialize suffix running product as 1',
      12: 'Backward pass: right to left',
      13: 'Multiply result[i] by suffix product',
      14: 'Multiply suffix by current element',
      17: 'Return the product-except-self array',
    },
    java: {
      1: 'Define function taking int array',
      2: 'Get the length of the array',
      3: 'Initialize result array of size n',
      4: 'Fill result array with all 1s',
      6: 'Initialize prefix running product as 1',
      7: 'Forward pass: left to right',
      8: 'Store prefix product at current index',
      9: 'Multiply prefix by current element',
      12: 'Initialize suffix running product as 1',
      13: 'Backward pass: right to left',
      14: 'Multiply result[i] by suffix product',
      15: 'Multiply suffix by current element',
      18: 'Return the product-except-self array',
    },
  },
};
