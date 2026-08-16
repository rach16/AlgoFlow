import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runEncodeDecodeEscape(input: unknown): AlgorithmStep[] {
  const strs = input as string[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { chars: [...strs] },
    highlights: [],
    message: `Escape-delimiter encoding: escape "/" as "//" inside words, then end each word with "/:" — no lengths stored`,
    codeLine: 1,
  });

  // === ENCODING PHASE ===
  let encoded = '';
  for (let i = 0; i < strs.length; i++) {
    const word = strs[i];
    const escaped = word.split('/').join('//');
    encoded += escaped + '/:';

    steps.push({
      state: { chars: [...strs], encoded, currentWord: word },
      highlights: [i],
      pointers: { i },
      message: `Encode "${word}" -> "${escaped}/:" (escape any "/" first, then append the "/:" terminator). Encoded so far: "${encoded}"`,
      codeLine: 4,
      action: 'insert',
    });
  }

  steps.push({
    state: { chars: encoded.split(''), encoded },
    highlights: [],
    message: `Fully encoded string: "${encoded}"`,
    codeLine: 5,
    action: 'found',
  });

  // === DECODING PHASE ===
  const decoded: string[] = [];

  steps.push({
    state: { chars: encoded.split(''), decoded: [] },
    highlights: [],
    message: `Now decode by scanning for unescaped "/:" delimiters: "${encoded}"`,
    codeLine: 7,
  });

  let pos = 0;
  let cur = '';
  let curIndices: number[] = [];

  while (pos < encoded.length) {
    if (encoded[pos] === '/' && encoded[pos + 1] === ':') {
      // Show the scanned word characters first
      if (curIndices.length > 0) {
        steps.push({
          state: { chars: encoded.split(''), decoded: [...decoded] },
          highlights: [...curIndices],
          pointers: { i: pos },
          message: `Scanned "${cur}" character by character — plain chars are just copied`,
          codeLine: 18,
          action: 'visit',
        });
      }

      decoded.push(cur);
      steps.push({
        state: { chars: encoded.split(''), decoded: [...decoded] },
        highlights: [pos, pos + 1],
        secondary: [...curIndices],
        pointers: { i: pos },
        message: `"/:" at index ${pos} terminates the word -> "${cur}". Decoded so far: [${decoded.map((s) => `"${s}"`).join(', ')}]`,
        codeLine: 11,
        action: 'found',
      });

      cur = '';
      curIndices = [];
      pos += 2;
    } else if (encoded[pos] === '/' && encoded[pos + 1] === '/') {
      cur += '/';
      curIndices.push(pos, pos + 1);
      steps.push({
        state: { chars: encoded.split(''), decoded: [...decoded] },
        highlights: [pos, pos + 1],
        pointers: { i: pos },
        message: `"//" at index ${pos} is an ESCAPED slash — it decodes to a literal "/" inside the word, not a delimiter`,
        codeLine: 15,
        action: 'visit',
      });
      pos += 2;
    } else {
      cur += encoded[pos];
      curIndices.push(pos);
      pos += 1;
    }
  }

  steps.push({
    state: { chars: [...decoded], result: decoded },
    highlights: [],
    message: `Decoded result: [${decoded.map((s) => `"${s}"`).join(', ')}]`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

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
  optimalApproachName: 'Length Prefix',
  approaches: [
    {
      id: 'escape-delimiter',
      name: 'Escape Delimiter',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of prefixing each word with its length, terminate words with a "/:" delimiter and escape any real "/" inside a word as "//" — the decoder scans for unescaped delimiters.',
      code: {
        python: `def encode(strs):
    res = ""
    for s in strs:
        res += s.replace("/", "//") + "/:"
    return res

def decode(s):
    res, cur, i = [], "", 0
    while i < len(s):
        if s[i] == "/" and s[i+1] == ":":
            res.append(cur)
            cur = ""
            i += 2
        elif s[i] == "/" and s[i+1] == "/":
            cur += "/"
            i += 2
        else:
            cur += s[i]
            i += 1
    return res`,
        javascript: `function encode(strs) {
    let res = "";
    for (const s of strs) {
        res += s.replaceAll("/", "//") + "/:";
    }
    return res;
}

function decode(s) {
    const res = [];
    let cur = "", i = 0;
    while (i < s.length) {
        if (s[i] === "/" && s[i+1] === ":") {
            res.push(cur);
            cur = "";
            i += 2;
        } else if (s[i] === "/" && s[i+1] === "/") {
            cur += "/";
            i += 2;
        } else {
            cur += s[i];
            i += 1;
        }
    }
    return res;
}`,
        java: `public static String encode(List<String> strs) {
    StringBuilder res = new StringBuilder();
    for (String s : strs) {
        res.append(s.replace("/", "//")).append("/:");
    }
    return res.toString();
}

public static List<String> decode(String s) {
    List<String> res = new ArrayList<>();
    StringBuilder cur = new StringBuilder();
    int i = 0;
    while (i < s.length()) {
        if (s.charAt(i) == '/' && s.charAt(i + 1) == ':') {
            res.add(cur.toString());
            cur.setLength(0);
            i += 2;
        } else if (s.charAt(i) == '/' && s.charAt(i + 1) == '/') {
            cur.append('/');
            i += 2;
        } else {
            cur.append(s.charAt(i));
            i += 1;
        }
    }
    return res;
}`,
      },
      run: runEncodeDecodeEscape,
      lineExplanations: {
        python: {
          1: 'Define encode function taking list of strings',
          2: 'Initialize empty result string',
          3: 'Iterate over each string',
          4: 'Escape "/" as "//" then terminate the word with "/:"',
          5: 'Return the encoded string',
          7: 'Define decode function taking encoded string',
          8: 'Result list, current word buffer, and scan index',
          9: 'Scan the encoded string one token at a time',
          10: 'An unescaped "/:" marks the end of a word',
          11: 'Emit the buffered word into the result',
          12: 'Reset the buffer for the next word',
          13: 'Jump past both delimiter characters',
          14: '"//" is an escaped slash, not a delimiter',
          15: 'It decodes to one literal "/" in the word',
          16: 'Jump past both escape characters',
          17: 'Any other character is plain text',
          18: 'Copy it into the current word buffer',
          19: 'Advance one character',
          20: 'Return decoded list of strings',
        },
        javascript: {
          1: 'Define encode function taking array of strings',
          2: 'Initialize empty result string',
          3: 'Iterate over each string',
          4: 'Escape "/" as "//" then terminate the word with "/:"',
          6: 'Return the encoded string',
          9: 'Define decode function taking encoded string',
          10: 'Initialize empty result array',
          11: 'Current word buffer and scan index',
          12: 'Scan the encoded string one token at a time',
          13: 'An unescaped "/:" marks the end of a word',
          14: 'Emit the buffered word into the result',
          15: 'Reset the buffer for the next word',
          16: 'Jump past both delimiter characters',
          17: '"//" is an escaped slash, not a delimiter',
          18: 'It decodes to one literal "/" in the word',
          19: 'Jump past both escape characters',
          21: 'Any other character is copied into the buffer',
          22: 'Advance one character',
          25: 'Return decoded array of strings',
        },
        java: {
          1: 'Define encode taking list of strings',
          2: 'Create StringBuilder for efficient concat',
          3: 'Iterate over each string',
          4: 'Escape "/" as "//" then terminate the word with "/:"',
          6: 'Return the encoded string',
          9: 'Define decode taking encoded string',
          10: 'Initialize result list',
          11: 'StringBuilder buffers the current word',
          12: 'Scan index starts at 0',
          13: 'Scan the encoded string one token at a time',
          14: 'An unescaped "/:" marks the end of a word',
          15: 'Emit the buffered word into the result',
          16: 'Reset the buffer for the next word',
          17: 'Jump past both delimiter characters',
          18: '"//" is an escaped slash, not a delimiter',
          19: 'It decodes to one literal "/" in the word',
          20: 'Jump past both escape characters',
          22: 'Any other character is copied into the buffer',
          23: 'Advance one character',
          26: 'Return decoded list of strings',
        },
      },
    },
  ],
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
