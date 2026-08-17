import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface IPOInput {
  k: number;
  w: number;
  profits: number[];
  capital: number[];
}

function runIPO(input: unknown): AlgorithmStep[] {
  const { k, w: startW, profits, capital } = input as IPOInput;
  const steps: AlgorithmStep[] = [];

  const projects = capital
    .map((c, i) => ({ c, p: profits[i], i }))
    .sort((a, b) => a.c - b.c || a.i - b.i);

  let w = startW;

  steps.push({
    state: {
      nums: [...profits],
      stack: [],
      hashMap: { capital: w, picksLeft: k },
    },
    highlights: [],
    message: `Start with capital ${w} and at most ${k} project${
      k > 1 ? 's' : ''
    }. Projects (capital→profit): ${projects
      .map((pr) => `P${pr.i} ${pr.c}→+${pr.p}`)
      .join(', ')}. Profit is pure gain — it is added to capital, never spent.`,
    codeLine: 3,
  });

  steps.push({
    state: {
      nums: [...profits],
      stack: [],
      hashMap: { capital: w, picksLeft: k },
    },
    highlights: [],
    message: `Sort projects by required capital: ${projects
      .map((pr) => `${pr.c}`)
      .join(' ≤ ')}. Since capital only ever grows, a project unlocked once stays unlocked — so we sweep this list one way and never revisit it.`,
    codeLine: 4,
  });

  const heap: { p: number; i: number }[] = [];
  const sortHeap = () => heap.sort((a, b) => b.p - a.p || a.i - b.i);
  let ptr = 0;

  for (let round = 0; round < k; round++) {
    const unlocked: string[] = [];
    while (ptr < projects.length && projects[ptr].c <= w) {
      heap.push({ p: projects[ptr].p, i: projects[ptr].i });
      unlocked.push(`P${projects[ptr].i} (+${projects[ptr].p})`);
      ptr++;
    }
    sortHeap();

    if (unlocked.length > 0) {
      steps.push({
        state: {
          nums: [...profits],
          stack: heap.map((h) => `P${h.i} +${h.p}`),
          hashMap: { capital: w, picksLeft: k - round },
        },
        highlights: heap.map((h) => h.i),
        message: `Round ${round + 1}: with capital ${w} we can now afford ${unlocked.join(
          ', '
        )}. Dump them all into a max-heap keyed by profit.`,
        codeLine: 10,
        action: 'push',
      });
    }

    if (heap.length === 0) {
      steps.push({
        state: {
          nums: [...profits],
          stack: [],
          hashMap: { capital: w, picksLeft: k - round },
        },
        highlights: [],
        message: `No project costs ${w} or less — nothing is affordable, so stop early with ${
          k - round
        } pick${k - round > 1 ? 's' : ''} unused.`,
        codeLine: 13,
        action: 'delete',
      });
      break;
    }

    const best = heap.shift()!;
    const before = w;
    w += best.p;

    steps.push({
      state: {
        nums: [...profits],
        stack: heap.map((h) => `P${h.i} +${h.p}`),
        hashMap: { capital: w, picksLeft: k - round - 1 },
        result: `capital = ${w}`,
      },
      highlights: [best.i],
      message: `Pop the most profitable affordable project: P${best.i} (+${best.p}). Capital ${before} + ${best.p} = ${w}. Greedy is safe here — a bigger capital can only unlock more options.`,
      codeLine: 14,
      action: 'pop',
    });
  }

  steps.push({
    state: {
      nums: [...profits],
      stack: heap.map((h) => `P${h.i} +${h.p}`),
      hashMap: { capital: w },
      result: w,
    },
    highlights: [],
    message: `Finished all ${k} rounds. Maximum capital: ${w}`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

function runIPOScan(input: unknown): AlgorithmStep[] {
  const { k, w: startW, profits, capital } = input as IPOInput;
  const steps: AlgorithmStep[] = [];
  const n = profits.length;

  const used: boolean[] = new Array(n).fill(false);
  let w = startW;

  steps.push({
    state: {
      nums: [...profits],
      hashMap: { capital: w, picksLeft: k },
    },
    highlights: [],
    message: `No sorting, no heap: keep a used[] flag per project and re-scan all ${n} of them every round. Capital ${w}, ${k} pick${
      k > 1 ? 's' : ''
    } available.`,
    codeLine: 3,
  });

  for (let round = 0; round < k; round++) {
    let best = -1;
    const affordable: number[] = [];

    for (let i = 0; i < n; i++) {
      if (used[i] || capital[i] > w) continue;
      affordable.push(i);
      if (best === -1 || profits[i] > profits[best]) best = i;
    }

    steps.push({
      state: {
        nums: [...profits],
        hashMap: { capital: w, picksLeft: k - round },
      },
      highlights: affordable,
      message:
        affordable.length > 0
          ? `Round ${round + 1}: scan all ${n} projects with capital ${w}. Affordable (unused, capital ≤ ${w}): ${affordable
              .map((i) => `P${i} +${profits[i]}`)
              .join(', ')}. Best is P${best} (+${profits[best]}).`
          : `Round ${round + 1}: scan all ${n} projects with capital ${w} — none are both unused and affordable.`,
      codeLine: 7,
      action: 'compare',
    });

    if (best === -1) {
      steps.push({
        state: {
          nums: [...profits],
          hashMap: { capital: w, picksLeft: k - round },
        },
        highlights: [],
        message: `Nothing left to invest in — stop early with ${k - round} pick${k - round > 1 ? 's' : ''} unused.`,
        codeLine: 13,
        action: 'delete',
      });
      break;
    }

    used[best] = true;
    const before = w;
    w += profits[best];

    steps.push({
      state: {
        nums: [...profits],
        hashMap: { capital: w, picksLeft: k - round - 1 },
        result: `capital = ${w}`,
      },
      highlights: [best],
      message: `Take P${best}: capital ${before} + ${profits[best]} = ${w}. Mark it used so the next scan skips it. Each round costs O(n), giving O(n·k) overall.`,
      codeLine: 15,
      action: 'visit',
    });
  }

  steps.push({
    state: {
      nums: [...profits],
      hashMap: { capital: w },
      result: w,
    },
    highlights: [],
    message: `Same maximum capital as the heap version: ${w}. Fine for tiny k, but O(n·k) blows up where the heap stays O(n log n).`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const ipo: Algorithm = {
  id: 'ipo',
  name: 'IPO',
  category: 'Heap / Priority Queue',
  difficulty: 'Hard',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Greedy + Max Heap — unlock by capital, always take the biggest profit',
  description:
    'You can finish at most k distinct projects starting with w capital. Project i needs capital[i] to start and yields a pure profit of profits[i], which is added to your total capital. Return the maximum capital you can end with.',
  problemUrl: 'https://leetcode.com/problems/ipo/',
  code: {
    python: `import heapq

def findMaximizedCapital(k, w, profits, capital):
    projects = sorted(zip(capital, profits))
    maxHeap = []
    i = 0

    for _ in range(k):
        while i < len(projects) and projects[i][0] <= w:
            heapq.heappush(maxHeap, -projects[i][1])
            i += 1
        if not maxHeap:
            break
        w += -heapq.heappop(maxHeap)

    return w`,
    javascript: `function findMaximizedCapital(k, w, profits, capital) {
    const projects = capital
        .map((c, i) => [c, profits[i]])
        .sort((a, b) => a[0] - b[0]);
    const maxHeap = new MaxPriorityQueue();
    let i = 0;

    for (let round = 0; round < k; round++) {
        while (i < projects.length && projects[i][0] <= w) {
            maxHeap.enqueue(projects[i][1]);
            i++;
        }
        if (maxHeap.isEmpty()) break;
        w += maxHeap.dequeue().element;
    }

    return w;
}`,
    java: `public static int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
    int n = profits.length;
    int[][] projects = new int[n][2];
    for (int i = 0; i < n; i++) {
        projects[i] = new int[] { capital[i], profits[i] };
    }
    Arrays.sort(projects, (a, b) -> a[0] - b[0]);
    PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
    int i = 0;

    for (int round = 0; round < k; round++) {
        while (i < n && projects[i][0] <= w) {
            maxHeap.offer(projects[i][1]);
            i++;
        }
        if (maxHeap.isEmpty()) break;
        w += maxHeap.poll();
    }

    return w;
}`,
  },
  defaultInput: { k: 3, w: 0, profits: [1, 2, 3], capital: [0, 1, 2] },
  run: runIPO,
  optimalApproachName: 'Sort + Max-Heap',
  approaches: [
    {
      id: 'linear-scan-best-project',
      name: 'Repeated Linear Scan',
      timeComplexity: 'O(n · k)',
      spaceComplexity: 'O(n)',
      description:
        'Drops both the sort and the heap: each round walks the whole project list looking for the most profitable unused project you can currently afford.',
      code: {
        python: `def findMaximizedCapital(k, w, profits, capital):
    n = len(profits)
    used = [False] * n

    for _ in range(k):
        best = -1
        for i in range(n):
            if used[i] or capital[i] > w:
                continue
            if best == -1 or profits[i] > profits[best]:
                best = i
        if best == -1:
            break
        used[best] = True
        w += profits[best]

    return w`,
        javascript: `function findMaximizedCapital(k, w, profits, capital) {
    const n = profits.length;
    const used = new Array(n).fill(false);

    for (let round = 0; round < k; round++) {
        let best = -1;
        for (let i = 0; i < n; i++) {
            if (used[i] || capital[i] > w) continue;
            if (best === -1 || profits[i] > profits[best]) best = i;
        }
        if (best === -1) break;
        used[best] = true;
        w += profits[best];
    }

    return w;
}`,
        java: `public static int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
    int n = profits.length;
    boolean[] used = new boolean[n];

    for (int round = 0; round < k; round++) {
        int best = -1;
        for (int i = 0; i < n; i++) {
            if (used[i] || capital[i] > w) continue;
            if (best == -1 || profits[i] > profits[best]) best = i;
        }
        if (best == -1) break;
        used[best] = true;
        w += profits[best];
    }

    return w;
}`,
      },
      run: runIPOScan,
      lineExplanations: {
        python: {
          1: 'Define function taking k, starting capital, profits and capital requirements',
          2: 'Number of projects',
          3: 'Track which projects have already been taken',
          5: 'We get at most k picks',
          6: 'Index of the best project found this round',
          7: 'Walk every project — the O(n) part',
          8: 'Skip projects already taken or still too expensive',
          9: 'Not a candidate',
          10: 'Keep the highest profit among the affordable ones',
          11: 'Record it as the current best',
          12: 'Nothing affordable and unused',
          13: 'Stop early — more rounds cannot help',
          14: 'Mark the winner as taken',
          15: 'Its profit is pure gain added to capital',
          17: 'Return the maximised capital',
        },
        javascript: {
          1: 'Define function taking k, starting capital, profits and capital requirements',
          2: 'Number of projects',
          3: 'Track which projects have already been taken',
          5: 'We get at most k picks',
          6: 'Index of the best project found this round',
          7: 'Walk every project — the O(n) part',
          8: 'Skip projects already taken or still too expensive',
          9: 'Keep the highest profit among the affordable ones',
          11: 'Nothing affordable and unused — stop early',
          12: 'Mark the winner as taken',
          13: 'Its profit is pure gain added to capital',
          16: 'Return the maximised capital',
        },
        java: {
          1: 'Define method taking k, starting capital, profits and capital requirements',
          2: 'Number of projects',
          3: 'Track which projects have already been taken',
          5: 'We get at most k picks',
          6: 'Index of the best project found this round',
          7: 'Walk every project — the O(n) part',
          8: 'Skip projects already taken or still too expensive',
          9: 'Keep the highest profit among the affordable ones',
          11: 'Nothing affordable and unused — stop early',
          12: 'Mark the winner as taken',
          13: 'Its profit is pure gain added to capital',
          16: 'Return the maximised capital',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq for heap operations',
      3: 'Define function taking k, starting capital, profits and capital requirements',
      4: 'Pair each project as (capital, profit) and sort by capital',
      5: 'Max-heap of profits we can currently afford',
      6: 'Pointer into the capital-sorted project list',
      8: 'We get at most k picks',
      9: 'Unlock every project whose capital requirement we now meet',
      10: 'Negate the profit so Python’s min-heap acts as a max-heap',
      11: 'Advance the unlock pointer — it never goes backwards',
      12: 'Nothing affordable',
      13: 'Stop early — capital cannot grow, so no later round helps',
      14: 'Take the largest affordable profit and add it to capital',
      16: 'Return the maximised capital',
    },
    javascript: {
      1: 'Define function taking k, starting capital, profits and capital requirements',
      2: 'Pair each project with its capital requirement',
      3: 'Build [capital, profit] pairs',
      4: 'Sort by capital so unlocking is a single forward sweep',
      5: 'Max-heap of profits we can currently afford',
      6: 'Pointer into the capital-sorted project list',
      8: 'We get at most k picks',
      9: 'Unlock every project whose capital requirement we now meet',
      10: 'Push its profit into the max-heap',
      11: 'Advance the unlock pointer — it never goes backwards',
      13: 'Nothing affordable — stop early',
      14: 'Take the largest affordable profit and add it to capital',
      17: 'Return the maximised capital',
    },
    java: {
      1: 'Define method taking k, starting capital, profits and capital requirements',
      2: 'Number of projects',
      3: 'Build [capital, profit] pairs',
      4: 'Loop over every project',
      5: 'Store its capital requirement alongside its profit',
      7: 'Sort by capital so unlocking is a single forward sweep',
      8: 'Max-heap of profits we can currently afford',
      9: 'Pointer into the capital-sorted project list',
      11: 'We get at most k picks',
      12: 'Unlock every project whose capital requirement we now meet',
      13: 'Push its profit into the max-heap',
      14: 'Advance the unlock pointer — it never goes backwards',
      16: 'Nothing affordable — stop early',
      17: 'Take the largest affordable profit and add it to capital',
      20: 'Return the maximised capital',
    },
  },
};
