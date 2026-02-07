import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MergeTwoInput {
  list1: number[];
  list2: number[];
}

function runMergeTwoSortedLists(input: unknown): AlgorithmStep[] {
  const { list1, list2 } = input as MergeTwoInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  // Build linked lists
  const ll1 = list1.map((val) => ({ val, id: nodeId++ }));
  const ll2 = list2.map((val) => ({ val, id: nodeId++ }));
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
    message: 'Merge two sorted linked lists into one sorted list. Create a dummy head node.',
    codeLine: 1,
  });

  let i = 0;
  let j = 0;

  // Show initial pointers
  steps.push({
    state: {
      linkedList: ll1.map((n) => ({ ...n })),
      linkedList2: ll2.map((n) => ({ ...n })),
      linkedListHighlights: [0],
      linkedListSecondary: [],
      linkedListPointers: { l1: 0 },
      result: [],
    },
    highlights: [0],
    message: `Initialize pointers: l1 at node ${ll1.length > 0 ? ll1[0].val : 'null'}, l2 at node ${ll2.length > 0 ? ll2[0].val : 'null'}`,
    codeLine: 2,
    action: 'visit',
  });

  while (i < ll1.length && j < ll2.length) {
    const v1 = ll1[i].val as number;
    const v2 = ll2[j].val as number;

    // Compare
    steps.push({
      state: {
        linkedList: ll1.map((n) => ({ ...n })),
        linkedList2: ll2.map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { l1: i, l2: j },
        result: result.map((n) => ({ ...n })),
      },
      highlights: [i, j],
      pointers: { l1: i, l2: j },
      message: `Compare l1.val=${v1} vs l2.val=${v2}`,
      codeLine: 4,
      action: 'compare',
    });

    if (v1 <= v2) {
      result.push({ val: v1, id: nodeId++ });
      steps.push({
        state: {
          linkedList: ll1.map((n) => ({ ...n })),
          linkedList2: ll2.map((n) => ({ ...n })),
          linkedListHighlights: [i],
          linkedListSecondary: [],
          linkedListPointers: { l1: i, l2: j },
          result: result.map((n) => ({ ...n })),
        },
        highlights: [i],
        pointers: { l1: i },
        message: `${v1} <= ${v2}, append ${v1} from list1 to result. Advance l1.`,
        codeLine: 5,
        action: 'insert',
      });
      i++;
    } else {
      result.push({ val: v2, id: nodeId++ });
      steps.push({
        state: {
          linkedList: ll1.map((n) => ({ ...n })),
          linkedList2: ll2.map((n) => ({ ...n })),
          linkedListHighlights: [],
          linkedListSecondary: [j],
          linkedListPointers: { l1: i, l2: j },
          result: result.map((n) => ({ ...n })),
        },
        highlights: [j],
        pointers: { l2: j },
        message: `${v2} < ${v1}, append ${v2} from list2 to result. Advance l2.`,
        codeLine: 7,
        action: 'insert',
      });
      j++;
    }
  }

  // Remaining nodes from list1
  while (i < ll1.length) {
    result.push({ val: ll1[i].val, id: nodeId++ });
    steps.push({
      state: {
        linkedList: ll1.map((n) => ({ ...n })),
        linkedList2: ll2.map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { l1: i },
        result: result.map((n) => ({ ...n })),
      },
      highlights: [i],
      pointers: { l1: i },
      message: `List2 exhausted. Append remaining node ${ll1[i].val} from list1.`,
      codeLine: 8,
      action: 'insert',
    });
    i++;
  }

  // Remaining nodes from list2
  while (j < ll2.length) {
    result.push({ val: ll2[j].val, id: nodeId++ });
    steps.push({
      state: {
        linkedList: ll1.map((n) => ({ ...n })),
        linkedList2: ll2.map((n) => ({ ...n })),
        linkedListHighlights: [],
        linkedListSecondary: [j],
        linkedListPointers: { l2: j },
        result: result.map((n) => ({ ...n })),
      },
      highlights: [j],
      pointers: { l2: j },
      message: `List1 exhausted. Append remaining node ${ll2[j].val} from list2.`,
      codeLine: 9,
      action: 'insert',
    });
    j++;
  }

  // Final
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
    message: `Merged list: [${result.map((n) => n.val).join(' -> ')}]`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const mergeTwoSortedLists: Algorithm = {
  id: 'merge-two-sorted-lists',
  name: 'Merge Two Sorted Lists',
  category: 'Linked List',
  difficulty: 'Easy',
  timeComplexity: 'O(n+m)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — dummy head, compare and link',
  description:
    'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list by splicing together the nodes of the first two lists. Return the head of the merged linked list.',
  problemUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
  code: {
    python: `def mergeTwoLists(list1, list2):
    dummy = ListNode()
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next`,
    javascript: `function mergeTwoLists(list1, list2) {
    const dummy = new ListNode();
    let tail = dummy;
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            tail.next = list1;
            list1 = list1.next;
        } else {
            tail.next = list2;
            list2 = list2.next;
        }
        tail = tail.next;
    }
    tail.next = list1 || list2;
    return dummy.next;
}`,
    java: `public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    ListNode dummy = new ListNode();
    ListNode tail = dummy;
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) {
            tail.next = list1;
            list1 = list1.next;
        } else {
            tail.next = list2;
            list2 = list2.next;
        }
        tail = tail.next;
    }
    tail.next = list1 != null ? list1 : list2;
    return dummy.next;
}`,
  },
  defaultInput: { list1: [1, 2, 4], list2: [1, 3, 4] },
  run: runMergeTwoSortedLists,
};
