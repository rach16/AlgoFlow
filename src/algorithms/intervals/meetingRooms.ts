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
    java: `// Java implementation coming soon`,
  },
  defaultInput: [[0, 30], [5, 10], [15, 20]],
  run: runMeetingRooms,
};
