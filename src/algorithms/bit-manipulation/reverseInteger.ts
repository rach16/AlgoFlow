import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runReverseInteger(input: unknown): AlgorithmStep[] {
  let x = input as number;
  const original = x;
  const steps: AlgorithmStep[] = [];
  const INT_MAX = 2147483647; // 2^31 - 1
  const INT_MIN = -2147483648; // -2^31

  steps.push({
    state: {
      nums: [x],
      count: 0,
      result: `Reversing ${x}`,
    },
    highlights: [],
    message: `Reverse the digits of ${x}. Watch for 32-bit integer overflow.`,
    codeLine: 1,
  });

  let result = 0;
  const isNegative = x < 0;
  if (isNegative) x = -x;

  steps.push({
    state: {
      nums: [x],
      count: result,
      result: `${isNegative ? 'Negative number, working with absolute value' : 'Positive number'}`,
    },
    highlights: [],
    message: `${isNegative ? `Negative. Work with |${original}| = ${x}.` : `Positive number: ${x}.`}`,
    codeLine: 2,
    action: 'visit',
  });

  while (x > 0) {
    const digit = x % 10;
    x = Math.floor(x / 10);

    // Check overflow before actually computing
    if (result > Math.floor(INT_MAX / 10) || (result === Math.floor(INT_MAX / 10) && digit > 7)) {
      steps.push({
        state: {
          nums: [original],
          count: 0,
          result: 'Overflow! Return 0',
        },
        highlights: [],
        message: `Adding digit ${digit} would cause overflow. Return 0.`,
        codeLine: 4,
        action: 'found',
      });
      return steps;
    }

    result = result * 10 + digit;

    steps.push({
      state: {
        nums: [x],
        count: result,
        result: `Reversed so far: ${isNegative ? '-' : ''}${result}`,
      },
      highlights: [],
      message: `Extract digit ${digit}. Remaining: ${x}. Result = ${result}.`,
      codeLine: 5,
      action: 'visit',
    });
  }

  if (isNegative) result = -result;

  // Final overflow check
  if (result > INT_MAX || result < INT_MIN) {
    result = 0;
  }

  steps.push({
    state: {
      nums: [original],
      count: result,
      result: `Reversed: ${result}`,
    },
    highlights: [],
    message: `Done! Reverse of ${original} = ${result}.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const reverseInteger: Algorithm = {
  id: 'reverse-integer',
  name: 'Reverse Integer',
  category: 'Bit Manipulation',
  difficulty: 'Medium',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Math — extract digits with mod 10, build reversed number',
  description:
    'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
  problemUrl: 'https://leetcode.com/problems/reverse-integer/',
  code: {
    python: `def reverse(x):
    INT_MAX = 2**31 - 1
    INT_MIN = -2**31
    result = 0
    sign = 1 if x >= 0 else -1
    x = abs(x)

    while x:
        digit = x % 10
        x //= 10
        if result > INT_MAX // 10:
            return 0
        result = result * 10 + digit

    result *= sign
    return result if INT_MIN <= result <= INT_MAX else 0`,
    javascript: `function reverse(x) {
    const INT_MAX = 2**31 - 1;
    const INT_MIN = -(2**31);
    let result = 0;
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    while (x > 0) {
        const digit = x % 10;
        x = Math.floor(x / 10);
        if (result > Math.floor(INT_MAX / 10)) return 0;
        result = result * 10 + digit;
    }

    result *= sign;
    return result >= INT_MIN && result <= INT_MAX ? result : 0;
}`,
    java: `public static int reverse(int x) {
    int result = 0;
    while (x != 0) {
        int digit = x % 10;
        x /= 10;
        if (result > Integer.MAX_VALUE / 10 ||
            (result == Integer.MAX_VALUE / 10 && digit > 7)) return 0;
        if (result < Integer.MIN_VALUE / 10 ||
            (result == Integer.MIN_VALUE / 10 && digit < -8)) return 0;
        result = result * 10 + digit;
    }
    return result;
}`,
  },
  defaultInput: 123,
  run: runReverseInteger,
};
