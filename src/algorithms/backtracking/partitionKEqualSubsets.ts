import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPartitionKEqualSubsets(input: unknown): AlgorithmStep[] {
  const { nums: raw, k } = input as { nums: number[]; k: number };
  const steps: AlgorithmStep[] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const total = raw.reduce((a, b) => a + b, 0);

  if (total % k !== 0) {
    steps.push({
      state: { nums: [...raw], stack: [], hashMap: { total, k }, result: false },
      highlights: [],
      message: `Total ${total} is not divisible by k = ${k} — equal subsets are impossible`,
      codeLine: 4,
      action: 'found',
    });
    return steps;
  }

  const target = total / k;
  const nums = [...raw].sort((a, b) => b - a);
  const used = new Array(nums.length).fill(false);
  const closed: number[][] = [];

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { total, k, target, bucketsLeft: k },
      result: [],
    },
    highlights: [],
    message: `Sum ${total} split ${k} ways means every subset must total ${target}. Sorted descending to [${nums.join(', ')}] and filled ONE bucket at a time — only when a bucket closes does the next one open`,
    codeLine: 7,
  });

  if (nums[0] > target) {
    steps.push({
      state: { nums: [...nums], stack: [], hashMap: { target }, result: false },
      highlights: [0],
      message: `Largest value ${nums[0]} already exceeds the target ${target} — impossible`,
      codeLine: 9,
      action: 'found',
    });
    return steps;
  }

  const bucket: number[] = [];

  function backtrack(bucketsLeft: number, start: number, current: number): boolean {
    if (bucketsLeft === 0) {
      push({
        state: {
          nums: [...nums],
          stack: [],
          hashMap: { target, bucketsLeft: 0, closed: closed.length },
          result: true,
        },
        highlights: [],
        message: `All ${k} buckets closed at ${target} each: ${closed.map((b) => `[${b.join('+')}]`).join(' ')}`,
        codeLine: 15,
        action: 'found',
      });
      return true;
    }

    if (current === target) {
      closed.push([...bucket]);
      bucket.length = 0;

      push({
        state: {
          nums: [...nums],
          stack: [],
          hashMap: { target, bucketsLeft: bucketsLeft - 1, closed: closed.length },
          result: [],
        },
        highlights: [],
        message: `Bucket #${closed.length} = [${closed[closed.length - 1].join(' + ')}] hits ${target} exactly. Close it and restart the scan from index 0 for bucket #${closed.length + 1}`,
        codeLine: 18,
        action: 'insert',
      });

      const ok = backtrack(bucketsLeft - 1, 0, 0);
      if (!ok) {
        const reopened = closed.pop()!;
        bucket.push(...reopened);
      }
      return ok;
    }

    for (let i = start; i < nums.length; i++) {
      if (used[i] || current + nums[i] > target) {
        push({
          state: {
            nums: [...nums],
            stack: [...bucket],
            hashMap: { target, current, bucketsLeft },
            result: [],
          },
          highlights: [i],
          message: used[i]
            ? `nums[${i}] = ${nums[i]} is already in a bucket — skip`
            : `nums[${i}] = ${nums[i]} would push this bucket to ${current + nums[i]} > ${target} — skip`,
          codeLine: 22,
        });
        continue;
      }

      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        push({
          state: {
            nums: [...nums],
            stack: [...bucket],
            hashMap: { target, current, bucketsLeft },
            result: [],
          },
          highlights: [i],
          secondary: [i - 1],
          message: `nums[${i}] = ${nums[i]} duplicates the still-free nums[${i - 1}] — that twin already explored this exact branch. Skip`,
          codeLine: 24,
        });
        continue;
      }

      used[i] = true;
      bucket.push(nums[i]);

      push({
        state: {
          nums: [...nums],
          stack: [...bucket],
          hashMap: { target, current: current + nums[i], bucketsLeft },
          result: [],
        },
        highlights: [i],
        message: `Drop nums[${i}] = ${nums[i]} into bucket #${closed.length + 1}: ${current} → ${current + nums[i]} of ${target}`,
        codeLine: 26,
        action: 'push',
      });

      if (backtrack(bucketsLeft, i + 1, current + nums[i])) return true;

      used[i] = false;
      bucket.pop();

      push({
        state: {
          nums: [...nums],
          stack: [...bucket],
          hashMap: { target, current, bucketsLeft },
          result: [],
        },
        highlights: [i],
        message: `Dead end below — pull nums[${i}] = ${nums[i]} back out, bucket returns to ${current}`,
        codeLine: 29,
        action: 'pop',
      });
    }

    return false;
  }

  const ok = backtrack(k, 0, 0);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { target, k, closed: closed.length },
      result: ok,
    },
    highlights: [],
    message: `Answer: ${ok}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''}`,
    codeLine: 33,
    action: 'found',
  });

  return steps;
}

function runPartitionKEqualSubsetsBitmaskDP(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as { nums: number[]; k: number };
  const steps: AlgorithmStep[] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const n = nums.length;
  const total = nums.reduce((a, b) => a + b, 0);

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  if (total % k !== 0) {
    steps.push({
      state: { nums: [...nums], hashMap: { total, k }, result: false },
      highlights: [],
      message: `Total ${total} is not divisible by k = ${k} — equal subsets are impossible`,
      codeLine: 4,
      action: 'found',
    });
    return steps;
  }

  const target = total / k;
  const size = 1 << n;
  const dp: number[] = new Array(size).fill(-1);
  const label = (m: number) => m.toString(2).padStart(n, '0');
  dp[0] = 0;

  steps.push({
    state: {
      nums: [...nums],
      hashMap: { target, masks: size, reachable: 1 },
      result: [],
    },
    highlights: [],
    message: `The order buckets are filled in never matters — only WHICH numbers are spent. So index by subset: dp[mask] = how full the bucket in progress is after using exactly the numbers in mask, or -1 if mask cannot occur. 2^${n} = ${size} masks replace the whole search tree`,
    codeLine: 14,
  });

  let reachable = 1;

  for (let mask = 0; mask < size; mask++) {
    if (dp[mask] === -1) continue;

    const extended: string[] = [];
    let closedBucket = false;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) continue;
      if (dp[mask] + nums[i] > target) continue;
      const next = mask | (1 << i);
      if (dp[next] === -1) reachable++;
      dp[next] = (dp[mask] + nums[i]) % target;
      if (dp[next] === 0) closedBucket = true;
      extended.push(`${nums[i]}→${label(next)}`);
    }

    if (mask === size - 1) continue;

    push({
      state: {
        nums: [...nums],
        hashMap: { mask: label(mask), filled: dp[mask], target, reachable },
        result: [],
      },
      highlights: nums.map((_, i) => i).filter((i) => mask & (1 << i)),
      message:
        extended.length > 0
          ? `mask ${label(mask)} is reachable with ${dp[mask]}/${target} in the open bucket. ${extended.length} number${extended.length !== 1 ? 's' : ''} still fit: ${extended.join(', ')}${closedBucket ? ' — one of them lands exactly on the target, and the modulo silently rolls the bucket over to 0' : ''}`
          : `mask ${label(mask)} sits at ${dp[mask]}/${target} and nothing unused fits in the remaining ${target - dp[mask]} — this state is a dead end, it just never gets extended`,
      codeLine: 25,
      action: extended.length > 0 ? 'insert' : 'visit',
    });
  }

  const ok = dp[size - 1] === 0;

  steps.push({
    state: {
      nums: [...nums],
      hashMap: { full: label(size - 1), value: dp[size - 1], target, reachable },
      result: ok,
    },
    highlights: nums.map((_, i) => i),
    message: `dp[${label(size - 1)}] = ${dp[size - 1]}. Every number is spent and the last bucket closed exactly on ${target}${suppressed > 0 ? ` (${suppressed} mask steps not shown)` : ''}. Answer: ${ok}`,
    codeLine: 27,
    action: 'found',
  });

  return steps;
}

export const partitionKEqualSubsets: Algorithm = {
  id: 'partition-k-equal-subsets',
  name: 'Partition to K Equal Sum Subsets',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(k·2ⁿ)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — assign each item to a bucket, prune early',
  description:
    'Given an integer array nums and an integer k, determine whether it is possible to divide the array into k non-empty subsets whose sums are all equal. Fill one bucket to the target before opening the next, sorting descending so hopeless branches die early.',
  problemUrl: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/',
  code: {
    python: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k != 0:
        return False

    target = total // k
    nums.sort(reverse=True)
    if nums[0] > target:
        return False

    used = [False] * len(nums)

    def backtrack(bucket, start, current):
        if bucket == 0:
            return True
        if current == target:
            # Bucket closed, open the next one
            return backtrack(bucket - 1, 0, 0)

        for i in range(start, len(nums)):
            if used[i] or current + nums[i] > target:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue

            used[i] = True
            if backtrack(bucket, i + 1, current + nums[i]):
                return True
            used[i] = False

        return False

    return backtrack(k, 0, 0)`,
    javascript: `function canPartitionKSubsets(nums, k) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % k !== 0) return false;

    const target = total / k;
    nums.sort((a, b) => b - a);
    if (nums[0] > target) return false;

    const used = new Array(nums.length).fill(false);

    function backtrack(bucket, start, current) {
        if (bucket === 0) return true;
        // Bucket closed, open the next one
        if (current === target) return backtrack(bucket - 1, 0, 0);

        for (let i = start; i < nums.length; i++) {
            if (used[i] || current + nums[i] > target) continue;
            if (i > 0 && nums[i] === nums[i-1] && !used[i-1]) continue;

            used[i] = true;
            if (backtrack(bucket, i + 1, current + nums[i])) return true;
            used[i] = false;
        }

        return false;
    }

    return backtrack(k, 0, 0);
}`,
    java: `public static boolean canPartitionKSubsets(int[] nums, int k) {
    int total = 0;
    for (int num : nums) total += num;
    if (total % k != 0) return false;

    int target = total / k;
    Arrays.sort(nums);
    reverse(nums);
    if (nums[0] > target) return false;

    return backtrack(k, 0, 0, new boolean[nums.length], nums, target);
}

private static boolean backtrack(int bucket, int start, int current,
                                 boolean[] used, int[] nums, int target) {
    if (bucket == 0) return true;
    if (current == target) return backtrack(bucket - 1, 0, 0, used, nums, target);

    for (int i = start; i < nums.length; i++) {
        if (used[i] || current + nums[i] > target) continue;
        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

        used[i] = true;
        if (backtrack(bucket, i + 1, current + nums[i], used, nums, target)) return true;
        used[i] = false;
    }

    return false;
}

private static void reverse(int[] a) {
    for (int l = 0, r = a.length - 1; l < r; l++, r--) {
        int tmp = a[l]; a[l] = a[r]; a[r] = tmp;
    }
}`,
  },
  defaultInput: { nums: [1, 1, 2, 2, 3, 3], k: 3 },
  run: runPartitionKEqualSubsets,
  optimalApproachName: 'Backtracking (Fill One Bucket)',
  approaches: [
    {
      id: 'bitmask-dp',
      name: 'Bitmask DP over Subsets',
      timeComplexity: 'O(n·2ⁿ)',
      spaceComplexity: 'O(2ⁿ)',
      description:
        'Collapses every ordering that spends the same set of numbers into a single dp entry indexed by bit mask, turning the exponential search tree into one linear sweep over 2^n states.',
      code: {
        python: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k != 0:
        return False

    target = total // k
    n = len(nums)
    if max(nums) > target:
        return False

    # dp[mask] = amount already in the bucket in
    # progress, or -1 if mask is unreachable
    dp = [-1] * (1 << n)
    dp[0] = 0

    for mask in range(1 << n):
        if dp[mask] == -1:
            continue
        for i in range(n):
            if mask & (1 << i):
                continue
            if dp[mask] + nums[i] > target:
                continue
            nxt = mask | (1 << i)
            dp[nxt] = (dp[mask] + nums[i]) % target

    return dp[(1 << n) - 1] == 0`,
        javascript: `function canPartitionKSubsets(nums, k) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % k !== 0) return false;

    const target = total / k;
    const n = nums.length;
    if (Math.max(...nums) > target) return false;

    // dp[mask] = amount already in the bucket in
    // progress, or -1 if mask is unreachable
    const dp = new Array(1 << n).fill(-1);
    dp[0] = 0;

    for (let mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] === -1) continue;
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) continue;
            if (dp[mask] + nums[i] > target) continue;
            const next = mask | (1 << i);
            dp[next] = (dp[mask] + nums[i]) % target;
        }
    }

    return dp[(1 << n) - 1] === 0;
}`,
        java: `public static boolean canPartitionKSubsets(int[] nums, int k) {
    int total = 0, maxNum = 0;
    for (int num : nums) { total += num; maxNum = Math.max(maxNum, num); }
    if (total % k != 0) return false;

    int target = total / k;
    int n = nums.length;
    if (maxNum > target) return false;

    // dp[mask] = amount already in the bucket in
    // progress, or -1 if mask is unreachable
    int[] dp = new int[1 << n];
    Arrays.fill(dp, -1);
    dp[0] = 0;

    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] == -1) continue;
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) continue;
            if (dp[mask] + nums[i] > target) continue;
            int next = mask | (1 << i);
            dp[next] = (dp[mask] + nums[i]) % target;
        }
    }

    return dp[(1 << n) - 1] == 0;
}`,
      },
      run: runPartitionKEqualSubsetsBitmaskDP,
      lineExplanations: {
        python: {
          1: 'Define function taking nums and k',
          2: 'Sum of everything to be distributed',
          3: 'k equal subsets need a divisible total',
          4: 'Reject immediately otherwise',
          6: 'Every subset must sum to exactly this',
          7: 'n is the width of the bit mask',
          8: 'A value larger than the target can never be placed',
          9: 'Reject it up front',
          11: 'The key insight: only the SET of spent numbers matters',
          12: '-1 marks a subset that no valid filling can produce',
          13: 'One entry per subset of nums',
          14: 'Spending nothing leaves the first bucket empty',
          16: 'Ascending mask order guarantees sub-states are finished first',
          17: 'Unreachable states cannot extend anything',
          18: 'Skip them',
          19: 'Try adding each unspent number',
          20: 'This bit is already set, the number is spent',
          21: 'Skip it',
          22: 'Adding it would overflow the bucket in progress',
          23: 'Skip it',
          24: 'Mark the number as spent',
          25: 'Modulo closes a full bucket and opens the next at 0',
          27: 'All numbers spent AND the final bucket closed exactly',
        },
        javascript: {
          1: 'Define function taking nums and k',
          2: 'Sum of everything to be distributed',
          3: 'k equal subsets need a divisible total',
          5: 'Every subset must sum to exactly this',
          6: 'n is the width of the bit mask',
          7: 'A value larger than the target can never be placed',
          9: 'The key insight: only the SET of spent numbers matters',
          10: '-1 marks a subset that no valid filling can produce',
          11: 'One entry per subset of nums',
          12: 'Spending nothing leaves the first bucket empty',
          14: 'Ascending mask order guarantees sub-states are finished first',
          15: 'Unreachable states cannot extend anything',
          16: 'Try adding each unspent number',
          17: 'This bit is already set, the number is spent',
          18: 'Adding it would overflow the bucket in progress',
          19: 'Mark the number as spent',
          20: 'Modulo closes a full bucket and opens the next at 0',
          24: 'All numbers spent AND the final bucket closed exactly',
        },
        java: {
          1: 'Define method taking nums and k',
          2: 'Track the total and the largest value together',
          3: 'Single pass over the input',
          4: 'k equal subsets need a divisible total',
          6: 'Every subset must sum to exactly this',
          7: 'n is the width of the bit mask',
          8: 'A value larger than the target can never be placed',
          10: 'The key insight: only the SET of spent numbers matters',
          11: '-1 marks a subset that no valid filling can produce',
          12: 'One entry per subset of nums',
          13: 'Start every state unreachable',
          14: 'Spending nothing leaves the first bucket empty',
          16: 'Ascending mask order guarantees sub-states are finished first',
          17: 'Unreachable states cannot extend anything',
          18: 'Try adding each unspent number',
          19: 'This bit is already set, the number is spent',
          20: 'Adding it would overflow the bucket in progress',
          21: 'Mark the number as spent',
          22: 'Modulo closes a full bucket and opens the next at 0',
          26: 'All numbers spent AND the final bucket closed exactly',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums and k',
      2: 'Sum of everything to be distributed',
      3: 'k equal subsets need a divisible total',
      4: 'Reject immediately otherwise',
      6: 'Every subset must sum to exactly this',
      7: 'Descending order kills hopeless branches near the root',
      8: 'A value larger than the target can never be placed',
      9: 'Reject it up front',
      11: 'Track which values are already committed to a bucket',
      13: 'bucket counts how many are still to be filled',
      14: 'Base case: nothing left to fill',
      15: 'Every bucket reached the target, so the split exists',
      16: 'The current bucket is exactly full',
      17: 'Close it and start the next from scratch',
      18: 'Rescanning from index 0 is what lets a value join any bucket',
      20: 'Try each still-unused value from start onward',
      21: 'Already committed, or it would overflow the bucket',
      22: 'Skip it',
      23: 'Equal to a still-free twin: same branch, already explored',
      24: 'Skip the duplicate',
      26: 'Commit the value to the current bucket',
      27: 'Recurse with the bucket a little fuller',
      28: 'Success anywhere below propagates straight up',
      29: 'Otherwise release the value and try the next',
      31: 'No value completed this bucket — the branch fails',
      33: 'Start with k empty buckets and an empty first bucket',
    },
    javascript: {
      1: 'Define function taking nums and k',
      2: 'Sum of everything to be distributed',
      3: 'k equal subsets need a divisible total',
      5: 'Every subset must sum to exactly this',
      6: 'Descending order kills hopeless branches near the root',
      7: 'A value larger than the target can never be placed',
      9: 'Track which values are already committed to a bucket',
      11: 'bucket counts how many are still to be filled',
      12: 'Base case: every bucket reached the target',
      13: 'The current bucket is exactly full',
      14: 'Close it and rescan from index 0 for the next one',
      16: 'Try each still-unused value from start onward',
      17: 'Already committed, or it would overflow the bucket',
      18: 'Equal to a still-free twin: same branch, already explored',
      20: 'Commit the value to the current bucket',
      21: 'Success anywhere below propagates straight up',
      22: 'Otherwise release the value and try the next',
      25: 'No value completed this bucket — the branch fails',
      28: 'Start with k empty buckets and an empty first bucket',
    },
    java: {
      1: 'Define method taking nums and k',
      2: 'Accumulator for the total',
      3: 'Sum everything',
      4: 'k equal subsets need a divisible total',
      6: 'Every subset must sum to exactly this',
      7: 'Sort ascending, then flip',
      8: 'Descending order kills hopeless branches near the root',
      9: 'A value larger than the target can never be placed',
      11: 'Start with k empty buckets and an empty first bucket',
      14: 'Helper carries the bucket count, scan index and running sum',
      15: 'Plus the shared used[] flags and the target',
      16: 'Base case: every bucket reached the target',
      17: 'Current bucket is full — close it and rescan from index 0',
      19: 'Try each still-unused value from start onward',
      20: 'Already committed, or it would overflow the bucket',
      21: 'Equal to a still-free twin: same branch, already explored',
      23: 'Commit the value to the current bucket',
      24: 'Success anywhere below propagates straight up',
      25: 'Otherwise release the value and try the next',
      28: 'No value completed this bucket — the branch fails',
      31: 'Helper to reverse the sorted array in place',
      32: 'Walk two pointers toward each other',
      33: 'Swap the pair',
    },
  },
};
