import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CourseScheduleIVInput {
  numCourses: number;
  prerequisites: number[][];
  queries: number[][];
}

function buildCSIVGraph(
  numCourses: number,
  prerequisites: number[][],
  highlights: number[] = [],
  secondary: number[] = [],
  visitedEdges: [number, number][] = []
) {
  const nodes = Array.from({ length: numCourses }, (_, i) => ({ id: i, label: `${i}` }));
  const edges = prerequisites.map(([a, b]) => ({ from: a, to: b }));
  return {
    graph: { nodes, edges },
    graphHighlights: highlights,
    graphSecondary: secondary,
    graphVisitedEdges: visitedEdges,
    graphDirected: true,
  };
}

// Closure table rendered as a labelled matrix: row 0 / column 0 are headers,
// so cell (i, j) of `reach` lives at matrix[i + 1][j + 1].
function closureMatrix(reach: boolean[][], numCourses: number): string[][] {
  const header = ['↓a\\b→', ...Array.from({ length: numCourses }, (_, j) => `${j}`)];
  const rows = reach.map((row, i) => [`${i}`, ...row.map(v => (v ? 'T' : '·'))]);
  return [header, ...rows];
}

function runCourseScheduleIV(input: unknown): AlgorithmStep[] {
  const { numCourses, prerequisites, queries } = input as CourseScheduleIVInput;
  const steps: AlgorithmStep[] = [];

  const reach: boolean[][] = Array.from({ length: numCourses }, () =>
    new Array(numCourses).fill(false)
  );

  steps.push({
    state: {
      ...buildCSIVGraph(numCourses, prerequisites),
      matrix: closureMatrix(reach, numCourses),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Building the transitive closure...',
    },
    highlights: [],
    message: `${numCourses} courses, ${prerequisites.length} direct prerequisites, ${queries.length} queries. Floyd-Warshall fills a reach[a][b] table so every query is answered by one table lookup.`,
    codeLine: 1,
  } as AlgorithmStep);

  const seededEdges: [number, number][] = [];
  for (const [a, b] of prerequisites) {
    reach[a][b] = true;
    seededEdges.push([a, b]);

    steps.push({
      state: {
        ...buildCSIVGraph(numCourses, prerequisites, [a], [b], seededEdges.map(e => [...e] as [number, number])),
        matrix: closureMatrix(reach, numCourses),
        matrixHighlights: [[a + 1, b + 1]],
        matrixSecondary: [],
        result: 'Seeding direct prerequisites',
      },
      highlights: [],
      message: `Direct edge ${a} → ${b}: course ${a} must come before ${b}, so reach[${a}][${b}] = T.`,
      codeLine: 4,
      action: 'insert',
    } as AlgorithmStep);
  }

  const allEdges: [number, number][] = prerequisites.map(([a, b]) => [a, b]);

  for (let k = 0; k < numCourses; k++) {
    const newlyTrue: [number, number][] = [];
    for (let i = 0; i < numCourses; i++) {
      for (let j = 0; j < numCourses; j++) {
        if (reach[i][k] && reach[k][j] && !reach[i][j]) {
          reach[i][j] = true;
          newlyTrue.push([i, j]);

          steps.push({
            state: {
              ...buildCSIVGraph(numCourses, prerequisites, [i, j], [k], allEdges),
              matrix: closureMatrix(reach, numCourses),
              matrixHighlights: [[i + 1, j + 1]],
              matrixSecondary: [[i + 1, k + 1], [k + 1, j + 1]],
              result: `New indirect prerequisite: ${i} → ${j}`,
            },
            highlights: [],
            message: `${i} reaches ${k} and ${k} reaches ${j}, so ${i} reaches ${j} too — set reach[${i}][${j}] = T. Course ${k} is the bridge.`,
            codeLine: 10,
            action: 'insert',
          } as AlgorithmStep);
        } else if (reach[i][k] && reach[k][j]) {
          reach[i][j] = true;
        }
      }
    }

    steps.push({
      state: {
        ...buildCSIVGraph(numCourses, prerequisites, [k], [], allEdges),
        matrix: closureMatrix(reach, numCourses),
        matrixHighlights: [],
        matrixSecondary: [],
        result: `Pivot k = ${k} done`,
      },
      highlights: [],
      message:
        newlyTrue.length > 0
          ? `Pivot k = ${k} finished: routing through course ${k} added ${newlyTrue.length} new reachable pair(s) — ${newlyTrue.map(([i, j]) => `${i}→${j}`).join(', ')}.`
          : `Pivot k = ${k} finished: nothing reaches ${k} and then continues onward, so the table is unchanged.`,
      codeLine: 6,
      action: 'visit',
    } as AlgorithmStep);
  }

  const answers: boolean[] = [];
  for (const [u, v] of queries) {
    const ans = reach[u][v];
    answers.push(ans);

    steps.push({
      state: {
        ...buildCSIVGraph(numCourses, prerequisites, [u], [v], allEdges),
        matrix: closureMatrix(reach, numCourses),
        matrixHighlights: [[u + 1, v + 1]],
        matrixSecondary: [],
        result: `Answers so far: [${answers.join(', ')}]`,
      },
      highlights: [],
      message: `Query (${u}, ${v}): read reach[${u}][${v}] straight out of the table → ${ans}. ${ans ? `Course ${u} is a prerequisite of ${v}.` : `No chain of prerequisites leads from ${u} to ${v}.`}`,
      codeLine: 12,
      action: ans ? 'found' : 'compare',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      ...buildCSIVGraph(numCourses, prerequisites, [], [], allEdges),
      matrix: closureMatrix(reach, numCourses),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `[${answers.join(', ')}]`,
    },
    highlights: [],
    message: `Done! The closure was built once in O(n³); each of the ${queries.length} queries then cost O(1). Answer: [${answers.join(', ')}].`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runCourseScheduleIVKahns(input: unknown): AlgorithmStep[] {
  const { numCourses, prerequisites, queries } = input as CourseScheduleIVInput;
  const steps: AlgorithmStep[] = [];

  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  const prereqs: Set<number>[] = Array.from({ length: numCourses }, () => new Set<number>());
  for (const [a, b] of prerequisites) {
    adj[a].push(b);
    indegree[b]++;
  }

  const allEdges: [number, number][] = prerequisites.map(([a, b]) => [a, b]);

  const prereqMap = () =>
    Object.fromEntries(
      Array.from({ length: numCourses }, (_, i) => [
        `Course ${i}`,
        prereqs[i].size === 0
          ? 'prereqs={} '
          : `prereqs={${[...prereqs[i]].sort((x, y) => x - y).join(',')}}`,
      ])
    );

  steps.push({
    state: {
      ...buildCSIVGraph(numCourses, prerequisites),
      hashMap: prereqMap(),
      result: 'Propagating prerequisite sets...',
    },
    highlights: [],
    message: `Kahn's variant: walk the graph in topological order and hand each course the union of its parents' prerequisite sets. No n³ table — just one pass.`,
    codeLine: 1,
  } as AlgorithmStep);

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  steps.push({
    state: {
      ...buildCSIVGraph(numCourses, prerequisites, [...queue]),
      hashMap: prereqMap(),
      queue: [...queue],
      result: 'Queue seeded',
    },
    highlights: [],
    message: `Indegrees: [${indegree.join(', ')}]. Seed the queue with the courses that have no prerequisites: [${queue.join(', ')}].`,
    codeLine: 9,
    action: 'push',
  } as AlgorithmStep);

  const visitedEdges: [number, number][] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;

    steps.push({
      state: {
        ...buildCSIVGraph(numCourses, prerequisites, [node], [], visitedEdges.map(e => [...e] as [number, number])),
        hashMap: prereqMap(),
        queue: [...queue],
        result: `Settled course ${node}`,
      },
      highlights: [],
      message: `Pop course ${node}. Its prerequisite set is final: {${[...prereqs[node]].sort((a, b) => a - b).join(',') || '∅'}}. Now push it down to everything it unlocks.`,
      codeLine: 11,
      action: 'pop',
    } as AlgorithmStep);

    for (const nxt of adj[node]) {
      prereqs[nxt].add(node);
      for (const p of prereqs[node]) prereqs[nxt].add(p);
      indegree[nxt]--;
      visitedEdges.push([node, nxt]);
      if (indegree[nxt] === 0) queue.push(nxt);

      steps.push({
        state: {
          ...buildCSIVGraph(numCourses, prerequisites, [node], [nxt], visitedEdges.map(e => [...e] as [number, number])),
          hashMap: prereqMap(),
          queue: [...queue],
          result: `Course ${nxt} inherits from ${node}`,
        },
        highlights: [],
        message: `Course ${nxt} inherits ${node} plus everything ${node} needed → prereqs[${nxt}] = {${[...prereqs[nxt]].sort((a, b) => a - b).join(',')}}. Indegree now ${indegree[nxt]}${indegree[nxt] === 0 ? ' — enqueue it.' : '.'}`,
        codeLine: 14,
        action: indegree[nxt] === 0 ? 'push' : 'insert',
      } as AlgorithmStep);
    }
  }

  const answers: boolean[] = [];
  for (const [u, v] of queries) {
    const ans = prereqs[v].has(u);
    answers.push(ans);

    steps.push({
      state: {
        ...buildCSIVGraph(numCourses, prerequisites, [u], [v], allEdges),
        hashMap: prereqMap(),
        result: `Answers so far: [${answers.join(', ')}]`,
      },
      highlights: [],
      message: `Query (${u}, ${v}): is ${u} in prereqs[${v}] = {${[...prereqs[v]].sort((a, b) => a - b).join(',') || '∅'}}? → ${ans}.`,
      codeLine: 19,
      action: ans ? 'found' : 'compare',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      ...buildCSIVGraph(numCourses, prerequisites, [], [], allEdges),
      hashMap: prereqMap(),
      result: `[${answers.join(', ')}]`,
    },
    highlights: [],
    message: `Done! Same answer [${answers.join(', ')}] in O(V·E/64)-ish set-union work instead of a full n³ sweep — better when the graph is sparse.`,
    codeLine: 19,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const courseScheduleIV: Algorithm = {
  id: 'course-schedule-iv',
  name: 'Course Schedule IV',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(n³ + q)',
  spaceComplexity: 'O(n²)',
  pattern: 'Transitive Closure — Floyd-Warshall marks every indirect prerequisite',
  description:
    'You are given numCourses courses and a list of direct prerequisite pairs [a, b] meaning a must be taken before b. For each query [u, v], answer whether course u is a prerequisite (direct or indirect) of course v.',
  problemUrl: 'https://leetcode.com/problems/course-schedule-iv/',
  code: {
    python: `def checkIfPrerequisite(numCourses, prerequisites, queries):
    reach = [[False] * numCourses for _ in range(numCourses)]
    for a, b in prerequisites:
        reach[a][b] = True

    for k in range(numCourses):
        for i in range(numCourses):
            for j in range(numCourses):
                if reach[i][k] and reach[k][j]:
                    reach[i][j] = True

    return [reach[u][v] for u, v in queries]`,
    javascript: `function checkIfPrerequisite(numCourses, prerequisites, queries) {
    const reach = Array.from({length: numCourses},
        () => new Array(numCourses).fill(false));
    for (const [a, b] of prerequisites) reach[a][b] = true;

    for (let k = 0; k < numCourses; k++)
        for (let i = 0; i < numCourses; i++)
            for (let j = 0; j < numCourses; j++)
                if (reach[i][k] && reach[k][j])
                    reach[i][j] = true;

    return queries.map(([u, v]) => reach[u][v]);
}`,
    java: `public static List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites,
                                                int[][] queries) {
    boolean[][] reach = new boolean[numCourses][numCourses];
    for (int[] p : prerequisites) {
        reach[p[0]][p[1]] = true;
    }

    for (int k = 0; k < numCourses; k++) {
        for (int i = 0; i < numCourses; i++) {
            for (int j = 0; j < numCourses; j++) {
                if (reach[i][k] && reach[k][j]) {
                    reach[i][j] = true;
                }
            }
        }
    }

    List<Boolean> ans = new ArrayList<>();
    for (int[] q : queries) {
        ans.add(reach[q[0]][q[1]]);
    }
    return ans;
}`,
  },
  defaultInput: {
    numCourses: 4,
    prerequisites: [[0, 1], [1, 2], [1, 3]],
    queries: [[0, 3], [2, 3], [0, 2]],
  },
  run: runCourseScheduleIV,
  optimalApproachName: 'Floyd-Warshall Closure',
  approaches: [
    {
      id: 'kahns-prereq-sets',
      name: "Kahn's BFS (Prereq Sets)",
      timeComplexity: 'O(V·E + q)',
      spaceComplexity: 'O(V²)',
      description:
        'Instead of an n³ table sweep, walk the graph in topological order and let each course inherit the union of its parents\' prerequisite sets — one pass over the edges, much faster on sparse graphs.',
      code: {
        python: `from collections import deque

def checkIfPrerequisite(numCourses, prerequisites, queries):
    adj = [[] for _ in range(numCourses)]
    indegree = [0] * numCourses
    prereqs = [set() for _ in range(numCourses)]
    for a, b in prerequisites:
        adj[a].append(b)
        indegree[b] += 1

    queue = deque(i for i in range(numCourses) if indegree[i] == 0)
    while queue:
        node = queue.popleft()
        for nxt in adj[node]:
            prereqs[nxt].add(node)
            prereqs[nxt] |= prereqs[node]
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    return [u in prereqs[v] for u, v in queries]`,
        javascript: `function checkIfPrerequisite(numCourses, prerequisites, queries) {
    const adj = Array.from({length: numCourses}, () => []);
    const indegree = new Array(numCourses).fill(0);
    const prereqs = Array.from({length: numCourses}, () => new Set());
    for (const [a, b] of prerequisites) {
        adj[a].push(b);
        indegree[b]++;
    }

    const queue = [];
    for (let i = 0; i < numCourses; i++)
        if (indegree[i] === 0) queue.push(i);

    while (queue.length > 0) {
        const node = queue.shift();
        for (const nxt of adj[node]) {
            prereqs[nxt].add(node);
            for (const p of prereqs[node]) prereqs[nxt].add(p);
            if (--indegree[nxt] === 0) queue.push(nxt);
        }
    }
    return queries.map(([u, v]) => prereqs[v].has(u));
}`,
        java: `public static List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites,
                                                int[][] queries) {
    List<List<Integer>> adj = new ArrayList<>();
    List<Set<Integer>> prereqs = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) {
        adj.add(new ArrayList<>());
        prereqs.add(new HashSet<>());
    }
    int[] indegree = new int[numCourses];
    for (int[] p : prerequisites) {
        adj.get(p[0]).add(p[1]);
        indegree[p[1]]++;
    }

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (indegree[i] == 0) queue.add(i);
    }
    while (!queue.isEmpty()) {
        int node = queue.poll();
        for (int nxt : adj.get(node)) {
            prereqs.get(nxt).add(node);
            prereqs.get(nxt).addAll(prereqs.get(node));
            if (--indegree[nxt] == 0) queue.add(nxt);
        }
    }

    List<Boolean> ans = new ArrayList<>();
    for (int[] q : queries) {
        ans.add(prereqs.get(q[1]).contains(q[0]));
    }
    return ans;
}`,
      },
      run: runCourseScheduleIVKahns,
      lineExplanations: {
        python: {
          1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Course count, direct prereq pairs, and queries',
          4: 'Adjacency list: course -> courses it unlocks',
          5: 'Indegree = how many prereqs a course still waits on',
          6: 'prereqs[c] will hold every course needed before c',
          7: 'Read each direct prerequisite pair',
          8: 'a unlocks b',
          9: 'b waits on one more course',
          11: 'Start from courses that need nothing',
          12: 'Process in topological order',
          13: 'This course now has its final prereq set',
          14: 'Push knowledge down to each unlocked course',
          15: 'nxt directly needs node',
          16: 'nxt also inherits everything node needed',
          17: 'One fewer pending prerequisite for nxt',
          18: 'All of nxt prereqs settled?',
          19: 'Then its own set is final — enqueue it',
          21: 'Each query is one set membership test',
        },
        javascript: {
          1: 'Course count, direct prereq pairs, and queries',
          2: 'Adjacency list: course -> courses it unlocks',
          3: 'Indegree = how many prereqs a course still waits on',
          4: 'prereqs[c] will hold every course needed before c',
          5: 'Read each direct prerequisite pair',
          6: 'a unlocks b',
          7: 'b waits on one more course',
          10: 'Queue of courses whose prereq set is final',
          11: 'Scan all courses',
          12: 'Seed with the ones needing nothing',
          14: 'Process in topological order',
          15: 'Pop the next settled course',
          16: 'Push knowledge down to each unlocked course',
          17: 'nxt directly needs node',
          18: 'nxt also inherits everything node needed',
          19: 'Decrement indegree; enqueue when it hits 0',
          22: 'Each query is one set membership test',
        },
        java: {
          1: 'Course count, direct prereq pairs, and queries',
          3: 'Adjacency list: course -> courses it unlocks',
          4: 'prereqs.get(c) holds every course needed before c',
          5: 'Initialize both structures per course',
          9: 'Indegree = pending prerequisites per course',
          10: 'Read each direct prerequisite pair',
          11: 'a unlocks b',
          12: 'b waits on one more course',
          15: 'Queue of courses whose prereq set is final',
          16: 'Scan all courses',
          17: 'Seed with the ones needing nothing',
          19: 'Process in topological order',
          20: 'Pop the next settled course',
          21: 'Push knowledge down to each unlocked course',
          22: 'nxt directly needs node',
          23: 'nxt also inherits everything node needed',
          24: 'Decrement indegree; enqueue when it hits 0',
          28: 'Collect one boolean per query',
          29: 'Walk the query list',
          30: 'Membership test in the settled prereq set',
          32: 'Return all answers',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Course count, direct prereq pairs, and queries',
      2: 'reach[a][b] = can a reach b through prerequisites',
      3: 'Seed the table with the direct edges',
      4: 'a is a direct prerequisite of b',
      6: 'k is the intermediate "bridge" course',
      7: 'i is the candidate starting course',
      8: 'j is the candidate destination course',
      9: 'If i reaches k and k reaches j...',
      10: '...then i reaches j as well',
      12: 'Every query is now a single O(1) table lookup',
    },
    javascript: {
      1: 'Course count, direct prereq pairs, and queries',
      2: 'Allocate the n x n reachability table',
      3: 'Every cell starts false',
      4: 'Seed the table with the direct edges',
      6: 'k is the intermediate "bridge" course',
      7: 'i is the candidate starting course',
      8: 'j is the candidate destination course',
      9: 'If i reaches k and k reaches j...',
      10: '...then i reaches j as well',
      12: 'Every query is now a single O(1) table lookup',
    },
    java: {
      1: 'Course count and direct prerequisite pairs',
      2: 'Query pairs to answer',
      3: 'boolean[][] defaults to all false',
      4: 'Seed the table with the direct edges',
      5: 'p[0] is a direct prerequisite of p[1]',
      8: 'k is the intermediate "bridge" course',
      9: 'i is the candidate starting course',
      10: 'j is the candidate destination course',
      11: 'If i reaches k and k reaches j...',
      12: '...then i reaches j as well',
      18: 'Collect one boolean per query',
      19: 'Walk the query list',
      20: 'Single O(1) lookup in the closure table',
      22: 'Return all answers',
    },
  },
};
