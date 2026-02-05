import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface LinkedListCycleInput {
  list: number[];
  pos: number;
}

function runLinkedListCycle(input: unknown): AlgorithmStep[] {
  const { list, pos } = input as LinkedListCycleInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const linkedList = list.map((val) => ({ val, id: nodeId++ }));
  const hasCycle = pos >= 0 && pos < linkedList.length;

  // Initial state
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Detect if a cycle exists using Floyd's cycle detection (slow/fast pointers).${hasCycle ? ` Cycle starts at index ${pos} (val=${linkedList[pos].val}).` : ' No cycle.'}`,
    codeLine: 1,
  });

  if (linkedList.length === 0) {
    steps.push({
      state: {
        linkedList: [],
        linkedListHighlights: [],
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: [],
      message: 'Empty list, no cycle possible. Return false.',
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  // Initialize slow and fast pointers
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [0],
      linkedListSecondary: [0],
      linkedListPointers: { slow: 0, fast: 0 },
    },
    highlights: [0],
    pointers: { slow: 0, fast: 0 },
    message: 'Initialize slow = head, fast = head. Slow moves 1 step, fast moves 2 steps.',
    codeLine: 2,
    action: 'visit',
  });

  // Simulate traversal with cycle detection
  // We simulate the linked list traversal where after the last node,
  // if pos >= 0, the next pointer goes back to linkedList[pos]
  let slow = 0;
  let fast = 0;
  const maxIterations = linkedList.length * 3; // prevent infinite loop in simulation
  let iteration = 0;
  let cycleDetected = false;

  // Function to get next index in the linked list
  const getNext = (idx: number): number => {
    if (idx === linkedList.length - 1) {
      return hasCycle ? pos : -1; // -1 means null
    }
    return idx + 1;
  };

  while (iteration < maxIterations) {
    iteration++;

    // Move slow one step
    const nextSlow = getNext(slow);
    // Move fast two steps
    const nextFast1 = getNext(fast);
    const nextFast2 = nextFast1 >= 0 ? getNext(nextFast1) : -1;

    if (nextFast1 < 0 || nextFast2 < 0) {
      // Fast reached null, no cycle
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [],
          linkedListSecondary: [],
          linkedListPointers: {
            slow: nextSlow >= 0 ? nextSlow : slow,
            ...(nextFast1 >= 0 ? { fast: nextFast1 } : {}),
          },
        },
        highlights: [],
        message: 'Fast pointer reached null. No cycle exists in the linked list.',
        codeLine: 4,
        action: 'found',
      });

      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [],
          linkedListSecondary: [],
          linkedListPointers: {},
        },
        highlights: [],
        message: 'Return false: no cycle detected.',
        codeLine: 5,
        action: 'found',
      });
      return steps;
    }

    slow = nextSlow;
    fast = nextFast2;

    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: [slow],
        linkedListSecondary: [fast],
        linkedListPointers: { slow, fast },
      },
      highlights: [slow, fast],
      pointers: { slow, fast },
      message: `Move slow to index ${slow} (val=${linkedList[slow].val}), fast to index ${fast} (val=${linkedList[fast].val})`,
      codeLine: 3,
      action: 'visit',
    });

    if (slow === fast) {
      cycleDetected = true;
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [slow],
          linkedListSecondary: [fast],
          linkedListPointers: { slow, fast },
        },
        highlights: [slow],
        pointers: { slow, fast },
        message: `Slow and fast meet at index ${slow} (val=${linkedList[slow].val})! Cycle detected!`,
        codeLine: 4,
        action: 'found',
      });
      break;
    }
  }

  if (cycleDetected) {
    // Highlight the cycle
    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: [pos],
        linkedListSecondary: [slow],
        linkedListPointers: { 'cycle start': pos },
      },
      highlights: [pos, slow],
      message: `Cycle confirmed! The cycle starts at index ${pos} (val=${linkedList[pos].val}). Return true.`,
      codeLine: 5,
      action: 'found',
    });
  }

  return steps;
}

export const linkedListCycle: Algorithm = {
  id: 'linked-list-cycle',
  name: 'Linked List Cycle',
  category: 'Linked List',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Fast & Slow Pointers — Floyd cycle detection',
  description:
    'Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.',
  problemUrl: 'https://leetcode.com/problems/linked-list-cycle/',
  code: {
    python: `def hasCycle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
    javascript: `function hasCycle(head) {
    let slow = head;
    let fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            return true;
        }
    }
    return false;
}`,
  },
  defaultInput: { list: [3, 2, 0, -4], pos: 1 },
  run: runLinkedListCycle,
};
