import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CpuTask {
  e: number;
  p: number;
  i: number;
}

function heapLabels(heap: CpuTask[]): string[] {
  return heap.map((t) => `T${t.i} p=${t.p}`);
}

function runSingleThreadedCPU(input: unknown): AlgorithmStep[] {
  const tasks = (input as number[][]).map((t) => [t[0], t[1]] as [number, number]);
  const steps: AlgorithmStep[] = [];

  const indexed: CpuTask[] = tasks.map(([e, p], i) => ({ e, p, i }));
  indexed.sort((a, b) => a.e - b.e || a.i - b.i);

  steps.push({
    state: {
      nums: [],
      stack: [],
      hashMap: { time: 0, done: 0, todo: tasks.length },
    },
    highlights: [],
    message: `${tasks.length} tasks as (enqueueTime, processingTime): ${tasks
      .map(([e, p], i) => `T${i}=(${e},${p})`)
      .join(', ')}. The CPU is idle and always picks the SHORTEST available job.`,
    codeLine: 3,
  });

  steps.push({
    state: {
      nums: [],
      stack: [],
      hashMap: { time: 0, done: 0, todo: tasks.length },
    },
    highlights: [],
    message: `Sort by enqueue time: ${indexed
      .map((t) => `T${t.i}@${t.e}`)
      .join(' → ')}. Now we can sweep a clock forward and only ever look at the next task to arrive.`,
    codeLine: 4,
  });

  const heap: CpuTask[] = [];
  const order: number[] = [];
  let time = 0;
  let j = 0;

  const pushHeap = (t: CpuTask) => {
    heap.push(t);
    heap.sort((a, b) => a.p - b.p || a.i - b.i);
  };

  while (order.length < tasks.length) {
    // Admit every task whose enqueue time has passed
    let admitted = 0;
    while (j < indexed.length && indexed[j].e <= time) {
      pushHeap(indexed[j]);
      admitted++;
      j++;
    }

    if (admitted > 0) {
      steps.push({
        state: {
          nums: [...order],
          stack: heapLabels(heap),
          hashMap: { time, done: order.length, todo: tasks.length - order.length },
        },
        highlights: [],
        message: `At time ${time}: ${admitted} task${admitted > 1 ? 's have' : ' has'} arrived. Heap now holds ${heapLabels(
          heap
        ).join(', ')} — ordered by processing time, ties broken by index.`,
        codeLine: 13,
        action: 'push',
      });
    }

    if (heap.length === 0) {
      const jump = indexed[j].e;
      steps.push({
        state: {
          nums: [...order],
          stack: [],
          hashMap: { time: jump, done: order.length, todo: tasks.length - order.length },
        },
        highlights: [],
        message: `Nothing available at time ${time} — the CPU idles. Jump the clock to ${jump}, when T${indexed[j].i} arrives.`,
        codeLine: 16,
      });
      time = jump;
      continue;
    }

    const chosen = heap.shift()!;
    const start = time;
    time += chosen.p;
    order.push(chosen.i);

    steps.push({
      state: {
        nums: [...order],
        stack: heapLabels(heap),
        hashMap: { time, done: order.length, todo: tasks.length - order.length },
      },
      highlights: [order.length - 1],
      message: `Pop the smallest processing time: T${chosen.i} (p=${chosen.p}). Run it from ${start} to ${time}. Order so far: [${order.join(
        ', '
      )}]`,
      codeLine: 18,
      action: 'pop',
    });
  }

  steps.push({
    state: {
      nums: [...order],
      stack: [],
      hashMap: { time, done: order.length, todo: 0 },
      result: `[${order.join(', ')}]`,
    },
    highlights: order.map((_, idx) => idx),
    message: `All tasks finished at time ${time}. Processing order: [${order.join(', ')}]`,
    codeLine: 22,
    action: 'found',
  });

  return steps;
}

function runSingleThreadedCPUScan(input: unknown): AlgorithmStep[] {
  const tasks = (input as number[][]).map((t) => [t[0], t[1]] as [number, number]);
  const steps: AlgorithmStep[] = [];

  const indexed: CpuTask[] = tasks.map(([e, p], i) => ({ e, p, i }));
  indexed.sort((a, b) => a.e - b.e || a.i - b.i);

  steps.push({
    state: {
      nums: [],
      stack: [],
      hashMap: { time: 0, done: 0, todo: tasks.length },
    },
    highlights: [],
    message: `Same sweep, no heap: keep the available tasks in a plain list and LINEAR-SCAN it for the best one each round. Tasks: ${tasks
      .map(([e, p], i) => `T${i}=(${e},${p})`)
      .join(', ')}`,
    codeLine: 1,
  });

  steps.push({
    state: {
      nums: [],
      stack: [],
      hashMap: { time: 0, done: 0, todo: tasks.length },
    },
    highlights: [],
    message: `Sort by enqueue time: ${indexed.map((t) => `T${t.i}@${t.e}`).join(' → ')}`,
    codeLine: 2,
  });

  const available: CpuTask[] = [];
  const order: number[] = [];
  let time = 0;
  let j = 0;

  while (order.length < tasks.length) {
    let admitted = 0;
    while (j < indexed.length && indexed[j].e <= time) {
      available.push(indexed[j]);
      admitted++;
      j++;
    }

    if (admitted > 0) {
      steps.push({
        state: {
          nums: [...order],
          stack: heapLabels(available),
          hashMap: { time, done: order.length, todo: tasks.length - order.length },
        },
        highlights: [],
        message: `At time ${time}: append ${admitted} newly arrived task${
          admitted > 1 ? 's' : ''
        }. Available list (unordered): ${heapLabels(available).join(', ')}`,
        codeLine: 10,
        action: 'push',
      });
    }

    if (available.length === 0) {
      const jump = indexed[j].e;
      steps.push({
        state: {
          nums: [...order],
          stack: [],
          hashMap: { time: jump, done: order.length, todo: tasks.length - order.length },
        },
        highlights: [],
        message: `Nothing available at time ${time} — idle. Fast-forward the clock to ${jump}.`,
        codeLine: 13,
      });
      time = jump;
      continue;
    }

    let best = 0;
    for (let x = 1; x < available.length; x++) {
      const a = available[x];
      const b = available[best];
      if (a.p < b.p || (a.p === b.p && a.i < b.i)) best = x;
    }

    const chosen = available[best];

    steps.push({
      state: {
        nums: [...order],
        stack: heapLabels(available),
        hashMap: { time, done: order.length, todo: tasks.length - order.length },
      },
      highlights: [],
      message: `Scan all ${available.length} available task${
        available.length > 1 ? 's' : ''
      } to find the minimum (p, index) — that costs O(n) here instead of the heap's O(log n). Winner: T${chosen.i} (p=${chosen.p}).`,
      codeLine: 15,
      action: 'compare',
    });

    available.splice(best, 1);
    const start = time;
    time += chosen.p;
    order.push(chosen.i);

    steps.push({
      state: {
        nums: [...order],
        stack: heapLabels(available),
        hashMap: { time, done: order.length, todo: tasks.length - order.length },
      },
      highlights: [order.length - 1],
      message: `Remove T${chosen.i} from the list and run it from ${start} to ${time}. Order so far: [${order.join(', ')}]`,
      codeLine: 17,
      action: 'pop',
    });
  }

  steps.push({
    state: {
      nums: [...order],
      stack: [],
      hashMap: { time, done: order.length, todo: 0 },
      result: `[${order.join(', ')}]`,
    },
    highlights: order.map((_, idx) => idx),
    message: `Same order as the heap version: [${order.join(
      ', '
    )}] — but the scan makes it O(n²) instead of O(n log n).`,
    codeLine: 21,
    action: 'found',
  });

  return steps;
}

export const singleThreadedCPU: Algorithm = {
  id: 'single-threaded-cpu',
  name: 'Single Threaded CPU',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Min Heap — sort by enqueue time, pop shortest available job',
  description:
    'You are given n tasks where tasks[i] = [enqueueTime, processingTime]. A single-threaded CPU processes one task at a time: when it is idle it picks the available task with the shortest processing time, breaking ties by smallest index, and if no task is available it waits. Return the order in which the CPU processes the tasks.',
  problemUrl: 'https://leetcode.com/problems/single-threaded-cpu/',
  code: {
    python: `import heapq

def getOrder(tasks):
    indexed = sorted([(e, p, i) for i, (e, p) in enumerate(tasks)])
    heap = []
    order = []
    time = 0
    j = 0

    while len(order) < len(tasks):
        while j < len(indexed) and indexed[j][0] <= time:
            e, p, i = indexed[j]
            heapq.heappush(heap, (p, i))
            j += 1
        if not heap:
            time = indexed[j][0]
            continue
        p, i = heapq.heappop(heap)
        time += p
        order.append(i)

    return order`,
    javascript: `function getOrder(tasks) {
    const indexed = tasks
        .map(([e, p], i) => [e, p, i])
        .sort((a, b) => a[0] - b[0]);
    const heap = new MinPriorityQueue({
        compare: (a, b) => a[0] - b[0] || a[1] - b[1],
    });
    const order = [];
    let time = 0, j = 0;

    while (order.length < tasks.length) {
        while (j < indexed.length && indexed[j][0] <= time) {
            heap.enqueue([indexed[j][1], indexed[j][2]]);
            j++;
        }
        if (heap.isEmpty()) {
            time = indexed[j][0];
            continue;
        }
        const [p, i] = heap.dequeue();
        time += p;
        order.push(i);
    }

    return order;
}`,
    java: `public static int[] getOrder(int[][] tasks) {
    int n = tasks.length;
    int[][] indexed = new int[n][3];
    for (int i = 0; i < n; i++) {
        indexed[i] = new int[] { tasks[i][0], tasks[i][1], i };
    }
    Arrays.sort(indexed, (a, b) -> a[0] - b[0]);
    PriorityQueue<int[]> heap = new PriorityQueue<>(
        (a, b) -> a[1] == b[1] ? a[2] - b[2] : a[1] - b[1]);
    int[] order = new int[n];
    long time = 0;
    int j = 0, k = 0;

    while (k < n) {
        while (j < n && indexed[j][0] <= time) {
            heap.offer(indexed[j++]);
        }
        if (heap.isEmpty()) {
            time = indexed[j][0];
            continue;
        }
        int[] cur = heap.poll();
        time += cur[1];
        order[k++] = cur[2];
    }

    return order;
}`,
  },
  defaultInput: [
    [1, 2],
    [2, 4],
    [3, 2],
    [4, 1],
  ],
  run: runSingleThreadedCPU,
  optimalApproachName: 'Sort + Min-Heap',
  approaches: [
    {
      id: 'sorted-list-scan',
      name: 'Simulation + Linear Scan',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      description:
        'Runs the exact same clock simulation but keeps the available tasks in a plain list, scanning all of them for the best (processingTime, index) each round instead of letting a heap maintain the order.',
      code: {
        python: `def getOrder(tasks):
    indexed = sorted([(e, p, i) for i, (e, p) in enumerate(tasks)])
    available = []
    order = []
    time = 0
    j = 0

    while len(order) < len(tasks):
        while j < len(indexed) and indexed[j][0] <= time:
            available.append(indexed[j])
            j += 1
        if not available:
            time = indexed[j][0]
            continue
        best = min(range(len(available)),
                   key=lambda x: (available[x][1], available[x][2]))
        e, p, i = available.pop(best)
        time += p
        order.append(i)

    return order`,
        javascript: `function getOrder(tasks) {
    const indexed = tasks
        .map(([e, p], i) => [e, p, i])
        .sort((a, b) => a[0] - b[0]);
    const available = [];
    const order = [];
    let time = 0, j = 0;

    while (order.length < tasks.length) {
        while (j < indexed.length && indexed[j][0] <= time) {
            available.push(indexed[j++]);
        }
        if (available.length === 0) {
            time = indexed[j][0];
            continue;
        }
        let best = 0;
        for (let x = 1; x < available.length; x++) {
            const a = available[x], b = available[best];
            if (a[1] < b[1] || (a[1] === b[1] && a[2] < b[2])) best = x;
        }
        const [, p, i] = available.splice(best, 1)[0];
        time += p;
        order.push(i);
    }

    return order;
}`,
        java: `public static int[] getOrder(int[][] tasks) {
    int n = tasks.length;
    int[][] indexed = new int[n][3];
    for (int i = 0; i < n; i++) {
        indexed[i] = new int[] { tasks[i][0], tasks[i][1], i };
    }
    Arrays.sort(indexed, (a, b) -> a[0] - b[0]);
    List<int[]> available = new ArrayList<>();
    int[] order = new int[n];
    long time = 0;
    int j = 0, k = 0;

    while (k < n) {
        while (j < n && indexed[j][0] <= time) {
            available.add(indexed[j++]);
        }
        if (available.isEmpty()) {
            time = indexed[j][0];
            continue;
        }
        int best = 0;
        for (int x = 1; x < available.size(); x++) {
            int[] a = available.get(x), b = available.get(best);
            if (a[1] < b[1] || (a[1] == b[1] && a[2] < b[2])) best = x;
        }
        int[] cur = available.remove(best);
        time += cur[1];
        order[k++] = cur[2];
    }

    return order;
}`,
      },
      run: runSingleThreadedCPUScan,
      lineExplanations: {
        python: {
          1: 'Define function taking the list of [enqueueTime, processingTime] tasks',
          2: 'Attach the original index, then sort by enqueue time',
          3: 'Plain list of tasks that have arrived but not run yet',
          4: 'Output order of task indices',
          5: 'The simulated CPU clock',
          6: 'Pointer into the enqueue-sorted list',
          8: 'Keep going until every task has been processed',
          9: 'Admit every task whose enqueue time has already passed',
          10: 'Append it to the available list (no ordering maintained)',
          11: 'Advance the arrival pointer',
          12: 'Nothing available — the CPU is idle',
          13: 'Fast-forward the clock to the next arrival',
          14: 'Retry the loop at the new time',
          15: 'Linear scan for the best candidate — the O(n) step',
          16: 'Rank by processing time, then by original index',
          17: 'Remove the winner from the list (O(n) shift)',
          18: 'The CPU runs it, advancing the clock',
          19: 'Record its index in the output order',
          21: 'Return the processing order',
        },
        javascript: {
          1: 'Define function taking the array of [enqueueTime, processingTime] tasks',
          2: 'Attach the original index to each task',
          3: 'Map to [enqueue, processing, index] triples',
          4: 'Sort by enqueue time so arrivals are in order',
          5: 'Plain array of arrived-but-unrun tasks',
          6: 'Output order of task indices',
          7: 'Simulated clock and arrival pointer',
          9: 'Keep going until every task has been processed',
          10: 'Admit every task whose enqueue time has passed',
          11: 'Append it — no ordering maintained',
          13: 'Nothing available — the CPU is idle',
          14: 'Fast-forward the clock to the next arrival',
          15: 'Retry the loop at the new time',
          17: 'Track the index of the best candidate',
          18: 'Linear scan over every available task',
          19: 'Compare candidate against the current best',
          20: 'Smaller processing time wins; ties go to the smaller index',
          22: 'Splice the winner out of the array',
          23: 'The CPU runs it, advancing the clock',
          24: 'Record its index in the output order',
          27: 'Return the processing order',
        },
        java: {
          1: 'Define method taking the tasks matrix',
          2: 'Number of tasks',
          3: 'Build triples of [enqueue, processing, index]',
          4: 'Loop over every task',
          5: 'Store enqueue time, processing time and original index',
          7: 'Sort by enqueue time so arrivals are in order',
          8: 'Plain list of arrived-but-unrun tasks',
          9: 'Output order of task indices',
          10: 'Simulated clock (long to avoid overflow)',
          11: 'Arrival pointer j and output pointer k',
          13: 'Keep going until every task has been processed',
          14: 'Admit every task whose enqueue time has passed',
          15: 'Append it — no ordering maintained',
          17: 'Nothing available — the CPU is idle',
          18: 'Fast-forward the clock to the next arrival',
          19: 'Retry the loop at the new time',
          21: 'Track the index of the best candidate',
          22: 'Linear scan over every available task',
          23: 'Fetch candidate and current best',
          24: 'Smaller processing time wins; ties go to the smaller index',
          26: 'Remove the winner from the list',
          27: 'The CPU runs it, advancing the clock',
          28: 'Record its index in the output order',
          31: 'Return the processing order',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq for min-heap operations',
      3: 'Define function taking the list of [enqueueTime, processingTime] tasks',
      4: 'Attach the original index, then sort by enqueue time',
      5: 'Min-heap of available tasks keyed by (processingTime, index)',
      6: 'Output order of task indices',
      7: 'The simulated CPU clock',
      8: 'Pointer into the enqueue-sorted list',
      10: 'Keep going until every task has been processed',
      11: 'Admit every task whose enqueue time has already passed',
      12: 'Unpack the arriving task',
      13: 'Push (processingTime, index) so the heap orders it for us',
      14: 'Advance the arrival pointer',
      15: 'Heap empty — the CPU has nothing to run',
      16: 'Fast-forward the clock to the next arrival',
      17: 'Retry the loop at the new time',
      18: 'Pop the shortest available job (ties broken by index)',
      19: 'Running it advances the clock by its processing time',
      20: 'Record its index in the output order',
      22: 'Return the processing order',
    },
    javascript: {
      1: 'Define function taking the array of [enqueueTime, processingTime] tasks',
      2: 'Attach the original index to each task',
      3: 'Map to [enqueue, processing, index] triples',
      4: 'Sort by enqueue time so arrivals are in order',
      5: 'Min-heap of available tasks',
      6: 'Order by processing time, then by original index',
      8: 'Output order of task indices',
      9: 'Simulated clock and arrival pointer',
      11: 'Keep going until every task has been processed',
      12: 'Admit every task whose enqueue time has passed',
      13: 'Push (processingTime, index) into the heap',
      14: 'Advance the arrival pointer',
      16: 'Heap empty — the CPU has nothing to run',
      17: 'Fast-forward the clock to the next arrival',
      18: 'Retry the loop at the new time',
      20: 'Pop the shortest available job',
      21: 'Running it advances the clock',
      22: 'Record its index in the output order',
      25: 'Return the processing order',
    },
    java: {
      1: 'Define method taking the tasks matrix',
      2: 'Number of tasks',
      3: 'Build triples of [enqueue, processing, index]',
      4: 'Loop over every task',
      5: 'Store enqueue time, processing time and original index',
      7: 'Sort by enqueue time so arrivals are in order',
      8: 'Min-heap over available tasks',
      9: 'Order by processing time, then by original index',
      10: 'Output order of task indices',
      11: 'Simulated clock (long to avoid overflow)',
      12: 'Arrival pointer j and output pointer k',
      14: 'Keep going until every task has been processed',
      15: 'Admit every task whose enqueue time has passed',
      16: 'Push the arriving task into the heap',
      18: 'Heap empty — the CPU has nothing to run',
      19: 'Fast-forward the clock to the next arrival',
      20: 'Retry the loop at the new time',
      22: 'Poll the shortest available job',
      23: 'Running it advances the clock',
      24: 'Record its index in the output order',
      27: 'Return the processing order',
    },
  },
};
