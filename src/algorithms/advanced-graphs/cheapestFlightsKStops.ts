import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CheapestFlightsInput {
  n: number;
  flights: number[][];
  src: number;
  dst: number;
  k: number;
}

function runCheapestFlightsKStops(input: unknown): AlgorithmStep[] {
  const { n, flights, src, dst, k } = input as CheapestFlightsInput;
  const steps: AlgorithmStep[] = [];

  // Build graph for visualization
  const nodes = Array.from({ length: n }, (_, i) => `${i}`);
  const edges = flights.map(([u, v, w]) => ({ from: `${u}`, to: `${v}`, label: `$${w}` }));
  const graph = { nodes, edges };

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${src}`],
      graphVisitedEdges: [],
      result: `Finding cheapest path from ${src} to ${dst} with at most ${k} stops...`,
    },
    highlights: [],
    message: `Bellman-Ford variant: find cheapest flight from ${src} to ${dst} with at most ${k} stops.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Bellman-Ford with at most k+1 edges
  let prices = new Array(n).fill(Infinity);
  prices[src] = 0;

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${src}`],
      graphVisitedEdges: [],
      result: `Prices: [${prices.map((p, i) => `${i}:${p === Infinity ? 'inf' : p}`).join(', ')}]`,
    },
    highlights: [],
    message: `Initialize: price[${src}] = 0, all others = infinity. Run ${k + 1} relaxation rounds.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  const visitedEdges: { from: string; to: string }[] = [];

  for (let i = 0; i <= k; i++) {
    const tempPrices = [...prices];

    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: [`${src}`],
        graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
        result: `Round ${i + 1}/${k + 1}: Prices: [${prices.map((p, j) => `${j}:${p === Infinity ? 'inf' : p}`).join(', ')}]`,
      },
      highlights: [],
      message: `Round ${i + 1} of ${k + 1}: relax all edges using prices from previous round.`,
      codeLine: 5,
    } as AlgorithmStep);

    for (const [u, v, w] of flights) {
      if (prices[u] === Infinity) continue;

      if (prices[u] + w < tempPrices[v]) {
        tempPrices[v] = prices[u] + w;
        const edgeEntry = { from: `${u}`, to: `${v}` };
        if (!visitedEdges.some(e => e.from === edgeEntry.from && e.to === edgeEntry.to)) {
          visitedEdges.push(edgeEntry);
        }

        steps.push({
          state: {
            graph,
            graphDirected: true,
            graphHighlights: [`${u}`, `${v}`],
            graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
            result: `Prices: [${tempPrices.map((p, j) => `${j}:${p === Infinity ? 'inf' : p}`).join(', ')}]`,
          },
          highlights: [],
          message: `Edge ${u}->${v} (cost $${w}): price[${u}]=${prices[u]}, update price[${v}] = ${prices[u] + w}.`,
          codeLine: 7,
          action: 'insert',
        } as AlgorithmStep);
      }
    }

    prices = tempPrices;
  }

  const answer = prices[dst] === Infinity ? -1 : prices[dst];

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: answer !== -1 ? [`${src}`, `${dst}`] : [],
      graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
      result: `Cheapest price: ${answer === -1 ? 'No path found (-1)' : `$${answer}`}`,
    },
    highlights: [],
    message: `Done! Cheapest price from ${src} to ${dst} with at most ${k} stops = ${answer === -1 ? '-1 (unreachable)' : `$${answer}`}.`,
    codeLine: 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const cheapestFlightsKStops: Algorithm = {
  id: 'cheapest-flights-k-stops',
  name: 'Cheapest Flights Within K Stops',
  category: 'Advanced Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(E·K)',
  spaceComplexity: 'O(V)',
  pattern: 'Bellman-Ford — relax edges K+1 times for shortest with stops',
  description:
    'There are n cities connected by some number of flights. You are given an array flights where flights[i] = [fromi, toi, pricei]. You are also given three integers src, dst, and k, return the cheapest price from src to dst with at most k stops. If there is no such route, return -1.',
  problemUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
  code: {
    python: `def findCheapestPrice(n, flights, src, dst, k):
    prices = [float('inf')] * n
    prices[src] = 0

    for i in range(k + 1):
        temp = prices[:]
        for u, v, w in flights:
            if prices[u] == float('inf'):
                continue
            if prices[u] + w < temp[v]:
                temp[v] = prices[u] + w
        prices = temp

    return -1 if prices[dst] == float('inf') else prices[dst]`,
    javascript: `function findCheapestPrice(n, flights, src, dst, k) {
    let prices = new Array(n).fill(Infinity);
    prices[src] = 0;

    for (let i = 0; i <= k; i++) {
        const temp = [...prices];
        for (const [u, v, w] of flights) {
            if (prices[u] === Infinity) continue;
            if (prices[u] + w < temp[v]) {
                temp[v] = prices[u] + w;
            }
        }
        prices = temp;
    }

    return prices[dst] === Infinity ? -1 : prices[dst];
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: {
    n: 4,
    flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]],
    src: 0,
    dst: 3,
    k: 1,
  },
  run: runCheapestFlightsKStops,
};
