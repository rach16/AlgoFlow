import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MergeTripletsInput {
  triplets: number[][];
  target: number[];
}

function runMergeTriplets(input: unknown): AlgorithmStep[] {
  const { triplets, target } = input as MergeTripletsInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      nums: target,
      result: `Target: [${target.join(', ')}]`,
    },
    highlights: [],
    message: `Can we merge triplets to form target [${target.join(', ')}]? Filter out bad triplets first.`,
    codeLine: 1,
  });

  // A triplet is "good" if none of its values exceeds the corresponding target value
  const good = new Set<number>();

  for (let i = 0; i < triplets.length; i++) {
    const [a, b, c] = triplets[i];
    const isGood = a <= target[0] && b <= target[1] && c <= target[2];

    steps.push({
      state: {
        nums: target,
        hashMap: { matched: Array.from(good).map(idx => triplets[idx].toString()) },
        result: `Target: [${target.join(', ')}]`,
      },
      highlights: [],
      message: `Triplet ${i}: [${a}, ${b}, ${c}] - ${isGood ? 'GOOD (no value exceeds target)' : `BAD (${a > target[0] ? `${a} > ${target[0]}` : b > target[1] ? `${b} > ${target[1]}` : `${c} > ${target[2]}`})`}.`,
      codeLine: 3,
      action: isGood ? 'visit' : 'delete',
    });

    if (isGood) {
      // Check which target values this triplet can contribute
      if (a === target[0]) good.add(0);
      if (b === target[1]) good.add(1);
      if (c === target[2]) good.add(2);

      steps.push({
        state: {
          nums: target,
          hashMap: { matchedPositions: Array.from(good) },
          result: `Matched positions: [${Array.from(good).sort().join(', ')}]`,
        },
        highlights: Array.from(good),
        message: `[${a}, ${b}, ${c}] matches target at positions: [${Array.from(good).sort().join(', ')}]. Need all 3 positions.`,
        codeLine: 5,
        action: 'found',
      });
    }
  }

  const canForm = good.has(0) && good.has(1) && good.has(2);

  steps.push({
    state: {
      nums: target,
      hashMap: { matchedPositions: Array.from(good) },
      result: canForm ? 'true' : 'false',
    },
    highlights: canForm ? [0, 1, 2] : [],
    message: `Done! ${canForm ? 'All 3 target positions can be matched.' : `Only matched positions [${Array.from(good).sort().join(', ')}].`} Result: ${canForm}.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const mergeTriplets: Algorithm = {
  id: 'merge-triplets',
  name: 'Merge Triplets to Form Target',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — discard triplets with any value > target, check coverage',
  description:
    'A triplet is an array of three integers. You are given a 2D integer array triplets, where triplets[i] = [ai, bi, ci] describes the ith triplet. You are also given an integer array target = [x, y, z] that describes the triplet you want to obtain. To obtain target, you may apply the following operation on triplets any number of times: Choose two indices i and j and update triplets[j] to become [max(ai, aj), max(bi, bj), max(ci, cj)]. Return true if it is possible to obtain the target triplet [x, y, z] as an element of triplets, or false otherwise.',
  problemUrl: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/',
  code: {
    python: `def mergeTriplets(triplets, target):
    good = set()

    for t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue
        for i, v in enumerate(t):
            if v == target[i]:
                good.add(i)

    return len(good) == 3`,
    javascript: `function mergeTriplets(triplets, target) {
    const good = new Set();

    for (const t of triplets) {
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2])
            continue;
        for (let i = 0; i < 3; i++) {
            if (t[i] === target[i]) good.add(i);
        }
    }

    return good.size === 3;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: {
    triplets: [[2, 5, 3], [1, 8, 4], [1, 7, 5]],
    target: [2, 7, 5],
  },
  run: runMergeTriplets,
};
