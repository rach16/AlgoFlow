import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function runExcelSheetColumnTitle(input: unknown): AlgorithmStep[] {
  const original = input as number;
  const steps: AlgorithmStep[] = [];
  let columnNumber = original;
  let title = '';

  steps.push({
    state: {
      chars: [],
      hashMap: { columnNumber },
      result: `Converting column ${original} to its Excel title`,
    },
    highlights: [],
    message: `Excel columns are base-26, but with NO zero digit: A..Z is 1..26, not 0..25. Subtracting 1 before each mod/divide converts the 1-indexed system into ordinary base-26.`,
    codeLine: 1,
  } as AlgorithmStep);

  const guard = 30;
  let round = 0;

  while (columnNumber > 0 && round < guard) {
    const before = columnNumber;
    columnNumber -= 1;

    steps.push({
      state: {
        chars: title.split(''),
        hashMap: { columnNumber: before, 'after -1': columnNumber },
        result: `${before} - 1 = ${columnNumber}`,
      },
      highlights: [],
      message: `Shift to 0-indexed: ${before} - 1 = ${columnNumber}. Now digit 0 means 'A', which is what plain base-26 arithmetic expects.`,
      codeLine: 4,
      action: 'compare',
    } as AlgorithmStep);

    const remainder = columnNumber % 26;
    const letter = LETTERS[remainder];
    title = letter + title;
    columnNumber = Math.floor(columnNumber / 26);

    steps.push({
      state: {
        chars: title.split(''),
        hashMap: { remainder, letterIndex: remainder + 1, columnNumber },
        result: `title so far: ${title}`,
      },
      highlights: [0],
      message: `${columnNumber * 26 + remainder} % 26 = ${remainder} -> '${letter}'. Prepend it (title = "${title}") and divide down: columnNumber = ${columnNumber}.`,
      codeLine: 5,
      action: 'insert',
    } as AlgorithmStep);

    round++;
  }

  steps.push({
    state: {
      chars: title.split(''),
      hashMap: { columnNumber: original },
      result: `Column title: ${title}`,
    },
    highlights: title.split('').map((_, i) => i),
    message: `columnNumber hit 0, so every digit is placed. Column ${original} is "${title}".`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runExcelSheetColumnTitleRecursive(input: unknown): AlgorithmStep[] {
  const original = input as number;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      chars: [],
      hashMap: { columnNumber: original },
      result: `convertToTitle(${original})`,
    },
    highlights: [],
    message: `Same base-26 math, expressed as recursion: peel off the LAST letter, recurse on what remains, and concatenate. The letters come out in order for free because the recursive call is placed first.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Descent: record (value entering the call, zero-indexed value, remainder, quotient)
  const frames: { value: number; zero: number; remainder: number; quotient: number }[] = [];
  let value = original;
  const guard = 30;

  while (value > 0 && frames.length < guard) {
    const zero = value - 1;
    const remainder = zero % 26;
    const quotient = Math.floor(zero / 26);
    frames.push({ value, zero, remainder, quotient });

    steps.push({
      state: {
        chars: [],
        hashMap: { call: value, 'after -1': zero, remainder, 'recurse on': quotient },
        result: `Descending: convertToTitle(${quotient})`,
      },
      highlights: [],
      pointers: { depth: frames.length - 1 },
      message: `Depth ${frames.length - 1}: convertToTitle(${value}). Zero-index it (${zero}), remember the trailing letter '${LETTERS[remainder]}' (${zero} % 26 = ${remainder}), then recurse on ${zero} // 26 = ${quotient} before writing anything.`,
      codeLine: 5,
      action: 'push',
    } as AlgorithmStep);

    value = quotient;
  }

  steps.push({
    state: {
      chars: [],
      hashMap: { call: 0 },
      result: `Base case: convertToTitle(0) = ""`,
    },
    highlights: [],
    message: `convertToTitle(0) hits the base case and returns the empty string — nothing left to encode. Now the stack unwinds, appending one letter per frame.`,
    codeLine: 3,
    action: 'pop',
  } as AlgorithmStep);

  let title = '';
  for (let d = frames.length - 1; d >= 0; d--) {
    const f = frames[d];
    title += LETTERS[f.remainder];

    steps.push({
      state: {
        chars: title.split(''),
        hashMap: { depth: d, remainder: f.remainder, call: f.value },
        result: `title so far: ${title}`,
      },
      highlights: [title.length - 1],
      pointers: { depth: d },
      message: `Unwinding depth ${d}: the inner call returned "${title.slice(0, -1)}", so append '${LETTERS[f.remainder]}' -> "${title}".`,
      codeLine: 5,
      action: 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      chars: title.split(''),
      hashMap: { columnNumber: original },
      result: `Column title: ${title}`,
    },
    highlights: title.split('').map((_, i) => i),
    message: `Recursion fully unwound. Column ${original} is "${title}" — identical to the loop, at the cost of O(log n) stack frames.`,
    codeLine: 5,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const excelSheetColumnTitle: Algorithm = {
  id: 'excel-sheet-column-title',
  name: 'Excel Sheet Column Title',
  category: 'Math & Geometry',
  difficulty: 'Easy',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(log n)',
  pattern: 'Math — repeated mod 26 with a 1-indexed offset',
  description:
    'Given an integer columnNumber, return its corresponding column title as it appears in an Excel sheet (1 -> A, 26 -> Z, 27 -> AA). The system is base-26 but 1-indexed, so there is no digit that means zero.',
  problemUrl: 'https://leetcode.com/problems/excel-sheet-column-title/',
  code: {
    python: `def convertToTitle(columnNumber):
    result = []
    while columnNumber > 0:
        columnNumber -= 1
        result.append(chr(ord('A') + columnNumber % 26))
        columnNumber //= 26
    return ''.join(reversed(result))`,
    javascript: `function convertToTitle(columnNumber) {
    let result = '';
    while (columnNumber > 0) {
        columnNumber--;
        result = String.fromCharCode(65 + (columnNumber % 26)) + result;
        columnNumber = Math.floor(columnNumber / 26);
    }
    return result;
}`,
    java: `public static String convertToTitle(int columnNumber) {
    StringBuilder sb = new StringBuilder();
    while (columnNumber > 0) {
        columnNumber--;
        sb.append((char) ('A' + columnNumber % 26));
        columnNumber /= 26;
    }
    return sb.reverse().toString();
}`,
  },
  defaultInput: 2026,
  run: runExcelSheetColumnTitle,
  optimalApproachName: 'Iterative Base-26',
  approaches: [
    {
      id: 'recursive-base-26',
      name: 'Recursion',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(log n)',
      description:
        'Peels off the trailing letter and recurses on the quotient, so the letters concatenate in the right order without a reverse — the loop version has to build backwards and flip at the end.',
      code: {
        python: `def convertToTitle(columnNumber):
    if columnNumber == 0:
        return ""
    columnNumber -= 1
    return convertToTitle(columnNumber // 26) + chr(ord('A') + columnNumber % 26)`,
        javascript: `function convertToTitle(columnNumber) {
    if (columnNumber === 0) return '';
    columnNumber--;
    return convertToTitle(Math.floor(columnNumber / 26)) + String.fromCharCode(65 + (columnNumber % 26));
}`,
        java: `public static String convertToTitle(int columnNumber) {
    if (columnNumber == 0) return "";
    columnNumber--;
    return convertToTitle(columnNumber / 26) + (char) ('A' + columnNumber % 26);
}`,
      },
      run: runExcelSheetColumnTitleRecursive,
      lineExplanations: {
        python: {
          1: 'Define recursive function taking the 1-indexed column number',
          2: 'Base case: nothing left to encode',
          3: 'Return the empty string so concatenation is a no-op',
          4: 'Shift to 0-indexed so plain base-26 math applies',
          5: 'Recurse on the quotient first, then append the letter for this level',
        },
        javascript: {
          1: 'Define recursive function taking the 1-indexed column number',
          2: 'Base case: nothing left to encode, return empty string',
          3: 'Shift to 0-indexed so plain base-26 math applies',
          4: 'Recurse on the quotient first, then append the letter for this level',
        },
        java: {
          1: 'Define recursive method taking the 1-indexed column number',
          2: 'Base case: nothing left to encode, return empty string',
          3: 'Shift to 0-indexed so plain base-26 math applies',
          4: 'Recurse on the quotient first, then append the letter for this level',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the 1-indexed column number',
      2: 'Collect letters least significant first',
      3: 'Keep peeling digits until nothing is left',
      4: 'The -1 turns 1..26 into 0..25 — the key trick',
      5: 'Remainder mod 26 picks the letter for this position',
      6: 'Integer-divide to move to the next position',
      7: 'Letters were collected backwards — reverse and join',
    },
    javascript: {
      1: 'Define function taking the 1-indexed column number',
      2: 'Build the title by prepending each new letter',
      3: 'Keep peeling digits until nothing is left',
      4: 'The -1 turns 1..26 into 0..25 — the key trick',
      5: 'Remainder mod 26 picks the letter; prepend it',
      6: 'Integer-divide to move to the next position',
      8: 'Prepending kept the order correct — no reverse needed',
    },
    java: {
      1: 'Define method taking the 1-indexed column number',
      2: 'StringBuilder collects letters least significant first',
      3: 'Keep peeling digits until nothing is left',
      4: 'The -1 turns 1..26 into 0..25 — the key trick',
      5: "Remainder mod 26 offset from 'A' picks the letter",
      6: 'Integer-divide to move to the next position',
      8: 'Letters were appended backwards — reverse before returning',
    },
  },
};
