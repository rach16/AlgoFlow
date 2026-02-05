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
  },
  defaultInput: { list: [1, 2, 3, 4, 5], k: 2 },
  run: runReverseNodesKGroup,
};
