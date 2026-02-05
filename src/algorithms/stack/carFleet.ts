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
  },
  defaultInput: { target: 12, position: [10, 8, 0, 5, 3], speed: [2, 4, 1, 1, 3] },
  run: runCarFleet,
};
