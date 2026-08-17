import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type AlienInput = { words: string[]; order: string };

function buildIndex(order: string): Record<string, number> {
  const index: Record<string, number> = {};
  for (let i = 0; i < order.length; i++) index[order[i]] = i;
  return index;
}

/** chars strip showing "w1 | w2" so both words share one row. */
function pairChars(w1: string, w2: string): string[] {
  return [...w1.split(''), '|', ...w2.split('')];
}

function runVerifyingAlienDictionary(input: unknown): AlgorithmStep[] {
  const { words, order } = input as AlienInput;
  const steps: AlgorithmStep[] = [];
  const index = buildIndex(order);

  steps.push({
    state: {
      chars: order.split(''),
      hashMap: { ...index },
      result: 'checking...',
    },
    highlights: [],
    message: `The alien alphabet is "${order}". Turn it into a lookup table letter → rank, so comparing two letters becomes comparing two numbers.`,
    codeLine: 2,
    action: 'insert',
  } as AlgorithmStep);

  let sorted = true;
  let verdict = '';

  outer: for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const strip = pairChars(w1, w2);
    const offset = w1.length + 1;

    steps.push({
      state: {
        chars: strip,
        hashMap: { pair: `${w1} vs ${w2}` },
        result: 'checking...',
      },
      highlights: [],
      message: `Sorted order only depends on neighbours, so check pair ${i + 1}: "${w1}" must not come after "${w2}".`,
      codeLine: 4,
    } as AlgorithmStep);

    for (let j = 0; j < w1.length; j++) {
      if (j === w2.length) {
        sorted = false;
        verdict = `"${w2}" is a prefix of "${w1}"`;
        steps.push({
          state: {
            chars: strip,
            hashMap: { [w1[j]]: index[w1[j]] },
            result: false,
          },
          highlights: [j],
          message: `"${w2}" ran out of letters while "${w1}" still has '${w1[j]}'. A prefix must come first, so "${w1}" before "${w2}" is out of order → false.`,
          codeLine: 7,
          action: 'found',
        } as AlgorithmStep);
        break outer;
      }

      const c1 = w1[j];
      const c2 = w2[j];

      if (c1 === c2) {
        steps.push({
          state: {
            chars: strip,
            hashMap: { [c1]: index[c1] },
            result: 'checking...',
          },
          highlights: [j],
          secondary: [offset + j],
          message: `Position ${j}: '${c1}' = '${c2}' — a tie tells us nothing yet, slide to the next letter.`,
          codeLine: 8,
          action: 'compare',
        } as AlgorithmStep);
        continue;
      }

      const r1 = index[c1];
      const r2 = index[c2];

      if (r1 > r2) {
        sorted = false;
        verdict = `'${c1}' (rank ${r1}) outranks '${c2}' (rank ${r2})`;
        steps.push({
          state: {
            chars: strip,
            hashMap: { [c1]: r1, [c2]: r2 },
            result: false,
          },
          highlights: [j],
          secondary: [offset + j],
          message: `Position ${j}: '${c1}' has rank ${r1} but '${c2}' has rank ${r2} — ${r1} > ${r2}, so "${w1}" belongs AFTER "${w2}". Not sorted → false.`,
          codeLine: 10,
          action: 'found',
        } as AlgorithmStep);
        break outer;
      }

      steps.push({
        state: {
          chars: strip,
          hashMap: { [c1]: r1, [c2]: r2 },
          result: 'checking...',
        },
        highlights: [j],
        secondary: [offset + j],
        message: `Position ${j}: '${c1}' rank ${r1} < '${c2}' rank ${r2} — this pair is settled, later letters can't change it. Break out and check the next pair.`,
        codeLine: 11,
        action: 'compare',
      } as AlgorithmStep);
      break;
    }
  }

  steps.push({
    state: {
      chars: words.join(' | ').split(''),
      hashMap: { ...index },
      result: sorted,
    },
    highlights: [],
    message: sorted
      ? `Every adjacent pair was in order, so the whole list is sorted under "${order}" → true.`
      : `Broke the ordering rule: ${verdict} → false.`,
    codeLine: sorted ? 12 : 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runVerifyingAlienDictionaryMapped(input: unknown): AlgorithmStep[] {
  const { words, order } = input as AlienInput;
  const steps: AlgorithmStep[] = [];
  const index = buildIndex(order);

  steps.push({
    state: {
      chars: order.split(''),
      hashMap: { ...index },
      result: 'checking...',
    },
    highlights: [],
    message: `Same lookup table letter → rank from "${order}". This time we rewrite each word entirely in alien ranks first.`,
    codeLine: 2,
    action: 'insert',
  } as AlgorithmStep);

  const mapped: number[][] = [];
  for (const w of words) {
    const codes = w.split('').map(c => index[c]);
    mapped.push(codes);

    steps.push({
      state: {
        chars: w.split(''),
        hashMap: Object.fromEntries(mapped.map((m, k) => [words[k], m.join(',')])),
        result: 'checking...',
      },
      highlights: w.split('').map((_, k) => k),
      message: `"${w}" becomes [${codes.join(', ')}]. Once words are lists of numbers, alien order is just ordinary list comparison.`,
      codeLine: 3,
      action: 'insert',
    } as AlgorithmStep);
  }

  const lexLess = (a: number[], b: number[]): boolean => {
    const n = Math.min(a.length, b.length);
    for (let k = 0; k < n; k++) {
      if (a[k] !== b[k]) return a[k] < b[k];
    }
    return a.length <= b.length;
  };

  let sorted = true;

  for (let i = 0; i < mapped.length - 1; i++) {
    const a = mapped[i];
    const b = mapped[i + 1];
    const ok = lexLess(a, b);

    steps.push({
      state: {
        chars: pairChars(words[i], words[i + 1]),
        hashMap: { [words[i]]: a.join(','), [words[i + 1]]: b.join(',') },
        result: ok ? 'checking...' : false,
      },
      highlights: [],
      message: ok
        ? `[${a.join(', ')}] <= [${b.join(', ')}] — "${words[i]}" and "${words[i + 1]}" are in order.`
        : `[${a.join(', ')}] > [${b.join(', ')}] — "${words[i]}" sorts after "${words[i + 1]}". The list is not sorted → false.`,
      codeLine: ok ? 5 : 6,
      action: ok ? 'compare' : 'found',
    } as AlgorithmStep);

    if (!ok) {
      sorted = false;
      break;
    }
  }

  steps.push({
    state: {
      chars: words.join(' | ').split(''),
      hashMap: Object.fromEntries(mapped.map((m, k) => [words[k], m.join(',')])),
      result: sorted,
    },
    highlights: [],
    message: sorted
      ? `Each mapped list is <= the next, so the words are sorted in the alien alphabet → true.`
      : `A mapped list was greater than the one after it → false.`,
    codeLine: sorted ? 7 : 6,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const verifyingAlienDictionary: Algorithm = {
  id: 'verifying-alien-dictionary',
  name: 'Verifying an Alien Dictionary',
  category: 'Graphs',
  difficulty: 'Easy',
  timeComplexity: 'O(n·k)',
  spaceComplexity: 'O(1)',
  pattern: 'Hash Map — rank letters by alien order, compare adjacent words',
  description:
    'In an alien language the lowercase letters still appear in some fixed but unknown order. Given a list of words written in that language and the string order giving its alphabet, return true if the words are sorted lexicographically according to that order.',
  problemUrl: 'https://leetcode.com/problems/verifying-an-alien-dictionary/',
  code: {
    python: `def isAlienSorted(words, order):
    index = {c: i for i, c in enumerate(order)}
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        for j in range(len(w1)):
            if j == len(w2):
                return False
            if w1[j] != w2[j]:
                if index[w1[j]] > index[w2[j]]:
                    return False
                break
    return True`,
    javascript: `function isAlienSorted(words, order) {
    const index = {};
    for (let i = 0; i < order.length; i++) index[order[i]] = i;
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i], w2 = words[i + 1];
        for (let j = 0; j < w1.length; j++) {
            if (j === w2.length) return false;
            if (w1[j] !== w2[j]) {
                if (index[w1[j]] > index[w2[j]]) return false;
                break;
            }
        }
    }
    return true;
}`,
    java: `public static boolean isAlienSorted(String[] words, String order) {
    int[] index = new int[26];
    for (int i = 0; i < order.length(); i++) {
        index[order.charAt(i) - 'a'] = i;
    }
    for (int i = 0; i < words.length - 1; i++) {
        String w1 = words[i], w2 = words[i + 1];
        for (int j = 0; j < w1.length(); j++) {
            if (j == w2.length()) return false;
            if (w1.charAt(j) != w2.charAt(j)) {
                if (index[w1.charAt(j) - 'a'] > index[w2.charAt(j) - 'a']) {
                    return false;
                }
                break;
            }
        }
    }
    return true;
}`,
  },
  defaultInput: {
    words: ['hello', 'hero', 'leetcode', 'let'],
    order: 'hlabcdefgijkmnopqrstuvwxyz',
  },
  run: runVerifyingAlienDictionary,
  optimalApproachName: 'Rank Map + Adjacent Compare',
  approaches: [
    {
      id: 'translate-and-compare',
      name: 'Translate to Ranks',
      timeComplexity: 'O(n·k)',
      spaceComplexity: 'O(n·k)',
      description:
        'Rewrites every word as a list of alien ranks up front so the check collapses into ordinary list comparison — shorter to write, but it materialises all the translated words instead of comparing letters in place.',
      code: {
        python: `def isAlienSorted(words, order):
    index = {c: i for i, c in enumerate(order)}
    mapped = [[index[c] for c in w] for w in words]
    for i in range(len(mapped) - 1):
        if mapped[i] > mapped[i + 1]:
            return False
    return True`,
        javascript: `function isAlienSorted(words, order) {
    const index = {};
    for (let i = 0; i < order.length; i++) index[order[i]] = i;
    const mapped = words.map(w => [...w].map(c => index[c]));
    const le = (a, b) => {
        for (let k = 0; k < Math.min(a.length, b.length); k++) {
            if (a[k] !== b[k]) return a[k] < b[k];
        }
        return a.length <= b.length;
    };
    for (let i = 0; i < mapped.length - 1; i++) {
        if (!le(mapped[i], mapped[i + 1])) return false;
    }
    return true;
}`,
        java: `public static boolean isAlienSorted(String[] words, String order) {
    int[] index = new int[26];
    for (int i = 0; i < order.length(); i++) {
        index[order.charAt(i) - 'a'] = i;
    }
    int[][] mapped = new int[words.length][];
    for (int i = 0; i < words.length; i++) {
        mapped[i] = new int[words[i].length()];
        for (int j = 0; j < words[i].length(); j++) {
            mapped[i][j] = index[words[i].charAt(j) - 'a'];
        }
    }
    for (int i = 0; i < mapped.length - 1; i++) {
        if (!lessOrEqual(mapped[i], mapped[i + 1])) return false;
    }
    return true;
}

private static boolean lessOrEqual(int[] a, int[] b) {
    int n = Math.min(a.length, b.length);
    for (int k = 0; k < n; k++) {
        if (a[k] != b[k]) return a[k] < b[k];
    }
    return a.length <= b.length;
}`,
      },
      run: runVerifyingAlienDictionaryMapped,
      lineExplanations: {
        python: {
          1: 'Define function taking the words and the alien alphabet',
          2: 'Map each letter to its rank in the alien order',
          3: 'Rewrite every word as a list of ranks',
          4: 'Walk adjacent translated words',
          5: 'Python list comparison is exactly alien lexicographic order',
          6: 'Any inversion means the list is unsorted',
          7: 'No inversions anywhere — sorted',
        },
        javascript: {
          1: 'Define function taking the words and the alien alphabet',
          2: 'Rank lookup table',
          3: 'Fill it from the alien alphabet',
          4: 'Rewrite every word as an array of ranks',
          5: 'Helper: lexicographic <= on two rank arrays',
          6: 'Compare position by position',
          7: 'First differing rank decides',
          9: 'All shared ranks equal — shorter word wins',
          11: 'Walk adjacent translated words',
          12: 'Any inversion means the list is unsorted',
          14: 'No inversions anywhere — sorted',
        },
        java: {
          1: 'Define method taking the words and the alien alphabet',
          2: 'Rank lookup array indexed by letter',
          3: 'Walk the alien alphabet',
          4: 'Record each letter rank',
          6: 'Room for every translated word',
          7: 'Translate word i',
          8: 'Allocate its rank array',
          9: 'Walk its letters',
          10: 'Store the alien rank of each letter',
          13: 'Walk adjacent translated words',
          14: 'Any inversion means the list is unsorted',
          16: 'No inversions anywhere — sorted',
          19: 'Helper: lexicographic <= on two rank arrays',
          20: 'Compare over the shared prefix length',
          21: 'Position by position',
          22: 'First differing rank decides',
          24: 'All shared ranks equal — shorter word wins',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the words and the alien alphabet',
      2: 'Map each letter to its rank in the alien order',
      3: 'Sorted-ness only needs adjacent pairs to hold',
      4: 'Take the pair of neighbouring words',
      5: 'Scan them letter by letter',
      6: 'w2 ran out first, so w1 is longer with w2 as prefix',
      7: 'A prefix must come first — unsorted',
      8: 'First position where the words disagree',
      9: 'Compare their alien ranks',
      10: 'w1 outranks w2 — this pair is inverted',
      11: 'w1 is smaller here; later letters are irrelevant',
      12: 'Every adjacent pair held — sorted',
    },
    javascript: {
      1: 'Define function taking the words and the alien alphabet',
      2: 'Rank lookup table',
      3: 'Fill it from the alien alphabet',
      4: 'Sorted-ness only needs adjacent pairs to hold',
      5: 'Take the pair of neighbouring words',
      6: 'Scan them letter by letter',
      7: 'w2 ran out first — prefix must come first, unsorted',
      8: 'First position where the words disagree',
      9: 'w1 outranks w2 — this pair is inverted',
      10: 'w1 is smaller here; later letters are irrelevant',
      14: 'Every adjacent pair held — sorted',
    },
    java: {
      1: 'Define method taking the words and the alien alphabet',
      2: 'Rank lookup array indexed by letter',
      3: 'Walk the alien alphabet',
      4: 'Record each letter rank',
      6: 'Sorted-ness only needs adjacent pairs to hold',
      7: 'Take the pair of neighbouring words',
      8: 'Scan them letter by letter',
      9: 'w2 ran out first — prefix must come first, unsorted',
      10: 'First position where the words disagree',
      11: 'Compare their alien ranks',
      12: 'w1 outranks w2 — this pair is inverted',
      14: 'w1 is smaller here; later letters are irrelevant',
      18: 'Every adjacent pair held — sorted',
    },
  },
};
