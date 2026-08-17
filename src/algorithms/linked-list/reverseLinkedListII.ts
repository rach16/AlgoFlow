import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface ReverseBetweenInput {
  nums: number[];
  left: number;
  right: number;
}

function runReverseLinkedListII(input: unknown): AlgorithmStep[] {
  const { nums, left, right } = input as ReverseBetweenInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const list = nums.map((val) => ({ val: val as number | string, id: nodeId++ }));
  const show = () => list.map((n) => ({ ...n }));

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: Array.from({ length: right - left + 1 }, (_, i) => left - 1 + i),
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Reverse only positions ${left}..${right} of [${nums.join(' -> ')}], in ONE pass. A dummy node in front of the head keeps the left===1 case from needing special handling.`,
    codeLine: 1,
  });

  const pIdx = left - 2; // index of the node before the sublist (-1 means the dummy)
  let currIdx = left - 1;

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: { prev: 0 },
    },
    highlights: [],
    message: `prev starts at the dummy, one slot before the head. Walk it forward ${left - 1} time${left - 1 === 1 ? '' : 's'} so it lands just before position ${left}.`,
    codeLine: 3,
  });

  for (let j = 0; j < left - 1; j++) {
    steps.push({
      state: {
        linkedList: show(),
        linkedListHighlights: [j],
        linkedListSecondary: [],
        linkedListPointers: { prev: j },
      },
      highlights: [j],
      pointers: { prev: j },
      message: `prev advances to node ${list[j].val} (position ${j + 1}).`,
      codeLine: 5,
      action: 'visit',
    });
  }

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: [currIdx],
      linkedListSecondary: pIdx >= 0 ? [pIdx] : [],
      linkedListPointers: pIdx >= 0 ? { prev: pIdx, curr: currIdx } : { curr: currIdx },
    },
    highlights: [currIdx],
    pointers: { curr: currIdx },
    message: `curr = node ${list[currIdx].val} — the head of the section being reversed. curr never moves in the list; it just keeps sinking as nodes hop in front of it.`,
    codeLine: 7,
    action: 'visit',
  });

  for (let t = 0; t < right - left; t++) {
    const tempIdx = currIdx + 1;
    const tempVal = list[tempIdx].val;

    steps.push({
      state: {
        linkedList: show(),
        linkedListHighlights: [tempIdx],
        linkedListSecondary: [currIdx],
        linkedListPointers: { ...(pIdx >= 0 ? { prev: pIdx } : {}), curr: currIdx, temp: tempIdx },
      },
      highlights: [tempIdx],
      pointers: { curr: currIdx, temp: tempIdx },
      message: `temp = curr.next = node ${tempVal}. Unhook it: curr.next skips over temp to node ${tempIdx + 1 < list.length ? list[tempIdx + 1].val : 'null'}.`,
      codeLine: 9,
      action: 'delete',
    });

    const [node] = list.splice(tempIdx, 1);
    list.splice(pIdx + 1, 0, node);
    currIdx++;

    steps.push({
      state: {
        linkedList: show(),
        linkedListHighlights: [pIdx + 1],
        linkedListSecondary: [currIdx],
        linkedListPointers: { ...(pIdx >= 0 ? { prev: pIdx } : {}), curr: currIdx },
        result: list.map((n) => n.val),
      },
      highlights: [pIdx + 1],
      pointers: { curr: currIdx },
      message: `Splice node ${tempVal} straight after prev — head insertion. List is now [${list.map((n) => n.val).join(' -> ')}].`,
      codeLine: 12,
      action: 'insert',
    });
  }

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: Array.from({ length: right - left + 1 }, (_, i) => left - 1 + i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
      result: list.map((n) => n.val),
    },
    highlights: Array.from({ length: right - left + 1 }, (_, i) => left - 1 + i),
    message: `Done in one pass: [${list.map((n) => n.val).join(' -> ')}]. ${right - left} splices, O(1) extra space, and dummy.next is the head to return.`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

function runReverseLinkedListIIValues(input: unknown): AlgorithmStep[] {
  const { nums, left, right } = input as ReverseBetweenInput;
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const list = nums.map((val) => ({ val: val as number | string, id: nodeId++ }));
  const show = () => list.map((n) => ({ ...n }));
  const values: number[] = [];

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Value-rewrite version: copy every value into an array, reverse the slice [${left}..${right}], then write the array back over the nodes. No pointer surgery at all.`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    values.push(nums[i]);
    steps.push({
      state: {
        linkedList: show(),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { node: i },
        result: [...values],
      },
      highlights: [i],
      pointers: { node: i },
      message: `Collect node ${nums[i]} — values = [${values.join(', ')}].`,
      codeLine: 5,
      action: 'visit',
    });
  }

  const slice = values.slice(left - 1, right).reverse();
  for (let i = 0; i < slice.length; i++) values[left - 1 + i] = slice[i];

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: Array.from({ length: right - left + 1 }, (_, i) => left - 1 + i),
      linkedListSecondary: [],
      linkedListPointers: {},
      result: [...values],
    },
    highlights: [],
    message: `Reverse just the slice: values = [${values.join(', ')}]. The nodes have not been touched yet — only this O(n) side array.`,
    codeLine: 8,
    action: 'swap',
  });

  for (let i = 0; i < list.length; i++) {
    list[i].val = values[i];
    steps.push({
      state: {
        linkedList: show(),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { node: i },
        result: list.map((n) => n.val),
      },
      highlights: [i],
      pointers: { node: i },
      message: `Write values[${i}] = ${values[i]} into node ${i + 1}. List so far: [${list.map((n) => n.val).join(' -> ')}].`,
      codeLine: 12,
      action: 'insert',
    });
  }

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: Array.from({ length: right - left + 1 }, (_, i) => left - 1 + i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
      result: list.map((n) => n.val),
    },
    highlights: Array.from({ length: right - left + 1 }, (_, i) => left - 1 + i),
    message: `Same list [${list.map((n) => n.val).join(' -> ')}], but it took two passes and O(n) extra memory — and it mutates values, which is illegal if nodes carry more than a number.`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const reverseLinkedListII: Algorithm = {
  id: 'reverse-linked-list-ii',
  name: 'Reverse Linked List II',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Three Pointers — dummy node plus head-insertion splice',
  description:
    'Given the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right, and return the reversed list.',
  problemUrl: 'https://leetcode.com/problems/reverse-linked-list-ii/',
  code: {
    python: `def reverseBetween(head, left, right):
    dummy = ListNode(0, head)
    prev = dummy
    for _ in range(left - 1):
        prev = prev.next

    curr = prev.next
    for _ in range(right - left):
        temp = curr.next
        curr.next = temp.next
        temp.next = prev.next
        prev.next = temp

    return dummy.next`,
    javascript: `function reverseBetween(head, left, right) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    for (let i = 0; i < left - 1; i++) {
        prev = prev.next;
    }

    let curr = prev.next;
    for (let i = 0; i < right - left; i++) {
        const temp = curr.next;
        curr.next = temp.next;
        temp.next = prev.next;
        prev.next = temp;
    }

    return dummy.next;
}`,
    java: `public static ListNode reverseBetween(ListNode head, int left, int right) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode prev = dummy;
    for (int i = 0; i < left - 1; i++) {
        prev = prev.next;
    }

    ListNode curr = prev.next;
    for (int i = 0; i < right - left; i++) {
        ListNode temp = curr.next;
        curr.next = temp.next;
        temp.next = prev.next;
        prev.next = temp;
    }

    return dummy.next;
}`,
  },
  defaultInput: { nums: [1, 2, 3, 4, 5], left: 2, right: 4 },
  run: runReverseLinkedListII,
  optimalApproachName: 'One-Pass Head Insertion',
  approaches: [
    {
      id: 'collect-values-rewrite',
      name: 'Collect Values then Rewrite',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Copy all node values into an array, reverse the target slice, then write the values back — two passes and O(n) memory instead of the one-pass O(1) pointer splice.',
      code: {
        python: `def reverseBetween(head, left, right):
    values = []
    node = head
    while node:
        values.append(node.val)
        node = node.next

    values[left - 1:right] = values[left - 1:right][::-1]

    node = head
    for v in values:
        node.val = v
        node = node.next

    return head`,
        javascript: `function reverseBetween(head, left, right) {
    const values = [];
    let node = head;
    while (node) {
        values.push(node.val);
        node = node.next;
    }

    const slice = values.slice(left - 1, right).reverse();
    for (let i = 0; i < slice.length; i++) {
        values[left - 1 + i] = slice[i];
    }

    node = head;
    for (const v of values) {
        node.val = v;
        node = node.next;
    }

    return head;
}`,
        java: `public static ListNode reverseBetween(ListNode head, int left, int right) {
    List<Integer> values = new ArrayList<>();
    ListNode node = head;
    while (node != null) {
        values.add(node.val);
        node = node.next;
    }

    Collections.reverse(values.subList(left - 1, right));

    node = head;
    for (int v : values) {
        node.val = v;
        node = node.next;
    }

    return head;
}`,
      },
      run: runReverseLinkedListIIValues,
      lineExplanations: {
        python: {
          1: 'Define function taking head and the 1-based bounds',
          2: 'Side array holding every node value',
          3: 'Start a walking pointer at the head',
          4: 'First pass: visit every node',
          5: 'Copy the value out',
          6: 'Step forward',
          8: 'Reverse only the slice between left and right',
          10: 'Rewind to the head for the second pass',
          11: 'Walk the (possibly reordered) values in order',
          12: 'Overwrite the node value',
          13: 'Step forward',
          15: 'Head never changed — the nodes were rewritten in place',
        },
        javascript: {
          1: 'Define function taking head and the 1-based bounds',
          2: 'Side array holding every node value',
          3: 'Start a walking pointer at the head',
          4: 'First pass: visit every node',
          5: 'Copy the value out',
          6: 'Step forward',
          9: 'Take the target slice and reverse it',
          10: 'Write the reversed slice back into the array',
          11: 'Position left-1+i receives the reversed value',
          14: 'Rewind to the head for the second pass',
          15: 'Walk the values in order',
          16: 'Overwrite the node value',
          17: 'Step forward',
          20: 'Head never changed — the nodes were rewritten in place',
        },
        java: {
          1: 'Define method taking head and the 1-based bounds',
          2: 'Side list holding every node value',
          3: 'Start a walking pointer at the head',
          4: 'First pass: visit every node',
          5: 'Copy the value out',
          6: 'Step forward',
          9: 'Reverse the sublist view between left and right in place',
          11: 'Rewind to the head for the second pass',
          12: 'Walk the values in order',
          13: 'Overwrite the node value',
          14: 'Step forward',
          17: 'Head never changed — the nodes were rewritten in place',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking head and the 1-based bounds left and right',
      2: 'Dummy node in front of head so left == 1 needs no special case',
      3: 'prev will sit immediately before the reversed section',
      4: 'Walk prev forward left-1 times',
      5: 'One step along the list',
      7: 'curr is the first node of the section — it stays put and sinks backwards',
      8: 'Do right-left splices; each moves one node to the front of the section',
      9: 'temp is the node we are about to hoist forward',
      10: 'Unhook temp: curr skips over it',
      11: 'temp now points at the current front of the reversed section',
      12: 'prev points at temp — temp is the new front',
      14: 'dummy.next is the head, which may have changed when left == 1',
    },
    javascript: {
      1: 'Define function taking head and the 1-based bounds left and right',
      2: 'Dummy node in front of head so left === 1 needs no special case',
      3: 'prev will sit immediately before the reversed section',
      4: 'Walk prev forward left-1 times',
      5: 'One step along the list',
      8: 'curr is the first node of the section — it stays put and sinks backwards',
      9: 'Do right-left splices; each moves one node to the front of the section',
      10: 'temp is the node we are about to hoist forward',
      11: 'Unhook temp: curr skips over it',
      12: 'temp now points at the current front of the reversed section',
      13: 'prev points at temp — temp is the new front',
      16: 'dummy.next is the head, which may have changed when left === 1',
    },
    java: {
      1: 'Define method taking head and the 1-based bounds left and right',
      2: 'Dummy node in front of head so left == 1 needs no special case',
      3: 'Point the dummy at the real head',
      4: 'prev will sit immediately before the reversed section',
      5: 'Walk prev forward left-1 times',
      6: 'One step along the list',
      9: 'curr is the first node of the section — it stays put and sinks backwards',
      10: 'Do right-left splices; each moves one node to the front of the section',
      11: 'temp is the node we are about to hoist forward',
      12: 'Unhook temp: curr skips over it',
      13: 'temp now points at the current front of the reversed section',
      14: 'prev points at temp — temp is the new front',
      17: 'dummy.next is the head, which may have changed when left == 1',
    },
  },
};
