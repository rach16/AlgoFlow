import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

const SINGLES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const PAIRS: Record<string, number> = { IV: 4, IX: 9, XL: 40, XC: 90, CD: 400, CM: 900 };

function runRomanToInteger(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');
  const contributions = new Array(chars.length).fill(0);

  steps.push({
    state: {
      chars: [...chars],
      nums: [...contributions],
      hashMap: { ...SINGLES },
      result: `Reading "${s}" left to right`,
    },
    highlights: [],
    message: `Roman numerals are almost pure addition — except for six subtractive pairs (IV, IX, XL, XC, CD, CM). Scan left to right and, at each position, peek at the NEXT character first: if the two together form a pair, consume both.`,
    codeLine: 1,
  } as AlgorithmStep);

  let total = 0;
  let i = 0;

  while (i < chars.length) {
    const two = s.slice(i, i + 2);
    const isPair = two.length === 2 && PAIRS[two] !== undefined;

    if (isPair) {
      total += PAIRS[two];
      contributions[i] = PAIRS[two];

      steps.push({
        state: {
          chars: [...chars],
          nums: [...contributions],
          hashMap: { ...PAIRS },
          result: `total = ${total}`,
        },
        highlights: [i, i + 1],
        pointers: { i },
        message: `s[${i}..${i + 1}] = "${two}" is a subtractive pair worth ${PAIRS[two]} (a smaller symbol placed before a larger one means "subtract"). total = ${total}. Skip ahead 2 so the second letter is not counted again.`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);

      i += 2;
    } else {
      const ch = chars[i];
      total += SINGLES[ch];
      contributions[i] = SINGLES[ch];

      steps.push({
        state: {
          chars: [...chars],
          nums: [...contributions],
          hashMap: { ...SINGLES },
          result: `total = ${total}`,
        },
        highlights: [i],
        pointers: { i },
        message: `s[${i}] = '${ch}' starts no subtractive pair, so just add its own value ${SINGLES[ch]}. total = ${total}. Advance by 1.`,
        codeLine: 11,
        action: 'insert',
      } as AlgorithmStep);

      i += 1;
    }
  }

  steps.push({
    state: {
      chars: [...chars],
      nums: [...contributions],
      hashMap: { ...SINGLES },
      result: `Total: ${total}`,
    },
    highlights: chars.map((_, k) => k),
    message: `End of string. "${s}" = ${total}.`,
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runRomanToIntegerLookahead(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');
  const contributions = new Array(chars.length).fill(0);

  steps.push({
    state: {
      chars: [...chars],
      nums: [...contributions],
      hashMap: { ...SINGLES },
      result: `Reading "${s}" with one value table`,
    },
    highlights: [],
    message: `No pair table needed. Use a single symbol->value map and one rule: if a symbol is SMALLER than the symbol right after it, subtract it; otherwise add it. That rule generates all six subtractive pairs automatically.`,
    codeLine: 2,
  } as AlgorithmStep);

  let total = 0;

  for (let i = 0; i < chars.length; i++) {
    const value = SINGLES[chars[i]];
    const nextValue = i + 1 < chars.length ? SINGLES[chars[i + 1]] : 0;
    const subtract = i + 1 < chars.length && value < nextValue;

    if (subtract) {
      total -= value;
      contributions[i] = -value;
    } else {
      total += value;
      contributions[i] = value;
    }

    steps.push({
      state: {
        chars: [...chars],
        nums: [...contributions],
        hashMap: { ...SINGLES },
        result: `total = ${total}`,
      },
      highlights: [i],
      secondary: i + 1 < chars.length ? [i + 1] : [],
      pointers: { i },
      message: subtract
        ? `s[${i}] = '${chars[i]}' (${value}) is smaller than the next symbol '${chars[i + 1]}' (${nextValue}), so SUBTRACT ${value}. total = ${total}.`
        : `s[${i}] = '${chars[i]}' (${value}) is ${i + 1 < chars.length ? `>= the next symbol '${chars[i + 1]}' (${nextValue})` : 'the last symbol'}, so ADD ${value}. total = ${total}.`,
      codeLine: subtract ? 6 : 8,
      action: subtract ? 'compare' : 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      chars: [...chars],
      nums: [...contributions],
      hashMap: { ...SINGLES },
      result: `Total: ${total}`,
    },
    highlights: chars.map((_, k) => k),
    message: `Every symbol contributed exactly once (negative where it was subtracted): "${s}" = ${total}. Same answer as the pair-lookahead scan, with one map instead of two.`,
    codeLine: 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const romanToInteger: Algorithm = {
  id: 'roman-to-integer',
  name: 'Roman to Integer',
  category: 'Math & Geometry',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Hash Map — lookup table with subtractive-pair handling',
  description:
    'Roman numerals are usually written largest to smallest from left to right, but six subtractive pairs (IV, IX, XL, XC, CD, CM) break that rule. Given a roman numeral string, convert it to an integer.',
  problemUrl: 'https://leetcode.com/problems/roman-to-integer/',
  code: {
    python: `def romanToInt(s):
    pairs = {"IV": 4, "IX": 9, "XL": 40, "XC": 90, "CD": 400, "CM": 900}
    singles = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    i = 0
    while i < len(s):
        if s[i:i+2] in pairs:
            total += pairs[s[i:i+2]]
            i += 2
        else:
            total += singles[s[i]]
            i += 1
    return total`,
    javascript: `function romanToInt(s) {
    const pairs = { IV: 4, IX: 9, XL: 40, XC: 90, CD: 400, CM: 900 };
    const singles = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    let i = 0;
    while (i < s.length) {
        const two = s.slice(i, i + 2);
        if (pairs[two] !== undefined) {
            total += pairs[two];
            i += 2;
        } else {
            total += singles[s[i]];
            i += 1;
        }
    }
    return total;
}`,
    java: `public static int romanToInt(String s) {
    Map<String, Integer> pairs = Map.of("IV", 4, "IX", 9, "XL", 40, "XC", 90, "CD", 400, "CM", 900);
    Map<Character, Integer> singles = Map.of('I', 1, 'V', 5, 'X', 10, 'L', 50, 'C', 100, 'D', 500, 'M', 1000);
    int total = 0;
    int i = 0;
    while (i < s.length()) {
        String two = i + 1 < s.length() ? s.substring(i, i + 2) : "";
        if (pairs.containsKey(two)) {
            total += pairs.get(two);
            i += 2;
        } else {
            total += singles.get(s.charAt(i));
            i += 1;
        }
    }
    return total;
}`,
  },
  defaultInput: 'MMMCMXLIV',
  run: runRomanToInteger,
  optimalApproachName: 'Subtractive-Pair Lookahead',
  approaches: [
    {
      id: 'subtract-if-smaller-than-next',
      name: 'Subtract If Smaller Than Next',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Drops the six-entry pair table entirely: with one symbol->value map, subtract any symbol that is smaller than the one after it and add everything else — the subtractive pairs fall out of that single rule.',
      code: {
        python: `def romanToInt(s):
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i in range(len(s)):
        if i + 1 < len(s) and values[s[i]] < values[s[i + 1]]:
            total -= values[s[i]]
        else:
            total += values[s[i]]
    return total`,
        javascript: `function romanToInt(s) {
    const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < s.length; i++) {
        if (i + 1 < s.length && values[s[i]] < values[s[i + 1]]) {
            total -= values[s[i]];
        } else {
            total += values[s[i]];
        }
    }
    return total;
}`,
        java: `public static int romanToInt(String s) {
    Map<Character, Integer> values = Map.of('I', 1, 'V', 5, 'X', 10, 'L', 50, 'C', 100, 'D', 500, 'M', 1000);
    int total = 0;
    for (int i = 0; i < s.length(); i++) {
        int value = values.get(s.charAt(i));
        if (i + 1 < s.length() && value < values.get(s.charAt(i + 1))) {
            total -= value;
        } else {
            total += value;
        }
    }
    return total;
}`,
      },
      run: runRomanToIntegerLookahead,
      lineExplanations: {
        python: {
          1: 'Define function taking the roman numeral string',
          2: 'One map from symbol to value — no pair table',
          3: 'Running total',
          4: 'Visit every character exactly once',
          5: 'A symbol smaller than the next one is a subtractive prefix',
          6: 'Subtract it instead of adding',
          7: 'Otherwise it is an ordinary additive symbol',
          8: 'Add its value',
          9: 'Return the accumulated total',
        },
        javascript: {
          1: 'Define function taking the roman numeral string',
          2: 'One map from symbol to value — no pair table',
          3: 'Running total',
          4: 'Visit every character exactly once',
          5: 'A symbol smaller than the next one is a subtractive prefix',
          6: 'Subtract it instead of adding',
          8: 'Otherwise add its value',
          11: 'Return the accumulated total',
        },
        java: {
          1: 'Define method taking the roman numeral string',
          2: 'One map from symbol to value — no pair table',
          3: 'Running total',
          4: 'Visit every character exactly once',
          5: 'Look up this symbol once',
          6: 'A symbol smaller than the next one is a subtractive prefix',
          7: 'Subtract it instead of adding',
          9: 'Otherwise add its value',
          12: 'Return the accumulated total',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the roman numeral string',
      2: 'The only six two-character combinations that are subtractive',
      3: 'Value of each single symbol',
      4: 'Running total',
      5: 'Manual index because a pair consumes two characters',
      6: 'Scan until the string is consumed',
      7: 'Peek at the two-character slice starting here',
      8: 'It is a subtractive pair — add the pair value',
      9: 'Consume BOTH characters',
      10: 'Otherwise it is a plain additive symbol',
      11: 'Add the single symbol value',
      12: 'Consume one character',
      13: 'Return the accumulated total',
    },
    javascript: {
      1: 'Define function taking the roman numeral string',
      2: 'The only six two-character combinations that are subtractive',
      3: 'Value of each single symbol',
      4: 'Running total',
      5: 'Manual index because a pair consumes two characters',
      6: 'Scan until the string is consumed',
      7: 'Peek at the two-character slice starting here',
      8: 'Is it one of the subtractive pairs?',
      9: 'Add the pair value',
      10: 'Consume BOTH characters',
      12: 'Otherwise add the single symbol value',
      13: 'Consume one character',
      16: 'Return the accumulated total',
    },
    java: {
      1: 'Define method taking the roman numeral string',
      2: 'The only six two-character combinations that are subtractive',
      3: 'Value of each single symbol',
      4: 'Running total',
      5: 'Manual index because a pair consumes two characters',
      6: 'Scan until the string is consumed',
      7: 'Peek at the two-character slice (guard the end of string)',
      8: 'Is it one of the subtractive pairs?',
      9: 'Add the pair value',
      10: 'Consume BOTH characters',
      12: 'Otherwise add the single symbol value',
      13: 'Consume one character',
      16: 'Return the accumulated total',
    },
  },
};
