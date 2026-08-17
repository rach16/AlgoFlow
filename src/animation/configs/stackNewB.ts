import { createConfig, stackTemplate } from '../templates';

const t = stackTemplate;

export const stackNewBConfigs = [
  createConfig(t, {
    algorithmId: 'online-stock-span',
    title: 'Online Stock Span',
    subtitle: 'Decreasing stack of (price, span) pairs absorbs cheaper days',
    codeSnippet: `class StockSpanner:
    def __init__(self):
        self.stack = []  # (price, span) pairs

    def next(self, price):
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span`,
  }),
  createConfig(t, {
    algorithmId: 'simplify-path',
    title: 'Simplify Path',
    subtitle: 'Push directories, pop on "..", skip "." and empty pieces',
    codeSnippet: `def simplifyPath(path):
    stack = []
    for part in path.split('/'):
        if part == '' or part == '.':
            continue
        if part == '..':
            if stack:
                stack.pop()
        else:
            stack.append(part)
    return '/' + '/'.join(stack)`,
  }),
  createConfig(t, {
    algorithmId: 'decode-string',
    title: 'Decode String',
    subtitle: 'Two stacks park the repeat count and prefix at every "["',
    codeSnippet: `def decodeString(s):
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
  }),
  createConfig(t, {
    algorithmId: 'max-frequency-stack',
    title: 'Maximum Frequency Stack',
    subtitle: 'Frequency map plus one stack per frequency level',
    codeSnippet: `class FreqStack:
    def __init__(self):
        self.freq = {}
        self.group = {}
        self.maxFreq = 0

    def push(self, val):
        f = self.freq.get(val, 0) + 1
        self.freq[val] = f
        self.maxFreq = max(self.maxFreq, f)
        self.group.setdefault(f, []).append(val)

    def pop(self):
        val = self.group[self.maxFreq].pop()
        self.freq[val] -= 1
        if not self.group[self.maxFreq]:
            self.maxFreq -= 1
        return val`,
  }),
];
