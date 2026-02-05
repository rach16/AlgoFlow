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
  let maxHeap: { task: string; count: number }[] = Object.entries(freq)
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
  },
  defaultInput: { tasks: ['A', 'A', 'A', 'B', 'B', 'B'], n: 2 },
  run: runTaskScheduler,
};
