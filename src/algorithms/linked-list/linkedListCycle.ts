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

function runLinkedListCycleHashSet(input: unknown): AlgorithmStep[] {
  const { list, pos } = input as LinkedListCycleInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const linkedList = list.map((val) => ({ val, id: nodeId++ }));
  const hasCycle = pos >= 0 && pos < linkedList.length;

  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Brute-force idea: remember every node we visit in a hash set. If we ever see a node twice, we walked in a circle.${hasCycle ? ` (Cycle links back to index ${pos}.)` : ' (No cycle here.)'}`,
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
      message: 'Empty list — curr is null immediately. Return false.',
      codeLine: 9,
      action: 'found',
    });
    return steps;
  }

  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [0],
      linkedListSecondary: [],
      linkedListPointers: { curr: 0 },
    },
    highlights: [0],
    pointers: { curr: 0 },
    message: 'Create an empty set of seen nodes and start curr at the head.',
    codeLine: 2,
    action: 'visit',
  });

  const getNext = (idx: number): number => {
    if (idx === linkedList.length - 1) {
      return hasCycle ? pos : -1;
    }
    return idx + 1;
  };

  const visited: number[] = [];
  let curr = 0;

  while (curr >= 0) {
    // Membership check
    if (visited.includes(curr)) {
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [curr],
          linkedListSecondary: [...visited],
          linkedListPointers: { curr },
        },
        highlights: [curr],
        pointers: { curr },
        message: `Node at index ${curr} (val=${linkedList[curr].val}) is already in the seen set — we have looped back. Cycle detected!`,
        codeLine: 5,
        action: 'found',
      });

      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [curr],
          linkedListSecondary: [...visited],
          linkedListPointers: { 'cycle start': curr },
        },
        highlights: [curr],
        message: `Return true. Note the trade-off: this finds the cycle in one pass but stores up to n nodes, whereas Floyd's uses O(1) space.`,
        codeLine: 6,
        action: 'found',
      });
      return steps;
    }

    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: [curr],
        linkedListSecondary: [...visited],
        linkedListPointers: { curr },
      },
      highlights: [curr],
      pointers: { curr },
      message: `Node ${linkedList[curr].val} (index ${curr}) is not in the seen set yet — no cycle so far.`,
      codeLine: 5,
      action: 'compare',
    });

    visited.push(curr);
    const next = getNext(curr);

    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: next >= 0 ? [next] : [],
        linkedListSecondary: [...visited],
        linkedListPointers: next >= 0 ? { curr: next } : {},
      },
      highlights: [curr],
      pointers: next >= 0 ? { curr: next } : {},
      message: `Add node ${linkedList[curr].val} to the seen set (${visited.length} node${visited.length === 1 ? '' : 's'} remembered), then advance curr${next >= 0 ? ` to index ${next}` : ' — it is now null'}.`,
      codeLine: 7,
      action: 'insert',
    });

    curr = next;
  }

  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [...visited],
      linkedListPointers: {},
    },
    highlights: [],
    message: 'curr reached null without revisiting any node — the list ends, so there is no cycle. Return false.',
    codeLine: 9,
    action: 'found',
  });

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
    java: `public static boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            return true;
        }
    }

    return false;
}`,
  },
  defaultInput: { list: [3, 2, 0, -4], pos: 1 },
  run: runLinkedListCycle,
  optimalApproachName: "Floyd's Tortoise & Hare",
  approaches: [
    {
      id: 'hash-set',
      name: 'Hash Set',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        "Store every visited node in a hash set and flag the first repeat — simpler to reason about than Floyd's two pointers, but pays O(n) extra memory.",
      code: {
        python: `def hasCycle(head):
    seen = set()
    curr = head
    while curr:
        if curr in seen:
            return True
        seen.add(curr)
        curr = curr.next
    return False`,
        javascript: `function hasCycle(head) {
    const seen = new Set();
    let curr = head;
    while (curr) {
        if (seen.has(curr)) {
            return true;
        }
        seen.add(curr);
        curr = curr.next;
    }
    return false;
}`,
        java: `public static boolean hasCycle(ListNode head) {
    Set<ListNode> seen = new HashSet<>();
    ListNode curr = head;
    while (curr != null) {
        if (seen.contains(curr)) {
            return true;
        }
        seen.add(curr);
        curr = curr.next;
    }
    return false;
}`,
      },
      run: runLinkedListCycleHashSet,
      lineExplanations: {
        python: {
          1: 'Define function taking head of linked list',
          2: 'Create empty set to remember visited nodes (by identity)',
          3: 'Start traversal at the head',
          4: 'Walk until we fall off the end of the list',
          5: 'Seen this exact node before? Then we walked in a circle',
          6: 'Cycle confirmed — return True',
          7: 'First visit: remember this node in the set',
          8: 'Advance to the next node',
          9: 'Reached null — the list terminates, so no cycle',
        },
        javascript: {
          1: 'Define function taking head of linked list',
          2: 'Create empty Set to remember visited nodes (by reference)',
          3: 'Start traversal at the head',
          4: 'Walk until we fall off the end of the list',
          5: 'Seen this exact node before? Then we walked in a circle',
          6: 'Cycle confirmed — return true',
          8: 'First visit: remember this node in the set',
          9: 'Advance to the next node',
          11: 'Reached null — the list terminates, so no cycle',
        },
        java: {
          1: 'Define method taking head of linked list',
          2: 'Create empty HashSet to remember visited nodes (by reference)',
          3: 'Start traversal at the head',
          4: 'Walk until we fall off the end of the list',
          5: 'Seen this exact node before? Then we walked in a circle',
          6: 'Cycle confirmed — return true',
          8: 'First visit: remember this node in the set',
          9: 'Advance to the next node',
          11: 'Reached null — the list terminates, so no cycle',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking head of linked list',
      2: 'Initialize slow pointer at head',
      3: 'Initialize fast pointer at head',
      4: 'Loop while fast and fast.next are not null',
      5: 'Move slow pointer one step forward',
      6: 'Move fast pointer two steps forward',
      7: 'If both pointers meet, cycle exists',
      8: 'Return True since cycle is detected',
      9: 'Fast reached end, no cycle found',
    },
    javascript: {
      1: 'Define function taking head of linked list',
      2: 'Initialize slow pointer at head',
      3: 'Initialize fast pointer at head',
      4: 'Loop while fast and fast.next are not null',
      5: 'Move slow pointer one step forward',
      6: 'Move fast pointer two steps forward',
      7: 'If both pointers meet, cycle exists',
      8: 'Return true since cycle is detected',
      11: 'Fast reached end, no cycle found',
    },
    java: {
      1: 'Define method taking head of linked list',
      2: 'Initialize slow pointer at head',
      3: 'Initialize fast pointer at head',
      5: 'Loop while fast and fast.next are not null',
      6: 'Move slow pointer one step forward',
      7: 'Move fast pointer two steps forward',
      8: 'If both pointers meet, cycle exists',
      9: 'Return true since cycle is detected',
      13: 'Fast reached end, no cycle found',
    },
  },
};
