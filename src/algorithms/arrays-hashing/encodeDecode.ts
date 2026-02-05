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
  },
  defaultInput: ['lint', 'code', 'love', 'you'],
  run: runEncodeDecode,
};
