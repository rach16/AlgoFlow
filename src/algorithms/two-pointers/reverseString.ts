import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runReverseString(input: unknown): AlgorithmStep[] {
  const chars = [...(input as string[])];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { chars: [...chars] },
    highlights: [],
    message: `Reverse "${chars.join('')}" in place — no second array allowed, so we swap characters toward each other`,
    codeLine: 1,
  });

  let left = 0;
  let right = chars.length - 1;

  steps.push({
    state: { chars: [...chars] },
    highlights: [left, right],
    pointers: { left, right },
    message: `Put left at 0 and right at ${right}. Index i must end up holding whatever index ${right} - i holds now — that is exactly what swapping the ends does`,
    codeLine: 2,
  });

  while (left < right) {
    steps.push({
      state: { chars: [...chars] },
      highlights: [left, right],
      pointers: { left, right },
      message: `left=${left} < right=${right}, so this pair still needs swapping: '${chars[left]}' ↔ '${chars[right]}'`,
      codeLine: 4,
      action: 'compare',
    });

    const a = chars[left];
    const b = chars[right];
    chars[left] = b;
    chars[right] = a;

    steps.push({
      state: { chars: [...chars] },
      highlights: [left, right],
      pointers: { left, right },
      message: `Swapped: index ${left} now holds '${b}' and index ${right} now holds '${a}'. Both ends are final — they never move again`,
      codeLine: 5,
      action: 'swap',
    });

    left++;
    right--;

    if (left < right) {
      steps.push({
        state: { chars: [...chars] },
        highlights: [left, right],
        pointers: { left, right },
        message: `Step both pointers inward: left=${left}, right=${right}. The outer ${left} characters on each side are already correct`,
        codeLine: 6,
      });
    } else {
      steps.push({
        state: { chars: [...chars] },
        highlights: left === right ? [left] : [],
        pointers: left === right ? { left, right } : {},
        message:
          left === right
            ? `left=${left} meets right=${right} — a middle character in an odd-length string is its own mirror, so it stays put`
            : `left=${left} passed right=${right} — every pair has been swapped`,
        codeLine: 6,
      });
    }
  }

  steps.push({
    state: { chars: [...chars], result: [...chars] },
    highlights: [],
    message: `Done in ${Math.floor((input as string[]).length / 2)} swaps: "${chars.join('')}". Only two integer pointers were needed, so this is O(1) extra space`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runReverseStringRecursive(input: unknown): AlgorithmStep[] {
  const chars = [...(input as string[])];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { chars: [...chars] },
    highlights: [],
    message: `Same swaps, expressed recursively: helper(left, right) swaps the outer pair, then hands the shorter inner problem to itself`,
    codeLine: 1,
  });

  let depth = 0;

  const helper = (left: number, right: number) => {
    steps.push({
      state: { chars: [...chars] },
      highlights: left <= right ? [left, right] : [],
      pointers: { left, right },
      message: `Call helper(${left}, ${right}) at depth ${depth}`,
      codeLine: 2,
    });

    if (left >= right) {
      steps.push({
        state: { chars: [...chars] },
        highlights: left === right ? [left] : [],
        pointers: { left, right },
        message:
          left === right
            ? `Base case: left === right, a single middle character is already in place — unwind the stack`
            : `Base case: left ${left} >= right ${right}, nothing left to swap — unwind the stack`,
        codeLine: 3,
      });
      return;
    }

    const a = chars[left];
    const b = chars[right];
    chars[left] = b;
    chars[right] = a;

    steps.push({
      state: { chars: [...chars] },
      highlights: [left, right],
      pointers: { left, right },
      message: `Swap the outer pair of this sub-problem: '${a}' ↔ '${b}'`,
      codeLine: 5,
      action: 'swap',
    });

    depth++;
    steps.push({
      state: { chars: [...chars] },
      highlights: [],
      pointers: { left: left + 1, right: right - 1 },
      message: `Recurse on the inner slice [${left + 1}, ${right - 1}] — each call keeps a frame on the stack, which is why this costs O(n) space instead of O(1)`,
      codeLine: 6,
    });

    helper(left + 1, right - 1);
    depth--;
  };

  helper(0, chars.length - 1);

  steps.push({
    state: { chars: [...chars], result: [...chars] },
    highlights: [],
    message: `All frames returned: "${chars.join('')}". Identical answer to the loop, but O(n) call-stack space — and deep inputs can overflow it`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const reverseString: Algorithm = {
  id: 'reverse-string',
  name: 'Reverse String',
  category: 'Two Pointers',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — converge from both ends',
  description:
    'Write a function that reverses a string, given as an array of characters. You must do it in place with O(1) extra memory.',
  problemUrl: 'https://leetcode.com/problems/reverse-string/',
  code: {
    python: `def reverseString(s):
    left, right = 0, len(s) - 1

    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1

    return s`,
    javascript: `function reverseString(s) {
    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }

    return s;
}`,
    java: `public static char[] reverseString(char[] s) {
    int left = 0;
    int right = s.length - 1;

    while (left < right) {
        char temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        left++;
        right--;
    }

    return s;
}`,
  },
  defaultInput: ['h', 'e', 'l', 'l', 'o'],
  run: runReverseString,
  optimalApproachName: 'Two Pointers',
  approaches: [
    {
      id: 'recursion',
      name: 'Recursion',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Swap the outer pair, then recurse on the inner slice — the same swaps as the loop, but each frame costs stack space, so it is O(n) memory instead of O(1).',
      code: {
        python: `def reverseString(s):
    def helper(left, right):
        if left >= right:
            return
        s[left], s[right] = s[right], s[left]
        helper(left + 1, right - 1)

    helper(0, len(s) - 1)
    return s`,
        javascript: `function reverseString(s) {
    function helper(left, right) {
        if (left >= right) return;
        [s[left], s[right]] = [s[right], s[left]];
        helper(left + 1, right - 1);
    }

    helper(0, s.length - 1);
    return s;
}`,
        java: `public static char[] reverseString(char[] s) {
    helper(s, 0, s.length - 1);
    return s;
}

private static void helper(char[] s, int left, int right) {
    if (left >= right) return;
    char temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    helper(s, left + 1, right - 1);
}`,
      },
      run: runReverseStringRecursive,
      lineExplanations: {
        python: {
          1: 'Define function taking the character array',
          2: 'Inner helper handles one sub-problem: the slice from left to right',
          3: 'Base case — pointers met or crossed, nothing left to swap',
          4: 'Return and let the stack unwind',
          5: 'Swap the outer pair of this sub-problem',
          6: 'Recurse on the inner slice, one character narrower on each side',
          8: 'Kick off the recursion on the whole array',
          9: 'The array was mutated in place, so return it',
        },
        javascript: {
          1: 'Define function taking the character array',
          2: 'Inner helper handles one sub-problem: the slice from left to right',
          3: 'Base case — pointers met or crossed, nothing left to swap',
          4: 'Swap the outer pair via array destructuring',
          5: 'Recurse on the inner slice, one character narrower on each side',
          8: 'Kick off the recursion on the whole array',
          9: 'The array was mutated in place, so return it',
        },
        java: {
          1: 'Define function taking the character array',
          2: 'Kick off the recursion on the whole array',
          3: 'The array was mutated in place, so return it',
          6: 'Helper handles one sub-problem: the slice from left to right',
          7: 'Base case — pointers met or crossed, nothing left to swap',
          8: 'Stash the left character before overwriting it',
          9: 'Copy the right character into the left slot',
          10: 'Copy the stashed character into the right slot',
          11: 'Recurse on the inner slice, one character narrower on each side',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the character array',
      2: 'Place pointers at the first and last characters',
      4: 'Keep swapping while the pointers have not met',
      5: 'Swap the two ends — Python does this in one tuple assignment',
      6: 'Move the left pointer inward',
      7: 'Move the right pointer inward',
      9: 'The array was mutated in place, so return it',
    },
    javascript: {
      1: 'Define function taking the character array',
      2: 'Left pointer starts at the first character',
      3: 'Right pointer starts at the last character',
      5: 'Keep swapping while the pointers have not met',
      6: 'Swap the two ends via array destructuring',
      7: 'Move the left pointer inward',
      8: 'Move the right pointer inward',
      11: 'The array was mutated in place, so return it',
    },
    java: {
      1: 'Define function taking the character array',
      2: 'Left pointer starts at the first character',
      3: 'Right pointer starts at the last character',
      5: 'Keep swapping while the pointers have not met',
      6: 'Stash the left character before overwriting it',
      7: 'Copy the right character into the left slot',
      8: 'Copy the stashed character into the right slot',
      9: 'Move the left pointer inward',
      10: 'Move the right pointer inward',
      13: 'The array was mutated in place, so return it',
    },
  },
};
