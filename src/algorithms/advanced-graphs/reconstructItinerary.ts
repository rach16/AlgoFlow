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

function runReconstructItineraryBacktracking(input: unknown): AlgorithmStep[] {
  const tickets = (input as string[][]).map(t => [...t]);
  const steps: AlgorithmStep[] = [];
  const MAX_STEPS = 75;

  // Build adjacency list, destinations sorted ascending (try smallest first)
  const adjList: Record<string, (string | null)[]> = {};
  const allNodes = new Set<string>();
  for (const [from, to] of tickets) {
    if (!adjList[from]) adjList[from] = [];
    adjList[from].push(to);
    allNodes.add(from);
    allNodes.add(to);
  }
  for (const key of Object.keys(adjList)) {
    adjList[key].sort();
  }

  const nodes = Array.from(allNodes);
  const graphEdges = tickets.map(([from, to]) => ({ from, to }));
  const graph = { nodes, edges: graphEdges };
  const total = tickets.length;

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
    message: `Backtracking DFS: try tickets in lexical order, and if we hit a dead end before using all ${total} tickets, undo and try the next option.`,
    codeLine: 1,
  } as AlgorithmStep);

  const route: string[] = ['JFK'];
  const visitedEdges: { from: string; to: string }[] = [];

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: ['JFK'],
      graphVisitedEdges: [],
      stack: ['JFK'],
      result: 'Route: [JFK]',
    },
    highlights: [],
    message: 'Start the route at "JFK" and recursively try to use every ticket exactly once.',
    codeLine: 7,
    action: 'push',
  } as AlgorithmStep);

  const emit = (step: AlgorithmStep) => {
    if (steps.length < MAX_STEPS) steps.push(step);
  };

  function backtrack(airport: string): boolean {
    if (route.length === total + 1) {
      emit({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [airport],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          stack: [...route],
          result: `Route: [${route.join(', ')}]`,
        },
        highlights: [],
        message: `All ${total} tickets used — this lexically-smallest complete route is the answer.`,
        codeLine: 11,
        action: 'found',
      } as AlgorithmStep);
      return true;
    }

    const destinations = adjList[airport] || [];
    for (let i = 0; i < destinations.length; i++) {
      const next = destinations[i];
      if (next === null) continue;

      destinations[i] = null; // use the ticket
      route.push(next);
      visitedEdges.push({ from: airport, to: next });

      emit({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [next],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          stack: [...route],
          result: `Route: [${route.join(', ')}]`,
        },
        highlights: [],
        message: `Try ticket "${airport}" -> "${next}" (smallest unused destination). Route now has ${route.length - 1}/${total} tickets.`,
        codeLine: 16,
        action: 'push',
      } as AlgorithmStep);

      if (backtrack(next)) return true;

      route.pop();
      visitedEdges.pop();
      destinations[i] = next; // restore the ticket

      emit({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [airport],
          graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
          stack: [...route],
          result: `Route: [${route.join(', ')}]`,
        },
        highlights: [],
        message: `Dead end beyond "${next}" — backtrack: return the ticket "${airport}" -> "${next}" and try the next option.`,
        codeLine: 19,
        action: 'pop',
      } as AlgorithmStep);
    }

    return false;
  }

  backtrack('JFK');

  steps.push({
    state: {
      graph,
      graphDirected: true,
      graphHighlights: [],
      graphVisitedEdges: visitedEdges.map(e => ({ ...e })),
      stack: [],
      result: `Itinerary: [${route.join(' -> ')}]`,
    },
    highlights: [],
    message: `Done! Final itinerary: ${route.join(' -> ')}`,
    codeLine: 24,
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
  optimalApproachName: "Hierholzer's Algorithm",
  approaches: [
    {
      id: 'dfs-backtracking',
      name: 'DFS Backtracking',
      timeComplexity: 'O(E^d) worst case',
      spaceComplexity: 'O(E)',
      description:
        "Instead of Hierholzer's guaranteed linear Eulerian-path walk, plain backtracking greedily tries the smallest destination and undoes choices when it strands tickets — intuitive, but can revisit exponentially many partial routes.",
      code: {
        python: `def findItinerary(tickets):
    graph = defaultdict(list)
    for src, dst in sorted(tickets):
        graph[src].append(dst)

    total = len(tickets)
    route = ["JFK"]

    def backtrack(airport):
        if len(route) == total + 1:
            return True
        for i, nxt in enumerate(graph[airport]):
            if nxt is None:
                continue
            graph[airport][i] = None
            route.append(nxt)
            if backtrack(nxt):
                return True
            route.pop()
            graph[airport][i] = nxt
        return False

    backtrack("JFK")
    return route`,
        javascript: `function findItinerary(tickets) {
    const graph = {};
    for (const [src, dst] of [...tickets].sort()) {
        if (!graph[src]) graph[src] = [];
        graph[src].push(dst);
    }

    const total = tickets.length;
    const route = ["JFK"];

    function backtrack(airport) {
        if (route.length === total + 1) return true;
        const dests = graph[airport] || [];
        for (let i = 0; i < dests.length; i++) {
            const next = dests[i];
            if (next === null) continue;
            dests[i] = null;
            route.push(next);
            if (backtrack(next)) return true;
            route.pop();
            dests[i] = next;
        }
        return false;
    }

    backtrack("JFK");
    return route;
}`,
        java: `public List<String> findItinerary(List<List<String>> tickets) {
    Map<String, List<String>> graph = new HashMap<>();
    List<List<String>> sorted = new ArrayList<>(tickets);
    sorted.sort((a, b) -> (a.get(0) + a.get(1)).compareTo(b.get(0) + b.get(1)));
    for (List<String> t : sorted) {
        graph.computeIfAbsent(t.get(0), x -> new ArrayList<>()).add(t.get(1));
    }

    List<String> route = new ArrayList<>(List.of("JFK"));
    backtrack("JFK", graph, route, tickets.size());
    return route;
}

private boolean backtrack(String airport, Map<String, List<String>> graph,
                          List<String> route, int total) {
    if (route.size() == total + 1) return true;
    List<String> dests = graph.getOrDefault(airport, new ArrayList<>());
    for (int i = 0; i < dests.size(); i++) {
        String next = dests.get(i);
        if (next == null) continue;
        dests.set(i, null);
        route.add(next);
        if (backtrack(next, graph, route, total)) return true;
        route.remove(route.size() - 1);
        dests.set(i, next);
    }
    return false;
}`,
      },
      run: runReconstructItineraryBacktracking,
      lineExplanations: {
        python: {
          1: 'Define function taking list of ticket pairs',
          2: 'Build adjacency list with defaultdict',
          3: 'Sort tickets so destinations are tried smallest-first',
          4: 'Append destination to source list',
          6: 'Total tickets — the route must use all of them',
          7: 'Route starts at JFK',
          9: 'Recursive backtracking from current airport',
          10: 'Success: route uses every ticket',
          11: 'Propagate success up the recursion',
          12: 'Try each destination in lexical order',
          13: 'None marks a ticket already used',
          14: 'Skip used tickets',
          15: 'Use this ticket (mark it)',
          16: 'Extend the route with the destination',
          17: 'Recurse — did this choice complete the route?',
          18: 'Yes: keep the choice, bubble success up',
          19: 'No: undo the route extension',
          20: 'Return the ticket for other branches',
          21: 'All destinations failed from here',
          23: 'Kick off the search from JFK',
          24: 'Route now holds the full itinerary',
        },
        javascript: {
          1: 'Define function taking tickets array',
          2: 'Create adjacency list object',
          3: 'Sort a copy so destinations are tried smallest-first',
          4: 'Init list for new source airports',
          5: 'Append destination to source list',
          8: 'Total tickets — the route must use all of them',
          9: 'Route starts at JFK',
          11: 'Recursive backtracking from current airport',
          12: 'Success: route uses every ticket',
          13: 'Destinations available from this airport',
          14: 'Try each destination in lexical order',
          15: 'Read the candidate destination',
          16: 'null marks a ticket already used',
          17: 'Use this ticket (mark it)',
          18: 'Extend the route with the destination',
          19: 'Recurse — keep the choice if it completes the route',
          20: 'Failed: undo the route extension',
          21: 'Return the ticket for other branches',
          23: 'All destinations failed from here',
          26: 'Kick off the search from JFK',
          27: 'Route now holds the full itinerary',
        },
        java: {
          1: 'Define method taking list of ticket pairs',
          2: 'Adjacency list: airport -> destinations',
          3: 'Copy tickets before sorting',
          4: 'Sort so destinations are tried smallest-first',
          5: 'Process each sorted ticket',
          6: 'Append destination to its source list',
          9: 'Route starts at JFK',
          10: 'Kick off recursive backtracking',
          11: 'Route now holds the full itinerary',
          14: 'Recursive backtracking helper',
          16: 'Success: route uses every ticket',
          17: 'Destinations available from this airport',
          18: 'Try each destination in lexical order',
          19: 'Read the candidate destination',
          20: 'null marks a ticket already used',
          21: 'Use this ticket (mark it)',
          22: 'Extend the route with the destination',
          23: 'Recurse — keep the choice if it completes the route',
          24: 'Failed: undo the route extension',
          25: 'Return the ticket for other branches',
          27: 'All destinations failed from here',
        },
      },
    },
  ],
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
