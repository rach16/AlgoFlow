import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMeetingRoomsII(input: unknown): AlgorithmStep[] {
  const intervals = (input as number[][]).map(iv => [...iv]);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      count: 0,
      result: 'Finding minimum meeting rooms...',
    },
    highlights: [],
    message: `Use start/end time arrays to count overlapping meetings.`,
    codeLine: 1,
  } as AlgorithmStep);

  const starts = intervals.map(iv => iv[0]).sort((a, b) => a - b);
  const ends = intervals.map(iv => iv[1]).sort((a, b) => a - b);

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      nums: starts,
      result: `Starts: [${starts.join(', ')}], Ends: [${ends.join(', ')}]`,
    },
    highlights: [],
    message: `Sorted starts: [${starts.join(', ')}], sorted ends: [${ends.join(', ')}].`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  let rooms = 0;
  let maxRooms = 0;
  let s = 0;
  let e = 0;

  while (s < starts.length) {
    if (starts[s] < ends[e]) {
      // A meeting starts before the earliest ending
      rooms++;
      maxRooms = Math.max(maxRooms, rooms);

      steps.push({
        state: {
          intervals: intervals.map(iv => [...iv]),
          intervalHighlights: [],
          intervalSecondary: [],
          count: rooms,
          result: `Rooms in use: ${rooms}, Max: ${maxRooms}`,
        },
        highlights: [],
        pointers: { s, e },
        message: `Start[${s}]=${starts[s]} < End[${e}]=${ends[e]}: meeting starts. Rooms = ${rooms}. Max = ${maxRooms}.`,
        codeLine: 4,
        action: 'push',
      } as AlgorithmStep);

      s++;
    } else {
      // A meeting ends
      rooms--;

      steps.push({
        state: {
          intervals: intervals.map(iv => [...iv]),
          intervalHighlights: [],
          intervalSecondary: [],
          count: rooms,
          result: `Rooms in use: ${rooms}, Max: ${maxRooms}`,
        },
        highlights: [],
        pointers: { s, e },
        message: `Start[${s}]=${starts[s]} >= End[${e}]=${ends[e]}: meeting ends. Rooms = ${rooms}.`,
        codeLine: 6,
        action: 'pop',
      } as AlgorithmStep);

      e++;
    }
  }

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      count: maxRooms,
      result: `Minimum rooms needed: ${maxRooms}`,
    },
    highlights: [],
    message: `Done! Minimum meeting rooms needed = ${maxRooms}.`,
    codeLine: 8,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runMeetingRoomsIIMinHeap(input: unknown): AlgorithmStep[] {
  const intervals = (input as number[][]).map(iv => [...iv]);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      count: 0,
      result: 'Finding minimum meeting rooms...',
    },
    highlights: [],
    message: `Min-heap idea: process meetings by start time; the heap holds the end time of every occupied room, with the earliest-ending room on top.`,
    codeLine: 1,
  } as AlgorithmStep);

  const sorted = intervals.map(iv => [...iv]).sort((a, b) => a[0] - b[0]);

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      count: 0,
      result: `Sorted by start time`,
    },
    highlights: [],
    message: `Sorted by start time: [${sorted.map(s => `[${s.join(',')}]`).join(', ')}].`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  // Min-heap of end times, kept as a sorted array (smallest first)
  const heap: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const [start, end] = sorted[i];

    steps.push({
      state: {
        intervals: sorted.map(iv => [...iv]),
        intervalHighlights: [i],
        intervalSecondary: [],
        nums: [...heap],
        count: heap.length,
        result: heap.length
          ? `Earliest room frees at ${heap[0]}; meeting starts at ${start}`
          : 'No rooms occupied yet',
      },
      highlights: [],
      message: heap.length
        ? `Meeting [${start}, ${end}]: earliest-ending room frees at ${heap[0]}. Does ${heap[0]} <= ${start}?`
        : `Meeting [${start}, ${end}]: no rooms occupied yet — it must open the first room.`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);

    if (heap.length > 0 && heap[0] <= start) {
      heap.shift();
      heap.push(end);
      heap.sort((a, b) => a - b);

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: [i],
          intervalSecondary: [],
          nums: [...heap],
          count: heap.length,
          result: `Reused a room. Rooms: ${heap.length}`,
        },
        highlights: [],
        message: `Yes — that room is free. Reuse it: pop the old end time, push ${end}. Rooms stay at ${heap.length}.`,
        codeLine: 7,
        action: 'pop',
      } as AlgorithmStep);
    } else {
      heap.push(end);
      heap.sort((a, b) => a - b);

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: [i],
          intervalSecondary: [],
          nums: [...heap],
          count: heap.length,
          result: `Opened a new room. Rooms: ${heap.length}`,
        },
        highlights: [],
        message: `No free room — every occupied room is still running. Open a new room ending at ${end}. Rooms = ${heap.length}.`,
        codeLine: 9,
        action: 'push',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      nums: [...heap],
      count: heap.length,
      result: `Minimum rooms needed: ${heap.length}`,
    },
    highlights: [],
    message: `Done! The heap size — ${heap.length} — is the minimum number of rooms, since a room was only added when no existing room was free.`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const meetingRoomsII: Algorithm = {
  id: 'meeting-rooms-ii',
  name: 'Meeting Rooms II',
  category: 'Intervals',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Min Heap — sort by start, heap tracks room end times',
  description:
    'Given an array of meeting time intervals intervals where intervals[i] = [starti, endi], return the minimum number of conference rooms required.',
  problemUrl: 'https://leetcode.com/problems/meeting-rooms-ii/',
  code: {
    python: `def minMeetingRooms(intervals):
    starts = sorted([i[0] for i in intervals])
    ends = sorted([i[1] for i in intervals])

    rooms = 0
    maxRooms = 0
    s, e = 0, 0

    while s < len(starts):
        if starts[s] < ends[e]:
            rooms += 1
            maxRooms = max(maxRooms, rooms)
            s += 1
        else:
            rooms -= 1
            e += 1

    return maxRooms`,
    javascript: `function minMeetingRooms(intervals) {
    const starts = intervals.map(i => i[0]).sort((a,b) => a-b);
    const ends = intervals.map(i => i[1]).sort((a,b) => a-b);

    let rooms = 0, maxRooms = 0;
    let s = 0, e = 0;

    while (s < starts.length) {
        if (starts[s] < ends[e]) {
            rooms++;
            maxRooms = Math.max(maxRooms, rooms);
            s++;
        } else {
            rooms--;
            e++;
        }
    }

    return maxRooms;
}`,
    java: `public static int minMeetingRooms(int[][] intervals) {
    int[] starts = new int[intervals.length];
    int[] ends = new int[intervals.length];

    for (int i = 0; i < intervals.length; i++) {
        starts[i] = intervals[i][0];
        ends[i] = intervals[i][1];
    }

    Arrays.sort(starts);
    Arrays.sort(ends);

    int rooms = 0, maxRooms = 0;
    int s = 0, e = 0;

    while (s < starts.length) {
        if (starts[s] < ends[e]) {
            rooms++;
            maxRooms = Math.max(maxRooms, rooms);
            s++;
        } else {
            rooms--;
            e++;
        }
    }

    return maxRooms;
}`,
  },
  defaultInput: [[0, 30], [5, 10], [15, 20]],
  run: runMeetingRoomsII,
  optimalApproachName: 'Two Pointers (Start/End Arrays)',
  approaches: [
    {
      id: 'min-heap-end-times',
      name: 'Min-Heap of End Times',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of counting with separate start/end arrays, simulate the rooms directly: a min-heap of end times tells each meeting whether the earliest-finishing room is free to reuse or a new room must open.',
      code: {
        python: `import heapq

def minMeetingRooms(intervals):
    intervals.sort(key=lambda i: i[0])
    heap = []  # end times of occupied rooms

    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heapreplace(heap, end)
        else:
            heapq.heappush(heap, end)

    return len(heap)`,
        javascript: `function minMeetingRooms(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const heap = []; // end times of occupied rooms

    for (const [start, end] of intervals) {
        heap.sort((a, b) => a - b);
        if (heap.length && heap[0] <= start) {
            heap.shift(); // reuse the freed room
        }
        heap.push(end);
    }

    return heap.length;
}`,
        java: `public static int minMeetingRooms(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    PriorityQueue<Integer> heap = new PriorityQueue<>();

    for (int[] interval : intervals) {
        if (!heap.isEmpty() && heap.peek() <= interval[0]) {
            heap.poll(); // reuse the freed room
        }
        heap.offer(interval[1]);
    }

    return heap.size();
}`,
      },
      run: runMeetingRoomsIIMinHeap,
      lineExplanations: {
        python: {
          1: 'Import heapq — Python ships a min-heap only, so max-heaps use negated values',
          3: 'Define function taking intervals list',
          4: 'Sort meetings by start time',
          5: 'Min-heap of end times — one entry per occupied room',
          7: 'Process meetings in chronological start order',
          8: 'Earliest-ending room already free when this meeting starts?',
          9: 'Reuse that room: swap its end time for this meeting’s end',
          10: 'Otherwise every room is busy',
          11: 'Open a new room ending at this meeting’s end',
          13: 'Heap size = rooms ever needed simultaneously',
        },
        javascript: {
          1: 'Define function taking intervals array',
          2: 'Sort meetings by start time',
          3: 'Min-heap of end times — one entry per occupied room',
          5: 'Process meetings in chronological start order',
          6: 'Keep smallest end time at index 0 (simulated heap)',
          7: 'Earliest-ending room already free when this meeting starts?',
          8: 'Reuse it: remove the freed room’s end time',
          10: 'Occupy a room ending at this meeting’s end',
          13: 'Heap size = rooms ever needed simultaneously',
        },
        java: {
          1: 'Define method taking intervals 2D array',
          2: 'Sort meetings by start time',
          3: 'Min-heap of end times — one entry per occupied room',
          5: 'Process meetings in chronological start order',
          6: 'Earliest-ending room already free when this meeting starts?',
          7: 'Reuse it: remove the freed room’s end time',
          9: 'Occupy a room ending at this meeting’s end',
          12: 'Heap size = rooms ever needed simultaneously',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking intervals list',
      2: 'Extract and sort all start times',
      3: 'Extract and sort all end times',
      5: 'Track current rooms in use',
      6: 'Track maximum rooms needed',
      7: 'Init start and end pointers',
      9: 'Process all start events',
      10: 'Meeting starts before earliest end',
      11: 'Need one more room',
      12: 'Update maximum rooms seen',
      13: 'Move to next start time',
      15: 'A meeting ends, free a room',
      16: 'Move to next end time',
      18: 'Return peak number of rooms needed',
    },
    javascript: {
      1: 'Define function taking intervals array',
      2: 'Extract and sort all start times',
      3: 'Extract and sort all end times',
      5: 'Track rooms in use and max rooms needed',
      6: 'Init start and end pointers',
      8: 'Process all start events',
      9: 'Meeting starts before earliest end',
      10: 'Need one more room',
      11: 'Update maximum rooms seen',
      12: 'Move to next start time',
      14: 'A meeting ends, free a room',
      15: 'Move to next end time',
      19: 'Return peak number of rooms needed',
    },
    java: {
      1: 'Define method taking intervals 2D array',
      2: 'Create starts array',
      3: 'Create ends array',
      5: 'Extract start and end times from intervals',
      6: 'Store each start time',
      7: 'Store each end time',
      10: 'Sort start times ascending',
      11: 'Sort end times ascending',
      13: 'Track rooms in use and max rooms',
      14: 'Init start and end pointers',
      16: 'Process all start events',
      17: 'Meeting starts before earliest end',
      18: 'Need one more room',
      19: 'Update maximum rooms seen',
      20: 'Move to next start time',
      22: 'A meeting ends, free a room',
      23: 'Move to next end time',
      27: 'Return peak number of rooms needed',
    },
  },
};
