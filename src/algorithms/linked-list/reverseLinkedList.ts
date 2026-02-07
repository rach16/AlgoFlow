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
};
