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

function runReverseIntegerString(input: unknown): AlgorithmStep[] {
  const x = input as number;
  const steps: AlgorithmStep[] = [];
  const INT_MAX = 2147483647; // 2^31 - 1
  const INT_MIN = -2147483648; // -2^31

  steps.push({
    state: {
      nums: [x],
      count: 0,
      result: `Reversing ${x} via string`,
    },
    highlights: [],
    message: `Treat the number as text: reverse the digit string, convert back, then check the 32-bit range. Trades bit tricks for readability.`,
    codeLine: 1,
  });

  const sign = x >= 0 ? 1 : -1;
  const s = String(Math.abs(x));

  steps.push({
    state: {
      nums: [x],
      count: 0,
      result: `sign = ${sign}, digits = "${s}"`,
    },
    highlights: [],
    message: `Peel off the sign (${sign === 1 ? 'positive' : 'negative'}) and stringify the absolute value: "${s}".`,
    codeLine: 5,
    action: 'visit',
  });

  let reversedS = '';
  for (let i = s.length - 1; i >= 0; i--) {
    reversedS += s[i];

    steps.push({
      state: {
        nums: [x],
        count: Number(reversedS),
        result: `Reversed string so far: "${reversedS}"`,
      },
      highlights: [],
      message: `Take digit '${s[i]}' from the end of "${s}": reversed string is now "${reversedS}".`,
      codeLine: 6,
      action: 'push',
    });
  }

  const result = sign * Number(reversedS);

  steps.push({
    state: {
      nums: [x],
      count: result,
      result: `Parsed back to integer: ${result}`,
    },
    highlights: [],
    message: `Convert "${reversedS}" back to an integer and restore the sign: ${result}.`,
    codeLine: 7,
    action: 'visit',
  });

  if (result < INT_MIN || result > INT_MAX) {
    steps.push({
      state: {
        nums: [x],
        count: 0,
        result: 'Overflow! Return 0',
      },
      highlights: [],
      message: `${result} is outside the 32-bit range [${INT_MIN}, ${INT_MAX}] — return 0. (Strings let us check overflow after the fact; the digit-pop loop must check before each append.)`,
      codeLine: 9,
      action: 'found',
    });
    return steps;
  }

  steps.push({
    state: {
      nums: [x],
      count: result,
      result: `Reversed: ${result}`,
    },
    highlights: [],
    message: `Done! ${result} fits in 32 bits, so reverse of ${x} = ${result}.`,
    codeLine: 10,
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
  optimalApproachName: 'Digit-Pop Loop',
  approaches: [
    {
      id: 'string-reversal',
      name: 'String Reversal',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(log n)',
      description:
        'Converts the number to a string, reverses it, and parses it back — checking the 32-bit range once at the end instead of before every digit append.',
      code: {
        python: `def reverse(x):
    INT_MAX = 2**31 - 1
    INT_MIN = -2**31
    sign = 1 if x >= 0 else -1
    s = str(abs(x))
    reversed_s = s[::-1]
    result = sign * int(reversed_s)
    if result < INT_MIN or result > INT_MAX:
        return 0
    return result`,
        javascript: `function reverse(x) {
    const INT_MAX = 2**31 - 1;
    const INT_MIN = -(2**31);
    const sign = x >= 0 ? 1 : -1;
    const s = String(Math.abs(x));
    const reversedS = s.split('').reverse().join('');
    const result = sign * parseInt(reversedS, 10);
    if (result < INT_MIN || result > INT_MAX) return 0;
    return result;
}`,
        java: `public static int reverse(int x) {
    long sign = x >= 0 ? 1 : -1;
    String s = Long.toString(Math.abs((long) x));
    String reversed = new StringBuilder(s).reverse().toString();
    long result = sign * Long.parseLong(reversed);
    if (result < Integer.MIN_VALUE || result > Integer.MAX_VALUE) {
        return 0;
    }
    return (int) result;
}`,
      },
      run: runReverseIntegerString,
      lineExplanations: {
        python: {
          1: 'Define function taking integer x',
          2: 'Store 32-bit max value constant',
          3: 'Store 32-bit min value constant',
          4: 'Remember the sign so we can work with the absolute value',
          5: 'Convert the absolute value to its digit string',
          6: 'Reverse the string with slice notation',
          7: 'Parse back to an integer and restore the sign',
          8: 'Single overflow check after the fact (Python ints never overflow)',
          9: 'Out of 32-bit range — return 0',
          10: 'Return the reversed integer',
        },
        javascript: {
          1: 'Define function taking integer x',
          2: 'Store 32-bit max value constant',
          3: 'Store 32-bit min value constant',
          4: 'Remember the sign so we can work with the absolute value',
          5: 'Convert the absolute value to its digit string',
          6: 'Reverse the string: split into chars, reverse, rejoin',
          7: 'Parse back to an integer and restore the sign',
          8: 'Single overflow check — return 0 if outside 32-bit range',
          9: 'Return the reversed integer',
        },
        java: {
          1: 'Define method taking integer x',
          2: 'Remember the sign as a long for safe multiplication',
          3: 'Cast to long first: Math.abs(Integer.MIN_VALUE) would overflow',
          4: 'Reverse the digit string with StringBuilder',
          5: 'Parse back as a long and restore the sign',
          6: 'Check against the int range using the wider long type',
          7: 'Out of 32-bit range — return 0',
          9: 'Safe to narrow back to int now',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking integer x',
      2: 'Store 32-bit max value constant',
      3: 'Store 32-bit min value constant',
      4: 'Initialize reversed result to 0',
      5: 'Determine sign: 1 or -1',
      6: 'Work with absolute value of x',
      8: 'Loop while digits remain',
      9: 'Extract last digit using mod 10',
      10: 'Remove last digit using integer division',
      11: 'Check if appending would overflow',
      12: 'Return 0 on overflow',
      13: 'Append digit to reversed result',
      15: 'Restore original sign',
      16: 'Return result if within 32-bit range',
    },
    javascript: {
      1: 'Define function taking integer x',
      2: 'Store 32-bit max value constant',
      3: 'Store 32-bit min value constant',
      4: 'Initialize reversed result to 0',
      5: 'Determine sign: 1 or -1',
      6: 'Work with absolute value of x',
      8: 'Loop while digits remain',
      9: 'Extract last digit using mod 10',
      10: 'Remove last digit using floor division',
      11: 'Return 0 if appending would overflow',
      12: 'Append digit to reversed result',
      15: 'Restore original sign',
      16: 'Return result if within 32-bit range',
    },
    java: {
      1: 'Define function taking integer x',
      2: 'Initialize reversed result to 0',
      3: 'Loop while digits remain',
      4: 'Extract last digit using mod 10',
      5: 'Remove last digit using division',
      6: 'Check positive overflow before append',
      7: 'Return 0 on positive overflow',
      8: 'Check negative overflow before append',
      9: 'Return 0 on negative overflow',
      10: 'Append digit to reversed result',
      12: 'Return the reversed integer',
    },
  },
};
