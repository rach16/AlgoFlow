import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MultiplyStringsInput {
  num1: string;
  num2: string;
}

function runMultiplyStrings(input: unknown): AlgorithmStep[] {
  const { num1, num2 } = input as MultiplyStringsInput;
  const steps: AlgorithmStep[] = [];

  const len1 = num1.length;
  const len2 = num2.length;
  const result = new Array(len1 + len2).fill(0);

  steps.push({
    state: {
      chars: [...num1.split(''), ' x ', ...num2.split('')],
      nums: [...result],
      result: `Multiplying "${num1}" x "${num2}"`,
    },
    highlights: [],
    message: `Multiply "${num1}" x "${num2}" digit by digit. Result array size = ${len1 + len2}.`,
    codeLine: 1,
  });

  for (let i = len1 - 1; i >= 0; i--) {
    for (let j = len2 - 1; j >= 0; j--) {
      const d1 = parseInt(num1[i]);
      const d2 = parseInt(num2[j]);
      const mul = d1 * d2;
      const p1 = i + j;
      const p2 = i + j + 1;

      const sum = mul + result[p2];
      result[p2] = sum % 10;
      result[p1] += Math.floor(sum / 10);

      steps.push({
        state: {
          chars: [...num1.split(''), ' x ', ...num2.split('')],
          nums: [...result],
          result: `${d1} x ${d2} = ${mul}, pos [${p1},${p2}]`,
        },
        highlights: [p1, p2],
        pointers: { i, j },
        message: `num1[${i}]=${d1} x num2[${j}]=${d2} = ${mul}. Add to positions [${p1},${p2}]: result = [...${result[p1]}, ${result[p2]}...].`,
        codeLine: 3,
        action: 'insert',
      });
    }
  }

  // Convert to string, remove leading zeros
  let resultStr = result.join('');
  while (resultStr.length > 1 && resultStr[0] === '0') {
    resultStr = resultStr.substring(1);
  }

  steps.push({
    state: {
      chars: [...resultStr.split('')],
      nums: [...result],
      result: `"${num1}" x "${num2}" = "${resultStr}"`,
    },
    highlights: [],
    message: `Done! "${num1}" x "${num2}" = "${resultStr}".`,
    codeLine: 5,
    action: 'found',
  });

  return steps;
}

export const multiplyStrings: Algorithm = {
  id: 'multiply-strings',
  name: 'Multiply Strings',
  category: 'Math & Geometry',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m+n)',
  pattern: 'Math — grade-school multiplication with position array',
  description:
    'Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string. Note: You must not use any built-in BigInteger library or convert the inputs to integer directly.',
  problemUrl: 'https://leetcode.com/problems/multiply-strings/',
  code: {
    python: `def multiply(num1, num2):
    if num1 == "0" or num2 == "0":
        return "0"
    result = [0] * (len(num1) + len(num2))

    for i in range(len(num1)-1, -1, -1):
        for j in range(len(num2)-1, -1, -1):
            mul = int(num1[i]) * int(num2[j])
            p1, p2 = i+j, i+j+1
            total = mul + result[p2]
            result[p2] = total % 10
            result[p1] += total // 10

    result = ''.join(map(str, result))
    return result.lstrip('0') or '0'`,
    javascript: `function multiply(num1, num2) {
    if (num1 === "0" || num2 === "0") return "0";
    const result = new Array(num1.length + num2.length).fill(0);

    for (let i = num1.length-1; i >= 0; i--) {
        for (let j = num2.length-1; j >= 0; j--) {
            const mul = +num1[i] * +num2[j];
            const p1 = i+j, p2 = i+j+1;
            const sum = mul + result[p2];
            result[p2] = sum % 10;
            result[p1] += Math.floor(sum / 10);
        }
    }

    let str = result.join('');
    while (str.length > 1 && str[0] === '0') str = str.slice(1);
    return str;
}`,
  },
  defaultInput: { num1: '123', num2: '456' },
  run: runMultiplyStrings,
};
