import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPartitionLabels(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  steps.push({
    state: {
      chars: [...chars],
      result: 'Finding partition sizes...',
    },
    highlights: [],
    message: `Partition "${s}" so each letter appears in at most one part. Find last occurrence of each char.`,
    codeLine: 1,
  });

  // Find last occurrence of each character
  const lastIndex: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    lastIndex[s[i]] = i;
  }

  steps.push({
    state: {
      chars: [...chars],
      hashMap: { ...lastIndex },
      result: 'Last occurrences computed',
    },
    highlights: [],
    message: `Last occurrences: ${Object.entries(lastIndex).map(([k, v]) => `${k}:${v}`).join(', ')}.`,
    codeLine: 2,
    action: 'visit',
  });

  const partitions: number[] = [];
  let partStart = 0;
  let partEnd = 0;

  for (let i = 0; i < s.length; i++) {
    partEnd = Math.max(partEnd, lastIndex[s[i]]);

    // Highlight current partition range
    const partHighlights: number[] = [];
    for (let j = partStart; j <= Math.min(partEnd, s.length - 1); j++) partHighlights.push(j);

    steps.push({
      state: {
        chars: [...chars],
        hashMap: { ...lastIndex },
        result: `Partitions: [${partitions.join(', ')}]`,
      },
      highlights: partHighlights,
      pointers: { i, partStart, partEnd },
      message: `i=${i}, char='${s[i]}', last occurrence=${lastIndex[s[i]]}. Partition end = max(${partEnd}, ${lastIndex[s[i]]}) = ${partEnd}.`,
      codeLine: 4,
      action: 'compare',
    });

    if (i === partEnd) {
      const size = partEnd - partStart + 1;
      partitions.push(size);

      const finishedHighlights: number[] = [];
      for (let j = partStart; j <= partEnd; j++) finishedHighlights.push(j);

      steps.push({
        state: {
          chars: [...chars],
          hashMap: { ...lastIndex },
          result: `Partitions: [${partitions.join(', ')}]`,
        },
        highlights: finishedHighlights,
        pointers: { i, partStart, partEnd },
        message: `i == partEnd (${partEnd}). Partition complete! Size = ${size}. "${s.substring(partStart, partEnd + 1)}"`,
        codeLine: 6,
        action: 'found',
      });

      partStart = i + 1;
    }
  }

  steps.push({
    state: {
      chars: [...chars],
      result: `Partitions: [${partitions.join(', ')}]`,
    },
    highlights: [],
    message: `Done! Partition sizes: [${partitions.join(', ')}]. Total ${partitions.length} partitions.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runPartitionLabelsIntervals(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  steps.push({
    state: { chars: [...chars], result: 'Building character intervals...' },
    highlights: [],
    message: `Interval view: each letter occupies the span [first, last] occurrence. Merging overlapping spans yields exactly the partitions.`,
    codeLine: 1,
  });

  const first: Record<string, number> = {};
  const last: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    if (!(s[i] in first)) first[s[i]] = i;
    last[s[i]] = i;
  }

  const intervals = Object.keys(first)
    .map((c) => ({ c, lo: first[c], hi: last[c] }))
    .sort((x, y) => x.lo - y.lo);

  if (intervals.length === 0) {
    steps.push({
      state: { chars: [...chars], result: 'Partitions: []' },
      highlights: [],
      message: 'Empty string — no partitions.',
      codeLine: 17,
      action: 'found',
    });
    return steps;
  }

  const intervalMap: Record<string, string> = {};
  for (const { c, lo, hi } of intervals) intervalMap[c] = `[${lo}, ${hi}]`;

  steps.push({
    state: {
      chars: [...chars],
      hashMap: { ...intervalMap },
      result: `${intervals.length} intervals`,
    },
    highlights: [],
    message: `Character spans (sorted by start): ${intervals.map(({ c, lo, hi }) => `${c}:[${lo},${hi}]`).join(', ')}.`,
    codeLine: 7,
    action: 'visit',
  });

  const partitions: number[] = [];
  let start = intervals[0].lo;
  let end = intervals[0].hi;

  for (let k = 1; k < intervals.length; k++) {
    const { c, lo, hi } = intervals[k];

    if (lo <= end) {
      const prevEnd = end;
      end = Math.max(end, hi);

      const hl: number[] = [];
      for (let j = start; j <= end; j++) hl.push(j);

      steps.push({
        state: {
          chars: [...chars],
          hashMap: { ...intervalMap },
          result: `Partitions: [${partitions.join(', ')}]`,
        },
        highlights: hl,
        pointers: { start, end },
        message: `'${c}' [${lo},${hi}] overlaps the current block [${start},${prevEnd}] — same partition${end > prevEnd ? `, extend end to ${end}` : ''}.`,
        codeLine: 12,
        action: 'compare',
      });
    } else {
      const size = end - start + 1;
      partitions.push(size);

      const hl: number[] = [];
      for (let j = start; j <= end; j++) hl.push(j);

      steps.push({
        state: {
          chars: [...chars],
          hashMap: { ...intervalMap },
          result: `Partitions: [${partitions.join(', ')}]`,
        },
        highlights: hl,
        pointers: { start, end },
        message: `'${c}' starts at ${lo} > ${end} — a gap! Close partition "${s.substring(start, end + 1)}" (size ${size}) and start a new block at [${lo},${hi}].`,
        codeLine: 14,
        action: 'found',
      });

      start = lo;
      end = hi;
    }
  }

  const lastSize = end - start + 1;
  partitions.push(lastSize);

  const lastHl: number[] = [];
  for (let j = start; j <= end; j++) lastHl.push(j);

  steps.push({
    state: {
      chars: [...chars],
      hashMap: { ...intervalMap },
      result: `Partitions: [${partitions.join(', ')}]`,
    },
    highlights: lastHl,
    pointers: { start, end },
    message: `End of intervals — close the final partition "${s.substring(start, end + 1)}" (size ${lastSize}).`,
    codeLine: 16,
    action: 'found',
  });

  steps.push({
    state: { chars: [...chars], result: `Partitions: [${partitions.join(', ')}]` },
    highlights: [],
    message: `Done! Merged intervals give partition sizes [${partitions.join(', ')}] — the same answer as the one-pass greedy.`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const partitionLabels: Algorithm = {
  id: 'partition-labels',
  name: 'Partition Labels',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — track last occurrence, extend partition to cover all',
  description:
    'You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.',
  problemUrl: 'https://leetcode.com/problems/partition-labels/',
  code: {
    python: `def partitionLabels(s):
    lastIndex = {}
    for i, c in enumerate(s):
        lastIndex[c] = i

    result = []
    size, end = 0, 0
    for i, c in enumerate(s):
        size += 1
        end = max(end, lastIndex[c])
        if i == end:
            result.append(size)
            size = 0

    return result`,
    javascript: `function partitionLabels(s) {
    const lastIndex = {};
    for (let i = 0; i < s.length; i++)
        lastIndex[s[i]] = i;

    const result = [];
    let size = 0, end = 0;
    for (let i = 0; i < s.length; i++) {
        size++;
        end = Math.max(end, lastIndex[s[i]]);
        if (i === end) {
            result.push(size);
            size = 0;
        }
    }
    return result;
}`,
    java: `public static List<Integer> partitionLabels(String s) {
    Map<Character, Integer> lastIndex = new HashMap<>();
    for (int i = 0; i < s.length(); i++) {
        lastIndex.put(s.charAt(i), i);
    }

    List<Integer> result = new ArrayList<>();
    int size = 0, end = 0;
    for (int i = 0; i < s.length(); i++) {
        size++;
        end = Math.max(end, lastIndex.get(s.charAt(i)));
        if (i == end) {
            result.add(size);
            size = 0;
        }
    }

    return result;
}`,
  },
  defaultInput: 'ababcbacadefegdehijhklij',
  run: runPartitionLabels,
  optimalApproachName: 'Last Occurrence Greedy',
  approaches: [
    {
      id: 'interval-merging',
      name: 'Interval Merging',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        "Instead of extending a boundary on the fly, materialize each letter's [first, last] span and merge overlapping intervals — every merged block is one partition.",
      code: {
        python: `def partitionLabels(s):
    first, last = {}, {}
    for i, c in enumerate(s):
        if c not in first:
            first[c] = i
        last[c] = i
    intervals = sorted([first[c], last[c]] for c in first)
    result = []
    start, end = intervals[0]
    for lo, hi in intervals[1:]:
        if lo <= end:
            end = max(end, hi)
        else:
            result.append(end - start + 1)
            start, end = lo, hi
    result.append(end - start + 1)
    return result`,
        javascript: `function partitionLabels(s) {
    const first = {}, last = {};
    for (let i = 0; i < s.length; i++) {
        if (!(s[i] in first)) first[s[i]] = i;
        last[s[i]] = i;
    }
    const intervals = Object.keys(first)
        .map(c => [first[c], last[c]])
        .sort((a, b) => a[0] - b[0]);
    const result = [];
    let [start, end] = intervals[0];
    for (let k = 1; k < intervals.length; k++) {
        const [lo, hi] = intervals[k];
        if (lo <= end) {
            end = Math.max(end, hi);
        } else {
            result.push(end - start + 1);
            start = lo;
            end = hi;
        }
    }
    result.push(end - start + 1);
    return result;
}`,
        java: `public static List<Integer> partitionLabels(String s) {
    int[] first = new int[26], last = new int[26];
    Arrays.fill(first, -1);
    for (int i = 0; i < s.length(); i++) {
        int c = s.charAt(i) - 'a';
        if (first[c] == -1) first[c] = i;
        last[c] = i;
    }
    List<int[]> intervals = new ArrayList<>();
    for (int c = 0; c < 26; c++) {
        if (first[c] != -1) intervals.add(new int[] { first[c], last[c] });
    }
    intervals.sort((a, b) -> a[0] - b[0]);
    List<Integer> result = new ArrayList<>();
    int start = intervals.get(0)[0], end = intervals.get(0)[1];
    for (int k = 1; k < intervals.size(); k++) {
        int lo = intervals.get(k)[0], hi = intervals.get(k)[1];
        if (lo <= end) {
            end = Math.max(end, hi);
        } else {
            result.add(end - start + 1);
            start = lo;
            end = hi;
        }
    }
    result.add(end - start + 1);
    return result;
}`,
      },
      run: runPartitionLabelsIntervals,
      lineExplanations: {
        python: {
          1: 'Define function taking string s',
          2: 'Maps for first and last occurrence of each letter',
          3: 'Scan the string once',
          4: 'First time seeing this letter?',
          5: 'Record where it first appears',
          6: 'Keep updating where it last appears',
          7: "Each letter becomes an interval [first, last], sorted by start",
          8: 'Collected partition sizes',
          9: 'Current merged block = the first interval',
          10: 'Sweep the remaining intervals in start order',
          11: 'Interval starts inside the current block?',
          12: 'Overlap — absorb it, extending the block if needed',
          13: 'Gap between intervals',
          14: 'The block is a finished partition; record its size',
          15: 'Start a new block from this interval',
          16: 'Close the final block',
          17: 'Return the partition sizes',
        },
        javascript: {
          1: 'Define function taking string s',
          2: 'Maps for first and last occurrence of each letter',
          3: 'Scan the string once',
          4: 'Record where each letter first appears',
          5: 'Keep updating where it last appears',
          7: 'Each letter becomes an interval [first, last]',
          8: 'Build the [first, last] pairs',
          9: 'Sort intervals by start position',
          10: 'Collected partition sizes',
          11: 'Current merged block = the first interval',
          12: 'Sweep the remaining intervals in start order',
          13: 'Unpack the next interval',
          14: 'Interval starts inside the current block?',
          15: 'Overlap — absorb it, extending the block if needed',
          17: 'Gap — the block is a finished partition; record its size',
          18: 'Start a new block from this interval',
          19: 'New block ends where this interval ends',
          22: 'Close the final block',
          23: 'Return the partition sizes',
        },
        java: {
          1: 'Define method taking string s',
          2: 'Arrays for first and last occurrence of each letter',
          3: 'Mark all letters as unseen (-1)',
          4: 'Scan the string once',
          5: 'Map the character to 0..25',
          6: 'Record where each letter first appears',
          7: 'Keep updating where it last appears',
          9: 'Each seen letter becomes an interval [first, last]',
          10: 'Check all 26 letters',
          11: 'Add intervals only for letters that appear',
          13: 'Sort intervals by start position',
          14: 'Collected partition sizes',
          15: 'Current merged block = the first interval',
          16: 'Sweep the remaining intervals in start order',
          17: 'Unpack the next interval',
          18: 'Interval starts inside the current block?',
          19: 'Overlap — absorb it, extending the block if needed',
          21: 'Gap — the block is a finished partition; record its size',
          22: 'Start a new block from this interval',
          23: 'New block ends where this interval ends',
          26: 'Close the final block',
          27: 'Return the partition sizes',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s',
      2: 'Initialize map for last occurrence of each char',
      3: 'Iterate with index and character',
      4: 'Record last index for each character',
      6: 'Initialize result list for partition sizes',
      7: 'Track current partition size and end boundary',
      8: 'Iterate with index and character',
      9: 'Increment current partition size',
      10: 'Extend partition end to cover this char',
      11: 'If we reached the partition boundary',
      12: 'Save current partition size',
      13: 'Reset size counter for next partition',
      15: 'Return list of partition sizes',
    },
    javascript: {
      1: 'Define function taking string s',
      2: 'Initialize map for last occurrence of each char',
      3: 'Iterate through string to find last indices',
      4: 'Record last index for each character',
      6: 'Initialize result array for partition sizes',
      7: 'Track current partition size and end boundary',
      8: 'Iterate through string with index',
      9: 'Increment current partition size',
      10: 'Extend partition end to cover this char',
      11: 'If we reached the partition boundary',
      12: 'Push current partition size to result',
      13: 'Reset size counter for next partition',
      16: 'Return array of partition sizes',
    },
    java: {
      1: 'Define method taking string s',
      2: 'Initialize map for last occurrence of each char',
      3: 'Iterate through string characters',
      4: 'Record last index for each character',
      7: 'Initialize result list for partition sizes',
      8: 'Track current partition size and end boundary',
      9: 'Iterate through string with index',
      10: 'Increment current partition size',
      11: 'Extend partition end to cover this char',
      12: 'If we reached the partition boundary',
      13: 'Add current partition size to result',
      14: 'Reset size counter for next partition',
      18: 'Return list of partition sizes',
    },
  },
};
