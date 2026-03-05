import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface GasStationInput {
  gas: number[];
  cost: number[];
}

function runGasStation(input: unknown): AlgorithmStep[] {
  const { gas, cost } = input as GasStationInput;
  const steps: AlgorithmStep[] = [];
  const n = gas.length;

  steps.push({
    state: {
      nums: [...gas],
      count: 0,
      result: `Gas: [${gas.join(', ')}], Cost: [${cost.join(', ')}]`,
    },
    highlights: [],
    message: `Find starting station to complete a circular trip. Gas: [${gas.join(', ')}], Cost: [${cost.join(', ')}].`,
    codeLine: 1,
  });

  // Check if solution exists: total gas must be >= total cost
  const totalGas = gas.reduce((a, b) => a + b, 0);
  const totalCost = cost.reduce((a, b) => a + b, 0);

  steps.push({
    state: {
      nums: [...gas],
      count: 0,
      result: `Total gas: ${totalGas}, Total cost: ${totalCost}`,
    },
    highlights: [],
    message: `Total gas = ${totalGas}, Total cost = ${totalCost}. ${totalGas >= totalCost ? 'Solution exists!' : 'No solution.'}`,
    codeLine: 2,
    action: 'compare',
  });

  if (totalGas < totalCost) {
    steps.push({
      state: {
        nums: [...gas],
        count: 0,
        result: 'Result: -1 (impossible)',
      },
      highlights: [],
      message: `Total gas < total cost. Impossible to complete the circuit. Return -1.`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  let tank = 0;
  let start = 0;

  for (let i = 0; i < n; i++) {
    tank += gas[i] - cost[i];
    const net = gas[i] - cost[i];

    steps.push({
      state: {
        nums: [...gas],
        count: tank,
        result: `Start: ${start}, Tank: ${tank}`,
      },
      highlights: [i],
      pointers: { i, start },
      message: `Station ${i}: gas=${gas[i]}, cost=${cost[i]}, net=${net >= 0 ? '+' : ''}${net}. Tank = ${tank}.`,
      codeLine: 5,
      action: 'visit',
    });

    if (tank < 0) {
      start = i + 1;
      tank = 0;

      steps.push({
        state: {
          nums: [...gas],
          count: tank,
          result: `Start: ${start}, Tank: ${tank}`,
        },
        highlights: [i],
        pointers: { i, start },
        message: `Tank went negative! Reset: start = ${start}, tank = 0.`,
        codeLine: 7,
        action: 'delete',
      });
    }
  }

  steps.push({
    state: {
      nums: [...gas],
      count: tank,
      result: `Starting station: ${start}`,
    },
    highlights: [start],
    pointers: { start },
    message: `Done! Starting station = ${start}.`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const gasStation: Algorithm = {
  id: 'gas-station',
  name: 'Gas Station',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — if total gas >= total cost, start where surplus resets',
  description:
    'There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. Return the starting gas station\'s index if you can travel around the circuit once in the clockwise direction, otherwise return -1.',
  problemUrl: 'https://leetcode.com/problems/gas-station/',
  code: {
    python: `def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1

    total = 0
    start = 0
    for i in range(len(gas)):
        total += gas[i] - cost[i]
        if total < 0:
            total = 0
            start = i + 1

    return start`,
    javascript: `function canCompleteCircuit(gas, cost) {
    if (gas.reduce((a,b) => a+b) < cost.reduce((a,b) => a+b))
        return -1;

    let total = 0, start = 0;
    for (let i = 0; i < gas.length; i++) {
        total += gas[i] - cost[i];
        if (total < 0) {
            total = 0;
            start = i + 1;
        }
    }
    return start;
}`,
    java: `public static int canCompleteCircuit(int[] gas, int[] cost) {
    int totalGas = 0, totalCost = 0;
    for (int i = 0; i < gas.length; i++) {
        totalGas += gas[i];
        totalCost += cost[i];
    }
    if (totalGas < totalCost) return -1;

    int total = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        total += gas[i] - cost[i];
        if (total < 0) {
            total = 0;
            start = i + 1;
        }
    }

    return start;
}`,
  },
  defaultInput: { gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] },
  run: runGasStation,
  lineExplanations: {
    python: {
      1: 'Define function taking gas and cost arrays',
      2: 'Check if total gas is less than total cost',
      3: 'Impossible to complete circuit, return -1',
      5: 'Initialize running fuel total',
      6: 'Initialize candidate starting station',
      7: 'Iterate through each gas station',
      8: 'Add net fuel gain/loss at this station',
      9: 'If tank goes negative, this start fails',
      10: 'Reset fuel total to zero',
      11: 'Try next station as starting point',
      13: 'Return the valid starting station index',
    },
    javascript: {
      1: 'Define function taking gas and cost arrays',
      2: 'Check if total gas is less than total cost',
      3: 'Impossible to complete circuit, return -1',
      5: 'Initialize running total and start index',
      6: 'Iterate through each gas station',
      7: 'Add net fuel gain/loss at this station',
      8: 'If tank goes negative, this start fails',
      9: 'Reset fuel total to zero',
      10: 'Try next station as starting point',
      13: 'Return the valid starting station index',
    },
    java: {
      1: 'Define method taking gas and cost arrays',
      2: 'Initialize total gas and total cost sums',
      3: 'Sum up all gas values',
      4: 'Accumulate total gas',
      5: 'Accumulate total cost',
      7: 'If total gas < total cost, return -1',
      9: 'Initialize running total and start index',
      10: 'Iterate through each gas station',
      11: 'Add net fuel gain/loss at this station',
      12: 'If tank goes negative, this start fails',
      13: 'Reset fuel total to zero',
      14: 'Try next station as starting point',
      18: 'Return the valid starting station index',
    },
  },
};
