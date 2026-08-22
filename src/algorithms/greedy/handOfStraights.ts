import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface HandOfStraightsInput {
  hand: number[];
  groupSize: number;
}

function runHandOfStraights(input: unknown): AlgorithmStep[] {
  const { hand, groupSize } = input as HandOfStraightsInput;
  const steps: AlgorithmStep[] = [];
  const n = hand.length;

  steps.push({
    state: {
      nums: [...hand],
      hashMap: {},
      result: `Hand: [${hand.join(', ')}], Group size: ${groupSize}`,
    },
    highlights: [],
    message: `Can we rearrange [${hand.join(', ')}] into groups of ${groupSize} consecutive cards?`,
    codeLine: 1,
  });

  if (n % groupSize !== 0) {
    steps.push({
      state: { nums: [...hand], hashMap: {}, result: 'false' },
      highlights: [],
      message: `${n} cards cannot be evenly divided into groups of ${groupSize}. Return false.`,
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  // Count frequency
  const count: Record<number, number> = {};
  for (const card of hand) {
    count[card] = (count[card] || 0) + 1;
  }

  const sorted = [...new Set(hand)].sort((a, b) => a - b);

  steps.push({
    state: {
      nums: sorted,
      hashMap: { ...count },
      result: `Sorted unique cards: [${sorted.join(', ')}]`,
    },
    highlights: [],
    message: `Count frequencies and sort unique cards: [${sorted.join(', ')}].`,
    codeLine: 3,
    action: 'visit',
  });

  let canForm = true;

  for (const start of sorted) {
    if (count[start] === 0) continue;

    const groupCount = count[start];

    steps.push({
      state: { nums: sorted, hashMap: { ...count }, result: `Forming ${groupCount} group(s) starting at ${start}` },
      highlights: [sorted.indexOf(start)],
      message: `Card ${start} has count ${groupCount}. Need to form ${groupCount} group(s) of [${start}...${start + groupSize - 1}].`,
      codeLine: 5,
      action: 'visit',
    });

    for (let i = 0; i < groupSize; i++) {
      const card = start + i;
      if ((count[card] || 0) < groupCount) {
        canForm = false;

        steps.push({
          state: { nums: sorted, hashMap: { ...count }, result: 'false' },
          highlights: [],
          message: `Card ${card} has count ${count[card] || 0} < ${groupCount}. Cannot form group. Return false.`,
          codeLine: 7,
          action: 'delete',
        });
        break;
      }
      count[card] -= groupCount;

      steps.push({
        state: { nums: sorted, hashMap: { ...count }, result: `Forming groups starting at ${start}` },
        highlights: sorted.indexOf(card) >= 0 ? [sorted.indexOf(card)] : [],
        message: `Use ${groupCount} copies of card ${card}. Remaining: ${count[card]}.`,
        codeLine: 8,
        action: 'compare',
      });
    }

    if (!canForm) break;
  }

  steps.push({
    state: { nums: sorted, hashMap: { ...count }, result: canForm ? 'true' : 'false' },
    highlights: [],
    message: `Done! ${canForm ? 'Successfully formed all groups.' : 'Cannot form valid groups.'} Result: ${canForm}.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runHandOfStraightsMinHeap(input: unknown): AlgorithmStep[] {
  const { hand, groupSize } = input as HandOfStraightsInput;
  const steps: AlgorithmStep[] = [];
  const n = hand.length;

  steps.push({
    state: {
      nums: [...hand],
      hashMap: {},
      result: `Hand: [${hand.join(', ')}], Group size: ${groupSize}`,
    },
    highlights: [],
    message: `Min-heap greedy: the smallest remaining card MUST start a group, so repeatedly peek the heap minimum and build from it.`,
    codeLine: 1,
  });

  if (n % groupSize !== 0) {
    steps.push({
      state: { nums: [...hand], hashMap: {}, result: 'false' },
      highlights: [],
      message: `${n} cards cannot be evenly divided into groups of ${groupSize}. Return false.`,
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  const count: Record<number, number> = {};
  for (const card of hand) {
    count[card] = (count[card] || 0) + 1;
  }

  // Sorted array of unique values acts as our min-heap (min at index 0)
  const heap = [...new Set(hand)].sort((a, b) => a - b);
  const display = [...heap];

  steps.push({
    state: { nums: display, hashMap: { ...count }, result: `Heap: [${heap.join(', ')}]` },
    highlights: [],
    message: `Count each card, then heapify the unique values: heap = [${heap.join(', ')}] (minimum on top).`,
    codeLine: 6,
    action: 'insert',
  });

  while (heap.length > 0) {
    const first = heap[0];

    steps.push({
      state: {
        nums: display,
        hashMap: { ...count },
        result: `Group: [${first}..${first + groupSize - 1}]`,
      },
      highlights: [display.indexOf(first)],
      message: `Heap min = ${first}. Nothing smaller remains, so ${first} can only be a group START. Build [${first}..${first + groupSize - 1}].`,
      codeLine: 8,
      action: 'visit',
    });

    for (let card = first; card < first + groupSize; card++) {
      if ((count[card] || 0) === 0) {
        steps.push({
          state: { nums: display, hashMap: { ...count }, result: 'false' },
          highlights: display.indexOf(card) >= 0 ? [display.indexOf(card)] : [],
          message: `Need card ${card} to continue the run, but none remain. Group cannot be completed. Return false.`,
          codeLine: 11,
          action: 'delete',
        });
        return steps;
      }

      count[card] -= 1;

      steps.push({
        state: {
          nums: display,
          hashMap: { ...count },
          result: `Group: [${first}..${first + groupSize - 1}]`,
        },
        highlights: display.indexOf(card) >= 0 ? [display.indexOf(card)] : [],
        message: `Use one copy of card ${card}. Remaining: ${count[card]}.`,
        codeLine: 12,
        action: 'compare',
      });

      if (count[card] === 0) {
        if (card !== heap[0]) {
          steps.push({
            state: { nums: display, hashMap: { ...count }, result: 'false' },
            highlights: display.indexOf(card) >= 0 ? [display.indexOf(card)] : [],
            message: `Card ${card} is exhausted, but ${heap[0]} (smaller) still has copies whose groups must pass through ${card}. Return false.`,
            codeLine: 15,
            action: 'delete',
          });
          return steps;
        }

        heap.shift();

        steps.push({
          state: { nums: display, hashMap: { ...count }, result: `Heap: [${heap.join(', ')}]` },
          highlights: [],
          message: `Card ${card} is used up and it was the heap minimum — pop it. Heap: [${heap.length ? heap.join(', ') : 'empty'}].`,
          codeLine: 16,
          action: 'pop',
        });
      }
    }
  }

  steps.push({
    state: { nums: display, hashMap: { ...count }, result: 'true' },
    highlights: [],
    message: `Heap empty — every card was consumed into a valid consecutive group. Return true.`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const handOfStraights: Algorithm = {
  id: 'hand-of-straights',
  name: 'Hand of Straights',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Greedy + Hash Map — sort, greedily form groups from smallest',
  description:
    'Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards. Given an integer array hand where hand[i] is the value written on the ith card and an integer groupSize, return true if she can rearrange the cards, or false otherwise.',
  problemUrl: 'https://leetcode.com/problems/hand-of-straights/',
  code: {
    python: `from collections import Counter

def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False
    count = Counter(hand)

    for start in sorted(count):
        if count[start] > 0:
            need = count[start]
            for i in range(groupSize):
                if count[start + i] < need:
                    return False
                count[start + i] -= need

    return True`,
    javascript: `function isNStraightHand(hand, groupSize) {
    if (hand.length % groupSize !== 0) return false;
    const count = {};
    for (const c of hand) count[c] = (count[c] || 0) + 1;

    const sorted = [...new Set(hand)].sort((a,b) => a-b);
    for (const start of sorted) {
        if (count[start] > 0) {
            const need = count[start];
            for (let i = 0; i < groupSize; i++) {
                if ((count[start+i] || 0) < need) return false;
                count[start+i] -= need;
            }
        }
    }
    return true;
}`,
    java: `public static boolean isNStraightHand(int[] hand, int groupSize) {
    if (hand.length % groupSize != 0) return false;

    Map<Integer, Integer> count = new TreeMap<>();
    for (int card : hand) {
        count.put(card, count.getOrDefault(card, 0) + 1);
    }

    for (int start : count.keySet()) {
        if (count.get(start) > 0) {
            int need = count.get(start);
            for (int i = 0; i < groupSize; i++) {
                int card = start + i;
                if (count.getOrDefault(card, 0) < need) {
                    return false;
                }
                count.put(card, count.get(card) - need);
            }
        }
    }

    return true;
}`,
  },
  defaultInput: { hand: [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize: 3 },
  run: runHandOfStraights,
  optimalApproachName: 'Sorted Map Greedy',
  approaches: [
    {
      id: 'min-heap',
      name: 'Min-Heap',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of scanning all sorted values, keep unique cards in a min-heap and repeatedly build a group from the current minimum, popping values as they run out.',
      code: {
        python: `import heapq
from collections import Counter

def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False
    count = Counter(hand)
    minH = list(count.keys())
    heapq.heapify(minH)
    while minH:
        first = minH[0]
        for card in range(first, first + groupSize):
            if count.get(card, 0) == 0:
                return False
            count[card] -= 1
            if count[card] == 0:
                if card != minH[0]:
                    return False
                heapq.heappop(minH)
    return True`,
        javascript: `function isNStraightHand(hand, groupSize) {
    if (hand.length % groupSize !== 0) return false;
    const count = new Map();
    for (const c of hand) count.set(c, (count.get(c) || 0) + 1);
    const minH = [...count.keys()].sort((a, b) => a - b);
    while (minH.length) {
        const first = minH[0];
        for (let card = first; card < first + groupSize; card++) {
            if ((count.get(card) || 0) === 0) return false;
            count.set(card, count.get(card) - 1);
            if (count.get(card) === 0) {
                if (card !== minH[0]) return false;
                minH.shift();
            }
        }
    }
    return true;
}`,
        java: `public static boolean isNStraightHand(int[] hand, int groupSize) {
    if (hand.length % groupSize != 0) return false;
    Map<Integer, Integer> count = new HashMap<>();
    for (int c : hand) count.put(c, count.getOrDefault(c, 0) + 1);
    PriorityQueue<Integer> minH = new PriorityQueue<>(count.keySet());
    while (!minH.isEmpty()) {
        int first = minH.peek();
        for (int card = first; card < first + groupSize; card++) {
            if (count.getOrDefault(card, 0) == 0) return false;
            count.put(card, count.get(card) - 1);
            if (count.get(card) == 0) {
                if (card != minH.peek()) return false;
                minH.poll();
            }
        }
    }
    return true;
}`,
      },
      run: runHandOfStraightsMinHeap,
      lineExplanations: {
        python: {
          1: 'Import heapq — Python ships a min-heap only, so max-heaps use negated values',
          2: 'Counter walks the input once and returns the whole {value: count} map',
          4: 'Define function taking hand and groupSize',
          5: 'Hand must divide evenly into groups',
          6: 'Not divisible, return false',
          7: 'Counter walks the input once and returns the whole {value: count} map',
          8: 'Collect the unique card values',
          9: 'Heapify so the smallest value is always on top',
          10: 'Keep forming groups until every card is used',
          11: 'The heap minimum must start the next group',
          12: 'The group needs groupSize consecutive cards',
          13: 'A needed card has no copies left',
          14: 'Group cannot be completed, return false',
          15: 'Consume one copy of this card',
          16: 'Did this card just run out?',
          17: 'A smaller card still needs groups passing through here',
          18: 'That smaller card can never finish its groups, return false',
          19: 'Exhausted card was the minimum — pop it off the heap',
          20: 'Heap empty: every card fit into a group',
        },
        javascript: {
          1: 'Define function taking hand and groupSize',
          2: 'Hand must divide evenly into groups',
          3: 'Count copies of each card value',
          4: 'Build the frequency map',
          5: 'Sorted unique values act as the min-heap (min at front)',
          6: 'Keep forming groups until every card is used',
          7: 'The heap minimum must start the next group',
          8: 'The group needs groupSize consecutive cards',
          9: 'A needed card has no copies left — return false',
          10: 'Consume one copy of this card',
          11: 'Did this card just run out?',
          12: 'A smaller card still needs groups passing through here — return false',
          13: 'Exhausted card was the minimum — pop it off the heap',
          17: 'Heap empty: every card fit into a group',
        },
        java: {
          1: 'Define method taking hand array and groupSize',
          2: 'Hand must divide evenly into groups',
          3: 'Count copies of each card value',
          4: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
          5: 'Min-heap of the unique card values',
          6: 'Keep forming groups until every card is used',
          7: 'The heap minimum must start the next group',
          8: 'The group needs groupSize consecutive cards',
          9: 'A needed card has no copies left — return false',
          10: 'Consume one copy of this card',
          11: 'Did this card just run out?',
          12: 'A smaller card still needs groups passing through here — return false',
          13: 'Exhausted card was the minimum — pop it off the heap',
          17: 'Heap empty: every card fit into a group',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Counter walks the input once and returns the whole {value: count} map',
      3: 'Define function taking hand and groupSize',
      4: 'Check if hand size is divisible by groupSize',
      5: 'Not divisible, return false',
      6: 'Counter walks the input once and returns the whole {value: count} map',
      8: 'Iterate through sorted unique card values',
      9: 'Skip cards already fully used',
      10: 'Number of groups starting from this card',
      11: 'Check each consecutive card in the group',
      12: 'Not enough cards to form group, return false',
      13: 'Return false immediately',
      14: 'Subtract used cards from count',
      16: 'All groups formed successfully',
    },
    javascript: {
      1: 'Define function taking hand and groupSize',
      2: 'Check if hand size is divisible by groupSize',
      3: 'Count frequency of each card value',
      4: 'Build frequency map from hand array',
      6: 'Sort unique card values in ascending order',
      7: 'Iterate through sorted unique cards',
      8: 'Skip cards already fully used',
      9: 'Number of groups starting from this card',
      10: 'Check each consecutive card in the group',
      11: 'Not enough cards, return false',
      12: 'Subtract used cards from count',
      16: 'All groups formed successfully, return true',
    },
    java: {
      1: 'Define method taking hand array and groupSize',
      2: 'Check if hand size is divisible by groupSize',
      4: 'Use TreeMap to maintain sorted card counts',
      5: 'Build frequency map from hand array',
      6: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
      10: 'Iterate through sorted unique card values',
      11: 'Skip cards already fully used',
      12: 'Number of groups starting from this card',
      13: 'Check each consecutive card in group',
      14: 'Get current card value',
      15: 'Not enough cards to form group',
      16: 'Return false immediately',
      18: 'Subtract used cards from count',
      23: 'All groups formed successfully, return true',
    },
  },
};
