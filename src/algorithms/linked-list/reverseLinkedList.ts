import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runReverseLinkedList(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  // Build linked list
  const linkedList = nums.map((val) => ({ val, id: nodeId++ }));

  // Initial state
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: 'Starting: reverse the linked list. Initialize prev = null, curr = head.',
    codeLine: 1,
  });

  let prev: { val: number | string; id: number }[] = [];
  const remaining = [...linkedList];

  // Show initial pointer setup
  steps.push({
    state: {
      linkedList: remaining.map((n) => ({ ...n })),
      linkedListHighlights: [0],
      linkedListSecondary: [],
      linkedListPointers: { curr: 0 },
      result: prev.map((n) => ({ ...n })),
    },
    highlights: [0],
    pointers: { curr: 0 },
    message: 'prev = null, curr = head (node with value ' + remaining[0].val + ')',
    codeLine: 2,
    action: 'visit',
  });

  // Process each node
  for (let i = 0; i < linkedList.length; i++) {
    const currNode = remaining[0];

    // Save next
    steps.push({
      state: {
        linkedList: remaining.map((n) => ({ ...n })),
        linkedListHighlights: [0],
        linkedListSecondary: remaining.length > 1 ? [1] : [],
        linkedListPointers: { curr: 0, ...(remaining.length > 1 ? { next: 1 } : {}) },
        result: prev.map((n) => ({ ...n })),
      },
      highlights: [0],
      pointers: { curr: 0 },
      message: `Save next_node = curr.next ${remaining.length > 1 ? '(node ' + remaining[1].val + ')' : '(null)'}`,
      codeLine: 4,
      action: 'visit',
    });

    // Reverse pointer: curr.next = prev
    steps.push({
      state: {
        linkedList: remaining.map((n) => ({ ...n })),
        linkedListHighlights: [0],
        linkedListSecondary: [],
        linkedListPointers: { curr: 0 },
        result: prev.map((n) => ({ ...n })),
      },
      highlights: [0],
      message: `Reverse pointer: curr.next = prev. Node ${currNode.val} now points backward.`,
      codeLine: 5,
      action: 'swap',
    });

    // Move curr to prev (add to front of reversed list)
    prev = [{ ...currNode }, ...prev];
    remaining.shift();

    // Move prev and curr forward
    steps.push({
      state: {
        linkedList: remaining.map((n) => ({ ...n })),
        linkedListHighlights: remaining.length > 0 ? [0] : [],
        linkedListSecondary: [],
        linkedListPointers: remaining.length > 0 ? { curr: 0 } : {},
        result: prev.map((n) => ({ ...n })),
      },
      highlights: remaining.length > 0 ? [0] : [],
      pointers: remaining.length > 0 ? { curr: 0 } : {},
      message: `Advance: prev = node ${currNode.val}, curr = ${remaining.length > 0 ? 'node ' + remaining[0].val : 'null'}`,
      codeLine: 6,
      action: 'visit',
    });
  }

  // Final state
  steps.push({
    state: {
      linkedList: prev.map((n) => ({ ...n })),
      linkedListHighlights: prev.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
    },
    highlights: prev.map((_, i) => i),
    message: `Linked list reversed! New head = ${prev[0].val}. Result: [${prev.map((n) => n.val).join(' -> ')}]`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

function runReverseLinkedListRecursive(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const linkedList = nums.map((val) => ({ val, id: nodeId++ }));

  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message:
      'Recursive idea: dive to the last node first, then reverse each link while the call stack unwinds back to the head.',
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
      message: 'Empty list — the base case returns immediately.',
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  // Descent: recurse until the last node
  for (let i = 0; i < linkedList.length; i++) {
    const isLast = i === linkedList.length - 1;
    if (!isLast) {
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [i],
          linkedListSecondary: [i + 1],
          linkedListPointers: { head: i },
        },
        highlights: [i],
        pointers: { head: i },
        message: `Call reverseList(node ${linkedList[i].val}). It has a next node, so recurse deeper on node ${linkedList[i + 1].val} — nothing is reversed until we hit the tail.`,
        codeLine: 4,
        action: 'visit',
      });
    } else {
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [i],
          linkedListSecondary: [],
          linkedListPointers: { 'new head': i },
        },
        highlights: [i],
        pointers: { head: i },
        message: `Base case: node ${linkedList[i].val} has no next. It becomes the new head, and every recursive call will return it unchanged.`,
        codeLine: 3,
        action: 'found',
      });
    }
  }

  // Unwind: reverse links as the stack pops
  let reversed: { val: number | string; id: number }[] = [
    { ...linkedList[linkedList.length - 1] },
  ];

  for (let i = linkedList.length - 2; i >= 0; i--) {
    steps.push({
      state: {
        linkedList: linkedList.slice(0, i + 1).map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { head: i },
        result: reversed.map((n) => ({ ...n })),
      },
      highlights: [i],
      pointers: { head: i },
      message: `Unwind to node ${linkedList[i].val}: head.next.next = head makes node ${linkedList[i + 1].val} point back at node ${linkedList[i].val}.`,
      codeLine: 5,
      action: 'swap',
    });

    reversed = [...reversed, { ...linkedList[i] }];

    steps.push({
      state: {
        linkedList: linkedList.slice(0, i).map((n) => ({ ...n })),
        linkedListHighlights: [],
        linkedListSecondary: [],
        linkedListPointers: {},
        result: reversed.map((n) => ({ ...n })),
      },
      highlights: [],
      message: `head.next = None severs the old forward link — node ${linkedList[i].val} is now the tail of the reversed portion [${reversed.map((n) => n.val).join(' -> ')}].`,
      codeLine: 6,
      action: 'delete',
    });
  }

  steps.push({
    state: {
      linkedList: reversed.map((n) => ({ ...n })),
      linkedListHighlights: reversed.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
      result: reversed.map((n) => ({ ...n })),
    },
    highlights: reversed.map((_, i) => i),
    message: `Recursion fully unwound! New head = ${reversed[0].val}. Result: [${reversed.map((n) => n.val).join(' -> ')}]`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const reverseLinkedList: Algorithm = {
  id: 'reverse-linked-list',
  name: 'Reverse Linked List',
  category: 'Linked List',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Three Pointers — prev, curr, next iteration',
  description:
    'Given the head of a singly linked list, reverse the list, and return the reversed list.',
  problemUrl: 'https://leetcode.com/problems/reverse-linked-list/',
  code: {
    python: `def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
    javascript: `function reverseList(head) {
    let prev = null;
    let curr = head;
    while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    java: `public static ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode nextNode = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextNode;
    }
    return prev;
}`,
  },
  defaultInput: [1, 2, 3, 4, 5],
  run: runReverseLinkedList,
  optimalApproachName: 'Iterative Pointer Reversal',
  approaches: [
    {
      id: 'recursive',
      name: 'Recursion',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Recurse to the tail first, then flip each link as the call stack unwinds — elegant, but the n stacked calls cost O(n) space versus the iterative O(1).',
      code: {
        python: `def reverseList(head):
    if not head or not head.next:
        return head
    new_head = reverseList(head.next)
    head.next.next = head
    head.next = None
    return new_head`,
        javascript: `function reverseList(head) {
    if (!head || !head.next) {
        return head;
    }
    const newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}`,
        java: `public static ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }
    ListNode newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}`,
      },
      run: runReverseLinkedListRecursive,
      lineExplanations: {
        python: {
          1: 'Define recursive function taking head of linked list',
          2: 'Base case: empty list or single node',
          3: 'A single node is already reversed — return it as new head',
          4: 'Recurse on the rest; new_head bubbles up unchanged from the tail',
          5: 'The node after head now points back at head (link reversed)',
          6: 'Cut the old forward link so the list has no cycle',
          7: 'Return the tail node — it is the head of the reversed list',
        },
        javascript: {
          1: 'Define recursive function taking head of linked list',
          2: 'Base case: empty list or single node',
          3: 'A single node is already reversed — return it as new head',
          5: 'Recurse on the rest; newHead bubbles up unchanged from the tail',
          6: 'The node after head now points back at head (link reversed)',
          7: 'Cut the old forward link so the list has no cycle',
          8: 'Return the tail node — it is the head of the reversed list',
        },
        java: {
          1: 'Define recursive method taking head of linked list',
          2: 'Base case: empty list or single node',
          3: 'A single node is already reversed — return it as new head',
          5: 'Recurse on the rest; newHead bubbles up unchanged from the tail',
          6: 'The node after head now points back at head (link reversed)',
          7: 'Cut the old forward link so the list has no cycle',
          8: 'Return the tail node — it is the head of the reversed list',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking head of linked list',
      2: 'Initialize prev pointer to None (will become new tail)',
      3: 'Start curr pointer at head of list',
      4: 'Keep going until we reach the end',
      5: 'Save reference to next node before we break the link',
      6: 'Reverse the pointer — curr now points backward to prev',
      7: 'Move prev forward to current node',
      8: 'Move curr forward to the saved next node',
      9: 'prev is now the new head of the reversed list',
    },
    javascript: {
      1: 'Define function taking head of linked list',
      2: 'Initialize prev pointer to null (will become new tail)',
      3: 'Start curr pointer at head of list',
      4: 'Keep going until we reach the end',
      5: 'Save reference to next node before we break the link',
      6: 'Reverse the pointer — curr now points backward to prev',
      7: 'Move prev forward to current node',
      8: 'Move curr forward to the saved next node',
      10: 'prev is now the new head of the reversed list',
    },
    java: {
      1: 'Define function taking head of linked list',
      2: 'Initialize prev pointer to null (will become new tail)',
      3: 'Start curr pointer at head of list',
      4: 'Keep going until we reach the end',
      5: 'Save reference to next node before we break the link',
      6: 'Reverse the pointer — curr now points backward to prev',
      7: 'Move prev forward to current node',
      8: 'Move curr forward to the saved next node',
      10: 'prev is now the new head of the reversed list',
    },
  },
};
