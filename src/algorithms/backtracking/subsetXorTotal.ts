import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSubsetXorTotal(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;
  let total = 0;
  let leaves = 0;

  const path: number[] = [];

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { currentXor: 0, total: 0, subsetsSeen: 0 },
      result: [],
    },
    highlights: [],
    message: `Every one of the 2^${nums.length} = ${1 << nums.length} subsets of [${nums.join(', ')}] has an XOR total. Sum them all — each element is either in or out`,
    codeLine: 1,
  });

  function backtrack(i: number, currentXor: number) {
    if (i === nums.length) {
      total += currentXor;
      leaves++;

      push({
        state: {
          nums: [...nums],
          stack: [...path],
          hashMap: { currentXor, total, subsetsSeen: leaves },
          result: [],
        },
        highlights: path.map((v) => nums.indexOf(v)),
        message: `Subset [${path.join(', ')}] complete — XOR total is ${currentXor}, running sum ${total - currentXor} + ${currentXor} = ${total}`,
        codeLine: 7,
        action: 'found',
      });
      return;
    }

    // Include nums[i]
    path.push(nums[i]);
    push({
      state: {
        nums: [...nums],
        stack: [...path],
        hashMap: { currentXor: currentXor ^ nums[i], total, subsetsSeen: leaves },
        result: [],
      },
      highlights: [i],
      message: `Include nums[${i}] = ${nums[i]}: XOR ${currentXor} ^ ${nums[i]} = ${currentXor ^ nums[i]}`,
      codeLine: 11,
      action: 'push',
    });
    backtrack(i + 1, currentXor ^ nums[i]);
    path.pop();

    // Exclude nums[i]
    push({
      state: {
        nums: [...nums],
        stack: [...path],
        hashMap: { currentXor, total, subsetsSeen: leaves },
        result: [],
      },
      highlights: [i],
      message: `Exclude nums[${i}] = ${nums[i]}: XOR stays ${currentXor} — XOR-ing nothing changes nothing`,
      codeLine: 13,
      action: 'pop',
    });
    backtrack(i + 1, currentXor);
  }

  backtrack(0, 0);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { total, subsetsSeen: leaves },
      result: total,
    },
    highlights: [],
    message: `All ${leaves} subsets visited — sum of XOR totals = ${total}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''}`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

function runSubsetXorTotalBitMath(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const width = Math.max(4, ...nums.map((v) => v.toString(2).length));
  const bin = (v: number) => v.toString(2).padStart(width, '0');

  let orAll = 0;

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { orAll: bin(0), n },
      result: [],
    },
    highlights: [],
    message: `No search needed. Fix one bit position b: if ANY number has bit b set, exactly half of the 2^${n} subsets contain an odd count of them, so bit b is set in 2^${n - 1} of the XOR totals`,
    codeLine: 1,
  });

  for (let i = 0; i < n; i++) {
    orAll |= nums[i];
    steps.push({
      state: {
        nums: [...nums],
        stack: [],
        hashMap: { orAll: bin(orAll), num: bin(nums[i]), n },
        result: [],
      },
      highlights: [i],
      message: `OR in nums[${i}] = ${nums[i]} (${bin(nums[i])}): orAll = ${bin(orAll)} = ${orAll} — this marks every bit position that appears anywhere in the array`,
      codeLine: 4,
      action: 'visit',
    });
  }

  const setBits = bin(orAll).split('').filter((b) => b === '1').length;

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { orAll: bin(orAll), setBits, half: 1 << (n - 1) },
      result: [],
    },
    highlights: [],
    message: `orAll = ${bin(orAll)} has ${setBits} live bit${setBits !== 1 ? 's' : ''}. Each contributes its value 2^${n} / 2 = ${1 << (n - 1)} times, so the answer is orAll × ${1 << (n - 1)}`,
    codeLine: 7,
    action: 'compare',
  });

  const answer = orAll << (n - 1);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { orAll: bin(orAll), shift: n - 1 },
      result: answer,
    },
    highlights: [],
    message: `Multiplying by 2^${n - 1} is just a shift: ${orAll} << ${n - 1} = ${answer}. Same answer as the exponential search, in O(n)`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const subsetXorTotal: Algorithm = {
  id: 'subset-xor-total',
  name: 'Sum of All Subset XOR Totals',
  category: 'Backtracking',
  difficulty: 'Easy',
  timeComplexity: 'O(2ⁿ)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — include or exclude each element',
  description:
    'The XOR total of an array is the bitwise XOR of all its elements (0 for the empty array). Given an array nums, return the sum of the XOR totals of every subset of nums. Subsets are counted with multiplicity, so all 2^n of them are summed.',
  problemUrl: 'https://leetcode.com/problems/sum-of-all-subset-xor-totals/',
  code: {
    python: `def subsetXORSum(nums):
    total = 0

    def backtrack(i, current_xor):
        nonlocal total
        if i == len(nums):
            total += current_xor
            return

        # Include nums[i] in the subset
        backtrack(i + 1, current_xor ^ nums[i])
        # Exclude nums[i] from the subset
        backtrack(i + 1, current_xor)

    backtrack(0, 0)
    return total`,
    javascript: `function subsetXORSum(nums) {
    let total = 0;

    function backtrack(i, currentXor) {
        if (i === nums.length) {
            total += currentXor;
            return;
        }

        // Include nums[i] in the subset
        backtrack(i + 1, currentXor ^ nums[i]);
        // Exclude nums[i] from the subset
        backtrack(i + 1, currentXor);
    }

    backtrack(0, 0);
    return total;
}`,
    java: `public static int subsetXORSum(int[] nums) {
    return backtrack(nums, 0, 0);
}

private static int backtrack(int[] nums, int i, int currentXor) {
    if (i == nums.length) {
        return currentXor;
    }
    // Include nums[i], then exclude nums[i]
    return backtrack(nums, i + 1, currentXor ^ nums[i])
         + backtrack(nums, i + 1, currentXor);
}`,
  },
  defaultInput: [5, 1, 6],
  run: runSubsetXorTotal,
  optimalApproachName: 'Backtracking (Include / Exclude)',
  approaches: [
    {
      id: 'bit-math-or',
      name: 'Bit Math (OR then Shift)',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Skips the search entirely: any bit that appears in at least one number ends up set in exactly half of the 2^n subset XORs, so the answer collapses to (OR of all numbers) << (n - 1).',
      code: {
        python: `def subsetXORSum(nums):
    or_all = 0
    for num in nums:
        or_all |= num

    # Every bit set in or_all is set in exactly
    # half of the 2^n subset XOR totals
    return or_all << (len(nums) - 1)`,
        javascript: `function subsetXORSum(nums) {
    let orAll = 0;
    for (const num of nums) {
        orAll |= num;
    }

    // Every bit set in orAll is set in exactly
    // half of the 2^n subset XOR totals
    return orAll << (nums.length - 1);
}`,
        java: `public static int subsetXORSum(int[] nums) {
    int orAll = 0;
    for (int num : nums) {
        orAll |= num;
    }

    // Every bit set in orAll is set in exactly
    // half of the 2^n subset XOR totals
    return orAll << (nums.length - 1);
}`,
      },
      run: runSubsetXorTotalBitMath,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Accumulator for the OR of every number',
          3: 'Visit each number once',
          4: 'OR marks every bit position that appears anywhere',
          6: 'Counting argument: fix a bit position that appears somewhere',
          7: 'Half of all subsets XOR to a 1 there, so each live bit counts 2^(n-1) times',
          8: 'Shifting left by n-1 multiplies by that count',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Accumulator for the OR of every number',
          3: 'Visit each number once',
          4: 'OR marks every bit position that appears anywhere',
          7: 'Counting argument: fix a bit position that appears somewhere',
          8: 'Half of all subsets XOR to a 1 there, so each live bit counts 2^(n-1) times',
          9: 'Shifting left by n-1 multiplies by that count',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'Accumulator for the OR of every number',
          3: 'Visit each number once',
          4: 'OR marks every bit position that appears anywhere',
          7: 'Counting argument: fix a bit position that appears somewhere',
          8: 'Half of all subsets XOR to a 1 there, so each live bit counts 2^(n-1) times',
          9: 'Shifting left by n-1 multiplies by that count',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Running sum of every subset XOR total',
      4: 'Recurse on index i carrying the XOR built so far',
      5: 'Allow the helper to update the outer total',
      6: 'Base case: a decision was made for every element',
      7: 'This leaf is one complete subset — add its XOR total',
      8: 'Return to explore the sibling branch',
      10: 'First branch: this element joins the subset',
      11: 'XOR it into the running value and move on',
      12: 'Second branch: this element is left out',
      13: 'Carry the XOR forward unchanged',
      15: 'Start at index 0 with an XOR of 0 (empty subset)',
      16: 'Return the accumulated sum over all 2^n subsets',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Running sum of every subset XOR total',
      4: 'Recurse on index i carrying the XOR built so far',
      5: 'Base case: a decision was made for every element',
      6: 'This leaf is one complete subset — add its XOR total',
      7: 'Return to explore the sibling branch',
      10: 'First branch: this element joins the subset',
      11: 'XOR it into the running value and move on',
      12: 'Second branch: this element is left out',
      13: 'Carry the XOR forward unchanged',
      16: 'Start at index 0 with an XOR of 0 (empty subset)',
      17: 'Return the accumulated sum over all 2^n subsets',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Kick off the recursion at index 0 with XOR 0',
      5: 'Helper returns the sum over the subtree instead of mutating state',
      6: 'Base case: a decision was made for every element',
      7: 'A completed subset contributes its own XOR total',
      9: 'Two branches, summed together',
      10: 'Branch one: XOR this element in',
      11: 'Branch two: skip it and carry the XOR forward',
    },
  },
};
