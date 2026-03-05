import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMergeKSortedLists(input: unknown): AlgorithmStep[] {
  const lists = input as number[][];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  // Build all linked lists
  const allLists = lists.map((list) =>
    list.map((val) => ({ val, id: nodeId++ }))
  );

  // Initial state
  steps.push({
    state: {
      linkedList: [],
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      result: [],
      allLists: allLists.map((ll) => ll.map((n) => ({ ...n }))),
    },
    highlights: [],
    message: `Merge ${lists.length} sorted linked lists using divide and conquer (merge pairs iteratively).`,
    codeLine: 1,
  });

  // Show all lists
  for (let i = 0; i < allLists.length; i++) {
    steps.push({
      state: {
        linkedList: allLists[i].map((n) => ({ ...n })),
        linkedListHighlights: allLists[i].map((_, idx) => idx),
        linkedListSecondary: [],
        linkedListPointers: {},
        result: [],
        allLists: allLists.map((ll) => ll.map((n) => ({ ...n }))),
      },
      highlights: allLists[i].map((_, idx) => idx),
      message: `List ${i + 1}: [${allLists[i].map((n) => n.val).join(' -> ')}]`,
      codeLine: 2,
      action: 'visit',
    });
  }

  // Merge pairs iteratively
  let currentLists: { val: number | string; id: number }[][] = allLists.map((ll) => ll.map((n) => ({ ...n })));
  let round = 0;

  while (currentLists.length > 1) {
    round++;
    const nextLists: { val: number | string; id: number }[][] = [];

    steps.push({
      state: {
        linkedList: [],
        linkedListHighlights: [],
        linkedListSecondary: [],
        linkedListPointers: {},
        result: [],
        allLists: currentLists.map((ll) => ll.map((n) => ({ ...n }))),
      },
      highlights: [],
      message: `Round ${round}: Merge ${currentLists.length} lists into ${Math.ceil(currentLists.length / 2)} lists by pairing.`,
      codeLine: 3,
    });

    for (let i = 0; i < currentLists.length; i += 2) {
      if (i + 1 >= currentLists.length) {
        // Odd list out, carry forward
        nextLists.push(currentLists[i].map((n) => ({ ...n })));
        steps.push({
          state: {
            linkedList: currentLists[i].map((n) => ({ ...n })),
            linkedListHighlights: currentLists[i].map((_, idx) => idx),
            linkedListSecondary: [],
            linkedListPointers: {},
            result: [],
          },
          highlights: [],
          message: `Odd list [${currentLists[i].map((n) => n.val).join(' -> ')}] carries forward.`,
          codeLine: 4,
          action: 'visit',
        });
        continue;
      }

      const l1 = currentLists[i];
      const l2 = currentLists[i + 1];

      // Show pair being merged
      steps.push({
        state: {
          linkedList: l1.map((n) => ({ ...n })),
          linkedList2: l2.map((n) => ({ ...n })),
          linkedListHighlights: [],
          linkedListSecondary: [],
          linkedListPointers: {},
          result: [],
        },
        highlights: [],
        message: `Merging: [${l1.map((n) => n.val).join(' -> ')}] and [${l2.map((n) => n.val).join(' -> ')}]`,
        codeLine: 5,
        action: 'visit',
      });

      // Merge two sorted lists
      const merged: { val: number | string; id: number }[] = [];
      let p1 = 0;
      let p2 = 0;

      while (p1 < l1.length && p2 < l2.length) {
        const v1 = l1[p1].val as number;
        const v2 = l2[p2].val as number;

        if (v1 <= v2) {
          merged.push({ val: v1, id: nodeId++ });
          steps.push({
            state: {
              linkedList: l1.map((n) => ({ ...n })),
              linkedList2: l2.map((n) => ({ ...n })),
              linkedListHighlights: [p1],
              linkedListSecondary: [p2],
              linkedListPointers: { l1: p1, l2: p2 },
              result: merged.map((n) => ({ ...n })),
            },
            highlights: [p1],
            pointers: { l1: p1, l2: p2 },
            message: `${v1} <= ${v2}: take ${v1} from list1`,
            codeLine: 6,
            action: 'compare',
          });
          p1++;
        } else {
          merged.push({ val: v2, id: nodeId++ });
          steps.push({
            state: {
              linkedList: l1.map((n) => ({ ...n })),
              linkedList2: l2.map((n) => ({ ...n })),
              linkedListHighlights: [p1],
              linkedListSecondary: [p2],
              linkedListPointers: { l1: p1, l2: p2 },
              result: merged.map((n) => ({ ...n })),
            },
            highlights: [p2],
            pointers: { l1: p1, l2: p2 },
            message: `${v2} < ${v1}: take ${v2} from list2`,
            codeLine: 7,
            action: 'compare',
          });
          p2++;
        }
      }

      while (p1 < l1.length) {
        merged.push({ val: l1[p1].val, id: nodeId++ });
        p1++;
      }
      while (p2 < l2.length) {
        merged.push({ val: l2[p2].val, id: nodeId++ });
        p2++;
      }

      if (p1 > l1.length - 1 || p2 > l2.length - 1) {
        steps.push({
          state: {
            linkedList: l1.map((n) => ({ ...n })),
            linkedList2: l2.map((n) => ({ ...n })),
            linkedListHighlights: [],
            linkedListSecondary: [],
            linkedListPointers: {},
            result: merged.map((n) => ({ ...n })),
          },
          highlights: [],
          message: `Merge complete for this pair: [${merged.map((n) => n.val).join(' -> ')}]`,
          codeLine: 8,
          action: 'insert',
        });
      }

      nextLists.push(merged);
    }

    currentLists = nextLists;
  }

  // Final result
  const result = currentLists.length > 0 ? currentLists[0] : [];
  steps.push({
    state: {
      linkedList: result.map((n) => ({ ...n })),
      linkedListHighlights: result.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
      result: result.map((n) => ({ ...n })),
    },
    highlights: result.map((_, i) => i),
    message: `All lists merged! Final result: [${result.map((n) => n.val).join(' -> ')}]`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const mergeKSortedLists: Algorithm = {
  id: 'merge-k-sorted-lists',
  name: 'Merge K Sorted Lists',
  category: 'Linked List',
  difficulty: 'Hard',
  timeComplexity: 'O(n log k)',
  spaceComplexity: 'O(k)',
  pattern: 'Divide & Conquer — pairwise merge until one list',
  description:
    'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
  problemUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
  code: {
    python: `def mergeKLists(lists):
    if not lists:
        return None
    while len(lists) > 1:
        merged = []
        for i in range(0, len(lists), 2):
            l1 = lists[i]
            l2 = lists[i+1] if i+1 < len(lists) else None
            merged.append(mergeTwoLists(l1, l2))
        lists = merged
    return lists[0]

def mergeTwoLists(l1, l2):
    dummy = ListNode()
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next`,
    javascript: `function mergeKLists(lists) {
    if (!lists.length) return null;
    while (lists.length > 1) {
        const merged = [];
        for (let i = 0; i < lists.length; i += 2) {
            const l1 = lists[i];
            const l2 = i + 1 < lists.length ? lists[i+1] : null;
            merged.push(mergeTwoLists(l1, l2));
        }
        lists = merged;
    }
    return lists[0];
}

function mergeTwoLists(l1, l2) {
    const dummy = new ListNode();
    let tail = dummy;
    while (l1 && l2) {
        if (l1.val <= l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }
    tail.next = l1 || l2;
    return dummy.next;
}`,
    java: `public static ListNode mergeKLists(ListNode[] lists) {
    if (lists == null || lists.length == 0) return null;

    while (lists.length > 1) {
        List<ListNode> merged = new ArrayList<>();
        for (int i = 0; i < lists.length; i += 2) {
            ListNode l1 = lists[i];
            ListNode l2 = i + 1 < lists.length ? lists[i + 1] : null;
            merged.add(mergeTwoLists(l1, l2));
        }
        lists = merged.toArray(new ListNode[0]);
    }

    return lists[0];
}

private static ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode();
    ListNode tail = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }
    tail.next = l1 != null ? l1 : l2;
    return dummy.next;
}`,
  },
  defaultInput: [
    [1, 4, 5],
    [1, 3, 4],
    [2, 6],
  ],
  run: runMergeKSortedLists,
  lineExplanations: {
    python: {
      1: 'Define function taking array of linked lists',
      2: 'Return None if input is empty',
      3: 'Return None early',
      4: 'Keep merging until one list remains',
      5: 'Accumulate merged pairs',
      6: 'Iterate in steps of 2 to pair lists',
      7: 'Get the first list of the pair',
      8: 'Get the second list or None if odd',
      9: 'Merge the pair and add to results',
      10: 'Replace lists with merged results',
      11: 'Return the single merged list',
      13: 'Helper: merge two sorted linked lists',
      14: 'Create dummy node for result',
      15: 'Tail pointer for appending nodes',
      16: 'While both lists have nodes',
      17: 'If l1 value is smaller or equal',
      18: 'Append l1 node to result',
      19: 'Advance l1 pointer',
      21: 'Append l2 node to result',
      22: 'Advance l2 pointer',
      23: 'Move tail to the newly appended node',
      24: 'Append remaining nodes from either list',
      25: 'Return merged list after dummy',
    },
    javascript: {
      1: 'Define function taking array of linked lists',
      2: 'Return null if input is empty',
      3: 'Keep merging until one list remains',
      4: 'Accumulate merged pairs',
      5: 'Iterate in steps of 2 to pair lists',
      6: 'Get the first list of the pair',
      7: 'Get the second list or null if odd',
      8: 'Merge the pair and add to results',
      10: 'Replace lists with merged results',
      12: 'Return the single merged list',
      15: 'Helper: merge two sorted linked lists',
      16: 'Create dummy node for result',
      17: 'Tail pointer for appending nodes',
      18: 'While both lists have nodes',
      19: 'If l1 value is smaller or equal',
      20: 'Append l1 node to result',
      21: 'Advance l1 pointer',
      23: 'Append l2 node to result',
      24: 'Advance l2 pointer',
      26: 'Move tail to the newly appended node',
      28: 'Append remaining nodes from either list',
      29: 'Return merged list after dummy',
    },
    java: {
      1: 'Define method taking array of linked lists',
      2: 'Return null if input is empty',
      4: 'Keep merging until one list remains',
      5: 'Accumulate merged pairs',
      6: 'Iterate in steps of 2 to pair lists',
      7: 'Get the first list of the pair',
      8: 'Get the second list or null if odd',
      9: 'Merge the pair and add to results',
      11: 'Convert merged list back to array',
      14: 'Return the single merged list',
      17: 'Helper: merge two sorted linked lists',
      18: 'Create dummy node for result',
      19: 'Tail pointer for appending nodes',
      20: 'While both lists have nodes',
      21: 'If l1 value is smaller or equal',
      22: 'Append l1 node to result',
      23: 'Advance l1 pointer',
      25: 'Append l2 node to result',
      26: 'Advance l2 pointer',
      28: 'Move tail to the newly appended node',
      30: 'Append remaining nodes from either list',
      31: 'Return merged list after dummy',
    },
  },
};
