import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestCommonPrefix(input: unknown): AlgorithmStep[] {
  const strs = input as string[];
  const steps: AlgorithmStep[] = [];
  const first = strs[0] ?? '';

  const columnMap = (i: number): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const s of strs) {
      map[s] = i < s.length ? s[i] : '(end of word)';
    }
    return map;
  };

  steps.push({
    state: { chars: first.split(''), hashMap: columnMap(0) },
    highlights: [],
    message: `Vertical scanning: walk column by column down "${first}" and require every other word to agree on that character.`,
    codeLine: 4,
  });

  for (let i = 0; i < first.length; i++) {
    const c = first[i];

    steps.push({
      state: { chars: first.split(''), hashMap: columnMap(i) },
      highlights: [i],
      secondary: Array.from({ length: i }, (_, k) => k),
      pointers: { i },
      message: `Column ${i}: the reference character is '${c}'. Check it against every other word.`,
      codeLine: 5,
      action: 'visit',
    });

    for (let j = 1; j < strs.length; j++) {
      const s = strs[j];

      if (i === s.length || s[i] !== c) {
        const answer = first.slice(0, i);
        steps.push({
          state: { chars: first.split(''), hashMap: columnMap(i), result: answer },
          highlights: [i],
          secondary: Array.from({ length: i }, (_, k) => k),
          pointers: { i },
          message:
            i === s.length
              ? `"${s}" ran out of characters at column ${i} — the prefix can't be longer than the shortest word. Answer: "${answer}"`
              : `"${s}" has '${s[i]}' at column ${i}, not '${c}' — mismatch, stop here. Answer: "${answer}"`,
          codeLine: 8,
          action: 'found',
        });
        return steps;
      }

      steps.push({
        state: { chars: first.split(''), hashMap: columnMap(i) },
        highlights: [i],
        secondary: Array.from({ length: i }, (_, k) => k),
        pointers: { i },
        message: `"${s}"[${i}] = '${s[i]}' matches '${c}' — still a common prefix so far.`,
        codeLine: 7,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { chars: first.split(''), hashMap: columnMap(first.length - 1), result: first },
    highlights: first.split('').map((_, i) => i),
    message: `Every column of "${first}" matched all words — the whole first word is the common prefix: "${first}"`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runLongestCommonPrefixBinarySearch(input: unknown): AlgorithmStep[] {
  const strs = input as string[];
  const steps: AlgorithmStep[] = [];
  const first = strs[0] ?? '';
  const minLen = strs.reduce((m, s) => Math.min(m, s.length), Infinity);

  let lo = 0;
  let hi = minLen === Infinity ? 0 : minLen;

  steps.push({
    state: { chars: first.split(''), hashMap: { lo: String(lo), hi: String(hi) } },
    highlights: [],
    message: `If a prefix of length L works, every shorter length works too — that monotonicity lets us binary search L in [0, ${hi}] (${hi} = shortest word length).`,
    codeLine: 4,
  });

  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    const prefix = first.slice(0, mid);

    steps.push({
      state: { chars: first.split(''), hashMap: { lo: String(lo), hi: String(hi), mid: String(mid) } },
      highlights: Array.from({ length: mid }, (_, k) => k),
      pointers: { mid: mid - 1 },
      message: `lo=${lo}, hi=${hi} → try length ${mid}: does every word start with "${prefix}"?`,
      codeLine: 6,
      action: 'visit',
    });

    let ok = true;
    for (const s of strs) {
      if (!s.startsWith(prefix)) {
        ok = false;
        steps.push({
          state: { chars: first.split(''), hashMap: { lo: String(lo), hi: String(hi), mid: String(mid) } },
          highlights: Array.from({ length: mid }, (_, k) => k),
          pointers: { mid: mid - 1 },
          message: `"${s}" does not start with "${prefix}" — length ${mid} is too long.`,
          codeLine: 8,
          action: 'compare',
        });
        break;
      }
      steps.push({
        state: { chars: first.split(''), hashMap: { lo: String(lo), hi: String(hi), mid: String(mid) } },
        highlights: Array.from({ length: mid }, (_, k) => k),
        pointers: { mid: mid - 1 },
        message: `"${s}" starts with "${prefix}" ✓`,
        codeLine: 8,
        action: 'compare',
      });
    }

    if (ok) {
      lo = mid;
      steps.push({
        state: { chars: first.split(''), hashMap: { lo: String(lo), hi: String(hi) } },
        highlights: Array.from({ length: lo }, (_, k) => k),
        message: `Length ${mid} works — keep it and search longer: lo = ${lo}`,
        codeLine: 9,
      });
    } else {
      hi = mid - 1;
      steps.push({
        state: { chars: first.split(''), hashMap: { lo: String(lo), hi: String(hi) } },
        highlights: Array.from({ length: lo }, (_, k) => k),
        message: `Length ${mid} fails — everything ≥ ${mid} fails too: hi = ${hi}`,
        codeLine: 11,
      });
    }
  }

  const answer = first.slice(0, lo);
  steps.push({
    state: { chars: first.split(''), hashMap: { lo: String(lo), hi: String(hi) }, result: answer },
    highlights: Array.from({ length: lo }, (_, k) => k),
    message: `lo and hi met at ${lo} — longest common prefix is "${answer}"`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const longestCommonPrefix: Algorithm = {
  id: 'longest-common-prefix',
  name: 'Longest Common Prefix',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(S)',
  spaceComplexity: 'O(1)',
  pattern: 'String — vertical scan column by column',
  description:
    'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".',
  problemUrl: 'https://leetcode.com/problems/longest-common-prefix/',
  code: {
    python: `def longestCommonPrefix(strs):
    if not strs:
        return ""
    for i in range(len(strs[0])):
        c = strs[0][i]
        for s in strs[1:]:
            if i == len(s) or s[i] != c:
                return strs[0][:i]
    return strs[0]`,
    javascript: `function longestCommonPrefix(strs) {
    if (strs.length === 0) return "";
    for (let i = 0; i < strs[0].length; i++) {
        const c = strs[0][i];
        for (let j = 1; j < strs.length; j++) {
            if (i === strs[j].length || strs[j][i] !== c) {
                return strs[0].slice(0, i);
            }
        }
    }
    return strs[0];
}`,
    java: `public static String longestCommonPrefix(String[] strs) {
    if (strs.length == 0) return "";
    for (int i = 0; i < strs[0].length(); i++) {
        char c = strs[0].charAt(i);
        for (int j = 1; j < strs.length; j++) {
            if (i == strs[j].length() || strs[j].charAt(i) != c) {
                return strs[0].substring(0, i);
            }
        }
    }
    return strs[0];
}`,
  },
  defaultInput: ['flower', 'flow', 'flight'],
  run: runLongestCommonPrefix,
  optimalApproachName: 'Vertical Scanning',
  approaches: [
    {
      id: 'binary-search-length',
      name: 'Binary Search on Length',
      timeComplexity: 'O(S log m)',
      spaceComplexity: 'O(1)',
      description:
        'Prefix validity is monotonic — if length L is common then so is L-1 — so instead of scanning columns left to right, binary search the answer length between 0 and the shortest word.',
      code: {
        python: `def longestCommonPrefix(strs):
    if not strs:
        return ""
    lo, hi = 0, min(len(s) for s in strs)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        prefix = strs[0][:mid]
        if all(s.startswith(prefix) for s in strs):
            lo = mid
        else:
            hi = mid - 1
    return strs[0][:lo]`,
        javascript: `function longestCommonPrefix(strs) {
    if (strs.length === 0) return "";
    let lo = 0, hi = Math.min(...strs.map(s => s.length));
    while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2);
        const prefix = strs[0].slice(0, mid);
        if (strs.every(s => s.startsWith(prefix))) {
            lo = mid;
        } else {
            hi = mid - 1;
        }
    }
    return strs[0].slice(0, lo);
}`,
        java: `public static String longestCommonPrefix(String[] strs) {
    if (strs.length == 0) return "";
    int lo = 0, hi = strs[0].length();
    for (String s : strs) hi = Math.min(hi, s.length());
    while (lo < hi) {
        int mid = (lo + hi + 1) / 2;
        String prefix = strs[0].substring(0, mid);
        boolean ok = true;
        for (String s : strs) {
            if (!s.startsWith(prefix)) { ok = false; break; }
        }
        if (ok) lo = mid;
        else hi = mid - 1;
    }
    return strs[0].substring(0, lo);
}`,
      },
      run: runLongestCommonPrefixBinarySearch,
      lineExplanations: {
        python: {
          1: 'Define function taking the list of strings',
          2: 'Empty input has no common prefix',
          4: 'Search space: prefix length 0 up to the shortest word',
          5: 'Narrow until lo and hi meet on the answer',
          6: 'Bias mid upward so lo = mid always makes progress',
          7: 'Candidate prefix of that length, taken from the first word',
          8: 'Do all words start with it?',
          9: 'Yes — this length is achievable, try longer',
          11: 'No — this length and everything above it fail',
          12: 'lo is the longest achievable prefix length',
        },
        javascript: {
          1: 'Define function taking the array of strings',
          2: 'Empty input has no common prefix',
          3: 'Search space: prefix length 0 up to the shortest word',
          4: 'Narrow until lo and hi meet on the answer',
          5: 'Bias mid upward so lo = mid always makes progress',
          6: 'Candidate prefix of that length, taken from the first word',
          7: 'Do all words start with it?',
          8: 'Yes — this length is achievable, try longer',
          10: 'No — this length and everything above it fail',
          13: 'lo is the longest achievable prefix length',
        },
        java: {
          1: 'Define function taking the array of strings',
          2: 'Empty input has no common prefix',
          4: 'hi becomes the shortest word length',
          5: 'Narrow until lo and hi meet on the answer',
          6: 'Bias mid upward so lo = mid always makes progress',
          7: 'Candidate prefix of that length',
          9: 'Test every word against the candidate',
          12: 'Achievable — try a longer prefix',
          13: 'Not achievable — shrink the upper bound',
          15: 'lo is the longest achievable prefix length',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the list of strings',
      2: 'Guard against an empty input list',
      3: 'No strings means no common prefix',
      4: 'Walk the columns of the first word left to right',
      5: 'The character every other word must match at this column',
      6: 'Compare that column across all remaining words',
      7: 'Word ended early, or its character differs',
      8: 'Return everything matched before this column',
      9: 'All columns matched — the first word is itself the prefix',
    },
    javascript: {
      1: 'Define function taking the array of strings',
      2: 'No strings means no common prefix',
      3: 'Walk the columns of the first word left to right',
      4: 'The character every other word must match at this column',
      5: 'Compare that column across all remaining words',
      6: 'Word ended early, or its character differs',
      7: 'Return everything matched before this column',
      11: 'All columns matched — the first word is itself the prefix',
    },
    java: {
      1: 'Define function taking the array of strings',
      2: 'No strings means no common prefix',
      3: 'Walk the columns of the first word left to right',
      4: 'The character every other word must match at this column',
      5: 'Compare that column across all remaining words',
      6: 'Word ended early, or its character differs',
      7: 'Return everything matched before this column',
      11: 'All columns matched — the first word is itself the prefix',
    },
  },
};
