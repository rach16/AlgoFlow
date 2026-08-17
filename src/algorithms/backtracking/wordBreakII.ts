import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runWordBreakII(input: unknown): AlgorithmStep[] {
  const { s, wordDict } = input as { s: string; wordDict: string[] };
  const steps: AlgorithmStep[] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const words = new Set(wordDict);
  const memo = new Map<number, string[]>();
  const path: string[] = [];
  const chars = s.split('');

  const memoView = (): Record<string, string> => {
    const obj: Record<string, string> = {};
    for (const key of [...memo.keys()].sort((a, b) => a - b)) {
      obj[`from ${key}`] = `${memo.get(key)!.length} sentence${memo.get(key)!.length !== 1 ? 's' : ''}`;
    }
    return obj;
  };

  const range = (a: number, b: number) => Array.from({ length: b - a }, (_, i) => a + i);

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: { chars: [...chars], stack: [], hashMap: {}, result: [] },
    highlights: [],
    message: `Break "${s}" into every sentence of dictionary words {${wordDict.join(', ')}}. The suffix starting at index i always yields the same sentences, so each index is solved once and cached`,
    codeLine: 1,
  });

  function backtrack(start: number): string[] {
    if (start === s.length) {
      push({
        state: { chars: [...chars], stack: [...path], hashMap: memoView(), result: [] },
        highlights: [],
        message: `Index ${start} is the end of the string — return [""], the single empty tail that closes a sentence`,
        codeLine: 7,
        action: 'found',
      });
      return [''];
    }

    if (memo.has(start)) {
      const cached = memo.get(start)!;
      push({
        state: { chars: [...chars], stack: [...path], hashMap: memoView(), result: [] },
        highlights: range(start, s.length),
        message: `Memo hit at index ${start}: "${s.slice(start)}" was already solved into ${cached.length} tail${cached.length !== 1 ? 's' : ''} (${cached.map((c) => `"${c}"`).join(', ')}) — reuse instead of re-searching. This is what stops the exponential blow-up`,
        codeLine: 9,
        action: 'visit',
      });
      return cached;
    }

    const matches: { end: number; word: string }[] = [];
    for (let end = start + 1; end <= s.length; end++) {
      const word = s.slice(start, end);
      if (words.has(word)) matches.push({ end, word });
    }

    push({
      state: { chars: [...chars], stack: [...path], hashMap: memoView(), result: [] },
      highlights: range(start, s.length),
      message:
        matches.length > 0
          ? `Solve suffix "${s.slice(start)}" (index ${start}): of its ${s.length - start} prefixes, ${matches.map((m) => `"${m.word}"`).join(' and ')} ${matches.length === 1 ? 'is a word' : 'are words'} — those are the only branches worth taking`
          : `Solve suffix "${s.slice(start)}" (index ${start}): no prefix of it is in the dictionary, so this suffix yields nothing`,
      codeLine: 12,
      action: 'visit',
    });

    const sentences: string[] = [];
    for (const { end, word } of matches) {
      path.push(word);

      push({
        state: { chars: [...chars], stack: [...path], hashMap: memoView(), result: [] },
        highlights: range(start, end),
        message: `"${word}" matches — commit it and solve the remaining suffix "${s.slice(end) || '(empty)'}" from index ${end}`,
        codeLine: 13,
        action: 'push',
      });

      const tails = backtrack(end);
      for (const rest of tails) {
        const sentence = rest ? `${word} ${rest}` : word;
        sentences.push(sentence);
      }

      push({
        state: { chars: [...chars], stack: [...path], hashMap: memoView(), result: [] },
        highlights: range(start, end),
        message: `Prefix "${word}" × ${tails.length} tail${tails.length !== 1 ? 's' : ''} → ${tails.map((t) => `"${t ? `${word} ${t}` : word}"`).join(', ')}`,
        codeLine: 17,
        action: 'insert',
      });

      path.pop();
    }

    memo.set(start, sentences);

    push({
      state: { chars: [...chars], stack: [...path], hashMap: memoView(), result: [] },
      highlights: range(start, s.length),
      message: `Cache memo[${start}] = ${sentences.length} sentence${sentences.length !== 1 ? 's' : ''} for suffix "${s.slice(start)}" — any later path arriving here stops immediately`,
      codeLine: 20,
    });

    return sentences;
  }

  const result = backtrack(0);

  steps.push({
    state: { chars: [...chars], stack: [], hashMap: memoView(), result },
    highlights: [],
    message: `Done! ${result.length} sentence${result.length !== 1 ? 's' : ''}: ${result.map((r) => `"${r}"`).join(', ')}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''}`,
    codeLine: 23,
    action: 'found',
  });

  return steps;
}

function runWordBreakIIDpReconstruct(input: unknown): AlgorithmStep[] {
  const { s, wordDict } = input as { s: string; wordDict: string[] };
  const steps: AlgorithmStep[] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const words = new Set(wordDict);
  const n = s.length;
  const chars = s.split('');
  const dp: number[][] = Array.from({ length: n + 1 }, () => []);
  const reachable = new Array(n + 1).fill(false);
  reachable[0] = true;

  const dpView = () => dp.map((list, i) => (i === 0 ? 'ε' : list.length ? list.join(',') : '·'));
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => String(i));
  const range = (a: number, b: number) => Array.from({ length: b - a }, (_, i) => a + i);

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      chars: [...chars],
      dp: dpView(),
      dpLabels,
      dpHighlights: [0],
      stack: [],
      result: [],
    },
    highlights: [],
    message: `Bottom-up instead of top-down. dp[i] will hold every start index j such that s[j:i] is a word AND the prefix s[:j] is itself breakable. Seed: the empty prefix is trivially breakable`,
    codeLine: 9,
  });

  for (let i = 1; i <= n; i++) {
    const found: number[] = [];
    for (let j = 0; j < i; j++) {
      if (reachable[j] && words.has(s.slice(j, i))) {
        dp[i].push(j);
        reachable[i] = true;
        found.push(j);
      }
    }

    push({
      state: {
        chars: [...chars],
        dp: dpView(),
        dpLabels,
        dpHighlights: [i],
        dpSecondary: found,
        stack: [],
        result: [],
      },
      highlights: range(0, i),
      message:
        found.length > 0
          ? `Prefix "${s.slice(0, i)}" (length ${i}) is breakable: ${found.map((j) => `s[${j}:${i}] = "${s.slice(j, i)}" lands on the breakable prefix "${s.slice(0, j) || 'ε'}"`).join('; ')}`
          : `Prefix "${s.slice(0, i)}" (length ${i}) has no last word that lands on a breakable prefix — dp[${i}] stays empty`,
      codeLine: 13,
      action: found.length > 0 ? 'insert' : 'visit',
    });
  }

  if (!reachable[n]) {
    steps.push({
      state: { chars: [...chars], dp: dpView(), dpLabels, stack: [], result: [] },
      highlights: [],
      message: `dp[${n}] is empty — the whole string cannot be segmented, so there is nothing to reconstruct`,
      codeLine: 18,
      action: 'found',
    });
    return steps;
  }

  const result: string[] = [];

  push({
    state: {
      chars: [...chars],
      dp: dpView(),
      dpLabels,
      dpHighlights: [n],
      stack: [],
      result: [],
    },
    highlights: [],
    message: `The table is complete and dp[${n}] is non-empty. Now walk it BACKWARD from ${n} to 0 — every path down the breakpoint links spells one sentence, and no dead branches exist to waste work on`,
    codeLine: 22,
  });

  function build(i: number, tail: string[]) {
    if (i === 0) {
      const sentence = tail.join(' ');
      result.push(sentence);

      push({
        state: {
          chars: [...chars],
          dp: dpView(),
          dpLabels,
          dpHighlights: [0],
          stack: [...tail],
          result: [...result],
        },
        highlights: range(0, n),
        message: `Reached index 0 — the chain of links spells "${sentence}" (total: ${result.length})`,
        codeLine: 24,
        action: 'found',
      });
      return;
    }

    for (const j of dp[i]) {
      const word = s.slice(j, i);

      push({
        state: {
          chars: [...chars],
          dp: dpView(),
          dpLabels,
          dpHighlights: [i],
          dpSecondary: [j],
          stack: [word, ...tail],
          result: [...result],
        },
        highlights: range(j, i),
        message: `Follow link dp[${i}] → ${j}: prepend "${word}", tail is now "${[word, ...tail].join(' ')}"`,
        codeLine: 27,
        action: 'push',
      });

      build(j, [word, ...tail]);
    }
  }

  build(n, []);

  steps.push({
    state: {
      chars: [...chars],
      dp: dpView(),
      dpLabels,
      stack: [],
      result,
    },
    highlights: [],
    message: `Done! ${result.length} sentence${result.length !== 1 ? 's' : ''}: ${result.map((r) => `"${r}"`).join(', ')}${suppressed > 0 ? ` (${suppressed} steps not shown)` : ''}. The table is built once in O(n²) and only feasible paths get walked`,
    codeLine: 30,
    action: 'found',
  });

  return steps;
}

export const wordBreakII: Algorithm = {
  id: 'word-break-ii',
  name: 'Word Break II',
  category: 'Backtracking',
  difficulty: 'Hard',
  timeComplexity: 'O(n² + 2ⁿ) — the 2ⁿ only when that many sentences exist',
  spaceComplexity: 'O(n² + output)',
  pattern: 'Backtracking — memoize suffixes to reuse repeated subproblems',
  description:
    'Given a string s and a dictionary of words, add spaces in s to construct every possible sentence where each word is a valid dictionary word. Words may be reused. Memoize by suffix start index so each suffix is segmented only once.',
  problemUrl: 'https://leetcode.com/problems/word-break-ii/',
  code: {
    python: `def wordBreak(s, wordDict):
    words = set(wordDict)
    memo = {}

    def backtrack(start):
        if start == len(s):
            return [""]
        if start in memo:
            return memo[start]

        sentences = []
        for end in range(start + 1, len(s) + 1):
            word = s[start:end]
            if word not in words:
                continue
            for rest in backtrack(end):
                sentences.append(word if not rest
                                 else word + " " + rest)

        memo[start] = sentences
        return sentences

    return backtrack(0)`,
    javascript: `function wordBreak(s, wordDict) {
    const words = new Set(wordDict);
    const memo = new Map();

    function backtrack(start) {
        if (start === s.length) return [""];
        if (memo.has(start)) return memo.get(start);

        const sentences = [];
        for (let end = start + 1; end <= s.length; end++) {
            const word = s.slice(start, end);
            if (!words.has(word)) continue;
            for (const rest of backtrack(end)) {
                sentences.push(rest ? word + " " + rest : word);
            }
        }

        memo.set(start, sentences);
        return sentences;
    }

    return backtrack(0);
}`,
    java: `public static List<String> wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    Map<Integer, List<String>> memo = new HashMap<>();
    return backtrack(0, s, words, memo);
}

private static List<String> backtrack(int start, String s, Set<String> words,
                                      Map<Integer, List<String>> memo) {
    if (start == s.length()) return List.of("");
    if (memo.containsKey(start)) return memo.get(start);

    List<String> sentences = new ArrayList<>();
    for (int end = start + 1; end <= s.length(); end++) {
        String word = s.substring(start, end);
        if (!words.contains(word)) continue;
        for (String rest : backtrack(end, s, words, memo)) {
            sentences.add(rest.isEmpty() ? word : word + " " + rest);
        }
    }

    memo.put(start, sentences);
    return sentences;
}`,
  },
  defaultInput: { s: 'catsanddog', wordDict: ['cat', 'cats', 'and', 'sand', 'dog'] },
  run: runWordBreakII,
  optimalApproachName: 'Backtracking + Memoization',
  approaches: [
    {
      id: 'dp-breakpoints-reconstruct',
      name: 'DP Breakpoints + Reconstruct',
      timeComplexity: 'O(n² + output)',
      spaceComplexity: 'O(n² + output)',
      description:
        'Builds a bottom-up table of every valid last-word breakpoint for each prefix first, then walks that table backwards — so the recursion only ever touches paths that are already known to reach the end.',
      code: {
        python: `def wordBreak(s, wordDict):
    words = set(wordDict)
    n = len(s)

    # dp[i] = start indices j such that s[j:i]
    # is a word and s[:j] is itself breakable
    dp = [[] for _ in range(n + 1)]
    reachable = [False] * (n + 1)
    reachable[0] = True

    for i in range(1, n + 1):
        for j in range(i):
            if reachable[j] and s[j:i] in words:
                dp[i].append(j)
                reachable[i] = True

    if not reachable[n]:
        return []

    result = []

    def build(i, tail):
        if i == 0:
            result.append(" ".join(tail))
            return
        for j in dp[i]:
            build(j, [s[j:i]] + tail)

    build(n, [])
    return result`,
        javascript: `function wordBreak(s, wordDict) {
    const words = new Set(wordDict);
    const n = s.length;

    // dp[i] = start indices j such that s[j:i]
    // is a word and s[:j] is itself breakable
    const dp = Array.from({length: n + 1}, () => []);
    const reachable = new Array(n + 1).fill(false);
    reachable[0] = true;

    for (let i = 1; i <= n; i++) {
        for (let j = 0; j < i; j++) {
            if (reachable[j] && words.has(s.slice(j, i))) {
                dp[i].push(j);
                reachable[i] = true;
            }
        }
    }

    if (!reachable[n]) return [];

    const result = [];

    function build(i, tail) {
        if (i === 0) {
            result.push(tail.join(" "));
            return;
        }
        for (const j of dp[i]) {
            build(j, [s.slice(j, i), ...tail]);
        }
    }

    build(n, []);
    return result;
}`,
        java: `public static List<String> wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    int n = s.length();

    // dp[i] = start indices j such that s[j:i]
    // is a word and s[:j] is itself breakable
    List<List<Integer>> dp = new ArrayList<>();
    for (int i = 0; i <= n; i++) dp.add(new ArrayList<>());
    boolean[] reachable = new boolean[n + 1];
    reachable[0] = true;

    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (reachable[j] && words.contains(s.substring(j, i))) {
                dp.get(i).add(j);
                reachable[i] = true;
            }
        }
    }

    List<String> result = new ArrayList<>();
    if (!reachable[n]) return result;
    build(n, new ArrayList<>(), s, dp, result);
    return result;
}

private static void build(int i, List<String> tail, String s,
                          List<List<Integer>> dp, List<String> result) {
    if (i == 0) {
        result.add(String.join(" ", tail));
        return;
    }
    for (int j : dp.get(i)) {
        List<String> next = new ArrayList<>(tail);
        next.add(0, s.substring(j, i));
        build(j, next, s, dp, result);
    }
}`,
      },
      run: runWordBreakIIDpReconstruct,
      lineExplanations: {
        python: {
          1: 'Define function taking the string and the dictionary',
          2: 'Set lookup makes each membership test O(1)',
          3: 'Length of the string, and the last table index',
          5: 'dp is a graph of breakpoints, not a boolean table',
          6: 'Storing every j keeps ALL segmentations, not just one',
          7: 'One bucket of predecessors per prefix length',
          8: 'reachable[i] is just "dp[i] is non-empty"',
          9: 'The empty prefix needs no words at all',
          11: 'Grow the prefix one character at a time',
          12: 'Try every possible start of the last word',
          13: 'The tail must be a word and the head must already be breakable',
          14: 'Record the breakpoint',
          15: 'Mark this prefix as segmentable',
          17: 'The full string never became breakable',
          18: 'No sentences exist',
          20: 'Collect the finished sentences',
          22: 'Walk the breakpoint links backward from index i',
          23: 'Base case: consumed the whole string right to left',
          24: 'Join the accumulated words into one sentence',
          25: 'Return to explore the other links',
          26: 'Every recorded breakpoint spawns one branch',
          27: 'Prepend s[j:i] and continue from j',
          29: 'Start the walk at the end of the string',
          30: 'Return every sentence',
        },
        javascript: {
          1: 'Define function taking the string and the dictionary',
          2: 'Set lookup makes each membership test O(1)',
          3: 'Length of the string, and the last table index',
          5: 'dp is a graph of breakpoints, not a boolean table',
          6: 'Storing every j keeps ALL segmentations, not just one',
          7: 'One bucket of predecessors per prefix length',
          8: 'reachable[i] is just "dp[i] is non-empty"',
          9: 'The empty prefix needs no words at all',
          11: 'Grow the prefix one character at a time',
          12: 'Try every possible start of the last word',
          13: 'The tail must be a word and the head must already be breakable',
          14: 'Record the breakpoint',
          15: 'Mark this prefix as segmentable',
          20: 'The full string never became breakable, so no sentences exist',
          22: 'Collect the finished sentences',
          24: 'Walk the breakpoint links backward from index i',
          25: 'Base case: consumed the whole string right to left',
          26: 'Join the accumulated words into one sentence',
          29: 'Every recorded breakpoint spawns one branch',
          30: 'Prepend s[j:i] and continue from j',
          34: 'Start the walk at the end of the string',
          35: 'Return every sentence',
        },
        java: {
          1: 'Define method taking the string and the dictionary',
          2: 'Set lookup makes each membership test O(1)',
          3: 'Length of the string, and the last table index',
          5: 'dp is a graph of breakpoints, not a boolean table',
          6: 'Storing every j keeps ALL segmentations, not just one',
          7: 'One bucket of predecessors per prefix length',
          8: 'Allocate n + 1 empty buckets',
          9: 'reachable[i] is just "dp[i] is non-empty"',
          10: 'The empty prefix needs no words at all',
          12: 'Grow the prefix one character at a time',
          13: 'Try every possible start of the last word',
          14: 'The tail must be a word and the head must already be breakable',
          15: 'Record the breakpoint',
          16: 'Mark this prefix as segmentable',
          21: 'Collect the finished sentences',
          22: 'Unbreakable string means an empty answer',
          23: 'Walk the links backward from the end',
          27: 'Recursive reconstruction helper',
          29: 'Base case: consumed the whole string right to left',
          30: 'Join the accumulated words into one sentence',
          33: 'Every recorded breakpoint spawns one branch',
          34: 'Copy the tail so branches stay independent',
          35: 'Prepend the word for this link',
          36: 'Continue from j',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the string and the dictionary',
      2: 'Set lookup makes each membership test O(1)',
      3: 'Cache keyed by suffix start index',
      5: 'Return every sentence that segments s[start:]',
      6: 'Base case: the suffix is empty',
      7: 'One empty tail — it terminates the sentence above',
      8: 'This suffix has been solved before',
      9: 'Reuse the cached answer instead of re-searching',
      11: 'Sentences that start at this index',
      12: 'Every possible length for the first word',
      13: 'Slice out the candidate first word',
      14: 'Not in the dictionary',
      15: 'So this split is impossible, try a longer word',
      16: 'Recurse: how does the remaining suffix break apart?',
      17: 'Glue the first word onto each tail',
      18: 'The empty tail is the one case that needs no space',
      20: 'Cache before returning — the whole point of the memo',
      21: 'Hand the list back to the caller',
      23: 'Start from the beginning of the string',
    },
    javascript: {
      1: 'Define function taking the string and the dictionary',
      2: 'Set lookup makes each membership test O(1)',
      3: 'Cache keyed by suffix start index',
      5: 'Return every sentence that segments s.slice(start)',
      6: 'Base case: one empty tail terminates the sentence above',
      7: 'Reuse the cached answer instead of re-searching',
      9: 'Sentences that start at this index',
      10: 'Every possible length for the first word',
      11: 'Slice out the candidate first word',
      12: 'Not in the dictionary, so try a longer word',
      13: 'Recurse: how does the remaining suffix break apart?',
      14: 'Glue the first word onto each tail, no space before an empty tail',
      18: 'Cache before returning — the whole point of the memo',
      19: 'Hand the list back to the caller',
      22: 'Start from the beginning of the string',
    },
    java: {
      1: 'Define method taking the string and the dictionary',
      2: 'Set lookup makes each membership test O(1)',
      3: 'Cache keyed by suffix start index',
      4: 'Start from the beginning of the string',
      7: 'Helper returns every sentence for the suffix at start',
      8: 'It carries the dictionary and the shared memo',
      9: 'Base case: one empty tail terminates the sentence above',
      10: 'Reuse the cached answer instead of re-searching',
      12: 'Sentences that start at this index',
      13: 'Every possible length for the first word',
      14: 'Slice out the candidate first word',
      15: 'Not in the dictionary, so try a longer word',
      16: 'Recurse: how does the remaining suffix break apart?',
      17: 'Glue the first word onto each tail, no space before an empty tail',
      21: 'Cache before returning — the whole point of the memo',
      22: 'Hand the list back to the caller',
    },
  },
};
