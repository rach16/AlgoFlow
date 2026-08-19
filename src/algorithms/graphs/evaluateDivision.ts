import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface EvaluateDivisionInput {
  equations: string[][];
  values: number[];
  queries: string[][];
}

const fmt = (n: number): string => {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(5)).toString();
};

function buildDivisionGraph(
  equations: string[][],
  values: number[],
  highlights: string[] = [],
  secondary: string[] = [],
  visitedEdges: [string, string][] = []
) {
  const seen: string[] = [];
  for (const [a, b] of equations) {
    if (!seen.includes(a)) seen.push(a);
    if (!seen.includes(b)) seen.push(b);
  }
  return {
    graph: {
      nodes: seen.map(v => ({ id: v, label: v })),
      edges: equations.map(([a, b], i) => ({ from: a, to: b, weight: values[i] })),
    },
    graphHighlights: highlights,
    graphSecondary: secondary,
    graphVisitedEdges: visitedEdges,
    graphDirected: true,
  };
}

function runEvaluateDivision(input: unknown): AlgorithmStep[] {
  const { equations, values, queries } = input as EvaluateDivisionInput;
  const steps: AlgorithmStep[] = [];

  const graph = new Map<string, Map<string, number>>();
  const add = (a: string, b: string, v: number) => {
    if (!graph.has(a)) graph.set(a, new Map());
    graph.get(a)!.set(b, v);
  };

  steps.push({
    state: {
      ...buildDivisionGraph(equations, values),
      result: 'Answering ratio queries...',
    },
    highlights: [],
    message: `Each equation a / b = v is an edge a → b weighted v (and b → a weighted 1/v). A query c / d is then just "walk from c to d and multiply the weights you cross".`,
    codeLine: 1,
  } as AlgorithmStep);

  equations.forEach(([a, b], i) => {
    add(a, b, values[i]);
    add(b, a, 1 / values[i]);

    steps.push({
      state: {
        ...buildDivisionGraph(equations, values, [a, b], [], equations.slice(0, i + 1).map(([x, y]) => [x, y] as [string, string])),
        hashMap: { [`${a} / ${b}`]: fmt(values[i]), [`${b} / ${a}`]: fmt(1 / values[i]) },
        result: `Edge added: ${a} → ${b} = ${fmt(values[i])}`,
      },
      highlights: [],
      message: `${a} / ${b} = ${fmt(values[i])}, so store the edge ${a} → ${b} with weight ${fmt(values[i])} and the mirror ${b} → ${a} with weight ${fmt(1 / values[i])}.`,
      codeLine: 5,
      action: 'insert',
    } as AlgorithmStep);
  });

  const allEdges: [string, string][] = equations.map(([a, b]) => [a, b]);
  const answers: number[] = [];

  function dfs(src: string, dst: string, product: number, visited: Set<string>, path: string[]): number {
    if (src === dst) return product;
    visited.add(src);
    for (const [nei, w] of graph.get(src)!) {
      if (visited.has(nei)) continue;

      const nextProduct = product * w;
      path.push(nei);

      steps.push({
        state: {
          ...buildDivisionGraph(equations, values, [nei], [...path.slice(0, -1)], allEdges),
          hashMap: { path: path.join(' → '), product: fmt(nextProduct) },
          result: `Running product: ${fmt(nextProduct)}`,
        },
        highlights: [],
        message:
          nei === dst
            ? `Cross ${src} → ${nei} (×${fmt(w)}) and land on the target: ${path.join(' → ')} = ${fmt(nextProduct)}.`
            : `Cross ${src} → ${nei} (×${fmt(w)}). Running product is now ${fmt(nextProduct)}; still hunting for ${dst}.`,
        codeLine: nei === dst ? 11 : 15,
        action: nei === dst ? 'found' : 'visit',
      } as AlgorithmStep);

      const res = dfs(nei, dst, nextProduct, visited, path);
      if (res !== -1.0) return res;

      path.pop();

      steps.push({
        state: {
          ...buildDivisionGraph(equations, values, [src], [...path], allEdges),
          hashMap: { path: path.join(' → '), product: fmt(product) },
          result: `Backtracked from ${nei}`,
        },
        highlights: [],
        message: `Dead end past ${nei} — undo the ×${fmt(w)} and back up to ${src}.`,
        codeLine: 18,
        action: 'pop',
      } as AlgorithmStep);
    }
    return -1.0;
  }

  for (const [a, b] of queries) {
    if (!graph.has(a) || !graph.has(b)) {
      answers.push(-1.0);

      steps.push({
        state: {
          ...buildDivisionGraph(equations, values, [], [], allEdges),
          result: `Answers so far: [${answers.map(fmt).join(', ')}]`,
        },
        highlights: [],
        message: `Query ${a} / ${b}: ${!graph.has(a) ? `"${a}"` : `"${b}"`} never appears in any equation, so the ratio is undefined → -1.`,
        codeLine: 9,
        action: 'compare',
      } as AlgorithmStep);
      continue;
    }

    steps.push({
      state: {
        ...buildDivisionGraph(equations, values, [a], [b], allEdges),
        hashMap: { path: a, product: '1' },
        result: `Solving ${a} / ${b}`,
      },
      highlights: [],
      message: `Query ${a} / ${b}: start a DFS at ${a} with running product 1 and try to reach ${b}.`,
      codeLine: 20,
      action: 'compare',
    } as AlgorithmStep);

    const ans = dfs(a, b, 1.0, new Set<string>(), [a]);
    answers.push(ans);

    steps.push({
      state: {
        ...buildDivisionGraph(equations, values, [a, b], [], allEdges),
        result: `Answers so far: [${answers.map(fmt).join(', ')}]`,
      },
      highlights: [],
      message: ans === -1.0
        ? `No path from ${a} to ${b} — the two variables live in different components → -1.`
        : `${a} / ${b} = ${fmt(ans)}.`,
      codeLine: ans === -1.0 ? 18 : 11,
      action: 'found',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      ...buildDivisionGraph(equations, values, [], [], allEdges),
      result: `[${answers.map(fmt).join(', ')}]`,
    },
    highlights: [],
    message: `Done! Answers: [${answers.map(fmt).join(', ')}]. Each query costs a fresh O(V+E) walk.`,
    codeLine: 20,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runEvaluateDivisionUnionFind(input: unknown): AlgorithmStep[] {
  const { equations, values, queries } = input as EvaluateDivisionInput;
  const steps: AlgorithmStep[] = [];

  // weight[x] = value of x divided by value of parent[x]
  const parent = new Map<string, string>();
  const weight = new Map<string, number>();
  const order: string[] = [];

  function find(x: string): string | null {
    if (!parent.has(x)) return null;
    if (parent.get(x) !== x) {
      const p = parent.get(x)!;
      const root = find(p)!;
      weight.set(x, weight.get(x)! * weight.get(p)!);
      parent.set(x, root);
    }
    return parent.get(x)!;
  }

  const ufMap = () =>
    Object.fromEntries(order.map(v => [v, `${v}/${parent.get(v)} = ${fmt(weight.get(v)!)}`]));

  const register = (v: string) => {
    if (!parent.has(v)) {
      parent.set(v, v);
      weight.set(v, 1.0);
      order.push(v);
      return true;
    }
    return false;
  };

  steps.push({
    state: {
      ...buildDivisionGraph(equations, values),
      result: 'Answering ratio queries...',
    },
    highlights: [],
    message: `Weighted Union-Find: store weight[x] = x / parent[x]. Collapse every variable onto one root, then any query is a single division — no per-query graph walk.`,
    codeLine: 1,
  } as AlgorithmStep);

  equations.forEach(([a, b], i) => {
    const v = values[i];
    register(a);
    register(b);

    steps.push({
      state: {
        ...buildDivisionGraph(equations, values, [a, b], [], equations.slice(0, i).map(([x, y]) => [x, y] as [string, string])),
        hashMap: ufMap(),
        result: `Registering ${a} and ${b}`,
      },
      highlights: [],
      message: `Equation ${a} / ${b} = ${fmt(v)}. Any unseen variable starts as its own root with weight 1.`,
      codeLine: 15,
      action: 'insert',
    } as AlgorithmStep);

    const ra = find(a)!;
    const rb = find(b)!;
    if (ra !== rb) {
      parent.set(ra, rb);
      weight.set(ra, (v * weight.get(b)!) / weight.get(a)!);
    }

    steps.push({
      state: {
        ...buildDivisionGraph(equations, values, [a, b], [ra, rb], equations.slice(0, i + 1).map(([x, y]) => [x, y] as [string, string])),
        hashMap: ufMap(),
        result: ra !== rb ? `union: root ${ra} → ${rb}` : `${a} and ${b} already share root ${ra}`,
      },
      highlights: [],
      message:
        ra !== rb
          ? `Hang root ${ra} under root ${rb} with weight ${ra}/${rb} = ${fmt(v)} · (${b}/${rb}) / (${a}/${ra}) = ${fmt(weight.get(ra)!)}. The ratio is stored on the edge, not recomputed later.`
          : `${a} and ${b} already share root ${ra}, so this equation adds no new information.`,
      codeLine: 20,
      action: 'insert',
    } as AlgorithmStep);
  });

  const allEdges: [string, string][] = equations.map(([a, b]) => [a, b]);
  const answers: number[] = [];

  for (const [a, b] of queries) {
    if (!parent.has(a) || !parent.has(b)) {
      answers.push(-1.0);

      steps.push({
        state: {
          ...buildDivisionGraph(equations, values, [], [], allEdges),
          hashMap: ufMap(),
          result: `Answers so far: [${answers.map(fmt).join(', ')}]`,
        },
        highlights: [],
        message: `Query ${a} / ${b}: ${!parent.has(a) ? `"${a}"` : `"${b}"`} was never registered → -1.`,
        codeLine: 25,
        action: 'compare',
      } as AlgorithmStep);
      continue;
    }

    const ra = find(a)!;
    const rb = find(b)!;
    const ans = ra === rb ? weight.get(a)! / weight.get(b)! : -1.0;
    answers.push(ans);

    steps.push({
      state: {
        ...buildDivisionGraph(equations, values, [a, b], [ra], allEdges),
        hashMap: ufMap(),
        result: `Answers so far: [${answers.map(fmt).join(', ')}]`,
      },
      highlights: [],
      message:
        ra === rb
          ? `Query ${a} / ${b}: both compress to root ${ra}, where ${a}/${ra} = ${fmt(weight.get(a)!)} and ${b}/${ra} = ${fmt(weight.get(b)!)}. Divide → ${fmt(ans)}.`
          : `Query ${a} / ${b}: roots differ (${ra} vs ${rb}) — no chain of equations connects them → -1.`,
      codeLine: ra === rb ? 27 : 25,
      action: ra === rb ? 'found' : 'compare',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      ...buildDivisionGraph(equations, values, [], [], allEdges),
      hashMap: ufMap(),
      result: `[${answers.map(fmt).join(', ')}]`,
    },
    highlights: [],
    message: `Done! Same answers [${answers.map(fmt).join(', ')}], but each query was one near-O(1) lookup instead of a full DFS.`,
    codeLine: 28,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const evaluateDivision: Algorithm = {
  id: 'evaluate-division',
  name: 'Evaluate Division',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(q·(V+E))',
  spaceComplexity: 'O(V+E)',
  pattern: 'DFS — multiply edge ratios along the path between variables',
  description:
    'You are given equations like a / b = 2.0 and a list of queries such as a / c. Model each equation as a weighted edge (a → b with weight 2.0 and b → a with weight 0.5), then answer each query by multiplying the weights along a path. Return -1.0 when no path exists.',
  problemUrl: 'https://leetcode.com/problems/evaluate-division/',
  code: {
    python: `def calcEquation(equations, values, queries):
    graph = defaultdict(dict)
    for (a, b), v in zip(equations, values):
        graph[a][b] = v
        graph[b][a] = 1 / v

    def dfs(src, dst, product, visited):
        if src not in graph or dst not in graph:
            return -1.0
        if src == dst:
            return product
        visited.add(src)
        for nei, w in graph[src].items():
            if nei not in visited:
                res = dfs(nei, dst, product * w, visited)
                if res != -1.0:
                    return res
        return -1.0

    return [dfs(a, b, 1.0, set()) for a, b in queries]`,
    javascript: `function calcEquation(equations, values, queries) {
    const graph = new Map();
    const add = (a, b, v) => {
        if (!graph.has(a)) graph.set(a, new Map());
        graph.get(a).set(b, v);
    };
    equations.forEach(([a, b], i) => {
        add(a, b, values[i]);
        add(b, a, 1 / values[i]);
    });

    function dfs(src, dst, product, visited) {
        if (!graph.has(src) || !graph.has(dst)) return -1.0;
        if (src === dst) return product;
        visited.add(src);
        for (const [nei, w] of graph.get(src)) {
            if (visited.has(nei)) continue;
            const res = dfs(nei, dst, product * w, visited);
            if (res !== -1.0) return res;
        }
        return -1.0;
    }
    return queries.map(([a, b]) => dfs(a, b, 1.0, new Set()));
}`,
    java: `public static double[] calcEquation(List<List<String>> equations, double[] values,
                                    List<List<String>> queries) {
    Map<String, Map<String, Double>> graph = new HashMap<>();
    for (int i = 0; i < values.length; i++) {
        String a = equations.get(i).get(0), b = equations.get(i).get(1);
        graph.computeIfAbsent(a, k -> new HashMap<>()).put(b, values[i]);
        graph.computeIfAbsent(b, k -> new HashMap<>()).put(a, 1.0 / values[i]);
    }

    double[] res = new double[queries.size()];
    for (int i = 0; i < queries.size(); i++) {
        res[i] = dfs(queries.get(i).get(0), queries.get(i).get(1),
                     1.0, new HashSet<>(), graph);
    }
    return res;
}

private static double dfs(String src, String dst, double product,
                          Set<String> visited, Map<String, Map<String, Double>> graph) {
    if (!graph.containsKey(src) || !graph.containsKey(dst)) return -1.0;
    if (src.equals(dst)) return product;
    visited.add(src);
    for (Map.Entry<String, Double> e : graph.get(src).entrySet()) {
        if (visited.contains(e.getKey())) continue;
        double r = dfs(e.getKey(), dst, product * e.getValue(), visited, graph);
        if (r != -1.0) return r;
    }
    return -1.0;
}`,
  },
  defaultInput: {
    equations: [['a', 'b'], ['b', 'c'], ['c', 'd']],
    values: [2.0, 3.0, 4.0],
    queries: [['a', 'd'], ['b', 'd'], ['a', 'e']],
  },
  run: runEvaluateDivision,
  optimalApproachName: 'Weighted Graph DFS',
  approaches: [
    {
      id: 'weighted-union-find',
      name: 'Weighted Union-Find',
      timeComplexity: 'O((E + q)·log V)',
      spaceComplexity: 'O(V)',
      description:
        'Rather than re-walking the graph for every query, store each variable\'s ratio to its parent and compress paths — after the equations are absorbed, a query is a single division of two stored weights.',
      code: {
        python: `def calcEquation(equations, values, queries):
    parent = {}
    weight = {}   # weight[x] = x / parent[x]

    def find(x):
        if x not in parent:
            return None
        if parent[x] != x:
            root = find(parent[x])
            weight[x] *= weight[parent[x]]
            parent[x] = root
        return parent[x]

    for (a, b), v in zip(equations, values):
        parent.setdefault(a, a); weight.setdefault(a, 1.0)
        parent.setdefault(b, b); weight.setdefault(b, 1.0)
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            weight[ra] = v * weight[b] / weight[a]

    res = []
    for a, b in queries:
        if a not in parent or b not in parent or find(a) != find(b):
            res.append(-1.0)
        else:
            res.append(weight[a] / weight[b])
    return res`,
        javascript: `function calcEquation(equations, values, queries) {
    const parent = new Map(), weight = new Map();

    function find(x) {
        if (!parent.has(x)) return null;
        if (parent.get(x) !== x) {
            const p = parent.get(x);
            const root = find(p);
            weight.set(x, weight.get(x) * weight.get(p));
            parent.set(x, root);
        }
        return parent.get(x);
    }

    equations.forEach(([a, b], i) => {
        if (!parent.has(a)) { parent.set(a, a); weight.set(a, 1.0); }
        if (!parent.has(b)) { parent.set(b, b); weight.set(b, 1.0); }
        const ra = find(a), rb = find(b);
        if (ra !== rb) {
            parent.set(ra, rb);
            weight.set(ra, values[i] * weight.get(b) / weight.get(a));
        }
    });

    return queries.map(([a, b]) => {
        if (!parent.has(a) || !parent.has(b)) return -1.0;
        if (find(a) !== find(b)) return -1.0;
        return weight.get(a) / weight.get(b);
    });
}`,
        java: `public static double[] calcEquation(List<List<String>> equations, double[] values,
                                    List<List<String>> queries) {
    Map<String, String> parent = new HashMap<>();
    Map<String, Double> weight = new HashMap<>();

    for (int i = 0; i < values.length; i++) {
        String a = equations.get(i).get(0), b = equations.get(i).get(1);
        parent.putIfAbsent(a, a); weight.putIfAbsent(a, 1.0);
        parent.putIfAbsent(b, b); weight.putIfAbsent(b, 1.0);
        String ra = find(a, parent, weight), rb = find(b, parent, weight);
        if (!ra.equals(rb)) {
            parent.put(ra, rb);
            weight.put(ra, values[i] * weight.get(b) / weight.get(a));
        }
    }

    double[] res = new double[queries.size()];
    for (int i = 0; i < queries.size(); i++) {
        String a = queries.get(i).get(0), b = queries.get(i).get(1);
        if (!parent.containsKey(a) || !parent.containsKey(b)
                || !find(a, parent, weight).equals(find(b, parent, weight))) {
            res[i] = -1.0;
        } else {
            res[i] = weight.get(a) / weight.get(b);
        }
    }
    return res;
}

private static String find(String x, Map<String, String> parent, Map<String, Double> weight) {
    if (!parent.get(x).equals(x)) {
        String p = parent.get(x);
        String root = find(p, parent, weight);
        weight.put(x, weight.get(x) * weight.get(p));
        parent.put(x, root);
    }
    return parent.get(x);
}`,
      },
      run: runEvaluateDivisionUnionFind,
      lineExplanations: {
        python: {
          1: 'Equations, their values, and the queries',
          2: 'Union-Find parent pointer per variable',
          3: 'weight[x] is the ratio x / parent[x]',
          5: 'Find the root and compress the path',
          6: 'Unknown variable has no root at all',
          7: 'Signal "never seen this symbol"',
          8: 'Not a root yet — keep climbing',
          9: 'Recurse first so the parent weight is final',
          10: 'Multiply in the parent ratio: x/root = x/p · p/root',
          11: 'Point straight at the root now',
          12: 'Return the representative variable',
          14: 'Absorb each equation a / b = v',
          15: 'Register a as its own root if new',
          16: 'Register b as its own root if new',
          17: 'Locate both current roots',
          18: 'Only merge when they differ',
          19: 'Hang a root under b root',
          20: 'Edge weight makes a / b come out to v',
          22: 'Collect one answer per query',
          23: 'Walk the queries',
          24: 'Unknown symbol or different components?',
          25: 'Then the ratio is undefined',
          27: 'Same root: divide the two stored ratios',
          28: 'Return all answers',
        },
        javascript: {
          1: 'Equations, their values, and the queries',
          2: 'Parent pointers and ratio-to-parent weights',
          4: 'Find the root and compress the path',
          5: 'Unknown variable has no root at all',
          6: 'Not a root yet — keep climbing',
          7: 'Remember the current parent',
          8: 'Recurse first so the parent weight is final',
          9: 'Multiply in the parent ratio',
          10: 'Point straight at the root now',
          12: 'Return the representative variable',
          15: 'Absorb each equation a / b = v',
          16: 'Register a as its own root if new',
          17: 'Register b as its own root if new',
          18: 'Locate both current roots',
          19: 'Only merge when they differ',
          20: 'Hang a root under b root',
          21: 'Edge weight makes a / b come out to v',
          25: 'Answer every query',
          26: 'Unknown symbol → undefined ratio',
          27: 'Different components → undefined ratio',
          28: 'Same root: divide the two stored ratios',
        },
        java: {
          1: 'Equations and their values',
          2: 'Query pairs to answer',
          3: 'Union-Find parent pointer per variable',
          4: 'weight is the ratio variable / parent',
          6: 'Absorb each equation a / b = v',
          7: 'Pull the two variable names',
          8: 'Register a as its own root if new',
          9: 'Register b as its own root if new',
          10: 'Locate both current roots',
          11: 'Only merge when they differ',
          12: 'Hang a root under b root',
          13: 'Edge weight makes a / b come out to v',
          17: 'One answer per query',
          18: 'Walk the queries',
          19: 'Pull the two variable names',
          20: 'Unknown symbol...',
          21: '...or different components',
          22: 'Then the ratio is undefined',
          24: 'Same root: divide the two stored ratios',
          27: 'Return all answers',
          30: 'Find the root and compress the path',
          31: 'Not a root yet — keep climbing',
          32: 'Remember the current parent',
          33: 'Recurse first so the parent weight is final',
          34: 'Multiply in the parent ratio',
          35: 'Point straight at the root now',
          37: 'Return the representative variable',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Equations, their values, and the queries',
      2: 'Adjacency map of variable -> {neighbour: ratio}',
      3: 'Pair each equation with its value',
      4: 'a / b = v becomes edge a → b weighted v',
      5: 'The reverse edge carries the reciprocal',
      7: 'DFS carrying the product accumulated so far',
      8: 'A variable never seen in any equation...',
      9: '...makes the query unanswerable',
      10: 'Reached the destination variable',
      11: 'The accumulated product IS the ratio',
      12: 'Mark src so the walk cannot loop',
      13: 'Try every neighbour and its ratio',
      14: 'Skip variables already on the path',
      15: 'Recurse, folding this edge into the product',
      16: 'A real answer came back',
      17: 'Bubble it straight up',
      18: 'Exhausted this branch: no path',
      20: 'Run one fresh DFS per query',
    },
    javascript: {
      1: 'Equations, their values, and the queries',
      2: 'Adjacency map of variable -> Map(neighbour, ratio)',
      3: 'Helper to insert one directed weighted edge',
      4: 'Create the neighbour map on first sight',
      5: 'Store the ratio on the edge',
      7: 'Walk the equations with their index',
      8: 'a / b = v becomes edge a → b weighted v',
      9: 'The reverse edge carries the reciprocal',
      12: 'DFS carrying the product accumulated so far',
      13: 'Unknown variable makes the query unanswerable',
      14: 'Reached the destination — product is the ratio',
      15: 'Mark src so the walk cannot loop',
      16: 'Try every neighbour and its ratio',
      17: 'Skip variables already on the path',
      18: 'Recurse, folding this edge into the product',
      19: 'A real answer came back — bubble it up',
      21: 'Exhausted this branch: no path',
      23: 'Run one fresh DFS per query',
    },
    java: {
      1: 'Equations and their values',
      2: 'Query pairs to answer',
      3: 'Adjacency map of variable -> {neighbour: ratio}',
      4: 'Walk the equations',
      5: 'Pull the two variable names',
      6: 'a / b = v becomes edge a → b weighted v',
      7: 'The reverse edge carries the reciprocal',
      10: 'One answer per query',
      11: 'Walk the queries',
      12: 'Run a fresh DFS for this query',
      13: 'Start with product 1 and an empty visited set',
      15: 'Return all answers',
      18: 'DFS carrying the product accumulated so far',
      20: 'Unknown variable makes the query unanswerable',
      21: 'Reached the destination — product is the ratio',
      22: 'Mark src so the walk cannot loop',
      23: 'Try every neighbour and its ratio',
      24: 'Skip variables already on the path',
      25: 'Recurse, folding this edge into the product',
      26: 'A real answer came back — bubble it up',
      28: 'Exhausted this branch: no path',
    },
  },
};
