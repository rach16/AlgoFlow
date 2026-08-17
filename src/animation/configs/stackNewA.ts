import { createConfig, stackTemplate } from '../templates';

const t = stackTemplate;

export const stackNewAConfigs = [
  createConfig(t, {
    algorithmId: 'baseball-game',
    title: 'Baseball Game',
    subtitle: 'Replay the scores, undo with a pop',
    codeSnippet: `def calPoints(operations):
    stack = []

    for op in operations:
        if op == '+':
            stack.append(stack[-1] + stack[-2])
        elif op == 'D':
            stack.append(2 * stack[-1])
        elif op == 'C':
            stack.pop()
        else:
            stack.append(int(op))

    return sum(stack)`,
  }),
  createConfig(t, {
    algorithmId: 'implement-stack-using-queues',
    title: 'Implement Stack Using Queues',
    subtitle: 'Rotate after each push so the newest sits in front',
    codeSnippet: `from collections import deque

class MyStack:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())

    def pop(self):
        return self.q.popleft()

    def top(self):
        return self.q[0]

    def empty(self):
        return len(self.q) == 0`,
  }),
  createConfig(t, {
    algorithmId: 'implement-queue-using-stacks',
    title: 'Implement Queue using Stacks',
    subtitle: 'Two stacks with a lazy, amortized transfer',
    codeSnippet: `class MyQueue:
    def __init__(self):
        self.input = []
        self.output = []

    def push(self, x):
        self.input.append(x)

    def pop(self):
        self.peek()
        return self.output.pop()

    def peek(self):
        if not self.output:
            while self.input:
                self.output.append(self.input.pop())
        return self.output[-1]

    def empty(self):
        return not self.input and not self.output`,
  }),
  createConfig(t, {
    algorithmId: 'asteroid-collision',
    title: 'Asteroid Collision',
    subtitle: 'Pop right-movers until the left-mover resolves',
    codeSnippet: `def asteroidCollision(asteroids):
    stack = []

    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.pop()
            elif stack[-1] == -a:
                stack.pop()
                alive = False
            else:
                alive = False
        if alive:
            stack.append(a)

    return stack`,
  }),
];
