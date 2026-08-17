import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMoveZeroesTwoPass(input: unknown): AlgorithmStep[] {
  const nums = [...(input as number[])];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `Two-pass variant: first OVERWRITE the front with every non-zero in order, then pad the tail with zeros. Still O(1) extra space — just writes instead of swaps.`,
    codeLine: 1,
  });

  if (n === 0) {
    steps.push({
      state: { nums: [], result: [] },
      highlights: [],
      message: `Empty array — both loops are skipped, so the empty array is already the answer.`,
      codeLine: 10,
      action: 'found',
    });
    return steps;
  }

  let insert = 0;
  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    pointers: { insert: 0 },
    message: `insert = 0 — the next slot to fill. It never runs ahead of the read index, so we can never clobber a value we have not read yet.`,
    codeLine: 2,
  });

  for (let read = 0; read < n; read++) {
    const value = nums[read];
    if (value === 0) {
      steps.push({
        state: { nums: [...nums] },
        highlights: [],
        secondary: [read],
        pointers: { read, insert },
        message: `nums[${read}] = 0 — skip it entirely. Pass 1 never writes zeros; insert stays at ${insert}.`,
        codeLine: 4,
        action: 'compare',
      });
      continue;
    }

    nums[insert] = value;
    steps.push({
      state: { nums: [...nums] },
      highlights: [insert],
      secondary: read !== insert ? [read] : [],
      pointers: { read, insert },
      message:
        read === insert
          ? `nums[${read}] = ${value} is non-zero and insert == read, so writing it back to index ${insert} changes nothing. Now [${nums.join(', ')}]`
          : `nums[${read}] = ${value} is non-zero — copy it forward to index ${insert}. Index ${read} keeps a stale duplicate for now; pass 2 will bury it. Now [${nums.join(', ')}]`,
      codeLine: 5,
      action: 'insert',
    });
    insert++;
  }

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    pointers: { insert },
    message: `Pass 1 done: ${insert} non-zero value(s) packed into indices 0..${insert - 1}. Everything from index ${insert} on is stale and must become 0.`,
    codeLine: 7,
  });

  if (insert === n) {
    steps.push({
      state: { nums: [...nums], result: [...nums] },
      highlights: nums.map((_, i) => i),
      message: `No zeroes at all — insert reached the end, so the second loop never runs. Answer: [${nums.join(', ')}]`,
      codeLine: 10,
      action: 'found',
    });
    return steps;
  }

  while (insert < n) {
    nums[insert] = 0;
    steps.push({
      state: { nums: [...nums] },
      highlights: [insert],
      pointers: { insert },
      message: `Pad the tail: nums[${insert}] = 0. Now [${nums.join(', ')}]`,
      codeLine: 8,
      action: 'insert',
    });
    insert++;
  }

  steps.push({
    state: { nums: [...nums], result: [...nums] },
    highlights: nums.map((_, i) => i),
    message: `Tail padded. Answer: [${nums.join(', ')}]. Same O(n) time and O(1) space as the swap version, but it writes up to 2n times instead of swapping only when needed.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runMoveZeroes(input: unknown): AlgorithmStep[] {
  const nums = [...(input as number[])];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `Push every 0 to the end while keeping the non-zero values in their original order — in place, O(1) extra space. Edge cases an interviewer will probe: empty array, single element, all zeroes, no zeroes. One loop covers all four.`,
    codeLine: 1,
  });

  if (n === 0) {
    steps.push({
      state: { nums: [], result: [] },
      highlights: [],
      message: `Empty array — the loop body never runs and we return the array untouched. No special-case branch needed.`,
      codeLine: 7,
      action: 'found',
    });
    return steps;
  }

  let write = 0;
  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    pointers: { write: 0 },
    message: `write = 0. Invariant: everything left of write is a non-zero value in original order, and write never passes read — so the swap is always safe.`,
    codeLine: 2,
  });

  for (let read = 0; read < n; read++) {
    if (nums[read] === 0) {
      steps.push({
        state: { nums: [...nums] },
        highlights: [],
        secondary: [read],
        pointers: { read, write },
        message: `nums[${read}] = 0 — do nothing. write stays at ${write}, reserving that slot for the next non-zero we find.`,
        codeLine: 4,
        action: 'compare',
      });
      continue;
    }

    const value = nums[read];
    if (write === read) {
      steps.push({
        state: { nums: [...nums] },
        highlights: [read],
        pointers: { read, write },
        message: `nums[${read}] = ${value} is non-zero and write == read — the swap is a harmless no-op, the value is already in place. (This is the whole "no zeroes yet" case.)`,
        codeLine: 5,
        action: 'compare',
      });
    } else {
      nums[write] = value;
      nums[read] = 0;
      steps.push({
        state: { nums: [...nums] },
        highlights: [write],
        secondary: [read],
        pointers: { read, write },
        message: `Swap nums[${write}] and nums[${read}]: ${value} moves forward and the 0 it displaced lands at index ${read}. Now [${nums.join(', ')}]`,
        codeLine: 5,
        action: 'swap',
      });
    }

    write++;
    steps.push({
      state: { nums: [...nums] },
      highlights: [],
      pointers: { read, write },
      message: `Advance write to ${write} — indices 0..${write - 1} are now the packed non-zero prefix.`,
      codeLine: 6,
      action: 'visit',
    });
  }

  steps.push({
    state: { nums: [...nums], result: [...nums] },
    highlights: nums.map((_, i) => i),
    message: `Done in one pass: [${nums.join(', ')}]. ${write} non-zero value(s) in original order, then ${n - write} zero(es). O(n) time, O(1) space — no second array anywhere.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const moveZeroes: Algorithm = {
  id: 'move-zeroes',
  name: 'Move Zeroes',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — write index packs non-zeros, swap buries the zeros',
  description:
    'Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. You must do this in place without making a copy of the array.',
  problemUrl: 'https://leetcode.com/problems/move-zeroes/',
  code: {
    python: `def moveZeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
    return nums`,
    javascript: `function moveZeroes(nums) {
    let write = 0;
    for (let read = 0; read < nums.length; read++) {
        if (nums[read] !== 0) {
            [nums[write], nums[read]] = [nums[read], nums[write]];
            write++;
        }
    }
    return nums;
}`,
    java: `public static void moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) {
            int tmp = nums[write];
            nums[write] = nums[read];
            nums[read] = tmp;
            write++;
        }
    }
}`,
  },
  defaultInput: [0, 1, 0, 3, 12],
  run: runMoveZeroes,
  optimalApproachName: 'Two Pointers (Swap)',
  approaches: [
    {
      id: 'count-then-fill',
      name: 'Overwrite + Pad Tail',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Two passes instead of swaps: pass 1 copies every non-zero to the front, pass 2 fills the remaining tail with zeros — simpler to reason about, but it writes up to 2n times.',
      code: {
        python: `def moveZeroes(nums):
    insert = 0
    for num in nums:
        if num != 0:
            nums[insert] = num
            insert += 1
    while insert < len(nums):
        nums[insert] = 0
        insert += 1
    return nums`,
        javascript: `function moveZeroes(nums) {
    let insert = 0;
    for (const num of nums) {
        if (num !== 0) {
            nums[insert] = num;
            insert++;
        }
    }
    while (insert < nums.length) {
        nums[insert] = 0;
        insert++;
    }
    return nums;
}`,
        java: `public static void moveZeroes(int[] nums) {
    int insert = 0;
    for (int num : nums) {
        if (num != 0) {
            nums[insert] = num;
            insert++;
        }
    }
    while (insert < nums.length) {
        nums[insert] = 0;
        insert++;
    }
}`,
      },
      run: runMoveZeroesTwoPass,
      lineExplanations: {
        python: {
          1: 'Define function taking the array to compact in place',
          2: 'insert = next front slot to fill',
          3: 'Pass 1: read every value once, in order',
          4: 'Only non-zero values get written',
          5: 'Copy it to the front (order preserved)',
          6: 'Advance the write slot',
          7: 'Pass 2: every remaining slot must be zero',
          8: 'Overwrite the stale leftovers with 0',
          9: 'Advance to the next tail slot',
          10: 'Array is now compacted in place',
        },
        javascript: {
          1: 'Define function taking the array to compact in place',
          2: 'insert = next front slot to fill',
          3: 'Pass 1: read every value once, in order',
          4: 'Only non-zero values get written',
          5: 'Copy it to the front (order preserved)',
          6: 'Advance the write slot',
          9: 'Pass 2: every remaining slot must be zero',
          10: 'Overwrite the stale leftovers with 0',
          11: 'Advance to the next tail slot',
          13: 'Array is now compacted in place',
        },
        java: {
          1: 'Define method taking the array to compact in place',
          2: 'insert = next front slot to fill',
          3: 'Pass 1: read every value once, in order',
          4: 'Only non-zero values get written',
          5: 'Copy it to the front (order preserved)',
          6: 'Advance the write slot',
          9: 'Pass 2: every remaining slot must be zero',
          10: 'Overwrite the stale leftovers with 0',
          11: 'Advance to the next tail slot',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function — the array is modified in place, nothing is copied',
      2: 'write marks the boundary of the packed non-zero prefix',
      3: 'read scans every index exactly once',
      4: 'Zeros are simply skipped, which is what pushes them right',
      5: 'Swap the non-zero forward; the displaced zero lands at read',
      6: 'Grow the non-zero prefix by one',
      7: 'Handles empty, single-element, all-zero and no-zero inputs with no extra branches',
    },
    javascript: {
      1: 'Define function — the array is modified in place, nothing is copied',
      2: 'write marks the boundary of the packed non-zero prefix',
      3: 'read scans every index exactly once',
      4: 'Zeros are simply skipped, which is what pushes them right',
      5: 'Destructuring swap: non-zero forward, zero back to read',
      6: 'Grow the non-zero prefix by one',
      10: 'Handles empty, single-element, all-zero and no-zero inputs with no extra branches',
    },
    java: {
      1: 'Define method — the array is modified in place, nothing is copied',
      2: 'write marks the boundary of the packed non-zero prefix',
      3: 'read scans every index exactly once',
      4: 'Zeros are simply skipped, which is what pushes them right',
      5: 'Classic three-line swap via a temp variable',
      6: 'Non-zero value moves to the write slot',
      7: 'The displaced zero moves back to the read slot',
      8: 'Grow the non-zero prefix by one',
    },
  },
};
