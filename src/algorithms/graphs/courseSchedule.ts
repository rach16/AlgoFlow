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
};
