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

function runMultiplyStringsPartialProducts(input: unknown): AlgorithmStep[] {
  const { num1, num2 } = input as MultiplyStringsInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      chars: [...num1.split(''), ' x ', ...num2.split('')],
      nums: [],
      result: `Multiplying "${num1}" x "${num2}" schoolbook-style`,
    },
    highlights: [],
    message: `Schoolbook method: multiply "${num1}" by each digit of "${num2}" (right to left), shift each partial product by its place value, and add them all up.`,
    codeLine: 1,
  });

  if (num1 === '0' || num2 === '0') {
    steps.push({
      state: {
        chars: ['0'],
        nums: [],
        result: `"${num1}" x "${num2}" = "0"`,
      },
      highlights: [],
      message: `One factor is zero, so the product is "0" — no work needed.`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  function addStrings(a: string, b: string): string {
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;
    let out = '';
    while (i >= 0 || j >= 0 || carry > 0) {
      const sum = (i >= 0 ? +a[i] : 0) + (j >= 0 ? +b[j] : 0) + carry;
      out = (sum % 10) + out;
      carry = Math.floor(sum / 10);
      i--;
      j--;
    }
    return out;
  }

  let total = '0';

  for (let k = num2.length - 1; k >= 0; k--) {
    const d = +num2[k];
    let carry = 0;
    let partial = '';

    for (let i = num1.length - 1; i >= 0; i--) {
      const prod = +num1[i] * d + carry;
      partial = (prod % 10) + partial;
      carry = Math.floor(prod / 10);
    }
    if (carry > 0) partial = carry + partial;

    steps.push({
      state: {
        chars: [...partial.split('')],
        nums: [],
        result: `${num1} x ${d} = ${partial}`,
      },
      highlights: [],
      pointers: { k },
      message: `Partial product: ${num1} x ${d} (digit ${num2.length - 1 - k} from the right of ${num2}) = ${partial}.`,
      codeLine: 18,
      action: 'insert',
    });

    const zeros = num2.length - 1 - k;
    const shifted = partial + '0'.repeat(zeros);

    if (zeros > 0) {
      steps.push({
        state: {
          chars: [...shifted.split('')],
          nums: [],
          result: `Shift by ${zeros}: ${shifted}`,
        },
        highlights: Array.from({ length: zeros }, (_, z) => shifted.length - 1 - z),
        pointers: { k },
        message: `This digit sits at place value 10^${zeros}, so append ${zeros} zero${zeros > 1 ? 's' : ''}: ${partial} -> ${shifted}.`,
        codeLine: 22,
        action: 'visit',
      });
    }

    const prevTotal = total;
    total = addStrings(total, shifted);

    steps.push({
      state: {
        chars: [...total.split('')],
        nums: [],
        result: `Running total: ${prevTotal} + ${shifted} = ${total}`,
      },
      highlights: [],
      pointers: { k },
      message: `Add into the running total with string addition (no big-int allowed): ${prevTotal} + ${shifted} = ${total}.`,
      codeLine: 23,
      action: 'insert',
    });
  }

  steps.push({
    state: {
      chars: [...total.split('')],
      nums: [],
      result: `"${num1}" x "${num2}" = "${total}"`,
    },
    highlights: [],
    message: `Done! Sum of all shifted partial products: "${num1}" x "${num2}" = "${total}".`,
    codeLine: 24,
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
    java: `public static String multiply(String num1, String num2) {
    if (num1.equals("0") || num2.equals("0")) return "0";
    int[] result = new int[num1.length() + num2.length()];

    for (int i = num1.length() - 1; i >= 0; i--) {
        for (int j = num2.length() - 1; j >= 0; j--) {
            int mul = (num1.charAt(i) - '0') * (num2.charAt(j) - '0');
            int p1 = i + j, p2 = i + j + 1;
            int sum = mul + result[p2];
            result[p2] = sum % 10;
            result[p1] += sum / 10;
        }
    }

    StringBuilder sb = new StringBuilder();
    for (int num : result) {
        if (!(sb.length() == 0 && num == 0)) {
            sb.append(num);
        }
    }
    return sb.toString();
}`,
  },
  defaultInput: { num1: '123', num2: '456' },
  run: runMultiplyStrings,
  optimalApproachName: 'Digit-Product Position Array',
  approaches: [
    {
      id: 'partial-products-addition',
      name: 'Schoolbook Partial Products',
      timeComplexity: 'O(m·n + n²)',
      spaceComplexity: 'O(m+n)',
      description:
        'The pencil-and-paper method: build one shifted partial product per digit of num2 and string-add them into a running total, instead of scattering digit products into a shared position array.',
      code: {
        python: `def multiply(num1, num2):
    if num1 == "0" or num2 == "0":
        return "0"
    def add_strings(a, b):
        i, j, carry, out = len(a) - 1, len(b) - 1, 0, []
        while i >= 0 or j >= 0 or carry:
            d1 = int(a[i]) if i >= 0 else 0
            d2 = int(b[j]) if j >= 0 else 0
            carry, digit = divmod(d1 + d2 + carry, 10)
            out.append(str(digit))
            i, j = i - 1, j - 1
        return ''.join(reversed(out))
    total = "0"
    for k in range(len(num2) - 1, -1, -1):
        d = int(num2[k])
        carry, partial = 0, []
        for i in range(len(num1) - 1, -1, -1):
            carry, digit = divmod(int(num1[i]) * d + carry, 10)
            partial.append(str(digit))
        if carry:
            partial.append(str(carry))
        shifted = ''.join(reversed(partial)) + '0' * (len(num2) - 1 - k)
        total = add_strings(total, shifted)
    return total`,
        javascript: `function multiply(num1, num2) {
    if (num1 === "0" || num2 === "0") return "0";
    const addStrings = (a, b) => {
        let i = a.length - 1, j = b.length - 1, carry = 0, out = '';
        while (i >= 0 || j >= 0 || carry) {
            const sum = (i >= 0 ? +a[i] : 0) + (j >= 0 ? +b[j] : 0) + carry;
            out = (sum % 10) + out;
            carry = Math.floor(sum / 10);
            i--; j--;
        }
        return out;
    };
    let total = "0";
    for (let k = num2.length - 1; k >= 0; k--) {
        const d = +num2[k];
        let carry = 0, partial = '';
        for (let i = num1.length - 1; i >= 0; i--) {
            const prod = +num1[i] * d + carry;
            partial = (prod % 10) + partial;
            carry = Math.floor(prod / 10);
        }
        if (carry) partial = carry + partial;
        partial += '0'.repeat(num2.length - 1 - k);
        total = addStrings(total, partial);
    }
    return total;
}`,
        java: `public static String multiply(String num1, String num2) {
    if (num1.equals("0") || num2.equals("0")) return "0";
    String total = "0";
    for (int k = num2.length() - 1; k >= 0; k--) {
        int d = num2.charAt(k) - '0';
        StringBuilder partial = new StringBuilder();
        int carry = 0;
        for (int i = num1.length() - 1; i >= 0; i--) {
            int prod = (num1.charAt(i) - '0') * d + carry;
            partial.insert(0, prod % 10);
            carry = prod / 10;
        }
        if (carry > 0) partial.insert(0, carry);
        for (int z = 0; z < num2.length() - 1 - k; z++) partial.append('0');
        total = addStrings(total, partial.toString());
    }
    return total;
}

private static String addStrings(String a, String b) {
    StringBuilder sb = new StringBuilder();
    int i = a.length() - 1, j = b.length() - 1, carry = 0;
    while (i >= 0 || j >= 0 || carry > 0) {
        int sum = carry;
        if (i >= 0) sum += a.charAt(i--) - '0';
        if (j >= 0) sum += b.charAt(j--) - '0';
        sb.insert(0, sum % 10);
        carry = sum / 10;
    }
    return sb.toString();
}`,
      },
      run: runMultiplyStringsPartialProducts,
      lineExplanations: {
        python: {
          1: 'Define function taking two number strings',
          2: 'Handle zero multiplication early',
          3: 'Return "0" immediately',
          4: 'Helper: add two non-negative number strings',
          5: 'Pointers at the ends of both strings, carry, output digits',
          6: 'Loop while digits or a carry remain',
          7: 'Digit of a (0 once exhausted)',
          8: 'Digit of b (0 once exhausted)',
          9: 'divmod splits the sum into new carry and current digit',
          10: 'Collect the digit',
          11: 'Move both pointers left',
          12: 'Digits were built backwards — reverse and join',
          13: 'Running total starts at "0"',
          14: 'One partial product per digit of num2, right to left',
          15: 'Current multiplier digit',
          16: 'Fresh carry and digit list for this partial product',
          17: 'Multiply every digit of num1 by d, right to left',
          18: 'divmod splits digit product + carry into carry and digit',
          19: 'Collect the digit',
          20: 'Leftover carry?',
          21: 'It becomes the leading digit',
          22: 'Shift: append one 0 per place value of this digit',
          23: 'String-add the shifted partial into the total',
          24: 'Total of all partial products is the answer',
        },
        javascript: {
          1: 'Define function taking two number strings',
          2: 'Handle zero multiplication early',
          3: 'Helper: add two non-negative number strings',
          4: 'Pointers at the ends of both strings, carry, output',
          5: 'Loop while digits or a carry remain',
          6: 'Sum the two current digits plus carry',
          7: 'Prepend the ones digit to the output',
          8: 'New carry is the tens digit',
          9: 'Move both pointers left',
          11: 'Return the sum string',
          13: 'Running total starts at "0"',
          14: 'One partial product per digit of num2, right to left',
          15: 'Current multiplier digit',
          16: 'Fresh carry and partial string for this digit',
          17: 'Multiply every digit of num1 by d, right to left',
          18: 'Digit product plus incoming carry',
          19: 'Prepend the ones digit to the partial',
          20: 'New carry is the tens digit',
          22: 'Leftover carry becomes the leading digit',
          23: 'Shift: append one 0 per place value of this digit',
          24: 'String-add the shifted partial into the total',
          26: 'Total of all partial products is the answer',
        },
        java: {
          1: 'Define method taking two number strings',
          2: 'Handle zero multiplication early',
          3: 'Running total starts at "0"',
          4: 'One partial product per digit of num2, right to left',
          5: 'Current multiplier digit',
          6: 'Builder for this partial product',
          7: 'Fresh carry for this digit',
          8: 'Multiply every digit of num1 by d, right to left',
          9: 'Digit product plus incoming carry',
          10: 'Prepend the ones digit to the partial',
          11: 'New carry is the tens digit',
          13: 'Leftover carry becomes the leading digit',
          14: 'Shift: append one 0 per place value of this digit',
          15: 'String-add the shifted partial into the total',
          17: 'Total of all partial products is the answer',
          20: 'Helper: add two non-negative number strings',
          21: 'Builder for the sum digits',
          22: 'Pointers at the ends of both strings plus carry',
          23: 'Loop while digits or a carry remain',
          24: 'Start the column sum with the carry',
          25: 'Add digit of a if any remain',
          26: 'Add digit of b if any remain',
          27: 'Prepend the ones digit',
          28: 'New carry is the tens digit',
          30: 'Return the sum string',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking two number strings',
      2: 'Handle zero multiplication early',
      3: 'Return "0" immediately',
      4: 'Create result array sized len1 + len2',
      6: 'Iterate digits of num1 from right to left',
      7: 'Iterate digits of num2 from right to left',
      8: 'Multiply current digit pair',
      9: 'Compute positions in result array',
      10: 'Add product to existing value at p2',
      11: 'Store ones digit at position p2',
      12: 'Carry tens digit to position p1',
      14: 'Join result array into string',
      15: 'Remove leading zeroes, default to "0"',
    },
    javascript: {
      1: 'Define function taking two number strings',
      2: 'Handle zero multiplication early',
      3: 'Create result array sized len1 + len2',
      5: 'Iterate digits of num1 from right to left',
      6: 'Iterate digits of num2 from right to left',
      7: 'Multiply current digit pair',
      8: 'Compute positions in result array',
      9: 'Add product to existing value at p2',
      10: 'Store ones digit at position p2',
      11: 'Carry tens digit to position p1',
      15: 'Join result array into string',
      16: 'Remove leading zeroes',
      17: 'Return final product string',
    },
    java: {
      1: 'Define method taking two number strings',
      2: 'Handle zero multiplication early',
      3: 'Create result array sized len1 + len2',
      5: 'Iterate digits of num1 from right to left',
      6: 'Iterate digits of num2 from right to left',
      7: 'Multiply current digit pair',
      8: 'Compute positions in result array',
      9: 'Add product to existing value at p2',
      10: 'Store ones digit at position p2',
      11: 'Carry tens digit to position p1',
      15: 'Build result string with StringBuilder',
      16: 'Iterate over result array',
      17: 'Skip leading zeroes',
      18: 'Append non-zero digits',
      21: 'Return final product string',
    },
  },
};
