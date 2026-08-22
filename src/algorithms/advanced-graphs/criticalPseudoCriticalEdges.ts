import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CriticalEdgesInput {
  n: number;
  edges: number[][];
}

interface SortedEdge {
  w: number;
  u: number;
  v: number;
  i: number;
}

function buildGraph(n: number, edges: number[][]) {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: i, label: `${i}` }));
  const graphEdges = edges.map(([u, v, w]) => ({ from: u, to: v, weight: w }));
  return { nodes, edges: graphEdges };
}

/** Kruskal that can skip one sorted-edge slot and/or force one in first. */
function kruskal(n: number, sorted: SortedEdge[], skip: number, force: number) {
  const parent = Array.from({ length: n }, (_, x) => x);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  let total = 0;
  let used = 0;
  const chosen: number[] = [];

  if (force >= 0) {
    const e = sorted[force];
    parent[find(e.u)] = find(e.v);
    total += e.w;
    used += 1;
    chosen.push(force);
  }

  for (let j = 0; j < sorted.length; j++) {
    if (j === skip || j === force) continue;
    const e = sorted[j];
    const ru = find(e.u);
    const rv = find(e.v);
    if (ru !== rv) {
      parent[ru] = rv;
      total += e.w;
      used += 1;
      chosen.push(j);
    }
  }

  return { total: used === n - 1 ? total : Infinity, chosen };
}

function runCriticalPseudoCriticalEdges(input: unknown): AlgorithmStep[] {
  const { n, edges } = input as CriticalEdgesInput;
  const steps: AlgorithmStep[] = [];
  const graph = buildGraph(n, edges);

  const sorted: SortedEdge[] = edges
    .map(([u, v, w], i) => ({ w, u, v, i }))
    .sort((a, b) => a.w - b.w);

  const label = (e: SortedEdge) => `e${e.i} (${e.u}-${e.v}, w=${e.w})`;
  const verdicts: Record<string, string> = {};

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: [],
      graphSecondary: [],
      graphVisitedEdges: [],
      result: 'Building the baseline MST...',
    },
    highlights: [],
    message: `${n} nodes, ${edges.length} weighted edges. An edge is CRITICAL if deleting it makes every spanning tree heavier, and PSEUDO-CRITICAL if it can appear in some MST but is not forced.`,
    codeLine: 1,
  } as AlgorithmStep);

  // ---- Baseline Kruskal, animated edge by edge ----
  const parent = Array.from({ length: n }, (_, x) => x);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  let baseWeight = 0;
  const baseEdges: [number, number][] = [];

  for (const e of sorted) {
    const ru = find(e.u);
    const rv = find(e.v);
    if (ru !== rv) {
      parent[ru] = rv;
      baseWeight += e.w;
      baseEdges.push([e.u, e.v]);

      steps.push({
        state: {
          graph,
          graphDirected: false,
          graphHighlights: [],
          graphSecondary: [e.u, e.v],
          graphVisitedEdges: baseEdges.map(p => [...p] as [number, number]),
          result: `MST so far: ${baseWeight}`,
        },
        highlights: [],
        message: `Kruskal takes ${label(e)} — it joins two separate components. Running MST weight = ${baseWeight}.`,
        codeLine: 24,
        action: 'insert',
      } as AlgorithmStep);
    } else {
      steps.push({
        state: {
          graph,
          graphDirected: false,
          graphHighlights: [],
          graphSecondary: [e.u, e.v],
          graphVisitedEdges: baseEdges.map(p => [...p] as [number, number]),
          result: `MST so far: ${baseWeight}`,
        },
        highlights: [],
        message: `Skip ${label(e)} — ${e.u} and ${e.v} are already connected, so it would close a cycle.`,
        codeLine: 23,
        action: 'compare',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: Array.from({ length: n }, (_, i) => i),
      graphSecondary: [],
      graphVisitedEdges: baseEdges.map(p => [...p] as [number, number]),
      result: `Baseline MST weight = ${baseWeight}`,
    },
    highlights: [],
    message: `Baseline MST weight = ${baseWeight}. Every test from here compares against this single number.`,
    codeLine: 29,
    action: 'found',
  } as AlgorithmStep);

  // ---- Test each edge ----
  const critical: number[] = [];
  const pseudo: number[] = [];

  for (let j = 0; j < sorted.length; j++) {
    const e = sorted[j];
    const without = kruskal(n, sorted, j, -1).total;

    if (without > baseWeight) {
      critical.push(e.i);
      verdicts[label(e)] = 'CRITICAL';

      steps.push({
        state: {
          graph,
          graphDirected: false,
          graphHighlights: [],
          graphSecondary: [e.u, e.v],
          graphVisitedEdges: baseEdges.map(p => [...p] as [number, number]),
          hashMap: { ...verdicts },
          result: `critical = [${[...critical].sort((a, b) => a - b).join(', ')}]`,
        },
        highlights: [],
        message: `Delete ${label(e)} and rebuild: best weight = ${without === Infinity ? 'impossible (graph splits)' : without} > ${baseWeight}. Every MST needs it → CRITICAL.`,
        codeLine: 32,
        action: 'found',
      } as AlgorithmStep);
      continue;
    }

    const forced = kruskal(n, sorted, -1, j).total;
    const isPseudo = forced === baseWeight;
    if (isPseudo) {
      pseudo.push(e.i);
      verdicts[label(e)] = 'pseudo-critical';
    } else {
      verdicts[label(e)] = 'never in an MST';
    }

    steps.push({
      state: {
        graph,
        graphDirected: false,
        graphHighlights: [],
        graphSecondary: [e.u, e.v],
        graphVisitedEdges: kruskal(n, sorted, -1, j).chosen.map(
          idx => [sorted[idx].u, sorted[idx].v] as [number, number]
        ),
        hashMap: { ...verdicts },
        result: `pseudo = [${[...pseudo].sort((a, b) => a - b).join(', ')}]`,
      },
      highlights: [],
      message: isPseudo
        ? `Deleting ${label(e)} still costs ${baseWeight}, so it is not required. Now FORCE it in first: weight = ${forced} = ${baseWeight}, so some MST contains it → PSEUDO-CRITICAL.`
        : `Deleting ${label(e)} costs ${baseWeight} (not needed) and forcing it costs ${forced} > ${baseWeight} — it never appears in any MST.`,
      codeLine: 34,
      action: isPseudo ? 'insert' : 'compare',
    } as AlgorithmStep);
  }

  critical.sort((a, b) => a - b);
  pseudo.sort((a, b) => a - b);

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: Array.from({ length: n }, (_, i) => i),
      graphSecondary: [],
      graphVisitedEdges: baseEdges.map(p => [...p] as [number, number]),
      hashMap: { ...verdicts },
      result: `[[${critical.join(', ')}], [${pseudo.join(', ')}]]`,
    },
    highlights: [],
    message: `Done! Critical edges = [${critical.join(', ')}], pseudo-critical edges = [${pseudo.join(', ')}].`,
    codeLine: 36,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runCriticalPseudoCriticalEdgesBridges(input: unknown): AlgorithmStep[] {
  const { n, edges } = input as CriticalEdgesInput;
  const steps: AlgorithmStep[] = [];
  const graph = buildGraph(n, edges);

  const parent = Array.from({ length: n }, (_, x) => x);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const componentsText = () => {
    const groups: Record<number, number[]> = {};
    for (let i = 0; i < n; i++) {
      const r = find(i);
      (groups[r] = groups[r] || []).push(i);
    }
    return Object.values(groups)
      .map(g => `{${g.join(',')}}`)
      .join(' ');
  };

  /** Tarjan bridges over the graph whose vertices are current DSU roots. */
  const findBridges = (group: number[]): Set<number> => {
    const adj = new Map<number, [number, number][]>();
    const add = (a: number, b: number, k: number) => {
      if (!adj.has(a)) adj.set(a, []);
      adj.get(a)!.push([b, k]);
    };
    for (const k of group) {
      const a = find(edges[k][0]);
      const b = find(edges[k][1]);
      add(a, b, k);
      add(b, a, k);
    }
    const disc = new Map<number, number>();
    const low = new Map<number, number>();
    const res = new Set<number>();
    let timer = 0;

    const dfs = (u: number, parentEdge: number) => {
      disc.set(u, timer);
      low.set(u, timer);
      timer += 1;
      for (const [v, k] of adj.get(u) || []) {
        if (k === parentEdge) continue;
        if (disc.has(v)) {
          low.set(u, Math.min(low.get(u)!, disc.get(v)!));
        } else {
          dfs(v, k);
          low.set(u, Math.min(low.get(u)!, low.get(v)!));
          if (low.get(v)! > disc.get(u)!) res.add(k);
        }
      }
    };

    for (const u of Array.from(adj.keys())) {
      if (!disc.has(u)) dfs(u, -1);
    }
    return res;
  };

  const order = edges.map((_, i) => i).sort((a, b) => edges[a][2] - edges[b][2]);
  const critical: number[] = [];
  const pseudo: number[] = [];
  const verdicts: Record<string, string> = {};
  const mstEdges: [number, number][] = [];

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: [],
      graphSecondary: [],
      graphVisitedEdges: [],
      result: 'One Kruskal sweep, grouped by weight',
    },
    highlights: [],
    message: `No rebuilding at all. Sweep weights in increasing order; inside one equal-weight group, an edge is CRITICAL exactly when it is a bridge of the graph formed by the current components.`,
    codeLine: 1,
  } as AlgorithmStep);

  let i = 0;
  while (i < order.length) {
    let j = i;
    const w = edges[order[i]][2];
    while (j < order.length && edges[order[j]][2] === w) j += 1;

    const slice = order.slice(i, j);
    const group = slice.filter(k => find(edges[k][0]) !== find(edges[k][1]));
    const dropped = slice.filter(k => find(edges[k][0]) === find(edges[k][1]));

    steps.push({
      state: {
        graph,
        graphDirected: false,
        graphHighlights: [],
        graphSecondary: group.flatMap(k => [edges[k][0], edges[k][1]]),
        graphVisitedEdges: mstEdges.map(p => [...p] as [number, number]),
        hashMap: { ...verdicts },
        result: `Components: ${componentsText()}`,
      },
      highlights: [],
      message: `Weight ${w} group: edges [${slice.map(k => `e${k}`).join(', ')}].${dropped.length ? ` Drop [${dropped.map(k => `e${k}`).join(', ')}] — their endpoints are already merged, so they can never be in an MST.` : ''} ${group.length} candidate(s) remain.`,
      codeLine: 44,
      action: 'compare',
    } as AlgorithmStep);

    const bridges = findBridges(group);
    const crit = group.filter(k => bridges.has(k));
    const pse = group.filter(k => !bridges.has(k));

    if (crit.length > 0) {
      for (const k of crit) {
        critical.push(k);
        verdicts[`e${k} (${edges[k][0]}-${edges[k][1]}, w=${w})`] = 'CRITICAL';
      }
      steps.push({
        state: {
          graph,
          graphDirected: false,
          graphHighlights: [],
          graphSecondary: crit.flatMap(k => [edges[k][0], edges[k][1]]),
          graphVisitedEdges: mstEdges.map(p => [...p] as [number, number]),
          hashMap: { ...verdicts },
          result: `critical = [${[...critical].sort((a, b) => a - b).join(', ')}]`,
        },
        highlights: [],
        message: `[${crit.map(k => `e${k}`).join(', ')}] are BRIDGES of the contracted graph — no equal-weight substitute exists, so every MST must use them → CRITICAL.`,
        codeLine: 45,
        action: 'found',
      } as AlgorithmStep);
    }

    if (pse.length > 0) {
      for (const k of pse) {
        pseudo.push(k);
        verdicts[`e${k} (${edges[k][0]}-${edges[k][1]}, w=${w})`] = 'pseudo-critical';
      }
      steps.push({
        state: {
          graph,
          graphDirected: false,
          graphHighlights: [],
          graphSecondary: pse.flatMap(k => [edges[k][0], edges[k][1]]),
          graphVisitedEdges: mstEdges.map(p => [...p] as [number, number]),
          hashMap: { ...verdicts },
          result: `pseudo = [${[...pseudo].sort((a, b) => a - b).join(', ')}]`,
        },
        highlights: [],
        message: `[${pse.map(k => `e${k}`).join(', ')}] sit on a cycle of equal-weight edges — each can be swapped for another, so each is optional → PSEUDO-CRITICAL.`,
        codeLine: 47,
        action: 'insert',
      } as AlgorithmStep);
    }

    for (const k of group) {
      const ru = find(edges[k][0]);
      const rv = find(edges[k][1]);
      if (ru !== rv) {
        parent[ru] = rv;
        mstEdges.push([edges[k][0], edges[k][1]]);
      }
    }

    steps.push({
      state: {
        graph,
        graphDirected: false,
        graphHighlights: [],
        graphSecondary: [],
        graphVisitedEdges: mstEdges.map(p => [...p] as [number, number]),
        hashMap: { ...verdicts },
        result: `Components: ${componentsText()}`,
      },
      highlights: [],
      message: `Merge the whole weight-${w} group into the DSU. Components are now ${componentsText()}.`,
      codeLine: 49,
      action: 'visit',
    } as AlgorithmStep);

    i = j;
  }

  critical.sort((a, b) => a - b);
  pseudo.sort((a, b) => a - b);

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: Array.from({ length: n }, (_, x) => x),
      graphSecondary: [],
      graphVisitedEdges: mstEdges.map(p => [...p] as [number, number]),
      hashMap: { ...verdicts },
      result: `[[${critical.join(', ')}], [${pseudo.join(', ')}]]`,
    },
    highlights: [],
    message: `Done in a single sweep! Critical = [${critical.join(', ')}], pseudo-critical = [${pseudo.join(', ')}].`,
    codeLine: 51,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const criticalPseudoCriticalEdges: Algorithm = {
  id: 'critical-pseudo-critical-edges',
  name: 'Find Critical and Pseudo-Critical Edges in MST',
  category: 'Advanced Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(E^2 · α(V))',
  spaceComplexity: 'O(V + E)',
  pattern: 'Union-Find — rebuild the MST with each edge excluded, then forced',
  description:
    'Given a weighted undirected connected graph with n vertices and a list of edges, find all the critical and pseudo-critical edges in its minimum spanning tree. An edge is critical if deleting it from the graph would increase the MST weight, and pseudo-critical if it can appear in some MSTs but not all. Return the two lists of edge indices.',
  problemUrl:
    'https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/',
  code: {
    python: `def findCriticalAndPseudoCriticalEdges(n, edges):
    indexed = [(w, u, v, i) for i, (u, v, w) in enumerate(edges)]
    indexed.sort()

    def mst(skip=-1, force=-1):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        total, used = 0, 0
        if force >= 0:
            w, u, v, _ = indexed[force]
            parent[find(u)] = find(v)
            total, used = w, 1
        for j, (w, u, v, _) in enumerate(indexed):
            if j == skip or j == force:
                continue
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv
                total += w
                used += 1
        return total if used == n - 1 else float('inf')

    base = mst()
    critical, pseudo = [], []
    for j in range(len(indexed)):
        if mst(skip=j) > base:
            critical.append(indexed[j][3])
        elif mst(force=j) == base:
            pseudo.append(indexed[j][3])
    return [critical, pseudo]`,
    javascript: `function findCriticalAndPseudoCriticalEdges(n, edges) {
    const indexed = edges.map(([u, v, w], i) => [w, u, v, i]);
    indexed.sort((a, b) => a[0] - b[0]);

    const mst = (skip, force) => {
        const parent = Array.from({ length: n }, (_, x) => x);
        const find = (x) => {
            while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
            return x;
        };
        let total = 0, used = 0;
        if (force >= 0) {
            const [w, u, v] = indexed[force];
            parent[find(u)] = find(v);
            total = w; used = 1;
        }
        for (let j = 0; j < indexed.length; j++) {
            if (j === skip || j === force) continue;
            const [w, u, v] = indexed[j];
            const ru = find(u), rv = find(v);
            if (ru !== rv) { parent[ru] = rv; total += w; used++; }
        }
        return used === n - 1 ? total : Infinity;
    };

    const base = mst(-1, -1);
    const critical = [], pseudo = [];
    for (let j = 0; j < indexed.length; j++) {
        if (mst(j, -1) > base) critical.push(indexed[j][3]);
        else if (mst(-1, j) === base) pseudo.push(indexed[j][3]);
    }
    return [critical, pseudo];
}`,
    java: `public static List<List<Integer>> findCriticalAndPseudoCriticalEdges(int n, int[][] edges) {
    int m = edges.length;
    int[][] indexed = new int[m][4];
    for (int i = 0; i < m; i++)
        indexed[i] = new int[]{edges[i][2], edges[i][0], edges[i][1], i};
    Arrays.sort(indexed, (a, b) -> a[0] - b[0]);

    int base = mst(n, indexed, -1, -1);
    List<Integer> critical = new ArrayList<>(), pseudo = new ArrayList<>();
    for (int j = 0; j < m; j++) {
        if (mst(n, indexed, j, -1) > base) critical.add(indexed[j][3]);
        else if (mst(n, indexed, -1, j) == base) pseudo.add(indexed[j][3]);
    }
    return Arrays.asList(critical, pseudo);
}

private static int[] parent;

private static int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}

private static int mst(int n, int[][] indexed, int skip, int force) {
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0, used = 0;
    if (force >= 0) {
        parent[find(indexed[force][1])] = find(indexed[force][2]);
        total = indexed[force][0];
        used = 1;
    }
    for (int j = 0; j < indexed.length; j++) {
        if (j == skip || j == force) continue;
        int ru = find(indexed[j][1]), rv = find(indexed[j][2]);
        if (ru != rv) { parent[ru] = rv; total += indexed[j][0]; used++; }
    }
    return used == n - 1 ? total : Integer.MAX_VALUE;
}`,
  },
  defaultInput: {
    n: 5,
    edges: [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 2],
      [0, 3, 2],
      [0, 4, 3],
    ],
  },
  run: runCriticalPseudoCriticalEdges,
  optimalApproachName: 'Kruskal Exclude / Force',
  approaches: [
    {
      id: 'equal-weight-bridges',
      name: 'Equal-Weight Groups + Bridges',
      timeComplexity: 'O(E log E + E · α(V))',
      spaceComplexity: 'O(V + E)',
      description:
        'Runs Kruskal exactly once instead of 2E times: process each equal-weight group together and use Tarjan bridge finding on the contracted component graph — bridges are critical, everything else that still merges something is pseudo-critical.',
      code: {
        python: `from collections import defaultdict

def findCriticalAndPseudoCriticalEdges(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def bridges(group):
        adj = defaultdict(list)
        for k in group:
            a, b = find(edges[k][0]), find(edges[k][1])
            adj[a].append((b, k))
            adj[b].append((a, k))
        disc, low, res, timer = {}, {}, set(), [0]

        def dfs(u, pe):
            disc[u] = low[u] = timer[0]
            timer[0] += 1
            for v, k in adj[u]:
                if k == pe:
                    continue
                if v in disc:
                    low[u] = min(low[u], disc[v])
                else:
                    dfs(v, k)
                    low[u] = min(low[u], low[v])
                    if low[v] > disc[u]:
                        res.add(k)

        for u in list(adj):
            if u not in disc:
                dfs(u, -1)
        return res

    order = sorted(range(len(edges)), key=lambda i: edges[i][2])
    critical, pseudo = [], []
    i = 0
    while i < len(order):
        j = i
        while j < len(order) and edges[order[j]][2] == edges[order[i]][2]:
            j += 1
        group = [k for k in order[i:j] if find(edges[k][0]) != find(edges[k][1])]
        br = bridges(group)
        for k in group:
            (critical if k in br else pseudo).append(k)
        for k in group:
            parent[find(edges[k][0])] = find(edges[k][1])
        i = j
    return [sorted(critical), sorted(pseudo)]`,
        javascript: `function findCriticalAndPseudoCriticalEdges(n, edges) {
    const parent = Array.from({ length: n }, (_, x) => x);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };

    const bridges = (group) => {
        const adj = new Map();
        const add = (a, b, k) => {
            if (!adj.has(a)) adj.set(a, []);
            adj.get(a).push([b, k]);
        };
        for (const k of group) {
            const a = find(edges[k][0]), b = find(edges[k][1]);
            add(a, b, k); add(b, a, k);
        }
        const disc = new Map(), low = new Map(), res = new Set();
        let timer = 0;
        const dfs = (u, pe) => {
            disc.set(u, timer); low.set(u, timer); timer++;
            for (const [v, k] of adj.get(u) || []) {
                if (k === pe) continue;
                if (disc.has(v)) low.set(u, Math.min(low.get(u), disc.get(v)));
                else {
                    dfs(v, k);
                    low.set(u, Math.min(low.get(u), low.get(v)));
                    if (low.get(v) > disc.get(u)) res.add(k);
                }
            }
        };
        for (const u of adj.keys()) if (!disc.has(u)) dfs(u, -1);
        return res;
    };

    const order = edges.map((_, i) => i).sort((a, b) => edges[a][2] - edges[b][2]);
    const critical = [], pseudo = [];
    let i = 0;
    while (i < order.length) {
        let j = i;
        while (j < order.length && edges[order[j]][2] === edges[order[i]][2]) j++;
        const group = order.slice(i, j).filter(k => find(edges[k][0]) !== find(edges[k][1]));
        const br = bridges(group);
        for (const k of group) (br.has(k) ? critical : pseudo).push(k);
        for (const k of group) parent[find(edges[k][0])] = find(edges[k][1]);
        i = j;
    }
    return [critical.sort((a, b) => a - b), pseudo.sort((a, b) => a - b)];
}`,
        java: `public static List<List<Integer>> findCriticalAndPseudoCriticalEdges(int n, int[][] edges) {
    int m = edges.length;
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    Integer[] order = new Integer[m];
    for (int i = 0; i < m; i++) order[i] = i;
    Arrays.sort(order, (a, b) -> edges[a][2] - edges[b][2]);

    List<Integer> critical = new ArrayList<>(), pseudo = new ArrayList<>();
    int i = 0;
    while (i < m) {
        int j = i;
        while (j < m && edges[order[j]][2] == edges[order[i]][2]) j++;

        List<Integer> group = new ArrayList<>();
        for (int t = i; t < j; t++)
            if (find(edges[order[t]][0]) != find(edges[order[t]][1]))
                group.add(order[t]);

        Set<Integer> br = bridges(group, edges);
        for (int k : group) (br.contains(k) ? critical : pseudo).add(k);
        for (int k : group) parent[find(edges[k][0])] = find(edges[k][1]);
        i = j;
    }
    Collections.sort(critical);
    Collections.sort(pseudo);
    return Arrays.asList(critical, pseudo);
}

private static int[] parent;
private static Map<Integer, List<int[]>> adj;
private static Map<Integer, Integer> disc, low;
private static Set<Integer> bridgeSet;
private static int timer;

private static int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}

private static Set<Integer> bridges(List<Integer> group, int[][] edges) {
    adj = new HashMap<>();
    for (int k : group) {
        int a = find(edges[k][0]), b = find(edges[k][1]);
        adj.computeIfAbsent(a, z -> new ArrayList<>()).add(new int[]{b, k});
        adj.computeIfAbsent(b, z -> new ArrayList<>()).add(new int[]{a, k});
    }
    disc = new HashMap<>();
    low = new HashMap<>();
    bridgeSet = new HashSet<>();
    timer = 0;
    for (int u : new ArrayList<>(adj.keySet()))
        if (!disc.containsKey(u)) dfs(u, -1);
    return bridgeSet;
}

private static void dfs(int u, int pe) {
    disc.put(u, timer);
    low.put(u, timer);
    timer++;
    for (int[] e : adj.getOrDefault(u, new ArrayList<>())) {
        int v = e[0], k = e[1];
        if (k == pe) continue;
        if (disc.containsKey(v)) low.put(u, Math.min(low.get(u), disc.get(v)));
        else {
            dfs(v, k);
            low.put(u, Math.min(low.get(u), low.get(v)));
            if (low.get(v) > disc.get(u)) bridgeSet.add(k);
        }
    }
}`,
      },
      run: runCriticalPseudoCriticalEdgesBridges,
      lineExplanations: {
        python: {
          1: 'defaultdict creates the empty value on first touch, so no "is this key here?" check',
          3: 'Define function with vertex count and weighted edges',
          4: 'One Union-Find that survives the whole sweep',
          6: 'Find with path halving',
          12: 'Tarjan bridge finder over the contracted graph',
          13: 'Adjacency list keyed by DSU root',
          14: 'Only the current weight group participates',
          15: 'Contract endpoints to their component roots',
          16: 'Store neighbor plus the edge index',
          17: 'Undirected — add the reverse arc too',
          18: 'Discovery times, low-links, results, DFS clock',
          20: 'Depth-first search tracking the entry edge',
          21: 'Stamp discovery and low-link',
          22: 'Advance the clock',
          23: 'Walk every incident edge',
          24: 'Never bounce straight back along the entry edge',
          26: 'Already discovered — this is a back edge',
          27: 'Back edge lowers our low-link',
          29: 'Unvisited — recurse',
          30: 'Absorb the child low-link',
          31: 'Child cannot reach above u: the edge is a bridge',
          32: 'Record the bridge',
          34: 'Every component root in this group',
          35: 'Skip roots an earlier DFS already covered',
          36: 'Start a DFS from each unvisited root',
          37: 'Return the bridge edge indices',
          39: 'Edge indices sorted by weight',
          40: 'Result buckets',
          42: 'Sweep the sorted edges in equal-weight blocks',
          43: 'j walks to the end of the current weight block',
          44: 'Same weight — keep extending',
          46: 'Drop edges whose endpoints are already merged',
          47: 'Bridges of the contracted graph are the critical ones',
          48: 'Bucket each candidate',
          49: 'Bridge -> critical, otherwise pseudo-critical',
          50: 'Now merge the entire group into the DSU',
          52: 'Advance to the next weight block',
          53: 'Return both index lists',
        },
        javascript: {
          1: 'Define function with vertex count and weighted edges',
          2: 'One Union-Find that survives the whole sweep',
          3: 'Find with path halving',
          8: 'Tarjan bridge finder over the contracted graph',
          9: 'Adjacency map keyed by DSU root',
          10: 'Helper to append a directed arc',
          14: 'Only the current weight group participates',
          15: 'Contract endpoints to their component roots',
          16: 'Undirected — add both arcs',
          18: 'Discovery times, low-links, and the bridge set',
          19: 'DFS clock',
          20: 'Depth-first search tracking the entry edge',
          21: 'Stamp discovery and low-link, advance the clock',
          22: 'Walk every incident edge',
          23: 'Never bounce straight back along the entry edge',
          24: 'Back edge lowers our low-link',
          26: 'Unvisited — recurse',
          27: 'Absorb the child low-link',
          28: 'Child cannot reach above u: bridge found',
          32: 'Start a DFS from each unvisited root',
          33: 'Return the bridge edge indices',
          36: 'Edge indices sorted by weight',
          37: 'Result buckets',
          39: 'Sweep the sorted edges in equal-weight blocks',
          41: 'j walks to the end of the current weight block',
          42: 'Drop edges whose endpoints are already merged',
          43: 'Bridges of the contracted graph are the critical ones',
          44: 'Bridge -> critical, otherwise pseudo-critical',
          45: 'Now merge the entire group into the DSU',
          48: 'Return both index lists, sorted',
        },
        java: {
          1: 'Define method with vertex count and weighted edges',
          3: 'One Union-Find that survives the whole sweep',
          6: 'Edge indices we will sort by weight',
          8: 'Sort indices by edge weight',
          10: 'Result buckets',
          12: 'Sweep the sorted edges in equal-weight blocks',
          14: 'j walks to the end of the current weight block',
          16: 'Candidates in this weight block',
          18: 'Drop edges whose endpoints are already merged',
          21: 'Bridges of the contracted graph are the critical ones',
          22: 'Bridge -> critical, otherwise pseudo-critical',
          23: 'Now merge the entire group into the DSU',
          26: 'Return both index lists, sorted',
          32: 'Shared Union-Find parent array',
          38: 'Find with path halving',
          43: 'Tarjan bridge finder over the contracted graph',
          45: 'Build the adjacency list from component roots',
          52: 'Reset the DFS clock and bookkeeping',
          56: 'Start a DFS from each unvisited root',
          58: 'Return the bridge edge indices',
          61: 'Depth-first search tracking the entry edge',
          62: 'Stamp discovery time',
          65: 'Walk every incident edge',
          67: 'Never bounce straight back along the entry edge',
          68: 'Back edge lowers our low-link',
          70: 'Unvisited — recurse',
          71: 'Absorb the child low-link',
          72: 'Child cannot reach above u: bridge found',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function with vertex count and weighted edges',
      2: 'Keep the original index alongside each edge',
      3: 'Kruskal needs edges in increasing weight order',
      5: 'Build an MST, optionally skipping or forcing one edge',
      6: 'Fresh Union-Find for every rebuild',
      8: 'Find with path halving',
      14: 'Running weight and count of accepted edges',
      15: 'Forcing an edge means taking it before anything else',
      17: 'Union its endpoints up front',
      18: 'Seed the totals with the forced edge',
      19: 'Now run ordinary Kruskal over the rest',
      20: 'Honor the skipped and already-forced slots',
      22: 'Component roots of this edge',
      23: 'Different components — accept the edge',
      24: 'Union them',
      25: 'Add the weight',
      27: 'Infinity if the graph never became spanning',
      29: 'Baseline: the true MST weight',
      31: 'Test every edge once',
      32: 'Deleting it makes things worse (or disconnects)',
      33: 'So it belongs to every MST — critical',
      34: 'Otherwise force it and see if the weight still matches',
      35: 'It fits into some MST — pseudo-critical',
      36: 'Return both index lists',
    },
    javascript: {
      1: 'Define function with vertex count and weighted edges',
      2: 'Keep the original index alongside each edge',
      3: 'Kruskal needs edges in increasing weight order',
      5: 'Build an MST, optionally skipping or forcing one edge',
      6: 'Fresh Union-Find for every rebuild',
      7: 'Find with path halving',
      11: 'Running weight and count of accepted edges',
      12: 'Forcing an edge means taking it before anything else',
      14: 'Union its endpoints up front',
      15: 'Seed the totals with the forced edge',
      17: 'Now run ordinary Kruskal over the rest',
      18: 'Honor the skipped and already-forced slots',
      20: 'Component roots of this edge',
      21: 'Different components — accept, union, add weight',
      23: 'Infinity if the graph never became spanning',
      26: 'Baseline: the true MST weight',
      27: 'Result buckets',
      28: 'Test every edge once',
      29: 'Deleting it makes things worse — critical',
      30: 'Forcing it still hits the baseline — pseudo-critical',
      32: 'Return both index lists',
    },
    java: {
      1: 'Define method with vertex count and weighted edges',
      3: 'Rows of {weight, u, v, originalIndex}',
      4: 'Copy each edge with its original index',
      6: 'Kruskal needs edges in increasing weight order',
      8: 'Baseline: the true MST weight',
      9: 'Result buckets',
      10: 'Test every edge once',
      11: 'Deleting it makes things worse — critical',
      12: 'Forcing it still hits the baseline — pseudo-critical',
      14: 'Return both index lists',
      17: 'Shared Union-Find parent array',
      19: 'Find with path halving',
      24: 'Build an MST, optionally skipping or forcing one edge',
      25: 'Fresh Union-Find for every rebuild',
      27: 'Running weight and count of accepted edges',
      28: 'Forcing an edge means taking it before anything else',
      29: 'Union its endpoints up front',
      33: 'Now run ordinary Kruskal over the rest',
      34: 'Honor the skipped and already-forced slots',
      35: 'Component roots of this edge',
      36: 'Different components — accept, union, add weight',
      38: 'MAX_VALUE if the graph never became spanning',
    },
  },
};
