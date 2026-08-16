import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLastStoneWeight(input: unknown): AlgorithmStep[] {
  const stones = [...(input as number[])];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...stones] },
    highlights: [],
    message: `Starting stones: [${stones.join(', ')}]. Use a max-heap to always smash the two heaviest.`,
    codeLine: 1,
  });

  // Sort descending to simulate max-heap
  stones.sort((a, b) => b - a);

  steps.push({
    state: { nums: [...stones] },
    highlights: [],
    message: `Heapify (sorted descending): [${stones.join(', ')}]`,
    codeLine: 2,
  });

  let round = 0;
  while (stones.length > 1) {
    round++;
    // Pop two largest
    const first = stones.shift()!;
    const second = stones.shift()!;

    const firstIdx = 0;
    const secondIdx = 1;

    steps.push({
      state: { nums: [first, second, ...stones] },
      highlights: [firstIdx, secondIdx],
      message: `Round ${round}: Pick two heaviest stones: ${first} and ${second}`,
      codeLine: 4,
      action: 'compare',
    });

    if (first === second) {
      steps.push({
        state: { nums: [...stones] },
        highlights: [],
        message: `${first} == ${second}: Both stones destroyed! Remaining: [${stones.join(', ')}]`,
        codeLine: 6,
        action: 'delete',
      });
    } else {
      const remainder = first - second;
      // Insert remainder back in sorted position
      let insertIdx = 0;
      while (insertIdx < stones.length && stones[insertIdx] >= remainder) {
        insertIdx++;
      }
      stones.splice(insertIdx, 0, remainder);

      steps.push({
        state: { nums: [...stones] },
        highlights: [insertIdx],
        message: `${first} - ${second} = ${remainder}: Put ${remainder} back. Stones: [${stones.join(', ')}]`,
        codeLine: 8,
        action: 'insert',
      });
    }
  }

  const result = stones.length === 1 ? stones[0] : 0;

  steps.push({
    state: { nums: [...stones], result },
    highlights: stones.length === 1 ? [0] : [],
    message: stones.length === 1
      ? `One stone remaining: ${stones[0]}. Answer: ${stones[0]}`
      : `No stones remaining. Answer: 0`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runLastStoneWeightSortedList(input: unknown): AlgorithmStep[] {
  const stones = [...(input as number[])];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...stones] },
    highlights: [],
    message: `Starting stones: [${stones.join(', ')}]. Keep the list SORTED ascending — the two heaviest are always the last two elements.`,
    codeLine: 3,
  });

  stones.sort((a, b) => a - b);

  steps.push({
    state: { nums: [...stones] },
    highlights: [],
    message: `Sort ascending: [${stones.join(', ')}]. No heap needed — order is maintained by insertion instead.`,
    codeLine: 4,
  });

  let round = 0;
  while (stones.length > 1) {
    round++;
    const firstIdx = stones.length - 1;
    const secondIdx = stones.length - 2;
    const first = stones[firstIdx];
    const second = stones[secondIdx];

    steps.push({
      state: { nums: [...stones] },
      highlights: [firstIdx, secondIdx],
      message: `Round ${round}: The two heaviest stones sit at the end: ${first} and ${second}. Pop both.`,
      codeLine: 6,
      action: 'pop',
    });

    stones.pop();
    stones.pop();

    if (first === second) {
      steps.push({
        state: { nums: [...stones] },
        highlights: [],
        message: `${first} == ${second}: Both stones destroyed! Remaining: [${stones.join(', ')}]`,
        codeLine: 8,
        action: 'delete',
      });
    } else {
      const remainder = first - second;
      // Binary search for insertion point (bisect.insort)
      let lo = 0;
      let hi = stones.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (stones[mid] < remainder) lo = mid + 1;
        else hi = mid;
      }
      stones.splice(lo, 0, remainder);

      steps.push({
        state: { nums: [...stones] },
        highlights: [lo],
        message: `${first} - ${second} = ${remainder}: binary-insert ${remainder} at index ${lo} to keep the list sorted. Stones: [${stones.join(', ')}]`,
        codeLine: 9,
        action: 'insert',
      });
    }
  }

  const result = stones.length === 1 ? stones[0] : 0;

  steps.push({
    state: { nums: [...stones], result },
    highlights: stones.length === 1 ? [0] : [],
    message: stones.length === 1
      ? `One stone remaining: ${stones[0]}. Answer: ${stones[0]}`
      : `No stones remaining. Answer: 0`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const lastStoneWeight: Algorithm = {
  id: 'last-stone-weight',
  name: 'Last Stone Weight',
  category: 'Heap / Priority Queue',
  difficulty: 'Easy',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Max Heap — smash two heaviest, push remainder',
  description:
    'You are given an array of integers stones where stones[i] is the weight of the ith stone. On each turn, we choose the heaviest two stones and smash them together. If both stones have the same weight, both are destroyed. If they have different weights, the stone with the smaller weight is destroyed, and the other stone has its weight reduced. Return the weight of the last remaining stone, or 0 if there are none.',
  problemUrl: 'https://leetcode.com/problems/last-stone-weight/',
  code: {
    python: `import heapq

def lastStoneWeight(stones):
    stones = [-s for s in stones]
    heapq.heapify(stones)

    while len(stones) > 1:
        first = heapq.heappop(stones)
        second = heapq.heappop(stones)
        if second > first:
            heapq.heappush(stones, first - second)

    stones.append(0)
    return abs(stones[0])`,
    javascript: `function lastStoneWeight(stones) {
    const maxHeap = new MaxPriorityQueue();
    for (const s of stones) maxHeap.enqueue(s);

    while (maxHeap.size() > 1) {
        const first = maxHeap.dequeue().element;
        const second = maxHeap.dequeue().element;
        if (first !== second) {
            maxHeap.enqueue(first - second);
        }
    }

    return maxHeap.size() ? maxHeap.front().element : 0;
}`,
    java: `public static int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
    for (int stone : stones) {
        maxHeap.offer(stone);
    }

    while (maxHeap.size() > 1) {
        int first = maxHeap.poll();
        int second = maxHeap.poll();
        if (first != second) {
            maxHeap.offer(first - second);
        }
    }

    return maxHeap.isEmpty() ? 0 : maxHeap.peek();
}`,
  },
  defaultInput: [2, 7, 4, 1, 8, 1],
  run: runLastStoneWeight,
  optimalApproachName: 'Max-Heap',
  approaches: [
    {
      id: 'sorted-list-insertion',
      name: 'Sorted List + Binary Insert',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      description:
        'Sort once and keep the list sorted by binary-inserting each remainder — the two heaviest are always at the end, no heap machinery required, at the cost of O(n) shifting per insert.',
      code: {
        python: `import bisect

def lastStoneWeight(stones):
    stones = sorted(stones)
    while len(stones) > 1:
        first = stones.pop()
        second = stones.pop()
        if first != second:
            bisect.insort(stones, first - second)
    return stones[0] if stones else 0`,
        javascript: `function lastStoneWeight(stones) {
    stones = [...stones].sort((a, b) => a - b);
    while (stones.length > 1) {
        const first = stones.pop();
        const second = stones.pop();
        if (first !== second) {
            const rem = first - second;
            let lo = 0, hi = stones.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (stones[mid] < rem) lo = mid + 1;
                else hi = mid;
            }
            stones.splice(lo, 0, rem);
        }
    }
    return stones.length ? stones[0] : 0;
}`,
        java: `public static int lastStoneWeight(int[] stones) {
    List<Integer> list = new ArrayList<>();
    for (int s : stones) list.add(s);
    Collections.sort(list);
    while (list.size() > 1) {
        int first = list.remove(list.size() - 1);
        int second = list.remove(list.size() - 1);
        if (first != second) {
            int pos = Collections.binarySearch(list, first - second);
            if (pos < 0) pos = -pos - 1;
            list.add(pos, first - second);
        }
    }
    return list.isEmpty() ? 0 : list.get(0);
}`,
      },
      run: runLastStoneWeightSortedList,
      lineExplanations: {
        python: {
          1: 'Import bisect for binary-search insertion',
          3: 'Define function taking list of stone weights',
          4: 'Sort ascending — heaviest stones end up at the back',
          5: 'Loop while more than one stone remains',
          6: 'Pop the heaviest stone (last element)',
          7: 'Pop the second heaviest stone',
          8: 'If stones differ, one survives',
          9: 'Binary-insert the remainder, keeping the list sorted',
          10: 'Return the last stone, or 0 if none remain',
        },
        javascript: {
          1: 'Define function taking array of stone weights',
          2: 'Copy and sort ascending — heaviest at the back',
          3: 'Loop while more than one stone remains',
          4: 'Pop the heaviest stone (last element)',
          5: 'Pop the second heaviest stone',
          6: 'If stones differ, one survives',
          7: 'The surviving stone weight',
          8: 'Binary search bounds for insertion point',
          9: 'Halve the search range each iteration',
          10: 'Midpoint of the current range',
          11: 'Remainder belongs right of mid — search upper half',
          12: 'Otherwise search lower half',
          14: 'Insert remainder at the found index — list stays sorted',
          17: 'Return the last stone, or 0 if none remain',
        },
        java: {
          1: 'Define method taking array of stone weights',
          2: 'Use an ArrayList so we can insert anywhere',
          3: 'Copy all stones into the list',
          4: 'Sort ascending — heaviest at the back',
          5: 'Loop while more than one stone remains',
          6: 'Remove the heaviest stone (last element)',
          7: 'Remove the second heaviest stone',
          8: 'If stones differ, one survives',
          9: 'Binary search for where the remainder belongs',
          10: 'Negative result encodes the insertion index',
          11: 'Insert remainder there — list stays sorted',
          14: 'Return the last stone, or 0 if none remain',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq for min-heap operations',
      3: 'Define function taking list of stone weights',
      4: 'Negate values to simulate max-heap with min-heap',
      5: 'Build heap from negated stone weights',
      7: 'Loop while more than one stone remains',
      8: 'Pop heaviest stone (most negative)',
      9: 'Pop second heaviest stone',
      10: 'If stones differ, push remainder back',
      11: 'Push difference back into heap',
      13: 'Append 0 in case heap is empty',
      14: 'Return last stone weight (un-negate)',
    },
    javascript: {
      1: 'Define function taking array of stone weights',
      2: 'Create a max priority queue',
      3: 'Add all stones to the max-heap',
      5: 'Loop while more than one stone remains',
      6: 'Pop the heaviest stone',
      7: 'Pop the second heaviest stone',
      8: 'If stones differ, push remainder back',
      9: 'Push difference back into heap',
      13: 'Return last stone or 0 if none left',
    },
    java: {
      1: 'Define method taking array of stone weights',
      2: 'Create max-heap using reverse comparator',
      3: 'Add each stone to the max-heap',
      4: 'Insert stone into priority queue',
      7: 'Loop while more than one stone remains',
      8: 'Poll the heaviest stone',
      9: 'Poll the second heaviest stone',
      10: 'If stones differ, push remainder back',
      11: 'Push difference back into heap',
      15: 'Return last stone or 0 if heap is empty',
    },
  },
};
