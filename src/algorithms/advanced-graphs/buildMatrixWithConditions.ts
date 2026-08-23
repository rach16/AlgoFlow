import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface BuildMatrixInput {
  k: number;
  rowConditions: number[][];
  colConditions: number[][];
}

function dagOf(k: number, conditions: number[][]) {
  return {
    nodes: Array.from({ length: k }, (_, i) => ({ id: i + 1, label: `${i + 1}` })),
    edges: conditions.map(([a, b]) => ({ from: a, to: b })),
  };
}

const emptyMatrix = (k: number) => Array.from({ length: k }, () => Array(k).fill(0) as number[]);

function runBuildMatrixWithConditions(input: unknown): AlgorithmStep[] {
  const { k, rowConditions, colConditions } = input as BuildMatrixInput;
  const steps: AlgorithmStep[] = [];
  const matrix = emptyMatrix(k);

  steps.push({
    state: {
      graph: dagOf(k, rowConditions),
      graphDirected: true,
      graphHighlights: [],
      graphSecondary: [],
      matrix: matrix.map(r => [...r]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Rows and columns are two independent orderings',
    },
    highlights: [],
    message: `Key insight: the row constraints and the column constraints never interact. Topologically sort each one separately, then value v lands at (rowPos[v], colPos[v]).`,
    codeLine: 1,
  } as AlgorithmStep);

  const topoSort = (conditions: number[][], kind: 'row' | 'col'): number[] | null => {
    const graph = dagOf(k, conditions);
    const adj: Record<number, number[]> = {};
    for (let v = 1; v <= k; v++) adj[v] = [];
    for (const [a, b] of conditions) adj[a].push(b);

    // 0 = unvisited, 1 = on the current DFS path, 2 = finished
    const state = new Array(k + 1).fill(0);
    const order: number[] = [];
    let cyclic = false;

    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: [],
        graphSecondary: [],
        matrix: matrix.map(r => [...r]),
        matrixHighlights: [],
        matrixSecondary: [],
        result: `${kind === 'row' ? 'Row' : 'Column'} DAG: ${conditions.map(([a, b]) => `${a}→${b}`).join(', ')}`,
      },
      highlights: [],
      message: `${kind === 'row' ? 'ROW' : 'COLUMN'} pass. An edge a→b means "a must come before b" ${kind === 'row' ? 'top-to-bottom' : 'left-to-right'}. DFS post-order, reversed, gives a valid ordering.`,
      codeLine: 2,
      action: 'visit',
    } as AlgorithmStep);

    const dfs = (node: number): boolean => {
      if (state[node] === 1) {
        cyclic = true;
        return false;
      }
      if (state[node] === 2) return true;
      state[node] = 1;

      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [...order],
          graphSecondary: [node],
          matrix: matrix.map(r => [...r]),
          matrixHighlights: [],
          matrixSecondary: [],
          result: `post-order so far: [${order.join(', ')}]`,
        },
        highlights: [],
        message: `Enter ${node} and mark it "on the path" — revisiting it before it finishes would mean a cycle, which makes the whole problem unsolvable.`,
        codeLine: 14,
        action: 'visit',
      } as AlgorithmStep);

      for (const nxt of adj[node]) {
        if (!dfs(nxt)) return false;
      }

      state[node] = 2;
      order.push(node);

      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [...order],
          graphSecondary: [node],
          matrix: matrix.map(r => [...r]),
          matrixHighlights: [],
          matrixSecondary: [],
          result: `post-order so far: [${order.join(', ')}]`,
        },
        highlights: [],
        message: `Everything that must come after ${node} is already finished, so append ${node} to the post-order list: [${order.join(', ')}].`,
        codeLine: 19,
        action: 'push',
      } as AlgorithmStep);

      return true;
    };

    for (let node = 1; node <= k; node++) {
      if (!dfs(node)) break;
    }

    if (cyclic) {
      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [],
          graphSecondary: [],
          matrix: matrix.map(r => [...r]),
          matrixHighlights: [],
          matrixSecondary: [],
          result: 'Cycle detected — no valid matrix',
        },
        highlights: [],
        message: `The ${kind} constraints contain a cycle, so no ordering exists. Return the empty matrix.`,
        codeLine: 24,
        action: 'found',
      } as AlgorithmStep);
      return null;
    }

    const finalOrder = [...order].reverse();

    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: finalOrder,
        graphSecondary: [],
        matrix: matrix.map(r => [...r]),
        matrixHighlights: [],
        matrixSecondary: [],
        result: `${kind === 'row' ? 'row' : 'col'} order = [${finalOrder.join(', ')}]`,
      },
      highlights: [],
      message: `Reverse the post-order: ${kind === 'row' ? 'row' : 'column'} order = [${finalOrder.join(', ')}]. Position i in this list is ${kind === 'row' ? 'row' : 'column'} index i.`,
      codeLine: 25,
      action: 'found',
    } as AlgorithmStep);

    return finalOrder;
  };

  const rowOrder = topoSort(rowConditions, 'row');
  const colOrder = rowOrder === null ? null : topoSort(colConditions, 'col');

  if (rowOrder === null || colOrder === null) {
    steps.push({
      state: {
        matrix: [],
        matrixHighlights: [],
        matrixSecondary: [],
        result: '[] (impossible)',
      },
      highlights: [],
      message: 'One of the constraint graphs has a cycle — return an empty matrix.',
      codeLine: 30,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  const colPos: Record<number, number> = {};
  colOrder.forEach((v, i) => (colPos[v] = i));

  const placed: [number, number][] = [];

  for (let i = 0; i < rowOrder.length; i++) {
    const v = rowOrder[i];
    const c = colPos[v];
    matrix[i][c] = v;
    placed.push([i, c]);

    steps.push({
      state: {
        graph: dagOf(k, colConditions),
        graphDirected: true,
        graphHighlights: [v],
        graphSecondary: [],
        matrix: matrix.map(r => [...r]),
        matrixHighlights: placed.map(p => [...p] as [number, number]),
        matrixSecondary: [[i, c]],
        result: `Placed ${v} at (${i}, ${c})`,
      },
      highlights: [],
      message: `${v} is #${i + 1} in the row order and #${c + 1} in the column order → put it at row ${i}, column ${c}. Both constraint sets are satisfied by construction.`,
      codeLine: 35,
      action: 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      graph: dagOf(k, colConditions),
      graphDirected: true,
      graphHighlights: [],
      graphSecondary: [],
      matrix: matrix.map(r => [...r]),
      matrixHighlights: placed.map(p => [...p] as [number, number]),
      matrixSecondary: [],
      result: `[${matrix.map(r => `[${r.join(',')}]`).join(', ')}]`,
    },
    highlights: [],
    message: `Done! Every value sits on its own row and its own column, and both orderings hold.`,
    codeLine: 36,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runBuildMatrixKahn(input: unknown): AlgorithmStep[] {
  const { k, rowConditions, colConditions } = input as BuildMatrixInput;
  const steps: AlgorithmStep[] = [];
  const matrix = emptyMatrix(k);

  steps.push({
    state: {
      graph: dagOf(k, rowConditions),
      graphDirected: true,
      graphHighlights: [],
      graphSecondary: [],
      matrix: matrix.map(r => [...r]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Two Kahn BFS orderings',
    },
    highlights: [],
    message: `Same two-orderings plan, but built with Kahn's BFS: repeatedly emit any value with no remaining predecessor. It also detects cycles for free — the order just comes out short.`,
    codeLine: 1,
  } as AlgorithmStep);

  const kahn = (conditions: number[][], kind: 'row' | 'col'): number[] | null => {
    const graph = dagOf(k, conditions);
    const adj: Record<number, number[]> = {};
    const indeg = new Array(k + 1).fill(0);
    for (let v = 1; v <= k; v++) adj[v] = [];
    for (const [a, b] of conditions) {
      adj[a].push(b);
      indeg[b] += 1;
    }

    const degText = () =>
      Array.from({ length: k }, (_, i) => `${i + 1}:${indeg[i + 1]}`).join('  ');

    const queue: number[] = [];
    for (let v = 1; v <= k; v++) if (indeg[v] === 0) queue.push(v);

    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: [],
        graphSecondary: [...queue],
        matrix: matrix.map(r => [...r]),
        matrixHighlights: [],
        matrixSecondary: [],
        queue: [...queue],
        result: `in-degrees  ${degText()}`,
      },
      highlights: [],
      message: `${kind === 'row' ? 'ROW' : 'COLUMN'} pass. In-degrees are ${degText()}. Seed the queue with every value that has no predecessor: [${queue.join(', ')}].`,
      codeLine: 8,
      action: 'visit',
    } as AlgorithmStep);

    const order: number[] = [];

    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);

      const freed: number[] = [];
      for (const nxt of adj[node]) {
        indeg[nxt] -= 1;
        if (indeg[nxt] === 0) {
          queue.push(nxt);
          freed.push(nxt);
        }
      }

      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [...order],
          graphSecondary: [...queue],
          matrix: matrix.map(r => [...r]),
          matrixHighlights: [],
          matrixSecondary: [],
          queue: [...queue],
          result: `order = [${order.join(', ')}]`,
        },
        highlights: [],
        message:
          freed.length > 0
            ? `Emit ${node} (in-degree 0). Removing it frees [${freed.join(', ')}] — push them. Queue: [${queue.join(', ')}].`
            : `Emit ${node} (in-degree 0). Nothing new is freed. Queue: [${queue.join(', ')}].`,
        codeLine: 11,
        action: 'pop',
      } as AlgorithmStep);
    }

    if (order.length !== k) {
      steps.push({
        state: {
          graph,
          graphDirected: true,
          graphHighlights: [...order],
          graphSecondary: [],
          matrix: matrix.map(r => [...r]),
          matrixHighlights: [],
          matrixSecondary: [],
          result: 'Cycle detected — no valid matrix',
        },
        highlights: [],
        message: `Only ${order.length} of ${k} values came out — the leftovers sit in a cycle, so no matrix exists.`,
        codeLine: 17,
        action: 'found',
      } as AlgorithmStep);
      return null;
    }

    steps.push({
      state: {
        graph,
        graphDirected: true,
        graphHighlights: [...order],
        graphSecondary: [],
        matrix: matrix.map(r => [...r]),
        matrixHighlights: [],
        matrixSecondary: [],
        result: `${kind === 'row' ? 'row' : 'col'} order = [${order.join(', ')}]`,
      },
      highlights: [],
      message: `All ${k} values emitted → ${kind === 'row' ? 'row' : 'column'} order = [${order.join(', ')}]. No reversal needed: Kahn emits in forward order.`,
      codeLine: 17,
      action: 'found',
    } as AlgorithmStep);

    return order;
  };

  const rowOrder = kahn(rowConditions, 'row');
  const colOrder = rowOrder === null ? null : kahn(colConditions, 'col');

  if (rowOrder === null || colOrder === null) {
    steps.push({
      state: {
        matrix: [],
        matrixHighlights: [],
        matrixSecondary: [],
        result: '[] (impossible)',
      },
      highlights: [],
      message: 'One of the constraint graphs has a cycle — return an empty matrix.',
      codeLine: 22,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  const colPos: Record<number, number> = {};
  colOrder.forEach((v, i) => (colPos[v] = i));

  const placed: [number, number][] = [];

  for (let i = 0; i < rowOrder.length; i++) {
    const v = rowOrder[i];
    const c = colPos[v];
    matrix[i][c] = v;
    placed.push([i, c]);

    steps.push({
      state: {
        graph: dagOf(k, colConditions),
        graphDirected: true,
        graphHighlights: [v],
        graphSecondary: [],
        matrix: matrix.map(r => [...r]),
        matrixHighlights: placed.map(p => [...p] as [number, number]),
        matrixSecondary: [[i, c]],
        result: `Placed ${v} at (${i}, ${c})`,
      },
      highlights: [],
      message: `${v} is #${i + 1} in the row order and #${c + 1} in the column order → cell (${i}, ${c}).`,
      codeLine: 27,
      action: 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      graph: dagOf(k, colConditions),
      graphDirected: true,
      graphHighlights: [],
      graphSecondary: [],
      matrix: matrix.map(r => [...r]),
      matrixHighlights: placed.map(p => [...p] as [number, number]),
      matrixSecondary: [],
      result: `[${matrix.map(r => `[${r.join(',')}]`).join(', ')}]`,
    },
    highlights: [],
    message: `Done! Kahn's BFS produced the same two orderings, so the same matrix falls out.`,
    codeLine: 28,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const buildMatrixWithConditions: Algorithm = {
  id: 'build-matrix-with-conditions',
  name: 'Build a Matrix With Conditions',
  category: 'Advanced Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(k^2 + R + C)',
  spaceComplexity: 'O(k^2 + R + C)',
  pattern: 'Topological Sort — order rows and columns independently, then place',
  description:
    'You are given a positive integer k and two lists of conditions. rowConditions[i] = [above, below] means the number above must appear in a row strictly above the row of below, and colConditions[i] = [left, right] means left must appear in a column strictly left of right. Build any k x k matrix containing each number from 1 to k exactly once (all remaining cells zero) that satisfies every condition, or return an empty matrix if none exists.',
  problemUrl: 'https://leetcode.com/problems/build-a-matrix-with-conditions/',
  code: {
    python: `from collections import defaultdict

def buildMatrix(k, rowConditions, colConditions):
    def topo(conditions):
        adj = defaultdict(list)
        for a, b in conditions:
            adj[a].append(b)
        state = [0] * (k + 1)
        order = []

        def dfs(node):
            if state[node] == 1:
                return False
            if state[node] == 2:
                return True
            state[node] = 1
            for nxt in adj[node]:
                if not dfs(nxt):
                    return False
            state[node] = 2
            order.append(node)
            return True

        for node in range(1, k + 1):
            if not dfs(node):
                return []
        return order[::-1]

    rowOrder = topo(rowConditions)
    colOrder = topo(colConditions)
    if not rowOrder or not colOrder:
        return []

    pos = {v: i for i, v in enumerate(colOrder)}
    matrix = [[0] * k for _ in range(k)]
    for i, v in enumerate(rowOrder):
        matrix[i][pos[v]] = v
    return matrix`,
    javascript: `function buildMatrix(k, rowConditions, colConditions) {
    const topo = (conditions) => {
        const adj = {};
        for (let v = 1; v <= k; v++) adj[v] = [];
        for (const [a, b] of conditions) adj[a].push(b);
        const state = new Array(k + 1).fill(0);
        const order = [];

        const dfs = (node) => {
            if (state[node] === 1) return false;
            if (state[node] === 2) return true;
            state[node] = 1;
            for (const nxt of adj[node]) {
                if (!dfs(nxt)) return false;
            }
            state[node] = 2;
            order.push(node);
            return true;
        };

        for (let node = 1; node <= k; node++) {
            if (!dfs(node)) return [];
        }
        return order.reverse();
    };

    const rowOrder = topo(rowConditions);
    const colOrder = topo(colConditions);
    if (!rowOrder.length || !colOrder.length) return [];

    const pos = {};
    colOrder.forEach((v, i) => { pos[v] = i; });
    const matrix = Array.from({ length: k }, () => new Array(k).fill(0));
    rowOrder.forEach((v, i) => { matrix[i][pos[v]] = v; });
    return matrix;
}`,
    java: `public static int[][] buildMatrix(int k, int[][] rowConditions, int[][] colConditions) {
    int[] rowOrder = topo(k, rowConditions);
    int[] colOrder = topo(k, colConditions);
    if (rowOrder == null || colOrder == null) return new int[0][0];

    int[] pos = new int[k + 1];
    for (int i = 0; i < k; i++) pos[colOrder[i]] = i;

    int[][] matrix = new int[k][k];
    for (int i = 0; i < k; i++) matrix[i][pos[rowOrder[i]]] = rowOrder[i];
    return matrix;
}

private static List<List<Integer>> adj;
private static int[] state;
private static List<Integer> order;

private static int[] topo(int k, int[][] conditions) {
    adj = new ArrayList<>();
    for (int i = 0; i <= k; i++) adj.add(new ArrayList<>());
    for (int[] c : conditions) adj.get(c[0]).add(c[1]);
    state = new int[k + 1];
    order = new ArrayList<>();

    for (int node = 1; node <= k; node++)
        if (!dfs(node)) return null;

    int[] res = new int[k];
    for (int i = 0; i < k; i++) res[i] = order.get(k - 1 - i);
    return res;
}

private static boolean dfs(int node) {
    if (state[node] == 1) return false;
    if (state[node] == 2) return true;
    state[node] = 1;
    for (int nxt : adj.get(node))
        if (!dfs(nxt)) return false;
    state[node] = 2;
    order.add(node);
    return true;
}`,
  },
  defaultInput: {
    k: 3,
    rowConditions: [
      [1, 2],
      [2, 3],
    ],
    colConditions: [
      [2, 3],
      [3, 1],
    ],
  },
  run: runBuildMatrixWithConditions,
  optimalApproachName: 'Two DFS Topological Sorts',
  approaches: [
    {
      id: 'kahn-bfs-orderings',
      name: "Kahn's BFS (both orderings)",
      timeComplexity: 'O(k^2 + R + C)',
      spaceComplexity: 'O(k^2 + R + C)',
      description:
        'Replaces the recursive DFS post-order with iterative in-degree peeling: repeatedly emit any value with no remaining predecessor, which produces the ordering directly (no reversal) and flags a cycle by emitting fewer than k values.',
      code: {
        python: `from collections import defaultdict, deque

def buildMatrix(k, rowConditions, colConditions):
    def topo(conditions):
        adj = defaultdict(list)
        indeg = [0] * (k + 1)
        for a, b in conditions:
            adj[a].append(b)
            indeg[b] += 1
        queue = deque(v for v in range(1, k + 1) if indeg[v] == 0)
        order = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for nxt in adj[node]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    queue.append(nxt)
        return order if len(order) == k else []

    rowOrder = topo(rowConditions)
    colOrder = topo(colConditions)
    if not rowOrder or not colOrder:
        return []

    pos = {v: i for i, v in enumerate(colOrder)}
    matrix = [[0] * k for _ in range(k)]
    for i, v in enumerate(rowOrder):
        matrix[i][pos[v]] = v
    return matrix`,
        javascript: `function buildMatrix(k, rowConditions, colConditions) {
    const topo = (conditions) => {
        const adj = {};
        const indeg = new Array(k + 1).fill(0);
        for (let v = 1; v <= k; v++) adj[v] = [];
        for (const [a, b] of conditions) {
            adj[a].push(b);
            indeg[b]++;
        }
        const queue = [];
        for (let v = 1; v <= k; v++) if (indeg[v] === 0) queue.push(v);
        const order = [];
        while (queue.length) {
            const node = queue.shift();
            order.push(node);
            for (const nxt of adj[node]) {
                if (--indeg[nxt] === 0) queue.push(nxt);
            }
        }
        return order.length === k ? order : [];
    };

    const rowOrder = topo(rowConditions);
    const colOrder = topo(colConditions);
    if (!rowOrder.length || !colOrder.length) return [];

    const pos = {};
    colOrder.forEach((v, i) => { pos[v] = i; });
    const matrix = Array.from({ length: k }, () => new Array(k).fill(0));
    rowOrder.forEach((v, i) => { matrix[i][pos[v]] = v; });
    return matrix;
}`,
        java: `public static int[][] buildMatrix(int k, int[][] rowConditions, int[][] colConditions) {
    int[] rowOrder = topo(k, rowConditions);
    int[] colOrder = topo(k, colConditions);
    if (rowOrder == null || colOrder == null) return new int[0][0];

    int[] pos = new int[k + 1];
    for (int i = 0; i < k; i++) pos[colOrder[i]] = i;

    int[][] matrix = new int[k][k];
    for (int i = 0; i < k; i++) matrix[i][pos[rowOrder[i]]] = rowOrder[i];
    return matrix;
}

private static int[] topo(int k, int[][] conditions) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i <= k; i++) adj.add(new ArrayList<>());
    int[] indeg = new int[k + 1];
    for (int[] c : conditions) {
        adj.get(c[0]).add(c[1]);
        indeg[c[1]]++;
    }

    Deque<Integer> queue = new ArrayDeque<>();
    for (int v = 1; v <= k; v++) if (indeg[v] == 0) queue.offer(v);

    int[] order = new int[k];
    int size = 0;
    while (!queue.isEmpty()) {
        int node = queue.poll();
        order[size++] = node;
        for (int nxt : adj.get(node))
            if (--indeg[nxt] == 0) queue.offer(nxt);
    }
    return size == k ? order : null;
}`,
      },
      run: runBuildMatrixKahn,
      lineExplanations: {
        python: {
          1: 'defaultdict creates the empty value on first touch, so no "is this key here?" check; deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Define function with k and both condition lists',
          4: 'One helper handles rows and columns alike',
          5: 'Successor lists',
          6: 'Count how many predecessors each value still has',
          7: 'Read each "a before b" condition',
          8: 'a points at b',
          9: 'b gains one predecessor',
          10: 'Seed the queue with every predecessor-free value',
          11: 'Emitted ordering',
          12: "Kahn's main loop",
          13: 'Take any currently unblocked value',
          14: 'It is safe to place next',
          15: 'Relax each successor',
          16: 'One fewer predecessor blocking it',
          17: 'Fully unblocked?',
          18: 'Queue it',
          19: 'Short order means a cycle — no valid ordering',
          21: 'Row ordering',
          22: 'Column ordering',
          23: 'Either one impossible?',
          24: 'Then no matrix exists',
          26: 'Column index of every value',
          27: 'Start from an all-zero k x k grid',
          28: 'Row index = position in the row ordering',
          29: 'Drop the value at its (row, col) cell',
          30: 'Return the finished matrix',
        },
        javascript: {
          1: 'Define function with k and both condition lists',
          2: 'One helper handles rows and columns alike',
          3: 'Successor lists',
          4: 'Count how many predecessors each value still has',
          6: 'Read each "a before b" condition',
          7: 'a points at b',
          8: 'b gains one predecessor',
          10: 'Queue of currently unblocked values',
          11: 'Seed it with every value of in-degree 0',
          12: 'Emitted ordering',
          13: "Kahn's main loop",
          14: 'Take any currently unblocked value',
          15: 'It is safe to place next',
          16: 'Relax each successor',
          17: 'Decrement and queue it if fully unblocked',
          20: 'Short order means a cycle — no valid ordering',
          23: 'Row ordering',
          24: 'Column ordering',
          25: 'Either one impossible means no matrix',
          27: 'Column index of every value',
          29: 'Start from an all-zero k x k grid',
          30: 'Row index = position in the row ordering',
          31: 'Return the finished matrix',
        },
        java: {
          1: 'Define method with k and both condition lists',
          2: 'Row ordering',
          3: 'Column ordering',
          4: 'Either one impossible means no matrix',
          6: 'Column index of every value',
          9: 'Start from an all-zero k x k grid',
          10: 'Drop each value at its (row, col) cell',
          14: "Kahn's topological sort helper",
          15: 'Successor lists',
          17: 'Count how many predecessors each value still has',
          18: 'Read each "a before b" condition',
          19: 'a points at b',
          20: 'b gains one predecessor',
          23: 'Queue of currently unblocked values',
          24: 'Seed it with every value of in-degree 0',
          26: 'Emitted ordering',
          28: "Kahn's main loop",
          29: 'Take any currently unblocked value',
          30: 'It is safe to place next',
          31: 'Relax each successor',
          32: 'Decrement and queue it if fully unblocked',
          34: 'Short order means a cycle — no valid ordering',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'defaultdict creates the empty value on first touch, so no "is this key here?" check',
      3: 'Define function with k and both condition lists',
      4: 'One helper handles rows and columns alike',
      5: 'Successor lists: a -> everything that must follow a',
      6: 'Read each "a before b" condition',
      7: 'Record the edge',
      8: '0 = unseen, 1 = on the current path, 2 = finished',
      9: 'DFS post-order accumulates here',
      11: 'Depth-first visit',
      12: 'Seeing an on-path node means a cycle',
      13: 'Cycle -> no valid ordering',
      14: 'Already finished, nothing to do',
      16: 'Mark the node as on the current path',
      17: 'Recurse into every successor first',
      19: 'Propagate the cycle failure upward',
      20: 'Node is finished',
      21: 'Append it AFTER its successors — post-order',
      24: 'Every value must be visited',
      25: 'Any cycle aborts the whole thing',
      27: 'Reversed post-order is a topological order',
      29: 'Ordering that fixes row indices',
      30: 'Ordering that fixes column indices',
      31: 'Either constraint set unsatisfiable?',
      32: 'Then return an empty matrix',
      34: 'Column index of every value',
      35: 'Start from an all-zero k x k grid',
      36: 'Row index = position in the row ordering',
      37: 'Value v lands at (rowPos, colPos) — one per row and column',
      38: 'Return the finished matrix',
    },
    javascript: {
      1: 'Define function with k and both condition lists',
      2: 'One helper handles rows and columns alike',
      3: 'Successor lists',
      4: 'Init an empty list per value',
      5: 'Record each "a before b" edge',
      6: '0 = unseen, 1 = on the current path, 2 = finished',
      7: 'DFS post-order accumulates here',
      9: 'Depth-first visit',
      10: 'Seeing an on-path node means a cycle',
      11: 'Already finished, nothing to do',
      12: 'Mark the node as on the current path',
      13: 'Recurse into every successor first',
      16: 'Node is finished',
      17: 'Append it AFTER its successors — post-order',
      21: 'Every value must be visited',
      23: 'Reversed post-order is a topological order',
      27: 'Ordering that fixes row indices',
      28: 'Ordering that fixes column indices',
      29: 'Either constraint set unsatisfiable means no matrix',
      31: 'Column index of every value',
      33: 'Start from an all-zero k x k grid',
      34: 'Value v lands at (rowPos, colPos)',
      35: 'Return the finished matrix',
    },
    java: {
      1: 'Define method with k and both condition lists',
      2: 'Ordering that fixes row indices',
      3: 'Ordering that fixes column indices',
      4: 'Either constraint set unsatisfiable means no matrix',
      6: 'Column index of every value',
      9: 'Start from an all-zero k x k grid',
      10: 'Value v lands at (rowPos, colPos)',
      14: 'Shared DFS scratch state',
      18: 'Topological sort helper used for rows and columns',
      19: 'Successor lists',
      21: 'Record each "a before b" edge',
      22: '0 = unseen, 1 = on the current path, 2 = finished',
      23: 'DFS post-order accumulates here',
      25: 'Every value must be visited',
      26: 'Any cycle aborts the whole thing',
      28: 'Reversed post-order is a topological order',
      30: 'Copy it out backwards',
      34: 'Depth-first visit',
      35: 'Seeing an on-path node means a cycle',
      36: 'Already finished, nothing to do',
      37: 'Mark the node as on the current path',
      38: 'Recurse into every successor first',
      40: 'Node is finished',
      41: 'Append it AFTER its successors — post-order',
    },
  },
};
