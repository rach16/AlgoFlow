import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface TaskSchedulerInput {
  tasks: string[];
  n: number;
}

function runTaskScheduler(input: unknown): AlgorithmStep[] {
  const { tasks, n } = input as TaskSchedulerInput;
  const steps: AlgorithmStep[] = [];

  // Count task frequencies
  const freq: Record<string, number> = {};
  for (const task of tasks) {
    freq[task] = (freq[task] || 0) + 1;
  }

  steps.push({
    state: {
      chars: [...tasks],
      hashMap: { ...freq },
    },
    highlights: [],
    message: `Tasks: [${tasks.join(', ')}], cooldown n=${n}. Count frequencies.`,
    codeLine: 1,
  });

  steps.push({
    state: {
      chars: [],
      hashMap: { ...freq },
    },
    highlights: [],
    message: `Frequencies: ${Object.entries(freq).map(([k, v]) => `${k}:${v}`).join(', ')}. Use max-heap + cooldown queue.`,
    codeLine: 3,
  });

  // Max-heap (simulated with sorted array, descending by count)
  const maxHeap: { task: string; count: number }[] = Object.entries(freq)
    .map(([task, count]) => ({ task, count }))
    .sort((a, b) => b.count - a.count);

  // Cooldown queue: [task, count, availableTime]
  const cooldownQueue: { task: string; count: number; availableAt: number }[] = [];
  const schedule: string[] = [];
  let time = 0;

  while (maxHeap.length > 0 || cooldownQueue.length > 0) {
    time++;

    // Check if any task in cooldown is now available
    if (cooldownQueue.length > 0 && cooldownQueue[0].availableAt <= time) {
      const released = cooldownQueue.shift()!;
      maxHeap.push({ task: released.task, count: released.count });
      maxHeap.sort((a, b) => b.count - a.count);

      steps.push({
        state: {
          chars: [...schedule],
          hashMap: {
            ...Object.fromEntries(maxHeap.map((h) => [h.task, h.count])),
            time: time,
            cooldown: cooldownQueue.map((c) => `${c.task}@${c.availableAt}`).join(', ') || 'empty',
          },
        },
        highlights: [schedule.length - 1],
        message: `Time ${time}: Task '${released.task}' released from cooldown back to heap`,
        codeLine: 8,
        action: 'push',
      });
    }

    if (maxHeap.length > 0) {
      // Pick most frequent task
      const current = maxHeap.shift()!;
      schedule.push(current.task);

      steps.push({
        state: {
          chars: [...schedule],
          hashMap: {
            ...Object.fromEntries(maxHeap.map((h) => [h.task, h.count])),
            time: time,
            scheduled: current.task,
            remaining: current.count - 1,
          },
        },
        highlights: [schedule.length - 1],
        message: `Time ${time}: Schedule task '${current.task}' (count ${current.count} -> ${current.count - 1})`,
        codeLine: 10,
        action: 'visit',
      });

      if (current.count - 1 > 0) {
        cooldownQueue.push({
          task: current.task,
          count: current.count - 1,
          availableAt: time + n + 1,
        });

        steps.push({
          state: {
            chars: [...schedule],
            hashMap: {
              ...Object.fromEntries(maxHeap.map((h) => [h.task, h.count])),
              time: time,
              cooldown: cooldownQueue.map((c) => `${c.task}@${c.availableAt}`).join(', '),
            },
          },
          highlights: [schedule.length - 1],
          message: `Task '${current.task}' has ${current.count - 1} remaining, add to cooldown (available at time ${time + n + 1})`,
          codeLine: 12,
          action: 'insert',
        });
      }
    } else {
      // Idle
      schedule.push('idle');

      steps.push({
        state: {
          chars: [...schedule],
          hashMap: {
            time: time,
            cooldown: cooldownQueue.map((c) => `${c.task}@${c.availableAt}`).join(', '),
          },
        },
        highlights: [schedule.length - 1],
        message: `Time ${time}: No tasks available, CPU idle. Waiting for cooldown.`,
        codeLine: 14,
        action: 'visit',
      });
    }
  }

  steps.push({
    state: {
      chars: [...schedule],
      hashMap: { totalTime: time },
      result: time,
    },
    highlights: [],
    message: `Schedule complete! Total time = ${time}. Schedule: [${schedule.join(', ')}]`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

function runTaskSchedulerMathFormula(input: unknown): AlgorithmStep[] {
  const { tasks, n } = input as TaskSchedulerInput;
  const steps: AlgorithmStep[] = [];

  const freq: Record<string, number> = {};
  for (const task of tasks) {
    freq[task] = (freq[task] || 0) + 1;
  }

  steps.push({
    state: {
      chars: [...tasks],
      hashMap: { ...freq },
    },
    highlights: [],
    message: `Tasks: [${tasks.join(', ')}], cooldown n=${n}. No simulation needed — the answer follows from a counting formula.`,
    codeLine: 4,
  });

  const maxFreq = Math.max(...Object.values(freq));

  steps.push({
    state: {
      chars: [],
      hashMap: { ...freq, maxFreq: maxFreq },
    },
    highlights: [],
    message: `The MOST frequent task appears maxFreq=${maxFreq} times. It dictates the schedule's skeleton: its copies must sit at least n+1=${n + 1} slots apart.`,
    codeLine: 5,
    action: 'visit',
  });

  const maxTasks = Object.keys(freq).filter((t) => freq[t] === maxFreq);
  const maxCount = maxTasks.length;

  steps.push({
    state: {
      chars: [],
      hashMap: { ...freq, maxFreq: maxFreq, maxCount: maxCount },
    },
    highlights: [],
    message: `maxCount=${maxCount} task(s) share that top frequency: [${maxTasks.join(', ')}]. They all ride in the final block together.`,
    codeLine: 6,
    action: 'compare',
  });

  // Build the conceptual frame: (maxFreq-1) blocks of size (n+1), then maxCount finishers
  const frame: string[] = [];
  for (let b = 0; b < maxFreq - 1; b++) {
    for (let s = 0; s < n + 1; s++) {
      frame.push(s < maxCount ? maxTasks[s] : '_');
    }
  }
  for (let s = 0; s < maxCount; s++) {
    frame.push(maxTasks[s]);
  }

  const slots = (maxFreq - 1) * (n + 1) + maxCount;

  steps.push({
    state: {
      chars: [...frame],
      hashMap: { maxFreq: maxFreq, maxCount: maxCount, slots: slots },
    },
    highlights: frame.map((c, i) => (c !== '_' ? i : -1)).filter((i) => i >= 0),
    message: `Frame: (maxFreq-1)=${maxFreq - 1} blocks of (n+1)=${n + 1} slots, plus ${maxCount} finisher(s). slots = ${maxFreq - 1} * ${n + 1} + ${maxCount} = ${slots}. Gaps ('_') absorb the other tasks or become idles.`,
    codeLine: 7,
    action: 'insert',
  });

  const result = Math.max(tasks.length, slots);

  steps.push({
    state: {
      chars: [...frame],
      hashMap: { slots: slots, totalTasks: tasks.length, answer: result },
      result,
    },
    highlights: [],
    message:
      tasks.length > slots
        ? `More tasks (${tasks.length}) than frame slots (${slots}): the gaps overflow, no idles needed. Answer = ${result}.`
        : `Answer = max(len(tasks)=${tasks.length}, slots=${slots}) = ${result}. Same result the heap simulation computes step by step.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const taskScheduler: Algorithm = {
  id: 'task-scheduler',
  name: 'Task Scheduler',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy + Max Heap — most frequent task first, cooldown slots',
  description:
    'Given a characters array tasks, representing the tasks a CPU needs to do, and a non-negative integer n representing the cooldown period between two same tasks, return the minimum number of intervals the CPU will take to finish all the given tasks.',
  problemUrl: 'https://leetcode.com/problems/task-scheduler/',
  code: {
    python: `import heapq
from collections import Counter, deque

def leastInterval(tasks, n):
    count = Counter(tasks)
    maxHeap = [-cnt for cnt in count.values()]
    heapq.heapify(maxHeap)

    time = 0
    q = deque()  # [(-cnt, availableTime)]

    while maxHeap or q:
        time += 1
        if maxHeap:
            cnt = 1 + heapq.heappop(maxHeap)
            if cnt:
                q.append((cnt, time + n))
        if q and q[0][1] == time:
            heapq.heappush(maxHeap, q.popleft()[0])

    return time`,
    javascript: `function leastInterval(tasks, n) {
    const count = {};
    for (const t of tasks) count[t] = (count[t] || 0) + 1;

    const maxHeap = new MaxPriorityQueue();
    for (const cnt of Object.values(count))
        maxHeap.enqueue(cnt);

    let time = 0;
    const queue = []; // [cnt, availableTime]

    while (maxHeap.size() || queue.length) {
        time++;
        if (maxHeap.size()) {
            const cnt = maxHeap.dequeue().element - 1;
            if (cnt > 0) queue.push([cnt, time + n]);
        }
        if (queue.length && queue[0][1] === time) {
            maxHeap.enqueue(queue.shift()[0]);
        }
    }

    return time;
}`,
    java: `public static int leastInterval(char[] tasks, int n) {
    Map<Character, Integer> count = new HashMap<>();
    for (char t : tasks) {
        count.put(t, count.getOrDefault(t, 0) + 1);
    }

    PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
    maxHeap.addAll(count.values());

    int time = 0;
    Queue<int[]> queue = new LinkedList<>(); // [cnt, availableTime]

    while (!maxHeap.isEmpty() || !queue.isEmpty()) {
        time++;
        if (!maxHeap.isEmpty()) {
            int cnt = maxHeap.poll() - 1;
            if (cnt > 0) {
                queue.offer(new int[]{cnt, time + n});
            }
        }
        if (!queue.isEmpty() && queue.peek()[1] == time) {
            maxHeap.offer(queue.poll()[0]);
        }
    }

    return time;
}`,
  },
  defaultInput: { tasks: ['A', 'A', 'A', 'B', 'B', 'B'], n: 2 },
  run: runTaskScheduler,
  optimalApproachName: 'Max-Heap + Cooldown Queue',
  approaches: [
    {
      id: 'greedy-math-formula',
      name: 'Greedy Math Formula',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Skip the tick-by-tick heap simulation entirely: the most frequent task fixes the schedule skeleton, so the answer is just max(len(tasks), (maxFreq-1)*(n+1) + maxCount).',
      code: {
        python: `from collections import Counter

def leastInterval(tasks, n):
    count = Counter(tasks)
    maxFreq = max(count.values())
    maxCount = sum(1 for c in count.values() if c == maxFreq)
    slots = (maxFreq - 1) * (n + 1) + maxCount
    return max(len(tasks), slots)`,
        javascript: `function leastInterval(tasks, n) {
    const count = {};
    for (const t of tasks) count[t] = (count[t] || 0) + 1;
    const freqs = Object.values(count);
    const maxFreq = Math.max(...freqs);
    const maxCount = freqs.filter((f) => f === maxFreq).length;
    const slots = (maxFreq - 1) * (n + 1) + maxCount;
    return Math.max(tasks.length, slots);
}`,
        java: `public static int leastInterval(char[] tasks, int n) {
    int[] count = new int[26];
    for (char t : tasks) count[t - 'A']++;
    int maxFreq = 0;
    for (int c : count) maxFreq = Math.max(maxFreq, c);
    int maxCount = 0;
    for (int c : count) if (c == maxFreq) maxCount++;
    int slots = (maxFreq - 1) * (n + 1) + maxCount;
    return Math.max(tasks.length, slots);
}`,
      },
      run: runTaskSchedulerMathFormula,
      lineExplanations: {
        python: {
          1: 'Import Counter for task frequencies',
          3: 'Define function with tasks and cooldown n',
          4: 'Counter walks the input once and returns the whole {value: count} map',
          5: 'Frequency of the most common task — it dictates the skeleton',
          6: 'How many tasks tie for that top frequency',
          7: 'Skeleton: (maxFreq-1) blocks of (n+1) slots, plus the finishers',
          8: 'If there are more tasks than slots, gaps overflow — no idles needed',
        },
        javascript: {
          1: 'Define function with tasks and cooldown n',
          2: 'Frequency map for the tasks',
          3: 'Count how often each task appears',
          4: 'Collect the frequency values',
          5: 'Frequency of the most common task — it dictates the skeleton',
          6: 'How many tasks tie for that top frequency',
          7: 'Skeleton: (maxFreq-1) blocks of (n+1) slots, plus the finishers',
          8: 'If there are more tasks than slots, gaps overflow — no idles needed',
        },
        java: {
          1: 'Define method with tasks and cooldown n',
          2: 'Frequency array for tasks A-Z',
          3: 'Count how often each task appears',
          4: 'Track the highest frequency',
          5: 'Find the frequency of the most common task',
          6: 'Track how many tasks tie for the top frequency',
          7: 'Count tasks sharing that top frequency',
          8: 'Skeleton: (maxFreq-1) blocks of (n+1) slots, plus the finishers',
          9: 'If there are more tasks than slots, gaps overflow — no idles needed',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq for priority queue operations',
      2: 'Import Counter for frequencies, deque for queue',
      4: 'Define function with tasks and cooldown n',
      5: 'Counter walks the input once and returns the whole {value: count} map',
      6: 'Create max-heap with negated counts',
      7: 'Heapify the array into a valid heap',
      9: 'Track elapsed time units',
      10: 'Cooldown queue: (neg count, available time)',
      12: 'Process until all tasks complete',
      13: 'Increment time each iteration',
      14: 'If tasks available in heap',
      15: 'Pop most frequent, decrement count',
      16: 'If task still has remaining occurrences',
      17: 'Add to cooldown with future available time',
      18: 'Check if cooldown task is ready',
      19: 'Move ready task back to heap',
      21: 'Return total time units needed',
    },
    javascript: {
      1: 'Define function with tasks and cooldown n',
      2: 'Count frequency of each task type',
      3: 'Increment count for each task',
      5: 'Create max priority queue',
      6: 'Enqueue each task count',
      7: 'Add count to max heap',
      9: 'Track elapsed time units',
      10: 'Cooldown queue: [count, availableTime]',
      12: 'Process until all tasks complete',
      13: 'Increment time each iteration',
      14: 'If tasks available in heap',
      15: 'Pop most frequent, decrement count',
      16: 'If remaining, add to cooldown queue',
      18: 'Check if cooldown task is ready',
      19: 'Move ready task back to heap',
      23: 'Return total time units needed',
    },
    java: {
      1: 'Define method with tasks and cooldown n',
      2: 'Count frequency of each task',
      3: 'Increment count for each task',
      4: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
      7: 'Create max-heap sorted by count descending',
      8: 'Add all task counts to heap',
      10: 'Track elapsed time units',
      11: 'Cooldown queue: [count, availableTime]',
      13: 'Process until all tasks complete',
      14: 'Increment time each iteration',
      15: 'If tasks available in heap',
      16: 'Pop most frequent task count',
      17: 'If remaining, add to cooldown',
      18: 'Queue with count and available time',
      21: 'Check if cooldown task is ready',
      22: 'Move ready task back to heap',
      26: 'Return total time units needed',
    },
  },
};
