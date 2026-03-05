import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runReconstructItinerary(input: unknown): AlgorithmStep[] {
  const tickets = (input as string[][]).map(t => [...t]);
  const steps: AlgorithmStep[] = [];

  // Build adjacency list
  const adjList: Record<string, string[]> = {};
  const allNodes = new Set<string>();
  for (const [from, to] of tickets) {
    if (!adjList[from]) adjList[from] = [];
    adjList[from].push(to);
    allNodes.add(from);
    allNodes.add(to);
  }
  // Sort destinations in reverse lexical order (so we pop smallest first)
  for (const key of Object.keys(adjList)) {
    adjList[key].sort().reverse();
  }

  // Build graph edges for visualization
  const nodes = Array.from(allNodes);
  const graphEdges: { from: string; to: string; label?: string }[] = [];
  for (const [from, to] of tickets) {
    graphEdges.push({ from, to });
  }

  const graph = { nodes, edges: graphEdges };

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [],
      graphVisitedEdges: [],
      stack: [],
      result: 'Building adjacency list...',
    },
    highlights: [],
    message: 'Build adjacency list from tickets and sort destinations lexically.',
    codeLine: 1,
  } as AlgorithmStep);

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [],
      graphVisitedEdges: [],
      stack: [],
      result: `Adjacency list: ${JSON.stringify(Object.fromEntries(Object.entries(adjList).map(([k, v]) => [k, [...v].reverse()])))}`,
    },
    highlights: [],
    message: 'Adjacency list built. Each destination list is sorted lexically.',
    codeLine: 3,
  } as AlgorithmStep);

  // Hierholzer's algorithm
  const stackArr: string[] = ['JFK'];
  const route: string[] = [];
  const visitedEdges: { from: string; to: string }[] = [];

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: ['JFK'],
      graphVisitedEdges: [],
      stack: ['JFK'],
      result: `Route (reversed): []`,
    },
    highlights: [],
    message: 'Start Hierholzer\'s algorithm from "JFK". Push JFK onto stack.',
    codeLine: 5,
    action: 'push',
  } as AlgorithmStep);

  while (stackArr.length > 0) {
    const top = stackArr[stackArr.length - 1];

    if (adjList[top] && adjList[top].length > 0) {
      const next = adjList[top].pop()!;
      stackArr.push(next);
      visitedEdges.push({ from: top, to: next });

      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [next],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          stack: [...stackArr],
          result: `Route (reversed): [${[...route].join(', ')}]`,
        },
        highlights: [],
        message: `From "${top}", fly to "${next}" (smallest lexical destination). Push "${next}" onto stack.`,
        codeLine: 7,
        action: 'push',
      } as AlgorithmStep);
    } else {
      const node = stackArr.pop()!;
      route.push(node);

      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [node],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          stack: [...stackArr],
          result: `Route (reversed): [${[...route].join(', ')}]`,
        },
        highlights: [],
        message: `"${node}" has no more destinations. Pop and add to route.`,
        codeLine: 9,
        action: 'pop',
      } as AlgorithmStep);
    }
  }

  const itinerary = route.reverse();

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [],
      graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
      stack: [],
      result: `Itinerary: [${itinerary.join(' -> ')}]`,
    },
    highlights: [],
    message: `Done! Reverse the route to get the itinerary: ${itinerary.join(' -> ')}`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const reconstructItinerary: Algorithm = {
  id: 'reconstruct-itinerary',
  name: 'Reconstruct Itinerary',
  category: 'Advanced Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(E log E)',
  spaceComplexity: 'O(E)',
  pattern: 'DFS + Greedy — Hierholzer Eulerian path, sort destinations',
  description:
    'You are given a list of airline tickets where tickets[i] = [fromi, toi] represent the departure and the arrival airports of one flight. Reconstruct the itinerary in order and return it. All of the tickets belong to a man who departs from "JFK", thus, the itinerary must begin with "JFK". If there are multiple valid itineraries, you should return the itinerary that has the smallest lexical order when read as a single string.',
  problemUrl: 'https://leetcode.com/problems/reconstruct-itinerary/',
  code: {
    python: `def findItinerary(tickets):
    graph = defaultdict(list)
    for src, dst in sorted(tickets, reverse=True):
        graph[src].append(dst)

    stack = ["JFK"]
    route = []

    while stack:
        while graph[stack[-1]]:
            stack.append(graph[stack[-1]].pop())
        route.append(stack.pop())

    return route[::-1]`,
    javascript: `function findItinerary(tickets) {
    const graph = {};
    tickets.sort().reverse();
    for (const [src, dst] of tickets) {
        if (!graph[src]) graph[src] = [];
        graph[src].push(dst);
    }

    const stack = ["JFK"];
    const route = [];

    while (stack.length) {
        while (graph[stack[stack.length-1]]?.length) {
            stack.push(graph[stack[stack.length-1]].pop());
        }
        route.push(stack.pop());
    }

    return route.reverse();
}`,
    java: `public List<String> findItinerary(List<List<String>> tickets) {
    Map<String, PriorityQueue<String>> graph = new HashMap<>();
    for (List<String> ticket : tickets) {
        graph.putIfAbsent(ticket.get(0), new PriorityQueue<>());
        graph.get(ticket.get(0)).offer(ticket.get(1));
    }

    Deque<String> stack = new ArrayDeque<>();
    List<String> route = new ArrayList<>();
    stack.push("JFK");

    while (!stack.isEmpty()) {
        while (graph.containsKey(stack.peek()) && !graph.get(stack.peek()).isEmpty()) {
            stack.push(graph.get(stack.peek()).poll());
        }
        route.add(stack.pop());
    }

    Collections.reverse(route);
    return route;
}`,
  },
  defaultInput: [
    ['MUC', 'LHR'],
    ['JFK', 'MUC'],
    ['SFO', 'SJC'],
    ['LHR', 'SFO'],
  ],
  run: runReconstructItinerary,
  lineExplanations: {
    python: {
      1: 'Define function taking list of ticket pairs',
      2: 'Build adjacency list with defaultdict',
      3: 'Sort tickets reverse so pop gives smallest',
      4: 'Append destination to source list',
      6: 'Start Hierholzer algorithm from JFK',
      7: 'Route will be built in reverse',
      9: 'Process while stack has airports',
      10: 'Follow edges while current has neighbors',
      11: 'Pop smallest destination, push to stack',
      12: 'Dead end: pop from stack, add to route',
      14: 'Reverse route to get correct itinerary',
    },
    javascript: {
      1: 'Define function taking tickets array',
      2: 'Create adjacency list object',
      3: 'Sort tickets reverse for pop-smallest trick',
      4: 'Build adjacency list from sorted tickets',
      5: 'Init list for new source airports',
      6: 'Add destination to source list',
      9: 'Start Hierholzer algorithm from JFK',
      10: 'Route will be built in reverse',
      12: 'Process while stack has airports',
      13: 'Follow edges while current has neighbors',
      14: 'Pop smallest destination, push to stack',
      16: 'Dead end: pop from stack, add to route',
      19: 'Reverse route to get correct itinerary',
    },
    java: {
      1: 'Define method taking list of ticket pairs',
      2: 'Build graph with PriorityQueue for ordering',
      3: 'Process each ticket',
      4: 'Create PriorityQueue if not exists for source',
      5: 'Add destination to source priority queue',
      8: 'Init stack for Hierholzer algorithm',
      9: 'Route will be built in reverse',
      10: 'Start from JFK airport',
      12: 'Process while stack has airports',
      13: 'Follow edges while current has neighbors',
      14: 'Poll smallest destination, push to stack',
      16: 'Dead end: pop from stack, add to route',
      19: 'Reverse route to get correct itinerary',
      20: 'Return the reconstructed itinerary',
    },
  },
};
