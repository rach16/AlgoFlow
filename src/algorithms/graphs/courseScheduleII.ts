import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCourseScheduleII(input: unknown): AlgorithmStep[] {
  const { numCourses, prerequisites } = input as { numCourses: number; prerequisites: number[][] };
  const steps: AlgorithmStep[] = [];

  // Build adjacency list
  const adj: Map<number, number[]> = new Map();
  for (let i = 0; i < numCourses; i++) adj.set(i, []);
  for (const [course, prereq] of prerequisites) {
    adj.get(course)!.push(prereq);
  }

  function buildGraphState(
    highlights: number[] = [],
    secondary: number[] = [],
    visitedEdges: [number, number][] = []
  ) {
    const nodes = [];
    for (let i = 0; i < numCourses; i++) {
      nodes.push({ id: i, label: `${i}` });
    }
    const edges: { from: number; to: number }[] = [];
    for (const [course, prereq] of prerequisites) {
      edges.push({ from: prereq, to: course });
    }
    return {
      graph: { nodes, edges },
      graphHighlights: highlights,
      graphSecondary: secondary,
      graphVisitedEdges: visitedEdges,
      graphDirected: true,
    };
  }

  steps.push({
    state: {
      ...buildGraphState(),
      result: [],
    },
    highlights: [],
    message: `Find a valid course ordering for ${numCourses} courses using topological sort (DFS).`,
    codeLine: 1,
  } as AlgorithmStep);

  // DFS-based topological sort
  // 0 = unvisited, 1 = in current path, 2 = completed
  const visited = new Array(numCourses).fill(0);
  const order: number[] = [];
  const visitedEdges: [number, number][] = [];
  let hasCycle = false;

  function dfs(course: number): boolean {
    if (visited[course] === 1) {
      hasCycle = true;

      steps.push({
        state: {
          ...buildGraphState([course], [], visitedEdges),
          result: order.map(o => `${o}`),
        },
        highlights: [],
        message: `Cycle detected at course ${course}! No valid ordering exists.`,
        codeLine: 7,
        action: 'found',
      } as AlgorithmStep);

      return false;
    }
    if (visited[course] === 2) return true;

    visited[course] = 1;

    steps.push({
      state: {
        ...buildGraphState([course], [], visitedEdges),
        result: order.map(o => `${o}`),
      },
      highlights: [],
      message: `Visit course ${course}. Mark as "in-path". Check prerequisites: [${adj.get(course)!.join(', ')}]`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    for (const prereq of adj.get(course)!) {
      visitedEdges.push([course, prereq]);

      steps.push({
        state: {
          ...buildGraphState([course], [prereq], visitedEdges),
          result: order.map(o => `${o}`),
        },
        highlights: [],
        message: `Course ${course} depends on course ${prereq}. Explore prerequisite ${prereq} first.`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);

      if (!dfs(prereq)) return false;
    }

    visited[course] = 2;
    order.push(course);

    steps.push({
      state: {
        ...buildGraphState([], [course], visitedEdges),
        result: order.map(o => `${o}`),
      },
      highlights: [],
      message: `Course ${course} fully explored. Add to order. Current order: [${order.join(', ')}]`,
      codeLine: 10,
      action: 'push',
    } as AlgorithmStep);

    return true;
  }

  for (let i = 0; i < numCourses; i++) {
    if (visited[i] === 0) {
      if (!dfs(i)) break;
    }
  }

  steps.push({
    state: {
      ...buildGraphState(),
      result: hasCycle ? 'No valid ordering (cycle)' : order.map(o => `${o}`),
    },
    highlights: [],
    message: hasCycle
      ? `Done! Cycle detected. Return empty array [].`
      : `Done! Valid course order: [${order.join(', ')}]`,
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runCourseScheduleIIKahns(input: unknown): AlgorithmStep[] {
  const { numCourses, prerequisites } = input as { numCourses: number; prerequisites: number[][] };
  const steps: AlgorithmStep[] = [];

  // Build adjacency list (prereq -> course) and indegrees
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    indegree[course]++;
  }

  function buildGraphState(
    highlights: number[] = [],
    secondary: number[] = [],
    visitedEdges: [number, number][] = []
  ) {
    const nodes = [];
    for (let i = 0; i < numCourses; i++) {
      nodes.push({ id: i, label: `${i}` });
    }
    const edges: { from: number; to: number }[] = [];
    for (const [course, prereq] of prerequisites) {
      edges.push({ from: prereq, to: course });
    }
    return {
      graph: { nodes, edges },
      graphHighlights: highlights,
      graphSecondary: secondary,
      graphVisitedEdges: visitedEdges,
      graphDirected: true,
    };
  }

  function indegreeMap() {
    return Object.fromEntries(
      Array.from({ length: numCourses }, (_, i) => [`Course ${i}`, `indegree=${indegree[i]}`])
    );
  }

  steps.push({
    state: {
      ...buildGraphState(),
      result: [],
    },
    highlights: [],
    message: `Kahn's algorithm builds the order directly: take any course with indegree 0, append it to the order, and unlock its dependents. BFS order = valid topological order.`,
    codeLine: 1,
  } as AlgorithmStep);

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: indegreeMap(),
      result: [],
    },
    highlights: [],
    message: `Indegrees: [${indegree.join(', ')}]. A course's indegree = how many prerequisites it still waits on.`,
    codeLine: 6,
  } as AlgorithmStep);

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  steps.push({
    state: {
      ...buildGraphState([...queue]),
      hashMap: indegreeMap(),
      queue: [...queue],
      result: [],
    },
    highlights: [],
    message: queue.length > 0
      ? `Seed the queue with prerequisite-free courses: [${queue.join(', ')}]. They can safely come first in the order.`
      : `No course has indegree 0 — a cycle is already guaranteed.`,
    codeLine: 8,
    action: 'push',
  } as AlgorithmStep);

  const visitedEdges: [number, number][] = [];
  const order: number[] = [];

  while (queue.length > 0) {
    const course = queue.shift()!;
    order.push(course);

    steps.push({
      state: {
        ...buildGraphState([course], [], visitedEdges),
        hashMap: indegreeMap(),
        queue: [...queue],
        result: order.map(o => `${o}`),
      },
      highlights: [],
      message: `Dequeue course ${course} and append it to the order: [${order.join(', ')}]. All its prerequisites are already placed.`,
      codeLine: 12,
      action: 'pop',
    } as AlgorithmStep);

    for (const next of adj[course]) {
      indegree[next]--;
      visitedEdges.push([course, next]);

      if (indegree[next] === 0) {
        queue.push(next);

        steps.push({
          state: {
            ...buildGraphState([course], [next], visitedEdges),
            hashMap: indegreeMap(),
            queue: [...queue],
            result: order.map(o => `${o}`),
          },
          highlights: [],
          message: `Course ${next} has no pending prerequisites left — enqueue it for placement.`,
          codeLine: 16,
          action: 'push',
        } as AlgorithmStep);
      } else {
        steps.push({
          state: {
            ...buildGraphState([course], [next], visitedEdges),
            hashMap: indegreeMap(),
            queue: [...queue],
            result: order.map(o => `${o}`),
          },
          highlights: [],
          message: `Course ${next} still waits on ${indegree[next]} prerequisite(s) — leave it for later.`,
          codeLine: 14,
          action: 'compare',
        } as AlgorithmStep);
      }
    }
  }

  const valid = order.length === numCourses;

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: indegreeMap(),
      result: valid ? order.map(o => `${o}`) : 'No valid ordering (cycle)',
    },
    highlights: [],
    message: valid
      ? `Done! All ${numCourses} courses placed. Valid order: [${order.join(', ')}]`
      : `Done! Only ${order.length}/${numCourses} courses could be placed — the rest form a cycle. Return [].`,
    codeLine: 17,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const courseScheduleII: Algorithm = {
  id: 'course-schedule-ii',
  name: 'Course Schedule II',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V+E)',
  pattern: 'Topological Sort — DFS postorder gives reverse topo order',
  description:
    'There are numCourses courses labeled from 0 to numCourses-1 with prerequisites. Return the ordering of courses you should take to finish all courses. If impossible (cycle), return an empty array. Uses DFS-based topological sort.',
  problemUrl: 'https://leetcode.com/problems/course-schedule-ii/',
  code: {
    python: `def findOrder(numCourses, prerequisites):
    adj = {i: [] for i in range(numCourses)}
    for crs, pre in prerequisites:
        adj[crs].append(pre)

    # 0=unvisited, 1=in-path, 2=done
    visited = [0] * numCourses
    order = []

    def dfs(crs):
        if visited[crs] == 1:
            return False  # cycle
        if visited[crs] == 2:
            return True
        visited[crs] = 1
        for pre in adj[crs]:
            if not dfs(pre):
                return False
        visited[crs] = 2
        order.append(crs)
        return True

    for c in range(numCourses):
        if not dfs(c):
            return []
    return order`,
    javascript: `function findOrder(numCourses, prerequisites) {
    const adj = new Map();
    for (let i = 0; i < numCourses; i++) adj.set(i, []);
    for (const [crs, pre] of prerequisites)
        adj.get(crs).push(pre);

    // 0=unvisited, 1=in-path, 2=done
    const visited = new Array(numCourses).fill(0);
    const order = [];

    function dfs(crs) {
        if (visited[crs] === 1) return false;
        if (visited[crs] === 2) return true;
        visited[crs] = 1;
        for (const pre of adj.get(crs)) {
            if (!dfs(pre)) return false;
        }
        visited[crs] = 2;
        order.push(crs);
        return true;
    }

    for (let c = 0; c < numCourses; c++)
        if (!dfs(c)) return [];
    return order;
}`,
    java: `public int[] findOrder(int numCourses, int[][] prerequisites) {
    Map<Integer, List<Integer>> adj = new HashMap<>();
    for (int i = 0; i < numCourses; i++) {
        adj.put(i, new ArrayList<>());
    }
    for (int[] pre : prerequisites) {
        adj.get(pre[0]).add(pre[1]);
    }

    int[] visited = new int[numCourses]; // 0=unvisited, 1=in-path, 2=done
    List<Integer> order = new ArrayList<>();
    for (int c = 0; c < numCourses; c++) {
        if (!dfs(c, adj, visited, order)) return new int[0];
    }
    return order.stream().mapToInt(i -> i).toArray();
}

private boolean dfs(int crs, Map<Integer, List<Integer>> adj, int[] visited, List<Integer> order) {
    if (visited[crs] == 1) return false; // cycle
    if (visited[crs] == 2) return true;
    visited[crs] = 1;
    for (int pre : adj.get(crs)) {
        if (!dfs(pre, adj, visited, order)) return false;
    }
    visited[crs] = 2;
    order.add(crs);
    return true;
}`,
  },
  defaultInput: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] },
  run: runCourseScheduleII,
  optimalApproachName: 'DFS Postorder',
  approaches: [
    {
      id: 'kahns-bfs-indegree',
      name: "Kahn's BFS (Indegree)",
      timeComplexity: 'O(V+E)',
      spaceComplexity: 'O(V+E)',
      description:
        'Builds the ordering front-to-back rather than by DFS postorder: repeatedly take a course with indegree 0, append it, and decrement its dependents — if fewer than numCourses get placed, a cycle exists.',
      code: {
        python: `from collections import deque

def findOrder(numCourses, prerequisites):
    adj = {i: [] for i in range(numCourses)}
    indegree = [0] * numCourses
    for crs, pre in prerequisites:
        adj[pre].append(crs)
        indegree[crs] += 1

    queue = deque(i for i in range(numCourses) if indegree[i] == 0)
    order = []
    while queue:
        crs = queue.popleft()
        order.append(crs)
        for nei in adj[crs]:
            indegree[nei] -= 1
            if indegree[nei] == 0:
                queue.append(nei)
    return order if len(order) == numCourses else []`,
        javascript: `function findOrder(numCourses, prerequisites) {
    const adj = Array.from({length: numCourses}, () => []);
    const indegree = new Array(numCourses).fill(0);
    for (const [crs, pre] of prerequisites) {
        adj[pre].push(crs);
        indegree[crs]++;
    }

    const queue = [];
    for (let i = 0; i < numCourses; i++)
        if (indegree[i] === 0) queue.push(i);

    const order = [];
    while (queue.length > 0) {
        const crs = queue.shift();
        order.push(crs);
        for (const nei of adj[crs]) {
            indegree[nei]--;
            if (indegree[nei] === 0) queue.push(nei);
        }
    }
    return order.length === numCourses ? order : [];
}`,
        java: `public int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    int[] indegree = new int[numCourses];
    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);
        indegree[pre[0]]++;
    }

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (indegree[i] == 0) queue.add(i);
    }

    int[] order = new int[numCourses];
    int idx = 0;
    while (!queue.isEmpty()) {
        int crs = queue.poll();
        order[idx++] = crs;
        for (int nei : adj.get(crs)) {
            indegree[nei]--;
            if (indegree[nei] == 0) queue.add(nei);
        }
    }
    return idx == numCourses ? order : new int[0];
}`,
      },
      run: runCourseScheduleIIKahns,
      lineExplanations: {
        python: {
          1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Define function with course count and prereqs',
          4: 'Adjacency list: prereq -> courses it unlocks',
          5: 'Indegree = pending prerequisites per course',
          6: 'Process each prerequisite pair',
          7: 'Prereq unlocks this course when done',
          8: 'One more prerequisite pending for this course',
          10: 'Start with all courses that need no prereqs',
          11: 'The topological order we are building',
          12: 'Process while some course is ready',
          13: 'Take the next ready course',
          14: 'Its prereqs are already placed — append it',
          15: 'Update every course this one unlocks',
          16: 'It waits on one fewer prerequisite now',
          17: 'All its prerequisites placed?',
          18: 'It becomes ready — enqueue it',
          19: 'Full order if no cycle, else empty list',
        },
        javascript: {
          1: 'Define function with course count and prereqs',
          2: 'Adjacency list: prereq -> courses it unlocks',
          3: 'Indegree = pending prerequisites per course',
          4: 'Process each prerequisite pair',
          5: 'Prereq unlocks this course when done',
          6: 'One more prerequisite pending for this course',
          9: 'Queue of courses ready to place',
          10: 'Scan all courses',
          11: 'Seed with courses that need no prereqs',
          13: 'The topological order we are building',
          14: 'Process while some course is ready',
          15: 'Take the next ready course',
          16: 'Its prereqs are already placed — append it',
          17: 'Update every course this one unlocks',
          18: 'It waits on one fewer prerequisite now',
          19: 'If all prereqs placed, it becomes ready',
          22: 'Full order if no cycle, else empty array',
        },
        java: {
          1: 'Define method returning course order array',
          2: 'Adjacency list: prereq -> courses it unlocks',
          3: 'Add an empty list per course',
          4: 'Indegree = pending prerequisites per course',
          5: 'Process each prerequisite pair',
          6: 'Prereq unlocks this course when done',
          7: 'One more prerequisite pending for this course',
          10: 'Queue of courses ready to place',
          11: 'Scan all courses',
          12: 'Seed with courses that need no prereqs',
          15: 'Array holding the topological order',
          16: 'Next free slot in the order array',
          17: 'Process while some course is ready',
          18: 'Take the next ready course',
          19: 'Its prereqs are already placed — append it',
          20: 'Update every course this one unlocks',
          21: 'It waits on one fewer prerequisite now',
          22: 'If all prereqs placed, it becomes ready',
          25: 'Full order if no cycle, else empty array',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function with course count and prereqs',
      2: 'Build adjacency list for each course',
      3: 'Iterate over each prerequisite pair',
      4: 'Add prereq as dependency of the course',
      6: 'Track visit state: 0=unvisited, 1=in-path, 2=done',
      7: 'Initialize all courses as unvisited',
      8: 'Store the topological order result',
      10: 'Define DFS helper for topological sort',
      11: 'If node is in current path, cycle exists',
      12: 'Return False to signal cycle detected',
      13: 'If already fully processed, skip it',
      14: 'Return True since no cycle from here',
      15: 'Mark course as part of current DFS path',
      16: 'Recurse into each prerequisite',
      17: 'If any prereq has a cycle, propagate failure',
      18: 'Return False to propagate cycle detection',
      19: 'Mark course as fully processed',
      20: 'Add course to topological order',
      21: 'Return True meaning no cycle found',
      23: 'Try DFS from each course',
      24: 'If cycle found, return empty array',
      25: 'Return empty list since ordering impossible',
      26: 'Return valid topological order',
    },
    javascript: {
      1: 'Define function with course count and prereqs',
      2: 'Create adjacency list map',
      3: 'Initialize empty neighbor list per course',
      4: 'Iterate prerequisite pairs',
      5: 'Add prereq as neighbor of the course',
      7: 'Track visit state: 0=unvisited, 1=in-path, 2=done',
      8: 'Initialize all courses as unvisited',
      9: 'Store the topological order result',
      11: 'Define DFS helper function',
      12: 'If in current path, cycle detected',
      13: 'If already done, skip and return true',
      14: 'Mark course as in current DFS path',
      15: 'Recurse into each prerequisite',
      16: 'Propagate cycle detection upward',
      18: 'Mark course as fully processed',
      19: 'Add course to topological order',
      20: 'Return true, no cycle from this course',
      23: 'Try DFS from each unvisited course',
      24: 'If cycle found, return empty array',
      25: 'Return the valid topological order',
    },
    java: {
      1: 'Define method returning course order array',
      2: 'Create adjacency list using HashMap',
      3: 'Initialize empty list for each course',
      4: 'Add empty ArrayList for each course node',
      6: 'Iterate over prerequisite pairs',
      7: 'Add prereq dependency to adjacency list',
      10: 'Visit state array: 0=unvisited, 1=in-path, 2=done',
      11: 'Store topological order in a list',
      12: 'Try DFS from each course',
      13: 'If cycle found, return empty array',
      15: 'Convert list to int array and return',
      18: 'Define private DFS helper method',
      19: 'If in current path, cycle found',
      20: 'If already processed, skip',
      21: 'Mark course as in current DFS path',
      22: 'Recurse into each prerequisite',
      23: 'Propagate cycle detection upward',
      25: 'Mark course as fully processed',
      26: 'Add course to topological order',
      27: 'Return true, no cycle from this node',
    },
  },
};
