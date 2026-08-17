import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MeetingRoomsIIIInput {
  n: number;
  meetings: number[][];
}

/** Order busy rooms the way a (end, room) min-heap would. */
function busyOrder(a: { end: number; room: number }, b: { end: number; room: number }): number {
  return a.end - b.end || a.room - b.room;
}

function runMeetingRoomsIII(input: unknown): AlgorithmStep[] {
  const { n, meetings } = input as MeetingRoomsIIIInput;
  const steps: AlgorithmStep[] = [];

  const sorted = meetings.map(m => [...m]).sort((a, b) => a[0] - b[0]);

  const free: number[] = [];
  const busy: { end: number; room: number }[] = [];
  const count: number[] = new Array(n).fill(0);
  const scheduled: number[][] = [];

  const roomsView = (): Record<string, string> => ({
    'free rooms': free.length
      ? free.slice().sort((a, b) => a - b).map(r => `R${r}`).join(', ')
      : '(none)',
    'busy rooms': busy.length
      ? busy.slice().sort(busyOrder).map(b => `R${b.room} until ${b.end}`).join(', ')
      : '(none)',
    'meetings held': count.map((c, i) => `R${i}=${c}`).join(' | '),
  });

  const snapshot = (highlight: number[], result: string) => ({
    intervals: sorted.map(iv => [iv[0], iv[1]]),
    intervalHighlights: highlight,
    intervalSecondary: [],
    resultIntervals: scheduled.map(iv => [iv[0], iv[1]]),
    hashMap: roomsView(),
    result,
  });

  steps.push({
    state: snapshot([], `${n} rooms, ${sorted.length} meetings`),
    highlights: [],
    message: `${n} rooms, ${sorted.length} meetings. A meeting always takes the LOWEST-numbered free room; if every room is busy it waits for the first one to free up but keeps its full duration. Sort meetings by start time so we handle them in the order they are requested.`,
    codeLine: 4,
  } as AlgorithmStep);

  for (let r = 0; r < n; r++) free.push(r);

  steps.push({
    state: snapshot([], `Free: ${free.map(r => `R${r}`).join(', ')}`),
    highlights: [],
    message: `Two heaps do all the work: 'free' is a min-heap of room INDICES (so popping gives the lowest-numbered free room) and 'busy' is a min-heap of (endTime, room) pairs (so popping gives the room that frees up first). Start with all ${n} rooms free.`,
    codeLine: 6,
    action: 'push',
  } as AlgorithmStep);

  for (let i = 0; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const duration = end - start;

    steps.push({
      state: snapshot([i], `Meeting [${start}, ${end}], duration ${duration}`),
      highlights: [],
      message: `Meeting ${i + 1} of ${sorted.length}: [${start}, ${end}], duration ${duration}. Before assigning it, release every room whose meeting has already ended by time ${start}.`,
      codeLine: 10,
      action: 'visit',
    } as AlgorithmStep);

    busy.sort(busyOrder);
    while (busy.length > 0 && busy[0].end <= start) {
      const done = busy.shift()!;
      free.push(done.room);
      free.sort((a, b) => a - b);

      steps.push({
        state: snapshot([i], `R${done.room} freed at ${done.end}`),
        highlights: [],
        message: `Busy heap top is (end=${done.end}, R${done.room}) and ${done.end} <= ${start} — that meeting is over, so R${done.room} goes back into the free heap.`,
        codeLine: 13,
        action: 'pop',
      } as AlgorithmStep);
    }

    if (free.length > 0) {
      const room = free.shift()!;
      busy.push({ end, room });
      busy.sort(busyOrder);
      count[room]++;
      scheduled.push([start, end]);

      steps.push({
        state: snapshot([i], `R${room} holds [${start}, ${end}]`),
        highlights: [],
        message: `At least one room is free — pop the free heap to get the smallest index, R${room}. Meeting runs on time as [${start}, ${end}]. R${room} has now hosted ${count[room]} meeting${count[room] === 1 ? '' : 's'}.`,
        codeLine: 16,
        action: 'insert',
      } as AlgorithmStep);
    } else {
      const earliest = busy.shift()!;
      const newEnd = earliest.end + duration;
      const room = earliest.room;
      busy.push({ end: newEnd, room });
      busy.sort(busyOrder);
      count[room]++;
      scheduled.push([earliest.end, newEnd]);

      steps.push({
        state: snapshot([i], `Delayed to [${earliest.end}, ${newEnd}] in R${room}`),
        highlights: [],
        message: `Every room is busy. The busy heap's top is (end=${earliest.end}, R${room}) — earliest end, and lowest room index on ties, which is exactly the tie-break the problem asks for. The meeting is DELAYED to [${earliest.end}, ${newEnd}]: same duration ${duration}, just shifted. R${room} has now hosted ${count[room]} meeting${count[room] === 1 ? '' : 's'}.`,
        codeLine: 19,
        action: 'swap',
      } as AlgorithmStep);
    }
  }

  let best = 0;
  for (let r = 1; r < n; r++) {
    if (count[r] > count[best]) best = r;
  }

  steps.push({
    state: snapshot([], `Answer: room ${best}`),
    highlights: [],
    message: `Final tally ${count.map((c, r) => `R${r}=${c}`).join(', ')}. The busiest room is R${best}${count.filter(c => c === count[best]).length > 1 ? ' (tied, so take the lowest index)' : ''} with ${count[best]} meetings. Answer: ${best}.`,
    codeLine: 22,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runMeetingRoomsIIILinearScan(input: unknown): AlgorithmStep[] {
  const { n, meetings } = input as MeetingRoomsIIIInput;
  const steps: AlgorithmStep[] = [];

  const sorted = meetings.map(m => [...m]).sort((a, b) => a[0] - b[0]);

  const endTime: number[] = new Array(n).fill(0);
  const count: number[] = new Array(n).fill(0);
  const scheduled: number[][] = [];

  const roomsView = (): Record<string, string> => ({
    'endTime[]': endTime.map((t, r) => `R${r}=${t}`).join(' | '),
    'meetings held': count.map((c, r) => `R${r}=${c}`).join(' | '),
  });

  const snapshot = (highlight: number[], result: string) => ({
    intervals: sorted.map(iv => [iv[0], iv[1]]),
    intervalHighlights: highlight,
    intervalSecondary: [],
    resultIntervals: scheduled.map(iv => [iv[0], iv[1]]),
    hashMap: roomsView(),
    result,
  });

  steps.push({
    state: snapshot([], `${n} rooms, all idle`),
    highlights: [],
    message: `No heaps at all. Because n is small, just keep one array endTime[r] = the moment room r becomes free, and scan all ${n} rooms for each meeting. Simpler to write and cache-friendly; the cost is O(n) per meeting instead of O(log n).`,
    codeLine: 3,
  } as AlgorithmStep);

  for (let i = 0; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const duration = end - start;

    steps.push({
      state: snapshot([i], `Meeting [${start}, ${end}], duration ${duration}`),
      highlights: [],
      message: `Meeting ${i + 1} of ${sorted.length}: [${start}, ${end}], duration ${duration}. Scan rooms left to right, stopping at the first one already free at ${start}.`,
      codeLine: 6,
      action: 'visit',
    } as AlgorithmStep);

    let room = -1;
    let earliest = Infinity;
    let foundFree = false;
    for (let r = 0; r < n; r++) {
      if (endTime[r] <= start) {
        room = r;
        foundFree = true;
        break;
      }
      if (endTime[r] < earliest) {
        earliest = endTime[r];
        room = r;
      }
    }

    steps.push({
      state: snapshot([i], foundFree ? `R${room} is idle` : `R${room} frees first at ${earliest}`),
      highlights: [],
      message: foundFree
        ? `Scan: ${endTime.map((t, r) => `R${r} free at ${t}`).join(', ')}. R${room} is the first with endTime <= ${start}, so we break immediately — scanning left to right automatically gives the lowest index.`
        : `Scan: ${endTime.map((t, r) => `R${r} free at ${t}`).join(', ')}. None is free at ${start}, so track the minimum endTime instead. Strict "<" keeps the FIRST room on ties, which is the lowest index — R${room} at ${earliest}.`,
      codeLine: 9,
      action: 'compare',
    } as AlgorithmStep);

    if (endTime[room] <= start) {
      endTime[room] = end;
      count[room]++;
      scheduled.push([start, end]);

      steps.push({
        state: snapshot([i], `R${room} holds [${start}, ${end}]`),
        highlights: [],
        message: `R${room} was idle, so the meeting runs on time: [${start}, ${end}]. endTime[${room}] = ${end}, and R${room} has hosted ${count[room]} meeting${count[room] === 1 ? '' : 's'}.`,
        codeLine: 17,
        action: 'insert',
      } as AlgorithmStep);
    } else {
      const newEnd = earliest + duration;
      endTime[room] = newEnd;
      count[room]++;
      scheduled.push([earliest, newEnd]);

      steps.push({
        state: snapshot([i], `Delayed to [${earliest}, ${newEnd}] in R${room}`),
        highlights: [],
        message: `Nothing was free, so the meeting waits for R${room} and runs [${earliest}, ${newEnd}] — the duration ${duration} is preserved. endTime[${room}] = ${newEnd}, and R${room} has hosted ${count[room]} meeting${count[room] === 1 ? '' : 's'}.`,
        codeLine: 19,
        action: 'swap',
      } as AlgorithmStep);
    }
  }

  let best = 0;
  for (let r = 1; r < n; r++) {
    if (count[r] > count[best]) best = r;
  }

  steps.push({
    state: snapshot([], `Answer: room ${best}`),
    highlights: [],
    message: `Final tally ${count.map((c, r) => `R${r}=${c}`).join(', ')}. Same answer as the two-heap version: room ${best}. With n up to 100 the O(m·n) scan is fine; the heaps only pay off when n is large.`,
    codeLine: 22,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const meetingRoomsIII: Algorithm = {
  id: 'meeting-rooms-iii',
  name: 'Meeting Rooms III',
  category: 'Intervals',
  difficulty: 'Hard',
  timeComplexity: 'O(m log m + m log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Min Heap — two heaps: free rooms by index, busy rooms by end time',
  description:
    'You are given n meeting rooms numbered 0 to n-1 and a list of meetings [start, end]. Each meeting is held in the lowest-numbered available room; if no room is free, it is delayed until one frees up while keeping the same duration. Return the room that held the most meetings, breaking ties by the lowest room number.',
  problemUrl: 'https://leetcode.com/problems/meeting-rooms-iii/',
  code: {
    python: `import heapq

def mostBooked(n, meetings):
    meetings.sort()
    free = list(range(n))
    heapq.heapify(free)
    busy = []
    count = [0] * n

    for start, end in meetings:
        while busy and busy[0][0] <= start:
            _, room = heapq.heappop(busy)
            heapq.heappush(free, room)
        if free:
            room = heapq.heappop(free)
            heapq.heappush(busy, (end, room))
        else:
            endTime, room = heapq.heappop(busy)
            heapq.heappush(busy, (endTime + end - start, room))
        count[room] += 1

    return count.index(max(count))`,
    javascript: `function mostBooked(n, meetings) {
    meetings.sort((a, b) => a[0] - b[0]);
    const free = Array.from({ length: n }, (_, i) => i);
    const busy = [];
    const count = new Array(n).fill(0);

    for (const [start, end] of meetings) {
        while (busy.length && busy[0][0] <= start) {
            free.push(busy.shift()[1]);
            free.sort((a, b) => a - b);
        }
        let room;
        if (free.length) {
            room = free.shift();
            busy.push([end, room]);
        } else {
            const [endTime, r] = busy.shift();
            room = r;
            busy.push([endTime + end - start, room]);
        }
        busy.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        count[room]++;
    }

    let best = 0;
    for (let i = 1; i < n; i++) {
        if (count[i] > count[best]) best = i;
    }
    return best;
}`,
    java: `public static int mostBooked(int n, int[][] meetings) {
    Arrays.sort(meetings, (a, b) -> a[0] - b[0]);
    PriorityQueue<Integer> free = new PriorityQueue<>();
    for (int i = 0; i < n; i++) free.add(i);
    PriorityQueue<long[]> busy = new PriorityQueue<>(
        (a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
    int[] count = new int[n];

    for (int[] m : meetings) {
        while (!busy.isEmpty() && busy.peek()[0] <= m[0]) {
            free.add((int) busy.poll()[1]);
        }
        int room;
        if (!free.isEmpty()) {
            room = free.poll();
            busy.add(new long[] { m[1], room });
        } else {
            long[] top = busy.poll();
            room = (int) top[1];
            busy.add(new long[] { top[0] + m[1] - m[0], room });
        }
        count[room]++;
    }

    int best = 0;
    for (int i = 1; i < n; i++) {
        if (count[i] > count[best]) best = i;
    }
    return best;
}`,
  },
  defaultInput: {
    n: 2,
    meetings: [
      [0, 4],
      [1, 3],
      [2, 6],
      [5, 9],
      [10, 12],
    ],
  },
  run: runMeetingRoomsIII,
  optimalApproachName: 'Two Heaps',
  approaches: [
    {
      id: 'linear-room-scan',
      name: 'Linear Room Scan',
      timeComplexity: 'O(m log m + m·n)',
      spaceComplexity: 'O(n)',
      description:
        'Drop both heaps and keep a plain endTime[] array, scanning all n rooms per meeting to find the first idle room (or the one that frees soonest) — O(n) per meeting instead of O(log n), but far less machinery and the left-to-right scan gives the lowest-index tie-break for free.',
      code: {
        python: `def mostBooked(n, meetings):
    meetings.sort()
    endTime = [0] * n
    count = [0] * n

    for start, end in meetings:
        room = -1
        earliest = float('inf')
        for i in range(n):
            if endTime[i] <= start:
                room = i
                break
            if endTime[i] < earliest:
                earliest = endTime[i]
                room = i
        if endTime[room] <= start:
            endTime[room] = end
        else:
            endTime[room] = earliest + end - start
        count[room] += 1

    return count.index(max(count))`,
        javascript: `function mostBooked(n, meetings) {
    meetings.sort((a, b) => a[0] - b[0]);
    const endTime = new Array(n).fill(0);
    const count = new Array(n).fill(0);

    for (const [start, end] of meetings) {
        let room = -1;
        let earliest = Infinity;
        for (let i = 0; i < n; i++) {
            if (endTime[i] <= start) {
                room = i;
                break;
            }
            if (endTime[i] < earliest) {
                earliest = endTime[i];
                room = i;
            }
        }
        if (endTime[room] <= start) {
            endTime[room] = end;
        } else {
            endTime[room] = earliest + end - start;
        }
        count[room]++;
    }

    let best = 0;
    for (let i = 1; i < n; i++) {
        if (count[i] > count[best]) best = i;
    }
    return best;
}`,
        java: `public static int mostBooked(int n, int[][] meetings) {
    Arrays.sort(meetings, (a, b) -> a[0] - b[0]);
    long[] endTime = new long[n];
    int[] count = new int[n];

    for (int[] m : meetings) {
        int room = -1;
        long earliest = Long.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            if (endTime[i] <= m[0]) {
                room = i;
                break;
            }
            if (endTime[i] < earliest) {
                earliest = endTime[i];
                room = i;
            }
        }
        if (endTime[room] <= m[0]) {
            endTime[room] = m[1];
        } else {
            endTime[room] = earliest + m[1] - m[0];
        }
        count[room]++;
    }

    int best = 0;
    for (int i = 1; i < n; i++) {
        if (count[i] > count[best]) best = i;
    }
    return best;
}`,
      },
      run: runMeetingRoomsIIILinearScan,
      lineExplanations: {
        python: {
          1: 'Define function taking room count and meetings',
          2: 'Handle meetings in request order',
          3: 'endTime[r] = moment room r becomes free',
          4: 'How many meetings each room has hosted',
          6: 'Process meetings from earliest start',
          7: 'Room this meeting will land in',
          8: 'Smallest endTime seen when nothing is free',
          9: 'Scan every room left to right',
          10: 'Room i is already idle at this start time',
          11: 'Take it — left-to-right means lowest index',
          12: 'Stop scanning, no need to look further',
          13: 'Strict < keeps the first room on ties',
          14: 'Remember the earliest freeing time',
          15: 'and the room it belongs to',
          16: 'Did the scan actually find an idle room?',
          17: 'Yes — the meeting runs on time',
          18: 'No — every room was busy',
          19: 'Delay it, preserving the duration end - start',
          20: 'Credit the meeting to that room',
          22: 'Most meetings; index() returns the lowest on ties',
        },
        javascript: {
          1: 'Define function taking room count and meetings',
          2: 'Handle meetings in request order',
          3: 'endTime[r] = moment room r becomes free',
          4: 'How many meetings each room has hosted',
          6: 'Process meetings from earliest start',
          7: 'Room this meeting will land in',
          8: 'Smallest endTime seen when nothing is free',
          9: 'Scan every room left to right',
          10: 'Room i is already idle at this start time',
          11: 'Take it — left-to-right means lowest index',
          12: 'Stop scanning, no need to look further',
          14: 'Strict < keeps the first room on ties',
          15: 'Remember the earliest freeing time',
          16: 'and the room it belongs to',
          19: 'Did the scan actually find an idle room?',
          20: 'Yes — the meeting runs on time',
          22: 'No — delay it, preserving the duration',
          24: 'Credit the meeting to that room',
          27: 'Scan the tally for the busiest room',
          29: 'Strict > keeps the lowest index on ties',
          31: 'Return the busiest room number',
        },
        java: {
          1: 'Define method taking room count and meetings',
          2: 'Handle meetings in request order',
          3: 'endTime[r] = moment room r becomes free (long: times can exceed int)',
          4: 'How many meetings each room has hosted',
          6: 'Process meetings from earliest start',
          7: 'Room this meeting will land in',
          8: 'Smallest endTime seen when nothing is free',
          9: 'Scan every room left to right',
          10: 'Room i is already idle at this start time',
          11: 'Take it — left-to-right means lowest index',
          12: 'Stop scanning, no need to look further',
          14: 'Strict < keeps the first room on ties',
          15: 'Remember the earliest freeing time',
          16: 'and the room it belongs to',
          19: 'Did the scan actually find an idle room?',
          20: 'Yes — the meeting runs on time',
          22: 'No — delay it, preserving the duration',
          24: 'Credit the meeting to that room',
          27: 'Scan the tally for the busiest room',
          29: 'Strict > keeps the lowest index on ties',
          31: 'Return the busiest room number',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'heapq gives us both min-heaps',
      3: 'Define function taking room count and meetings',
      4: 'Sort by start so meetings arrive in request order',
      5: 'Heap of FREE room indices — smallest index pops first',
      6: 'Turn the list into a valid heap in O(n)',
      7: 'Heap of (endTime, room) for rooms currently in use',
      8: 'How many meetings each room has hosted',
      10: 'Process each meeting in start order',
      11: 'Any room whose meeting ended by this start is now free',
      12: 'Pop the earliest-finishing busy room',
      13: 'Return it to the free heap',
      14: 'Is there a room available right now?',
      15: 'Yes — pop the lowest-numbered free room',
      16: 'Mark it busy until this meeting ends',
      17: 'Otherwise every room is occupied',
      18: 'Steal the room that frees up first (lowest index on ties)',
      19: 'Delay the meeting: shift it but keep duration end - start',
      20: 'Credit the meeting to whichever room got it',
      22: 'Most meetings; index() returns the lowest on ties',
    },
    javascript: {
      1: 'Define function taking room count and meetings',
      2: 'Sort by start so meetings arrive in request order',
      3: 'Sorted list of FREE room indices — smallest index first',
      4: 'Sorted list of [endTime, room] for rooms in use',
      5: 'How many meetings each room has hosted',
      7: 'Process each meeting in start order',
      8: 'Any room whose meeting ended by this start is now free',
      9: 'Move the earliest-finishing room back to free',
      10: 'Keep free ordered so shift() gives the lowest index',
      12: 'Room this meeting will land in',
      13: 'Is there a room available right now?',
      14: 'Yes — take the lowest-numbered free room',
      15: 'Mark it busy until this meeting ends',
      17: 'Otherwise steal the room that frees up first',
      19: 'Delay the meeting but keep duration end - start',
      21: 'Re-sort: earliest end first, lowest room on ties',
      22: 'Credit the meeting to whichever room got it',
      25: 'Scan the tally for the busiest room',
      27: 'Strict > keeps the lowest index on ties',
      29: 'Return the busiest room number',
    },
    java: {
      1: 'Define method taking room count and meetings',
      2: 'Sort by start so meetings arrive in request order',
      3: 'Min-heap of FREE room indices — smallest index polls first',
      4: 'Every room starts out free',
      5: 'Min-heap of {endTime, room} for rooms in use',
      6: 'Order by end time, then by room index on ties',
      7: 'How many meetings each room has hosted',
      9: 'Process each meeting in start order',
      10: 'Any room whose meeting ended by this start is now free',
      11: 'Move the earliest-finishing room back to free',
      13: 'Room this meeting will land in',
      14: 'Is there a room available right now?',
      15: 'Yes — poll the lowest-numbered free room',
      16: 'Mark it busy until this meeting ends',
      18: 'Otherwise steal the room that frees up first',
      19: 'That room becomes this meeting\'s home',
      20: 'Delay it but keep duration m[1] - m[0]',
      22: 'Credit the meeting to whichever room got it',
      25: 'Scan the tally for the busiest room',
      27: 'Strict > keeps the lowest index on ties',
      29: 'Return the busiest room number',
    },
  },
};
