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

function runMergeTwoSortedListsRecursive(input: unknown): AlgorithmStep[] {
  const { list1, list2 } = input as MergeTwoInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const ll1 = list1.map((val) => ({ val, id: nodeId++ }));
  const ll2 = list2.map((val) => ({ val, id: nodeId++ }));
  const result: { val: number | string; id: number }[] = [];

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
    message:
      'Recursive idea: the merged list starts with the smaller head, whose next is the merge of everything that remains. Each call peels off one node.',
    codeLine: 1,
  });

  let i = 0;
  let j = 0;
  let depth = 0;

  while (i < ll1.length && j < ll2.length) {
    const v1 = ll1[i].val as number;
    const v2 = ll2[j].val as number;
    depth++;

    steps.push({
      state: {
        linkedList: ll1.map((n) => ({ ...n })),
        linkedList2: ll2.map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: [j],
        linkedListPointers: { l1: i, l2: j },
        result: result.map((n) => ({ ...n })),
      },
      highlights: [i, j],
      pointers: { l1: i, l2: j },
      message: `Call ${depth}: compare list1.val=${v1} vs list2.val=${v2} — the smaller node wins this level of recursion.`,
      codeLine: 6,
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
        message: `${v1} <= ${v2}: node ${v1} takes this spot. Its next will be filled by recursing on (list1.next, list2).`,
        codeLine: 7,
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
        message: `${v2} < ${v1}: node ${v2} takes this spot. Its next will be filled by recursing on (list1, list2.next).`,
        codeLine: 10,
        action: 'insert',
      });
      j++;
    }
  }

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
      message: `Base case: list2 is empty, so the recursion returns the rest of list1 as-is — append node ${ll1[i].val}.`,
      codeLine: 5,
      action: 'insert',
    });
    i++;
  }

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
      message: `Base case: list1 is empty, so the recursion returns the rest of list2 as-is — append node ${ll2[j].val}.`,
      codeLine: 3,
      action: 'insert',
    });
    j++;
  }

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
    message: `All calls return and the chain links up: [${result.map((n) => n.val).join(' -> ')}]`,
    codeLine: 8,
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
  optimalApproachName: 'Iterative with Dummy Node',
  approaches: [
    {
      id: 'recursive',
      name: 'Recursion',
      timeComplexity: 'O(n+m)',
      spaceComplexity: 'O(n+m)',
      description:
        'Let recursion do the linking: the smaller head claims the front and its next is the merge of the rest — no dummy node needed, but the call stack costs O(n+m) space.',
      code: {
        python: `def mergeTwoLists(list1, list2):
    if not list1:
        return list2
    if not list2:
        return list1
    if list1.val <= list2.val:
        list1.next = mergeTwoLists(list1.next, list2)
        return list1
    else:
        list2.next = mergeTwoLists(list1, list2.next)
        return list2`,
        javascript: `function mergeTwoLists(list1, list2) {
    if (!list1) return list2;
    if (!list2) return list1;
    if (list1.val <= list2.val) {
        list1.next = mergeTwoLists(list1.next, list2);
        return list1;
    }
    list2.next = mergeTwoLists(list1, list2.next);
    return list2;
}`,
        java: `public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    if (list1 == null) return list2;
    if (list2 == null) return list1;
    if (list1.val <= list2.val) {
        list1.next = mergeTwoLists(list1.next, list2);
        return list1;
    }
    list2.next = mergeTwoLists(list1, list2.next);
    return list2;
}`,
      },
      run: runMergeTwoSortedListsRecursive,
      lineExplanations: {
        python: {
          1: 'Define recursive function taking two sorted list heads',
          2: 'Base case: list1 is empty',
          3: 'Nothing left to merge — return the rest of list2',
          4: 'Base case: list2 is empty',
          5: 'Nothing left to merge — return the rest of list1',
          6: 'Compare the two heads',
          7: 'list1 head is smaller: its next is the merge of the rest',
          8: 'Return list1 head as the front of this sublist',
          9: 'Otherwise list2 head is smaller',
          10: 'list2 head claims the spot: its next is the merge of the rest',
          11: 'Return list2 head as the front of this sublist',
        },
        javascript: {
          1: 'Define recursive function taking two sorted list heads',
          2: 'Base case: list1 empty — return the rest of list2',
          3: 'Base case: list2 empty — return the rest of list1',
          4: 'Compare the two heads',
          5: 'list1 head is smaller: its next is the merge of the rest',
          6: 'Return list1 head as the front of this sublist',
          8: 'list2 head is smaller: its next is the merge of the rest',
          9: 'Return list2 head as the front of this sublist',
        },
        java: {
          1: 'Define recursive method taking two sorted list heads',
          2: 'Base case: list1 empty — return the rest of list2',
          3: 'Base case: list2 empty — return the rest of list1',
          4: 'Compare the two heads',
          5: 'list1 head is smaller: its next is the merge of the rest',
          6: 'Return list1 head as the front of this sublist',
          8: 'list2 head is smaller: its next is the merge of the rest',
          9: 'Return list2 head as the front of this sublist',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking two sorted list heads',
      2: 'Create dummy node as placeholder for result head',
      3: 'Tail pointer tracks end of merged list',
      4: 'Loop while both lists have nodes remaining',
      5: 'If list1 value is smaller or equal',
      6: 'Append list1 node to merged list',
      7: 'Advance list1 pointer to next node',
      9: 'Append list2 node to merged list',
      10: 'Advance list2 pointer to next node',
      11: 'Move tail to the newly appended node',
      12: 'Attach whichever list still has nodes left',
      13: 'Return head of merged list (skip dummy)',
    },
    javascript: {
      1: 'Define function taking two sorted list heads',
      2: 'Create dummy node as placeholder for result head',
      3: 'Tail pointer tracks end of merged list',
      4: 'Loop while both lists have nodes remaining',
      5: 'If list1 value is smaller or equal',
      6: 'Append list1 node to merged list',
      7: 'Advance list1 pointer to next node',
      9: 'Append list2 node to merged list',
      10: 'Advance list2 pointer to next node',
      12: 'Move tail to the newly appended node',
      14: 'Attach whichever list still has nodes left',
      15: 'Return head of merged list (skip dummy)',
    },
    java: {
      1: 'Define method taking two sorted list heads',
      2: 'Create dummy node as placeholder for result head',
      3: 'Tail pointer tracks end of merged list',
      4: 'Loop while both lists have nodes remaining',
      5: 'If list1 value is smaller or equal',
      6: 'Append list1 node to merged list',
      7: 'Advance list1 pointer to next node',
      9: 'Append list2 node to merged list',
      10: 'Advance list2 pointer to next node',
      12: 'Move tail to the newly appended node',
      14: 'Attach remaining nodes from non-empty list',
      15: 'Return head of merged list (skip dummy)',
    },
  },
};
