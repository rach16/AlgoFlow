import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 8): string {
  return (n >>> 0).toString(2).padStart(width, '0').slice(-width);
}

function runAddBinary(input: unknown): AlgorithmStep[] {
  const { a, b } = input as { a: string; b: string };
  const steps: AlgorithmStep[] = [];
  const width = Math.max(a.length, b.length) + 1;

  steps.push({
    state: {
      bits: [
        { value: parseInt(a, 2), bits: a.padStart(width, '0'), label: `a = ${a}` },
        { value: parseInt(b, 2), bits: b.padStart(width, '0'), label: `b = ${b}` },
      ],
      bitHighlights: [],
      chars: [],
      result: `Adding "${a}" + "${b}" column by column`,
    },
    highlights: [],
    message: `Add two binary strings the way you add decimals on paper: walk both from the RIGHT, add the two digits plus the carry, write total % 2, and carry total / 2 into the next column.`,
    codeLine: 1,
  } as AlgorithmStep);

  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;
  let result = '';
  let column = 0;

  while (i >= 0 || j >= 0 || carry) {
    const da = i >= 0 ? Number(a[i]) : 0;
    const db = j >= 0 ? Number(b[j]) : 0;
    const total = da + db + carry;

    steps.push({
      state: {
        bits: [
          { value: parseInt(a, 2), bits: a.padStart(width, '0'), label: `a = ${a}` },
          { value: parseInt(b, 2), bits: b.padStart(width, '0'), label: `b = ${b}` },
          { value: total, bits: toBinary(total, 2), label: `column total = ${total}` },
        ],
        bitHighlights: [column],
        chars: result.split(''),
        result: `Column ${column}: ${da} + ${db} + carry ${carry} = ${total}`,
      },
      highlights: [],
      pointers: { i: Math.max(i, 0), j: Math.max(j, 0) },
      message: `Column ${column}: a gives ${i >= 0 ? `a[${i}] = ${da}` : '0 (a is exhausted)'}, b gives ${j >= 0 ? `b[${j}] = ${db}` : '0 (b is exhausted)'}, carry in is ${carry}. Total = ${total}.`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);

    const digit = total % 2;
    carry = Math.floor(total / 2);
    result = String(digit) + result;
    if (i >= 0) i--;
    if (j >= 0) j--;

    steps.push({
      state: {
        bits: [
          { value: parseInt(a, 2), bits: a.padStart(width, '0'), label: `a = ${a}` },
          { value: parseInt(b, 2), bits: b.padStart(width, '0'), label: `b = ${b}` },
          { value: parseInt(result, 2), bits: result.padStart(width, '0'), label: `result = ${result}` },
        ],
        bitHighlights: [column],
        chars: result.split(''),
        result: `result so far = ${result}, carry = ${carry}`,
      },
      highlights: [],
      message: `Write ${total} % 2 = ${digit} into column ${column} (result is now "${result}") and carry ${total} / 2 = ${carry} into column ${column + 1}.${carry === 1 ? ' A carry of 1 is still pending, so the loop must continue even if both strings ran out.' : ''}`,
      codeLine: 13,
      action: 'insert',
    } as AlgorithmStep);

    column++;
  }

  steps.push({
    state: {
      bits: [
        { value: parseInt(result, 2), bits: result.padStart(width, '0'), label: `sum = ${result}` },
      ],
      bitHighlights: [],
      chars: result.split(''),
      result: `"${a}" + "${b}" = "${result}"`,
    },
    highlights: [],
    message: `Done! "${a}" + "${b}" = "${result}" (${parseInt(a, 2)} + ${parseInt(b, 2)} = ${parseInt(result, 2)} in decimal).`,
    codeLine: 15,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runAddBinaryXorCarry(input: unknown): AlgorithmStep[] {
  const { a, b } = input as { a: string; b: string };
  const steps: AlgorithmStep[] = [];
  const width = Math.max(a.length, b.length) + 2;

  let x = parseInt(a, 2);
  let y = parseInt(b, 2);

  steps.push({
    state: {
      bits: [
        { value: x, bits: toBinary(x, width), label: `x = ${a} (${x})` },
        { value: y, bits: toBinary(y, width), label: `y = ${b} (${y})` },
      ],
      bitHighlights: [],
      chars: [],
      result: `Parsed the strings into integers: x = ${x}, y = ${y}`,
    },
    highlights: [],
    message: `Skip the per-column bookkeeping: parse both strings to integers, then use the classic adder identity — x ^ y is the sum with carries ignored, (x & y) << 1 is the carries. Repeat until no carry remains.`,
    codeLine: 2,
  } as AlgorithmStep);

  let iteration = 0;
  const guard = 40;

  while (y !== 0 && iteration < guard) {
    const answer = x ^ y;
    const carry = (x & y) << 1;

    steps.push({
      state: {
        bits: [
          { value: x, bits: toBinary(x, width), label: `x = ${x}` },
          { value: y, bits: toBinary(y, width), label: `y = ${y}` },
          { value: answer, bits: toBinary(answer, width), label: `x XOR y = ${answer}` },
          { value: carry, bits: toBinary(carry, width), label: `(x AND y) << 1 = ${carry}` },
        ],
        bitHighlights: [],
        chars: [],
        result: `Round ${iteration + 1}: sum-without-carry ${answer}, carry ${carry}`,
      },
      highlights: [],
      message: `Round ${iteration + 1}: ${toBinary(x, width)} ^ ${toBinary(y, width)} = ${toBinary(answer, width)} (adds each column, ignoring carries). Columns where both bits are 1 produce a carry, shifted one place left: ${toBinary(carry, width)}.`,
      codeLine: 4,
      action: 'compare',
    } as AlgorithmStep);

    x = answer;
    y = carry;
    iteration++;

    steps.push({
      state: {
        bits: [
          { value: x, bits: toBinary(x, width), label: `x = ${x}` },
          { value: y, bits: toBinary(y, width), label: `y (carry) = ${y}` },
        ],
        bitHighlights: [],
        chars: [],
        result: `x = ${x}, y = ${y}`,
      },
      highlights: [],
      message: `Feed the carry back in: x = ${x}, y = ${y}. ${y === 0 ? 'No carry left — x is the final sum.' : 'Carries move left each round, so this terminates quickly.'}`,
      codeLine: 6,
      action: 'swap',
    } as AlgorithmStep);
  }

  const result = x.toString(2);

  steps.push({
    state: {
      bits: [{ value: x, bits: toBinary(x, width), label: `sum = ${result}` }],
      bitHighlights: [],
      chars: result.split(''),
      result: `"${a}" + "${b}" = "${result}"`,
    },
    highlights: [],
    message: `Convert back to binary text: "${a}" + "${b}" = "${result}". Same answer as the column-by-column pass, in ${iteration} XOR/carry round${iteration === 1 ? '' : 's'}.`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const addBinary: Algorithm = {
  id: 'add-binary',
  name: 'Add Binary',
  category: 'Bit Manipulation',
  difficulty: 'Easy',
  timeComplexity: 'O(max(m, n))',
  spaceComplexity: 'O(max(m, n))',
  pattern: 'Math — add binary digits right to left with a carry',
  description:
    'Given two binary strings a and b, return their sum as a binary string. The strings can be longer than a machine integer, so add them digit by digit from the least significant end.',
  problemUrl: 'https://leetcode.com/problems/add-binary/',
  code: {
    python: `def addBinary(a, b):
    result = []
    carry = 0
    i, j = len(a) - 1, len(b) - 1
    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += int(a[i])
            i -= 1
        if j >= 0:
            total += int(b[j])
            j -= 1
        result.append(str(total % 2))
        carry = total // 2
    return ''.join(reversed(result))`,
    javascript: `function addBinary(a, b) {
    let result = '';
    let carry = 0;
    let i = a.length - 1, j = b.length - 1;
    while (i >= 0 || j >= 0 || carry) {
        let total = carry;
        if (i >= 0) total += Number(a[i--]);
        if (j >= 0) total += Number(b[j--]);
        result = (total % 2) + result;
        carry = Math.floor(total / 2);
    }
    return result;
}`,
    java: `public static String addBinary(String a, String b) {
    StringBuilder sb = new StringBuilder();
    int carry = 0;
    int i = a.length() - 1, j = b.length() - 1;
    while (i >= 0 || j >= 0 || carry != 0) {
        int total = carry;
        if (i >= 0) total += a.charAt(i--) - '0';
        if (j >= 0) total += b.charAt(j--) - '0';
        sb.append(total % 2);
        carry = total / 2;
    }
    return sb.reverse().toString();
}`,
  },
  defaultInput: { a: '1010', b: '1011' },
  run: runAddBinary,
  optimalApproachName: 'Two-Pointer Carry Addition',
  approaches: [
    {
      id: 'xor-and-carry-loop',
      name: 'XOR + Carry Loop',
      timeComplexity: 'O(max(m, n))',
      spaceComplexity: 'O(max(m, n))',
      description:
        'Parse both strings into integers and add them with the bitwise adder identity — x ^ y for the sum and (x & y) << 1 for the carry — instead of tracking a per-column carry by hand.',
      code: {
        python: `def addBinary(a, b):
    x, y = int(a, 2), int(b, 2)
    while y:
        answer = x ^ y
        carry = (x & y) << 1
        x, y = answer, carry
    return bin(x)[2:]`,
        javascript: `function addBinary(a, b) {
    let x = BigInt('0b' + a), y = BigInt('0b' + b);
    while (y !== 0n) {
        const answer = x ^ y;
        const carry = (x & y) << 1n;
        x = answer;
        y = carry;
    }
    return x.toString(2);
}`,
        java: `public static String addBinary(String a, String b) {
    BigInteger x = new BigInteger(a, 2);
    BigInteger y = new BigInteger(b, 2);
    while (y.signum() != 0) {
        BigInteger answer = x.xor(y);
        BigInteger carry = x.and(y).shiftLeft(1);
        x = answer;
        y = carry;
    }
    return x.toString(2);
}`,
      },
      run: runAddBinaryXorCarry,
      lineExplanations: {
        python: {
          1: 'Define function taking two binary strings',
          2: 'Parse both strings as base-2 integers',
          3: 'Keep looping while a carry (y) still exists',
          4: 'XOR adds every column but throws the carries away',
          5: 'AND marks the columns that carry; shift moves them left one place',
          6: 'Feed the partial sum and the carries back in',
          7: 'bin() gives "0b1010" — slice off the prefix',
        },
        javascript: {
          1: 'Define function taking two binary strings',
          2: 'BigInt avoids the 32-bit limit of JS bit operators',
          3: 'Keep looping while a carry (y) still exists',
          4: 'XOR adds every column but throws the carries away',
          5: 'AND marks the columns that carry; shift moves them left one place',
          6: 'Partial sum becomes the new x',
          7: 'Carries become the new y',
          9: 'Render the BigInt back to a binary string',
        },
        java: {
          1: 'Define method taking two binary strings',
          2: 'BigInteger parses a in base 2 (inputs can exceed a long)',
          3: 'Same for b',
          4: 'Keep looping while a carry (y) still exists',
          5: 'XOR adds every column but throws the carries away',
          6: 'AND marks the columns that carry; shift moves them left one place',
          7: 'Partial sum becomes the new x',
          8: 'Carries become the new y',
          10: 'Render the BigInteger back to a binary string',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking two binary strings',
      2: 'Collect the answer digits (least significant first)',
      3: 'Carry into the next column starts at 0',
      4: 'Two pointers, each at the last character of its string',
      5: 'Keep going while either string has digits OR a carry is pending',
      6: 'Start the column total with the incoming carry',
      7: 'Only read a if it still has digits left',
      8: 'Add this digit of a to the column total',
      9: 'Move the a pointer one place left',
      10: 'Only read b if it still has digits left',
      11: 'Add this digit of b to the column total',
      12: 'Move the b pointer one place left',
      13: 'total % 2 is the digit written in this column',
      14: 'total // 2 is the carry into the next column',
      15: 'Digits were collected backwards — reverse and join',
    },
    javascript: {
      1: 'Define function taking two binary strings',
      2: 'Build the answer by prepending each new digit',
      3: 'Carry into the next column starts at 0',
      4: 'Two pointers, each at the last character of its string',
      5: 'Keep going while either string has digits OR a carry is pending',
      6: 'Start the column total with the incoming carry',
      7: 'Add the digit from a if any remain, then step left',
      8: 'Add the digit from b if any remain, then step left',
      9: 'Prepend total % 2 — the digit for this column',
      10: 'Carry total / 2 into the next column',
      12: 'result already reads most significant digit first',
    },
    java: {
      1: 'Define method taking two binary strings',
      2: 'StringBuilder collects digits least significant first',
      3: 'Carry into the next column starts at 0',
      4: 'Two pointers, each at the last character of its string',
      5: 'Keep going while either string has digits OR a carry is pending',
      6: 'Start the column total with the incoming carry',
      7: 'Add the digit from a (char minus zero), then step left',
      8: 'Add the digit from b, then step left',
      9: 'Append total % 2 — the digit for this column',
      10: 'Carry total / 2 into the next column',
      12: 'Digits were appended backwards — reverse before returning',
    },
  },
};
