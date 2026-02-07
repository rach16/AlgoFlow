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
    java: `// Java implementation coming soon`,
  },
  defaultInput: 19,
  run: runHappyNumber,
};
