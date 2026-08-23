import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMeetingRooms(input: unknown): AlgorithmStep[] {
  const intervals = (input as number[][]).map(iv => [...iv]);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: 'Can a person attend all meetings?',
    },
    highlights: [],
    message: `Sort meetings by start time and check for overlaps.`,
    codeLine: 1,
  } as AlgorithmStep);

  const sorted = intervals.map(iv => [...iv]).sort((a, b) => a[0] - b[0]);

  steps.push({
    state: {
      intervals: sorted.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: `Sorted by start time`,
    },
    highlights: [],
    message: `Sorted: [${sorted.map(s => `[${s.join(',')}]`).join(', ')}].`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  let canAttend = true;

  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = sorted[i - 1][1];
    const curStart = sorted[i][0];

    steps.push({
      state: {
        intervals: sorted.map(iv => [...iv]),
        intervalHighlights: [i - 1, i],
        intervalSecondary: [],
        result: `Comparing meeting ${i - 1} and ${i}`,
      },
      highlights: [],
      message: `Meeting ${i - 1} ends at ${prevEnd}, meeting ${i} starts at ${curStart}. ${curStart < prevEnd ? 'OVERLAP!' : 'No overlap.'}`,
      codeLine: 4,
      action: 'compare',
    } as AlgorithmStep);

    if (curStart < prevEnd) {
      canAttend = false;

      steps.push({
        state: {
          intervals: sorted.map(iv => [...iv]),
          intervalHighlights: [i - 1, i],
          intervalSecondary: [],
          result: 'false - Meetings overlap!',
        },
        highlights: [],
        message: `Overlap found: [${sorted[i - 1].join(',')}] and [${sorted[i].join(',')}]. Cannot attend all meetings.`,
        codeLine: 5,
        action: 'found',
      } as AlgorithmStep);
      break;
    }
  }

  if (canAttend) {
    steps.push({
      state: {
        intervals: sorted.map(iv => [...iv]),
        intervalHighlights: [],
        intervalSecondary: [],
        result: 'true - Can attend all meetings!',
      },
      highlights: [],
      message: `No overlaps found. Can attend all ${sorted.length} meetings!`,
      codeLine: 7,
      action: 'found',
    } as AlgorithmStep);
  }

  return steps;
}

function runMeetingRoomsSweepLine(input: unknown): AlgorithmStep[] {
  const intervals = (input as number[][]).map(iv => [...iv]);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: 'Can a person attend all meetings?',
    },
    highlights: [],
    message: `Sweep line idea: turn each meeting into a +1 start event and a -1 end event. If the running count ever exceeds 1, two meetings overlap.`,
    codeLine: 2,
  } as AlgorithmStep);

  const events: { time: number; delta: number; ivIdx: number }[] = [];
  intervals.forEach((iv, idx) => {
    events.push({ time: iv[0], delta: 1, ivIdx: idx });
    events.push({ time: iv[1], delta: -1, ivIdx: idx });
  });
  // Ends before starts at the same time: back-to-back meetings are fine
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: `Events: ${events.map(e => `${e.time}${e.delta > 0 ? '+' : '-'}`).join(' ')}`,
    },
    highlights: [],
    message: `Sorted events (ends before starts on ties, so back-to-back meetings are OK): ${events.map(e => `(${e.time}, ${e.delta > 0 ? '+1' : '-1'})`).join(', ')}.`,
    codeLine: 6,
    action: 'visit',
  } as AlgorithmStep);

  let count = 0;
  let active = -1;

  for (const e of events) {
    count += e.delta;

    if (count > 1) {
      steps.push({
        state: {
          intervals: intervals.map(iv => [...iv]),
          intervalHighlights: [active, e.ivIdx],
          intervalSecondary: [],
          result: 'false - Meetings overlap!',
        },
        highlights: [],
        message: `At time ${e.time} the count reaches ${count} — two meetings are running at once. Cannot attend all meetings.`,
        codeLine: 12,
        action: 'found',
      } as AlgorithmStep);

      return steps;
    }

    steps.push({
      state: {
        intervals: intervals.map(iv => [...iv]),
        intervalHighlights: [e.ivIdx],
        intervalSecondary: [],
        result: `Time ${e.time}: ${count} meeting${count === 1 ? '' : 's'} in progress`,
      },
      highlights: [],
      message: `${e.delta > 0 ? 'Start' : 'End'} event at time ${e.time}: count ${e.delta > 0 ? 'rises' : 'drops'} to ${count} — still at most one meeting at a time.`,
      codeLine: 10,
      action: e.delta > 0 ? 'push' : 'pop',
    } as AlgorithmStep);

    active = e.delta > 0 ? e.ivIdx : -1;
  }

  steps.push({
    state: {
      intervals: intervals.map(iv => [...iv]),
      intervalHighlights: [],
      intervalSecondary: [],
      result: 'true - Can attend all meetings!',
    },
    highlights: [],
    message: `The count never exceeded 1 — no two meetings overlap. Can attend all ${intervals.length} meetings!`,
    codeLine: 14,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const meetingRooms: Algorithm = {
  id: 'meeting-rooms',
  name: 'Meeting Rooms',
  category: 'Intervals',
  difficulty: 'Easy',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Sort — if any overlap exists, cannot attend all',
  description:
    'Given an array of meeting time intervals where intervals[i] = [starti, endi], determine if a person could attend all meetings.',
  problemUrl: 'https://leetcode.com/problems/meeting-rooms/',
  code: {
    python: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda i: i[0])

    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i-1][1]:
            return False

    return True`,
    javascript: `function canAttendMeetings(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);

    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < intervals[i-1][1]) {
            return false;
        }
    }

    return true;
}`,
    java: `public static boolean canAttendMeetings(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < intervals[i - 1][1]) {
            return false;
        }
    }
    return true;
}`,
  },
  defaultInput: [[0, 30], [5, 10], [15, 20]],
  run: runMeetingRooms,
  optimalApproachName: 'Sort + Adjacent Check',
  approaches: [
    {
      id: 'sweep-line-events',
      name: 'Sweep Line (Events)',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Rather than comparing sorted neighbors, split meetings into +1/-1 time events and sweep chronologically — if the running count of simultaneous meetings ever exceeds 1, there is a conflict.',
      code: {
        python: `def canAttendMeetings(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    events.sort()

    count = 0
    for time, delta in events:
        count += delta
        if count > 1:
            return False

    return True`,
        javascript: `function canAttendMeetings(intervals) {
    const events = [];
    for (const [start, end] of intervals) {
        events.push([start, 1]);
        events.push([end, -1]);
    }
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    let count = 0;
    for (const [time, delta] of events) {
        count += delta;
        if (count > 1) return false;
    }

    return true;
}`,
        java: `public static boolean canAttendMeetings(int[][] intervals) {
    int n = intervals.length;
    int[][] events = new int[2 * n][2];
    for (int i = 0; i < n; i++) {
        events[2 * i] = new int[] { intervals[i][0], 1 };
        events[2 * i + 1] = new int[] { intervals[i][1], -1 };
    }
    Arrays.sort(events, (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);

    int count = 0;
    for (int[] e : events) {
        count += e[1];
        if (count > 1) return false;
    }

    return true;
}`,
      },
      run: runMeetingRoomsSweepLine,
      lineExplanations: {
        python: {
          1: 'Define function taking list of intervals',
          2: 'Event list: meeting boundaries with +1/-1 deltas',
          3: 'Split every meeting into two events',
          4: 'Start event: one more meeting in progress',
          5: 'End event: one meeting finishes',
          6: 'Sort by time; tuples put -1 before +1 on ties so back-to-back meetings are fine',
          8: 'Count of meetings currently in progress',
          9: 'Sweep through events chronologically',
          10: 'Apply the +1/-1 delta',
          11: 'More than one meeting at once?',
          12: 'Conflict — cannot attend all meetings',
          14: 'Count never exceeded 1: attendable',
        },
        javascript: {
          1: 'Define function taking array of intervals',
          2: 'Event list: meeting boundaries with +1/-1 deltas',
          3: 'Split every meeting into two events',
          4: 'Start event: one more meeting in progress',
          5: 'End event: one meeting finishes',
          7: 'Sort by time; ends (-1) before starts (+1) on ties so back-to-back meetings are fine',
          9: 'Count of meetings currently in progress',
          10: 'Sweep through events chronologically',
          11: 'Apply the +1/-1 delta',
          12: 'More than one meeting at once — conflict',
          15: 'Count never exceeded 1: attendable',
        },
        java: {
          1: 'Define method taking 2D intervals array',
          2: 'Number of meetings',
          3: 'Two events per meeting: time + delta',
          4: 'Split every meeting into two events',
          5: 'Start event: one more meeting in progress',
          6: 'End event: one meeting finishes',
          8: 'Sort by time; ends (-1) before starts (+1) on ties so back-to-back meetings are fine',
          10: 'Count of meetings currently in progress',
          11: 'Sweep through events chronologically',
          12: 'Apply the +1/-1 delta',
          13: 'More than one meeting at once — conflict',
          16: 'Count never exceeded 1: attendable',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking list of intervals',
      2: 'Sort intervals by start time',
      4: 'Loop through consecutive meeting pairs',
      5: 'If current meeting starts before previous ends',
      6: 'Overlap found, cannot attend all meetings',
      8: 'No overlaps, can attend all meetings',
    },
    javascript: {
      1: 'Define function taking array of intervals',
      2: 'Sort intervals by start time',
      4: 'Loop through consecutive meeting pairs',
      5: 'If current meeting starts before previous ends',
      6: 'Overlap found, cannot attend all meetings',
      10: 'No overlaps, can attend all meetings',
    },
    java: {
      1: 'Define method taking 2D intervals array',
      2: 'Sort intervals by start time',
      3: 'Loop through consecutive meeting pairs',
      4: 'If current meeting starts before previous ends',
      5: 'Overlap found, cannot attend all meetings',
      8: 'No overlaps, can attend all meetings',
    },
  },
};
