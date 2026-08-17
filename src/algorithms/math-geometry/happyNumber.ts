import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runHappyNumber(input: unknown): AlgorithmStep[] {
  let n = input as number;
  const steps: AlgorithmStep[] = [];
  const seen: Record<string, number> = {};

  steps.push({
    state: {
      hashMap: {},
      count: n,
      result: `Checking if ${n} is a happy number...`,
    },
    highlights: [],
    message: `Is ${n} a happy number? Sum of squares of digits until we get 1 or a cycle.`,
    codeLine: 1,
  });

  function sumOfSquares(num: number): number {
    let total = 0;
    while (num > 0) {
      const digit = num % 10;
      total += digit * digit;
      num = Math.floor(num / 10);
    }
    return total;
  }

  let iteration = 0;
  const maxIterations = 20;

  while (n !== 1 && iteration < maxIterations) {
    if (seen[n] !== undefined) {
      steps.push({
        state: {
          hashMap: { ...seen },
          count: n,
          result: `Cycle detected! ${n} was seen before.`,
        },
        highlights: [],
        message: `${n} already seen! Cycle detected. Not a happy number.`,
        codeLine: 3,
        action: 'found',
      });

      steps.push({
        state: {
          hashMap: { ...seen },
          count: n,
          result: 'false - Not a happy number',
        },
        highlights: [],
        message: `Result: false. ${input} is not a happy number.`,
        codeLine: 7,
        action: 'found',
      });
      return steps;
    }

    seen[n] = iteration;
    const next = sumOfSquares(n);

    const digits = String(n).split('').map(Number);
    const squaresStr = digits.map(d => `${d}^2=${d * d}`).join(' + ');

    steps.push({
      state: {
        hashMap: { ...seen },
        count: next,
        result: `${n} -> ${squaresStr} = ${next}`,
      },
      highlights: [],
      message: `${n}: ${squaresStr} = ${next}. Add ${n} to seen set.`,
      codeLine: 4,
      action: 'visit',
    });

    n = next;
    iteration++;
  }

  if (n === 1) {
    seen[1] = iteration;

    steps.push({
      state: {
        hashMap: { ...seen },
        count: 1,
        result: 'true - Happy number!',
      },
      highlights: [],
      message: `Reached 1! ${input} is a happy number.`,
      codeLine: 7,
      action: 'found',
    });
  }

  return steps;
}

function runHappyNumberFloyd(input: unknown): AlgorithmStep[] {
  const start = input as number;
  const steps: AlgorithmStep[] = [];

  function sumOfSquares(num: number): number {
    let total = 0;
    while (num > 0) {
      const digit = num % 10;
      total += digit * digit;
      num = Math.floor(num / 10);
    }
    return total;
  }

  function squaresBreakdown(num: number): string {
    return String(num)
      .split('')
      .map(d => `${d}^2=${Number(d) * Number(d)}`)
      .join(' + ');
  }

  steps.push({
    state: {
      count: start,
      result: `Checking if ${start} is a happy number...`,
    },
    highlights: [],
    message: `Floyd's tortoise and hare: slow takes one digit-square step, fast takes two. If the sequence loops, they must meet inside the cycle — no set needed, O(1) space.`,
    codeLine: 1,
  });

  let slow = start;
  let fast = sumOfSquares(start);

  steps.push({
    state: {
      count: fast,
      result: `slow = ${slow}, fast = ${fast}`,
    },
    highlights: [],
    message: `Initialize: slow = ${start}, fast = one step ahead = ${squaresBreakdown(start)} = ${fast}.`,
    codeLine: 9,
    action: 'visit',
  });

  let iteration = 0;
  const maxIterations = 25;

  while (fast !== 1 && slow !== fast && iteration < maxIterations) {
    const prevSlow = slow;
    slow = sumOfSquares(slow);

    steps.push({
      state: {
        count: slow,
        result: `slow -> ${slow}, fast = ${fast}`,
      },
      highlights: [],
      message: `Slow moves one step: ${squaresBreakdown(prevSlow)} = ${slow}.`,
      codeLine: 11,
      action: 'visit',
    });

    const fastMid = sumOfSquares(fast);
    fast = sumOfSquares(fastMid);

    steps.push({
      state: {
        count: fast,
        result: `slow = ${slow}, fast -> ${fast}`,
      },
      highlights: [],
      message: `Fast moves two steps (via ${fastMid}) to ${fast}. ${fast === 1 ? 'Fast reached 1!' : slow === fast ? 'Slow and fast met — a cycle exists!' : `slow=${slow}, fast=${fast}: keep going.`}`,
      codeLine: 12,
      action: slow === fast || fast === 1 ? 'found' : 'compare',
    });

    iteration++;
  }

  if (fast === 1) {
    steps.push({
      state: {
        count: 1,
        result: 'true - Happy number!',
      },
      highlights: [],
      message: `fast reached 1, so the sequence converges. ${start} is a happy number.`,
      codeLine: 13,
      action: 'found',
    });
  } else {
    steps.push({
      state: {
        count: fast,
        result: 'false - Not a happy number',
      },
      highlights: [],
      message: `slow and fast met at ${fast} without hitting 1 — the digit-square sequence is stuck in a cycle. ${start} is not happy.`,
      codeLine: 13,
      action: 'found',
    });
  }

  return steps;
}

export const happyNumber: Algorithm = {
  id: 'happy-number',
  name: 'Happy Number',
  category: 'Math & Geometry',
  difficulty: 'Easy',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Fast & Slow Pointers — detect cycle in digit-square sum',
  description:
    'Write an algorithm to determine if a number n is happy. A happy number is a number defined by the following process: Starting with any positive integer, replace the number by the sum of the squares of its digits, and repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1.',
  problemUrl: 'https://leetcode.com/problems/happy-number/',
  code: {
    python: `def isHappy(n):
    seen = set()
    while n != 1:
        if n in seen:
            return False
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    return True`,
    javascript: `function isHappy(n) {
    const seen = new Set();
    while (n !== 1) {
        if (seen.has(n)) return false;
        seen.add(n);
        let sum = 0;
        while (n > 0) {
            const d = n % 10;
            sum += d * d;
            n = Math.floor(n / 10);
        }
        n = sum;
    }
    return true;
}`,
    java: `public static boolean isHappy(int n) {
    Set<Integer> seen = new HashSet<>();
    while (n != 1 && !seen.contains(n)) {
        seen.add(n);
        int sum = 0;
        while (n > 0) {
            int digit = n % 10;
            sum += digit * digit;
            n /= 10;
        }
        n = sum;
    }
    return n == 1;
}`,
  },
  defaultInput: 19,
  run: runHappyNumber,
  optimalApproachName: 'Hash Set',
  approaches: [
    {
      id: 'floyd-cycle-detection',
      name: "Floyd's Cycle Detection",
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of storing every seen number in a set, run slow (one step) and fast (two steps) pointers over the digit-square sequence — if it loops, they must meet, giving true O(1) space.',
      code: {
        python: `def isHappy(n):
    def sum_squares(num):
        total = 0
        while num > 0:
            digit = num % 10
            total += digit * digit
            num //= 10
        return total
    slow, fast = n, sum_squares(n)
    while fast != 1 and slow != fast:
        slow = sum_squares(slow)
        fast = sum_squares(sum_squares(fast))
    return fast == 1`,
        javascript: `function isHappy(n) {
    const sumSquares = (num) => {
        let total = 0;
        while (num > 0) {
            const d = num % 10;
            total += d * d;
            num = Math.floor(num / 10);
        }
        return total;
    };
    let slow = n, fast = sumSquares(n);
    while (fast !== 1 && slow !== fast) {
        slow = sumSquares(slow);
        fast = sumSquares(sumSquares(fast));
    }
    return fast === 1;
}`,
        java: `public static boolean isHappy(int n) {
    int slow = n, fast = sumSquares(n);
    while (fast != 1 && slow != fast) {
        slow = sumSquares(slow);
        fast = sumSquares(sumSquares(fast));
    }
    return fast == 1;
}

private static int sumSquares(int num) {
    int total = 0;
    while (num > 0) {
        int digit = num % 10;
        total += digit * digit;
        num /= 10;
    }
    return total;
}`,
      },
      run: runHappyNumberFloyd,
      lineExplanations: {
        python: {
          1: 'Define function taking integer n',
          2: 'Helper: sum of squared digits',
          3: 'Accumulator for the digit-square sum',
          4: 'Process every digit',
          5: 'Extract last digit',
          6: 'Add its square to the total',
          7: 'Drop the last digit',
          8: 'Return the digit-square sum',
          9: 'Slow starts at n, fast one step ahead',
          10: 'Loop until fast hits 1 or the pointers meet',
          11: 'Slow advances one step',
          12: 'Fast advances two steps',
          13: 'Happy iff fast reached 1 (not a cycle meeting)',
        },
        javascript: {
          1: 'Define function taking integer n',
          2: 'Helper: sum of squared digits',
          3: 'Accumulator for the digit-square sum',
          4: 'Process every digit',
          5: 'Extract last digit',
          6: 'Add its square to the total',
          7: 'Drop the last digit',
          9: 'Return the digit-square sum',
          11: 'Slow starts at n, fast one step ahead',
          12: 'Loop until fast hits 1 or the pointers meet',
          13: 'Slow advances one step',
          14: 'Fast advances two steps',
          16: 'Happy iff fast reached 1 (not a cycle meeting)',
        },
        java: {
          1: 'Define method taking integer n',
          2: 'Slow starts at n, fast one step ahead',
          3: 'Loop until fast hits 1 or the pointers meet',
          4: 'Slow advances one step',
          5: 'Fast advances two steps',
          7: 'Happy iff fast reached 1 (not a cycle meeting)',
          10: 'Helper: sum of squared digits',
          11: 'Accumulator for the digit-square sum',
          12: 'Process every digit',
          13: 'Extract last digit',
          14: 'Add its square to the total',
          15: 'Drop the last digit',
          17: 'Return the digit-square sum',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking integer n',
      2: 'Track seen numbers to detect cycles',
      3: 'Loop until we reach 1 (happy) or cycle',
      4: 'If n was already seen, we have a cycle',
      5: 'Not happy, return False',
      6: 'Add current n to the seen set',
      7: 'Replace n with sum of squared digits',
      8: 'Reached 1, so n is a happy number',
    },
    javascript: {
      1: 'Define function taking integer n',
      2: 'Track seen numbers to detect cycles',
      3: 'Loop until we reach 1 (happy) or cycle',
      4: 'If n was already seen, return false',
      5: 'Add current n to the seen set',
      6: 'Compute sum of squared digits',
      7: 'Loop through each digit of n',
      8: 'Extract last digit',
      9: 'Add square of digit to sum',
      10: 'Remove last digit from n',
      12: 'Replace n with the digit-square sum',
      14: 'Reached 1, so n is a happy number',
    },
    java: {
      1: 'Define method taking integer n',
      2: 'Track seen numbers to detect cycles',
      3: 'Loop while not 1 and not in a cycle',
      4: 'Add current n to the seen set',
      5: 'Compute sum of squared digits',
      6: 'Loop through each digit of n',
      7: 'Extract last digit',
      8: 'Add square of digit to sum',
      9: 'Remove last digit from n',
      11: 'Replace n with the digit-square sum',
      13: 'Return true if we reached 1',
    },
  },
};
