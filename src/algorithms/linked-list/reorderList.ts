import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runReorderList(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const linkedList = nums.map((val) => ({ val, id: nodeId++ }));

  if (linkedList.length <= 2) {
    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: linkedList.map((_, i) => i),
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: [],
      message: `List has ${linkedList.length} node(s), no reordering needed.`,
      codeLine: 1,
      action: 'found',
    });
    return steps;
  }

  // Initial state
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: 'Reorder list: L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...',
    codeLine: 1,
  });

  // Step 1: Find middle using slow/fast pointers
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [0],
      linkedListSecondary: [0],
      linkedListPointers: { slow: 0, fast: 0 },
    },
    highlights: [0],
    message: 'Step 1: Find middle of list using slow and fast pointers.',
    codeLine: 2,
    action: 'visit',
  });

  let slow = 0;
  let fast = 0;

  while (fast < linkedList.length - 1 && fast + 1 < linkedList.length - 1) {
    slow++;
    fast += 2;
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
  }

  const mid = slow;
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [mid],
      linkedListSecondary: [],
      linkedListPointers: { mid },
    },
    highlights: [mid],
    message: `Middle found at index ${mid} (val=${linkedList[mid].val}). Split list here.`,
    codeLine: 4,
    action: 'found',
  });

  // Step 2: Reverse second half
  const firstHalf = linkedList.slice(0, mid + 1).map((n) => ({ ...n }));
  const secondHalfOriginal = linkedList.slice(mid + 1).map((n) => ({ ...n }));
  const secondHalf = [...secondHalfOriginal].reverse().map((n) => ({ ...n }));

  steps.push({
    state: {
      linkedList: firstHalf.map((n) => ({ ...n })),
      linkedList2: secondHalfOriginal.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Split into two halves: [${firstHalf.map((n) => n.val).join(' -> ')}] and [${secondHalfOriginal.map((n) => n.val).join(' -> ')}]`,
    codeLine: 5,
    action: 'visit',
  });

  steps.push({
    state: {
      linkedList: firstHalf.map((n) => ({ ...n })),
      linkedList2: secondHalf.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: secondHalf.map((_, i) => i),
      linkedListPointers: {},
    },
    highlights: [],
    message: `Step 2: Reverse second half -> [${secondHalf.map((n) => n.val).join(' -> ')}]`,
    codeLine: 6,
    action: 'swap',
  });

  // Step 3: Merge alternately
  steps.push({
    state: {
      linkedList: firstHalf.map((n) => ({ ...n })),
      linkedList2: secondHalf.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: 'Step 3: Merge the two halves by alternating nodes.',
    codeLine: 7,
  });

  const result: { val: number | string; id: number }[] = [];
  let p1 = 0;
  let p2 = 0;

  while (p1 < firstHalf.length && p2 < secondHalf.length) {
    // Take from first half
    result.push({ ...firstHalf[p1] });
    steps.push({
      state: {
        linkedList: firstHalf.map((n) => ({ ...n })),
        linkedList2: secondHalf.map((n) => ({ ...n })),
        linkedListHighlights: [p1],
        linkedListSecondary: [],
        linkedListPointers: { l1: p1, l2: p2 },
        result: result.map((n) => ({ ...n })),
      },
      highlights: [p1],
      pointers: { l1: p1 },
      message: `Take node ${firstHalf[p1].val} from first half`,
      codeLine: 8,
      action: 'insert',
    });
    p1++;

    // Take from second half
    result.push({ ...secondHalf[p2] });
    steps.push({
      state: {
        linkedList: firstHalf.map((n) => ({ ...n })),
        linkedList2: secondHalf.map((n) => ({ ...n })),
        linkedListHighlights: [],
        linkedListSecondary: [p2],
        linkedListPointers: { l1: p1 < firstHalf.length ? p1 : -1, l2: p2 },
        result: result.map((n) => ({ ...n })),
      },
      highlights: [p2],
      pointers: { l2: p2 },
      message: `Take node ${secondHalf[p2].val} from reversed second half`,
      codeLine: 9,
      action: 'insert',
    });
    p2++;
  }

  // Remaining from first half (at most 1 node)
  while (p1 < firstHalf.length) {
    result.push({ ...firstHalf[p1] });
    steps.push({
      state: {
        linkedList: firstHalf.map((n) => ({ ...n })),
        linkedList2: secondHalf.map((n) => ({ ...n })),
        linkedListHighlights: [p1],
        linkedListSecondary: [],
        linkedListPointers: { l1: p1 },
        result: result.map((n) => ({ ...n })),
      },
      highlights: [p1],
      message: `Append remaining node ${firstHalf[p1].val} from first half`,
      codeLine: 8,
      action: 'insert',
    });
    p1++;
  }

  // Final
  steps.push({
    state: {
      linkedList: result.map((n) => ({ ...n })),
      linkedListHighlights: result.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: result.map((_, i) => i),
    message: `Reordered list: [${result.map((n) => n.val).join(' -> ')}]`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const reorderList: Algorithm = {
  id: 'reorder-list',
  name: 'Reorder List',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Find Middle + Reverse + Merge — three-step reorder',
  description:
    'You are given the head of a singly linked-list. Reorder the list to be: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ... You may not modify the values in the list\'s nodes. Only nodes themselves may be changed.',
  problemUrl: 'https://leetcode.com/problems/reorder-list/',
  code: {
    python: `def reorderList(head):
    # Find middle
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    # Reverse second half
    second = slow.next
    slow.next = None
    prev = None
    while second:
        tmp = second.next
        second.next = prev
        prev = second
        second = tmp
    # Merge two halves
    first, second = head, prev
    while second:
        tmp1, tmp2 = first.next, second.next
        first.next = second
        second.next = tmp1
        first, second = tmp1, tmp2`,
    javascript: `function reorderList(head) {
    // Find middle
    let slow = head, fast = head.next;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    // Reverse second half
    let second = slow.next;
    slow.next = null;
    let prev = null;
    while (second) {
        const tmp = second.next;
        second.next = prev;
        prev = second;
        second = tmp;
    }
    // Merge two halves
    let first = head;
    second = prev;
    while (second) {
        const tmp1 = first.next, tmp2 = second.next;
        first.next = second;
        second.next = tmp1;
        first = tmp1;
        second = tmp2;
    }
}`,
    java: `public static void reorderList(ListNode head) {
    // Find middle
    ListNode slow = head, fast = head.next;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Reverse second half
    ListNode second = slow.next;
    slow.next = null;
    ListNode prev = null;
    while (second != null) {
        ListNode tmp = second.next;
        second.next = prev;
        prev = second;
        second = tmp;
    }
    second = prev;

    // Merge
    ListNode first = head;
    while (second != null) {
        ListNode tmp1 = first.next;
        ListNode tmp2 = second.next;
        first.next = second;
        second.next = tmp1;
        first = tmp1;
        second = tmp2;
    }
}`,
  },
  defaultInput: [1, 2, 3, 4],
  run: runReorderList,
};
