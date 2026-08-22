import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface NetworkDelayInput {
  times: number[][];
  n: number;
  k: number;
}

function runNetworkDelayTime(input: unknown): AlgorithmStep[] {
  const { times, n, k } = input as NetworkDelayInput;
  const steps: AlgorithmStep[] = [];

  // Build adjacency list
  const adj: Record<number, [number, number][]> = {};
  for (let i = 1; i <= n; i++) adj[i] = [];
  for (const [u, v, w] of times) {
    adj[u].push([v, w]);
  }

  // Build graph for visualization
  const nodes = Array.from({ length: n }, (_, i) => `${i + 1}`);
  const edges = times.map(([u, v, w]) => ({ from: `${u}`, to: `${v}`, label: `${w}` }));
  const graph = { nodes, edges };

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${k}`],
      graphVisitedEdges: [],
      result: 'Initializing Dijkstra...',
    },
    highlights: [],
    message: `Dijkstra's algorithm from node ${k}. ${n} nodes, ${times.length} edges.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Dijkstra's algorithm
  const dist: Record<number, number> = {};
  for (let i = 1; i <= n; i++) dist[i] = Infinity;
  dist[k] = 0;

  // Simple priority queue using array
  const pq: [number, number][] = [[0, k]]; // [distance, node]
  const visited = new Set<number>();
  const visitedEdges: { from: string; to: string }[] = [];

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${k}`],
      graphVisitedEdges: [],
      result: `Distances: {${nodes.map(nd => `${nd}: ${dist[parseInt(nd)] === Infinity ? 'inf' : dist[parseInt(nd)]}`).join(', ')}}`,
    },
    highlights: [],
    message: `Set distance to source node ${k} = 0, all others = infinity.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  while (pq.length > 0) {
    // Extract minimum
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);

    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: Array.from(visited).map(v => `${v}`),
        graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
        result: `Distances: {${nodes.map(nd => `${nd}: ${dist[parseInt(nd)] === Infinity ? 'inf' : dist[parseInt(nd)]}`).join(', ')}}`,
      },
      highlights: [],
      message: `Process node ${u} with distance ${d}. Mark as visited.`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    for (const [v, w] of adj[u]) {
      if (visited.has(v)) continue;
      const newDist = d + w;

      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: Array.from(visited).map(x => `${x}`),
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          result: `Distances: {${nodes.map(nd => `${nd}: ${dist[parseInt(nd)] === Infinity ? 'inf' : dist[parseInt(nd)]}`).join(', ')}}`,
        },
        highlights: [],
        message: `Edge ${u} -> ${v} (weight ${w}): current dist[${v}] = ${dist[v] === Infinity ? 'inf' : dist[v]}, new = ${newDist}.`,
        codeLine: 7,
        action: 'compare',
      } as AlgorithmStep);

      if (newDist < dist[v]) {
        dist[v] = newDist;
        pq.push([newDist, v]);
        visitedEdges.push({ from: `${u}`, to: `${v}` });

        steps.push({
          state: {
            graph,
            graphDirected: true,
            graphHighlights: Array.from(visited).map(x => `${x}`),
            graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
            result: `Distances: {${nodes.map(nd => `${nd}: ${dist[parseInt(nd)] === Infinity ? 'inf' : dist[parseInt(nd)]}`).join(', ')}}`,
          },
          highlights: [],
          message: `Update dist[${v}] = ${newDist}. Add to priority queue.`,
          codeLine: 8,
          action: 'insert',
        } as AlgorithmStep);
      }
    }
  }

  const maxDist = Math.max(...Object.values(dist));
  const answer = maxDist === Infinity ? -1 : maxDist;

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: Array.from(visited).map(v => `${v}`),
      graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
      result: `Network delay time: ${answer}`,
    },
    highlights: [],
    message: `Done! Maximum distance = ${answer}${answer === -1 ? ' (not all nodes reachable)' : ''}.`,
    codeLine: 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runNetworkDelayBellmanFord(input: unknown): AlgorithmStep[] {
  const { times, n, k } = input as NetworkDelayInput;
  const steps: AlgorithmStep[] = [];

  const nodes = Array.from({ length: n }, (_, i) => `${i + 1}`);
  const edges = times.map(([u, v, w]) => ({ from: `${u}`, to: `${v}`, label: `${w}` }));
  const graph = { nodes, edges };

  const dist: Record<number, number> = {};
  for (let i = 1; i <= n; i++) dist[i] = Infinity;
  dist[k] = 0;

  const fmtDist = () =>
    `Distances: {${nodes.map(nd => `${nd}: ${dist[parseInt(nd)] === Infinity ? 'inf' : dist[parseInt(nd)]}`).join(', ')}}`;

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${k}`],
      graphVisitedEdges: [],
      result: 'Initializing Bellman-Ford...',
    },
    highlights: [],
    message: `Bellman-Ford: no priority queue — just relax every edge up to ${n - 1} times. Shortest paths use at most ${n - 1} edges.`,
    codeLine: 1,
  } as AlgorithmStep);

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [`${k}`],
      graphVisitedEdges: [],
      result: fmtDist(),
    },
    highlights: [],
    message: `Set dist[${k}] = 0 (the source), all other nodes = infinity.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  const visitedEdges: { from: string; to: string }[] = [];

  for (let round = 1; round <= n - 1; round++) {
    let updated = false;

    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: [`${k}`],
        graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
        result: `Round ${round}/${n - 1}: ${fmtDist()}`,
      },
      highlights: [],
      message: `Round ${round} of ${n - 1}: sweep over all ${times.length} edges and relax any that shorten a path.`,
      codeLine: 5,
    } as AlgorithmStep);

    for (const [u, v, w] of times) {
      if (dist[u] === Infinity) continue;
      const newDist = dist[u] + w;

      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [`${u}`, `${v}`],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          result: fmtDist(),
        },
        highlights: [],
        message: `Edge ${u} -> ${v} (weight ${w}): dist[${u}] + ${w} = ${newDist} vs dist[${v}] = ${dist[v] === Infinity ? 'inf' : dist[v]}.`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);

      if (newDist < dist[v]) {
        dist[v] = newDist;
        updated = true;
        if (!visitedEdges.some(e => e.from === `${u}` && e.to === `${v}`)) {
          visitedEdges.push({ from: `${u}`, to: `${v}` });
        }

        steps.push({
          state: {
            graph,
            graphDirected: true,
            graphHighlights: [`${v}`],
            graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
            result: fmtDist(),
          },
          highlights: [],
          message: `Relax! dist[${v}] improves to ${newDist}.`,
          codeLine: 9,
          action: 'insert',
        } as AlgorithmStep);
      }
    }

    if (!updated) {
      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          result: fmtDist(),
        },
        highlights: [],
        message: `Round ${round} changed nothing — distances have converged, so we can stop early.`,
        codeLine: 12,
      } as AlgorithmStep);
      break;
    }
  }

  const maxDist = Math.max(...Object.values(dist));
  const answer = maxDist === Infinity ? -1 : maxDist;

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: nodes.filter(nd => dist[parseInt(nd)] !== Infinity),
      graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
      result: `Network delay time: ${answer}`,
    },
    highlights: [],
    message: `Done! The slowest node determines the delay: answer = ${answer}${answer === -1 ? ' (some node unreachable)' : ''}.`,
    codeLine: 15,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const networkDelayTime: Algorithm = {
  id: 'network-delay-time',
  name: 'Network Delay Time',
  category: 'Advanced Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(E log V)',
  spaceComplexity: 'O(V+E)',
  pattern: 'Dijkstra — min heap shortest path from source',
  description:
    'You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (ui, vi, wi), where ui is the source node, vi is the target node, and wi is the time it takes for a signal to travel from source to target. We will send a signal from a given node k. Return the minimum time it takes for all the n nodes to receive the signal. If it is impossible for all the n nodes to receive the signal, return -1.',
  problemUrl: 'https://leetcode.com/problems/network-delay-time/',
  code: {
    python: `import heapq
from collections import defaultdict

def networkDelayTime(times, n, k):
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))

    dist = {i: float('inf') for i in range(1, n+1)}
    dist[k] = 0
    heap = [(0, k)]

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))

    mx = max(dist.values())
    return mx if mx < float('inf') else -1`,
    javascript: `function networkDelayTime(times, n, k) {
    const graph = {};
    for (let i = 1; i <= n; i++) graph[i] = [];
    for (const [u, v, w] of times)
        graph[u].push([v, w]);

    const dist = {};
    for (let i = 1; i <= n; i++) dist[i] = Infinity;
    dist[k] = 0;
    const heap = [[0, k]]; // [dist, node]

    while (heap.length) {
        heap.sort((a, b) => a[0] - b[0]);
        const [d, u] = heap.shift();
        if (d > dist[u]) continue;
        for (const [v, w] of graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                heap.push([dist[v], v]);
            }
        }
    }
    const mx = Math.max(...Object.values(dist));
    return mx === Infinity ? -1 : mx;
}`,
    java: `public int networkDelayTime(int[][] times, int n, int k) {
    Map<Integer, List<int[]>> graph = new HashMap<>();
    for (int i = 1; i <= n; i++) graph.put(i, new ArrayList<>());
    for (int[] time : times) {
        graph.get(time[0]).add(new int[]{time[1], time[2]});
    }

    Map<Integer, Integer> dist = new HashMap<>();
    for (int i = 1; i <= n; i++) dist.put(i, Integer.MAX_VALUE);
    dist.put(k, 0);

    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    heap.offer(new int[]{0, k});

    while (!heap.isEmpty()) {
        int[] curr = heap.poll();
        int d = curr[0], u = curr[1];
        if (d > dist.get(u)) continue;
        for (int[] edge : graph.get(u)) {
            int v = edge[0], w = edge[1];
            if (dist.get(u) + w < dist.get(v)) {
                dist.put(v, dist.get(u) + w);
                heap.offer(new int[]{dist.get(v), v});
            }
        }
    }

    int mx = 0;
    for (int d : dist.values()) {
        if (d == Integer.MAX_VALUE) return -1;
        mx = Math.max(mx, d);
    }
    return mx;
}`,
  },
  defaultInput: { times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n: 4, k: 2 },
  run: runNetworkDelayTime,
  optimalApproachName: "Dijkstra's Algorithm",
  approaches: [
    {
      id: 'bellman-ford',
      name: 'Bellman-Ford',
      timeComplexity: 'O(V·E)',
      spaceComplexity: 'O(V)',
      description:
        'Skips the priority queue entirely: relax every edge up to V-1 times, since a shortest path never needs more than V-1 edges — simpler than Dijkstra and it even tolerates negative weights.',
      code: {
        python: `def networkDelayTime(times, n, k):
    dist = {i: float('inf') for i in range(1, n + 1)}
    dist[k] = 0

    for _ in range(n - 1):
        updated = False
        for u, v, w in times:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        if not updated:
            break

    mx = max(dist.values())
    return mx if mx < float('inf') else -1`,
        javascript: `function networkDelayTime(times, n, k) {
    const dist = {};
    for (let i = 1; i <= n; i++) dist[i] = Infinity;
    dist[k] = 0;

    for (let round = 0; round < n - 1; round++) {
        let updated = false;
        for (const [u, v, w] of times) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                updated = true;
            }
        }
        if (!updated) break;
    }

    const mx = Math.max(...Object.values(dist));
    return mx === Infinity ? -1 : mx;
}`,
        java: `public int networkDelayTime(int[][] times, int n, int k) {
    int INF = Integer.MAX_VALUE;
    int[] dist = new int[n + 1];
    Arrays.fill(dist, INF);
    dist[k] = 0;

    for (int round = 0; round < n - 1; round++) {
        boolean updated = false;
        for (int[] t : times) {
            int u = t[0], v = t[1], w = t[2];
            if (dist[u] != INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                updated = true;
            }
        }
        if (!updated) break;
    }

    int mx = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INF) return -1;
        mx = Math.max(mx, dist[i]);
    }
    return mx;
}`,
      },
      run: runNetworkDelayBellmanFord,
      lineExplanations: {
        python: {
          1: 'Define function with edges, node count, source',
          2: 'Init all distances to infinity',
          3: 'Source node has zero distance',
          5: 'A shortest path uses at most n-1 edges',
          6: 'Track whether this round changed anything',
          7: 'Sweep over every edge (no ordering needed)',
          8: 'Would going through u shorten the path to v?',
          9: 'Relax: record the shorter distance',
          10: 'Mark that this round made progress',
          11: 'No edge improved — distances converged',
          12: 'Stop early, later rounds cannot help',
          14: 'The answer is the farthest node',
          15: 'Return max distance, or -1 if unreachable',
        },
        javascript: {
          1: 'Define function with edges, node count, source',
          2: 'Distance map for all nodes',
          3: 'Init all distances to Infinity',
          4: 'Source node has zero distance',
          6: 'A shortest path uses at most n-1 edges',
          7: 'Track whether this round changed anything',
          8: 'Sweep over every edge (no ordering needed)',
          9: 'Would going through u shorten the path to v?',
          10: 'Relax: record the shorter distance',
          11: 'Mark that this round made progress',
          14: 'No edge improved — stop early',
          17: 'The answer is the farthest node',
          18: 'Return max distance, or -1 if unreachable',
        },
        java: {
          1: 'Define method with edges, node count, source',
          2: 'Constant for unreachable distance',
          3: 'Distance array (1-indexed nodes)',
          4: 'Init all distances to infinity',
          5: 'Source node has zero distance',
          7: 'A shortest path uses at most n-1 edges',
          8: 'Track whether this round changed anything',
          9: 'Sweep over every edge (no ordering needed)',
          10: 'Unpack edge: from, to, weight',
          11: 'Would going through u shorten the path to v?',
          12: 'Relax: record the shorter distance',
          13: 'Mark that this round made progress',
          16: 'No edge improved — stop early',
          19: 'Track the maximum distance',
          20: 'Check every node',
          21: 'Any unreachable node means answer is -1',
          22: 'The answer is the farthest node',
          24: 'Return the network delay time',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq — Python ships a min-heap only, so max-heaps use negated values',
      2: 'defaultdict creates the empty value on first touch, so no "is this key here?" check',
      4: 'Define function with edges, node count, source',
      5: 'Build adjacency list using defaultdict',
      6: 'Add each directed edge with weight',
      7: 'Store destination and weight pair',
      9: 'Init distances to infinity for all nodes',
      10: 'Source node has zero distance',
      11: 'Min-heap starts with source node',
      13: 'Process nodes while heap is not empty',
      14: 'Pop node with smallest distance',
      15: 'Skip if we already found a shorter path',
      16: 'Skip stale heap entries',
      17: 'Explore each neighbor edge',
      18: 'Check if this path is shorter',
      19: 'Update shortest distance to neighbor',
      20: 'Push updated distance to heap',
      22: 'Find maximum distance among all nodes',
      23: 'Return max distance or -1 if unreachable',
    },
    javascript: {
      1: 'Define function with edges, node count, source',
      2: 'Create adjacency list object',
      3: 'Init empty adjacency list for each node',
      4: 'Process each edge',
      5: 'Add neighbor with weight to source node',
      7: 'Init distance map for all nodes',
      8: 'Set all distances to Infinity',
      9: 'Source has zero distance',
      10: 'Min-heap as sorted array of [dist, node]',
      12: 'Process while heap has entries',
      13: 'Sort to get minimum distance first',
      14: 'Pop the minimum distance node',
      15: 'Skip stale entries',
      16: 'Explore neighbors of current node',
      17: 'Check if path through u is shorter',
      18: 'Update distance to neighbor',
      19: 'Push new distance to heap',
      23: 'Find max distance across all nodes',
      24: 'Return max distance or -1 if unreachable',
    },
    java: {
      1: 'Define method with edges, node count, source',
      2: 'Create adjacency list as HashMap',
      3: 'Init empty list for each node',
      4: 'Process each edge',
      5: 'Add neighbor with weight to graph',
      8: 'Init distance map for all nodes',
      9: 'Set all distances to max integer value',
      10: 'Source has zero distance',
      12: 'Create min-heap sorted by distance',
      13: 'Add source with distance 0 to heap',
      15: 'Process while heap has entries',
      16: 'Pop minimum distance entry',
      17: 'Extract distance and node from entry',
      18: 'Skip stale entries',
      19: 'Explore neighbors of current node',
      20: 'Extract neighbor and weight',
      21: 'Check if path through u is shorter',
      22: 'Update distance to neighbor',
      23: 'Push new distance to heap',
      28: 'Find max distance across all nodes',
      29: 'Iterate over all distances',
      30: 'Return -1 if any node unreachable',
      31: 'Track maximum distance',
      33: 'Return the network delay time',
    },
  },
};
