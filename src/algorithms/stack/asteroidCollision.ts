import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runAsteroidCollision(input: unknown): AlgorithmStep[] {
  const asteroids = [...(input as number[])];
  const steps: AlgorithmStep[] = [];
  const stack: number[] = [];

  steps.push({
    state: { nums: [...asteroids], stack: [] },
    highlights: [],
    message:
      'A collision only ever happens between a right-mover already on the stack and a new left-mover. Positive = moving right, negative = moving left.',
    codeLine: 2,
  });

  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    let alive = true;

    steps.push({
      state: { nums: [...asteroids], stack: [...stack] },
      highlights: [i],
      pointers: { i },
      message: `Asteroid ${a} enters, moving ${a > 0 ? 'RIGHT' : 'LEFT'}`,
      codeLine: 4,
      action: 'visit',
    });

    while (alive && a < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];

      if (top < -a) {
        stack.pop();
        steps.push({
          state: { nums: [...asteroids], stack: [...stack] },
          highlights: [i],
          pointers: { i },
          message: `${top} (right) meets ${a} (left): |${a}| = ${-a} > ${top}, so ${top} explodes — pop it and keep checking the next one down`,
          codeLine: 8,
          action: 'pop',
        });
      } else if (top === -a) {
        stack.pop();
        alive = false;
        steps.push({
          state: { nums: [...asteroids], stack: [...stack] },
          highlights: [i],
          pointers: { i },
          message: `${top} and ${a} are the same size — BOTH explode. Pop ${top} and drop ${a} too.`,
          codeLine: 10,
          action: 'pop',
        });
      } else {
        alive = false;
        steps.push({
          state: { nums: [...asteroids], stack: [...stack] },
          highlights: [i],
          pointers: { i },
          message: `${top} (right) is bigger than |${a}| = ${-a}, so ${a} explodes and ${top} survives untouched`,
          codeLine: 13,
          action: 'delete',
        });
      }
    }

    if (alive) {
      stack.push(a);
      steps.push({
        state: { nums: [...asteroids], stack: [...stack] },
        highlights: [i],
        pointers: { i },
        message: `${a} survives — push it. Stack: [${stack.join(', ')}]${a > 0 ? ' (a right-mover, waiting for a future left-mover)' : ' (a left-mover with nothing left to hit)'}`,
        codeLine: 15,
        action: 'push',
      });
    }
  }

  steps.push({
    state: { nums: [...asteroids], stack: [...stack], result: [...stack] },
    highlights: [],
    message: `No asteroids left to launch. Survivors, in order: [${stack.join(', ')}]`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

function runAsteroidCollisionInPlace(input: unknown): AlgorithmStep[] {
  const arr = [...(input as number[])];
  const steps: AlgorithmStep[] = [];
  let k = 0;

  const live = () => Array.from({ length: k }, (_, idx) => idx);

  steps.push({
    state: { nums: [...arr] },
    highlights: [],
    message:
      'The stack can never hold more asteroids than the input, so use the input array itself as the stack: arr[0..k-1] IS the stack, and k is both the stack height and the write index. O(1) extra space.',
    codeLine: 2,
  });

  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    let alive = true;

    steps.push({
      state: { nums: [...arr] },
      highlights: [i],
      secondary: live(),
      pointers: { i, k },
      message: `Read arr[${i}] = ${a}, moving ${a > 0 ? 'RIGHT' : 'LEFT'}. Green cells are the stack region arr[0..${k - 1}].`,
      codeLine: 5,
      action: 'visit',
    });

    while (alive && a < 0 && k > 0 && arr[k - 1] > 0) {
      const top = arr[k - 1];

      if (top < -a) {
        k--;
        steps.push({
          state: { nums: [...arr] },
          highlights: [i],
          secondary: live(),
          pointers: { i, k },
          message: `arr[${k}] = ${top} loses to ${a} — instead of popping, just shrink the stack: k = ${k}. The value stays in memory but is now outside the live region.`,
          codeLine: 9,
          action: 'pop',
        });
      } else if (top === -a) {
        k--;
        alive = false;
        steps.push({
          state: { nums: [...arr] },
          highlights: [i],
          secondary: live(),
          pointers: { i, k },
          message: `Equal sizes — both die. Shrink to k = ${k} and do not write ${a}.`,
          codeLine: 11,
          action: 'pop',
        });
      } else {
        alive = false;
        steps.push({
          state: { nums: [...arr] },
          highlights: [i],
          secondary: live(),
          pointers: { i, k },
          message: `arr[${k - 1}] = ${top} is bigger than |${a}| = ${-a}, so ${a} dies. k stays at ${k} and nothing is written.`,
          codeLine: 14,
          action: 'delete',
        });
      }
    }

    if (alive) {
      arr[k] = a;
      k++;
      steps.push({
        state: { nums: [...arr] },
        highlights: [k - 1],
        secondary: live(),
        pointers: { i, k },
        message: `${a} survives — write it at arr[${k - 1}] and grow the stack to k = ${k}. Since k ≤ i always, this never clobbers an unread asteroid.`,
        codeLine: 16,
        action: 'insert',
      });
    }
  }

  const survivors = arr.slice(0, k);
  steps.push({
    state: { nums: [...arr], result: survivors },
    highlights: live(),
    pointers: { k },
    message: `Done. The answer is just the first ${k} slot(s) of the array: [${survivors.join(', ')}] — same result as the explicit stack, with no extra allocation.`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

export const asteroidCollision: Algorithm = {
  id: 'asteroid-collision',
  name: 'Asteroid Collision',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Stack — pop right-movers until a left-mover resolves',
  description:
    'Given an array of integers where each value is an asteroid — the sign gives the direction (positive is right, negative is left) and the absolute value gives the size — return the state of the asteroids after all collisions. When two asteroids meet, the smaller one explodes; if they are the same size, both explode. Asteroids moving in the same direction never meet.',
  problemUrl: 'https://leetcode.com/problems/asteroid-collision/',
  code: {
    python: `def asteroidCollision(asteroids):
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
    javascript: `function asteroidCollision(asteroids) {
    const stack = [];

    for (const a of asteroids) {
        let alive = true;
        while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
            if (stack[stack.length - 1] < -a) {
                stack.pop();
            } else if (stack[stack.length - 1] === -a) {
                stack.pop();
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) stack.push(a);
    }

    return stack;
}`,
    java: `public static int[] asteroidCollision(int[] asteroids) {
    Deque<Integer> stack = new ArrayDeque<>();

    for (int a : asteroids) {
        boolean alive = true;
        while (alive && a < 0 && !stack.isEmpty() && stack.peek() > 0) {
            if (stack.peek() < -a) {
                stack.pop();
            } else if (stack.peek() == -a) {
                stack.pop();
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) stack.push(a);
    }

    int[] res = new int[stack.size()];
    for (int i = res.length - 1; i >= 0; i--) {
        res[i] = stack.pop();
    }
    return res;
}`,
  },
  defaultInput: [5, 10, -5, -20, 8, -8],
  run: runAsteroidCollision,
  optimalApproachName: 'Collision Stack',
  approaches: [
    {
      id: 'in-place-write-index',
      name: 'In-Place Write Index',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'The survivor list can never be longer than the input, so use the input array as the stack — a write index k doubles as the stack height, removing the auxiliary stack entirely.',
      code: {
        python: `def asteroidCollision(asteroids):
    k = 0

    for i in range(len(asteroids)):
        a = asteroids[i]
        alive = True
        while alive and a < 0 and k > 0 and asteroids[k - 1] > 0:
            if asteroids[k - 1] < -a:
                k -= 1
            elif asteroids[k - 1] == -a:
                k -= 1
                alive = False
            else:
                alive = False
        if alive:
            asteroids[k] = a
            k += 1

    return asteroids[:k]`,
        javascript: `function asteroidCollision(asteroids) {
    let k = 0;

    for (let i = 0; i < asteroids.length; i++) {
        const a = asteroids[i];
        let alive = true;
        while (alive && a < 0 && k > 0 && asteroids[k - 1] > 0) {
            if (asteroids[k - 1] < -a) {
                k--;
            } else if (asteroids[k - 1] === -a) {
                k--;
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) {
            asteroids[k] = a;
            k++;
        }
    }

    return asteroids.slice(0, k);
}`,
        java: `public static int[] asteroidCollision(int[] asteroids) {
    int k = 0;

    for (int i = 0; i < asteroids.length; i++) {
        int a = asteroids[i];
        boolean alive = true;
        while (alive && a < 0 && k > 0 && asteroids[k - 1] > 0) {
            if (asteroids[k - 1] < -a) {
                k--;
            } else if (asteroids[k - 1] == -a) {
                k--;
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) {
            asteroids[k] = a;
            k++;
        }
    }

    return Arrays.copyOf(asteroids, k);
}`,
      },
      run: runAsteroidCollisionInPlace,
      lineExplanations: {
        python: {
          1: 'Define function taking the asteroid array',
          2: 'k is the stack height AND the write index — asteroids[0..k-1] is the stack',
          4: 'Walk the asteroids by index so we can read and write the same array',
          5: 'Grab the incoming asteroid before any writes happen',
          6: 'Assume it survives until a collision proves otherwise',
          7: 'Collision only when the newcomer goes left and the live top goes right',
          8: 'The top is smaller — it explodes',
          9: 'Shrink the stack instead of popping; the stale value is simply abandoned',
          10: 'Same size — both explode',
          11: 'Drop the top',
          12: 'And mark the newcomer dead too',
          13: 'Otherwise the top is bigger',
          14: 'The newcomer explodes and the loop ends',
          15: 'If it lived through every collision',
          16: 'Write it at the write index (k is never greater than i, so nothing unread is lost)',
          17: 'Grow the stack',
          19: 'The survivors are exactly the first k slots',
        },
        javascript: {
          1: 'Define function taking the asteroid array',
          2: 'k is the stack height AND the write index',
          4: 'Walk the asteroids by index so we can read and write the same array',
          5: 'Grab the incoming asteroid before any writes happen',
          6: 'Assume it survives until a collision proves otherwise',
          7: 'Collision only when the newcomer goes left and the live top goes right',
          8: 'The top is smaller — it explodes',
          9: 'Shrink the stack instead of popping',
          10: 'Same size — both explode',
          11: 'Drop the top',
          12: 'And mark the newcomer dead too',
          13: 'Otherwise the top is bigger',
          14: 'The newcomer explodes and the loop ends',
          17: 'If it lived through every collision',
          18: 'Write it at the write index',
          19: 'Grow the stack',
          23: 'The survivors are exactly the first k slots',
        },
        java: {
          1: 'Define method taking the asteroid array',
          2: 'k is the stack height AND the write index',
          4: 'Walk the asteroids by index so we can read and write the same array',
          5: 'Grab the incoming asteroid before any writes happen',
          6: 'Assume it survives until a collision proves otherwise',
          7: 'Collision only when the newcomer goes left and the live top goes right',
          8: 'The top is smaller — it explodes',
          9: 'Shrink the stack instead of popping',
          10: 'Same size — both explode',
          11: 'Drop the top',
          12: 'And mark the newcomer dead too',
          13: 'Otherwise the top is bigger',
          14: 'The newcomer explodes and the loop ends',
          17: 'If it lived through every collision',
          18: 'Write it at the write index',
          19: 'Grow the stack',
          23: 'The survivors are exactly the first k slots',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the asteroid array',
      2: 'The stack holds every asteroid still flying, in order',
      4: 'Launch the asteroids left to right',
      5: 'Assume the newcomer survives until a collision proves otherwise',
      6: 'A collision needs a left-moving newcomer and a right-moving asteroid on top',
      7: 'The one on the stack is smaller',
      8: 'It explodes — pop it and check the next one down',
      9: 'Exactly the same size',
      10: 'The stack asteroid explodes',
      11: 'And so does the newcomer',
      12: 'Otherwise the stack asteroid is bigger',
      13: 'The newcomer explodes; the survivor stays put',
      14: 'Nothing destroyed the newcomer',
      15: 'So it joins the stack',
      17: 'Whatever is left on the stack is the final state',
    },
    javascript: {
      1: 'Define function taking the asteroid array',
      2: 'The stack holds every asteroid still flying, in order',
      4: 'Launch the asteroids left to right',
      5: 'Assume the newcomer survives until a collision proves otherwise',
      6: 'A collision needs a left-moving newcomer and a right-moving asteroid on top',
      7: 'The one on the stack is smaller',
      8: 'It explodes — pop it and check the next one down',
      9: 'Exactly the same size',
      10: 'The stack asteroid explodes',
      11: 'And so does the newcomer',
      12: 'Otherwise the stack asteroid is bigger',
      13: 'The newcomer explodes; the survivor stays put',
      16: 'If the newcomer survived every collision it joins the stack',
      19: 'Whatever is left on the stack is the final state',
    },
    java: {
      1: 'Define method taking the asteroid array',
      2: 'The stack holds every asteroid still flying',
      4: 'Launch the asteroids left to right',
      5: 'Assume the newcomer survives until a collision proves otherwise',
      6: 'A collision needs a left-moving newcomer and a right-moving asteroid on top',
      7: 'The one on the stack is smaller',
      8: 'It explodes — pop it and check the next one down',
      9: 'Exactly the same size',
      10: 'The stack asteroid explodes',
      11: 'And so does the newcomer',
      12: 'Otherwise the stack asteroid is bigger',
      13: 'The newcomer explodes; the survivor stays put',
      16: 'If the newcomer survived every collision it joins the stack',
      19: 'ArrayDeque pushes at the head, so unload it back to front',
      20: 'Fill the result array from the end',
      23: 'Return the surviving asteroids in order',
    },
  },
};
