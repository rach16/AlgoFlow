import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CarPoolingInput {
  trips: number[][];
  capacity: number;
}

function runCarPooling(input: unknown): AlgorithmStep[] {
  const { trips, capacity } = input as CarPoolingInput;
  const steps: AlgorithmStep[] = [];

  const lastStop = Math.max(...trips.map((t) => t[2]));
  const diff: number[] = new Array(lastStop + 1).fill(0);

  steps.push({
    state: {
      nums: [...diff],
      hashMap: { capacity, stops: lastStop + 1 },
    },
    highlights: [],
    message: `Car holds ${capacity}. Trips (passengers, from, to): ${trips
      .map((t) => `${t[0]}p ${t[1]}→${t[2]}`)
      .join(', ')}. Instead of a heap, bucket the changes: one slot per stop 0…${lastStop}.`,
    codeLine: 3,
  });

  for (const [num, start, end] of trips) {
    diff[start] += num;
    diff[end] -= num;

    steps.push({
      state: {
        nums: [...diff],
        hashMap: { capacity, trip: `${num}p ${start}→${end}` },
      },
      highlights: [start, end],
      message: `Trip ${num}p from ${start} to ${end}: record +${num} at stop ${start} and −${num} at stop ${end}. The trip is now two numbers, no matter how long it is.`,
      codeLine: 6,
      action: 'insert',
    });
  }

  steps.push({
    state: {
      nums: [...diff],
      hashMap: { capacity, current: 0 },
    },
    highlights: [],
    message: `Difference array complete: [${diff.join(
      ', '
    )}]. Now sweep left to right — the running sum at each stop is exactly how many people are aboard.`,
    codeLine: 9,
  });

  const running: number[] = new Array(lastStop + 1).fill(0);
  let current = 0;
  let ok = true;

  for (let stop = 0; stop <= lastStop; stop++) {
    current += diff[stop];
    running[stop] = current;

    if (current > capacity) {
      steps.push({
        state: {
          nums: running.slice(0, stop + 1),
          hashMap: { capacity, current, stop },
          result: 'false — over capacity',
        },
        highlights: [stop],
        message: `Stop ${stop}: ${current} passengers aboard > capacity ${capacity}. Overloaded — return false immediately.`,
        codeLine: 13,
        action: 'found',
      });
      ok = false;
      break;
    }

    steps.push({
      state: {
        nums: running.slice(0, stop + 1),
        hashMap: { capacity, current, stop },
      },
      highlights: [stop],
      message:
        diff[stop] === 0
          ? `Stop ${stop}: nobody boards or leaves, still ${current} aboard (≤ ${capacity}).`
          : `Stop ${stop}: ${diff[stop] > 0 ? `+${diff[stop]} board` : `${-diff[stop]} get off`} → ${current} aboard${
              current === capacity ? ` — exactly at capacity ${capacity}, still legal.` : ` (≤ ${capacity}).`
            }`,
      codeLine: 11,
      action: 'compare',
    });
  }

  if (ok) {
    steps.push({
      state: {
        nums: [...running],
        hashMap: { capacity, peak: Math.max(...running) },
        result: 'true — every stop fits',
      },
      highlights: running.map((_, i) => i),
      message: `Swept every stop and the load never exceeded ${capacity} (peak was ${Math.max(
        ...running
      )}). All trips fit. Answer: true`,
      codeLine: 15,
      action: 'found',
    });
  }

  return steps;
}

function runCarPoolingHeap(input: unknown): AlgorithmStep[] {
  const { trips, capacity } = input as CarPoolingInput;
  const steps: AlgorithmStep[] = [];

  const sorted = [...trips].sort((a, b) => a[1] - b[1]);

  steps.push({
    state: {
      nums: [],
      stack: [],
      hashMap: { capacity, current: 0 },
    },
    highlights: [],
    message: `Same question, event-driven: sort trips by pickup stop → ${sorted
      .map((t) => `${t[0]}p ${t[1]}→${t[2]}`)
      .join(', ')}. A min-heap keyed by drop-off tells us who has already left the car.`,
    codeLine: 4,
  });

  const heap: number[][] = [];
  const sortHeap = () => heap.sort((a, b) => a[0] - b[0]);
  let current = 0;
  const timeline: number[] = [];
  let ok = true;

  for (const [num, start, end] of sorted) {
    steps.push({
      state: {
        nums: [...timeline],
        stack: heap.map(([e, n]) => `off@${e} × ${n}p`),
        hashMap: { capacity, current, stop: start },
      },
      highlights: [],
      message:
        heap.length === 0
          ? `Next pickup: ${num}p boarding at stop ${start}. Nobody is aboard yet, so there are no drop-offs to process first.`
          : `Next pickup: ${num}p boarding at stop ${start}. Peek the heap — earliest drop-off is stop ${heap[0][0]}${
              heap[0][0] <= start ? ` ≤ ${start}, so those seats free up first.` : ` > ${start}, so nobody leaves yet.`
            }`,
      codeLine: 9,
      action: 'compare',
    });

    // Drop off everyone whose trip ended at or before this pickup
    while (heap.length > 0 && heap[0][0] <= start) {
      const [dropStop, cnt] = heap.shift()!;
      current -= cnt;

      steps.push({
        state: {
          nums: [...timeline],
          stack: heap.map(([e, n]) => `off@${e} × ${n}p`),
          hashMap: { capacity, current, stop: start },
        },
        highlights: [],
        message: `Before picking up at stop ${start}: a trip ends at stop ${dropStop} ≤ ${start}, so ${cnt} passenger${
          cnt > 1 ? 's' : ''
        } get off → ${current} aboard.`,
        codeLine: 10,
        action: 'pop',
      });
    }

    current += num;
    timeline.push(current);

    if (current > capacity) {
      steps.push({
        state: {
          nums: [...timeline],
          stack: heap.map(([e, n]) => `off@${e} × ${n}p`),
          hashMap: { capacity, current, stop: start },
          result: 'false — over capacity',
        },
        highlights: [timeline.length - 1],
        message: `Board ${num} at stop ${start} → ${current} aboard > capacity ${capacity}. Overloaded — return false.`,
        codeLine: 14,
        action: 'found',
      });
      ok = false;
      break;
    }

    heap.push([end, num]);
    sortHeap();

    steps.push({
      state: {
        nums: [...timeline],
        stack: heap.map(([e, n]) => `off@${e} × ${n}p`),
        hashMap: { capacity, current, stop: start },
      },
      highlights: [timeline.length - 1],
      message: `Board ${num} at stop ${start} → ${current} aboard (≤ ${capacity}). Push their drop-off at stop ${end} onto the heap so it fires automatically later.`,
      codeLine: 15,
      action: 'push',
    });
  }

  if (ok) {
    steps.push({
      state: {
        nums: [...timeline],
        stack: [],
        hashMap: { capacity, peak: Math.max(...timeline) },
        result: 'true — every stop fits',
      },
      highlights: timeline.map((_, i) => i),
      message: `Every pickup stayed within ${capacity} (peak ${Math.max(
        ...timeline
      )}) — same verdict as the sweep, but O(n log n) instead of O(n + maxStop). Answer: true`,
      codeLine: 17,
      action: 'found',
    });
  }

  return steps;
}

export const carPooling: Algorithm = {
  id: 'car-pooling',
  name: 'Car Pooling',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n + maxStop)',
  spaceComplexity: 'O(maxStop)',
  pattern: 'Difference Array — bucket ± at each stop, sweep the running total',
  description:
    'A car with a fixed passenger capacity drives east along a one-way road. Given trips where trips[i] = [numPassengers, from, to], return true if it is possible to pick up and drop off all passengers without ever exceeding the capacity.',
  problemUrl: 'https://leetcode.com/problems/car-pooling/',
  code: {
    python: `def carPooling(trips, capacity):
    lastStop = max(t[2] for t in trips)
    diff = [0] * (lastStop + 1)

    for num, start, end in trips:
        diff[start] += num
        diff[end] -= num

    current = 0
    for stop in range(lastStop + 1):
        current += diff[stop]
        if current > capacity:
            return False

    return True`,
    javascript: `function carPooling(trips, capacity) {
    const lastStop = Math.max(...trips.map((t) => t[2]));
    const diff = new Array(lastStop + 1).fill(0);

    for (const [num, start, end] of trips) {
        diff[start] += num;
        diff[end] -= num;
    }

    let current = 0;
    for (let stop = 0; stop <= lastStop; stop++) {
        current += diff[stop];
        if (current > capacity) return false;
    }

    return true;
}`,
    java: `public static boolean carPooling(int[][] trips, int capacity) {
    int lastStop = 0;
    for (int[] t : trips) lastStop = Math.max(lastStop, t[2]);
    int[] diff = new int[lastStop + 1];

    for (int[] t : trips) {
        diff[t[1]] += t[0];
        diff[t[2]] -= t[0];
    }

    int current = 0;
    for (int stop = 0; stop <= lastStop; stop++) {
        current += diff[stop];
        if (current > capacity) return false;
    }

    return true;
}`,
  },
  defaultInput: {
    trips: [
      [2, 1, 5],
      [3, 3, 7],
      [4, 5, 8],
    ],
    capacity: 7,
  },
  run: runCarPooling,
  optimalApproachName: 'Difference Array Sweep',
  approaches: [
    {
      id: 'min-heap-dropoffs',
      name: 'Min-Heap of Drop-Offs',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Processes pickups in sorted order and keeps a min-heap keyed by drop-off stop, so passengers leave the car exactly when needed — better than the bucket sweep when stop coordinates are huge and sparse.',
      code: {
        python: `import heapq

def carPooling(trips, capacity):
    trips.sort(key=lambda t: t[1])
    minHeap = []
    current = 0

    for num, start, end in trips:
        while minHeap and minHeap[0][0] <= start:
            done, cnt = heapq.heappop(minHeap)
            current -= cnt
        current += num
        if current > capacity:
            return False
        heapq.heappush(minHeap, (end, num))

    return True`,
        javascript: `function carPooling(trips, capacity) {
    const sorted = [...trips].sort((a, b) => a[1] - b[1]);
    const minHeap = new MinPriorityQueue({ priority: (x) => x[0] });
    let current = 0;

    for (const [num, start, end] of sorted) {
        while (!minHeap.isEmpty() && minHeap.front().element[0] <= start) {
            current -= minHeap.dequeue().element[1];
        }
        current += num;
        if (current > capacity) return false;
        minHeap.enqueue([end, num]);
    }

    return true;
}`,
        java: `public static boolean carPooling(int[][] trips, int capacity) {
    Arrays.sort(trips, (a, b) -> a[1] - b[1]);
    PriorityQueue<int[]> minHeap = new PriorityQueue<>(
        (a, b) -> a[0] - b[0]);
    int current = 0;

    for (int[] t : trips) {
        while (!minHeap.isEmpty() && minHeap.peek()[0] <= t[1]) {
            current -= minHeap.poll()[1];
        }
        current += t[0];
        if (current > capacity) return false;
        minHeap.offer(new int[] { t[2], t[0] });
    }

    return true;
}`,
      },
      run: runCarPoolingHeap,
      lineExplanations: {
        python: {
          1: 'Import heapq for min-heap operations',
          3: 'Define function taking the trips and the car capacity',
          4: 'Process pickups in the order they happen along the road',
          5: 'Min-heap of (dropOffStop, passengers) for people currently aboard',
          6: 'Passengers currently in the car',
          8: 'Handle each pickup in road order',
          9: 'Anyone whose drop-off is at or before this stop has already left',
          10: 'Pop that finished trip',
          11: 'Free up their seats',
          12: 'Board the new passengers',
          13: 'Capacity check — the only failure condition',
          14: 'Too many aboard, impossible',
          15: 'Remember when these passengers will get off',
          17: 'Every pickup fit — the schedule works',
        },
        javascript: {
          1: 'Define function taking the trips and the car capacity',
          2: 'Copy and sort pickups in road order',
          3: 'Min-heap of [dropOffStop, passengers] for people aboard',
          4: 'Passengers currently in the car',
          6: 'Handle each pickup in road order',
          7: 'Anyone whose drop-off is at or before this stop has left',
          8: 'Free up their seats',
          10: 'Board the new passengers',
          11: 'Capacity check — the only failure condition',
          12: 'Remember when these passengers will get off',
          15: 'Every pickup fit — the schedule works',
        },
        java: {
          1: 'Define method taking the trips and the car capacity',
          2: 'Sort pickups in road order',
          3: 'Min-heap of [dropOffStop, passengers] for people aboard',
          4: 'Ordered by earliest drop-off',
          5: 'Passengers currently in the car',
          7: 'Handle each pickup in road order',
          8: 'Anyone whose drop-off is at or before this stop has left',
          9: 'Free up their seats',
          11: 'Board the new passengers',
          12: 'Capacity check — the only failure condition',
          13: 'Remember when these passengers will get off',
          16: 'Every pickup fit — the schedule works',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the trips and the car capacity',
      2: 'The furthest drop-off bounds the road we need to model',
      3: 'One bucket per stop, all starting at zero',
      5: 'Turn every trip into two events',
      6: 'Passengers board here',
      7: 'The same passengers leave here',
      9: 'Running count of people in the car',
      10: 'Sweep the road from stop 0 to the last stop',
      11: 'Apply this stop’s boardings and exits',
      12: 'Never allow more riders than seats',
      13: 'Overloaded — the schedule is impossible',
      15: 'Survived every stop — the schedule works',
    },
    javascript: {
      1: 'Define function taking the trips and the car capacity',
      2: 'The furthest drop-off bounds the road we need to model',
      3: 'One bucket per stop, all starting at zero',
      5: 'Turn every trip into two events',
      6: 'Passengers board here',
      7: 'The same passengers leave here',
      10: 'Running count of people in the car',
      11: 'Sweep the road from stop 0 to the last stop',
      12: 'Apply this stop’s boardings and exits',
      13: 'Never allow more riders than seats',
      16: 'Survived every stop — the schedule works',
    },
    java: {
      1: 'Define method taking the trips and the car capacity',
      2: 'Track the furthest drop-off',
      3: 'Scan every trip for the largest end stop',
      4: 'One bucket per stop, all starting at zero',
      6: 'Turn every trip into two events',
      7: 'Passengers board here',
      8: 'The same passengers leave here',
      11: 'Running count of people in the car',
      12: 'Sweep the road from stop 0 to the last stop',
      13: 'Apply this stop’s boardings and exits',
      14: 'Never allow more riders than seats',
      17: 'Survived every stop — the schedule works',
    },
  },
};
