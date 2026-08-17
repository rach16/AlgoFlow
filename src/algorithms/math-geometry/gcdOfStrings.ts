import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runGcdOfStrings(input: unknown): AlgorithmStep[] {
  const { str1, str2 } = input as { str1: string; str2: string };
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      chars: str1.split(''),
      hashMap: { 'len(str1)': str1.length, 'len(str2)': str2.length },
      result: `Looking for the largest string that divides both`,
    },
    highlights: [],
    message: `Key insight: a common divisor string exists ONLY if str1 + str2 == str2 + str1. When it does, both strings are made of the same tiny block, and the answer is the prefix of str1 whose length is gcd(len(str1), len(str2)).`,
    codeLine: 1,
  } as AlgorithmStep);

  const concatOk = str1 + str2 === str2 + str1;

  steps.push({
    state: {
      chars: str1.split(''),
      hashMap: { 'str1+str2': str1 + str2, 'str2+str1': str2 + str1 },
      result: concatOk ? 'Concatenations match — a divisor exists' : 'Concatenations differ — no divisor',
    },
    highlights: [],
    message: `Check "${str1}" + "${str2}" = "${str1 + str2}" against "${str2}" + "${str1}" = "${str2 + str1}". They ${concatOk ? 'MATCH, so both strings are repetitions of one common block' : 'DIFFER, so no string can divide both'}.`,
    codeLine: 2,
    action: 'compare',
  } as AlgorithmStep);

  if (!concatOk) {
    steps.push({
      state: {
        chars: [],
        hashMap: {},
        result: `GCD string: ""`,
      },
      highlights: [],
      message: `Since the concatenations disagree, return the empty string — no non-empty string divides both.`,
      codeLine: 3,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  let a = str1.length;
  let b = str2.length;

  steps.push({
    state: {
      chars: str1.split(''),
      hashMap: { a, b },
      result: `Euclid on the lengths: gcd(${a}, ${b})`,
    },
    highlights: [],
    message: `Now the only question is HOW LONG the block is. Run Euclid on the two lengths: gcd(${a}, ${b}).`,
    codeLine: 4,
  } as AlgorithmStep);

  const guard = 40;
  let round = 0;

  while (b !== 0 && round < guard) {
    const remainder = a % b;

    steps.push({
      state: {
        chars: str1.split(''),
        hashMap: { a, b, 'a % b': remainder },
        result: `gcd(${a}, ${b}) -> gcd(${b}, ${remainder})`,
      },
      highlights: [],
      message: `${a} % ${b} = ${remainder}, so gcd(${a}, ${b}) = gcd(${b}, ${remainder}). ${remainder === 0 ? `Remainder 0 means ${b} is the gcd.` : 'Keep going.'}`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);

    a = b;
    b = remainder;
    round++;
  }

  const candidate = str1.slice(0, a);

  steps.push({
    state: {
      chars: str1.split(''),
      hashMap: { gcd: a, 'copies in str1': str1.length / a, 'copies in str2': str2.length / a },
      result: `GCD string: "${candidate}"`,
    },
    highlights: Array.from({ length: a }, (_, i) => i),
    message: `gcd(${str1.length}, ${str2.length}) = ${a}, so the answer is the first ${a} character${a === 1 ? '' : 's'} of str1: "${candidate}". It repeats ${str1.length / a}x to make "${str1}" and ${str2.length / a}x to make "${str2}".`,
    codeLine: 8,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runGcdOfStringsCandidatePrefix(input: unknown): AlgorithmStep[] {
  const { str1, str2 } = input as { str1: string; str2: string };
  const steps: AlgorithmStep[] = [];
  const n1 = str1.length;
  const n2 = str2.length;

  steps.push({
    state: {
      chars: str1.split(''),
      hashMap: { 'len(str1)': n1, 'len(str2)': n2 },
      result: `Testing prefixes from longest to shortest`,
    },
    highlights: [],
    message: `Brute-force-but-standard: any common divisor must be a PREFIX of str1. Try prefix lengths from min(${n1}, ${n2}) downward and return the first one that tiles both strings exactly — no gcd theory needed.`,
    codeLine: 2,
  } as AlgorithmStep);

  for (let len = Math.min(n1, n2); len > 0; len--) {
    if (n1 % len !== 0 || n2 % len !== 0) {
      steps.push({
        state: {
          chars: str1.split(''),
          hashMap: { length: len, 'n1 % len': n1 % len, 'n2 % len': n2 % len },
          result: `Length ${len} does not divide both lengths`,
        },
        highlights: Array.from({ length: len }, (_, i) => i),
        message: `Length ${len}: ${n1} % ${len} = ${n1 % len}, ${n2} % ${len} = ${n2 % len}. A block must fit a whole number of times in both, so skip this length before touching the characters.`,
        codeLine: 4,
        action: 'compare',
      } as AlgorithmStep);
      continue;
    }

    const cand = str1.slice(0, len);
    const fits1 = cand.repeat(n1 / len) === str1;
    const fits2 = cand.repeat(n2 / len) === str2;

    steps.push({
      state: {
        chars: str1.split(''),
        hashMap: { length: len, candidate: cand, 'tiles str1': fits1 ? 'yes' : 'no', 'tiles str2': fits2 ? 'yes' : 'no' },
        result: fits1 && fits2 ? `"${cand}" tiles both` : `"${cand}" fails`,
      },
      highlights: Array.from({ length: len }, (_, i) => i),
      message: `Length ${len}: candidate "${cand}". Repeat it ${n1 / len}x -> ${fits1 ? `matches "${str1}"` : `does NOT match "${str1}"`}; repeat it ${n2 / len}x -> ${fits2 ? `matches "${str2}"` : `does NOT match "${str2}"`}.`,
      codeLine: 7,
      action: 'compare',
    } as AlgorithmStep);

    if (fits1 && fits2) {
      steps.push({
        state: {
          chars: str1.split(''),
          hashMap: { gcd: len, 'copies in str1': n1 / len, 'copies in str2': n2 / len },
          result: `GCD string: "${cand}"`,
        },
        highlights: Array.from({ length: len }, (_, i) => i),
        message: `First length that works, scanning downward, is ${len} — so "${cand}" is the LARGEST common divisor string. Same answer as Euclid, but this costs O(min(n1, n2) * (n1 + n2)) instead of O(n1 + n2).`,
        codeLine: 8,
        action: 'found',
      } as AlgorithmStep);
      return steps;
    }
  }

  steps.push({
    state: {
      chars: [],
      hashMap: {},
      result: `GCD string: ""`,
    },
    highlights: [],
    message: `No prefix length tiled both strings, so there is no common divisor — return the empty string.`,
    codeLine: 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const gcdOfStrings: Algorithm = {
  id: 'gcd-of-strings',
  name: 'Greatest Common Divisor of Strings',
  category: 'Math & Geometry',
  difficulty: 'Easy',
  timeComplexity: 'O(m + n)',
  spaceComplexity: 'O(m + n)',
  pattern: 'Math — gcd of lengths once the concatenation test passes',
  description:
    'For two strings s and t, we say "t divides s" if s can be formed by concatenating t one or more times. Given two strings str1 and str2, return the largest string x such that x divides both str1 and str2.',
  problemUrl: 'https://leetcode.com/problems/greatest-common-divisor-of-strings/',
  code: {
    python: `def gcdOfStrings(str1, str2):
    if str1 + str2 != str2 + str1:
        return ""
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return a
    return str1[:gcd(len(str1), len(str2))]`,
    javascript: `function gcdOfStrings(str1, str2) {
    if (str1 + str2 !== str2 + str1) return "";
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    return str1.slice(0, gcd(str1.length, str2.length));
}`,
    java: `public static String gcdOfStrings(String str1, String str2) {
    if (!(str1 + str2).equals(str2 + str1)) return "";
    int a = str1.length(), b = str2.length();
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return str1.substring(0, a);
}`,
  },
  defaultInput: { str1: 'ABABABABAB', str2: 'ABABAB' },
  run: runGcdOfStrings,
  optimalApproachName: 'Concat Check + GCD of Lengths',
  approaches: [
    {
      id: 'candidate-prefix-scan',
      name: 'Candidate Prefix Scan',
      timeComplexity: 'O(min(m, n) * (m + n))',
      spaceComplexity: 'O(m + n)',
      description:
        'Skips the number-theory shortcut and simply tests every prefix length from longest to shortest, returning the first prefix that tiles both strings — obvious to reason about, but it re-scans the strings for each candidate.',
      code: {
        python: `def gcdOfStrings(str1, str2):
    n1, n2 = len(str1), len(str2)
    for length in range(min(n1, n2), 0, -1):
        if n1 % length or n2 % length:
            continue
        cand = str1[:length]
        if cand * (n1 // length) == str1 and cand * (n2 // length) == str2:
            return cand
    return ""`,
        javascript: `function gcdOfStrings(str1, str2) {
    const n1 = str1.length, n2 = str2.length;
    for (let len = Math.min(n1, n2); len > 0; len--) {
        if (n1 % len !== 0 || n2 % len !== 0) continue;
        const cand = str1.slice(0, len);
        if (cand.repeat(n1 / len) === str1 && cand.repeat(n2 / len) === str2) {
            return cand;
        }
    }
    return "";
}`,
        java: `public static String gcdOfStrings(String str1, String str2) {
    int n1 = str1.length(), n2 = str2.length();
    for (int len = Math.min(n1, n2); len > 0; len--) {
        if (n1 % len != 0 || n2 % len != 0) continue;
        String cand = str1.substring(0, len);
        if (cand.repeat(n1 / len).equals(str1) && cand.repeat(n2 / len).equals(str2)) {
            return cand;
        }
    }
    return "";
}`,
      },
      run: runGcdOfStringsCandidatePrefix,
      lineExplanations: {
        python: {
          1: 'Define function taking the two strings',
          2: 'Cache both lengths',
          3: 'Try prefix lengths from the longest possible down to 1',
          4: 'A block must divide BOTH lengths evenly',
          5: 'Otherwise skip without comparing characters',
          6: 'The candidate block is always a prefix of str1',
          7: 'Does repeating it rebuild both strings exactly?',
          8: 'First hit going downward is the largest — return it',
          9: 'Nothing tiled both strings',
        },
        javascript: {
          1: 'Define function taking the two strings',
          2: 'Cache both lengths',
          3: 'Try prefix lengths from the longest possible down to 1',
          4: 'A block must divide BOTH lengths evenly',
          5: 'The candidate block is always a prefix of str1',
          6: 'Does repeating it rebuild both strings exactly?',
          7: 'First hit going downward is the largest — return it',
          10: 'Nothing tiled both strings',
        },
        java: {
          1: 'Define method taking the two strings',
          2: 'Cache both lengths',
          3: 'Try prefix lengths from the longest possible down to 1',
          4: 'A block must divide BOTH lengths evenly',
          5: 'The candidate block is always a prefix of str1',
          6: 'Does repeating it rebuild both strings exactly?',
          7: 'First hit going downward is the largest — return it',
          10: 'Nothing tiled both strings',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the two strings',
      2: 'If the two concatenation orders differ, no block can divide both',
      3: 'Return the empty string in that case',
      4: 'Euclid on the two LENGTHS',
      5: 'Loop until the remainder hits zero',
      6: 'Classic Euclid step: (a, b) becomes (b, a % b)',
      7: 'a now holds gcd(len(str1), len(str2))',
      8: 'The answer is the prefix of str1 of that length',
    },
    javascript: {
      1: 'Define function taking the two strings',
      2: 'If the two concatenation orders differ, no block can divide both',
      3: 'Recursive Euclid on the two lengths',
      4: 'The answer is the prefix of str1 of length gcd',
    },
    java: {
      1: 'Define method taking the two strings',
      2: 'If the two concatenation orders differ, no block can divide both',
      3: 'Run Euclid on the two lengths',
      4: 'Loop until the remainder hits zero',
      5: 'Remember b before overwriting it',
      6: 'New b is the remainder a % b',
      7: 'New a is the old b',
      9: 'The answer is the prefix of str1 of length gcd',
    },
  },
};
