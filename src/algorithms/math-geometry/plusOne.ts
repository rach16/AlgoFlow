import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPlusOne(input: unknown): AlgorithmStep[] {
  const digits = [...(input as number[])];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...digits], result: `Number: ${digits.join('')}` },
    highlights: [],
    message: `Add 1 to the number represented by digits [${digits.join(', ')}].`,
    codeLine: 1,
  });

  let carry = 1;

  for (let i = digits.length - 1; i >= 0; i--) {
    const sum = digits[i] + carry;
    digits[i] = sum % 10;
    carry = Math.floor(sum / 10);

    steps.push({
      state: { nums: [...digits], result: `Carry: ${carry}` },
      highlights: [i],
      pointers: { i },
      message: `digits[${i}]: ${sum - (sum >= 10 ? 10 : 0) + (sum >= 10 ? 10 : carry)} + carry = ${sum}. Set to ${digits[i]}, carry = ${carry}.`,
      codeLine: 3,
      action: carry > 0 ? 'swap' : 'visit',
    });

    if (carry === 0) {
      steps.push({
        state: { nums: [...digits], result: `No carry. Done!` },
        highlights: [i],
        message: `No carry left. Stop early.`,
        codeLine: 5,
      });
      break;
    }
  }

  if (carry > 0) {
    digits.unshift(carry);

    steps.push({
      state: { nums: [...digits], result: `Prepend ${carry}` },
      highlights: [0],
      message: `Still have carry = ${carry}. Prepend to get [${digits.join(', ')}].`,
      codeLine: 6,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...digits], result: `Result: [${digits.join(', ')}]` },
    highlights: [],
    message: `Done! Result: [${digits.join(', ')}] = ${digits.join('')}.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const plusOne: Algorithm = {
  id: 'plus-one',
  name: 'Plus One',
  category: 'Math & Geometry',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Math — propagate carry from least significant digit',
  description:
    'You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. Increment the large integer by one and return the resulting array of digits.',
  problemUrl: 'https://leetcode.com/problems/plus-one/',
  code: {
    python: `def plusOne(digits):
    carry = 1
    for i in range(len(digits) - 1, -1, -1):
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        if carry == 0:
            break
    if carry:
        digits.insert(0, carry)
    return digits`,
    javascript: `function plusOne(digits) {
    let carry = 1;
    for (let i = digits.length - 1; i >= 0; i--) {
        const total = digits[i] + carry;
        digits[i] = total % 10;
        carry = Math.floor(total / 10);
        if (carry === 0) break;
    }
    if (carry) digits.unshift(carry);
    return digits;
}`,
    java: `public static int[] plusOne(int[] digits) {
    int carry = 1;
    for (int i = digits.length - 1; i >= 0; i--) {
        int total = digits[i] + carry;
        digits[i] = total % 10;
        carry = total / 10;
        if (carry == 0) break;
    }
    if (carry > 0) {
        int[] result = new int[digits.length + 1];
        result[0] = carry;
        System.arraycopy(digits, 0, result, 1, digits.length);
        return result;
    }
    return digits;
}`,
  },
  defaultInput: [1, 2, 3],
  run: runPlusOne,
};
