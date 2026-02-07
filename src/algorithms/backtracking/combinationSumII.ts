import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCombinationSumII(input: unknown): AlgorithmStep[] {
  const { candidates, target } = input as { candidates: number[]; target: number };
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];
  const nums = [...candidates].sort((a, b) => a - b);

  steps.push({
    state: { nums: [...nums], stack: [], hashMap: { target, remaining: target }, result: [] },
    highlights: [],
    message: `Find unique combinations in [${nums.join(', ')}] that sum to ${target} (each number used once)`,
    codeLine: 1,
  });

  function backtrack(start: number, current: number[], remaining: number) {
    if (remaining === 0) {
      result.push([...current]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining: 0, sum: target },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: Array.from({ length: nums.length }, (_, i) => i),
        message: `Found combination [${current.join(', ')}] = ${target} (total: ${result.length})`,
        codeLine: 5,
        action: 'found',
      });
      return;
    }

    for (let i = start; i < nums.length; i++) {
      // Skip duplicates at the same recursion level
      if (i > start && nums[i] === nums[i - 1]) {
        steps.push({
          state: {
            nums: [...nums],
            stack: [...current],
            hashMap: { target, remaining },
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          secondary: [i - 1],
          message: `Skip duplicate: nums[${i}] = ${nums[i]} == nums[${i - 1}]`,
          codeLine: 9,
        });
        continue;
      }

      // Prune: if candidate exceeds remaining, stop
      if (nums[i] > remaining) {
        steps.push({
          state: {
            nums: [...nums],
            stack: [...current],
            hashMap: { target, remaining, candidate: nums[i] },
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          message: `nums[${i}] = ${nums[i]} > remaining ${remaining}, prune`,
          codeLine: 11,
        });
        break;
      }

      // Choose
      current.push(nums[i]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining: remaining - nums[i], sum: target - remaining + nums[i] },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Add ${nums[i]} -> [${current.join(', ')}], remaining: ${remaining - nums[i]}`,
        codeLine: 13,
        action: 'push',
      });

      // Explore: i + 1 (each element used at most once)
      backtrack(i + 1, current, remaining - nums[i]);

      // Unchoose
      const removed = current.pop()!;

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Backtrack: remove ${removed} -> [${current.join(', ')}], remaining: ${remaining}`,
        codeLine: 15,
        action: 'pop',
      });
    }
  }

  backtrack(0, [], target);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { target },
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! Found ${result.length} unique combinations that sum to ${target}`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const combinationSumII: Algorithm = {
  id: 'combination-sum-ii',
  name: 'Combination Sum II',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(2ⁿ)',
  spaceComplexity: 'O(target)',
  pattern: 'Backtracking — sort, use once, skip duplicates at same level',
  description:
    'Given a collection of candidate numbers and a target number, find all unique combinations where the candidate numbers sum to the target. Each number may only be used once. Sort first and skip duplicates at the same recursion level.',
  problemUrl: 'https://leetcode.com/problems/combination-sum-ii/',
  code: {
    python: `def combinationSum2(candidates, target):
    result = []
    candidates.sort()

    def backtrack(start, current, remaining):
        if remaining == 0:
            result.append(current[:])
            return

        for i in range(start, len(candidates)):
            # Skip duplicates at same level
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            # Prune
            if candidates[i] > remaining:
                break
            current.append(candidates[i])
            backtrack(i + 1, current, remaining - candidates[i])
            current.pop()

    backtrack(0, [], target)
    return result`,
    javascript: `function combinationSum2(candidates, target) {
    const result = [];
    candidates.sort((a, b) => a - b);

    function backtrack(start, current, remaining) {
        if (remaining === 0) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < candidates.length; i++) {
            // Skip duplicates at same level
            if (i > start && candidates[i] === candidates[i - 1])
                continue;
            // Prune
            if (candidates[i] > remaining) break;
            current.push(candidates[i]);
            backtrack(i + 1, current, remaining - candidates[i]);
            current.pop();
        }
    }

    backtrack(0, [], target);
    return result;
}`,
    java: `public static List<List<Integer>> combinationSum2(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(candidates);
    backtrack(0, new ArrayList<>(), target, candidates, result);
    return result;
}

private static void backtrack(int start, List<Integer> current, int remaining, int[] candidates, List<List<Integer>> result) {
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = start; i < candidates.length; i++) {
        if (i > start && candidates[i] == candidates[i - 1]) continue;
        if (candidates[i] > remaining) break;
        current.add(candidates[i]);
        backtrack(i + 1, current, remaining - candidates[i], candidates, result);
        current.remove(current.size() - 1);
    }
}`,
  },
  defaultInput: { candidates: [10, 1, 2, 7, 6, 1, 5], target: 8 },
  run: runCombinationSumII,
};
