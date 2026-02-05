import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface KokoInput {
  piles: number[];
  h: number;
}

function runKokoEatingBananas(input: unknown): AlgorithmStep[] {
  const { piles, h } = input as KokoInput;
  const steps: AlgorithmStep[] = [];

  // Initial state
  steps.push({
    state: { nums: [...piles], h },
    highlights: [],
    message: `Koko must eat all bananas in ${h} hours. Piles: [${piles.join(', ')}]`,
    codeLine: 1,
  });

  let left = 1;
  let right = Math.max(...piles);
  let result = right;

  steps.push({
    state: { nums: [...piles], h, left, right, result },
    highlights: [],
    pointers: { left, right },
    message: `Binary search for minimum speed: left=${left}, right=${right}`,
    codeLine: 3,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      state: { nums: [...piles], h, left, right, speed: mid, result },
      highlights: [],
      pointers: { left, right },
      message: `Try speed k=${mid} bananas/hour`,
      codeLine: 5,
      action: 'visit',
    });

    // Calculate total hours needed at this speed
    let totalHours = 0;
    for (let i = 0; i < piles.length; i++) {
      totalHours += Math.ceil(piles[i] / mid);

      steps.push({
        state: {
          nums: [...piles],
          h,
          left,
          right,
          speed: mid,
          result,
          hoursUsed: totalHours,
          currentPile: i,
        },
        highlights: [i],
        pointers: { currentPile: i },
        message: `Pile ${i}: ceil(${piles[i]}/${mid}) = ${Math.ceil(piles[i] / mid)} hours. Total so far: ${totalHours}`,
        codeLine: 7,
        action: 'compare',
      });
    }

    steps.push({
      state: {
        nums: [...piles],
        h,
        left,
        right,
        speed: mid,
        result,
        hoursUsed: totalHours,
      },
      highlights: [],
      pointers: { left, right },
      message: `At speed ${mid}: total hours = ${totalHours}, allowed = ${h}`,
      codeLine: 8,
      action: 'compare',
    });

    if (totalHours <= h) {
      // This speed works, try slower (smaller k)
      result = mid;

      steps.push({
        state: { nums: [...piles], h, left, right, speed: mid, result, hoursUsed: totalHours },
        highlights: [],
        pointers: { left, right },
        message: `${totalHours} <= ${h} — speed ${mid} works! Update result=${mid}, try slower`,
        codeLine: 10,
        action: 'found',
      });

      right = mid - 1;
    } else {
      // Too slow, need to eat faster
      steps.push({
        state: { nums: [...piles], h, left, right, speed: mid, result, hoursUsed: totalHours },
        highlights: [],
        pointers: { left, right },
        message: `${totalHours} > ${h} — too slow! Need faster speed`,
        codeLine: 12,
        action: 'compare',
      });

      left = mid + 1;
    }
  }

  // Final result
  steps.push({
    state: { nums: [...piles], h, result },
    highlights: [],
    message: `Minimum eating speed: ${result} bananas/hour`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

export const kokoEatingBananas: Algorithm = {
  id: 'koko-eating-bananas',
  name: 'Koko Eating Bananas',
  category: 'Binary Search',
  difficulty: 'Medium',
  timeComplexity: 'O(n log m)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search on Answer — min speed that finishes in h hours',
  description:
    'Koko loves to eat bananas. There are n piles of bananas, the ith pile has piles[i] bananas. The guards have gone and will come back in h hours. Koko can decide her bananas-per-hour eating speed of k. Return the minimum integer k such that she can eat all the bananas within h hours.',
  problemUrl: 'https://leetcode.com/problems/koko-eating-bananas/',
  code: {
    python: `def minEatingSpeed(piles, h):
    left, right = 1, max(piles)
    result = right

    while left <= right:
        k = (left + right) // 2
        hours = 0
        for p in piles:
            hours += math.ceil(p / k)

        if hours <= h:
            result = k
            right = k - 1
        else:
            left = k + 1

    return result`,
    javascript: `function minEatingSpeed(piles, h) {
    let left = 1;
    let right = Math.max(...piles);
    let result = right;

    while (left <= right) {
        const k = Math.floor((left + right) / 2);
        let hours = 0;
        for (const p of piles) {
            hours += Math.ceil(p / k);
        }

        if (hours <= h) {
            result = k;
            right = k - 1;
        } else {
            left = k + 1;
        }
    }

    return result;
}`,
  },
  defaultInput: { piles: [3, 6, 7, 11], h: 8 },
  run: runKokoEatingBananas,
};
