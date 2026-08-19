import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CharCount {
  ch: string;
  count: number;
}

function countLabels(heap: CharCount[]): string[] {
  return heap.map((h) => `${h.ch}:${h.count}`);
}

function runReorganizeString(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];

  const freq: Record<string, number> = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;

  steps.push({
    state: {
      chars: s.split(''),
      hashMap: { ...freq },
      stack: [],
    },
    highlights: [],
    message: `Input "${s}". Count each character: ${Object.entries(freq)
      .map(([k, v]) => `${k}×${v}`)
      .join(', ')}. Two identical letters may never sit next to each other.`,
    codeLine: 5,
  });

  // Max-heap simulated with a sorted array: highest count first, ties by char asc
  const heap: CharCount[] = Object.entries(freq)
    .map(([ch, count]) => ({ ch, count }))
    .sort((a, b) => b.count - a.count || (a.ch < b.ch ? -1 : 1));

  const sortHeap = () => heap.sort((a, b) => b.count - a.count || (a.ch < b.ch ? -1 : 1));

  steps.push({
    state: {
      chars: [],
      hashMap: { ...freq },
      stack: countLabels(heap),
    },
    highlights: [],
    message: `Build a max-heap keyed by count: ${countLabels(heap).join(
      ', '
    )}. Greedy idea — always spend the two most frequent letters, so the crowded one never piles up.`,
    codeLine: 7,
  });

  const res: string[] = [];
  let round = 0;

  while (heap.length > 1) {
    round++;
    const first = heap.shift()!;
    const second = heap.shift()!;

    res.push(first.ch, second.ch);

    steps.push({
      state: {
        chars: [...res],
        hashMap: Object.fromEntries(heap.map((h) => [h.ch, h.count])),
        stack: countLabels(heap),
      },
      highlights: [res.length - 2, res.length - 1],
      message: `Round ${round}: pop the two most frequent — '${first.ch}' (${first.count}) and '${second.ch}' (${second.count}). Append both: "${res.join(
        ''
      )}". They differ, so no collision is possible.`,
      codeLine: 13,
      action: 'pop',
    });

    const pushedBack: string[] = [];
    if (first.count - 1 > 0) {
      heap.push({ ch: first.ch, count: first.count - 1 });
      pushedBack.push(`${first.ch}:${first.count - 1}`);
    }
    if (second.count - 1 > 0) {
      heap.push({ ch: second.ch, count: second.count - 1 });
      pushedBack.push(`${second.ch}:${second.count - 1}`);
    }
    sortHeap();

    steps.push({
      state: {
        chars: [...res],
        hashMap: Object.fromEntries(heap.map((h) => [h.ch, h.count])),
        stack: countLabels(heap),
      },
      highlights: [],
      message:
        pushedBack.length > 0
          ? `Push back leftovers ${pushedBack.join(' and ')}. Heap: ${countLabels(heap).join(', ') || '(empty)'}`
          : `Both letters are exhausted — nothing pushed back. Heap: ${countLabels(heap).join(', ') || '(empty)'}`,
      codeLine: 16,
      action: 'push',
    });
  }

  let impossible = false;
  if (heap.length === 1) {
    const last = heap.shift()!;
    if (last.count > 1) {
      impossible = true;
      steps.push({
        state: {
          chars: [...res],
          hashMap: {},
          stack: [],
          result: '"" (impossible)',
        },
        highlights: [],
        message: `One letter left over with count ${last.count} > 1 — '${last.ch}' would have to be adjacent to itself. No valid arrangement exists.`,
        codeLine: 23,
        action: 'found',
      });
    } else {
      res.push(last.ch);
      steps.push({
        state: {
          chars: [...res],
          hashMap: {},
          stack: [],
        },
        highlights: [res.length - 1],
        message: `One letter left with count 1 — append '${last.ch}' at the end: "${res.join('')}"`,
        codeLine: 24,
        action: 'insert',
      });
    }
  }

  const answer = impossible ? '' : res.join('');

  if (!impossible) {
    steps.push({
      state: {
        chars: [...res],
        hashMap: {},
        stack: [],
        result: `"${answer}"`,
      },
      highlights: res.map((_, i) => i),
      message: `Done: "${answer}" — scan it and no two neighbours match. Answer: "${answer}"`,
      codeLine: 26,
      action: 'found',
    });
  }

  return steps;
}

function runReorganizeStringSlots(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const n = s.length;

  const freq: Record<string, number> = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;

  const order = Object.keys(freq).sort((a, b) => freq[b] - freq[a] || (a < b ? -1 : 1));

  steps.push({
    state: {
      chars: s.split(''),
      hashMap: { ...freq },
    },
    highlights: [],
    message: `No heap this time. Sort characters by frequency: ${order
      .map((c) => `${c}×${freq[c]}`)
      .join(' > ')}. Key insight: filling the EVEN slots first, then the ODD ones, keeps identical letters two apart.`,
    codeLine: 4,
  });

  const maxFreq = freq[order[0]];
  const limit = Math.floor((n + 1) / 2);

  steps.push({
    state: {
      chars: new Array(n).fill('_'),
      hashMap: { ...freq, maxFreq, limit },
    },
    highlights: [],
    message: `Feasibility check: the most frequent letter '${order[0]}' appears ${maxFreq} times and the cap is ⌊(${n}+1)/2⌋ = ${limit}. ${
      maxFreq > limit ? 'Too many — return "".' : 'Within the cap, so a valid arrangement exists.'
    }`,
    codeLine: 6,
  });

  if (maxFreq > limit) {
    steps.push({
      state: {
        chars: new Array(n).fill('_'),
        hashMap: { ...freq },
        result: '"" (impossible)',
      },
      highlights: [],
      message: `'${order[0]}' cannot be spread out — no valid arrangement. Answer: ""`,
      codeLine: 7,
      action: 'found',
    });
    return steps;
  }

  const res: string[] = new Array(n).fill('_');
  let idx = 0;

  for (const ch of order) {
    for (let k = 0; k < freq[ch]; k++) {
      let wrapped = false;
      if (idx >= n) {
        idx = 1;
        wrapped = true;
      }
      res[idx] = ch;

      steps.push({
        state: {
          chars: [...res],
          hashMap: { ...freq, slot: idx },
        },
        highlights: [idx],
        message: wrapped
          ? `Ran off the end of the even slots — wrap around to index 1 and start filling ODD slots. Place '${ch}' at index ${idx}: "${res.join(
              ''
            )}"`
          : `Place '${ch}' at index ${idx}, then jump +2 so the next copy lands two seats away: "${res.join('')}"`,
        codeLine: 15,
        action: 'insert',
      });

      idx += 2;
    }
  }

  const answer = res.join('');

  steps.push({
    state: {
      chars: [...res],
      hashMap: {},
      result: `"${answer}"`,
    },
    highlights: res.map((_, i) => i),
    message: `Every slot filled: "${answer}". Because each letter was laid down with a stride of 2, no duplicates touch. Answer: "${answer}"`,
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

export const reorganizeString: Algorithm = {
  id: 'reorganize-string',
  name: 'Reorganize String',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n log k)',
  spaceComplexity: 'O(k)',
  pattern: 'Max Heap — spend the two most frequent characters each round',
  description:
    'Given a string s, rearrange its characters so that no two adjacent characters are the same. Return any valid rearrangement, or an empty string if none is possible.',
  problemUrl: 'https://leetcode.com/problems/reorganize-string/',
  code: {
    python: `import heapq
from collections import Counter

def reorganizeString(s):
    count = Counter(s)
    maxHeap = [(-c, ch) for ch, c in count.items()]
    heapq.heapify(maxHeap)

    res = []
    while len(maxHeap) > 1:
        c1, ch1 = heapq.heappop(maxHeap)
        c2, ch2 = heapq.heappop(maxHeap)
        res.append(ch1)
        res.append(ch2)
        if c1 + 1 < 0:
            heapq.heappush(maxHeap, (c1 + 1, ch1))
        if c2 + 1 < 0:
            heapq.heappush(maxHeap, (c2 + 1, ch2))

    if maxHeap:
        c, ch = heapq.heappop(maxHeap)
        if -c > 1:
            return ""
        res.append(ch)

    return "".join(res)`,
    javascript: `function reorganizeString(s) {
    const count = {};
    for (const ch of s) count[ch] = (count[ch] || 0) + 1;
    const maxHeap = new MaxPriorityQueue({ priority: (x) => x[0] });
    for (const ch in count) maxHeap.enqueue([count[ch], ch]);

    const res = [];
    while (maxHeap.size() > 1) {
        const [c1, ch1] = maxHeap.dequeue().element;
        const [c2, ch2] = maxHeap.dequeue().element;
        res.push(ch1, ch2);
        if (c1 - 1 > 0) maxHeap.enqueue([c1 - 1, ch1]);
        if (c2 - 1 > 0) maxHeap.enqueue([c2 - 1, ch2]);
    }

    if (maxHeap.size()) {
        const [c, ch] = maxHeap.dequeue().element;
        if (c > 1) return "";
        res.push(ch);
    }

    return res.join("");
}`,
    java: `public static String reorganizeString(String s) {
    int[] count = new int[26];
    for (char ch : s.toCharArray()) count[ch - 'a']++;
    PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
        (a, b) -> a[0] == b[0] ? a[1] - b[1] : b[0] - a[0]);
    for (int i = 0; i < 26; i++) {
        if (count[i] > 0) maxHeap.offer(new int[] { count[i], i });
    }

    StringBuilder res = new StringBuilder();
    while (maxHeap.size() > 1) {
        int[] a = maxHeap.poll();
        int[] b = maxHeap.poll();
        res.append((char) ('a' + a[1]));
        res.append((char) ('a' + b[1]));
        if (--a[0] > 0) maxHeap.offer(a);
        if (--b[0] > 0) maxHeap.offer(b);
    }

    if (!maxHeap.isEmpty()) {
        int[] last = maxHeap.poll();
        if (last[0] > 1) return "";
        res.append((char) ('a' + last[1]));
    }

    return res.toString();
}`,
  },
  defaultInput: 'aaabbc',
  run: runReorganizeString,
  optimalApproachName: 'Max-Heap',
  approaches: [
    {
      id: 'even-odd-slot-fill',
      name: 'Sorted Even/Odd Slot Fill',
      timeComplexity: 'O(n + k log k)',
      spaceComplexity: 'O(n)',
      description:
        'Skips the heap entirely: sort the characters by frequency once, then lay them into index 0, 2, 4, … and wrap to 1, 3, 5, …, which guarantees identical letters land at least two seats apart.',
      code: {
        python: `from collections import Counter

def reorganizeString(s):
    count = Counter(s)
    ch, freq = count.most_common(1)[0]
    if freq > (len(s) + 1) // 2:
        return ""

    res = [''] * len(s)
    idx = 0
    for ch, freq in count.most_common():
        for _ in range(freq):
            if idx >= len(s):
                idx = 1
            res[idx] = ch
            idx += 2

    return "".join(res)`,
        javascript: `function reorganizeString(s) {
    const count = {};
    for (const ch of s) count[ch] = (count[ch] || 0) + 1;
    const order = Object.keys(count).sort((a, b) => count[b] - count[a]);
    if (count[order[0]] > (s.length + 1) >> 1) return "";

    const res = new Array(s.length);
    let idx = 0;
    for (const ch of order) {
        for (let n = 0; n < count[ch]; n++) {
            if (idx >= s.length) idx = 1;
            res[idx] = ch;
            idx += 2;
        }
    }

    return res.join("");
}`,
        java: `public static String reorganizeString(String s) {
    int n = s.length();
    int[] count = new int[26];
    for (char ch : s.toCharArray()) count[ch - 'a']++;
    Integer[] order = new Integer[26];
    for (int i = 0; i < 26; i++) order[i] = i;
    Arrays.sort(order, (a, b) -> count[b] - count[a]);
    if (count[order[0]] > (n + 1) / 2) return "";

    char[] res = new char[n];
    int idx = 0;
    for (int c : order) {
        for (int k = 0; k < count[c]; k++) {
            if (idx >= n) idx = 1;
            res[idx] = (char) ('a' + c);
            idx += 2;
        }
    }

    return new String(res);
}`,
      },
      run: runReorganizeStringSlots,
      lineExplanations: {
        python: {
          1: 'Counter gives frequencies and most_common ordering for free',
          3: 'Define function taking the string',
          4: 'Counter walks the input once and returns the whole {value: count} map',
          5: 'Grab the single most frequent character',
          6: 'If it needs more than half the seats (rounded up) it cannot be spread out',
          7: 'No valid arrangement exists',
          9: 'Pre-allocate the output slots',
          10: 'Start at index 0 — the even slots',
          11: 'Walk characters from most to least frequent',
          12: 'Place every copy of this character',
          13: 'Even slots exhausted',
          14: 'Wrap around to index 1 and continue with odd slots',
          15: 'Drop the character into the current slot',
          16: 'Stride of 2 keeps copies from touching',
          18: 'Join the slots into the answer',
        },
        javascript: {
          1: 'Define function taking the string',
          2: 'Frequency map',
          3: 'Count how often each character appears',
          4: 'Order characters from most to least frequent',
          5: 'If the top character needs more than ⌈n/2⌉ seats, bail out',
          7: 'Pre-allocate the output slots',
          8: 'Start at index 0 — the even slots',
          9: 'Walk characters from most to least frequent',
          10: 'Place every copy of this character',
          11: 'Even slots exhausted — wrap to index 1',
          12: 'Drop the character into the current slot',
          13: 'Stride of 2 keeps copies from touching',
          17: 'Join the slots into the answer',
        },
        java: {
          1: 'Define method taking the string',
          2: 'Length of the string',
          3: 'Frequency table over the 26 lowercase letters',
          4: 'Count how often each character appears',
          5: 'Index array we can sort by frequency',
          6: 'Fill it with 0..25',
          7: 'Order letters from most to least frequent',
          8: 'If the top letter needs more than ⌈n/2⌉ seats, bail out',
          10: 'Pre-allocate the output slots',
          11: 'Start at index 0 — the even slots',
          12: 'Walk letters from most to least frequent',
          13: 'Place every copy of this letter',
          14: 'Even slots exhausted — wrap to index 1',
          15: 'Drop the letter into the current slot',
          16: 'Stride of 2 keeps copies from touching',
          20: 'Build the answer string',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq for heap operations',
      2: 'Counter for character frequencies',
      4: 'Define function taking the string',
      5: 'Counter walks the input once and returns the whole {value: count} map',
      6: 'Negate counts to turn Python min-heap into a max-heap',
      7: 'Heapify in O(k)',
      9: 'Accumulate the rearranged characters',
      10: 'Work while at least two distinct characters remain',
      11: 'Pop the most frequent character',
      12: 'Pop the second most frequent character',
      13: 'Append the first — safe, it differs from the second',
      14: 'Append the second',
      15: 'If the first still has copies left',
      16: 'Push it back with one fewer',
      17: 'If the second still has copies left',
      18: 'Push it back with one fewer',
      20: 'One character type may remain',
      21: 'Pop it',
      22: 'More than one copy left means two of them must touch',
      23: 'Impossible — return the empty string',
      24: 'Otherwise append that final character',
      26: 'Join the list into the answer string',
    },
    javascript: {
      1: 'Define function taking the string',
      2: 'Frequency map',
      3: 'Count how often each character appears',
      4: 'Max priority queue keyed by count',
      5: 'Enqueue every [count, char] pair',
      7: 'Accumulate the rearranged characters',
      8: 'Work while at least two distinct characters remain',
      9: 'Pop the most frequent character',
      10: 'Pop the second most frequent character',
      11: 'Append both — they differ, so nothing collides',
      12: 'Push the first back if copies remain',
      13: 'Push the second back if copies remain',
      16: 'One character type may remain',
      17: 'Pop it',
      18: 'More than one copy left means the arrangement is impossible',
      19: 'Otherwise append that final character',
      22: 'Join the list into the answer string',
    },
    java: {
      1: 'Define method taking the string',
      2: 'Frequency table over the 26 lowercase letters',
      3: 'Count how often each character appears',
      4: 'Max-heap over [count, letterIndex]',
      5: 'Highest count first, ties broken alphabetically',
      6: 'Walk the alphabet',
      7: 'Only enqueue letters that actually occur',
      10: 'Accumulate the rearranged characters',
      11: 'Work while at least two distinct letters remain',
      12: 'Poll the most frequent letter',
      13: 'Poll the second most frequent letter',
      14: 'Append the first',
      15: 'Append the second',
      16: 'Push the first back if copies remain',
      17: 'Push the second back if copies remain',
      20: 'One letter type may remain',
      21: 'Poll it',
      22: 'More than one copy left means the arrangement is impossible',
      23: 'Otherwise append that final letter',
      26: 'Build the answer string',
    },
  },
};
