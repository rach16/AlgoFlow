import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface GcdTraversalInput {
  nums: number[];
}

function primeFactors(value: number): number[] {
  const out: number[] = [];
  let num = value;
  let d = 2;
  while (d * d <= num) {
    if (num % d === 0) {
      out.push(d);
      while (num % d === 0) num = Math.floor(num / d);
    }
    d += 1;
  }
  if (num > 1) out.push(num);
  return out;
}

/** Bipartite graph: one node per array index, one node per distinct prime. */
function buildGcdGraph(nums: number[]) {
  const allPrimes: number[] = [];
  for (const v of nums) {
    for (const p of primeFactors(v)) {
      if (!allPrimes.includes(p)) allPrimes.push(p);
    }
  }
  allPrimes.sort((a, b) => a - b);

  const nodes = [
    ...nums.map((v, i) => ({ id: `i${i}`, label: `${v}` })),
    ...allPrimes.map(p => ({ id: `p${p}`, label: `p${p}` })),
  ];
  const edges: { from: string; to: string }[] = [];
  nums.forEach((v, i) => {
    for (const p of primeFactors(v)) edges.push({ from: `i${i}`, to: `p${p}` });
  });

  return { graph: { nodes, edges }, allPrimes };
}

function runGcdTraversal(input: unknown): AlgorithmStep[] {
  const { nums } = input as GcdTraversalInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const { graph } = buildGcdGraph(nums);

  const parent: Record<string, string> = {};
  const find = (x: string): string => {
    if (parent[x] === undefined) parent[x] = x;
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  const rootsMap = () =>
    Object.fromEntries(
      nums.map((v, i) => [`nums[${i}] = ${v}`, `group ${find(`i${i}`)}`])
    ) as Record<string, string>;

  const unionedEdges: [string, string][] = [];
  const doneIdx: string[] = [];

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: [],
      graphSecondary: [],
      graphVisitedEdges: [],
      result: 'Union-Find over indices AND primes',
    },
    highlights: [],
    message: `gcd(a, b) > 1 exactly when a and b share a prime factor. Never compare pairs — instead give every prime its own node and union each number with each of its primes.`,
    codeLine: 1,
  } as AlgorithmStep);

  if (n === 1) {
    steps.push({
      state: { graph, graphDirected: false, graphHighlights: ['i0'], result: 'true' },
      highlights: [],
      message: 'A single element is trivially connected to itself.',
      codeLine: 3,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  if (nums.includes(1)) {
    steps.push({
      state: { graph, graphDirected: false, graphHighlights: [], result: 'false' },
      highlights: [],
      message: 'Some element equals 1. gcd(1, x) = 1 always, so that index can never be reached.',
      codeLine: 5,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const primes = primeFactors(nums[i]);

    steps.push({
      state: {
        graph,
        graphDirected: false,
        graphHighlights: [...doneIdx],
        graphSecondary: [`i${i}`],
        graphVisitedEdges: unionedEdges.map(e => [...e] as [string, string]),
        hashMap: rootsMap(),
        result: `${nums[i]} = ${primes.join(' × ')}`,
      },
      highlights: [],
      message: `Factor nums[${i}] = ${nums[i]} into primes ${primes.join(', ')}. Trial division up to √${nums[i]} is enough.`,
      codeLine: 23,
      action: 'compare',
    } as AlgorithmStep);

    for (const p of primes) {
      const merged = find(`i${i}`) !== find(`p${p}`);
      union(`i${i}`, `p${p}`);
      unionedEdges.push([`i${i}`, `p${p}`]);

      steps.push({
        state: {
          graph,
          graphDirected: false,
          graphHighlights: [...doneIdx, `i${i}`],
          graphSecondary: [`p${p}`],
          graphVisitedEdges: unionedEdges.map(e => [...e] as [string, string]),
          hashMap: rootsMap(),
          result: `union(index ${i}, prime ${p})`,
        },
        highlights: [],
        message: merged
          ? `union(nums[${i}], prime ${p}) — index ${i} joins prime ${p}'s group, so it can now hop to every other multiple of ${p}.`
          : `nums[${i}] and prime ${p} are already in the same group — the union is a no-op.`,
        codeLine: 25,
        action: 'insert',
      } as AlgorithmStep);
    }

    doneIdx.push(`i${i}`);
  }

  const root = find('i0');
  const ok = nums.every((_, i) => find(`i${i}`) === root);

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: ok ? nums.map((_, i) => `i${i}`) : [],
      graphSecondary: [],
      graphVisitedEdges: unionedEdges.map(e => [...e] as [string, string]),
      hashMap: rootsMap(),
      result: `${ok}`,
    },
    highlights: [],
    message: ok
      ? `Every index shares one root — the whole array is one connected component, so every pair is reachable. Answer: true.`
      : `Not every index reaches the root of index 0, so at least one pair is unreachable. Answer: false.`,
    codeLine: 33,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runGcdTraversalSieve(input: unknown): AlgorithmStep[] {
  const { nums } = input as GcdTraversalInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const { graph, allPrimes } = buildGcdGraph(nums);

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: [],
      graphSecondary: [],
      graphVisitedEdges: [],
      result: 'Sieve, group by prime, then one traversal',
    },
    highlights: [],
    message: `No Union-Find at all. Precompute a smallest-prime-factor sieve, bucket the indices by prime, then run a single DFS from index 0 over "same prime" buckets.`,
    codeLine: 1,
  } as AlgorithmStep);

  if (n === 1) {
    steps.push({
      state: { graph, graphDirected: false, graphHighlights: ['i0'], result: 'true' },
      highlights: [],
      message: 'A single element is trivially connected to itself.',
      codeLine: 4,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  if (nums.includes(1)) {
    steps.push({
      state: { graph, graphDirected: false, graphHighlights: [], result: 'false' },
      highlights: [],
      message: 'Some element equals 1. gcd(1, x) = 1 always, so that index can never be reached.',
      codeLine: 6,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  const limit = Math.max(...nums) + 1;

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: [],
      graphSecondary: allPrimes.map(p => `p${p}`),
      graphVisitedEdges: [],
      result: `primes ≤ ${limit - 1}: ${allPrimes.join(', ')}`,
    },
    highlights: [],
    message: `Sieve smallest prime factors up to ${limit - 1} once. After that, factoring any value costs O(log v) lookups instead of trial division.`,
    codeLine: 11,
    action: 'visit',
  } as AlgorithmStep);

  const primeToIdx: Record<number, number[]> = {};
  const idxToPrimes: Record<number, number[]> = {};
  const seenEdges: [string, string][] = [];

  for (let i = 0; i < n; i++) {
    const primes = primeFactors(nums[i]);
    idxToPrimes[i] = primes;
    for (const p of primes) {
      (primeToIdx[p] = primeToIdx[p] || []).push(i);
      seenEdges.push([`i${i}`, `p${p}`]);
    }

    steps.push({
      state: {
        graph,
        graphDirected: false,
        graphHighlights: [],
        graphSecondary: [`i${i}`, ...primes.map(p => `p${p}`)],
        graphVisitedEdges: seenEdges.map(e => [...e] as [string, string]),
        hashMap: Object.fromEntries(
          allPrimes.map(p => [`prime ${p}`, `indices [${(primeToIdx[p] || []).join(', ')}]`])
        ) as Record<string, string>,
        result: `${nums[i]} → primes ${primes.join(', ')}`,
      },
      highlights: [],
      message: `Peel nums[${i}] = ${nums[i]} with the sieve: primes ${primes.join(', ')}. Add index ${i} to each of those buckets.`,
      codeLine: 22,
      action: 'insert',
    } as AlgorithmStep);
  }

  const seen = new Set<number>([0]);
  const stack: number[] = [0];
  const usedEdges: [string, string][] = [];

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: ['i0'],
      graphSecondary: [],
      graphVisitedEdges: [],
      hashMap: Object.fromEntries(
        allPrimes.map(p => [`prime ${p}`, `indices [${(primeToIdx[p] || []).join(', ')}]`])
      ) as Record<string, string>,
      result: 'seen = {0}',
    },
    highlights: [],
    message: `Buckets are built. Now the connectivity question is just: does a DFS from index 0 touch all ${n} indices?`,
    codeLine: 28,
    action: 'visit',
  } as AlgorithmStep);

  while (stack.length > 0) {
    const i = stack.pop()!;
    const discovered: number[] = [];

    for (const p of idxToPrimes[i]) {
      usedEdges.push([`i${i}`, `p${p}`]);
      for (const j of primeToIdx[p]) {
        if (!seen.has(j)) {
          seen.add(j);
          stack.push(j);
          discovered.push(j);
          usedEdges.push([`i${j}`, `p${p}`]);
        }
      }
    }

    steps.push({
      state: {
        graph,
        graphDirected: false,
        graphHighlights: Array.from(seen).map(x => `i${x}`),
        graphSecondary: [`i${i}`],
        graphVisitedEdges: usedEdges.map(e => [...e] as [string, string]),
        hashMap: Object.fromEntries(
          allPrimes.map(p => [`prime ${p}`, `indices [${(primeToIdx[p] || []).join(', ')}]`])
        ) as Record<string, string>,
        result: `seen = {${Array.from(seen).sort((a, b) => a - b).join(', ')}}`,
      },
      highlights: [],
      message:
        discovered.length > 0
          ? `From index ${i} (= ${nums[i]}), its primes ${idxToPrimes[i].join(', ')} lead to new indices [${discovered.join(', ')}]. Reached ${seen.size}/${n}.`
          : `From index ${i} (= ${nums[i]}), every index sharing primes ${idxToPrimes[i].join(', ')} is already seen. Reached ${seen.size}/${n}.`,
      codeLine: 31,
      action: discovered.length > 0 ? 'insert' : 'compare',
    } as AlgorithmStep);
  }

  const ok = seen.size === n;

  steps.push({
    state: {
      graph,
      graphDirected: false,
      graphHighlights: Array.from(seen).map(x => `i${x}`),
      graphSecondary: [],
      graphVisitedEdges: usedEdges.map(e => [...e] as [string, string]),
      result: `${ok}`,
    },
    highlights: [],
    message: ok
      ? `The traversal reached all ${n} indices, so every pair is connected. Answer: true.`
      : `The traversal reached only ${seen.size} of ${n} indices — some pair is unreachable. Answer: false.`,
    codeLine: 37,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const gcdTraversal: Algorithm = {
  id: 'gcd-traversal',
  name: 'Greatest Common Divisor Traversal',
  category: 'Advanced Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(n·√max + n·α(n))',
  spaceComplexity: 'O(n + P)',
  pattern: 'Union-Find — union each number with its prime factors',
  description:
    'You are given a 0-indexed integer array nums. You can traverse between index i and index j if and only if gcd(nums[i], nums[j]) > 1. Return true if for every pair of indices i < j there exists a sequence of traversals connecting them, and false otherwise.',
  problemUrl: 'https://leetcode.com/problems/greatest-common-divisor-traversal/',
  code: {
    python: `def canTraverseAllPairs(nums):
    if len(nums) == 1:
        return True
    if 1 in nums:
        return False

    parent = {}

    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for i, num in enumerate(nums):
        d = 2
        while d * d <= num:
            if num % d == 0:
                union(i, ('p', d))
                while num % d == 0:
                    num //= d
            d += 1
        if num > 1:
            union(i, ('p', num))

    root = find(0)
    return all(find(i) == root for i in range(len(nums)))`,
    javascript: `function canTraverseAllPairs(nums) {
    if (nums.length === 1) return true;
    if (nums.includes(1)) return false;

    const parent = new Map();
    const find = (x) => {
        if (!parent.has(x)) parent.set(x, x);
        while (parent.get(x) !== x) {
            parent.set(x, parent.get(parent.get(x)));
            x = parent.get(x);
        }
        return x;
    };
    const union = (a, b) => {
        const ra = find(a), rb = find(b);
        if (ra !== rb) parent.set(ra, rb);
    };

    nums.forEach((value, i) => {
        let num = value, d = 2;
        while (d * d <= num) {
            if (num % d === 0) {
                union(\`i\${i}\`, \`p\${d}\`);
                while (num % d === 0) num /= d;
            }
            d++;
        }
        if (num > 1) union(\`i\${i}\`, \`p\${num}\`);
    });

    const root = find('i0');
    return nums.every((_, i) => find(\`i\${i}\`) === root);
}`,
    java: `public static boolean canTraverseAllPairs(int[] nums) {
    if (nums.length == 1) return true;
    for (int v : nums) if (v == 1) return false;

    Map<String, String> parent = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        int num = nums[i];
        for (int d = 2; (long) d * d <= num; d++) {
            if (num % d == 0) {
                union(parent, "i" + i, "p" + d);
                while (num % d == 0) num /= d;
            }
        }
        if (num > 1) union(parent, "i" + i, "p" + num);
    }

    String root = find(parent, "i0");
    for (int i = 0; i < nums.length; i++)
        if (!find(parent, "i" + i).equals(root)) return false;
    return true;
}

private static String find(Map<String, String> parent, String x) {
    parent.putIfAbsent(x, x);
    while (!parent.get(x).equals(x)) {
        parent.put(x, parent.get(parent.get(x)));
        x = parent.get(x);
    }
    return x;
}

private static void union(Map<String, String> parent, String a, String b) {
    String ra = find(parent, a), rb = find(parent, b);
    if (!ra.equals(rb)) parent.put(ra, rb);
}`,
  },
  defaultInput: { nums: [2, 3, 6, 15, 10] },
  run: runGcdTraversal,
  optimalApproachName: 'Union-Find on Prime Factors',
  approaches: [
    {
      id: 'sieve-grouping-dfs',
      name: 'SPF Sieve + Traversal',
      timeComplexity: 'O(M log log M + n log max)',
      spaceComplexity: 'O(M + n)',
      description:
        'Drops Union-Find entirely: a smallest-prime-factor sieve factors every value in O(log v), the indices are bucketed by prime, and a single DFS over those buckets answers the connectivity question.',
      code: {
        python: `def canTraverseAllPairs(nums):
    n = len(nums)
    if n == 1:
        return True
    if 1 in nums:
        return False

    limit = max(nums) + 1
    spf = list(range(limit))
    p = 2
    while p * p < limit:
        if spf[p] == p:
            for m in range(p * p, limit, p):
                if spf[m] == m:
                    spf[m] = p
        p += 1

    primeToIdx = defaultdict(list)
    idxToPrimes = defaultdict(list)
    for i, num in enumerate(nums):
        while num > 1:
            f = spf[num]
            primeToIdx[f].append(i)
            idxToPrimes[i].append(f)
            while num % f == 0:
                num //= f

    seen = {0}
    stack = [0]
    while stack:
        i = stack.pop()
        for f in idxToPrimes[i]:
            for j in primeToIdx[f]:
                if j not in seen:
                    seen.add(j)
                    stack.append(j)
    return len(seen) == n`,
        javascript: `function canTraverseAllPairs(nums) {
    const n = nums.length;
    if (n === 1) return true;
    if (nums.includes(1)) return false;

    const limit = Math.max(...nums) + 1;
    const spf = Array.from({ length: limit }, (_, i) => i);
    for (let p = 2; p * p < limit; p++) {
        if (spf[p] !== p) continue;
        for (let m = p * p; m < limit; m += p) {
            if (spf[m] === m) spf[m] = p;
        }
    }

    const primeToIdx = new Map();
    const idxToPrimes = new Map();
    nums.forEach((value, i) => {
        let num = value;
        idxToPrimes.set(i, []);
        while (num > 1) {
            const f = spf[num];
            if (!primeToIdx.has(f)) primeToIdx.set(f, []);
            primeToIdx.get(f).push(i);
            idxToPrimes.get(i).push(f);
            while (num % f === 0) num /= f;
        }
    });

    const seen = new Set([0]);
    const stack = [0];
    while (stack.length) {
        const i = stack.pop();
        for (const f of idxToPrimes.get(i)) {
            for (const j of primeToIdx.get(f)) {
                if (!seen.has(j)) { seen.add(j); stack.push(j); }
            }
        }
    }
    return seen.size === n;
}`,
        java: `public static boolean canTraverseAllPairs(int[] nums) {
    int n = nums.length;
    if (n == 1) return true;
    for (int v : nums) if (v == 1) return false;

    int limit = 0;
    for (int v : nums) limit = Math.max(limit, v);
    limit++;

    int[] spf = new int[limit];
    for (int i = 0; i < limit; i++) spf[i] = i;
    for (int p = 2; (long) p * p < limit; p++) {
        if (spf[p] != p) continue;
        for (int m = p * p; m < limit; m += p)
            if (spf[m] == m) spf[m] = p;
    }

    Map<Integer, List<Integer>> primeToIdx = new HashMap<>();
    Map<Integer, List<Integer>> idxToPrimes = new HashMap<>();
    for (int i = 0; i < n; i++) {
        int num = nums[i];
        idxToPrimes.put(i, new ArrayList<>());
        while (num > 1) {
            int f = spf[num];
            primeToIdx.computeIfAbsent(f, z -> new ArrayList<>()).add(i);
            idxToPrimes.get(i).add(f);
            while (num % f == 0) num /= f;
        }
    }

    Set<Integer> seen = new HashSet<>(List.of(0));
    Deque<Integer> stack = new ArrayDeque<>(List.of(0));
    while (!stack.isEmpty()) {
        int i = stack.pop();
        for (int f : idxToPrimes.get(i))
            for (int j : primeToIdx.get(f))
                if (seen.add(j)) stack.push(j);
    }
    return seen.size() == n;
}`,
      },
      run: runGcdTraversalSieve,
      lineExplanations: {
        python: {
          1: 'Define function taking the array',
          2: 'Array length',
          3: 'A single element is trivially connected',
          5: 'A 1 shares no prime with anything',
          6: 'So the answer is false',
          8: 'Sieve bound is just past the largest value',
          9: 'spf[v] starts as v itself',
          11: 'Classic sieve loop',
          12: 'p is prime if nothing smaller marked it',
          13: 'Mark multiples starting at p*p',
          14: 'Only fill in the first (smallest) prime factor',
          15: 'Record it',
          18: 'prime -> list of indices containing it',
          19: 'index -> its distinct primes',
          20: 'Factor every value',
          21: 'Peel primes until the value is 1',
          22: 'Smallest prime factor, straight from the sieve',
          23: 'Bucket this index under the prime',
          24: 'And remember the prime for this index',
          25: 'Divide the prime out completely',
          28: 'Start the traversal at index 0',
          29: 'DFS stack',
          30: 'Standard iterative DFS',
          31: 'Pop the next index',
          32: 'Every prime of this value...',
          33: '...connects to every other index sharing it',
          34: 'New index?',
          35: 'Mark it seen',
          36: 'And explore from it later',
          37: 'Connected iff the DFS reached every index',
        },
        javascript: {
          1: 'Define function taking the array',
          2: 'Array length',
          3: 'A single element is trivially connected',
          4: 'A 1 shares no prime with anything',
          6: 'Sieve bound is just past the largest value',
          7: 'spf[v] starts as v itself',
          8: 'Classic sieve loop',
          9: 'p is prime if nothing smaller marked it',
          10: 'Mark multiples starting at p*p',
          11: 'Only fill in the first (smallest) prime factor',
          15: 'prime -> list of indices containing it',
          16: 'index -> its distinct primes',
          17: 'Factor every value',
          20: 'Peel primes until the value is 1',
          21: 'Smallest prime factor, straight from the sieve',
          23: 'Bucket this index under the prime',
          24: 'And remember the prime for this index',
          25: 'Divide the prime out completely',
          29: 'Start the traversal at index 0',
          30: 'DFS stack',
          31: 'Standard iterative DFS',
          32: 'Pop the next index',
          33: 'Every prime of this value...',
          34: '...connects to every other index sharing it',
          35: 'Mark and push anything new',
          39: 'Connected iff the DFS reached every index',
        },
        java: {
          1: 'Define method taking the array',
          2: 'Array length',
          3: 'A single element is trivially connected',
          4: 'A 1 shares no prime with anything',
          6: 'Find the largest value',
          8: 'Sieve bound is just past it',
          10: 'Smallest-prime-factor table',
          11: 'spf[v] starts as v itself',
          12: 'Classic sieve loop',
          13: 'p is prime if nothing smaller marked it',
          14: 'Mark multiples starting at p*p',
          15: 'Only fill in the first (smallest) prime factor',
          18: 'prime -> list of indices containing it',
          19: 'index -> its distinct primes',
          20: 'Factor every value',
          23: 'Peel primes until the value is 1',
          24: 'Smallest prime factor, straight from the sieve',
          25: 'Bucket this index under the prime',
          26: 'And remember the prime for this index',
          27: 'Divide the prime out completely',
          31: 'Start the traversal at index 0',
          32: 'DFS stack',
          33: 'Standard iterative DFS',
          34: 'Pop the next index',
          35: 'Every prime of this value...',
          36: '...connects to every other index sharing it',
          37: 'seen.add returns true only for new indices',
          39: 'Connected iff the DFS reached every index',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the array',
      2: 'A single element is trivially connected',
      3: 'Return true immediately',
      4: 'gcd(1, x) = 1, so a 1 can never be reached',
      5: 'Return false immediately',
      7: 'Union-Find over BOTH indices and prime labels',
      9: 'Find with path halving',
      10: 'Create the node lazily on first touch',
      16: 'Merge two groups',
      17: 'Locate both roots',
      18: 'Already together — nothing to do',
      19: 'Otherwise link one root under the other',
      21: 'Process every value',
      22: 'Trial division starts at 2',
      23: 'Only need divisors up to sqrt(num)',
      24: 'Found a prime factor',
      25: 'Link this index to that prime — the key move',
      26: 'Strip the factor out completely',
      28: 'Try the next candidate divisor',
      29: 'A leftover > 1 is itself prime',
      30: 'Link the index to it too',
      32: 'Root of the first index',
      33: 'Connected iff every index shares that root',
    },
    javascript: {
      1: 'Define function taking the array',
      2: 'A single element is trivially connected',
      3: 'gcd(1, x) = 1, so a 1 can never be reached',
      5: 'Union-Find over BOTH indices and prime labels',
      6: 'Find with path halving',
      7: 'Create the node lazily on first touch',
      14: 'Merge two groups',
      15: 'Locate both roots',
      16: 'Link one root under the other',
      19: 'Process every value',
      20: 'Trial division starts at 2',
      21: 'Only need divisors up to sqrt(num)',
      22: 'Found a prime factor',
      23: 'Link this index to that prime — the key move',
      24: 'Strip the factor out completely',
      28: 'A leftover > 1 is itself prime',
      31: 'Root of the first index',
      32: 'Connected iff every index shares that root',
    },
    java: {
      1: 'Define method taking the array',
      2: 'A single element is trivially connected',
      3: 'gcd(1, x) = 1, so a 1 can never be reached',
      5: 'Union-Find over BOTH indices and prime labels',
      7: 'Process every value',
      8: 'Work on a copy we can divide down',
      9: 'Only need divisors up to sqrt(num)',
      10: 'Found a prime factor',
      11: 'Link this index to that prime — the key move',
      12: 'Strip the factor out completely',
      15: 'A leftover > 1 is itself prime',
      18: 'Root of the first index',
      19: 'Check every index',
      20: 'A different root means some pair is unreachable',
      21: 'All indices connected',
      24: 'Find with path halving',
      25: 'Create the node lazily on first touch',
      33: 'Merge two groups',
      34: 'Locate both roots',
      35: 'Link one root under the other',
    },
  },
};
