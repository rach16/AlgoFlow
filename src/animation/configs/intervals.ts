import { createConfig, intervalsTemplate } from '../templates';

const t = intervalsTemplate;

export const intervalsConfigs = [
  createConfig(t, {
    algorithmId: 'insert-interval',
    title: 'Insert Interval',
    subtitle: 'Insert and merge overlapping intervals',
    codeSnippet: `def insert(intervals, newInterval):
    result = []
    for i, interval in enumerate(intervals):
        if newInterval[1] < interval[0]:
            result.append(newInterval)
            return result + intervals[i:]
        elif newInterval[0] > interval[1]:
            result.append(interval)
        else:
            newInterval = [min(newInterval[0], interval[0]),
                          max(newInterval[1], interval[1])]
    result.append(newInterval)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'merge-intervals',
    title: 'Merge Intervals',
    subtitle: 'Merge all overlapping intervals',
    codeSnippet: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
  }),
  createConfig(t, {
    algorithmId: 'non-overlapping-intervals',
    title: 'Non-Overlapping Intervals',
    subtitle: 'Min removals for no overlap',
    codeSnippet: `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda x: x[1])
    count = 0
    prevEnd = float('-inf')
    for start, end in intervals:
        if start >= prevEnd:
            prevEnd = end
        else:
            count += 1
    return count`,
  }),
  createConfig(t, {
    algorithmId: 'meeting-rooms',
    title: 'Meeting Rooms',
    subtitle: 'Can attend all meetings',
    codeSnippet: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda x: x[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i-1][1]:
            return False
    return True`,
  }),
  createConfig(t, {
    algorithmId: 'meeting-rooms-ii',
    title: 'Meeting Rooms II',
    subtitle: 'Min conference rooms required',
    codeSnippet: `def minMeetingRooms(intervals):
    start = sorted([i[0] for i in intervals])
    end = sorted([i[1] for i in intervals])
    result, count = 0, 0
    s, e = 0, 0
    while s < len(intervals):
        if start[s] < end[e]:
            count += 1
            s += 1
        else:
            count -= 1
            e += 1
        result = max(result, count)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'min-interval-query',
    title: 'Minimum Interval to Include Each Query',
    subtitle: 'Smallest interval containing each query',
    codeSnippet: `def minInterval(intervals, queries):
    intervals.sort()
    minHeap = []
    result = {}
    i = 0
    for q in sorted(queries):
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(minHeap, (r - l + 1, r))
            i += 1
        while minHeap and minHeap[0][1] < q:
            heapq.heappop(minHeap)
        result[q] = minHeap[0][0] if minHeap else -1
    return [result[q] for q in queries]`,
  }),
];
