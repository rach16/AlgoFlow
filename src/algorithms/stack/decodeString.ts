import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runDecodeString(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const chars = s.split('');
  const steps: AlgorithmStep[] = [];
  const countStack: number[] = [];
  const stringStack: string[] = [];
  let cur = '';
  let num = 0;

  const frames = () =>
    countStack.map((c, idx) => `×${c} after "${stringStack[idx]}"`);

  steps.push({
    state: { chars: [...chars], stack: [] },
    highlights: [],
    message:
      'Build the answer left to right in `cur`. Every "[" opens a nested block, so park the repeat count and the text built so far on two parallel stacks and start `cur` fresh.',
    codeLine: 4,
  });

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];

    if (c >= '0' && c <= '9') {
      num = num * 10 + Number(c);
      steps.push({
        state: { chars: [...chars], stack: frames() },
        highlights: [i],
        pointers: { i },
        message: `Digit '${c}' — accumulate into the pending count: num = ${num}. (Digits can be multi-digit, so shift by 10 rather than overwrite.)`,
        codeLine: 8,
        action: 'visit',
      });
    } else if (c === '[') {
      countStack.push(num);
      stringStack.push(cur);
      const savedNum = num;
      const savedCur = cur;
      num = 0;
      cur = '';
      steps.push({
        state: { chars: [...chars], stack: frames() },
        highlights: [i],
        pointers: { i },
        message: `'[' opens a block. Push the count ${savedNum} and the text "${savedCur}" built so far, then reset cur = "" so the inner block is decoded on its own.`,
        codeLine: 10,
        action: 'push',
      });
    } else if (c === ']') {
      const prefix = stringStack.pop() as string;
      const times = countStack.pop() as number;
      const inner = cur;
      cur = prefix + inner.repeat(times);
      steps.push({
        state: { chars: [...chars], stack: frames() },
        highlights: [i],
        pointers: { i },
        message: `']' closes the block. Pop count ${times} and prefix "${prefix}": cur = "${prefix}" + "${inner}" × ${times} = "${cur}". The finished block folds into its parent.`,
        codeLine: 15,
        action: 'pop',
      });
    } else {
      cur += c;
      steps.push({
        state: { chars: [...chars], stack: frames() },
        highlights: [i],
        pointers: { i },
        message: `Letter '${c}' — append to the current block: cur = "${cur}"`,
        codeLine: 17,
        action: 'visit',
      });
    }
  }

  steps.push({
    state: { chars: [...chars], stack: frames(), result: cur },
    highlights: [],
    message: `Both stacks are empty, so every block closed. Decoded string: "${cur}"`,
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

function runDecodeStringRecursive(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const chars = s.split('');
  const steps: AlgorithmStep[] = [];
  const frames: { start: number; result: string; num: number }[] = [];

  const display = () =>
    frames.map((f, d) => `parse(${f.start}) depth ${d}: "${f.result}" num=${f.num}`);

  steps.push({
    state: { chars: [...chars], stack: [] },
    highlights: [],
    message:
      'Same grammar, no explicit stacks: let recursion hold the state. parse(i) decodes one block and returns (text, index just past its "]"). The call stack IS the stack.',
    codeLine: 20,
  });

  function parse(i: number): [string, number] {
    const frame = { start: i, result: '', num: 0 };
    frames.push(frame);

    steps.push({
      state: { chars: [...chars], stack: display() },
      highlights: i < chars.length ? [i] : [],
      ...(i < chars.length ? { pointers: { i } } : {}),
      message: `Enter parse(${i}) at depth ${frames.length - 1} — a fresh frame with its own empty result and its own pending count.`,
      codeLine: 2,
      action: 'push',
    });

    while (i < s.length) {
      const c = s[i];

      if (c >= '0' && c <= '9') {
        frame.num = frame.num * 10 + Number(c);
        i += 1;
        steps.push({
          state: { chars: [...chars], stack: display() },
          highlights: [i - 1],
          pointers: { i: i - 1 },
          message: `Digit '${c}' — this frame's pending count becomes ${frame.num}.`,
          codeLine: 8,
          action: 'visit',
        });
      } else if (c === '[') {
        steps.push({
          state: { chars: [...chars], stack: display() },
          highlights: [i],
          pointers: { i },
          message: `'[' — recurse into parse(${i + 1}) to decode the inner block. Nothing is saved by hand; this frame's result and num survive on the call stack.`,
          codeLine: 11,
          action: 'visit',
        });
        const [inner, next] = parse(i + 1);
        const times = frame.num;
        frame.result += inner.repeat(times);
        frame.num = 0;
        i = next;
        steps.push({
          state: { chars: [...chars], stack: display() },
          highlights: i < chars.length ? [i] : [],
          ...(i < chars.length ? { pointers: { i } } : {}),
          message: `Child returned "${inner}". Repeat it ${times}× and glue it on: result = "${frame.result}". Resume reading at index ${i}.`,
          codeLine: 12,
        });
      } else if (c === ']') {
        const done = frame.result;
        frames.pop();
        steps.push({
          state: { chars: [...chars], stack: display() },
          highlights: [i],
          pointers: { i },
          message: `']' — this block is complete. Return "${done}" and index ${i + 1} to the caller; the frame disappears, which is exactly a pop.`,
          codeLine: 15,
          action: 'pop',
        });
        return [done, i + 1];
      } else {
        frame.result += c;
        i += 1;
        steps.push({
          state: { chars: [...chars], stack: display() },
          highlights: [i - 1],
          pointers: { i: i - 1 },
          message: `Letter '${c}' — append to this frame's result: "${frame.result}"`,
          codeLine: 17,
          action: 'visit',
        });
      }
    }

    const done = frame.result;
    frames.pop();
    return [done, i];
  }

  const [answer] = parse(0);

  steps.push({
    state: { chars: [...chars], stack: display(), result: answer },
    highlights: [],
    message: `Outermost call returned "${answer}" — identical to the two-stack version, with recursion depth standing in for stack height.`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

export const decodeString: Algorithm = {
  id: 'decode-string',
  name: 'Decode String',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(n · maxRepeat)',
  spaceComplexity: 'O(n)',
  pattern: 'Stack — push context on "[", pop and expand on "]"',
  description:
    'Given an encoded string where k[encoded_string] means the bracketed part repeats exactly k times, return its decoded form. Brackets may be nested arbitrarily deep and k is always a positive integer.',
  problemUrl: 'https://leetcode.com/problems/decode-string/',
  code: {
    python: `def decodeString(s):
    countStack = []
    stringStack = []
    cur = ''
    num = 0
    for c in s:
        if c.isdigit():
            num = num * 10 + int(c)
        elif c == '[':
            countStack.append(num)
            stringStack.append(cur)
            num = 0
            cur = ''
        elif c == ']':
            cur = stringStack.pop() + cur * countStack.pop()
        else:
            cur += c
    return cur`,
    javascript: `function decodeString(s) {
    const countStack = [];
    const stringStack = [];
    let cur = '';
    let num = 0;

    for (const c of s) {
        if (c >= '0' && c <= '9') {
            num = num * 10 + Number(c);
        } else if (c === '[') {
            countStack.push(num);
            stringStack.push(cur);
            num = 0;
            cur = '';
        } else if (c === ']') {
            cur = stringStack.pop() + cur.repeat(countStack.pop());
        } else {
            cur += c;
        }
    }

    return cur;
}`,
    java: `public static String decodeString(String s) {
    Deque<Integer> countStack = new ArrayDeque<>();
    Deque<StringBuilder> stringStack = new ArrayDeque<>();
    StringBuilder cur = new StringBuilder();
    int num = 0;

    for (char c : s.toCharArray()) {
        if (Character.isDigit(c)) {
            num = num * 10 + (c - '0');
        } else if (c == '[') {
            countStack.push(num);
            stringStack.push(cur);
            num = 0;
            cur = new StringBuilder();
        } else if (c == ']') {
            StringBuilder prev = stringStack.pop();
            prev.append(cur.toString().repeat(countStack.pop()));
            cur = prev;
        } else {
            cur.append(c);
        }
    }

    return cur.toString();
}`,
  },
  defaultInput: '2[ab3[c]]',
  run: runDecodeString,
  optimalApproachName: 'Two Stacks',
  approaches: [
    {
      id: 'recursive-descent',
      name: 'Recursive Descent',
      timeComplexity: 'O(n · maxRepeat)',
      spaceComplexity: 'O(d) call stack for nesting depth d',
      description:
        'Treat the encoding as a tiny grammar and parse it recursively — the language runtime\'s call stack replaces the two hand-managed stacks.',
      code: {
        python: `def decodeString(s):
    def parse(i):
        result = ''
        num = 0
        while i < len(s):
            c = s[i]
            if c.isdigit():
                num = num * 10 + int(c)
                i += 1
            elif c == '[':
                inner, i = parse(i + 1)
                result += inner * num
                num = 0
            elif c == ']':
                return result, i + 1
            else:
                result += c
                i += 1
        return result, i
    return parse(0)[0]`,
        javascript: `function decodeString(s) {
    function parse(i) {
        let result = '';
        let num = 0;
        while (i < s.length) {
            const c = s[i];
            if (c >= '0' && c <= '9') {
                num = num * 10 + Number(c);
                i++;
            } else if (c === '[') {
                const [inner, next] = parse(i + 1);
                result += inner.repeat(num);
                num = 0;
                i = next;
            } else if (c === ']') {
                return [result, i + 1];
            } else {
                result += c;
                i++;
            }
        }
        return [result, i];
    }
    return parse(0)[0];
}`,
        java: `public static String decodeString(String s) {
    return parse(s, new int[] { 0 });
}

private static String parse(String s, int[] i) {
    StringBuilder result = new StringBuilder();
    int num = 0;
    while (i[0] < s.length()) {
        char c = s.charAt(i[0]);
        if (Character.isDigit(c)) {
            num = num * 10 + (c - '0');
            i[0]++;
        } else if (c == '[') {
            i[0]++;
            String inner = parse(s, i);
            result.append(inner.repeat(num));
            num = 0;
        } else if (c == ']') {
            i[0]++;
            return result.toString();
        } else {
            result.append(c);
            i[0]++;
        }
    }
    return result.toString();
}`,
      },
      run: runDecodeStringRecursive,
      lineExplanations: {
        python: {
          1: 'Take the encoded string',
          2: 'parse(i) decodes one block starting at index i',
          3: 'Text this frame has built so far',
          4: 'Repeat count waiting for its "["',
          5: 'Read until the string or this block ends',
          6: 'Current character',
          7: 'Digits build a multi-digit repeat count',
          8: 'Shift the accumulated count and add the new digit',
          9: 'Advance past the digit',
          10: 'A "[" starts a nested block',
          11: 'Recurse — the call stack remembers this frame for us',
          12: 'Glue the decoded child on, repeated num times',
          13: 'The count has been consumed',
          14: 'A "]" ends this block',
          15: 'Return the text and the index just past the bracket',
          16: 'Otherwise it is a plain letter',
          17: 'Append it to this frame\'s text',
          18: 'Advance past the letter',
          19: 'End of string — return what this frame built',
          20: 'Decode from index 0 and keep only the text',
        },
        javascript: {
          1: 'Take the encoded string',
          2: 'parse(i) decodes one block starting at index i',
          3: 'Text this frame has built so far',
          4: 'Repeat count waiting for its "["',
          5: 'Read until the string or this block ends',
          6: 'Current character',
          7: 'Digits build a multi-digit repeat count',
          8: 'Shift the accumulated count and add the new digit',
          10: 'A "[" starts a nested block',
          11: 'Recurse — the call stack remembers this frame for us',
          12: 'Glue the decoded child on, repeated num times',
          14: 'Resume where the child stopped',
          15: 'A "]" ends this block',
          16: 'Return the text and the index just past the bracket',
          18: 'Otherwise append the plain letter',
          22: 'End of string — return what this frame built',
          24: 'Decode from index 0 and keep only the text',
        },
        java: {
          1: 'Public entry point over the encoded string',
          2: 'Share a one-element array so the index survives across calls',
          5: 'parse decodes one block starting at the shared index',
          6: 'Text this frame has built so far',
          7: 'Repeat count waiting for its "["',
          8: 'Read until the string or this block ends',
          9: 'Current character',
          10: 'Digits build a multi-digit repeat count',
          11: 'Shift the accumulated count and add the new digit',
          13: 'A "[" starts a nested block',
          15: 'Recurse — the call stack remembers this frame for us',
          16: 'Glue the decoded child on, repeated num times',
          18: 'A "]" ends this block',
          20: 'Return the text this frame built',
          22: 'Otherwise append the plain letter',
          26: 'End of string — return what this frame built',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Take the encoded string',
      2: 'Stack of pending repeat counts, one per open bracket',
      3: 'Stack of text built before each open bracket',
      4: 'Text of the block currently being built',
      5: 'Repeat count being read digit by digit',
      6: 'Scan the string once, left to right',
      7: 'A digit extends the pending count',
      8: 'Shift left by one decimal place and add the digit',
      9: 'A "[" opens a nested block',
      10: 'Park the count that applies to this block',
      11: 'Park everything built before the block',
      12: 'Reset the count for the next bracket',
      13: 'Start the inner block with an empty buffer',
      14: 'A "]" closes the innermost block',
      15: 'Repeat the finished block and re-attach the parked prefix',
      16: 'Anything else is a plain letter',
      17: 'Append it to the current block',
      18: 'Both stacks are empty, so cur holds the full decoding',
    },
    javascript: {
      1: 'Take the encoded string',
      2: 'Stack of pending repeat counts, one per open bracket',
      3: 'Stack of text built before each open bracket',
      4: 'Text of the block currently being built',
      5: 'Repeat count being read digit by digit',
      7: 'Scan the string once, left to right',
      8: 'A digit extends the pending count',
      9: 'Shift left by one decimal place and add the digit',
      10: 'A "[" opens a nested block',
      11: 'Park the count that applies to this block',
      12: 'Park everything built before the block',
      13: 'Reset the count for the next bracket',
      14: 'Start the inner block with an empty buffer',
      15: 'A "]" closes the innermost block',
      16: 'Repeat the finished block and re-attach the parked prefix',
      17: 'Anything else is a plain letter',
      18: 'Append it to the current block',
      22: 'Both stacks are empty, so cur holds the full decoding',
    },
    java: {
      1: 'Take the encoded string',
      2: 'Stack of pending repeat counts, one per open bracket',
      3: 'Stack of text built before each open bracket',
      4: 'Buffer for the block currently being built',
      5: 'Repeat count being read digit by digit',
      7: 'Scan the string once, left to right',
      8: 'A digit extends the pending count',
      9: 'Shift left by one decimal place and add the digit',
      10: 'A "[" opens a nested block',
      11: 'Park the count that applies to this block',
      12: 'Park everything built before the block',
      13: 'Reset the count for the next bracket',
      14: 'Start the inner block with a fresh buffer',
      15: 'A "]" closes the innermost block',
      16: 'Recover the text parked before the block',
      17: 'Append the finished block repeated count times',
      18: 'That combined text becomes the current block',
      20: 'Anything else is a plain letter to append',
      24: 'Both stacks are empty, so cur holds the full decoding',
    },
  },
};
