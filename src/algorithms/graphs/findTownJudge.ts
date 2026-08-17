import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type JudgeInput = { n: number; trust: number[][] };

function makeGraphBuilder(n: number, trust: number[][]) {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: i + 1, label: `${i + 1}` }));
  const edges = trust.map(([a, b]) => ({ from: a, to: b }));

  return function buildGraphState(
    highlights: number[] = [],
    secondary: number[] = [],
    visitedEdges: [number, number][] = []
  ) {
    return {
      graph: { nodes: nodes.map(nd => ({ ...nd })), edges: edges.map(e => ({ ...e })) },
      graphHighlights: highlights,
      graphSecondary: secondary,
      graphVisitedEdges: visitedEdges,
      graphDirected: true,
    };
  };
}

function runFindTownJudge(input: unknown): AlgorithmStep[] {
  const { n, trust } = input as JudgeInput;
  const steps: AlgorithmStep[] = [];
  const buildGraphState = makeGraphBuilder(n, trust);

  const score = new Array(n + 1).fill(0);
  const scoreMap = () => {
    const m: Record<string, number> = {};
    for (let i = 1; i <= n; i++) m[`person ${i}`] = score[i];
    return m;
  };

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: scoreMap(),
      result: 'searching for the judge...',
    },
    highlights: [],
    message: `The judge is trusted by all ${n - 1} others and trusts nobody. One counter per person is enough: give +1 for being trusted, -1 for trusting. Only the judge can reach ${n - 1}.`,
    codeLine: 2,
  } as AlgorithmStep);

  const visitedEdges: [number, number][] = [];

  for (const [a, b] of trust) {
    score[a] -= 1;
    score[b] += 1;
    visitedEdges.push([a, b]);

    steps.push({
      state: {
        ...buildGraphState([b], [a], visitedEdges.map(e => [...e] as [number, number])),
        hashMap: scoreMap(),
        result: 'searching for the judge...',
      },
      highlights: [],
      message: `${a} → ${b}: person ${a} trusts someone, so score[${a}] = ${score[a]}; person ${b} gained a believer, so score[${b}] = ${score[b]}.`,
      codeLine: 5,
      action: 'compare',
    } as AlgorithmStep);
  }

  let judge = -1;

  for (let i = 1; i <= n; i++) {
    const isJudge = score[i] === n - 1;
    if (isJudge) judge = i;

    steps.push({
      state: {
        ...buildGraphState(isJudge ? [i] : [], isJudge ? [] : [i], visitedEdges.map(e => [...e] as [number, number])),
        hashMap: scoreMap(),
        result: isJudge ? i : 'searching for the judge...',
      },
      highlights: [],
      message: isJudge
        ? `Person ${i} scores ${score[i]} = n - 1 — trusted by everyone else and trusting no one. That is the judge.`
        : `Person ${i} scores ${score[i]}, not ${n - 1}. ${score[i] < 0 ? `They trust someone, which disqualifies them.` : `Not everyone trusts them.`}`,
      codeLine: 7,
      action: isJudge ? 'found' : 'compare',
    } as AlgorithmStep);

    if (isJudge) break;
  }

  steps.push({
    state: {
      ...buildGraphState(judge === -1 ? [] : [judge], [], visitedEdges.map(e => [...e] as [number, number])),
      hashMap: scoreMap(),
      result: judge,
    },
    highlights: [],
    message: judge === -1
      ? 'Nobody reached a score of n - 1, so this town has no judge → -1.'
      : `Answer: person ${judge} is the town judge.`,
    codeLine: judge === -1 ? 9 : 8,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runFindTownJudgeTwoArrays(input: unknown): AlgorithmStep[] {
  const { n, trust } = input as JudgeInput;
  const steps: AlgorithmStep[] = [];
  const buildGraphState = makeGraphBuilder(n, trust);

  const trusts = new Array(n + 1).fill(0);
  const trustedBy = new Array(n + 1).fill(0);
  const degreeMap = () => {
    const m: Record<string, string> = {};
    for (let i = 1; i <= n; i++) m[`person ${i}`] = `out ${trusts[i]} / in ${trustedBy[i]}`;
    return m;
  };

  steps.push({
    state: {
      ...buildGraphState(),
      hashMap: degreeMap(),
      result: 'searching for the judge...',
    },
    highlights: [],
    message: `Keep the two halves apart: out-degree (how many people you trust) and in-degree (how many trust you). The judge is the person with out = 0 and in = ${n - 1}.`,
    codeLine: 3,
  } as AlgorithmStep);

  const visitedEdges: [number, number][] = [];

  for (const [a, b] of trust) {
    trusts[a] += 1;
    trustedBy[b] += 1;
    visitedEdges.push([a, b]);

    steps.push({
      state: {
        ...buildGraphState([b], [a], visitedEdges.map(e => [...e] as [number, number])),
        hashMap: degreeMap(),
        result: 'searching for the judge...',
      },
      highlights: [],
      message: `${a} → ${b}: out-degree of ${a} rises to ${trusts[a]}, in-degree of ${b} rises to ${trustedBy[b]}.`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);
  }

  let judge = -1;

  for (let i = 1; i <= n; i++) {
    const isJudge = trusts[i] === 0 && trustedBy[i] === n - 1;
    if (isJudge) judge = i;

    steps.push({
      state: {
        ...buildGraphState(isJudge ? [i] : [], isJudge ? [] : [i], visitedEdges.map(e => [...e] as [number, number])),
        hashMap: degreeMap(),
        result: isJudge ? i : 'searching for the judge...',
      },
      highlights: [],
      message: isJudge
        ? `Person ${i}: out = 0 and in = ${trustedBy[i]} = n - 1. Both halves check out — this is the judge.`
        : `Person ${i}: out = ${trusts[i]}, in = ${trustedBy[i]}. ${trusts[i] > 0 ? 'They trust someone, so they cannot be the judge.' : `Only ${trustedBy[i]} of the needed ${n - 1} trust them.`}`,
      codeLine: 8,
      action: isJudge ? 'found' : 'compare',
    } as AlgorithmStep);

    if (isJudge) break;
  }

  steps.push({
    state: {
      ...buildGraphState(judge === -1 ? [] : [judge], [], visitedEdges.map(e => [...e] as [number, number])),
      hashMap: degreeMap(),
      result: judge,
    },
    highlights: [],
    message: judge === -1
      ? 'No one had out-degree 0 with in-degree n - 1 → -1.'
      : `Answer: person ${judge} is the town judge. (Same verdict as the single-array version — it just fuses these two counters into one.)`,
    codeLine: judge === -1 ? 10 : 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const findTownJudge: Algorithm = {
  id: 'find-town-judge',
  name: 'Find the Town Judge',
  category: 'Graphs',
  difficulty: 'Easy',
  timeComplexity: 'O(n + e)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map — net trust score, the judge scores n-1',
  description:
    'In a town of n people labelled 1 to n, exactly one person may be the town judge: they trust nobody, and everybody else trusts them. Given a list of trust pairs [a, b] meaning a trusts b, return the label of the judge, or -1 if there is none.',
  problemUrl: 'https://leetcode.com/problems/find-the-town-judge/',
  code: {
    python: `def findJudge(n, trust):
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1
        score[b] += 1
    for i in range(1, n + 1):
        if score[i] == n - 1:
            return i
    return -1`,
    javascript: `function findJudge(n, trust) {
    const score = new Array(n + 1).fill(0);
    for (const [a, b] of trust) {
        score[a] -= 1;
        score[b] += 1;
    }
    for (let i = 1; i <= n; i++) {
        if (score[i] === n - 1) return i;
    }
    return -1;
}`,
    java: `public static int findJudge(int n, int[][] trust) {
    int[] score = new int[n + 1];
    for (int[] t : trust) {
        score[t[0]] -= 1;
        score[t[1]] += 1;
    }
    for (int i = 1; i <= n; i++) {
        if (score[i] == n - 1) return i;
    }
    return -1;
}`,
  },
  defaultInput: {
    n: 4,
    trust: [
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [4, 3],
    ],
  },
  run: runFindTownJudge,
  optimalApproachName: 'Net Trust Score',
  approaches: [
    {
      id: 'two-degree-arrays',
      name: 'Separate Degree Arrays',
      timeComplexity: 'O(n + e)',
      spaceComplexity: 'O(n)',
      description:
        'Tracks out-degree and in-degree in two separate arrays and checks both conditions explicitly, instead of collapsing them into one signed score — more readable, at the cost of a second array.',
      code: {
        python: `def findJudge(n, trust):
    trusts = [0] * (n + 1)
    trusted_by = [0] * (n + 1)
    for a, b in trust:
        trusts[a] += 1
        trusted_by[b] += 1
    for i in range(1, n + 1):
        if trusts[i] == 0 and trusted_by[i] == n - 1:
            return i
    return -1`,
        javascript: `function findJudge(n, trust) {
    const trusts = new Array(n + 1).fill(0);
    const trustedBy = new Array(n + 1).fill(0);
    for (const [a, b] of trust) {
        trusts[a] += 1;
        trustedBy[b] += 1;
    }
    for (let i = 1; i <= n; i++) {
        if (trusts[i] === 0 && trustedBy[i] === n - 1) return i;
    }
    return -1;
}`,
        java: `public static int findJudge(int n, int[][] trust) {
    int[] trusts = new int[n + 1];
    int[] trustedBy = new int[n + 1];
    for (int[] t : trust) {
        trusts[t[0]] += 1;
        trustedBy[t[1]] += 1;
    }
    for (int i = 1; i <= n; i++) {
        if (trusts[i] == 0 && trustedBy[i] == n - 1) return i;
    }
    return -1;
}`,
      },
      run: runFindTownJudgeTwoArrays,
      lineExplanations: {
        python: {
          1: 'Define function taking town size and trust pairs',
          2: 'Out-degree: how many people each person trusts',
          3: 'In-degree: how many people trust each person',
          4: 'Walk every trust edge a → b',
          5: 'a trusts one more person',
          6: 'b is trusted by one more person',
          7: 'Check every candidate label',
          8: 'The judge trusts nobody and is trusted by all the rest',
          9: 'Found the judge',
          10: 'Nobody satisfies both halves',
        },
        javascript: {
          1: 'Define function taking town size and trust pairs',
          2: 'Out-degree: how many people each person trusts',
          3: 'In-degree: how many people trust each person',
          4: 'Walk every trust edge a → b',
          5: 'a trusts one more person',
          6: 'b is trusted by one more person',
          8: 'Check every candidate label',
          9: 'Judge trusts nobody and is trusted by all the rest',
          11: 'Nobody satisfies both halves',
        },
        java: {
          1: 'Define method taking town size and trust pairs',
          2: 'Out-degree: how many people each person trusts',
          3: 'In-degree: how many people trust each person',
          4: 'Walk every trust edge a → b',
          5: 'a trusts one more person',
          6: 'b is trusted by one more person',
          8: 'Check every candidate label',
          9: 'Judge trusts nobody and is trusted by all the rest',
          11: 'Nobody satisfies both halves',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking town size and trust pairs',
      2: 'One signed counter per person (index 0 unused)',
      3: 'Walk every trust edge a → b',
      4: 'Trusting someone disqualifies you: -1',
      5: 'Being trusted is evidence for you: +1',
      6: 'Check every candidate label',
      7: 'Only a judge can net n-1: trusted by all, trusting none',
      8: 'Found the judge',
      9: 'No score reached n-1, so there is no judge',
    },
    javascript: {
      1: 'Define function taking town size and trust pairs',
      2: 'One signed counter per person (index 0 unused)',
      3: 'Walk every trust edge a → b',
      4: 'Trusting someone disqualifies you: -1',
      5: 'Being trusted is evidence for you: +1',
      7: 'Check every candidate label',
      8: 'Only a judge can net n-1',
      10: 'No score reached n-1, so there is no judge',
    },
    java: {
      1: 'Define method taking town size and trust pairs',
      2: 'One signed counter per person (index 0 unused)',
      3: 'Walk every trust edge a → b',
      4: 'Trusting someone disqualifies you: -1',
      5: 'Being trusted is evidence for you: +1',
      7: 'Check every candidate label',
      8: 'Only a judge can net n-1',
      10: 'No score reached n-1, so there is no judge',
    },
  },
};
