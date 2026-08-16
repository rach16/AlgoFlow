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

function runCheapestFlightsBFS(input: unknown): AlgorithmStep[] {
  const { n, flights, src, dst, k } = input as CheapestFlightsInput;
  const steps: AlgorithmStep[] = [];

  const nodes = Array.from({ length: n }, (_, i) => `${i}`);
  const edges = flights.map(([u, v, w]) => ({ from: `${u}`, to: `${v}`, label: `$${w}` }));
  const graph = { nodes, edges };

  const adj: Record<number, [number, number][]> = {};
  for (let i = 0; i < n; i++) adj[i] = [];
  for (const [u, v, w] of flights) adj[u].push([v, w]);

  const best = new Array(n).fill(Infinity);
  best[src] = 0;

  const fmtBest = () => `Best: [${best.map((p: number, i: number) => `${i}:${p === Infinity ? 'inf' : p}`).join(', ')}]`;

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${src}`],
      graphVisitedEdges: [],
      result: `BFS level-by-level from ${src}, at most ${k + 1} levels...`,
    },
    highlights: [],
    message: `BFS by levels: each level = one more flight taken. Stopping after ${k + 1} levels enforces the "at most ${k} stops" rule naturally.`,
    codeLine: 1,
  } as AlgorithmStep);

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${src}`],
      graphVisitedEdges: [],
      result: fmtBest(),
    },
    highlights: [],
    message: `Initialize best[${src}] = 0 and enqueue (${src}, cost 0).`,
    codeLine: 7,
    action: 'visit',
  } as AlgorithmStep);

  const visitedEdges: { from: string; to: string }[] = [];
  let queue: [number, number][] = [[src, 0]];
  let stops = 0;

  while (queue.length > 0 && stops <= k) {
    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: queue.map(([u]) => `${u}`),
        graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
        result: `Level ${stops} (flight ${stops + 1} of at most ${k + 1}): ${fmtBest()}`,
      },
      highlights: [],
      message: `Level ${stops}: expand ${queue.length} node(s) in the queue — every expansion here uses exactly ${stops + 1} flight(s).`,
      codeLine: 11,
    } as AlgorithmStep);

    const next: [number, number][] = [];
    for (const [u, cost] of queue) {
      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [`${u}`],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          result: fmtBest(),
        },
        highlights: [],
        message: `Dequeue city ${u} reached for $${cost}. Try each outgoing flight.`,
        codeLine: 13,
        action: 'pop',
      } as AlgorithmStep);

      for (const [v, w] of adj[u]) {
        if (cost + w < best[v]) {
          best[v] = cost + w;
          next.push([v, cost + w]);
          if (!visitedEdges.some(e => e.from === `${u}` && e.to === `${v}`)) {
            visitedEdges.push({ from: `${u}`, to: `${v}` });
          }

          steps.push({
            state: {
              graph,
              graphDirected: true,
              graphHighlights: [`${u}`, `${v}`],
              graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
              result: fmtBest(),
            },
            highlights: [],
            message: `Flight ${u} -> ${v} ($${w}): new total $${cost + w} beats best[${v}]. Update and enqueue for the next level.`,
            codeLine: 16,
            action: 'insert',
          } as AlgorithmStep);
        } else {
          steps.push({
            state: {
              graph,
              graphDirected: true,
              graphHighlights: [`${u}`, `${v}`],
              graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
              result: fmtBest(),
            },
            highlights: [],
            message: `Flight ${u} -> ${v} ($${w}): total $${cost + w} is not cheaper than best[${v}] = ${best[v] === Infinity ? 'inf' : `$${best[v]}`}. Prune.`,
            codeLine: 15,
            action: 'compare',
          } as AlgorithmStep);
        }
      }
    }

    queue = next;
    stops++;
  }

  const answer = best[dst] === Infinity ? -1 : best[dst];

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: answer !== -1 ? [`${src}`, `${dst}`] : [],
      graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
      result: `Cheapest price: ${answer === -1 ? 'No path found (-1)' : `$${answer}`}`,
    },
    highlights: [],
    message: `Done after ${stops} level(s)! Cheapest price from ${src} to ${dst} within ${k} stops = ${answer === -1 ? '-1 (unreachable)' : `$${answer}`}.`,
    codeLine: 20,
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
    java: `public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    int[] prices = new int[n];
    Arrays.fill(prices, Integer.MAX_VALUE);
    prices[src] = 0;

    for (int i = 0; i <= k; i++) {
        int[] temp = Arrays.copyOf(prices, n);
        for (int[] flight : flights) {
            int u = flight[0], v = flight[1], w = flight[2];
            if (prices[u] == Integer.MAX_VALUE) continue;
            if (prices[u] + w < temp[v]) {
                temp[v] = prices[u] + w;
            }
        }
        prices = temp;
    }
    return prices[dst] == Integer.MAX_VALUE ? -1 : prices[dst];
}`,
  },
  defaultInput: {
    n: 4,
    flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]],
    src: 0,
    dst: 3,
    k: 1,
  },
  run: runCheapestFlightsKStops,
  optimalApproachName: 'Bellman-Ford',
  approaches: [
    {
      id: 'bfs-level-by-level',
      name: 'BFS Level-by-Level',
      timeComplexity: 'O(E·K)',
      spaceComplexity: 'O(V+E)',
      description:
        'Where Bellman-Ford relaxes every edge blindly each round, BFS expands outward from the source one flight per level, so the stop limit maps directly onto the number of BFS levels explored.',
      code: {
        python: `def findCheapestPrice(n, flights, src, dst, k):
    adj = defaultdict(list)
    for u, v, w in flights:
        adj[u].append((v, w))

    best = [float('inf')] * n
    best[src] = 0
    queue = deque([(src, 0)])
    stops = 0

    while queue and stops <= k:
        for _ in range(len(queue)):
            u, cost = queue.popleft()
            for v, w in adj[u]:
                if cost + w < best[v]:
                    best[v] = cost + w
                    queue.append((v, cost + w))
        stops += 1

    return -1 if best[dst] == float('inf') else best[dst]`,
        javascript: `function findCheapestPrice(n, flights, src, dst, k) {
    const adj = {};
    for (let i = 0; i < n; i++) adj[i] = [];
    for (const [u, v, w] of flights) adj[u].push([v, w]);

    const best = new Array(n).fill(Infinity);
    best[src] = 0;
    let queue = [[src, 0]];
    let stops = 0;

    while (queue.length && stops <= k) {
        const next = [];
        for (const [u, cost] of queue) {
            for (const [v, w] of adj[u]) {
                if (cost + w < best[v]) {
                    best[v] = cost + w;
                    next.push([v, cost + w]);
                }
            }
        }
        queue = next;
        stops++;
    }

    return best[dst] === Infinity ? -1 : best[dst];
}`,
        java: `public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    Map<Integer, List<int[]>> adj = new HashMap<>();
    for (int i = 0; i < n; i++) adj.put(i, new ArrayList<>());
    for (int[] f : flights) adj.get(f[0]).add(new int[]{f[1], f[2]});

    int[] best = new int[n];
    Arrays.fill(best, Integer.MAX_VALUE);
    best[src] = 0;
    Queue<int[]> queue = new LinkedList<>();
    queue.offer(new int[]{src, 0});
    int stops = 0;

    while (!queue.isEmpty() && stops <= k) {
        int size = queue.size();
        for (int s = 0; s < size; s++) {
            int[] curr = queue.poll();
            for (int[] next : adj.get(curr[0])) {
                int cost = curr[1] + next[1];
                if (cost < best[next[0]]) {
                    best[next[0]] = cost;
                    queue.offer(new int[]{next[0], cost});
                }
            }
        }
        stops++;
    }

    return best[dst] == Integer.MAX_VALUE ? -1 : best[dst];
}`,
      },
      run: runCheapestFlightsBFS,
      lineExplanations: {
        python: {
          1: 'Define function with cities, flights, src, dst, k',
          2: 'Build adjacency list of outgoing flights',
          3: 'Process each flight edge',
          4: 'Store (destination, price) per source city',
          6: 'Cheapest known cost to reach each city',
          7: 'Source city costs nothing to reach',
          8: 'Queue holds (city, cost so far)',
          9: 'Count how many levels (flights) taken',
          11: 'Each BFS level = one more flight, cap at k+1',
          12: 'Expand only the nodes from this level',
          13: 'Dequeue a city and its running cost',
          14: 'Try every outgoing flight',
          15: 'Only continue if strictly cheaper — prunes exploded paths',
          16: 'Record the new cheapest cost',
          17: 'Enqueue for the next level',
          18: 'Whole level done: one more flight used',
          20: 'Return best cost to dst, or -1 if unreachable',
        },
        javascript: {
          1: 'Define function with cities, flights, src, dst, k',
          2: 'Adjacency list of outgoing flights',
          3: 'Init an empty list per city',
          4: 'Store [destination, price] per source city',
          6: 'Cheapest known cost to reach each city',
          7: 'Source city costs nothing to reach',
          8: 'Queue holds [city, cost so far]',
          9: 'Count how many levels (flights) taken',
          11: 'Each BFS level = one more flight, cap at k+1',
          12: 'Next level built separately',
          13: 'Expand every node from this level',
          14: 'Try every outgoing flight',
          15: 'Only continue if strictly cheaper — prunes bad paths',
          16: 'Record the new cheapest cost',
          17: 'Enqueue for the next level',
          21: 'Swap in the next level',
          22: 'One more flight used',
          25: 'Return best cost to dst, or -1 if unreachable',
        },
        java: {
          1: 'Define method with cities, flights, src, dst, k',
          2: 'Adjacency list of outgoing flights',
          3: 'Init an empty list per city',
          4: 'Store {destination, price} per source city',
          6: 'Cheapest known cost to reach each city',
          7: 'Init costs to infinity',
          8: 'Source city costs nothing to reach',
          9: 'BFS queue of {city, cost} pairs',
          10: 'Start from the source at cost 0',
          11: 'Count how many levels (flights) taken',
          13: 'Each BFS level = one more flight, cap at k+1',
          14: 'Freeze this level\'s size before expanding',
          15: 'Expand only this level\'s nodes',
          16: 'Dequeue a city and its running cost',
          17: 'Try every outgoing flight',
          18: 'Total cost if we take this flight',
          19: 'Only continue if strictly cheaper',
          20: 'Record the new cheapest cost',
          21: 'Enqueue for the next level',
          25: 'One more flight used',
          28: 'Return best cost to dst, or -1 if unreachable',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function with cities, flights, src, dst, k',
      2: 'Init prices array to infinity for all cities',
      3: 'Source city has zero cost',
      5: 'Relax edges k+1 times for at most k stops',
      6: 'Copy prices to avoid using current round updates',
      7: 'Process each flight edge',
      8: 'Skip if source city is unreachable',
      9: 'Skip unreachable source city',
      10: 'Check if cheaper path exists through u',
      11: 'Update temp price for destination',
      12: 'Replace prices with temp for next round',
      14: 'Return -1 if destination unreachable, else price',
    },
    javascript: {
      1: 'Define function with cities, flights, src, dst, k',
      2: 'Init prices array to Infinity',
      3: 'Source city has zero cost',
      5: 'Relax edges k+1 times for at most k stops',
      6: 'Copy prices to avoid current-round interference',
      7: 'Process each flight edge',
      8: 'Skip if source is unreachable',
      9: 'Check if cheaper path exists through u',
      10: 'Update temp price for destination',
      13: 'Replace prices with temp for next round',
      15: 'Return -1 if unreachable, else cheapest price',
    },
    java: {
      1: 'Define method with cities, flights, src, dst, k',
      2: 'Init prices array for all cities',
      3: 'Fill prices with max integer value',
      4: 'Source city has zero cost',
      6: 'Relax edges k+1 times for at most k stops',
      7: 'Copy prices to avoid current-round interference',
      8: 'Process each flight edge',
      9: 'Extract source, destination, and cost',
      10: 'Skip if source is unreachable',
      11: 'Check if cheaper path exists through u',
      12: 'Update temp price for destination',
      15: 'Replace prices with temp for next round',
      17: 'Return -1 if unreachable, else cheapest price',
    },
  },
};
