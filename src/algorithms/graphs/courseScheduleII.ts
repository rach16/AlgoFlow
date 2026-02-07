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
    java: `// Java implementation coming soon`,
  },
  defaultInput: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] },
  run: runCourseScheduleII,
};
