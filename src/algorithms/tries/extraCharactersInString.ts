import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface ExtraCharactersInput {
  s: string;
  dictionary: string[];
}

interface TrieNode {
  children: Record<string, TrieNode>;
  isWord: boolean;
}

function buildTrie(words: string[]): TrieNode {
  const root: TrieNode = { children: {}, isWord: false };
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = { children: {}, isWord: false };
      }
      node = node.children[ch];
    }
    node.isWord = true;
  }
  return root;
}

/** Level-order flatten of the trie for TreeView (same shape implementTrie uses). */
function trieToTree(root: TrieNode): { val: number | string | null; id: number }[] {
  const result: { val: number | string | null; id: number }[] = [];
  let id = 0;
  const queue: { node: TrieNode; label: string }[] = [{ node: root, label: 'root' }];

  while (queue.length > 0) {
    const { node, label } = queue.shift()!;
    result.push({ val: node.isWord ? `${label}*` : label, id: id++ });
    for (const key of Object.keys(node.children).sort()) {
      queue.push({ node: node.children[key], label: key });
    }
  }

  return result;
}

function childKeys(node: TrieNode): string {
  const keys = Object.keys(node.children).sort();
  return keys.length ? keys.join(', ') : '(none — dead end)';
}

function runExtraCharacters(input: unknown): AlgorithmStep[] {
  const { s, dictionary } = input as ExtraCharactersInput;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');
  const labels = Array.from({ length: n + 1 }, (_, i) => (i < n ? s[i] : 'ø'));

  const root = buildTrie(dictionary);
  const tree = trieToTree(root);

  const dp: (number | null)[] = new Array(n + 1).fill(null);

  const snapshot = (
    highlights: number[],
    map: Record<string, string>,
    result: string,
    secondary: number[] = []
  ) => ({
    chars: [...chars],
    dp: [...dp],
    dpLabels: labels,
    dpHighlights: highlights,
    dpSecondary: secondary,
    hashMap: map,
    tree,
    result,
  });

  steps.push({
    state: snapshot([], { dictionary: dictionary.join(', '), 'trie nodes': String(tree.length) }, 'Trie built'),
    highlights: [],
    message: `Build a trie from the dictionary [${dictionary.join(', ')}]. Words sharing a prefix (like "leet" and "leetcode") share trie nodes, so one walk from a start index tests every dictionary word at once.`,
    codeLine: 7,
  });

  dp[n] = 0;

  steps.push({
    state: snapshot([n], { 'dp meaning': 'dp[i] = fewest extra chars in s[i:]' }, 'dp[n] = 0'),
    highlights: [],
    message: `dp[i] = the fewest leftover characters when we optimally break s[i:]. Past the end of the string there is nothing left over, so dp[${n}] = 0. Fill the table right to left.`,
    codeLine: 17,
    action: 'insert',
  });

  for (let i = n - 1; i >= 0; i--) {
    dp[i] = (dp[i + 1] as number) + 1;

    const rootHasChild = !!root.children[s[i]];

    steps.push({
      state: snapshot(
        [i],
        {
          'at index': `${i} ('${s[i]}')`,
          'trie path': '(root)',
          'root children': childKeys(root),
        },
        `dp[${i}] = ${dp[i]} (tentative)`,
        [i + 1]
      ),
      highlights: [i],
      message: rootHasChild
        ? `i = ${i}, character '${s[i]}'. Baseline: treat '${s[i]}' as an extra character, so dp[${i}] = dp[${i + 1}] + 1 = ${dp[i]}. Root has a child '${s[i]}', so a dictionary word might start here — walk the trie and try to beat it.`
        : `i = ${i}, character '${s[i]}'. Baseline: treat '${s[i]}' as extra, so dp[${i}] = dp[${i + 1}] + 1 = ${dp[i]}. The trie root has no child '${s[i]}' (only ${childKeys(root)}), so no dictionary word starts at index ${i} — dp[${i}] stays ${dp[i]}. This O(1) rejection is exactly what the trie buys us.`,
      codeLine: rootHasChild ? 20 : 23,
      action: rootHasChild ? 'visit' : 'compare',
    });

    if (!rootHasChild) continue;

    let node = root;
    for (let j = i; j < n; j++) {
      const next = node.children[s[j]];
      if (!next) {
        steps.push({
          state: snapshot(
            [i],
            {
              'at index': `${i} ('${s[i]}')`,
              'trie path': s.slice(i, j),
              'next needed': `'${s[j]}'`,
              'available': childKeys(node),
            },
            `dp[${i}] = ${dp[i]}`,
            [j]
          ),
          highlights: [j],
          message: `Walking "${s.slice(i, j)}" we now need '${s[j]}', but this trie node only offers ${childKeys(node)}. No longer dictionary word starting at index ${i} can continue, so stop the walk — dp[${i}] is settled at ${dp[i]}.`,
          codeLine: 24,
          action: 'pop',
        });
        break;
      }

      node = next;
      const matched = s.slice(i, j + 1);

      steps.push({
        state: snapshot(
          [i],
          {
            'at index': `${i} ('${s[i]}')`,
            'trie path': matched,
            'is a word': node.isWord ? 'YES' : 'no (prefix only)',
            'children': childKeys(node),
          },
          `Path "${matched}"`,
          [j]
        ),
        highlights: [j],
        message: node.isWord
          ? `Step onto '${s[j]}' — the path "${matched}" ends on a word-marked node, so s[${i}..${j}] is in the dictionary.`
          : `Step onto '${s[j]}' — "${matched}" is only a prefix so far (continues into ${childKeys(node)}), not a complete word. Keep walking.`,
        codeLine: 25,
        action: 'visit',
      });

      if (node.isWord) {
        const candidate = dp[j + 1] as number;
        const improved = candidate < (dp[i] as number);
        if (improved) dp[i] = candidate;

        steps.push({
          state: snapshot(
            [i],
            {
              'at index': `${i} ('${s[i]}')`,
              'word found': matched,
              'dp[j+1]': String(candidate),
            },
            `dp[${i}] = ${dp[i]}`,
            [j + 1]
          ),
          highlights: [j],
          message: improved
            ? `Use "${matched}" as a chunk: it costs 0 extra characters itself, so the rest is dp[${j + 1}] = ${candidate}. That beats the old dp[${i}], which drops to ${dp[i]}.`
            : `Use "${matched}" as a chunk: the rest would cost dp[${j + 1}] = ${candidate}, which does not beat the current dp[${i}] = ${dp[i]}. Keep the better value.`,
          codeLine: 27,
          action: improved ? 'found' : 'compare',
        });
      }
    }
  }

  steps.push({
    state: snapshot([0], { answer: String(dp[0]) }, `Answer: ${dp[0]}`),
    highlights: [],
    message: `dp[0] = ${dp[0]}. The best split of "${s}" leaves ${dp[0]} character${dp[0] === 1 ? ' that belongs' : 's that belong'} to no dictionary word.`,
    codeLine: 29,
    action: 'found',
  });

  return steps;
}

function runExtraCharactersHashSet(input: unknown): AlgorithmStep[] {
  const { s, dictionary } = input as ExtraCharactersInput;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');
  const labels = Array.from({ length: n + 1 }, (_, i) => (i < n ? s[i] : 'ø'));
  const words = new Set(dictionary);
  const maxLen = Math.max(...dictionary.map(w => w.length));

  const dp: (number | null)[] = new Array(n + 1).fill(null);

  const snapshot = (
    highlights: number[],
    map: Record<string, string>,
    result: string,
    secondary: number[] = []
  ) => ({
    chars: [...chars],
    dp: [...dp],
    dpLabels: labels,
    dpHighlights: highlights,
    dpSecondary: secondary,
    hashMap: map,
    result,
  });

  dp[n] = 0;

  steps.push({
    state: snapshot([n], { 'word set': dictionary.join(', '), 'longest word': String(maxLen) }, 'dp[n] = 0'),
    highlights: [],
    message: `No trie: just drop the dictionary into a hash set and test substrings directly. Same right-to-left DP — dp[i] = fewest leftover characters in s[i:], and dp[${n}] = 0 because nothing follows the end of the string.`,
    codeLine: 2,
    action: 'insert',
  });

  for (let i = n - 1; i >= 0; i--) {
    dp[i] = (dp[i + 1] as number) + 1;

    const hits: number[] = [];
    for (let j = i; j < n; j++) {
      if (words.has(s.slice(i, j + 1))) hits.push(j);
    }

    steps.push({
      state: snapshot(
        [i],
        {
          'at index': `${i} ('${s[i]}')`,
          'substrings tested': String(n - i),
          'dictionary hits': hits.length ? hits.map(j => `"${s.slice(i, j + 1)}"`).join(', ') : '(none)',
        },
        `dp[${i}] = ${dp[i]} (tentative)`,
        [i + 1]
      ),
      highlights: [i],
      message: `i = ${i}, character '${s[i]}'. Baseline dp[${i}] = dp[${i + 1}] + 1 = ${dp[i]} (skip '${s[i]}' as extra). Now test all ${n - i} substrings s[${i}..j] against the set — note the trie version would have stopped after ${hits.length ? 'the first mismatch' : 'one lookup'}, while the set version hashes every prefix in full.`,
      codeLine: 7,
      action: 'visit',
    });

    for (const j of hits) {
      const matched = s.slice(i, j + 1);
      const candidate = dp[j + 1] as number;
      const improved = candidate < (dp[i] as number);
      if (improved) dp[i] = candidate;

      steps.push({
        state: snapshot(
          [i],
          { 'at index': `${i} ('${s[i]}')`, 'word found': matched, 'dp[j+1]': String(candidate) },
          `dp[${i}] = ${dp[i]}`,
          [j + 1]
        ),
        highlights: [j],
        message: improved
          ? `"${matched}" is in the set. Taking it as a chunk leaves dp[${j + 1}] = ${candidate} extras, beating the baseline — dp[${i}] drops to ${dp[i]}.`
          : `"${matched}" is in the set, but the remainder costs dp[${j + 1}] = ${candidate}, no better than dp[${i}] = ${dp[i]}. Keep the current value.`,
        codeLine: 10,
        action: improved ? 'found' : 'compare',
      });
    }

    steps.push({
      state: snapshot([i], { 'at index': String(i), [`dp[${i}]`]: String(dp[i]) }, `dp[${i}] = ${dp[i]}`),
      highlights: [],
      message: `dp[${i}] settles at ${dp[i]} — the best of "skip s[${i}]" and every dictionary word starting at ${i}.`,
      codeLine: 7,
      action: 'insert',
    });
  }

  steps.push({
    state: snapshot([0], { answer: String(dp[0]) }, `Answer: ${dp[0]}`),
    highlights: [],
    message: `dp[0] = ${dp[0]} — the same answer as the trie version. Substring slicing costs O(L) per test, so this is O(n²·L) worst case versus O(n²) for the trie walk, but it fits in six lines.`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const extraCharactersInString: Algorithm = {
  id: 'extra-characters-in-string',
  name: 'Extra Characters in a String',
  category: 'Tries',
  difficulty: 'Medium',
  timeComplexity: 'O(n² + m·L)',
  spaceComplexity: 'O(m·L + n)',
  pattern: 'Trie + DP — walk the trie from each index to find dictionary matches',
  description:
    'Given a string s and a dictionary of words, break s into one or more non-overlapping substrings such that each substring is present in the dictionary. Some characters may be left over; return the minimum number of such extra characters.',
  problemUrl: 'https://leetcode.com/problems/extra-characters-in-a-string/',
  code: {
    python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.isWord = False

def minExtraChar(s, dictionary):
    root = TrieNode()
    for word in dictionary:
        node = root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.isWord = True

    n = len(s)
    dp = [0] * (n + 1)

    for i in range(n - 1, -1, -1):
        dp[i] = dp[i + 1] + 1
        node = root
        for j in range(i, n):
            if s[j] not in node.children:
                break
            node = node.children[s[j]]
            if node.isWord:
                dp[i] = min(dp[i], dp[j + 1])

    return dp[0]`,
    javascript: `function minExtraChar(s, dictionary) {
    const root = { children: {}, isWord: false };
    for (const word of dictionary) {
        let node = root;
        for (const c of word) {
            if (!node.children[c]) {
                node.children[c] = { children: {}, isWord: false };
            }
            node = node.children[c];
        }
        node.isWord = true;
    }

    const n = s.length;
    const dp = new Array(n + 1).fill(0);

    for (let i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        let node = root;
        for (let j = i; j < n; j++) {
            if (!node.children[s[j]]) break;
            node = node.children[s[j]];
            if (node.isWord) {
                dp[i] = Math.min(dp[i], dp[j + 1]);
            }
        }
    }

    return dp[0];
}`,
    java: `class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isWord = false;
}

public static int minExtraChar(String s, String[] dictionary) {
    TrieNode root = new TrieNode();
    for (String word : dictionary) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isWord = true;
    }

    int n = s.length();
    int[] dp = new int[n + 1];

    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        TrieNode node = root;
        for (int j = i; j < n; j++) {
            if (!node.children.containsKey(s.charAt(j))) break;
            node = node.children.get(s.charAt(j));
            if (node.isWord) {
                dp[i] = Math.min(dp[i], dp[j + 1]);
            }
        }
    }

    return dp[0];
}`,
  },
  defaultInput: {
    s: 'leetscode',
    dictionary: ['leet', 'code', 'leetcode'],
  },
  run: runExtraCharacters,
  optimalApproachName: 'Trie + DP',
  approaches: [
    {
      id: 'hash-set-dp',
      name: 'DP + Hash Set',
      timeComplexity: 'O(n²·L)',
      spaceComplexity: 'O(m·L + n)',
      description:
        'Skip the trie and keep the dictionary in a hash set, slicing every substring s[i..j] and looking it up directly — six lines instead of a trie class, but each lookup hashes the whole substring instead of extending a walk one character at a time.',
      code: {
        python: `def minExtraChar(s, dictionary):
    words = set(dictionary)
    n = len(s)
    dp = [0] * (n + 1)

    for i in range(n - 1, -1, -1):
        dp[i] = dp[i + 1] + 1
        for j in range(i, n):
            if s[i:j + 1] in words:
                dp[i] = min(dp[i], dp[j + 1])

    return dp[0]`,
        javascript: `function minExtraChar(s, dictionary) {
    const words = new Set(dictionary);
    const n = s.length;
    const dp = new Array(n + 1).fill(0);

    for (let i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        for (let j = i; j < n; j++) {
            if (words.has(s.slice(i, j + 1))) {
                dp[i] = Math.min(dp[i], dp[j + 1]);
            }
        }
    }

    return dp[0];
}`,
        java: `public static int minExtraChar(String s, String[] dictionary) {
    Set<String> words = new HashSet<>(Arrays.asList(dictionary));
    int n = s.length();
    int[] dp = new int[n + 1];

    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        for (int j = i; j < n; j++) {
            if (words.contains(s.substring(i, j + 1))) {
                dp[i] = Math.min(dp[i], dp[j + 1]);
            }
        }
    }

    return dp[0];
}`,
      },
      run: runExtraCharactersHashSet,
      lineExplanations: {
        python: {
          1: 'Define function taking the string and dictionary',
          2: 'Hash set of dictionary words — O(1) average membership',
          3: 'Length of the string',
          4: 'dp[i] = fewest extra characters in s[i:]; dp[n] = 0',
          6: 'Fill the table right to left',
          7: 'Baseline: leave s[i] unused, so cost is dp[i+1] + 1',
          8: 'Try every substring starting at i',
          9: 'Is s[i:j+1] a dictionary word?',
          10: 'Yes — that chunk is free, pay only dp[j+1]',
          12: 'dp[0] answers the whole string',
        },
        javascript: {
          1: 'Define function taking the string and dictionary',
          2: 'Hash set of dictionary words — O(1) average membership',
          3: 'Length of the string',
          4: 'dp[i] = fewest extra characters in s[i:]; dp[n] = 0',
          6: 'Fill the table right to left',
          7: 'Baseline: leave s[i] unused, so cost is dp[i+1] + 1',
          8: 'Try every substring starting at i',
          9: 'Is s.slice(i, j+1) a dictionary word?',
          10: 'Yes — that chunk is free, pay only dp[j+1]',
          15: 'dp[0] answers the whole string',
        },
        java: {
          1: 'Define method taking the string and dictionary',
          2: 'Hash set of dictionary words — O(1) average membership',
          3: 'Length of the string',
          4: 'dp[i] = fewest extra characters in s[i:]; dp[n] = 0',
          6: 'Fill the table right to left',
          7: 'Baseline: leave s.charAt(i) unused, cost dp[i+1] + 1',
          8: 'Try every substring starting at i',
          9: 'Is s.substring(i, j+1) a dictionary word?',
          10: 'Yes — that chunk is free, pay only dp[j+1]',
          15: 'dp[0] answers the whole string',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Trie node: children map plus an end-of-word flag',
      2: 'Initialize the node',
      3: 'Child nodes keyed by character',
      4: 'True only when a dictionary word ends here',
      6: 'Define function taking the string and dictionary',
      7: 'Empty trie root',
      8: 'Insert every dictionary word',
      9: 'Start each insertion at the root',
      10: 'Walk the word character by character',
      11: 'Missing edge for this character',
      12: 'Create the child node',
      13: 'Descend into the child',
      14: 'Mark the final node as a complete word',
      16: 'Length of the string',
      17: 'dp[i] = fewest extra characters in s[i:]; dp[n] = 0',
      19: 'Fill the table right to left so dp[i+1] is already known',
      20: 'Baseline: leave s[i] unused, so cost is dp[i+1] + 1',
      21: 'Every candidate word starting at i begins at the root',
      22: 'Extend the match one character at a time',
      23: 'No trie edge for s[j]',
      24: 'No dictionary word starts at i and reaches j — stop early',
      25: 'Follow the edge to the next trie node',
      26: 'This node marks the end of a dictionary word',
      27: 's[i..j] is free, so the cost is just dp[j+1]',
      29: 'dp[0] answers the whole string',
    },
    javascript: {
      1: 'Define function taking the string and dictionary',
      2: 'Empty trie root: children map plus end-of-word flag',
      3: 'Insert every dictionary word',
      4: 'Start each insertion at the root',
      5: 'Walk the word character by character',
      6: 'Missing edge for this character',
      7: 'Create the child node',
      9: 'Descend into the child',
      11: 'Mark the final node as a complete word',
      14: 'Length of the string',
      15: 'dp[i] = fewest extra characters in s[i:]; dp[n] = 0',
      17: 'Fill the table right to left so dp[i+1] is already known',
      18: 'Baseline: leave s[i] unused, so cost is dp[i+1] + 1',
      19: 'Every candidate word starting at i begins at the root',
      20: 'Extend the match one character at a time',
      21: 'No trie edge for s[j] — no word reaches this far, stop',
      22: 'Follow the edge to the next trie node',
      23: 'This node marks the end of a dictionary word',
      24: 's[i..j] is free, so the cost is just dp[j+1]',
      29: 'dp[0] answers the whole string',
    },
    java: {
      1: 'Trie node class',
      2: 'Child nodes keyed by character',
      3: 'True only when a dictionary word ends here',
      6: 'Define method taking the string and dictionary',
      7: 'Empty trie root',
      8: 'Insert every dictionary word',
      9: 'Start each insertion at the root',
      10: 'Walk the word character by character',
      11: 'Create the child node only if the edge is missing',
      12: 'Descend into the child',
      14: 'Mark the final node as a complete word',
      17: 'Length of the string',
      18: 'dp[i] = fewest extra characters in s[i:]; dp[n] = 0',
      20: 'Fill the table right to left so dp[i+1] is already known',
      21: 'Baseline: leave s.charAt(i) unused, cost dp[i+1] + 1',
      22: 'Every candidate word starting at i begins at the root',
      23: 'Extend the match one character at a time',
      24: 'No trie edge for s[j] — no word reaches this far, stop',
      25: 'Follow the edge to the next trie node',
      26: 'This node marks the end of a dictionary word',
      27: 's[i..j] is free, so the cost is just dp[j+1]',
      32: 'dp[0] answers the whole string',
    },
  },
};
