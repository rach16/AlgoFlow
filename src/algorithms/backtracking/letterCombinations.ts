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
};
