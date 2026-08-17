import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface ShipInput {
  weights: number[];
  days: number;
}

function runCapacityToShipPackages(input: unknown): AlgorithmStep[] {
  const { weights, days } = input as ShipInput;
  const steps: AlgorithmStep[] = [];
  const maxW = Math.max(...weights);
  const sumW = weights.reduce((a, b) => a + b, 0);

  steps.push({
    state: { nums: [...weights], days },
    highlights: [],
    message: `Ship [${weights.join(', ')}] in order within ${days} days. Find the smallest daily capacity that still works`,
    codeLine: 1,
  });

  let lo = maxW;
  let hi = sumW;

  steps.push({
    state: { nums: [...weights], days, lo, hi },
    highlights: [],
    pointers: { lo, hi },
    message: `Capacity must be at least max(weights) = ${maxW} (one package has to fit) and at most sum = ${sumW} (ship everything in one day). Binary search capacity in [${lo}, ${hi}] — feasibility is monotonic: if capacity c works, so does c + 1`,
    codeLine: 2,
  });

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    steps.push({
      state: { nums: [...weights], days, lo, hi, capacity: mid },
      highlights: [],
      pointers: { lo, hi },
      message: `Try capacity = (${lo} + ${hi}) / 2 = ${mid} — can we finish in ${days} days at ${mid} tons/day?`,
      codeLine: 5,
      action: 'visit',
    });

    let needed = 1;
    let load = 0;

    for (let i = 0; i < weights.length; i++) {
      const w = weights[i];
      let note: string;
      if (load + w > mid) {
        needed += 1;
        load = w;
        note = `${w} would push the load past ${mid} — start day ${needed}, load = ${w}`;
      } else {
        load += w;
        note = `${w} fits — day ${needed} load is now ${load}/${mid}`;
      }

      steps.push({
        state: {
          nums: [...weights],
          days,
          lo,
          hi,
          capacity: mid,
          daysUsed: needed,
          load,
        },
        highlights: [i],
        secondary: weights.map((_, j) => j).filter((j) => j < i),
        pointers: { i, lo, hi },
        message: `Package ${i} (weight ${w}): ${note}`,
        codeLine: 12,
        action: 'compare',
      });
    }

    steps.push({
      state: { nums: [...weights], days, lo, hi, capacity: mid, daysUsed: needed },
      highlights: [],
      pointers: { lo, hi },
      message: `Capacity ${mid} needs ${needed} day${needed === 1 ? '' : 's'}; the budget is ${days}`,
      codeLine: 14,
      action: 'compare',
    });

    if (needed <= days) {
      steps.push({
        state: { nums: [...weights], days, lo, hi, capacity: mid, daysUsed: needed },
        highlights: [],
        pointers: { lo, hi },
        message: `${needed} <= ${days} — ${mid} is feasible, but maybe something smaller is too. Keep it as a candidate: hi = ${mid}`,
        codeLine: 15,
        action: 'found',
      });
      hi = mid;
    } else {
      steps.push({
        state: { nums: [...weights], days, lo, hi, capacity: mid, daysUsed: needed },
        highlights: [],
        pointers: { lo, hi },
        message: `${needed} > ${days} — ${mid} is too small, and so is everything below it: lo = ${mid + 1}`,
        codeLine: 17,
        action: 'compare',
      });
      lo = mid + 1;
    }
  }

  steps.push({
    state: { nums: [...weights], days, result: lo },
    highlights: [],
    message: `lo and hi met — the minimum capacity that ships everything within ${days} days is ${lo}`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

function runCapacityToShipPackagesLinearScan(input: unknown): AlgorithmStep[] {
  const { weights, days } = input as ShipInput;
  const steps: AlgorithmStep[] = [];
  const maxW = Math.max(...weights);
  const sumW = weights.reduce((a, b) => a + b, 0);

  steps.push({
    state: { nums: [...weights], days },
    highlights: [],
    message: `Brute force: start at capacity ${maxW} and step up one ton at a time until the ship finishes in ${days} days`,
    codeLine: 1,
  });

  for (let cap = maxW; cap <= sumW; cap++) {
    steps.push({
      state: { nums: [...weights], days, capacity: cap },
      highlights: [],
      message: `Test capacity = ${cap}`,
      codeLine: 4,
      action: 'visit',
    });

    let needed = 1;
    let load = 0;

    for (let i = 0; i < weights.length; i++) {
      const w = weights[i];
      let note: string;
      if (load + w > cap) {
        needed += 1;
        load = w;
        note = `${w} overflows day ${needed - 1} — start day ${needed}, load = ${w}`;
      } else {
        load += w;
        note = `${w} fits — day ${needed} load is now ${load}/${cap}`;
      }

      steps.push({
        state: { nums: [...weights], days, capacity: cap, daysUsed: needed, load },
        highlights: [i],
        secondary: weights.map((_, j) => j).filter((j) => j < i),
        pointers: { i },
        message: `Package ${i} (weight ${w}): ${note}`,
        codeLine: 10,
        action: 'compare',
      });
    }

    if (needed <= days) {
      steps.push({
        state: { nums: [...weights], days, capacity: cap, daysUsed: needed, result: cap },
        highlights: [],
        message: `${needed} <= ${days} — capacity ${cap} works, and every smaller capacity already failed. Answer: ${cap}`,
        codeLine: 13,
        action: 'found',
      });
      return steps;
    }

    steps.push({
      state: { nums: [...weights], days, capacity: cap, daysUsed: needed },
      highlights: [],
      message: `${needed} > ${days} — capacity ${cap} is too small. Bump to ${cap + 1}. (Binary search would jump straight to the midpoint instead)`,
      codeLine: 14,
      action: 'compare',
    });
  }

  steps.push({
    state: { nums: [...weights], days, result: sumW },
    highlights: [],
    message: `Worst case is one giant day: capacity ${sumW}`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

export const capacityToShipPackages: Algorithm = {
  id: 'capacity-to-ship-packages',
  name: 'Capacity To Ship Packages Within D Days',
  category: 'Binary Search',
  difficulty: 'Medium',
  timeComplexity: 'O(n log(sum − max))',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search on Answer — smallest capacity that fits in D days',
  description:
    'A conveyor belt has packages that must be shipped from one port to another within days days. The packages must be loaded on the ship in the given order. Return the least weight capacity of the ship that will result in all the packages being shipped within days days.',
  problemUrl: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/',
  code: {
    python: `def shipWithinDays(weights, days):
    lo, hi = max(weights), sum(weights)

    while lo < hi:
        mid = (lo + hi) // 2

        needed, load = 1, 0
        for w in weights:
            if load + w > mid:
                needed += 1
                load = 0
            load += w

        if needed <= days:
            hi = mid
        else:
            lo = mid + 1

    return lo`,
    javascript: `function shipWithinDays(weights, days) {
    let lo = Math.max(...weights);
    let hi = weights.reduce((a, b) => a + b, 0);

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        let needed = 1;
        let load = 0;
        for (const w of weights) {
            if (load + w > mid) {
                needed++;
                load = 0;
            }
            load += w;
        }

        if (needed <= days) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
}`,
    java: `public static int shipWithinDays(int[] weights, int days) {
    int lo = 0;
    int hi = 0;
    for (int w : weights) {
        lo = Math.max(lo, w);
        hi += w;
    }

    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;

        int needed = 1;
        int load = 0;
        for (int w : weights) {
            if (load + w > mid) {
                needed++;
                load = 0;
            }
            load += w;
        }

        if (needed <= days) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
}`,
  },
  defaultInput: { weights: [1, 2, 3, 4, 5], days: 2 },
  run: runCapacityToShipPackages,
  optimalApproachName: 'Binary Search on Capacity',
  approaches: [
    {
      id: 'linear-scan-capacity',
      name: 'Linear Scan of Capacities',
      timeComplexity: 'O(n · (sum − max))',
      spaceComplexity: 'O(1)',
      description:
        'Try capacities max(weights), max+1, max+2 ... and return the first that fits in days days — the same greedy feasibility check, but walked one ton at a time instead of halved.',
      code: {
        python: `def shipWithinDays(weights, days):
    cap = max(weights)

    while True:
        needed, load = 1, 0
        for w in weights:
            if load + w > cap:
                needed += 1
                load = 0
            load += w

        if needed <= days:
            return cap
        cap += 1`,
        javascript: `function shipWithinDays(weights, days) {
    let cap = Math.max(...weights);

    while (true) {
        let needed = 1;
        let load = 0;
        for (const w of weights) {
            if (load + w > cap) {
                needed++;
                load = 0;
            }
            load += w;
        }

        if (needed <= days) {
            return cap;
        }
        cap++;
    }
}`,
        java: `public static int shipWithinDays(int[] weights, int days) {
    int cap = 0;
    for (int w : weights) {
        cap = Math.max(cap, w);
    }

    while (true) {
        int needed = 1;
        int load = 0;
        for (int w : weights) {
            if (load + w > cap) {
                needed++;
                load = 0;
            }
            load += w;
        }

        if (needed <= days) {
            return cap;
        }
        cap++;
    }
}`,
      },
      run: runCapacityToShipPackagesLinearScan,
      lineExplanations: {
        python: {
          1: 'Define function taking package weights and the day budget',
          2: 'Smallest capacity worth trying — the heaviest single package',
          4: 'Keep raising the capacity until one works',
          5: 'Greedy check: start on day 1 with an empty hold',
          6: 'Load packages in the given order',
          7: 'Would this package overflow the current day?',
          8: 'Roll over to the next day',
          9: 'Empty the hold',
          10: 'Put the package on board',
          12: 'Did the greedy packing fit in the budget?',
          13: 'First capacity that fits is the minimum',
          14: 'Otherwise add one ton and retry',
        },
        javascript: {
          1: 'Define function taking package weights and the day budget',
          2: 'Smallest capacity worth trying — the heaviest single package',
          4: 'Keep raising the capacity until one works',
          5: 'Greedy check: start on day 1',
          6: 'Empty hold',
          7: 'Load packages in the given order',
          8: 'Would this package overflow the current day?',
          9: 'Roll over to the next day',
          10: 'Empty the hold',
          12: 'Put the package on board',
          15: 'Did the greedy packing fit in the budget?',
          16: 'First capacity that fits is the minimum',
          18: 'Otherwise add one ton and retry',
        },
        java: {
          1: 'Define method taking package weights and the day budget',
          2: 'Start the capacity at zero',
          3: 'Scan for the heaviest single package',
          4: 'That weight is the smallest capacity worth trying',
          7: 'Keep raising the capacity until one works',
          8: 'Greedy check: start on day 1',
          9: 'Empty hold',
          10: 'Load packages in the given order',
          11: 'Would this package overflow the current day?',
          12: 'Roll over to the next day',
          13: 'Empty the hold',
          15: 'Put the package on board',
          18: 'Did the greedy packing fit in the budget?',
          19: 'First capacity that fits is the minimum',
          21: 'Otherwise add one ton and retry',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking package weights and the day budget',
      2: 'Capacity lives between the heaviest package and the total weight',
      4: 'Shrink the capacity window until it collapses to one value',
      5: 'Candidate capacity for this round',
      7: 'Greedy feasibility check: day 1, empty hold',
      8: 'Packages must be loaded in the given order',
      9: 'Would adding this package exceed the capacity?',
      10: 'Then it has to wait for the next day',
      11: 'Reset the hold for that new day',
      12: 'Load the package',
      14: 'Feasible if the greedy packing fits in the budget',
      15: 'mid works — keep it as a candidate (hi = mid, not mid - 1)',
      16: 'Otherwise mid is too small',
      17: 'Discard mid and everything below it',
      19: 'lo == hi is the least feasible capacity',
    },
    javascript: {
      1: 'Define function taking package weights and the day budget',
      2: 'Lower bound: the heaviest single package must fit',
      3: 'Upper bound: ship everything in one day',
      5: 'Shrink the capacity window until it collapses to one value',
      6: 'Candidate capacity for this round',
      8: 'Greedy feasibility check starts on day 1',
      9: 'Empty hold',
      10: 'Packages must be loaded in the given order',
      11: 'Would adding this package exceed the capacity?',
      12: 'Then it has to wait for the next day',
      13: 'Reset the hold for that new day',
      15: 'Load the package',
      18: 'Feasible if the greedy packing fits in the budget',
      19: 'mid works — keep it as a candidate (hi = mid, not mid - 1)',
      20: 'Otherwise mid is too small',
      21: 'Discard mid and everything below it',
      25: 'lo == hi is the least feasible capacity',
    },
    java: {
      1: 'Define method taking package weights and the day budget',
      2: 'Lower bound starts at zero',
      3: 'Upper bound starts at zero',
      4: 'One pass to compute both bounds',
      5: 'Lower bound: the heaviest single package must fit',
      6: 'Upper bound: total weight, i.e. one giant day',
      9: 'Shrink the capacity window until it collapses to one value',
      10: 'Overflow-safe candidate capacity for this round',
      12: 'Greedy feasibility check starts on day 1',
      13: 'Empty hold',
      14: 'Packages must be loaded in the given order',
      15: 'Would adding this package exceed the capacity?',
      16: 'Then it has to wait for the next day',
      17: 'Reset the hold for that new day',
      19: 'Load the package',
      22: 'Feasible if the greedy packing fits in the budget',
      23: 'mid works — keep it as a candidate (hi = mid, not mid - 1)',
      24: 'Otherwise mid is too small',
      25: 'Discard mid and everything below it',
      29: 'lo == hi is the least feasible capacity',
    },
  },
};
