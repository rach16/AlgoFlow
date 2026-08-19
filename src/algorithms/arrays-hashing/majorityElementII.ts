import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MajorityElementIIInput {
  nums: number[];
}

function runMajorityElementIIHashMap(input: unknown): AlgorithmStep[] {
  const { nums } = input as MajorityElementIIInput;
  const steps: AlgorithmStep[] = [];
  const count: Record<string, number> = {};
  const threshold = Math.floor(nums.length / 3);

  steps.push({
    state: { nums: [...nums], count: {} },
    highlights: [],
    message: `Straightforward route: tally every value, then keep the ones appearing more than ⌊${nums.length}/3⌋ = ${threshold} times`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    const key = String(nums[i]);
    count[key] = (count[key] || 0) + 1;
    steps.push({
      state: { nums: [...nums], count: { ...count } },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${nums[i]} → count is now ${count[key]}`,
      codeLine: 4,
      action: 'insert',
    });
  }

  const result: number[] = [];
  for (const key of Object.keys(count)) {
    const value = Number(key);
    const passes = count[key] > threshold;
    if (passes) result.push(value);
    steps.push({
      state: { nums: [...nums], count: { ...count } },
      highlights: nums.map((v, idx) => (v === value ? idx : -1)).filter((idx) => idx >= 0),
      message: passes
        ? `${value} appears ${count[key]} times > ${threshold} — it qualifies`
        : `${value} appears only ${count[key]} times, not more than ${threshold} — drop it`,
      codeLine: 5,
      action: passes ? 'found' : 'compare',
    });
  }

  steps.push({
    state: { nums: [...nums], count: { ...count }, result },
    highlights: [],
    message: `Answer: [${result.join(', ')}] — correct, but this costs O(n) extra memory for the tally`,
    codeLine: 5,
    action: 'found',
  });

  return steps;
}

function runMajorityElementII(input: unknown): AlgorithmStep[] {
  const { nums } = input as MajorityElementIIInput;
  const steps: AlgorithmStep[] = [];
  const threshold = Math.floor(nums.length / 3);

  let cand1: number | null = null;
  let cand2: number | null = null;
  let count1 = 0;
  let count2 = 0;

  const tally = () => ({
    [`cand1=${cand1 === null ? '-' : cand1}`]: count1,
    [`cand2=${cand2 === null ? '-' : cand2}`]: count2,
  });

  steps.push({
    state: { nums: [...nums], count: tally() },
    highlights: [],
    message: `At most 2 values can appear more than n/3 = ${nums.length}/3 times, so 2 Boyer-Moore candidates and 2 counters are enough`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    let message: string;
    let codeLine: number;

    if (num === cand1) {
      count1++;
      message = `${num} matches candidate 1 — vote for it, count1 = ${count1}`;
      codeLine = 6;
    } else if (num === cand2) {
      count2++;
      message = `${num} matches candidate 2 — vote for it, count2 = ${count2}`;
      codeLine = 8;
    } else if (count1 === 0) {
      cand1 = num;
      count1 = 1;
      message = `Slot 1 is empty — adopt ${num} as candidate 1 with count1 = 1`;
      codeLine = 10;
    } else if (count2 === 0) {
      cand2 = num;
      count2 = 1;
      message = `Slot 2 is empty — adopt ${num} as candidate 2 with count2 = 1`;
      codeLine = 12;
    } else {
      count1--;
      count2--;
      message = `${num} matches neither candidate — it cancels one vote from each: count1 = ${count1}, count2 = ${count2}`;
      codeLine = 14;
    }

    steps.push({
      state: { nums: [...nums], count: tally() },
      highlights: [i],
      pointers: { i },
      message,
      codeLine,
      action: codeLine === 14 ? 'delete' : 'visit',
    });
  }

  steps.push({
    state: { nums: [...nums], count: tally() },
    highlights: [],
    message: `Survivors: ${cand1} and ${cand2}. The counters mean nothing now — voting only guarantees a true majority survives, not that survivors are majorities`,
    codeLine: 16,
  });

  const result: number[] = [];
  for (const cand of [cand1, cand2]) {
    if (cand === null) continue;
    const actual = nums.filter((v) => v === cand).length;
    const passes = actual > threshold;
    if (passes) result.push(cand);
    steps.push({
      state: { nums: [...nums], count: tally() },
      highlights: nums.map((v, idx) => (v === cand ? idx : -1)).filter((idx) => idx >= 0),
      message: passes
        ? `Verify ${cand}: it really appears ${actual} times > ${threshold} — keep it`
        : `Verify ${cand}: only ${actual} occurrences, not more than ${threshold} — reject it`,
      codeLine: 18,
      action: passes ? 'found' : 'compare',
    });
  }

  steps.push({
    state: { nums: [...nums], count: tally(), result },
    highlights: [],
    message: `Answer: [${result.join(', ')}] — found in two passes with only O(1) extra space`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

export const majorityElementII: Algorithm = {
  id: 'majority-element-ii',
  name: 'Majority Element II',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Boyer-Moore Voting — two candidates cancel out the rest',
  description:
    'Given an integer array nums of size n, return every element that appears more than ⌊n/3⌋ times. There can be at most two such elements. Solve it in linear time and O(1) extra space.',
  problemUrl: 'https://leetcode.com/problems/majority-element-ii/',
  code: {
    python: `def majorityElement(nums):
    cand1, cand2 = None, None
    count1, count2 = 0, 0
    for num in nums:
        if num == cand1:
            count1 += 1
        elif num == cand2:
            count2 += 1
        elif count1 == 0:
            cand1, count1 = num, 1
        elif count2 == 0:
            cand2, count2 = num, 1
        else:
            count1 -= 1
            count2 -= 1
    res = []
    for c in (cand1, cand2):
        if c is not None and nums.count(c) > len(nums) // 3:
            res.append(c)
    return res`,
    javascript: `function majorityElement(nums) {
    let cand1 = null, cand2 = null, count1 = 0, count2 = 0;
    for (const num of nums) {
        if (num === cand1) count1++;
        else if (num === cand2) count2++;
        else if (count1 === 0) { cand1 = num; count1 = 1; }
        else if (count2 === 0) { cand2 = num; count2 = 1; }
        else { count1--; count2--; }
    }
    const res = [];
    for (const c of [cand1, cand2]) {
        if (c === null) continue;
        const total = nums.filter((x) => x === c).length;
        if (total > Math.floor(nums.length / 3)) res.push(c);
    }
    return res;
}`,
    java: `public static List<Integer> majorityElement(int[] nums) {
    Integer cand1 = null, cand2 = null;
    int count1 = 0, count2 = 0;
    for (int num : nums) {
        if (cand1 != null && num == cand1) count1++;
        else if (cand2 != null && num == cand2) count2++;
        else if (count1 == 0) { cand1 = num; count1 = 1; }
        else if (count2 == 0) { cand2 = num; count2 = 1; }
        else { count1--; count2--; }
    }
    List<Integer> res = new ArrayList<>();
    for (Integer c : new Integer[] { cand1, cand2 }) {
        if (c == null) continue;
        int total = 0;
        for (int num : nums) if (num == c) total++;
        if (total > nums.length / 3) res.add(c);
    }
    return res;
}`,
  },
  defaultInput: { nums: [1, 1, 1, 3, 3, 2, 2, 2] },
  run: runMajorityElementII,
  optimalApproachName: 'Boyer-Moore Voting',
  approaches: [
    {
      id: 'hash-map-count',
      name: 'Hash Map Counting',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Counts every distinct value in a hash map and filters at the end — same linear time, but it gives up the O(1) space that makes Boyer-Moore worth learning.',
      code: {
        python: `def majorityElement(nums):
    count = {}
    for num in nums:
        count[num] = count.get(num, 0) + 1
    return [num for num, c in count.items() if c > len(nums) // 3]`,
        javascript: `function majorityElement(nums) {
    const count = new Map();
    for (const num of nums) {
        count.set(num, (count.get(num) || 0) + 1);
    }
    const limit = Math.floor(nums.length / 3);
    return [...count.entries()].filter(([, c]) => c > limit).map(([num]) => num);
}`,
        java: `public static List<Integer> majorityElement(int[] nums) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) {
        count.put(num, count.getOrDefault(num, 0) + 1);
    }
    List<Integer> res = new ArrayList<>();
    for (Map.Entry<Integer, Integer> e : count.entrySet()) {
        if (e.getValue() > nums.length / 3) res.add(e.getKey());
    }
    return res;
}`,
      },
      run: runMajorityElementIIHashMap,
      lineExplanations: {
        python: {
          1: 'Define function taking the array',
          2: 'Value → occurrence count',
          3: 'One pass over every element',
          4: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
          5: 'Keep values whose tally beats ⌊n/3⌋',
        },
        javascript: {
          1: 'Define function taking the array',
          2: 'Value → occurrence count',
          3: 'One pass over every element',
          4: 'Bump the tally for this value',
          6: 'Anything strictly above this many occurrences qualifies',
          7: 'Filter the tallies and return the surviving values',
        },
        java: {
          1: 'Define function taking the array',
          2: 'Value → occurrence count',
          3: 'One pass over every element',
          4: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
          6: 'Walk the finished tally',
          7: 'Keep values whose tally beats n/3',
          9: 'Return the qualifying values',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the array',
      2: 'Two candidate slots — at most two values can exceed n/3',
      3: 'One vote counter per candidate',
      4: 'First pass: the voting round',
      5: 'Element agrees with candidate 1?',
      6: 'Add a vote',
      7: 'Element agrees with candidate 2?',
      8: 'Add a vote',
      9: 'Slot 1 is free?',
      10: 'Adopt this element as candidate 1',
      11: 'Slot 2 is free?',
      12: 'Adopt this element as candidate 2',
      13: 'Element disagrees with both candidates',
      14: 'It cancels one vote from candidate 1...',
      15: '...and one from candidate 2',
      16: 'Second pass: the survivors still have to be verified',
      17: 'Check each surviving candidate',
      18: 'Does it truly occur more than ⌊n/3⌋ times?',
      19: 'Keep it',
      20: 'Return the verified majority elements',
    },
    javascript: {
      1: 'Define function taking the array',
      2: 'Two candidate slots and their vote counters',
      3: 'First pass: the voting round',
      4: 'Element agrees with candidate 1 — add a vote',
      5: 'Element agrees with candidate 2 — add a vote',
      6: 'Slot 1 is free — adopt this element',
      7: 'Slot 2 is free — adopt this element',
      8: 'Disagrees with both — cancel one vote from each',
      10: 'Second pass: the survivors still have to be verified',
      11: 'Check each surviving candidate',
      13: 'Count its real occurrences',
      14: 'Keep it only if it truly exceeds n/3',
      16: 'Return the verified majority elements',
    },
    java: {
      1: 'Define function taking the array',
      2: 'Two candidate slots — null means empty',
      3: 'One vote counter per candidate',
      4: 'First pass: the voting round',
      5: 'Element agrees with candidate 1 — add a vote',
      6: 'Element agrees with candidate 2 — add a vote',
      7: 'Slot 1 is free — adopt this element',
      8: 'Slot 2 is free — adopt this element',
      9: 'Disagrees with both — cancel one vote from each',
      11: 'Second pass: the survivors still have to be verified',
      12: 'Check each surviving candidate',
      15: 'Count its real occurrences',
      16: 'Keep it only if it truly exceeds n/3',
      18: 'Return the verified majority elements',
    },
  },
};
