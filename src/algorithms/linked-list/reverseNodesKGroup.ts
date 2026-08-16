import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface ReverseKGroupInput {
  list: number[];
  k: number;
}

function runReverseNodesKGroup(input: unknown): AlgorithmStep[] {
  const { list, k } = input as ReverseKGroupInput;
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
    message: `Reverse nodes in groups of k=${k}. If remaining nodes < k, leave them as-is.`,
    codeLine: 1,
  });

  if (k <= 1 || linkedList.length === 0) {
    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: linkedList.map((_, i) => i),
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: [],
      message: k <= 1 ? 'k=1, no reversal needed.' : 'Empty list.',
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  // Process groups
  const result: { val: number | string; id: number }[] = [];
  let groupStart = 0;
  let groupNum = 0;

  while (groupStart < linkedList.length) {
    const groupEnd = Math.min(groupStart + k, linkedList.length);
    const groupSize = groupEnd - groupStart;
    groupNum++;

    // Highlight the current group
    const groupIndices = [];
    for (let i = groupStart; i < groupEnd; i++) {
      groupIndices.push(i);
    }

    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: groupIndices,
        linkedListSecondary: [],
        linkedListPointers: { 'group start': groupStart, 'group end': groupEnd - 1 },
      },
      highlights: groupIndices,
      message: `Group ${groupNum}: nodes at indices [${groupStart}..${groupEnd - 1}], values [${groupIndices.map((i) => linkedList[i].val).join(', ')}]`,
      codeLine: 3,
      action: 'visit',
    });

    if (groupSize < k) {
      // Not enough nodes for a full group, keep original order
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: groupIndices,
          linkedListSecondary: [],
          linkedListPointers: {},
        },
        highlights: groupIndices,
        message: `Only ${groupSize} nodes remaining (< k=${k}). Keep original order.`,
        codeLine: 4,
        action: 'visit',
      });

      for (let i = groupStart; i < groupEnd; i++) {
        result.push({ ...linkedList[i] });
      }
    } else {
      // Reverse this group
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: groupIndices,
          linkedListSecondary: [],
          linkedListPointers: {},
        },
        highlights: groupIndices,
        message: `Full group of ${k} nodes. Reversing...`,
        codeLine: 5,
        action: 'visit',
      });

      // Show the reversal step by step
      const group = [];
      for (let i = groupStart; i < groupEnd; i++) {
        group.push({ ...linkedList[i] });
      }

      // Reverse in the group
      const reversed = [...group].reverse();

      for (let r = 0; r < reversed.length; r++) {
        const origIdx = groupEnd - 1 - r;
        steps.push({
          state: {
            linkedList: linkedList.map((n) => ({ ...n })),
            linkedListHighlights: [origIdx],
            linkedListSecondary: groupIndices.filter((gi) => gi !== origIdx),
            linkedListPointers: { curr: origIdx },
            result: [...result, ...reversed.slice(0, r + 1)].map((n) => ({ ...n })),
          },
          highlights: [origIdx],
          pointers: { curr: origIdx },
          message: `Move node ${reversed[r].val} (from position ${origIdx}) to reversed position ${result.length + r}`,
          codeLine: 6,
          action: 'swap',
        });
      }

      for (const node of reversed) {
        result.push(node);
      }

      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: groupIndices,
          linkedListSecondary: [],
          linkedListPointers: {},
          result: result.map((n) => ({ ...n })),
        },
        highlights: groupIndices,
        message: `Group ${groupNum} reversed: [${reversed.map((n) => n.val).join(' -> ')}]`,
        codeLine: 7,
        action: 'swap',
      });
    }

    groupStart = groupEnd;
  }

  // Final result
  steps.push({
    state: {
      linkedList: result.map((n) => ({ ...n })),
      linkedListHighlights: result.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
    },
    highlights: result.map((_, i) => i),
    message: `All groups processed! Result: [${result.map((n) => n.val).join(' -> ')}]`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runReverseNodesKGroupStack(input: unknown): AlgorithmStep[] {
  const { list, k } = input as ReverseKGroupInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const linkedList = list.map((val) => ({ val, id: nodeId++ }));

  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Stack idea: a stack reverses order for free — push k=${k} nodes, then pop them. Pops come out back-to-front, which is exactly the reversed group.`,
    codeLine: 1,
  });

  if (k <= 1 || linkedList.length === 0) {
    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: linkedList.map((_, i) => i),
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: [],
      message: k <= 1 ? 'k=1, groups of one node are already "reversed".' : 'Empty list.',
      codeLine: 21,
      action: 'found',
    });
    return steps;
  }

  const result: { val: number | string; id: number }[] = [];
  let groupStart = 0;
  let groupNum = 0;

  while (groupStart < linkedList.length) {
    const groupEnd = Math.min(groupStart + k, linkedList.length);
    const groupSize = groupEnd - groupStart;
    groupNum++;

    // Push phase
    const stacked: number[] = [];
    for (let i = groupStart; i < groupEnd; i++) {
      stacked.push(i);
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [i],
          linkedListSecondary: stacked.slice(0, -1),
          linkedListPointers: { probe: i },
          result: result.map((n) => ({ ...n })),
        },
        highlights: [i],
        pointers: { probe: i },
        message: `Group ${groupNum}: push node ${linkedList[i].val} onto the stack (stack: [${stacked.map((s) => linkedList[s].val).join(', ')}], top on the right).`,
        codeLine: 10,
        action: 'push',
      });
    }

    if (groupSize < k) {
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: stacked,
          linkedListSecondary: [],
          linkedListPointers: {},
          result: result.map((n) => ({ ...n })),
        },
        highlights: stacked,
        message: `Only ${groupSize} node(s) gathered — fewer than k=${k}. Attach the leftover in original order instead of popping.`,
        codeLine: 14,
        action: 'visit',
      });

      for (let i = groupStart; i < groupEnd; i++) {
        result.push({ ...linkedList[i] });
      }
      break;
    }

    // Pop phase
    for (let r = stacked.length - 1; r >= 0; r--) {
      const idx = stacked[r];
      result.push({ ...linkedList[idx] });
      steps.push({
        state: {
          linkedList: linkedList.map((n) => ({ ...n })),
          linkedListHighlights: [idx],
          linkedListSecondary: stacked.slice(0, r),
          linkedListPointers: { top: idx },
          result: result.map((n) => ({ ...n })),
        },
        highlights: [idx],
        pointers: { top: idx },
        message: `Pop node ${linkedList[idx].val} (stack top) and append it — last pushed comes out first, reversing the group.`,
        codeLine: 17,
        action: 'pop',
      });
    }

    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: stacked,
        linkedListSecondary: [],
        linkedListPointers: {},
        result: result.map((n) => ({ ...n })),
      },
      highlights: stacked,
      message: `Group ${groupNum} done. Reconnect the tail to the rest of the list and move to the next group.`,
      codeLine: 19,
      action: 'visit',
    });

    groupStart = groupEnd;
  }

  steps.push({
    state: {
      linkedList: result.map((n) => ({ ...n })),
      linkedListHighlights: result.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
    },
    highlights: result.map((_, i) => i),
    message: `All groups processed! Result: [${result.map((n) => n.val).join(' -> ')}]. Simpler than in-place relinking, but the stack costs O(k) extra space.`,
    codeLine: 21,
    action: 'found',
  });

  return steps;
}

export const reverseNodesKGroup: Algorithm = {
  id: 'reverse-nodes-k-group',
  name: 'Reverse Nodes in K-Group',
  category: 'Linked List',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Iterative — count k nodes, reverse segment, link groups',
  description:
    'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list. k is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes, in the end, should remain as it is.',
  problemUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/',
  code: {
    python: `def reverseKGroup(head, k):
    dummy = ListNode(0, head)
    groupPrev = dummy
    while True:
        kth = getKth(groupPrev, k)
        if not kth:
            break
        groupNext = kth.next
        # Reverse group
        prev, curr = kth.next, groupPrev.next
        while curr != groupNext:
            tmp = curr.next
            curr.next = prev
            prev = curr
            curr = tmp
        tmp = groupPrev.next
        groupPrev.next = kth
        groupPrev = tmp
    return dummy.next

def getKth(curr, k):
    while curr and k > 0:
        curr = curr.next
        k -= 1
    return curr`,
    javascript: `function reverseKGroup(head, k) {
    const dummy = new ListNode(0, head);
    let groupPrev = dummy;
    while (true) {
        const kth = getKth(groupPrev, k);
        if (!kth) break;
        const groupNext = kth.next;
        // Reverse group
        let prev = kth.next, curr = groupPrev.next;
        while (curr !== groupNext) {
            const tmp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = tmp;
        }
        const tmp = groupPrev.next;
        groupPrev.next = kth;
        groupPrev = tmp;
    }
    return dummy.next;
}

function getKth(curr, k) {
    while (curr && k > 0) {
        curr = curr.next;
        k--;
    }
    return curr;
}`,
    java: `public static ListNode reverseKGroup(ListNode head, int k) {
    ListNode dummy = new ListNode(0, head);
    ListNode groupPrev = dummy;

    while (true) {
        ListNode kth = getKth(groupPrev, k);
        if (kth == null) break;
        ListNode groupNext = kth.next;

        // Reverse group
        ListNode prev = kth.next;
        ListNode curr = groupPrev.next;
        while (curr != groupNext) {
            ListNode tmp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = tmp;
        }

        ListNode tmp = groupPrev.next;
        groupPrev.next = kth;
        groupPrev = tmp;
    }

    return dummy.next;
}

private static ListNode getKth(ListNode curr, int k) {
    while (curr != null && k > 0) {
        curr = curr.next;
        k--;
    }
    return curr;
}`,
  },
  defaultInput: { list: [1, 2, 3, 4, 5], k: 2 },
  run: runReverseNodesKGroup,
  optimalApproachName: 'Iterative In-Place Reversal',
  approaches: [
    {
      id: 'stack-per-group',
      name: 'Stack per Group',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(k)',
      description:
        'Push each group of k nodes onto a stack and pop them back out — LIFO order reverses the group with no pointer gymnastics, trading O(k) extra space for much simpler logic.',
      code: {
        python: `def reverseKGroup(head, k):
    dummy = ListNode(0)
    tail = dummy
    curr = head
    while curr:
        stack = []
        probe = curr
        count = 0
        while probe and count < k:
            stack.append(probe)
            probe = probe.next
            count += 1
        if count < k:
            tail.next = curr
            break
        while stack:
            tail.next = stack.pop()
            tail = tail.next
        tail.next = probe
        curr = probe
    return dummy.next`,
        javascript: `function reverseKGroup(head, k) {
    const dummy = new ListNode(0);
    let tail = dummy;
    let curr = head;
    while (curr) {
        const stack = [];
        let probe = curr;
        let count = 0;
        while (probe && count < k) {
            stack.push(probe);
            probe = probe.next;
            count++;
        }
        if (count < k) {
            tail.next = curr;
            break;
        }
        while (stack.length) {
            tail.next = stack.pop();
            tail = tail.next;
        }
        tail.next = probe;
        curr = probe;
    }
    return dummy.next;
}`,
        java: `public static ListNode reverseKGroup(ListNode head, int k) {
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    ListNode curr = head;
    while (curr != null) {
        Deque<ListNode> stack = new ArrayDeque<>();
        ListNode probe = curr;
        int count = 0;
        while (probe != null && count < k) {
            stack.push(probe);
            probe = probe.next;
            count++;
        }
        if (count < k) {
            tail.next = curr;
            break;
        }
        while (!stack.isEmpty()) {
            tail.next = stack.pop();
            tail = tail.next;
        }
        tail.next = probe;
        curr = probe;
    }
    return dummy.next;
}`,
      },
      run: runReverseNodesKGroupStack,
      lineExplanations: {
        python: {
          1: 'Define function taking head and group size k',
          2: 'Dummy node anchors the rebuilt list',
          3: 'Tail is where the next popped node attaches',
          4: 'curr marks the start of the current group',
          5: 'Process group after group until the list ends',
          6: 'Fresh stack for this group',
          7: 'Probe walks ahead to gather the group',
          8: 'Count how many nodes we managed to gather',
          9: 'Gather up to k nodes',
          10: 'Push each node — last pushed will pop first',
          11: 'Probe moves toward the next group',
          12: 'One more node gathered',
          13: 'Incomplete group at the end?',
          14: 'Attach the leftover nodes in original order',
          15: 'Done — no more full groups',
          16: 'Pop the whole stack',
          17: 'Each pop appends nodes in reverse push order',
          18: 'Advance the tail to the appended node',
          19: 'Reconnect the reversed group to the rest of the list',
          20: 'Next group starts where probe stopped',
          21: 'Return the rebuilt list after the dummy',
        },
        javascript: {
          1: 'Define function taking head and group size k',
          2: 'Dummy node anchors the rebuilt list',
          3: 'Tail is where the next popped node attaches',
          4: 'curr marks the start of the current group',
          5: 'Process group after group until the list ends',
          6: 'Fresh stack for this group',
          7: 'Probe walks ahead to gather the group',
          8: 'Count how many nodes we managed to gather',
          9: 'Gather up to k nodes',
          10: 'Push each node — last pushed will pop first',
          11: 'Probe moves toward the next group',
          12: 'One more node gathered',
          14: 'Incomplete group at the end?',
          15: 'Attach the leftover nodes in original order',
          16: 'Done — no more full groups',
          18: 'Pop the whole stack',
          19: 'Each pop appends nodes in reverse push order',
          20: 'Advance the tail to the appended node',
          22: 'Reconnect the reversed group to the rest of the list',
          23: 'Next group starts where probe stopped',
          25: 'Return the rebuilt list after the dummy',
        },
        java: {
          1: 'Define method taking head and group size k',
          2: 'Dummy node anchors the rebuilt list',
          3: 'Tail is where the next popped node attaches',
          4: 'curr marks the start of the current group',
          5: 'Process group after group until the list ends',
          6: 'Fresh stack (ArrayDeque) for this group',
          7: 'Probe walks ahead to gather the group',
          8: 'Count how many nodes we managed to gather',
          9: 'Gather up to k nodes',
          10: 'Push each node — last pushed will pop first',
          11: 'Probe moves toward the next group',
          12: 'One more node gathered',
          14: 'Incomplete group at the end?',
          15: 'Attach the leftover nodes in original order',
          16: 'Done — no more full groups',
          18: 'Pop the whole stack',
          19: 'Each pop appends nodes in reverse push order',
          20: 'Advance the tail to the appended node',
          22: 'Reconnect the reversed group to the rest of the list',
          23: 'Next group starts where probe stopped',
          25: 'Return the rebuilt list after the dummy',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking head and group size k',
      2: 'Create dummy node pointing to head',
      3: 'Track the node before current group',
      4: 'Loop until no more full groups',
      5: 'Find the kth node from groupPrev',
      6: 'If fewer than k nodes remain, stop',
      7: 'Break out of the loop',
      8: 'Save the node after current group',
      10: 'Init prev and curr for in-group reversal',
      11: 'Reverse nodes within the group',
      12: 'Save next node before overwriting',
      13: 'Reverse the link direction',
      14: 'Move prev forward',
      15: 'Move curr to saved next',
      16: 'Save old group start (will become group end)',
      17: 'Link groupPrev to new group start (kth)',
      18: 'Move groupPrev to old group start',
      19: 'Return list starting after dummy',
      21: 'Helper: find kth node from curr',
      22: 'Walk k steps forward',
      23: 'Move to next node',
      24: 'Decrement counter',
      25: 'Return kth node or null if too short',
    },
    javascript: {
      1: 'Define function taking head and group size k',
      2: 'Create dummy node pointing to head',
      3: 'Track the node before current group',
      4: 'Loop until no more full groups',
      5: 'Find the kth node from groupPrev',
      6: 'If fewer than k nodes remain, stop',
      7: 'Save the node after current group',
      9: 'Init prev and curr for in-group reversal',
      10: 'Reverse nodes within the group',
      11: 'Save next node before overwriting',
      12: 'Reverse the link direction',
      13: 'Move prev forward',
      14: 'Move curr to saved next',
      16: 'Save old group start (will become group end)',
      17: 'Link groupPrev to new group start (kth)',
      18: 'Move groupPrev to old group start',
      20: 'Return list starting after dummy',
      23: 'Helper: find kth node from curr',
      24: 'Walk k steps forward while nodes exist',
      25: 'Move to next node',
      26: 'Decrement counter',
      28: 'Return kth node or null if too short',
    },
    java: {
      1: 'Define method taking head and group size k',
      2: 'Create dummy node pointing to head',
      3: 'Track the node before current group',
      5: 'Loop until no more full groups',
      6: 'Find the kth node from groupPrev',
      7: 'If fewer than k nodes remain, stop',
      8: 'Save the node after current group',
      11: 'Init prev for reversal to node after group',
      12: 'Init curr to first node of the group',
      13: 'Reverse nodes within the group',
      14: 'Save next node before overwriting',
      15: 'Reverse the link direction',
      16: 'Move prev forward',
      17: 'Move curr to saved next',
      20: 'Save old group start (will become group end)',
      21: 'Link groupPrev to new group start (kth)',
      22: 'Move groupPrev to old group start',
      25: 'Return list starting after dummy',
      28: 'Helper: find kth node from curr',
      29: 'Walk k steps forward while nodes exist',
      30: 'Move to next node',
      31: 'Decrement counter',
      33: 'Return kth node or null if too short',
    },
  },
};
