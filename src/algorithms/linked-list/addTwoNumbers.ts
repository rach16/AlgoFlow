import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface AddTwoNumbersInput {
  l1: number[];
  l2: number[];
}

function runAddTwoNumbers(input: unknown): AlgorithmStep[] {
  const { l1, l2 } = input as AddTwoNumbersInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const ll1 = l1.map((val) => ({ val, id: nodeId++ }));
  const ll2 = l2.map((val) => ({ val, id: nodeId++ }));
  const result: { val: number | string; id: number }[] = [];

  // Initial state
  steps.push({
    state: {
      linkedList: ll1.map((n) => ({ ...n })),
      linkedList2: ll2.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      result: [],
    },
    highlights: [],
    message: 'Add two numbers represented as linked lists (digits in reverse order). Traverse both lists, summing digits with carry.',
    codeLine: 1,
  });

  let carry = 0;
  let i = 0;
  let j = 0;

  while (i < ll1.length || j < ll2.length || carry > 0) {
    const d1 = i < ll1.length ? (ll1[i].val as number) : 0;
    const d2 = j < ll2.length ? (ll2[j].val as number) : 0;
    const sum = d1 + d2 + carry;
    const digit = sum % 10;
    carry = Math.floor(sum / 10);

    // Show current digits being added
    const pointers: Record<string, number> = {};
    const highlightIndices: number[] = [];
    if (i < ll1.length) {
      pointers['l1'] = i;
      highlightIndices.push(i);
    }
    if (j < ll2.length) {
      pointers['l2'] = j;
    }

    steps.push({
      state: {
        linkedList: ll1.map((n) => ({ ...n })),
        linkedList2: ll2.map((n) => ({ ...n })),
        linkedListHighlights: i < ll1.length ? [i] : [],
        linkedListSecondary: j < ll2.length ? [j] : [],
        linkedListPointers: pointers,
        result: result.map((n) => ({ ...n })),
        carry: carry > 0 || (d1 + d2 + (carry > 0 ? 1 : 0)) >= 10 ? carry : 0,
      },
      highlights: highlightIndices,
      pointers,
      message: `Add digits: ${d1} + ${d2}${sum - d1 - d2 > 0 ? ` + carry(${sum - d1 - d2})` : ''} = ${sum}. Digit = ${digit}, carry = ${carry}`,
      codeLine: 3,
      action: 'compare',
    });

    // Create result node
    result.push({ val: digit, id: nodeId++ });

    steps.push({
      state: {
        linkedList: ll1.map((n) => ({ ...n })),
        linkedList2: ll2.map((n) => ({ ...n })),
        linkedListHighlights: i < ll1.length ? [i] : [],
        linkedListSecondary: j < ll2.length ? [j] : [],
        linkedListPointers: pointers,
        result: result.map((n) => ({ ...n })),
        carry,
      },
      highlights: highlightIndices,
      pointers,
      message: `Append digit ${digit} to result. ${carry > 0 ? `Carry ${carry} to next position.` : 'No carry.'}`,
      codeLine: 5,
      action: 'insert',
    });

    if (i < ll1.length) i++;
    if (j < ll2.length) j++;
  }

  // Final result
  steps.push({
    state: {
      linkedList: ll1.map((n) => ({ ...n })),
      linkedList2: ll2.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      result: result.map((n) => ({ ...n })),
    },
    highlights: [],
    message: `Sum complete! Result: [${result.map((n) => n.val).join(' -> ')}] which represents ${parseInt(result.map((n) => n.val).reverse().join(''), 10)}`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const addTwoNumbers: Algorithm = {
  id: 'add-two-numbers',
  name: 'Add Two Numbers',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(max(m,n))',
  spaceComplexity: 'O(max(m,n))',
  pattern: 'Linked List — traverse both, track carry',
  description:
    'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
  problemUrl: 'https://leetcode.com/problems/add-two-numbers/',
  code: {
    python: `def addTwoNumbers(l1, l2):
    dummy = ListNode()
    curr = dummy
    carry = 0
    while l1 or l2 or carry:
        v1 = l1.val if l1 else 0
        v2 = l2.val if l2 else 0
        val = v1 + v2 + carry
        carry = val // 10
        curr.next = ListNode(val % 10)
        curr = curr.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next`,
    javascript: `function addTwoNumbers(l1, l2) {
    const dummy = new ListNode();
    let curr = dummy;
    let carry = 0;
    while (l1 || l2 || carry) {
        const v1 = l1 ? l1.val : 0;
        const v2 = l2 ? l2.val : 0;
        const val = v1 + v2 + carry;
        carry = Math.floor(val / 10);
        curr.next = new ListNode(val % 10);
        curr = curr.next;
        l1 = l1 ? l1.next : null;
        l2 = l2 ? l2.next : null;
    }
    return dummy.next;
}`,
    java: `public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode();
    ListNode curr = dummy;
    int carry = 0;

    while (l1 != null || l2 != null || carry != 0) {
        int v1 = l1 != null ? l1.val : 0;
        int v2 = l2 != null ? l2.val : 0;

        int val = v1 + v2 + carry;
        carry = val / 10;
        val = val % 10;
        curr.next = new ListNode(val);

        curr = curr.next;
        l1 = l1 != null ? l1.next : null;
        l2 = l2 != null ? l2.next : null;
    }

    return dummy.next;
}`,
  },
  defaultInput: { l1: [2, 4, 3], l2: [5, 6, 4] },
  run: runAddTwoNumbers,
};
