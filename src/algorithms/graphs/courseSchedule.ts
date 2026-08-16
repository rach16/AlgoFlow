import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCourseSchedule(input: unknown): AlgorithmStep[] {
  const { numCourses, prerequisites } = input as { numCourses: number; prerequisites: number[][] };
  const steps: AlgorithmStep[] = [];

  // Build adjacency list
  const adj: Map<number, number[]> = new Map();
  for (let i = 0; i < numCourses; i++) adj.set(i, []);
  for (const [course, prereq] of prerequisites) {
    adj.get(prereq)!.push(course);
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
      result: 'Checking if all courses can be finished...',
    },
    highlights: [],
    message: `Detect cycle in directed graph with ${numCourses} courses and ${prerequisites.length} prerequisites using DFS.`,
    codeLine: 1,
  } as AlgorithmStep);

  // DFS cycle detection
  // 0 = unvisited, 1 = in current path, 2 = completed
  const visited = new Array(numCourses).fill(0);
  const visitedEdges: [number, number][] = [];
  let hasCycle = false;

  function dfs(course: number): boolean {
    if (visited[course] === 1) {
      // Cycle detected
      hasCycle = true;

      steps.push({
        state: {
          ...buildGraphState([course], [], visitedEdges),
          hashMap: Object.fromEntries(
            Array.from({ length: numCourses }, (_, i) => [
              `Course ${i}`,
              visited[i] === 0 ? 'unvisited' : visited[i] === 1 ? 'in-path' : 'done',
            ])
          ),
          result: 'CYCLE DETECTED!',
        },
        highlights: [],
        message: `Cycle detected! Course ${course} is already in the current DFS path.`,
        codeLine: 7,
        action: 'found',
      } as AlgorithmStep);

      return false;
    }
    if (visited[course] === 2) return true;

    visited[course] = 1; // Mark as in current path

    steps.push({
      state: {
        ...buildGraphState([course], [], visitedEdges),
        hashMap: Object.fromEntries(
          Array.from({ length: numCourses }, (_, i) => [
            `Course ${i}`,
            visited[i] === 0 ? 'unvisited' : visited[i] === 1 ? 'in-path' : 'done',
          ])
        ),
        result: 'Checking...',
      },
      highlights: [],
      message: `Visit course ${course}. Mark as "in-path". Check prerequisites: [${adj.get(course)!.join(', ')}]`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    for (const next of adj.get(course)!) {
      visitedEdges.push([course, next]);

      steps.push({
        state: {
          ...buildGraphState([course], [next], visitedEdges),
          hashMap: Object.fromEntries(
            Array.from({ length: numCourses }, (_, i) => [
              `Course ${i}`,
              visited[i] === 0 ? 'unvisited' : visited[i] === 1 ? 'in-path' : 'done',
            ])
          ),
          result: 'Checking...',
        },
        highlights: [],
        message: `Check edge: course ${course} -> course ${next}`,
        codeLine: 8,
        action: 'compare',
      } as AlgorithmStep);

      if (!dfs(next)) return false;
    }

    visited[course] = 2; // Mark as completed

    steps.push({
      state: {
        ...buildGraphState([], [course], visitedEdges),
        hashMap: Object.fromEntries(
          Array.from({ length: numCourses }, (_, i) => [
            `Course ${i}`,
            visited[i] === 0 ? 'unvisited' : visited[i] === 1 ? 'in-path' : 'done',
          ])
        ),
        result: 'Checking...',
      },
      highlights: [],
      message: `Course ${course} fully explored. Mark as "done".`,
      codeLine: 10,
      action: 'visit',
    } as AlgorithmStep);

    return true;
  }

  for (let i = 0; i < numCourses; i++) {
    if (visited[i] === 0) {
      if (!dfs(i)) break;
    }
  }

  const canFinish = !hasCycle;

  steps.push({
    state: {
      ...buildGraphState(),
      result: canFinish ? 'true - Can finish all courses!' : 'false - Cannot finish (cycle exists)',
    },
    highlights: [],
    message: canFinish
      ? `Done! No cycles detected. All ${numCourses} courses can be completed. Return true.`
      : `Done! Cycle detected in the prerequisite graph. Cannot finish all courses. Return false.`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runCourseScheduleKahns(input: unknown): AlgorithmStep[] {
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
      result: 'Checking if all courses can be finished...',
    },
    highlights: [],
    message: `Kahn's algorithm: count incoming prerequisite edges (indegree) per course. Courses with indegree 0 can be taken now — if we can "take" all ${numCourses}, there is no cycle.`,
    codeLine: 1,
  } as AlgorithmStep);

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: indegreeMap(),
      result: 'Indegrees computed',
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
      result: 'Queue seeded',
    },
    highlights: [],
    message: queue.length > 0
      ? `Seed the queue with courses that have no prerequisites: [${queue.join(', ')}].`
      : `No course has indegree 0 — every course waits on another, which already implies a cycle.`,
    codeLine: 8,
    action: 'push',
  } as AlgorithmStep);

  const visitedEdges: [number, number][] = [];
  let finished = 0;

  while (queue.length > 0) {
    const course = queue.shift()!;
    finished++;

    steps.push({
      state: {
        ...buildGraphState([course], [], visitedEdges),
        hashMap: indegreeMap(),
        queue: [...queue],
        result: `Finished: ${finished}/${numCourses}`,
      },
      highlights: [],
      message: `Take course ${course} (all its prerequisites are done). Finished ${finished}/${numCourses}.`,
      codeLine: 11,
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
            result: `Finished: ${finished}/${numCourses}`,
          },
          highlights: [],
          message: `Course ${next} loses its last pending prerequisite (indegree hits 0) — enqueue it.`,
          codeLine: 16,
          action: 'push',
        } as AlgorithmStep);
      } else {
        steps.push({
          state: {
            ...buildGraphState([course], [next], visitedEdges),
            hashMap: indegreeMap(),
            queue: [...queue],
            result: `Finished: ${finished}/${numCourses}`,
          },
          highlights: [],
          message: `Course ${next} now waits on ${indegree[next]} prerequisite(s) — not ready yet.`,
          codeLine: 14,
          action: 'compare',
        } as AlgorithmStep);
      }
    }
  }

  const canFinish = finished === numCourses;

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: indegreeMap(),
      result: canFinish ? 'true - Can finish all courses!' : 'false - Cannot finish (cycle exists)',
    },
    highlights: [],
    message: canFinish
      ? `Done! All ${numCourses} courses were taken, so the prerequisite graph has no cycle. Return true.`
      : `Done! Only ${finished}/${numCourses} courses could be taken — the rest are stuck in a cycle where each waits on another. Return false.`,
    codeLine: 17,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const courseSchedule: Algorithm = {
  id: 'course-schedule',
  name: 'Course Schedule',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V+E)',
  pattern: 'Topological Sort — DFS cycle detection on directed graph',
  description:
    'There are numCourses courses labeled from 0 to numCourses-1. Some have prerequisites. Determine if you can finish all courses (i.e., no cycles in the prerequisite graph). Uses DFS-based cycle detection.',
  problemUrl: 'https://leetcode.com/problems/course-schedule/',
  code: {
    python: `def canFinish(numCourses, prerequisites):
    adj = {i: [] for i in range(numCourses)}
    for crs, pre in prerequisites:
        adj[pre].append(crs)

    # 0=unvisited, 1=in-path, 2=done
    visited = [0] * numCourses

    def dfs(crs):
        if visited[crs] == 1:
            return False  # cycle
        if visited[crs] == 2:
            return True
        visited[crs] = 1
        for nei in adj[crs]:
            if not dfs(nei):
                return False
        visited[crs] = 2
        return True

    for c in range(numCourses):
        if not dfs(c):
            return False
    return True`,
    javascript: `function canFinish(numCourses, prerequisites) {
    const adj = new Map();
    for (let i = 0; i < numCourses; i++) adj.set(i, []);
    for (const [crs, pre] of prerequisites)
        adj.get(pre).push(crs);

    // 0=unvisited, 1=in-path, 2=done
    const visited = new Array(numCourses).fill(0);

    function dfs(crs) {
        if (visited[crs] === 1) return false;
        if (visited[crs] === 2) return true;
        visited[crs] = 1;
        for (const nei of adj.get(crs)) {
            if (!dfs(nei)) return false;
        }
        visited[crs] = 2;
        return true;
    }

    for (let c = 0; c < numCourses; c++)
        if (!dfs(c)) return false;
    return true;
}`,
    java: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    Map<Integer, List<Integer>> adj = new HashMap<>();
    for (int i = 0; i < numCourses; i++) {
        adj.put(i, new ArrayList<>());
    }
    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);
    }

    int[] visited = new int[numCourses]; // 0=unvisited, 1=in-path, 2=done
    for (int c = 0; c < numCourses; c++) {
        if (!dfs(c, adj, visited)) return false;
    }
    return true;
}

private boolean dfs(int crs, Map<Integer, List<Integer>> adj, int[] visited) {
    if (visited[crs] == 1) return false; // cycle
    if (visited[crs] == 2) return true;
    visited[crs] = 1;
    for (int nei : adj.get(crs)) {
        if (!dfs(nei, adj, visited)) return false;
    }
    visited[crs] = 2;
    return true;
}`,
  },
  defaultInput: { numCourses: 4, prerequisites: [[1, 0], [2, 1], [3, 2]] },
  run: runCourseSchedule,
  optimalApproachName: 'DFS Cycle Detection',
  approaches: [
    {
      id: 'kahns-bfs-indegree',
      name: "Kahn's BFS (Indegree)",
      timeComplexity: 'O(V+E)',
      spaceComplexity: 'O(V+E)',
      description:
        "Instead of hunting for cycles with DFS coloring, Kahn's algorithm repeatedly 'takes' courses whose indegree is 0 — if a cycle exists, its courses never reach indegree 0 and the finished count falls short.",
      code: {
        python: `def canFinish(numCourses, prerequisites):
    adj = {i: [] for i in range(numCourses)}
    indegree = [0] * numCourses
    for crs, pre in prerequisites:
        adj[pre].append(crs)
        indegree[crs] += 1

    queue = deque(i for i in range(numCourses) if indegree[i] == 0)
    finished = 0
    while queue:
        crs = queue.popleft()
        finished += 1
        for nei in adj[crs]:
            indegree[nei] -= 1
            if indegree[nei] == 0:
                queue.append(nei)
    return finished == numCourses`,
        javascript: `function canFinish(numCourses, prerequisites) {
    const adj = Array.from({length: numCourses}, () => []);
    const indegree = new Array(numCourses).fill(0);
    for (const [crs, pre] of prerequisites) {
        adj[pre].push(crs);
        indegree[crs]++;
    }

    const queue = [];
    for (let i = 0; i < numCourses; i++)
        if (indegree[i] === 0) queue.push(i);

    let finished = 0;
    while (queue.length > 0) {
        const crs = queue.shift();
        finished++;
        for (const nei of adj[crs]) {
            indegree[nei]--;
            if (indegree[nei] === 0) queue.push(nei);
        }
    }
    return finished === numCourses;
}`,
        java: `public boolean canFinish(int numCourses, int[][] prerequisites) {
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

    int finished = 0;
    while (!queue.isEmpty()) {
        int crs = queue.poll();
        finished++;
        for (int nei : adj.get(crs)) {
            indegree[nei]--;
            if (indegree[nei] == 0) queue.add(nei);
        }
    }
    return finished == numCourses;
}`,
      },
      run: runCourseScheduleKahns,
      lineExplanations: {
        python: {
          1: 'Define function with course count and prereqs',
          2: 'Adjacency list: prereq -> courses it unlocks',
          3: 'Indegree = pending prerequisites per course',
          4: 'Process each prerequisite pair',
          5: 'Prereq unlocks this course when done',
          6: 'One more prerequisite pending for this course',
          8: 'Start with all courses that need no prereqs',
          9: 'Count how many courses we manage to take',
          10: 'Process while some course is ready',
          11: 'Take the next ready course',
          12: 'One more course finished',
          13: 'Update every course this one unlocks',
          14: 'It waits on one fewer prerequisite now',
          15: 'All its prerequisites done?',
          16: 'It becomes ready — enqueue it',
          17: 'No cycle iff every course got taken',
        },
        javascript: {
          1: 'Define function with course count and prereqs',
          2: 'Adjacency list: prereq -> courses it unlocks',
          3: 'Indegree = pending prerequisites per course',
          4: 'Process each prerequisite pair',
          5: 'Prereq unlocks this course when done',
          6: 'One more prerequisite pending for this course',
          9: 'Queue of courses ready to take',
          10: 'Scan all courses',
          11: 'Seed with courses that need no prereqs',
          13: 'Count how many courses we manage to take',
          14: 'Process while some course is ready',
          15: 'Take the next ready course',
          16: 'One more course finished',
          17: 'Update every course this one unlocks',
          18: 'It waits on one fewer prerequisite now',
          19: 'If all prereqs done, it becomes ready',
          22: 'No cycle iff every course got taken',
        },
        java: {
          1: 'Define method returning boolean for feasibility',
          2: 'Adjacency list: prereq -> courses it unlocks',
          3: 'Add an empty list per course',
          4: 'Indegree = pending prerequisites per course',
          5: 'Process each prerequisite pair',
          6: 'Prereq unlocks this course when done',
          7: 'One more prerequisite pending for this course',
          10: 'Queue of courses ready to take',
          11: 'Scan all courses',
          12: 'Seed with courses that need no prereqs',
          15: 'Count how many courses we manage to take',
          16: 'Process while some course is ready',
          17: 'Take the next ready course',
          18: 'One more course finished',
          19: 'Update every course this one unlocks',
          20: 'It waits on one fewer prerequisite now',
          21: 'If all prereqs done, it becomes ready',
          24: 'No cycle iff every course got taken',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function with course count and prereqs',
      2: 'Build adjacency list for each course',
      3: 'Iterate over prerequisite pairs',
      4: 'Add course as neighbor of its prereq',
      6: 'Track visit state: 0=unvisited, 1=in-path, 2=done',
      7: 'Initialize all courses as unvisited',
      9: 'Define DFS helper for cycle detection',
      10: 'If node is in current path, cycle exists',
      11: 'Return False to signal cycle detected',
      12: 'If already processed, no cycle from here',
      13: 'Return True since already verified',
      14: 'Mark course as part of current DFS path',
      15: 'Recurse into each neighbor',
      16: 'If any neighbor has a cycle, propagate',
      17: 'Return False to propagate cycle',
      18: 'Mark course as fully processed',
      19: 'Return True meaning no cycle found',
      21: 'Try DFS from each course',
      22: 'If cycle found, return False',
      23: 'Return False since courses cant be finished',
      24: 'All courses can be finished',
    },
    javascript: {
      1: 'Define function with course count and prereqs',
      2: 'Create adjacency list map',
      3: 'Initialize empty neighbor list per course',
      4: 'Iterate prerequisite pairs',
      5: 'Add course as neighbor of its prereq',
      7: 'Track visit state: 0=unvisited, 1=in-path, 2=done',
      8: 'Initialize all courses as unvisited',
      10: 'Define DFS helper function',
      11: 'If in current path, cycle detected',
      12: 'If already done, skip and return true',
      13: 'Mark course as in current DFS path',
      14: 'Recurse into each neighbor',
      15: 'Propagate cycle detection upward',
      17: 'Mark course as fully processed',
      18: 'Return true, no cycle from this course',
      21: 'Try DFS from each course',
      22: 'If cycle found, return false',
      23: 'All courses can be finished',
    },
    java: {
      1: 'Define method returning boolean for feasibility',
      2: 'Create adjacency list using HashMap',
      3: 'Initialize empty list for each course',
      4: 'Add empty ArrayList for each course node',
      6: 'Iterate over prerequisite pairs',
      7: 'Add course as neighbor of its prereq',
      10: 'Visit state array: 0=unvisited, 1=in-path, 2=done',
      11: 'Try DFS from each course',
      12: 'If cycle found, return false immediately',
      14: 'All courses can be finished',
      17: 'Define private DFS helper method',
      18: 'If in current path, cycle found',
      19: 'If already processed, skip',
      20: 'Mark course as in current DFS path',
      21: 'Recurse into each neighbor',
      22: 'Propagate cycle detection upward',
      24: 'Mark course as fully processed',
      25: 'Return true, no cycle from this node',
    },
  },
};
