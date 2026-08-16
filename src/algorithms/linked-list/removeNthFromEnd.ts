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

function runRemoveNthFromEndTwoPass(input: unknown): AlgorithmStep[] {
  const { list, n } = input as RemoveNthInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const linkedList = list.map((val) => ({ val, id: nodeId++ }));

  steps.push({
    state: {
      linkedList: linkedList.map((n2) => ({ ...n2 })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Two-pass idea: "${n}th from the end" is just position (length - ${n}) from the front. Pass 1 counts the length, pass 2 walks straight to the node before it.`,
    codeLine: 1,
  });

  // Pass 1: count length
  for (let idx = 0; idx < linkedList.length; idx++) {
    steps.push({
      state: {
        linkedList: linkedList.map((n2) => ({ ...n2 })),
        linkedListHighlights: [idx],
        linkedListSecondary: [],
        linkedListPointers: { curr: idx },
      },
      highlights: [idx],
      pointers: { curr: idx },
      message: `Pass 1 — count nodes: length = ${idx + 1} after visiting node ${linkedList[idx].val}.`,
      codeLine: 5,
      action: 'visit',
    });
  }

  const length = linkedList.length;
  const removeIdx = length - n;

  steps.push({
    state: {
      linkedList: linkedList.map((n2) => ({ ...n2 })),
      linkedListHighlights: [removeIdx],
      linkedListSecondary: [],
      linkedListPointers: { target: removeIdx },
    },
    highlights: [removeIdx],
    message: `Length = ${length}. The ${n}th node from the end sits at index ${length} - ${n} = ${removeIdx} (val=${linkedList[removeIdx].val}).`,
    codeLine: 7,
    action: 'compare',
  });

  if (removeIdx === 0) {
    const result = linkedList.slice(1).map((n2) => ({ ...n2 }));
    steps.push({
      state: {
        linkedList: linkedList.map((n2) => ({ ...n2 })),
        linkedListHighlights: [0],
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: [0],
      message: `length == n, so the target is the head itself. Return head.next — no relinking needed.`,
      codeLine: 8,
      action: 'delete',
    });

    steps.push({
      state: {
        linkedList: result.map((n2) => ({ ...n2 })),
        linkedListHighlights: result.map((_, i) => i),
        linkedListSecondary: [],
        linkedListPointers: {},
        result: result.map((n2) => ({ ...n2 })),
      },
      highlights: result.map((_, i) => i),
      message: `Result: [${result.map((n2) => n2.val).join(' -> ')}]`,
      codeLine: 8,
      action: 'found',
    });
    return steps;
  }

  // Pass 2: walk to the node before the target
  for (let idx = 1; idx <= removeIdx - 1; idx++) {
    steps.push({
      state: {
        linkedList: linkedList.map((n2) => ({ ...n2 })),
        linkedListHighlights: [idx],
        linkedListSecondary: [removeIdx],
        linkedListPointers: { curr: idx, target: removeIdx },
      },
      highlights: [idx],
      pointers: { curr: idx },
      message: `Pass 2 — walk forward: curr at index ${idx} (val=${linkedList[idx].val}), heading to index ${removeIdx - 1}, the node just before the target.`,
      codeLine: 11,
      action: 'visit',
    });
  }

  steps.push({
    state: {
      linkedList: linkedList.map((n2) => ({ ...n2 })),
      linkedListHighlights: [removeIdx],
      linkedListSecondary: [removeIdx - 1],
      linkedListPointers: { curr: removeIdx - 1, target: removeIdx },
    },
    highlights: [removeIdx],
    pointers: { curr: removeIdx - 1 },
    message: `curr stops at index ${removeIdx - 1} (val=${linkedList[removeIdx - 1].val}). Unlink node ${linkedList[removeIdx].val} with curr.next = curr.next.next.`,
    codeLine: 12,
    action: 'delete',
  });

  const result = [...linkedList.slice(0, removeIdx), ...linkedList.slice(removeIdx + 1)].map(
    (n2) => ({ ...n2 })
  );
  steps.push({
    state: {
      linkedList: result.map((n2) => ({ ...n2 })),
      linkedListHighlights: result.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: {},
      result: result.map((n2) => ({ ...n2 })),
    },
    highlights: result.map((_, i) => i),
    message: `Result: [${result.map((n2) => n2.val).join(' -> ')}]. Two full traversals versus one for the pointer-gap trick, but the same O(n) time.`,
    codeLine: 13,
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
  optimalApproachName: 'One Pass — Two Pointers',
  approaches: [
    {
      id: 'two-pass-length',
      name: 'Two Pass — Count Length',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Count the length first, then walk directly to node (length - n): two straightforward traversals instead of the one-pass pointer-gap trick.',
      code: {
        python: `def removeNthFromEnd(head, n):
    length = 0
    curr = head
    while curr:
        length += 1
        curr = curr.next
    if length == n:
        return head.next
    curr = head
    for i in range(length - n - 1):
        curr = curr.next
    curr.next = curr.next.next
    return head`,
        javascript: `function removeNthFromEnd(head, n) {
    let length = 0;
    let curr = head;
    while (curr) {
        length++;
        curr = curr.next;
    }
    if (length === n) {
        return head.next;
    }
    curr = head;
    for (let i = 0; i < length - n - 1; i++) {
        curr = curr.next;
    }
    curr.next = curr.next.next;
    return head;
}`,
        java: `public static ListNode removeNthFromEnd(ListNode head, int n) {
    int length = 0;
    ListNode curr = head;
    while (curr != null) {
        length++;
        curr = curr.next;
    }
    if (length == n) {
        return head.next;
    }
    curr = head;
    for (int i = 0; i < length - n - 1; i++) {
        curr = curr.next;
    }
    curr.next = curr.next.next;
    return head;
}`,
      },
      run: runRemoveNthFromEndTwoPass,
      lineExplanations: {
        python: {
          1: 'Define function taking head and n',
          2: 'Counter for the list length',
          3: 'Start pass 1 at the head',
          4: 'Traverse the entire list once',
          5: 'Count each node',
          6: 'Advance to the next node',
          7: 'Is the target the head itself? (nth from end of n nodes)',
          8: 'Yes — the new list simply starts at head.next',
          9: 'Reset for pass 2',
          10: 'Walk to index length-n-1, the node before the target',
          11: 'Advance one node at a time',
          12: 'Bypass the target node to delete it',
          13: 'Head unchanged — return it',
        },
        javascript: {
          1: 'Define function taking head and n',
          2: 'Counter for the list length',
          3: 'Start pass 1 at the head',
          4: 'Traverse the entire list once',
          5: 'Count each node',
          6: 'Advance to the next node',
          8: 'Is the target the head itself? (nth from end of n nodes)',
          9: 'Yes — the new list simply starts at head.next',
          11: 'Reset for pass 2',
          12: 'Walk to index length-n-1, the node before the target',
          13: 'Advance one node at a time',
          15: 'Bypass the target node to delete it',
          16: 'Head unchanged — return it',
        },
        java: {
          1: 'Define method taking head and n',
          2: 'Counter for the list length',
          3: 'Start pass 1 at the head',
          4: 'Traverse the entire list once',
          5: 'Count each node',
          6: 'Advance to the next node',
          8: 'Is the target the head itself? (nth from end of n nodes)',
          9: 'Yes — the new list simply starts at head.next',
          11: 'Reset for pass 2',
          12: 'Walk to index length-n-1, the node before the target',
          13: 'Advance one node at a time',
          15: 'Bypass the target node to delete it',
          16: 'Head unchanged — return it',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking head and n',
      2: 'Create dummy node pointing to head',
      3: 'Start slow pointer at dummy',
      4: 'Start fast pointer at head',
      5: 'Advance fast pointer n steps ahead',
      6: 'Move fast forward one step',
      7: 'Move both pointers until fast reaches end',
      8: 'Advance slow one step',
      9: 'Advance fast one step',
      10: 'Skip the target node by relinking',
      11: 'Return the new head after dummy',
    },
    javascript: {
      1: 'Define function taking head and n',
      2: 'Create dummy node pointing to head',
      3: 'Start slow pointer at dummy',
      4: 'Start fast pointer at head',
      5: 'Advance fast pointer n steps ahead',
      6: 'Move fast forward one step',
      8: 'Move both pointers until fast reaches end',
      9: 'Advance slow one step',
      10: 'Advance fast one step',
      12: 'Skip the target node by relinking',
      13: 'Return the new head after dummy',
    },
    java: {
      1: 'Define method taking head and n',
      2: 'Create dummy node pointing to head',
      3: 'Start slow pointer at dummy',
      4: 'Start fast pointer at head',
      5: 'Advance fast pointer n steps ahead',
      6: 'Move fast forward one step',
      8: 'Move both pointers until fast reaches end',
      9: 'Advance slow one step',
      10: 'Advance fast one step',
      12: 'Skip the target node by relinking',
      13: 'Return the new head after dummy',
    },
  },
};
