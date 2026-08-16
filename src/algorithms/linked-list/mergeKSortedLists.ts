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

function runMergeKSortedListsHeap(input: unknown): AlgorithmStep[] {
  const lists = input as number[][];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const allLists = lists.map((list) => list.map((val) => ({ val, id: nodeId++ })));

  // Heap entries: value, source list index, element index within that list
  type HeapEntry = { val: number; listIdx: number; elemIdx: number; id: number };
  const heap: HeapEntry[] = [];
  const heapDisplay = () => heap.map((e) => ({ val: e.val, id: e.id }));

  const result: { val: number | string; id: number }[] = [];

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
    message: `Min-heap idea: keep one candidate per list in a heap of size at most k=${lists.length}. Repeatedly pop the global minimum and push that list's next node — n pops at O(log k) each.`,
    codeLine: 3,
  });

  // Push initial heads
  for (let i = 0; i < allLists.length; i++) {
    if (allLists[i].length === 0) continue;
    const head = allLists[i][0];
    heap.push({ val: head.val as number, listIdx: i, elemIdx: 0, id: head.id });
    heap.sort((a, b) => a.val - b.val);

    steps.push({
      state: {
        linkedList: heapDisplay(),
        linkedListHighlights: [heap.findIndex((e) => e.id === head.id)],
        linkedListSecondary: [],
        linkedListPointers: { min: 0 },
        result: [],
        allLists: allLists.map((ll) => ll.map((n) => ({ ...n }))),
      },
      highlights: [heap.findIndex((e) => e.id === head.id)],
      message: `Seed the heap with the head of list ${i + 1}: push ${head.val}. Heap now holds [${heap.map((e) => e.val).join(', ')}] (min at front).`,
      codeLine: 7,
      action: 'push',
    });
  }

  // Pop min, push successor
  while (heap.length > 0) {
    const min = heap[0];

    steps.push({
      state: {
        linkedList: heapDisplay(),
        linkedListHighlights: [0],
        linkedListSecondary: [],
        linkedListPointers: { min: 0 },
        result: result.map((n) => ({ ...n })),
        allLists: allLists.map((ll) => ll.map((n) => ({ ...n }))),
      },
      highlights: [0],
      pointers: { min: 0 },
      message: `Pop the heap minimum: ${min.val} (from list ${min.listIdx + 1}). Only k candidates were compared — never all remaining nodes.`,
      codeLine: 11,
      action: 'pop',
    });

    heap.shift();
    result.push({ val: min.val, id: nodeId++ });

    steps.push({
      state: {
        linkedList: heapDisplay(),
        linkedListHighlights: [],
        linkedListSecondary: [],
        linkedListPointers: {},
        result: result.map((n) => ({ ...n })),
        allLists: allLists.map((ll) => ll.map((n) => ({ ...n }))),
      },
      highlights: [],
      message: `Append ${min.val} to the merged list: [${result.map((n) => n.val).join(' -> ')}]`,
      codeLine: 12,
      action: 'insert',
    });

    const nextIdx = min.elemIdx + 1;
    if (nextIdx < allLists[min.listIdx].length) {
      const nextNode = allLists[min.listIdx][nextIdx];
      heap.push({
        val: nextNode.val as number,
        listIdx: min.listIdx,
        elemIdx: nextIdx,
        id: nextNode.id,
      });
      heap.sort((a, b) => a.val - b.val);

      steps.push({
        state: {
          linkedList: heapDisplay(),
          linkedListHighlights: [heap.findIndex((e) => e.id === nextNode.id)],
          linkedListSecondary: [],
          linkedListPointers: { min: 0 },
          result: result.map((n) => ({ ...n })),
          allLists: allLists.map((ll) => ll.map((n) => ({ ...n }))),
        },
        highlights: [heap.findIndex((e) => e.id === nextNode.id)],
        message: `List ${min.listIdx + 1} still has nodes: push its next value ${nextNode.val}. Heap: [${heap.map((e) => e.val).join(', ')}]`,
        codeLine: 15,
        action: 'push',
      });
    }
  }

  steps.push({
    state: {
      linkedList: result.map((n) => ({ ...n })),
      linkedListHighlights: result.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
      result: result.map((n) => ({ ...n })),
    },
    highlights: result.map((_, i) => i),
    message: `Heap empty — all nodes consumed. Merged result: [${result.map((n) => n.val).join(' -> ')}]`,
    codeLine: 16,
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
  optimalApproachName: 'Divide & Conquer — Pairwise Merge',
  approaches: [
    {
      id: 'min-heap',
      name: 'Min-Heap',
      timeComplexity: 'O(n log k)',
      spaceComplexity: 'O(k)',
      description:
        'Keep the current head of each list in a size-k min-heap and repeatedly pop the global minimum — same O(n log k) time as pairwise merging, but built around a priority queue instead of recursion on pairs.',
      code: {
        python: `import heapq

def mergeKLists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))
    dummy = ListNode()
    tail = dummy
    while heap:
        val, i, node = heapq.heappop(heap)
        tail.next = node
        tail = tail.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
        javascript: `function mergeKLists(lists) {
    const heap = []; // acts as a min priority queue
    const push = (node) => {
        heap.push(node);
        heap.sort((a, b) => a.val - b.val);
    };
    for (const node of lists) {
        if (node) push(node);
    }
    const dummy = new ListNode();
    let tail = dummy;
    while (heap.length) {
        const node = heap.shift(); // smallest head
        tail.next = node;
        tail = tail.next;
        if (node.next) push(node.next);
    }
    return dummy.next;
}`,
        java: `public static ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> a.val - b.val);
    for (ListNode node : lists) {
        if (node != null) heap.offer(node);
    }
    ListNode dummy = new ListNode();
    ListNode tail = dummy;
    while (!heap.isEmpty()) {
        ListNode node = heap.poll();
        tail.next = node;
        tail = tail.next;
        if (node.next != null) heap.offer(node.next);
    }
    return dummy.next;
}`,
      },
      run: runMergeKSortedListsHeap,
      lineExplanations: {
        python: {
          1: 'heapq provides a binary min-heap over a plain list',
          3: 'Define function taking array of linked lists',
          4: 'The heap holds at most k entries — one per list',
          5: 'Look at the head of every input list',
          6: 'Skip empty lists',
          7: 'Push (val, i, node); the tuple sorts by val, i breaks ties',
          8: 'Dummy node to anchor the merged list',
          9: 'Tail tracks where the next node attaches',
          10: 'Keep going while any candidates remain',
          11: 'Pop the smallest head among all k lists — O(log k)',
          12: 'Attach that node to the merged list',
          13: 'Advance the tail',
          14: 'Does the popped node have a successor in its list?',
          15: 'Push the successor as that list\'s new candidate',
          16: 'Return merged list after the dummy',
        },
        javascript: {
          1: 'Define function taking array of linked lists',
          2: 'Array standing in for a min priority queue',
          3: 'Helper: insert a node keeping the queue ordered',
          4: 'Add the node',
          5: 'Re-sort so the smallest val sits at index 0',
          7: 'Look at the head of every input list',
          8: 'Skip empty lists; seed the queue with each head',
          10: 'Dummy node to anchor the merged list',
          11: 'Tail tracks where the next node attaches',
          12: 'Keep going while any candidates remain',
          13: 'Take the smallest head among all k lists',
          14: 'Attach that node to the merged list',
          15: 'Advance the tail',
          16: 'Push the popped node\'s successor as the new candidate',
          18: 'Return merged list after the dummy',
        },
        java: {
          1: 'Define method taking array of linked lists',
          2: 'PriorityQueue ordered by node value — a size-k min-heap',
          3: 'Look at the head of every input list',
          4: 'Skip nulls; seed the heap with each head',
          6: 'Dummy node to anchor the merged list',
          7: 'Tail tracks where the next node attaches',
          8: 'Keep going while any candidates remain',
          9: 'Poll the smallest head among all k lists — O(log k)',
          10: 'Attach that node to the merged list',
          11: 'Advance the tail',
          12: 'Offer the popped node\'s successor as the new candidate',
          14: 'Return merged list after the dummy',
        },
      },
    },
  ],
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
