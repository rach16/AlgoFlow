import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MergeStringsInput {
  word1: string;
  word2: string;
}

function runMergeStringsAlternately(input: unknown): AlgorithmStep[] {
  const { word1, word2 } = input as MergeStringsInput;
  const steps: AlgorithmStep[] = [];
  const merged: string[] = [];

  steps.push({
    state: { chars: [], word1, word2 },
    highlights: [],
    message: `Interleave "${word1}" and "${word2}" starting with word1. One pointer per string, both advancing together`,
    codeLine: 1,
  });

  let i = 0;
  let j = 0;

  steps.push({
    state: { chars: [], word1, word2 },
    highlights: [],
    pointers: { i, j },
    message: `i=0 walks "${word1}", j=0 walks "${word2}". The merged array below grows one character at a time`,
    codeLine: 2,
  });

  while (i < word1.length && j < word2.length) {
    merged.push(word1[i]);
    steps.push({
      state: { chars: [...merged], word1, word2 },
      highlights: [merged.length - 1],
      pointers: { fromWord1: merged.length - 1 },
      message: `Both strings still have characters, so word1 goes first: append word1[${i}]='${word1[i]}' → "${merged.join('')}"`,
      codeLine: 6,
      action: 'insert',
    });

    merged.push(word2[j]);
    steps.push({
      state: { chars: [...merged], word1, word2 },
      highlights: [merged.length - 1],
      pointers: { fromWord2: merged.length - 1 },
      message: `Then word2: append word2[${j}]='${word2[j]}' → "${merged.join('')}"`,
      codeLine: 7,
      action: 'insert',
    });

    i++;
    j++;

    steps.push({
      state: { chars: [...merged], word1, word2 },
      highlights: [],
      pointers: { i, j },
      message: `Advance both pointers: i=${i}, j=${j}. The loop stops as soon as EITHER string runs out — ${i < word1.length && j < word2.length ? 'both still have characters, keep going' : `word${i < word1.length ? '2' : '1'} is exhausted, so exit`}`,
      codeLine: 8,
    });
  }

  const rest1 = word1.slice(i);
  steps.push({
    state: { chars: [...merged, ...rest1.split('')], word1, word2 },
    highlights: rest1.split('').map((_, k) => merged.length + k),
    message: rest1
      ? `word1 has "${rest1}" left over (i=${i}). Once one string is exhausted the rest is appended as-is — no more alternating is possible`
      : `word1 is fully consumed (i=${i}), so there is no tail to append`,
    codeLine: 11,
    action: rest1 ? 'insert' : 'compare',
  });
  merged.push(...rest1.split(''));

  const rest2 = word2.slice(j);
  steps.push({
    state: { chars: [...merged, ...rest2.split('')], word1, word2 },
    highlights: rest2.split('').map((_, k) => merged.length + k),
    message: rest2
      ? `word2 has "${rest2}" left over (j=${j}) — append it too`
      : `word2 is fully consumed (j=${j}), nothing to append`,
    codeLine: 12,
    action: rest2 ? 'insert' : 'compare',
  });
  merged.push(...rest2.split(''));

  steps.push({
    state: { chars: [...merged], word1, word2, result: merged.join('') },
    highlights: [],
    message: `Merged string: "${merged.join('')}". Each character is touched once, so O(m+n) time`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

function runMergeStringsSingleIndex(input: unknown): AlgorithmStep[] {
  const { word1, word2 } = input as MergeStringsInput;
  const steps: AlgorithmStep[] = [];
  const merged: string[] = [];
  const n = Math.max(word1.length, word2.length);

  steps.push({
    state: { chars: [], word1, word2 },
    highlights: [],
    message: `One index instead of two: i runs to max(${word1.length}, ${word2.length}) = ${n} and each string contributes only if it still has an index i`,
    codeLine: 1,
  });

  steps.push({
    state: { chars: [], word1, word2 },
    highlights: [],
    message: `Because both pointers always move together in this problem, i and j are never different — one counter is enough, and the leftover tail needs no special case`,
    codeLine: 4,
  });

  for (let i = 0; i < n; i++) {
    if (i < word1.length) {
      merged.push(word1[i]);
      steps.push({
        state: { chars: [...merged], word1, word2 },
        highlights: [merged.length - 1],
        pointers: { i: merged.length - 1 },
        message: `i=${i} < len(word1)=${word1.length} → append word1[${i}]='${word1[i]}' → "${merged.join('')}"`,
        codeLine: 6,
        action: 'insert',
      });
    } else {
      steps.push({
        state: { chars: [...merged], word1, word2 },
        highlights: [],
        message: `i=${i} is past the end of word1 (length ${word1.length}) — skip it, no bounds error`,
        codeLine: 5,
      });
    }

    if (i < word2.length) {
      merged.push(word2[i]);
      steps.push({
        state: { chars: [...merged], word1, word2 },
        highlights: [merged.length - 1],
        pointers: { i: merged.length - 1 },
        message: `i=${i} < len(word2)=${word2.length} → append word2[${i}]='${word2[i]}' → "${merged.join('')}"`,
        codeLine: 8,
        action: 'insert',
      });
    } else {
      steps.push({
        state: { chars: [...merged], word1, word2 },
        highlights: [],
        message: `i=${i} is past the end of word2 (length ${word2.length}) — skip it`,
        codeLine: 7,
      });
    }
  }

  steps.push({
    state: { chars: [...merged], word1, word2, result: merged.join('') },
    highlights: [],
    message: `Merged string: "${merged.join('')}" — same answer, same O(m+n) time, and the two bounds checks replace the explicit tail append`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const mergeStringsAlternately: Algorithm = {
  id: 'merge-strings-alternately',
  name: 'Merge Strings Alternately',
  category: 'Two Pointers',
  difficulty: 'Easy',
  timeComplexity: 'O(m + n)',
  spaceComplexity: 'O(m + n)',
  pattern: 'Two Pointers — one index per sequence',
  description:
    'Merge two strings by adding letters in alternating order, starting with the first string. If one string is longer than the other, append the additional letters onto the end of the merged string.',
  problemUrl: 'https://leetcode.com/problems/merge-strings-alternately/',
  code: {
    python: `def mergeAlternately(word1, word2):
    i, j = 0, 0
    merged = []

    while i < len(word1) and j < len(word2):
        merged.append(word1[i])
        merged.append(word2[j])
        i += 1
        j += 1

    merged.append(word1[i:])
    merged.append(word2[j:])
    return ''.join(merged)`,
    javascript: `function mergeAlternately(word1, word2) {
    let i = 0;
    let j = 0;
    const merged = [];

    while (i < word1.length && j < word2.length) {
        merged.push(word1[i]);
        merged.push(word2[j]);
        i++;
        j++;
    }

    merged.push(word1.slice(i));
    merged.push(word2.slice(j));
    return merged.join('');
}`,
    java: `public static String mergeAlternately(String word1, String word2) {
    StringBuilder merged = new StringBuilder();
    int i = 0;
    int j = 0;

    while (i < word1.length() && j < word2.length()) {
        merged.append(word1.charAt(i));
        merged.append(word2.charAt(j));
        i++;
        j++;
    }

    merged.append(word1.substring(i));
    merged.append(word2.substring(j));
    return merged.toString();
}`,
  },
  defaultInput: { word1: 'abc', word2: 'pqrs' },
  run: runMergeStringsAlternately,
  optimalApproachName: 'Two Pointers',
  approaches: [
    {
      id: 'single-index-loop',
      name: 'Single Index Loop',
      timeComplexity: 'O(m + n)',
      spaceComplexity: 'O(m + n)',
      description:
        'Run one counter up to max(len(word1), len(word2)) and guard each append with a bounds check, which folds the leftover-tail handling into the loop instead of a separate step.',
      code: {
        python: `def mergeAlternately(word1, word2):
    merged = []

    for i in range(max(len(word1), len(word2))):
        if i < len(word1):
            merged.append(word1[i])
        if i < len(word2):
            merged.append(word2[i])

    return ''.join(merged)`,
        javascript: `function mergeAlternately(word1, word2) {
    const merged = [];

    for (let i = 0; i < Math.max(word1.length, word2.length); i++) {
        if (i < word1.length) merged.push(word1[i]);
        if (i < word2.length) merged.push(word2[i]);
    }

    return merged.join('');
}`,
        java: `public static String mergeAlternately(String word1, String word2) {
    StringBuilder merged = new StringBuilder();

    for (int i = 0; i < Math.max(word1.length(), word2.length()); i++) {
        if (i < word1.length()) merged.append(word1.charAt(i));
        if (i < word2.length()) merged.append(word2.charAt(i));
    }

    return merged.toString();
}`,
      },
      run: runMergeStringsSingleIndex,
      lineExplanations: {
        python: {
          1: 'Define function taking both words',
          2: 'Collect characters in a list, then join once at the end',
          4: 'One counter covers the longer of the two words',
          5: 'Only take from word1 while index i is in range',
          6: 'Append word1[i]',
          7: 'Only take from word2 while index i is in range',
          8: 'Append word2[i]',
          10: 'Join the collected characters into the answer',
        },
        javascript: {
          1: 'Define function taking both words',
          2: 'Collect characters in an array, then join once at the end',
          4: 'One counter covers the longer of the two words',
          5: 'Only take from word1 while index i is in range',
          6: 'Only take from word2 while index i is in range',
          9: 'Join the collected characters into the answer',
        },
        java: {
          1: 'Define function taking both words',
          2: 'StringBuilder avoids O(n^2) string concatenation',
          4: 'One counter covers the longer of the two words',
          5: 'Only take from word1 while index i is in range',
          6: 'Only take from word2 while index i is in range',
          9: 'Build the final string',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking both words',
      2: 'A pointer for each word, both starting at 0',
      3: 'Collect characters in a list, then join once at the end',
      5: 'Alternate only while BOTH words still have characters',
      6: 'word1 contributes first on every round',
      7: 'then word2',
      8: 'Advance the word1 pointer',
      9: 'Advance the word2 pointer',
      11: 'Whatever is left of word1 goes on unchanged',
      12: 'Whatever is left of word2 goes on unchanged',
      13: 'Join the collected characters into the answer',
    },
    javascript: {
      1: 'Define function taking both words',
      2: 'Pointer into word1',
      3: 'Pointer into word2',
      4: 'Collect characters in an array, then join once at the end',
      6: 'Alternate only while BOTH words still have characters',
      7: 'word1 contributes first on every round',
      8: 'then word2',
      9: 'Advance the word1 pointer',
      10: 'Advance the word2 pointer',
      13: 'Whatever is left of word1 goes on unchanged',
      14: 'Whatever is left of word2 goes on unchanged',
      15: 'Join the collected pieces into the answer',
    },
    java: {
      1: 'Define function taking both words',
      2: 'StringBuilder avoids O(n^2) string concatenation',
      3: 'Pointer into word1',
      4: 'Pointer into word2',
      6: 'Alternate only while BOTH words still have characters',
      7: 'word1 contributes first on every round',
      8: 'then word2',
      9: 'Advance the word1 pointer',
      10: 'Advance the word2 pointer',
      13: 'Whatever is left of word1 goes on unchanged',
      14: 'Whatever is left of word2 goes on unchanged',
      15: 'Build the final string',
    },
  },
};
