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
    python: `def isNStraightHand(hand, groupSize):
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
  lineExplanations: {
    python: {
      1: 'Define function taking hand and groupSize',
      2: 'Check if hand size is divisible by groupSize',
      3: 'Not divisible, return false',
      4: 'Count frequency of each card value',
      6: 'Iterate through sorted unique card values',
      7: 'Skip cards already fully used',
      8: 'Number of groups starting from this card',
      9: 'Check each consecutive card in the group',
      10: 'Not enough cards to form group, return false',
      11: 'Return false immediately',
      12: 'Subtract used cards from count',
      14: 'All groups formed successfully',
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
      6: 'Count each card occurrence',
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
