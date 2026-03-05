import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runEncodeDecode(input: unknown): AlgorithmStep[] {
  const strs = input as string[];
  const steps: AlgorithmStep[] = [];

  // Initial state
  steps.push({
    state: { chars: [...strs] },
    highlights: [],
    message: `Encode and decode: [${strs.map(s => `"${s}"`).join(', ')}]`,
    codeLine: 1,
  });

  // === ENCODING PHASE ===
  let encoded = '';
  for (let i = 0; i < strs.length; i++) {
    const word = strs[i];
    const part = `${word.length}#${word}`;
    encoded += part;

    steps.push({
      state: {
        chars: [...strs],
        encoded: encoded,
        currentWord: word,
      },
      highlights: [i],
      pointers: { i },
      message: `Encode "${word}" -> "${word.length}#${word}". Encoded so far: "${encoded}"`,
      codeLine: 3,
      action: 'insert',
    });
  }

  // Show full encoded string
  steps.push({
    state: {
      chars: encoded.split(''),
      encoded,
    },
    highlights: [],
    message: `Fully encoded string: "${encoded}"`,
    codeLine: 4,
    action: 'found',
  });

  // === DECODING PHASE ===
  const decoded: string[] = [];
  let pos = 0;

  steps.push({
    state: {
      chars: encoded.split(''),
      decoded: [...decoded],
    },
    highlights: [],
    message: `Now decoding: "${encoded}"`,
    codeLine: 6,
  });

  while (pos < encoded.length) {
    // Find the '#' delimiter
    let j = pos;
    while (encoded[j] !== '#') {
      j++;
    }
    const length = parseInt(encoded.substring(pos, j));

    // Highlight the length digits
    const lengthIndices: number[] = [];
    for (let idx = pos; idx < j; idx++) {
      lengthIndices.push(idx);
    }

    steps.push({
      state: {
        chars: encoded.split(''),
        decoded: [...decoded],
      },
      highlights: lengthIndices,
      pointers: { pos, '#': j },
      message: `Read length = ${length} from position ${pos} to ${j - 1}, '#' at index ${j}`,
      codeLine: 8,
      action: 'visit',
    });

    // Extract the word
    const word = encoded.substring(j + 1, j + 1 + length);
    decoded.push(word);

    // Highlight word characters
    const wordIndices: number[] = [];
    for (let idx = j + 1; idx < j + 1 + length; idx++) {
      wordIndices.push(idx);
    }

    steps.push({
      state: {
        chars: encoded.split(''),
        decoded: [...decoded],
      },
      highlights: wordIndices,
      pointers: { start: j + 1, end: j + length },
      message: `Extract "${word}" (${length} chars from index ${j + 1}). Decoded so far: [${decoded.map(s => `"${s}"`).join(', ')}]`,
      codeLine: 9,
      action: 'found',
    });

    pos = j + 1 + length;
  }

  // Final result
  steps.push({
    state: {
      chars: [...decoded],
      result: decoded,
    },
    highlights: [],
    message: `Decoded result: [${decoded.map(s => `"${s}"`).join(', ')}]`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const encodeDecode: Algorithm = {
  id: 'encode-decode-strings',
  name: 'Encode and Decode Strings',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'String — length-prefix encoding',
  description:
    'Design an algorithm to encode a list of strings to a single string and decode it back to the original list of strings.',
  problemUrl: 'https://leetcode.com/problems/encode-and-decode-strings/',
  code: {
    python: `def encode(strs):
    res = ""
    for s in strs:
        res += str(len(s)) + "#" + s
    return res

def decode(s):
    res, i = [], 0
    while i < len(s):
        j = i
        while s[j] != "#":
            j += 1
        length = int(s[i:j])
        res.append(s[j+1 : j+1+length])
        i = j + 1 + length
    return res`,
    javascript: `function encode(strs) {
    let res = "";
    for (const s of strs) {
        res += s.length + "#" + s;
    }
    return res;
}

function decode(s) {
    const res = [];
    let i = 0;
    while (i < s.length) {
        let j = i;
        while (s[j] !== "#") j++;
        const length = parseInt(s.substring(i, j));
        res.push(s.substring(j+1, j+1+length));
        i = j + 1 + length;
    }
    return res;
}`,
    java: `public static String encode(List<String> strs) {
    StringBuilder res = new StringBuilder();
    for (String s : strs) {
        res.append(s.length()).append("#").append(s);
    }
    return res.toString();
}

public static List<String> decode(String s) {
    List<String> res = new ArrayList<>();
    int i = 0;
    while (i < s.length()) {
        int j = i;
        while (s.charAt(j) != '#') j++;
        int length = Integer.parseInt(s.substring(i, j));
        res.add(s.substring(j + 1, j + 1 + length));
        i = j + 1 + length;
    }
    return res;
}`,
  },
  defaultInput: ['lint', 'code', 'love', 'you'],
  run: runEncodeDecode,
  lineExplanations: {
    python: {
      1: 'Define encode function taking list of strings',
      2: 'Initialize empty result string',
      3: 'Iterate over each string',
      4: 'Append length + "#" + string to result',
      5: 'Return the encoded string',
      7: 'Define decode function taking encoded string',
      8: 'Initialize result list and index pointer',
      9: 'Loop while characters remain to decode',
      10: 'Start scanning for the "#" delimiter',
      11: 'Advance j until "#" is found',
      12: 'Increment j past non-"#" characters',
      13: 'Parse length from digits before "#"',
      14: 'Extract word of parsed length after "#"',
      15: 'Move pointer past the extracted word',
      16: 'Return decoded list of strings',
    },
    javascript: {
      1: 'Define encode function taking array of strings',
      2: 'Initialize empty result string',
      3: 'Iterate over each string',
      4: 'Append length + "#" + string to result',
      6: 'Return the encoded string',
      9: 'Define decode function taking encoded string',
      10: 'Initialize empty result array',
      11: 'Initialize index pointer at 0',
      12: 'Loop while characters remain to decode',
      13: 'Start scanning for the "#" delimiter',
      14: 'Advance j until "#" is found',
      15: 'Parse length from substring before "#"',
      16: 'Extract word of parsed length after "#"',
      17: 'Move pointer past the extracted word',
      19: 'Return decoded array of strings',
    },
    java: {
      1: 'Define encode taking list of strings',
      2: 'Create StringBuilder for efficient concat',
      3: 'Iterate over each string',
      4: 'Append length + "#" + string to builder',
      6: 'Return the encoded string',
      9: 'Define decode taking encoded string',
      10: 'Initialize result list',
      11: 'Initialize index pointer at 0',
      12: 'Loop while characters remain to decode',
      13: 'Start scanning for the "#" delimiter',
      14: 'Advance j until "#" is found',
      15: 'Parse length from substring before "#"',
      16: 'Extract word of parsed length after "#"',
      17: 'Move pointer past the extracted word',
      19: 'Return decoded list of strings',
    },
  },
};
