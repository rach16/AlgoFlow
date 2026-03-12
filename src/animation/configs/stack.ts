import { createConfig, stackTemplate } from '../templates';

const t = stackTemplate;

export const stackConfigs = [
  createConfig(t, {
    algorithmId: 'valid-parentheses',
    title: 'Valid Parentheses',
    subtitle: 'Check if brackets are balanced',
    codeSnippet: `def isValid(s):
    stack = []
    mapping = {')':'(', ']':'[', '}':'{'}
    for c in s:
        if c in mapping:
            if not stack or stack[-1] != mapping[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return not stack`,
  }),
  createConfig(t, {
    algorithmId: 'min-stack',
    title: 'Min Stack',
    subtitle: 'Stack with O(1) getMin',
    codeSnippet: `class MinStack:
    def __init__(self):
        self.stack = []
        self.minStack = []
    def push(self, val):
        self.stack.append(val)
        val = min(val, self.minStack[-1] if self.minStack else val)
        self.minStack.append(val)
    def pop(self):
        self.stack.pop()
        self.minStack.pop()
    def getMin(self):
        return self.minStack[-1]`,
  }),
  createConfig(t, {
    algorithmId: 'evaluate-reverse-polish-notation',
    title: 'Evaluate Reverse Polish Notation',
    subtitle: 'Evaluate postfix expression',
    codeSnippet: `def evalRPN(tokens):
    stack = []
    for t in tokens:
        if t in '+-*/':
            b, a = stack.pop(), stack.pop()
            if t == '+': stack.append(a + b)
            elif t == '-': stack.append(a - b)
            elif t == '*': stack.append(a * b)
            else: stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack[0]`,
  }),
  createConfig(t, {
    algorithmId: 'generate-parentheses',
    title: 'Generate Parentheses',
    subtitle: 'Generate all valid parentheses combinations',
    codeSnippet: `def generateParenthesis(n):
    result = []
    def backtrack(s, open, close):
        if len(s) == 2 * n:
            result.append(s)
            return
        if open < n:
            backtrack(s + '(', open + 1, close)
        if close < open:
            backtrack(s + ')', open, close + 1)
    backtrack('', 0, 0)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'daily-temperatures',
    title: 'Daily Temperatures',
    subtitle: 'Days until warmer temperature',
    codeSnippet: `def dailyTemperatures(temperatures):
    result = [0] * len(temperatures)
    stack = []
    for i, t in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'car-fleet',
    title: 'Car Fleet',
    subtitle: 'Count car fleets reaching target',
    codeSnippet: `def carFleet(target, position, speed):
    pairs = sorted(zip(position, speed), reverse=True)
    stack = []
    for pos, spd in pairs:
        time = (target - pos) / spd
        if not stack or time > stack[-1]:
            stack.append(time)
    return len(stack)`,
  }),
  createConfig(t, {
    algorithmId: 'largest-rectangle-in-histogram',
    title: 'Largest Rectangle in Histogram',
    subtitle: 'Find largest rectangular area',
    codeSnippet: `def largestRectangleArea(heights):
    stack = []
    maxArea = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            maxArea = max(maxArea, height * (i - idx))
            start = idx
        stack.append((start, h))
    for idx, height in stack:
        maxArea = max(maxArea, height * (len(heights) - idx))
    return maxArea`,
  }),
];
