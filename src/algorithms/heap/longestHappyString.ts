import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface HappyInput {
  a: number;
  b: number;
  c: number;
}

interface HappyEntry {
  ch: string;
  count: number;
}

function happyLabels(heap: HappyEntry[]): string[] {
  return heap.map((h) => `${h.ch}:${h.count}`);
}

function runLongestHappyString(input: unknown): AlgorithmStep[] {
  const { a, b, c } = input as HappyInput;
  const steps: AlgorithmStep[] = [];

  const heap: HappyEntry[] = [
    { ch: 'a', count: a },
    { ch: 'b', count: b },
    { ch: 'c', count: c },
  ].filter((e) => e.count > 0);

  const sortHeap = () => heap.sort((x, y) => y.count - x.count || (x.ch < y.ch ? -1 : 1));
  sortHeap();

  steps.push({
    state: {
      chars: [],
      hashMap: { a, b, c },
      stack: happyLabels(heap),
    },
    highlights: [],
    message: `Build the longest string from a=${a}, b=${b}, c=${c} with no "aaa", "bbb" or "ccc". Max-heap by remaining count: ${happyLabels(
      heap
    ).join(', ')}.`,
    codeLine: 3,
  });

  steps.push({
    state: {
      chars: [],
      hashMap: { a, b, c },
      stack: happyLabels(heap),
    },
    highlights: [],
    message: `Greedy rule: always take the most plentiful letter, UNLESS it would make three in a row — then take the runner-up for one turn and put the top back.`,
    codeLine: 7,
  });

  const res: string[] = [];

  while (heap.length > 0) {
    const top = heap.shift()!;
    const n = res.length;
    const blocked = n > 1 && res[n - 1] === top.ch && res[n - 2] === top.ch;

    if (blocked) {
      if (heap.length === 0) {
        steps.push({
          state: {
            chars: [...res],
            hashMap: { [top.ch]: top.count },
            stack: [],
          },
          highlights: n > 1 ? [n - 2, n - 1] : [],
          message: `'${top.ch}' is blocked by the trailing "${top.ch}${top.ch}" and there is no other letter left to break it up. Stop here.`,
          codeLine: 14,
          action: 'delete',
        });
        break;
      }

      const second = heap.shift()!;
      res.push(second.ch);

      steps.push({
        state: {
          chars: [...res],
          hashMap: Object.fromEntries([...heap, { ch: top.ch, count: top.count }].map((h) => [h.ch, h.count])),
          stack: happyLabels(heap),
        },
        highlights: [res.length - 1],
        message: `Top is '${top.ch}' (${top.count}) but the string already ends in "${top.ch}${top.ch}" — a third would break the rule. Use the runner-up '${second.ch}' instead: "${res.join(
          ''
        )}"`,
        codeLine: 16,
        action: 'insert',
      });

      if (second.count - 1 > 0) heap.push({ ch: second.ch, count: second.count - 1 });
      heap.push(top);
      sortHeap();

      steps.push({
        state: {
          chars: [...res],
          hashMap: Object.fromEntries(heap.map((h) => [h.ch, h.count])),
          stack: happyLabels(heap),
        },
        highlights: [],
        message: `Push '${top.ch}' back untouched (still ${top.count} left) and '${second.ch}' with ${
          second.count - 1
        } left. Heap: ${happyLabels(heap).join(', ') || '(empty)'}`,
        codeLine: 19,
        action: 'push',
      });
    } else {
      res.push(top.ch);
      if (top.count - 1 > 0) heap.push({ ch: top.ch, count: top.count - 1 });
      sortHeap();

      steps.push({
        state: {
          chars: [...res],
          hashMap: Object.fromEntries(heap.map((h) => [h.ch, h.count])),
          stack: happyLabels(heap),
        },
        highlights: [res.length - 1],
        message: `Take the most plentiful letter '${top.ch}' (${top.count} left) — the tail is safe. String: "${res.join(
          ''
        )}". Heap: ${happyLabels(heap).join(', ') || '(empty)'}`,
        codeLine: 21,
        action: 'pop',
      });
    }
  }

  const answer = res.join('');

  steps.push({
    state: {
      chars: [...res],
      hashMap: {},
      stack: [],
      result: `"${answer}" (length ${answer.length})`,
    },
    highlights: res.map((_, i) => i),
    message: `Longest happy string: "${answer}" — length ${answer.length}, and no letter appears three times in a row.`,
    codeLine: 25,
    action: 'found',
  });

  return steps;
}

function runLongestHappyStringCounters(input: unknown): AlgorithmStep[] {
  const { a, b, c } = input as HappyInput;
  const steps: AlgorithmStep[] = [];

  const counts: Record<string, number> = { a, b, c };

  steps.push({
    state: {
      chars: [],
      hashMap: { ...counts },
    },
    highlights: [],
    message: `Only three letters exist, so a heap is overkill — just keep three counters a=${a}, b=${b}, c=${c} and scan them each round.`,
    codeLine: 2,
  });

  const res: string[] = [];
  const total = a + b + c;

  for (let round = 0; round < total; round++) {
    let best = '';
    const skipped: string[] = [];

    for (const ch of ['a', 'b', 'c']) {
      if (counts[ch] === 0) continue;
      const n = res.length;
      if (n > 1 && res[n - 1] === ch && res[n - 2] === ch) {
        skipped.push(ch);
        continue;
      }
      if (best === '' || counts[ch] > counts[best]) best = ch;
    }

    if (best === '') {
      steps.push({
        state: {
          chars: [...res],
          hashMap: { ...counts },
        },
        highlights: res.length > 1 ? [res.length - 2, res.length - 1] : [],
        message: `No legal letter left: ${
          skipped.length ? `'${skipped.join("', '")}' would make three in a row` : 'all counters are zero'
        }, and everything else is exhausted. Stop.`,
        codeLine: 15,
        action: 'delete',
      });
      break;
    }

    res.push(best);
    counts[best]--;

    steps.push({
      state: {
        chars: [...res],
        hashMap: { ...counts },
      },
      highlights: [res.length - 1],
      message: `Round ${round + 1}: ${
        skipped.length ? `skip '${skipped.join("', '")}' (would repeat three times), ` : ''
      }pick the largest remaining counter '${best}' → "${res.join('')}". Counters now a=${counts.a}, b=${counts.b}, c=${counts.c}.`,
      codeLine: 17,
      action: 'insert',
    });
  }

  const answer = res.join('');

  steps.push({
    state: {
      chars: [...res],
      hashMap: { ...counts },
      result: `"${answer}" (length ${answer.length})`,
    },
    highlights: res.map((_, i) => i),
    message: `Identical result to the heap version: "${answer}" — length ${answer.length}. With only 3 letters, the O(1) scan beats heap bookkeeping.`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

export const longestHappyString: Algorithm = {
  id: 'longest-happy-string',
  name: 'Longest Happy String',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n log 3) ≈ O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Greedy + Max Heap — take most frequent, guard against three in a row',
  description:
    "A string is happy if it contains only 'a', 'b' and 'c' and never contains \"aaa\", \"bbb\" or \"ccc\" as a substring. Given three integers a, b and c, return the longest possible happy string that uses at most a copies of 'a', b copies of 'b' and c copies of 'c'.",
  problemUrl: 'https://leetcode.com/problems/longest-happy-string/',
  code: {
    python: `import heapq

def longestDiverseString(a, b, c):
    maxHeap = []
    for count, ch in [(-a, 'a'), (-b, 'b'), (-c, 'c')]:
        if count != 0:
            heapq.heappush(maxHeap, (count, ch))

    res = []
    while maxHeap:
        count, ch = heapq.heappop(maxHeap)
        if len(res) > 1 and res[-1] == res[-2] == ch:
            if not maxHeap:
                break
            count2, ch2 = heapq.heappop(maxHeap)
            res.append(ch2)
            if count2 + 1 != 0:
                heapq.heappush(maxHeap, (count2 + 1, ch2))
            heapq.heappush(maxHeap, (count, ch))
        else:
            res.append(ch)
            if count + 1 != 0:
                heapq.heappush(maxHeap, (count + 1, ch))

    return "".join(res)`,
    javascript: `function longestDiverseString(a, b, c) {
    const heap = [];
    if (a) heap.push([a, 'a']);
    if (b) heap.push([b, 'b']);
    if (c) heap.push([c, 'c']);
    const sortHeap = () => heap.sort((x, y) => y[0] - x[0] || (x[1] < y[1] ? -1 : 1));

    const res = [];
    sortHeap();
    while (heap.length) {
        const [cnt, ch] = heap.shift();
        const n = res.length;
        if (n > 1 && res[n - 1] === ch && res[n - 2] === ch) {
            if (!heap.length) break;
            const [cnt2, ch2] = heap.shift();
            res.push(ch2);
            if (cnt2 - 1 > 0) heap.push([cnt2 - 1, ch2]);
            heap.push([cnt, ch]);
        } else {
            res.push(ch);
            if (cnt - 1 > 0) heap.push([cnt - 1, ch]);
        }
        sortHeap();
    }

    return res.join("");
}`,
    java: `public static String longestDiverseString(int a, int b, int c) {
    PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
        (x, y) -> x[0] == y[0] ? x[1] - y[1] : y[0] - x[0]);
    if (a > 0) maxHeap.offer(new int[] { a, 0 });
    if (b > 0) maxHeap.offer(new int[] { b, 1 });
    if (c > 0) maxHeap.offer(new int[] { c, 2 });

    StringBuilder res = new StringBuilder();
    while (!maxHeap.isEmpty()) {
        int[] top = maxHeap.poll();
        char ch = (char) ('a' + top[1]);
        int n = res.length();
        if (n > 1 && res.charAt(n - 1) == ch && res.charAt(n - 2) == ch) {
            if (maxHeap.isEmpty()) break;
            int[] second = maxHeap.poll();
            res.append((char) ('a' + second[1]));
            if (--second[0] > 0) maxHeap.offer(second);
            maxHeap.offer(top);
        } else {
            res.append(ch);
            if (--top[0] > 0) maxHeap.offer(top);
        }
    }

    return res.toString();
}`,
  },
  defaultInput: { a: 1, b: 1, c: 7 },
  run: runLongestHappyString,
  optimalApproachName: 'Max-Heap Greedy',
  approaches: [
    {
      id: 'three-counter-greedy',
      name: 'Three-Counter Greedy',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Because the alphabet is fixed at three letters, a heap adds nothing — scanning three plain counters for the biggest legal choice each round is the same greedy strategy with no log factor.',
      code: {
        python: `def longestDiverseString(a, b, c):
    counts = {'a': a, 'b': b, 'c': c}
    res = []

    for _ in range(a + b + c):
        best = ''
        for ch in 'abc':
            if counts[ch] == 0:
                continue
            if len(res) > 1 and res[-1] == res[-2] == ch:
                continue
            if best == '' or counts[ch] > counts[best]:
                best = ch
        if best == '':
            break
        res.append(best)
        counts[best] -= 1

    return "".join(res)`,
        javascript: `function longestDiverseString(a, b, c) {
    const counts = { a, b, c };
    const res = [];

    for (let step = 0; step < a + b + c; step++) {
        let best = '';
        for (const ch of ['a', 'b', 'c']) {
            if (counts[ch] === 0) continue;
            const n = res.length;
            if (n > 1 && res[n - 1] === ch && res[n - 2] === ch) continue;
            if (best === '' || counts[ch] > counts[best]) best = ch;
        }
        if (best === '') break;
        res.push(best);
        counts[best]--;
    }

    return res.join("");
}`,
        java: `public static String longestDiverseString(int a, int b, int c) {
    int[] counts = { a, b, c };
    StringBuilder res = new StringBuilder();

    for (int step = 0; step < a + b + c; step++) {
        int best = -1;
        for (int i = 0; i < 3; i++) {
            if (counts[i] == 0) continue;
            char ch = (char) ('a' + i);
            int n = res.length();
            if (n > 1 && res.charAt(n - 1) == ch && res.charAt(n - 2) == ch) continue;
            if (best == -1 || counts[i] > counts[best]) best = i;
        }
        if (best == -1) break;
        res.append((char) ('a' + best));
        counts[best]--;
    }

    return res.toString();
}`,
      },
      run: runLongestHappyStringCounters,
      lineExplanations: {
        python: {
          1: 'Define function taking the three letter budgets',
          2: 'Three plain counters replace the heap',
          3: 'Accumulate the output characters',
          5: 'At most a+b+c characters can ever be placed',
          6: 'Best legal letter for this round',
          7: 'Scan the fixed three-letter alphabet',
          8: 'Skip letters we have run out of',
          9: 'Nothing left of this letter',
          10: 'Skip a letter that would become three in a row',
          11: 'It is blocked this round',
          12: 'Otherwise keep the letter with the largest remaining count',
          13: 'Record it as the current best',
          14: 'No legal letter — we are done',
          15: 'Stop building',
          16: 'Append the winning letter',
          17: 'Spend one copy of it',
          19: 'Join the characters into the answer',
        },
        javascript: {
          1: 'Define function taking the three letter budgets',
          2: 'Three plain counters replace the heap',
          3: 'Accumulate the output characters',
          5: 'At most a+b+c characters can ever be placed',
          6: 'Best legal letter for this round',
          7: 'Scan the fixed three-letter alphabet',
          8: 'Skip letters we have run out of',
          9: 'Current output length',
          10: 'Skip a letter that would become three in a row',
          11: 'Otherwise keep the letter with the largest remaining count',
          13: 'No legal letter — we are done',
          14: 'Append the winning letter',
          15: 'Spend one copy of it',
          18: 'Join the characters into the answer',
        },
        java: {
          1: 'Define method taking the three letter budgets',
          2: 'Three plain counters replace the heap',
          3: 'Accumulate the output characters',
          5: 'At most a+b+c characters can ever be placed',
          6: 'Index of the best legal letter this round',
          7: 'Scan the fixed three-letter alphabet',
          8: 'Skip letters we have run out of',
          9: 'Convert the index to its character',
          10: 'Current output length',
          11: 'Skip a letter that would become three in a row',
          12: 'Otherwise keep the letter with the largest remaining count',
          14: 'No legal letter — we are done',
          15: 'Append the winning letter',
          16: 'Spend one copy of it',
          19: 'Build the answer string',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq for heap operations',
      3: 'Define function taking the three letter budgets',
      4: 'Max-heap of (negated count, letter)',
      5: 'Consider each letter with its budget',
      6: 'Skip letters with a budget of zero',
      7: 'Push the negated count so the largest pops first',
      9: 'Accumulate the output characters',
      10: 'Keep going while any letter remains',
      11: 'Pop the letter with the largest remaining count',
      12: 'The tail already has two of this letter — a third is illegal',
      13: 'No runner-up to break the run',
      14: 'Nothing more can be appended, so stop',
      15: 'Pop the second most plentiful letter instead',
      16: 'Append it to break the run',
      17: 'If the runner-up still has copies left',
      18: 'Push it back with one fewer',
      19: 'Push the blocked letter back untouched',
      20: 'Otherwise the top letter is safe to use',
      21: 'Append it',
      22: 'If copies remain',
      23: 'Push it back with one fewer',
      25: 'Join the characters into the answer',
    },
    javascript: {
      1: 'Define function taking the three letter budgets',
      2: 'Array used as a heap of [count, letter]',
      3: "Seed 'a' if its budget is positive",
      4: "Seed 'b' if its budget is positive",
      5: "Seed 'c' if its budget is positive",
      6: 'Re-order so the largest count sits at the front',
      8: 'Accumulate the output characters',
      9: 'Establish heap order before the first pop',
      10: 'Keep going while any letter remains',
      11: 'Pop the letter with the largest remaining count',
      12: 'Current output length',
      13: 'The tail already has two of this letter — a third is illegal',
      14: 'No runner-up to break the run, so stop',
      15: 'Pop the second most plentiful letter instead',
      16: 'Append it to break the run',
      17: 'Push the runner-up back if copies remain',
      18: 'Push the blocked letter back untouched',
      20: 'Otherwise the top letter is safe — append it',
      21: 'Push it back if copies remain',
      23: 'Restore heap order for the next round',
      26: 'Join the characters into the answer',
    },
    java: {
      1: 'Define method taking the three letter budgets',
      2: 'Max-heap over [count, letterIndex]',
      3: 'Largest count first, ties broken alphabetically',
      4: "Seed 'a' if its budget is positive",
      5: "Seed 'b' if its budget is positive",
      6: "Seed 'c' if its budget is positive",
      8: 'Accumulate the output characters',
      9: 'Keep going while any letter remains',
      10: 'Poll the letter with the largest remaining count',
      11: 'Convert its index back to a character',
      12: 'Current output length',
      13: 'The tail already has two of this letter — a third is illegal',
      14: 'No runner-up to break the run, so stop',
      15: 'Poll the second most plentiful letter instead',
      16: 'Append it to break the run',
      17: 'Push the runner-up back if copies remain',
      18: 'Push the blocked letter back untouched',
      20: 'Otherwise the top letter is safe — append it',
      21: 'Push it back if copies remain',
      25: 'Build the answer string',
    },
  },
};
