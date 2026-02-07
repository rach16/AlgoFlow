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
    python: `def networkDelayTime(times, n, k):
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
};
