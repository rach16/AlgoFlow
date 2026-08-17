import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runConcatenationOfArray(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const ans: number[] = [];

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `Goal: build ans of length ${2 * n} where ans[i] = ans[i + ${n}] = nums[i]. Start with an empty answer and append nums twice.`,
    codeLine: 2,
  });

  for (let pass = 0; pass < 2; pass++) {
    const codeLine = pass === 0 ? 4 : 6;
    for (let i = 0; i < n; i++) {
      ans.push(nums[i]);
      steps.push({
        state: { nums: [...ans] },
        highlights: [ans.length - 1],
        pointers: { i: ans.length - 1 },
        message: `Pass ${pass + 1}: append nums[${i}] = ${nums[i]} at position ${ans.length - 1}. ans = [${ans.join(', ')}]`,
        codeLine,
        action: 'insert',
      });
    }
    if (pass === 0) {
      steps.push({
        state: { nums: [...ans] },
        highlights: [],
        message: `First copy done: [${ans.join(', ')}]. Now append the exact same ${n} values again.`,
        codeLine: 5,
      });
    }
  }

  steps.push({
    state: { nums: [...ans], result: [...ans] },
    highlights: ans.map((_, i) => i),
    message: `Done — ans = [${ans.join(', ')}], the original array concatenated with itself.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

function runConcatenationOfArrayModulo(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const ans: number[] = new Array(2 * n).fill(0);

  steps.push({
    state: { nums: [...ans] },
    highlights: [],
    message: `Preallocate ${2 * n} slots of 0. One loop fills them all using ans[i] = nums[i % ${n}] — the modulo wraps back to the front.`,
    codeLine: 3,
  });

  for (let i = 0; i < 2 * n; i++) {
    const src = i % n;
    ans[i] = nums[src];
    steps.push({
      state: { nums: [...ans] },
      highlights: [i],
      secondary: i >= n ? [i - n] : [],
      pointers: { i },
      message: `i=${i}: ${i} % ${n} = ${src}, so ans[${i}] = nums[${src}] = ${nums[src]}${i >= n ? ` — the same value already sitting at index ${i - n}` : ''}`,
      codeLine: 5,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...ans], result: [...ans] },
    highlights: ans.map((_, i) => i),
    message: `Single pass complete — ans = [${ans.join(', ')}]`,
    codeLine: 6,
    action: 'found',
  });

  return steps;
}

export const concatenationOfArray: Algorithm = {
  id: 'concatenation-of-array',
  name: 'Concatenation of Array',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Array Building — append the source array twice',
  description:
    'Given an integer array nums of length n, build an array ans of length 2n where ans[i] = nums[i] and ans[i + n] = nums[i] for every i. Return ans.',
  problemUrl: 'https://leetcode.com/problems/concatenation-of-array/',
  code: {
    python: `def getConcatenation(nums):
    ans = []
    for num in nums:
        ans.append(num)
    for num in nums:
        ans.append(num)
    return ans`,
    javascript: `function getConcatenation(nums) {
    const ans = [];
    for (const num of nums) {
        ans.push(num);
    }
    for (const num of nums) {
        ans.push(num);
    }
    return ans;
}`,
    java: `public static int[] getConcatenation(int[] nums) {
    int n = nums.length;
    int[] ans = new int[2 * n];
    for (int i = 0; i < n; i++) {
        ans[i] = nums[i];
    }
    for (int i = 0; i < n; i++) {
        ans[i + n] = nums[i];
    }
    return ans;
}`,
  },
  defaultInput: [1, 3, 2, 1],
  run: runConcatenationOfArray,
  optimalApproachName: 'Two-Pass Append',
  approaches: [
    {
      id: 'modulo-single-pass',
      name: 'Modulo Single Pass',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of two append loops, preallocate 2n slots and fill them in one loop with ans[i] = nums[i % n], letting the modulo wrap the index back to the start.',
      code: {
        python: `def getConcatenation(nums):
    n = len(nums)
    ans = [0] * (2 * n)
    for i in range(2 * n):
        ans[i] = nums[i % n]
    return ans`,
        javascript: `function getConcatenation(nums) {
    const n = nums.length;
    const ans = new Array(2 * n);
    for (let i = 0; i < 2 * n; i++) {
        ans[i] = nums[i % n];
    }
    return ans;
}`,
        java: `public static int[] getConcatenation(int[] nums) {
    int n = nums.length;
    int[] ans = new int[2 * n];
    for (int i = 0; i < 2 * n; i++) {
        ans[i] = nums[i % n];
    }
    return ans;
}`,
      },
      run: runConcatenationOfArrayModulo,
      lineExplanations: {
        python: {
          1: 'Define function taking the nums array',
          2: 'n is the length of the original array',
          3: 'Preallocate exactly 2n slots',
          4: 'One loop covers both halves of the answer',
          5: 'i % n wraps back to the front once i passes n',
          6: 'Return the filled array',
        },
        javascript: {
          1: 'Define function taking the nums array',
          2: 'n is the length of the original array',
          3: 'Preallocate exactly 2n slots',
          4: 'One loop covers both halves of the answer',
          5: 'i % n wraps back to the front once i passes n',
          6: 'Return the filled array',
        },
        java: {
          1: 'Define function taking the nums array',
          2: 'n is the length of the original array',
          3: 'Allocate the 2n result array',
          4: 'One loop covers both halves of the answer',
          5: 'i % n wraps back to the front once i passes n',
          7: 'Return the filled array',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the nums array',
      2: 'Start with an empty answer list',
      3: 'First pass over the original values',
      4: 'Append each value — this fills ans[0..n-1]',
      5: 'Second pass over the same original values',
      6: 'Append each value again — this fills ans[n..2n-1]',
      7: 'Return the doubled array',
    },
    javascript: {
      1: 'Define function taking the nums array',
      2: 'Start with an empty answer array',
      3: 'First pass over the original values',
      4: 'Push each value — this fills ans[0..n-1]',
      6: 'Second pass over the same original values',
      7: 'Push each value again — this fills ans[n..2n-1]',
      9: 'Return the doubled array',
    },
    java: {
      1: 'Define function taking the nums array',
      2: 'n is the length of the original array',
      3: 'Allocate the 2n result array',
      4: 'First pass fills the front half',
      5: 'Copy nums[i] into ans[i]',
      7: 'Second pass fills the back half',
      8: 'Copy nums[i] into ans[i + n]',
      10: 'Return the doubled array',
    },
  },
};
