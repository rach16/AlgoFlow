import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface BoatsInput {
  people: number[];
  limit: number;
}

function runBoatsToSavePeople(input: unknown): AlgorithmStep[] {
  const { people: raw, limit } = input as BoatsInput;
  const people = [...raw];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...people], limit },
    highlights: [],
    message: `Weights [${people.join(', ')}], each boat carries at most 2 people and at most ${limit} kg. Use as few boats as possible`,
    codeLine: 1,
  });

  people.sort((a, b) => a - b);

  steps.push({
    state: { nums: [...people], limit },
    highlights: Array.from({ length: people.length }, (_, k) => k),
    message: `Sort: [${people.join(', ')}]. Greedy insight — the heaviest person must sail, so pair them with the lightest person who still fits`,
    codeLine: 2,
  });

  let l = 0;
  let r = people.length - 1;
  let boats = 0;

  steps.push({
    state: { nums: [...people], limit, boats: 0 },
    highlights: [l, r],
    pointers: { l, r },
    message: `l=${l} (lightest, ${people[l]} kg), r=${r} (heaviest, ${people[r]} kg), boats=0`,
    codeLine: 3,
  });

  while (l <= r) {
    if (l === r) {
      boats++;
      steps.push({
        state: { nums: [...people], limit, boats },
        highlights: [l],
        pointers: { l, r },
        message: `One person left (${people[l]} kg) — they get their own boat. boats = ${boats}`,
        codeLine: 10,
        action: 'found',
      });
      break;
    }

    const pairSum = people[l] + people[r];

    if (pairSum <= limit) {
      boats++;
      steps.push({
        state: { nums: [...people], limit, boats },
        highlights: [l, r],
        pointers: { l, r },
        message: `${people[l]} + ${people[r]} = ${pairSum} <= ${limit} — they share a boat. Both pointers move inward. boats = ${boats}`,
        codeLine: 8,
        action: 'found',
      });
      l++;
      r--;
    } else {
      boats++;
      steps.push({
        state: { nums: [...people], limit, boats },
        highlights: [r],
        secondary: [l],
        pointers: { l, r },
        message: `${people[l]} + ${people[r]} = ${pairSum} > ${limit} — even the lightest person cannot join, so ${people[r]} kg sails alone. Only r moves. boats = ${boats}`,
        codeLine: 9,
        action: 'compare',
      });
      r--;
    }
  }

  steps.push({
    state: { nums: [...people], limit, result: boats },
    highlights: [],
    message: `Everyone is aboard — minimum boats needed: ${boats}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runBoatsCountingSort(input: unknown): AlgorithmStep[] {
  const { people, limit } = input as BoatsInput;
  const steps: AlgorithmStep[] = [];
  const count = new Array<number>(limit + 1).fill(0);

  steps.push({
    state: { nums: [...count], limit },
    highlights: [],
    message: `Weights are bounded by ${limit}, so we can skip comparison sorting: bucket the people by weight. Index = weight, value = how many people weigh that much`,
    codeLine: 2,
  });

  for (const p of people) {
    count[p]++;
    steps.push({
      state: { nums: [...count], limit },
      highlights: [p],
      message: `Bucket a ${p} kg person: count[${p}] = ${count[p]}`,
      codeLine: 4,
      action: 'insert',
    });
  }

  let boats = 0;
  let l = 1;
  let r = limit;

  steps.push({
    state: { nums: [...count], limit, boats: 0 },
    highlights: [l, r],
    pointers: { l, r },
    message: `Buckets built in O(n + ${limit}) — that already gives sorted order. Walk them with two pointers: l=${l} (lightest weight), r=${r} (heaviest weight)`,
    codeLine: 7,
  });

  while (l <= r) {
    while (l <= r && count[l] === 0) l++;
    while (l <= r && count[r] === 0) r--;

    if (l > r) {
      steps.push({
        state: { nums: [...count], limit, boats },
        highlights: [],
        message: `All buckets are empty — everyone has been assigned a boat`,
        codeLine: 13,
      });
      break;
    }

    if (l === r) {
      const pairsHere = Math.floor((count[l] + 1) / 2);
      boats += pairsHere;
      steps.push({
        state: { nums: [...count], limit, boats },
        highlights: [l],
        pointers: { l, r },
        message: `Only weight ${l} remains, with ${count[l]} person(s). Two per boat means ceil(${count[l]} / 2) = ${pairsHere} more boat(s). boats = ${boats}`,
        codeLine: 16,
        action: 'found',
      });
      break;
    }

    steps.push({
      state: { nums: [...count], limit, boats },
      highlights: [l, r],
      pointers: { l, r },
      message: `Lightest remaining weight ${l} (${count[l]} left), heaviest ${r} (${count[r]} left). ${l} + ${r} = ${l + r} vs limit ${limit}`,
      codeLine: 8,
      action: 'compare',
    });

    count[r]--;
    if (l + r <= limit) {
      count[l]--;
      boats++;
      steps.push({
        state: { nums: [...count], limit, boats },
        highlights: [l, r],
        pointers: { l, r },
        message: `${l} + ${r} = ${l + r} <= ${limit} — pair them up, remove one from each bucket. boats = ${boats}`,
        codeLine: 20,
        action: 'found',
      });
    } else {
      boats++;
      steps.push({
        state: { nums: [...count], limit, boats },
        highlights: [r],
        secondary: [l],
        pointers: { l, r },
        message: `${l} + ${r} = ${l + r} > ${limit} — the ${r} kg person sails alone, remove only from bucket ${r}. boats = ${boats}`,
        codeLine: 18,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...count], limit, result: boats },
    highlights: [],
    message: `Minimum boats needed: ${boats}. Counting sort makes this O(n + limit) instead of O(n log n) — better when limit is small relative to n`,
    codeLine: 23,
    action: 'found',
  });

  return steps;
}

export const boatsToSavePeople: Algorithm = {
  id: 'boats-to-save-people',
  name: 'Boats to Save People',
  category: 'Two Pointers',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Sort + Two Pointers — pair lightest with heaviest',
  description:
    'Each boat carries at most two people, provided the sum of their weights is at most limit. Given an array people of weights, return the minimum number of boats needed to carry everyone.',
  problemUrl: 'https://leetcode.com/problems/boats-to-save-people/',
  code: {
    python: `def numRescueBoats(people, limit):
    people.sort()
    l, r = 0, len(people) - 1
    boats = 0

    while l <= r:
        if people[l] + people[r] <= limit:
            l += 1
        r -= 1
        boats += 1

    return boats`,
    javascript: `function numRescueBoats(people, limit) {
    people.sort((a, b) => a - b);
    let l = 0;
    let r = people.length - 1;
    let boats = 0;

    while (l <= r) {
        if (people[l] + people[r] <= limit) {
            l++;
        }
        r--;
        boats++;
    }

    return boats;
}`,
    java: `public static int numRescueBoats(int[] people, int limit) {
    Arrays.sort(people);
    int l = 0;
    int r = people.length - 1;
    int boats = 0;

    while (l <= r) {
        if (people[l] + people[r] <= limit) {
            l++;
        }
        r--;
        boats++;
    }

    return boats;
}`,
  },
  defaultInput: { people: [3, 8, 7, 1, 4, 5, 2, 9], limit: 9 },
  run: runBoatsToSavePeople,
  optimalApproachName: 'Sort + Two Pointers',
  approaches: [
    {
      id: 'counting-sort',
      name: 'Counting Sort',
      timeComplexity: 'O(n + limit)',
      spaceComplexity: 'O(limit)',
      description:
        'Weights are bounded by limit, so bucket them with counting sort instead of comparison sorting — the same greedy pairing runs over the buckets, trading O(limit) space for a linear-time sort.',
      code: {
        python: `def numRescueBoats(people, limit):
    count = [0] * (limit + 1)
    for p in people:
        count[p] += 1

    boats = 0
    l, r = 1, limit
    while l <= r:
        while l <= r and count[l] == 0:
            l += 1
        while l <= r and count[r] == 0:
            r -= 1
        if l > r:
            break
        if l == r:
            boats += (count[l] + 1) // 2
            break
        count[r] -= 1
        if l + r <= limit:
            count[l] -= 1
        boats += 1

    return boats`,
        javascript: `function numRescueBoats(people, limit) {
    const count = new Array(limit + 1).fill(0);
    for (const p of people) {
        count[p]++;
    }

    let boats = 0;
    let l = 1;
    let r = limit;
    while (l <= r) {
        while (l <= r && count[l] === 0) l++;
        while (l <= r && count[r] === 0) r--;
        if (l > r) break;
        if (l === r) {
            boats += Math.ceil(count[l] / 2);
            break;
        }
        count[r]--;
        if (l + r <= limit) count[l]--;
        boats++;
    }

    return boats;
}`,
        java: `public static int numRescueBoats(int[] people, int limit) {
    int[] count = new int[limit + 1];
    for (int p : people) {
        count[p]++;
    }

    int boats = 0;
    int l = 1;
    int r = limit;
    while (l <= r) {
        while (l <= r && count[l] == 0) l++;
        while (l <= r && count[r] == 0) r--;
        if (l > r) break;
        if (l == r) {
            boats += (count[l] + 1) / 2;
            break;
        }
        count[r]--;
        if (l + r <= limit) count[l]--;
        boats++;
    }

    return boats;
}`,
      },
      run: runBoatsCountingSort,
      lineExplanations: {
        python: {
          1: 'Define function taking weights and the boat limit',
          2: 'One bucket per possible weight, 0 through limit',
          3: 'Walk every person',
          4: 'Drop them in their weight bucket — this IS the sort',
          6: 'Boat counter',
          7: 'Two pointers over weights, not over people',
          8: 'Work inward while buckets remain',
          9: 'Skip empty light buckets',
          10: 'Move l up',
          11: 'Skip empty heavy buckets',
          12: 'Move r down',
          13: 'Pointers crossed — everyone is placed',
          14: 'Stop',
          15: 'Only one weight class is left',
          16: 'Pair them two at a time, rounding up',
          17: 'Done',
          18: 'The heaviest remaining person always boards',
          19: 'Can the lightest remaining person join them?',
          20: 'Yes — remove them from their bucket too',
          21: 'That is one boat launched',
          23: 'Minimum number of boats',
        },
        javascript: {
          1: 'Define function taking weights and the boat limit',
          2: 'One bucket per possible weight, 0 through limit',
          3: 'Walk every person',
          4: 'Drop them in their weight bucket — this IS the sort',
          7: 'Boat counter',
          8: 'Light pointer starts at weight 1',
          9: 'Heavy pointer starts at the limit',
          10: 'Work inward while buckets remain',
          11: 'Skip empty light buckets',
          12: 'Skip empty heavy buckets',
          13: 'Pointers crossed — everyone is placed',
          14: 'Only one weight class is left',
          15: 'Pair them two at a time, rounding up',
          18: 'The heaviest remaining person always boards',
          19: 'If the lightest fits too, take them along',
          20: 'That is one boat launched',
          23: 'Minimum number of boats',
        },
        java: {
          1: 'Define function taking weights and the boat limit',
          2: 'One bucket per possible weight, 0 through limit',
          3: 'Walk every person',
          4: 'Drop them in their weight bucket — this IS the sort',
          7: 'Boat counter',
          8: 'Light pointer starts at weight 1',
          9: 'Heavy pointer starts at the limit',
          10: 'Work inward while buckets remain',
          11: 'Skip empty light buckets',
          12: 'Skip empty heavy buckets',
          13: 'Pointers crossed — everyone is placed',
          14: 'Only one weight class is left',
          15: 'Pair them two at a time, rounding up',
          18: 'The heaviest remaining person always boards',
          19: 'If the lightest fits too, take them along',
          20: 'That is one boat launched',
          23: 'Minimum number of boats',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking weights and the boat limit',
      2: 'Sort so the lightest and heaviest sit at the ends',
      3: 'l points at the lightest, r at the heaviest',
      4: 'Boat counter',
      6: 'Keep going until everyone is aboard',
      7: 'Do the lightest and heaviest fit together?',
      8: 'Yes — the light person boards too, so advance l',
      9: 'The heaviest person always boards this boat',
      10: 'Launch it',
      12: 'Minimum number of boats',
    },
    javascript: {
      1: 'Define function taking weights and the boat limit',
      2: 'Numeric sort so lightest and heaviest sit at the ends',
      3: 'l points at the lightest',
      4: 'r points at the heaviest',
      5: 'Boat counter',
      7: 'Keep going until everyone is aboard',
      8: 'Do the lightest and heaviest fit together?',
      9: 'Yes — the light person boards too, so advance l',
      11: 'The heaviest person always boards this boat',
      12: 'Launch it',
      15: 'Minimum number of boats',
    },
    java: {
      1: 'Define function taking weights and the boat limit',
      2: 'Sort so lightest and heaviest sit at the ends',
      3: 'l points at the lightest',
      4: 'r points at the heaviest',
      5: 'Boat counter',
      7: 'Keep going until everyone is aboard',
      8: 'Do the lightest and heaviest fit together?',
      9: 'Yes — the light person boards too, so advance l',
      11: 'The heaviest person always boards this boat',
      12: 'Launch it',
      15: 'Minimum number of boats',
    },
  },
};
