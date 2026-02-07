import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface RemoveNthInput {
  list: number[];
  n: number;
}

function runRemoveNthFromEnd(input: unknown): AlgorithmStep[] {
  const { list, n } = input as RemoveNthInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const linkedList = list.map((val) => ({ val, id: nodeId++ }));

  // Initial state
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Remove the ${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} node from the end of the list.`,
    codeLine: 1,
  });

  // Use a dummy node approach with two pointers
  // Advance fast pointer n steps ahead
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [0],
      linkedListSecondary: [0],
      linkedListPointers: { slow: 0, fast: 0 },
    },
    highlights: [0],
    message: `Strategy: Use two pointers. Advance fast pointer ${n} steps ahead, then move both until fast reaches the end.`,
    codeLine: 2,
    action: 'visit',
  });

  let fast = 0;
  for (let i = 0; i < n; i++) {
    fast++;
    if (fast < linkedList.length) {
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [],
          linkedListSecondary: [fast],
          linkedListPointers: { slow: 0, fast },
        },
        highlights: [fast],
        pointers: { slow: 0, fast },
        message: `Advance fast pointer to index ${fast} (step ${i + 1} of ${n})`,
        codeLine: 3,
        action: 'visit',
      });
    } else {
      // fast went past the end - means we're removing the head
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [],
          linkedListSecondary: [],
          linkedListPointers: { slow: 0 },
        },
        highlights: [],
        pointers: { slow: 0 },
        message: `Fast pointer passed the end. The node to remove is the head.`,
        codeLine: 3,
        action: 'visit',
      });
    }
  }

  // If fast == linkedList.length, remove head
  if (fast >= linkedList.length) {
    const removed = linkedList[0].val;
    const result = linkedList.slice(1).map((n) => ({ ...n }));
    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: [0],
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: [0],
      message: `Removing head node with value ${removed}`,
      codeLine: 6,
      action: 'delete',
    });

    steps.push({
      state: {
        linkedList: result.map((n) => ({ ...n })),
        linkedListHighlights: result.map((_, i) => i),
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: result.map((_, i) => i),
      message: `Result: [${result.map((n) => n.val).join(' -> ')}]`,
      codeLine: 7,
      action: 'found',
    });
    return steps;
  }

  // Move both pointers until fast reaches the end
  let slow = 0;
  while (fast < linkedList.length - 1) {
    slow++;
    fast++;
    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: [slow],
        linkedListSecondary: [fast],
        linkedListPointers: { slow, fast },
      },
      highlights: [slow, fast],
      pointers: { slow, fast },
      message: `Move both pointers: slow=${slow} (val=${linkedList[slow].val}), fast=${fast} (val=${linkedList[fast].val})`,
      codeLine: 4,
      action: 'visit',
    });
  }

  // slow is now pointing to the node BEFORE the one to remove
  const removeIdx = slow + 1;
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [removeIdx],
      linkedListSecondary: [slow],
      linkedListPointers: { slow, target: removeIdx },
    },
    highlights: [removeIdx],
    pointers: { slow },
    message: `Fast reached end. Node to remove is at index ${removeIdx} (val=${linkedList[removeIdx].val}). Slow is at the node before it.`,
    codeLine: 5,
    action: 'found',
  });

  // Remove the node
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [removeIdx],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [removeIdx],
    message: `Remove node with value ${linkedList[removeIdx].val} by setting slow.next = slow.next.next`,
    codeLine: 6,
    action: 'delete',
  });

  // Show result
  const result = [...linkedList.slice(0, removeIdx), ...linkedList.slice(removeIdx + 1)].map((n) => ({ ...n }));
  steps.push({
    state: {
      linkedList: result.map((n) => ({ ...n })),
      linkedListHighlights: result.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: result.map((_, i) => i),
    message: `Result: [${result.map((n) => n.val).join(' -> ')}]`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const removeNthFromEnd: Algorithm = {
  id: 'remove-nth-from-end',
  name: 'Remove Nth Node From End of List',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — gap of n between fast and slow',
  description:
    'Given the head of a linked list, remove the nth node from the end of the list and return its head.',
  problemUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
  code: {
    python: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    slow = dummy
    fast = head
    for i in range(n):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next`,
    javascript: `function removeNthFromEnd(head, n) {
    const dummy = new ListNode(0, head);
    let slow = dummy;
    let fast = head;
    for (let i = 0; i < n; i++) {
        fast = fast.next;
    }
    while (fast) {
        slow = slow.next;
        fast = fast.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
}`,
    java: `public static ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head);
    ListNode slow = dummy;
    ListNode fast = head;
    for (int i = 0; i < n; i++) {
        fast = fast.next;
    }
    while (fast != null) {
        slow = slow.next;
        fast = fast.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
}`,
  },
  defaultInput: { list: [1, 2, 3, 4, 5], n: 2 },
  run: runRemoveNthFromEnd,
};
