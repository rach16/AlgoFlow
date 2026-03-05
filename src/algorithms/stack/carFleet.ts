import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CarFleetInput {
  target: number;
  position: number[];
  speed: number[];
}

function runCarFleet(input: unknown): AlgorithmStep[] {
  const { target, position, speed } = input as CarFleetInput;
  const steps: AlgorithmStep[] = [];
  const n = position.length;

  steps.push({
    state: { nums: [...position], stack: [], target },
    highlights: [],
    message: `Target: ${target}. Positions: [${position.join(', ')}], Speeds: [${speed.join(', ')}]`,
    codeLine: 1,
  });

  // Pair position with speed and sort by position descending
  const cars: [number, number][] = position.map((p, i) => [p, speed[i]]);
  cars.sort((a, b) => b[0] - a[0]);

  const sortedPositions = cars.map((c) => c[0]);
  const timeToTarget = cars.map(([p, s]) => (target - p) / s);

  steps.push({
    state: {
      nums: sortedPositions,
      stack: [],
      target,
      chars: timeToTarget.map((t, i) => `pos=${cars[i][0]} t=${t.toFixed(2)}`),
    },
    highlights: [],
    message: `Sort by position (descending). Compute time to reach target for each car.`,
    codeLine: 3,
  });

  const fleetStack: number[] = []; // stores time to target for each fleet

  for (let i = 0; i < n; i++) {
    const [pos, spd] = cars[i];
    const time = timeToTarget[i];

    steps.push({
      state: {
        nums: sortedPositions,
        stack: [...fleetStack.map((t) => Number(t.toFixed(2)))],
        target,
      },
      highlights: [i],
      pointers: { car: i },
      message: `Car at position ${pos}, speed ${spd}. Time to target: (${target} - ${pos}) / ${spd} = ${time.toFixed(2)}`,
      codeLine: 6,
      action: 'visit',
    });

    if (fleetStack.length === 0 || time > fleetStack[fleetStack.length - 1]) {
      // This car is slower, forms a new fleet
      fleetStack.push(time);

      steps.push({
        state: {
          nums: sortedPositions,
          stack: [...fleetStack.map((t) => Number(t.toFixed(2)))],
          target,
        },
        highlights: [i],
        pointers: { car: i },
        message: `Time ${time.toFixed(2)} > top of stack (${fleetStack.length > 1 ? fleetStack[fleetStack.length - 2].toFixed(2) : 'empty'}). New fleet! Push onto stack. Fleets: ${fleetStack.length}`,
        codeLine: 8,
        action: 'push',
      });
    } else {
      // This car catches up to the fleet ahead, merges
      steps.push({
        state: {
          nums: sortedPositions,
          stack: [...fleetStack.map((t) => Number(t.toFixed(2)))],
          target,
        },
        highlights: [i],
        pointers: { car: i },
        message: `Time ${time.toFixed(2)} <= ${fleetStack[fleetStack.length - 1].toFixed(2)}. Car merges into fleet ahead. No new fleet.`,
        codeLine: 10,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: {
      nums: sortedPositions,
      stack: [...fleetStack.map((t) => Number(t.toFixed(2)))],
      target,
      result: fleetStack.length,
    },
    highlights: [],
    message: `Done! Total car fleets: ${fleetStack.length}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const carFleet: Algorithm = {
  id: 'car-fleet',
  name: 'Car Fleet',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Stack — sort by position, merge fleets by arrival time',
  description:
    'There are n cars going to the same destination along a one-lane road. You are given two integer arrays position and speed, and an integer target. A car can never pass another car ahead of it but can catch up and then travel at the same speed. A car fleet is cars driving at the same position and speed. Return the number of car fleets that will arrive at the destination.',
  problemUrl: 'https://leetcode.com/problems/car-fleet/',
  code: {
    python: `def carFleet(target, position, speed):
    pairs = sorted(zip(position, speed), reverse=True)
    stack = []

    for pos, spd in pairs:
        time = (target - pos) / spd

        if not stack or time > stack[-1]:
            stack.append(time)
        # else: car merges into fleet ahead

    return len(stack)`,
    javascript: `function carFleet(target, position, speed) {
    const pairs = position.map((p, i) => [p, speed[i]]);
    pairs.sort((a, b) => b[0] - a[0]);
    const stack = [];

    for (const [pos, spd] of pairs) {
        const time = (target - pos) / spd;

        if (!stack.length || time > stack[stack.length - 1]) {
            stack.push(time);
        }
        // else: car merges into fleet ahead
    }

    return stack.length;
}`,
    java: `public static int carFleet(int target, int[] position, int[] speed) {
    int[][] pairs = new int[position.length][2];
    for (int i = 0; i < position.length; i++) {
        pairs[i] = new int[] { position[i], speed[i] };
    }
    Arrays.sort(pairs, (a, b) -> b[0] - a[0]);
    Deque<Double> stack = new ArrayDeque<>();

    for (int[] pair : pairs) {
        double time = (double) (target - pair[0]) / pair[1];
        if (stack.isEmpty() || time > stack.peek()) {
            stack.push(time);
        }
    }

    return stack.size();
}`,
  },
  defaultInput: { target: 12, position: [10, 8, 0, 5, 3], speed: [2, 4, 1, 1, 3] },
  run: runCarFleet,
  lineExplanations: {
    python: {
      1: 'Define function with target, position, speed',
      2: 'Pair and sort cars by position descending',
      3: 'Initialize stack for fleet arrival times',
      5: 'Iterate through sorted car pairs',
      6: 'Calculate time to reach target for this car',
      8: 'If stack empty or car is slower than fleet ahead',
      9: 'Push time onto stack as new fleet',
      11: 'Return number of fleets (stack size)',
    },
    javascript: {
      1: 'Define function with target, position, speed',
      2: 'Pair each position with its speed',
      3: 'Sort pairs by position descending',
      4: 'Initialize stack for fleet arrival times',
      6: 'Iterate through sorted car pairs',
      7: 'Calculate time to reach target',
      9: 'If stack empty or car is slower than fleet ahead',
      10: 'Push time onto stack as new fleet',
      15: 'Return number of fleets (stack size)',
    },
    java: {
      1: 'Define method with target, position, speed arrays',
      2: 'Create pairs array for position and speed',
      3: 'Fill pairs with position and speed values',
      4: 'Set each pair from input arrays',
      6: 'Sort pairs by position descending',
      7: 'Initialize stack for fleet arrival times',
      9: 'Iterate through sorted pairs',
      10: 'Calculate time to reach target',
      11: 'If stack empty or car is slower than fleet ahead',
      12: 'Push time onto stack as new fleet',
      16: 'Return number of fleets (stack size)',
    },
  },
};
