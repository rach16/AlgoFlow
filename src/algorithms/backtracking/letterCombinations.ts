import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

const PHONE_MAP: Record<string, string> = {
  '2': 'abc',
  '3': 'def',
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz',
};

function runLetterCombinations(input: unknown): AlgorithmStep[] {
  const digits = input as string;
  const steps: AlgorithmStep[] = [];
  const result: string[] = [];

  if (digits.length === 0) {
    steps.push({
      state: { chars: [], stack: [], result: [] },
      highlights: [],
      message: 'Empty input, no combinations',
      codeLine: 1,
    });
    return steps;
  }

  steps.push({
    state: {
      chars: digits.split(''),
      stack: [],
      hashMap: Object.fromEntries(
        digits.split('').map((d) => [d, PHONE_MAP[d]])
      ),
      result: [],
    },
    highlights: [],
    message: `Generate letter combinations for digits "${digits}"`,
    codeLine: 1,
  });

  function backtrack(idx: number, current: string[]) {
    if (idx === digits.length) {
      const combo = current.join('');
      result.push(combo);

      steps.push({
        state: {
          chars: digits.split(''),
          stack: [...current],
          hashMap: Object.fromEntries(
            digits.split('').map((d) => [d, PHONE_MAP[d]])
          ),
          result: [...result],
        },
        highlights: Array.from({ length: digits.length }, (_, i) => i),
        message: `Found combination "${combo}" (total: ${result.length})`,
        codeLine: 5,
        action: 'found',
      });
      return;
    }

    const digit = digits[idx];
    const letters = PHONE_MAP[digit];

    steps.push({
      state: {
        chars: digits.split(''),
        stack: [...current],
        hashMap: Object.fromEntries(
          digits.split('').map((d) => [d, PHONE_MAP[d]])
        ),
        result: [...result],
      },
      highlights: [idx],
      message: `Processing digit "${digit}" -> letters "${letters}"`,
      codeLine: 7,
      action: 'visit',
    });

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];

      // Choose
      current.push(letter);

      steps.push({
        state: {
          chars: digits.split(''),
          stack: [...current],
          hashMap: Object.fromEntries(
            digits.split('').map((d) => [d, PHONE_MAP[d]])
          ),
          result: [...result],
        },
        highlights: [idx],
        message: `Choose '${letter}' from "${letters}" (digit ${digit}) -> "${current.join('')}"`,
        codeLine: 9,
        action: 'push',
      });

      // Explore
      backtrack(idx + 1, current);

      // Unchoose
      current.pop();

      steps.push({
        state: {
          chars: digits.split(''),
          stack: [...current],
          hashMap: Object.fromEntries(
            digits.split('').map((d) => [d, PHONE_MAP[d]])
          ),
          result: [...result],
        },
        highlights: [idx],
        message: `Backtrack: remove '${letter}' -> "${current.join('')}"`,
        codeLine: 11,
        action: 'pop',
      });
    }
  }

  backtrack(0, []);

  steps.push({
    state: {
      chars: digits.split(''),
      stack: [],
      hashMap: Object.fromEntries(
        digits.split('').map((d) => [d, PHONE_MAP[d]])
      ),
      result: [...result],
    },
    highlights: [],
    message: `Done! Found ${result.length} letter combinations`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

function runLetterCombinationsBFS(input: unknown): AlgorithmStep[] {
  const digits = input as string;
  const steps: AlgorithmStep[] = [];

  if (digits.length === 0) {
    steps.push({
      state: { chars: [], stack: [], result: [] },
      highlights: [],
      message: 'Empty input, no combinations',
      codeLine: 2,
    });
    return steps;
  }

  const phoneState = () =>
    Object.fromEntries(digits.split('').map((d) => [d, PHONE_MAP[d]]));

  let result: string[] = [''];

  steps.push({
    state: { chars: digits.split(''), stack: [], hashMap: phoneState(), result: ['""'] },
    highlights: [],
    message: `BFS-style building: start with one empty combination "" and expand a full layer per digit — no recursion, no backtracking`,
    codeLine: 10,
  });

  for (let idx = 0; idx < digits.length; idx++) {
    const digit = digits[idx];
    const letters = PHONE_MAP[digit];

    steps.push({
      state: { chars: digits.split(''), stack: [], hashMap: phoneState(), result: [...result] },
      highlights: [idx],
      message: `Digit "${digit}" maps to "${letters}": each of the ${result.length} combination${result.length !== 1 ? 's' : ''} spawns ${letters.length} longer ones (${result.length} × ${letters.length} = ${result.length * letters.length})`,
      codeLine: 12,
      action: 'visit',
    });

    const next: string[] = [];
    for (const combo of result) {
      const grown = letters.split('').map((letter) => combo + letter);
      next.push(...grown);

      steps.push({
        state: {
          chars: digits.split(''),
          stack: combo.split(''),
          hashMap: phoneState(),
          result: [...next],
        },
        highlights: [idx],
        message: `"${combo}" + {${letters.split('').join(', ')}} -> ${grown.map((g) => `"${g}"`).join(', ')}`,
        codeLine: 13,
        action: 'insert',
      });
    }
    result = next;
  }

  steps.push({
    state: { chars: digits.split(''), stack: [], hashMap: phoneState(), result: [...result] },
    highlights: [],
    message: `Done! ${result.length} combinations built layer by layer — after each digit the whole layer is complete, unlike DFS which finishes one combination at a time`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const letterCombinations: Algorithm = {
  id: 'letter-combinations',
  name: 'Letter Combinations of a Phone Number',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(4ⁿ)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — map digit to letters, try each combo',
  description:
    'Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent (like phone keypads). Use backtracking: for each digit, try each mapped letter and recurse.',
  problemUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
  code: {
    python: `def letterCombinations(digits):
    if not digits:
        return []

    phone = {
        "2": "abc", "3": "def", "4": "ghi",
        "5": "jkl", "6": "mno", "7": "pqrs",
        "8": "tuv", "9": "wxyz"
    }
    result = []

    def backtrack(idx, current):
        if idx == len(digits):
            result.append("".join(current))
            return

        for letter in phone[digits[idx]]:
            current.append(letter)
            backtrack(idx + 1, current)
            current.pop()

    backtrack(0, [])
    return result`,
    javascript: `function letterCombinations(digits) {
    if (!digits.length) return [];

    const phone = {
        "2": "abc", "3": "def", "4": "ghi",
        "5": "jkl", "6": "mno", "7": "pqrs",
        "8": "tuv", "9": "wxyz"
    };
    const result = [];

    function backtrack(idx, current) {
        if (idx === digits.length) {
            result.push(current.join(""));
            return;
        }

        for (const letter of phone[digits[idx]]) {
            current.push(letter);
            backtrack(idx + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);
    return result;
}`,
    java: `public static List<String> letterCombinations(String digits) {
    List<String> result = new ArrayList<>();
    if (digits.length() == 0) return result;

    Map<Character, String> phone = new HashMap<>();
    phone.put('2', "abc");
    phone.put('3', "def");
    phone.put('4', "ghi");
    phone.put('5', "jkl");
    phone.put('6', "mno");
    phone.put('7', "pqrs");
    phone.put('8', "tuv");
    phone.put('9', "wxyz");

    backtrack(0, new StringBuilder(), digits, phone, result);
    return result;
}

private static void backtrack(int idx, StringBuilder current, String digits, Map<Character, String> phone, List<String> result) {
    if (idx == digits.length()) {
        result.add(current.toString());
        return;
    }

    String letters = phone.get(digits.charAt(idx));
    for (char c : letters.toCharArray()) {
        current.append(c);
        backtrack(idx + 1, current, digits, phone, result);
        current.deleteCharAt(current.length() - 1);
    }
}`,
  },
  defaultInput: '23',
  run: runLetterCombinations,
  optimalApproachName: 'Backtracking (DFS)',
  approaches: [
    {
      id: 'iterative-bfs-product',
      name: 'Iterative BFS Product',
      timeComplexity: 'O(4ⁿ)',
      spaceComplexity: 'O(4ⁿ)',
      description:
        'Builds the answer breadth-first: keep a list of all partial combinations and, for each digit, replace it with every combination extended by every letter — a running cross product with no recursion.',
      code: {
        python: `def letterCombinations(digits):
    if not digits:
        return []

    phone = {
        "2": "abc", "3": "def", "4": "ghi",
        "5": "jkl", "6": "mno", "7": "pqrs",
        "8": "tuv", "9": "wxyz"
    }
    result = [""]

    for digit in digits:
        result = [combo + letter
                  for combo in result
                  for letter in phone[digit]]

    return result`,
        javascript: `function letterCombinations(digits) {
    if (!digits.length) return [];

    const phone = {
        "2": "abc", "3": "def", "4": "ghi",
        "5": "jkl", "6": "mno", "7": "pqrs",
        "8": "tuv", "9": "wxyz"
    };
    let result = [""];

    for (const digit of digits) {
        const next = [];
        for (const combo of result)
            for (const letter of phone[digit])
                next.push(combo + letter);
        result = next;
    }

    return result;
}`,
        java: `public static List<String> letterCombinations(String digits) {
    List<String> result = new ArrayList<>();
    if (digits.length() == 0) return result;

    Map<Character, String> phone = new HashMap<>();
    phone.put('2', "abc"); phone.put('3', "def");
    phone.put('4', "ghi"); phone.put('5', "jkl");
    phone.put('6', "mno"); phone.put('7', "pqrs");
    phone.put('8', "tuv"); phone.put('9', "wxyz");

    result.add("");
    for (char digit : digits.toCharArray()) {
        List<String> next = new ArrayList<>();
        for (String combo : result)
            for (char letter : phone.get(digit).toCharArray())
                next.add(combo + letter);
        result = next;
    }
    return result;
}`,
      },
      run: runLetterCombinationsBFS,
      lineExplanations: {
        python: {
          1: 'Define function taking digit string',
          2: 'Guard: no digits means no combinations',
          3: 'Return empty list',
          5: 'Define phone digit-to-letter mapping',
          6: 'Map digits 2-4 to letters',
          7: 'Map digits 5-7 to letters',
          8: 'Map digits 8-9 to letters',
          9: 'Close mapping dict',
          10: 'Layer 0: the single empty combination',
          12: 'Each digit expands the whole layer at once',
          13: 'Rebuild the list: every existing combo ...',
          14: '... paired with ...',
          15: "... every letter of this digit's mapping",
          17: 'After the last digit the layer is the full answer',
        },
        javascript: {
          1: 'Define function taking digit string',
          2: 'Guard: no digits means no combinations',
          4: 'Define phone digit-to-letter mapping',
          5: 'Map digits 2-4 to letters',
          6: 'Map digits 5-7 to letters',
          7: 'Map digits 8-9 to letters',
          8: 'Close mapping object',
          9: 'Layer 0: the single empty combination',
          11: 'Each digit expands the whole layer at once',
          12: 'Collect the next, longer layer',
          13: 'Every existing combo ...',
          14: "... paired with every letter of this digit's mapping",
          15: 'Append the extended combination',
          16: 'Swap in the completed layer',
          19: 'After the last digit the layer is the full answer',
        },
        java: {
          1: 'Define method returning list of strings',
          2: 'Initialize result list',
          3: 'Guard: no digits means no combinations',
          5: 'Create phone digit-to-letter mapping',
          6: 'Map digits 2 and 3',
          7: 'Map digits 4 and 5',
          8: 'Map digits 6 and 7',
          9: 'Map digits 8 and 9',
          11: 'Layer 0: the single empty combination',
          12: 'Each digit expands the whole layer at once',
          13: 'Collect the next, longer layer',
          14: 'Every existing combo ...',
          15: "... paired with every letter of this digit's mapping",
          16: 'Append the extended combination',
          17: 'Swap in the completed layer',
          19: 'After the last digit the layer is the full answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking digit string',
      2: 'Return empty list if no digits given',
      3: 'Return empty list',
      5: 'Define phone digit-to-letter mapping',
      6: 'Map digits 2-5 to letters',
      7: 'Map digits 6-9 to letters',
      8: 'Close mapping dict',
      9: 'Initialize result list',
      11: 'Define recursive backtrack helper',
      12: 'Base case: processed all digits',
      13: 'Join current letters and add to result',
      14: 'Return after saving combination',
      16: 'Iterate over letters for current digit',
      17: 'Choose: add letter to current combo',
      18: 'Recurse to next digit position',
      19: 'Unchoose: remove last letter (backtrack)',
      21: 'Start backtracking from first digit',
      22: 'Return all letter combinations',
    },
    javascript: {
      1: 'Define function taking digit string',
      2: 'Return empty array if no digits',
      4: 'Define phone digit-to-letter mapping',
      5: 'Map digits 2-5 to letters',
      6: 'Map digits 6-9 to letters',
      7: 'Close mapping object',
      8: 'Close mapping block',
      9: 'Initialize result array',
      11: 'Define recursive backtrack helper',
      12: 'Base case: processed all digits',
      13: 'Join current letters and add to result',
      14: 'Return after saving combination',
      17: 'Iterate over letters for current digit',
      18: 'Choose: add letter to current combo',
      19: 'Recurse to next digit position',
      20: 'Unchoose: remove last letter (backtrack)',
      24: 'Start backtracking from first digit',
      25: 'Return all letter combinations',
    },
    java: {
      1: 'Define method returning list of strings',
      2: 'Initialize result list',
      3: 'Return empty list if no digits',
      5: 'Create phone digit-to-letter mapping',
      6: 'Map digit 2 to "abc"',
      7: 'Map digit 3 to "def"',
      8: 'Map digit 4 to "ghi"',
      9: 'Map digit 5 to "jkl"',
      10: 'Map digit 6 to "mno"',
      11: 'Map digit 7 to "pqrs"',
      12: 'Map digit 8 to "tuv"',
      13: 'Map digit 9 to "wxyz"',
      15: 'Start backtracking from first digit',
      16: 'Return all letter combinations',
      19: 'Define recursive backtrack helper',
      20: 'Base case: processed all digits',
      21: 'Add current string to result',
      22: 'Return after saving combination',
      25: 'Get letters for current digit',
      26: 'Iterate over each letter',
      27: 'Choose: append letter to current',
      28: 'Recurse to next digit position',
      29: 'Unchoose: remove last char (backtrack)',
    },
  },
};
