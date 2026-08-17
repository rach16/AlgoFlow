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

function runPlusOneRightmostNonNine(input: unknown): AlgorithmStep[] {
  const digits = [...(input as number[])];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...digits], result: `Number: ${digits.join('')}` },
    highlights: [],
    message: `Key insight: adding 1 only cascades through trailing 9s. Find the rightmost non-9, bump it, and zero everything after it.`,
    codeLine: 1,
  });

  for (let i = digits.length - 1; i >= 0; i--) {
    steps.push({
      state: { nums: [...digits], result: `Inspecting digits[${i}] = ${digits[i]}` },
      highlights: [i],
      pointers: { i },
      message: `Is digits[${i}] = ${digits[i]} less than 9? ${digits[i] < 9 ? 'Yes — it can absorb the +1.' : 'No — a 9 becomes 0 and passes the carry left.'}`,
      codeLine: 4,
      action: 'compare',
    });

    if (digits[i] < 9) {
      digits[i]++;

      steps.push({
        state: { nums: [...digits], result: `Result: [${digits.join(', ')}]` },
        highlights: [i],
        pointers: { i },
        message: `Bump digits[${i}] to ${digits[i]}. Everything to its right was already zeroed, so we are done: ${digits.join('')}.`,
        codeLine: 5,
        action: 'found',
      });
      return steps;
    }

    digits[i] = 0;

    steps.push({
      state: { nums: [...digits], result: `digits[${i}] = 9 rolls over to 0` },
      highlights: [i],
      pointers: { i },
      message: `digits[${i}] was 9: set it to 0 and continue left with the carry.`,
      codeLine: 7,
      action: 'swap',
    });
  }

  digits.unshift(1);

  steps.push({
    state: { nums: [...digits], result: `All nines! Prepend 1` },
    highlights: [0],
    message: `Every digit was 9 (e.g. 999 + 1 = 1000). The answer is a 1 followed by all zeros: [${digits.join(', ')}].`,
    codeLine: 8,
    action: 'insert',
  });

  steps.push({
    state: { nums: [...digits], result: `Result: [${digits.join(', ')}]` },
    highlights: [],
    message: `Done! Result: [${digits.join(', ')}] = ${digits.join('')}.`,
    codeLine: 8,
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
  optimalApproachName: 'Right-to-Left Carry',
  approaches: [
    {
      id: 'rightmost-non-nine',
      name: 'Rightmost Non-9 Digit',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of simulating carry arithmetic, observe that +1 only ripples through trailing 9s: zero them, bump the first non-9 from the right, and only the all-nines case grows the array.',
      code: {
        python: `def plusOne(digits):
    n = len(digits)
    for i in range(n - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits`,
        javascript: `function plusOne(digits) {
    for (let i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }
    return [1, ...digits];
}`,
        java: `public static int[] plusOne(int[] digits) {
    for (int i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }
    int[] result = new int[digits.length + 1];
    result[0] = 1;
    return result;
}`,
      },
      run: runPlusOneRightmostNonNine,
      lineExplanations: {
        python: {
          1: 'Define function taking digits array',
          2: 'Cache the number of digits',
          3: 'Scan from the last digit to the first',
          4: 'A digit below 9 can absorb the +1 without carrying',
          5: 'Bump it by one',
          6: 'Done immediately — no carry can propagate further',
          7: 'A 9 rolls over to 0 and the +1 moves left',
          8: 'All digits were 9: answer is 1 followed by n zeros',
        },
        javascript: {
          1: 'Define function taking digits array',
          2: 'Scan from the last digit to the first',
          3: 'A digit below 9 can absorb the +1 without carrying',
          4: 'Bump it by one',
          5: 'Done immediately — no carry can propagate further',
          7: 'A 9 rolls over to 0 and the +1 moves left',
          9: 'All digits were 9: answer is 1 followed by n zeros',
        },
        java: {
          1: 'Define method taking digits array',
          2: 'Scan from the last digit to the first',
          3: 'A digit below 9 can absorb the +1 without carrying',
          4: 'Bump it by one',
          5: 'Done immediately — no carry can propagate further',
          7: 'A 9 rolls over to 0 and the +1 moves left',
          9: 'All digits were 9: allocate one extra slot',
          10: 'Leading digit is 1; the rest default to 0',
          11: 'Return the grown array (e.g. 999 -> 1000)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking digits array',
      2: 'Start with carry of 1 (the "plus one")',
      3: 'Loop from last digit to first (right to left)',
      4: 'Add current digit and carry',
      5: 'Keep only ones digit (mod 10)',
      6: 'Compute new carry (0 or 1)',
      7: 'If no carry remains, stop early',
      8: 'Exit loop since no more propagation needed',
      9: 'If carry still remains after all digits',
      10: 'Prepend carry digit (e.g., 999 + 1 = 1000)',
      11: 'Return the resulting digits array',
    },
    javascript: {
      1: 'Define function taking digits array',
      2: 'Start with carry of 1 (the "plus one")',
      3: 'Loop from last digit to first (right to left)',
      4: 'Add current digit and carry',
      5: 'Keep only ones digit (mod 10)',
      6: 'Compute new carry (0 or 1)',
      7: 'If no carry remains, stop early',
      9: 'If carry remains, prepend it to array',
      10: 'Return the resulting digits array',
    },
    java: {
      1: 'Define method taking digits array',
      2: 'Start with carry of 1 (the "plus one")',
      3: 'Loop from last digit to first (right to left)',
      4: 'Add current digit and carry',
      5: 'Keep only ones digit (mod 10)',
      6: 'Compute new carry (0 or 1)',
      7: 'If no carry remains, stop early',
      9: 'If carry remains, create larger array',
      10: 'Allocate new array with one extra slot',
      11: 'Set leading digit to the carry',
      12: 'Copy original digits after the carry',
      13: 'Return the expanded result',
      15: 'Return original digits if no overflow',
    },
  },
};
