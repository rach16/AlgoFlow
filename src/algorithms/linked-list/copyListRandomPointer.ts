import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCopyListRandomPointer(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  // Build the original linked list
  const linkedList = nums.map((val) => ({ val, id: nodeId++ }));
  const hashMap: Record<string, string> = {};

  // Initial state
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: {},
      result: [],
    },
    highlights: [],
    message: 'Copy a linked list with random pointers. Use a hashmap to map old nodes to new nodes.',
    codeLine: 1,
  });

  // Pass 1: Create all new nodes and store in hashmap
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: {},
      result: [],
    },
    highlights: [],
    message: 'Pass 1: Create copies of each node and map old -> new in a hashmap.',
    codeLine: 2,
  });

  const newNodes: { val: number | string; id: number }[] = [];

  for (let i = 0; i < linkedList.length; i++) {
    const newNode = { val: linkedList[i].val, id: nodeId++ };
    newNodes.push(newNode);
    hashMap[`node_${linkedList[i].val}(${i})`] = `copy_${newNode.val}(${i})`;

    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { curr: i },
        hashMap: { ...hashMap },
        result: newNodes.map((n) => ({ ...n })),
      },
      highlights: [i],
      pointers: { curr: i },
      message: `Create copy of node ${linkedList[i].val} (index ${i}). Map: old node -> new node.`,
      codeLine: 3,
      action: 'insert',
    });
  }

  // Pass 2: Set next and random pointers
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: { ...hashMap },
      result: newNodes.map((n) => ({ ...n })),
    },
    highlights: [],
    message: 'Pass 2: Set next and random pointers on copied nodes using the hashmap.',
    codeLine: 5,
  });

  for (let i = 0; i < linkedList.length; i++) {
    // Set next pointer
    steps.push({
      state: {
        linkedList: linkedList.map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: i + 1 < linkedList.length ? [i + 1] : [],
        linkedListPointers: { curr: i },
        hashMap: { ...hashMap },
        result: newNodes.map((n) => ({ ...n })),
      },
      highlights: [i],
      pointers: { curr: i },
      message: `Set copy(${linkedList[i].val}).next = copy(${i + 1 < linkedList.length ? linkedList[i + 1].val : 'null'}). Random pointer set via hashmap lookup.`,
      codeLine: 6,
      action: 'visit',
    });
  }

  // Final result
  steps.push({
    state: {
      linkedList: linkedList.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: { ...hashMap },
      result: newNodes.map((n) => ({ ...n })),
    },
    highlights: [],
    message: `Deep copy complete! Copied list: [${newNodes.map((n) => n.val).join(' -> ')}]. All next and random pointers set.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

function runCopyListRandomPointerInterleave(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const originals = nums.map((val) => ({ val, id: nodeId++ }));
  const copies = nums.map((val) => ({ val, id: nodeId++ }));

  steps.push({
    state: {
      linkedList: originals.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      result: [],
    },
    highlights: [],
    message:
      'O(1)-space idea: instead of a hashmap, weave each copy directly after its original (A -> A\' -> B -> B\' ...). Every original then "knows" its copy: it is just curr.next.',
    codeLine: 1,
  });

  if (originals.length === 0) {
    steps.push({
      state: {
        linkedList: [],
        linkedListHighlights: [],
        linkedListSecondary: [],
        linkedListPointers: {},
        result: [],
      },
      highlights: [],
      message: 'Empty list — return None.',
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  // Pass 1: interleave copies
  const interleaved = (k: number) => {
    const out: { val: number | string; id: number }[] = [];
    for (let i = 0; i < originals.length; i++) {
      out.push({ ...originals[i] });
      if (i < k) out.push({ ...copies[i] });
    }
    return out;
  };

  for (let i = 0; i < originals.length; i++) {
    const view = interleaved(i + 1);
    const copyPos = 2 * i + 1;
    steps.push({
      state: {
        linkedList: view,
        linkedListHighlights: [copyPos],
        linkedListSecondary: [copyPos - 1],
        linkedListPointers: { curr: copyPos - 1, copy: copyPos },
      },
      highlights: [copyPos],
      pointers: { curr: copyPos - 1 },
      message: `Pass 1: splice a copy of node ${originals[i].val} right after the original. The list is temporarily twice as long.`,
      codeLine: 9,
      action: 'insert',
    });
  }

  // Pass 2: set random pointers via neighbors
  const fullView = interleaved(originals.length);
  for (let i = 0; i < originals.length; i++) {
    const origPos = 2 * i;
    steps.push({
      state: {
        linkedList: fullView.map((n) => ({ ...n })),
        linkedListHighlights: [origPos],
        linkedListSecondary: [origPos + 1],
        linkedListPointers: { curr: origPos, copy: origPos + 1 },
      },
      highlights: [origPos],
      pointers: { curr: origPos },
      message: `Pass 2: copy of node ${originals[i].val} gets its random pointer as curr.random.next — the copy always sits right after its original, so no hashmap lookup is needed.`,
      codeLine: 15,
      action: 'visit',
    });
  }

  // Pass 3: detach
  steps.push({
    state: {
      linkedList: fullView.map((n) => ({ ...n })),
      linkedListHighlights: fullView.map((_, i) => i).filter((i) => i % 2 === 1),
      linkedListSecondary: [],
      linkedListPointers: {},
      result: [],
    },
    highlights: [],
    message: 'Pass 3: unzip the interleaved list — originals reconnect to originals, copies to copies.',
    codeLine: 22,
    action: 'visit',
  });

  for (let i = 0; i < originals.length; i++) {
    steps.push({
      state: {
        linkedList: originals.map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { curr: i },
        result: copies.slice(0, i + 1).map((n) => ({ ...n })),
      },
      highlights: [i],
      pointers: { curr: i },
      message: `Detach copy of node ${originals[i].val}: restore original.next and link the copy to the next copy.`,
      codeLine: 23,
      action: 'delete',
    });
  }

  steps.push({
    state: {
      linkedList: originals.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      result: copies.map((n) => ({ ...n })),
    },
    highlights: [],
    message: `Deep copy complete with O(1) extra space! Copied list: [${copies.map((n) => n.val).join(' -> ')}]. Original list restored intact.`,
    codeLine: 25,
    action: 'found',
  });

  return steps;
}

export const copyListRandomPointer: Algorithm = {
  id: 'copy-list-random-pointer',
  name: 'Copy List with Random Pointer',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map — old node to new node mapping',
  description:
    'A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null. Construct a deep copy of the list.',
  problemUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/',
  code: {
    python: `def copyRandomList(head):
    oldToNew = {None: None}
    # Pass 1: create copies
    curr = head
    while curr:
        oldToNew[curr] = Node(curr.val)
        curr = curr.next
    # Pass 2: set pointers
    curr = head
    while curr:
        copy = oldToNew[curr]
        copy.next = oldToNew[curr.next]
        copy.random = oldToNew[curr.random]
        curr = curr.next
    return oldToNew[head]`,
    javascript: `function copyRandomList(head) {
    const oldToNew = new Map();
    oldToNew.set(null, null);
    // Pass 1: create copies
    let curr = head;
    while (curr) {
        oldToNew.set(curr, new Node(curr.val));
        curr = curr.next;
    }
    // Pass 2: set pointers
    curr = head;
    while (curr) {
        const copy = oldToNew.get(curr);
        copy.next = oldToNew.get(curr.next);
        copy.random = oldToNew.get(curr.random);
        curr = curr.next;
    }
    return oldToNew.get(head);
}`,
    java: `public static Node copyRandomList(Node head) {
    Map<Node, Node> oldToNew = new HashMap<>();
    oldToNew.put(null, null);

    // Pass 1: create copies
    Node curr = head;
    while (curr != null) {
        oldToNew.put(curr, new Node(curr.val));
        curr = curr.next;
    }

    // Pass 2: connect pointers
    curr = head;
    while (curr != null) {
        oldToNew.get(curr).next = oldToNew.get(curr.next);
        oldToNew.get(curr).random = oldToNew.get(curr.random);
        curr = curr.next;
    }

    return oldToNew.get(head);
}`,
  },
  defaultInput: [7, 13, 11, 10, 1],
  run: runCopyListRandomPointer,
  optimalApproachName: 'Hash Map — Two Passes',
  approaches: [
    {
      id: 'interleaved-nodes',
      name: 'Interleaved Nodes (O(1) Space)',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        "Weave each copy directly after its original so curr.next is the copy — the list itself becomes the hashmap, cutting space from O(n) to O(1) at the cost of three passes.",
      code: {
        python: `def copyRandomList(head):
    if not head:
        return None
    # Pass 1: interleave a copy after each node
    curr = head
    while curr:
        copy = Node(curr.val)
        copy.next = curr.next
        curr.next = copy
        curr = copy.next
    # Pass 2: assign random pointers via neighbors
    curr = head
    while curr:
        if curr.random:
            curr.next.random = curr.random.next
        curr = curr.next.next
    # Pass 3: detach the copied list
    curr = head
    copy_head = head.next
    while curr:
        copy = curr.next
        curr.next = copy.next
        copy.next = copy.next.next if copy.next else None
        curr = curr.next
    return copy_head`,
        javascript: `function copyRandomList(head) {
    if (!head) return null;
    // Pass 1: interleave a copy after each node
    let curr = head;
    while (curr) {
        const copy = new Node(curr.val);
        copy.next = curr.next;
        curr.next = copy;
        curr = copy.next;
    }
    // Pass 2: assign random pointers via neighbors
    curr = head;
    while (curr) {
        if (curr.random) {
            curr.next.random = curr.random.next;
        }
        curr = curr.next.next;
    }
    // Pass 3: detach the copied list
    curr = head;
    const copyHead = head.next;
    while (curr) {
        const copy = curr.next;
        curr.next = copy.next;
        copy.next = copy.next ? copy.next.next : null;
        curr = curr.next;
    }
    return copyHead;
}`,
        java: `public static Node copyRandomList(Node head) {
    if (head == null) return null;
    // Pass 1: interleave a copy after each node
    Node curr = head;
    while (curr != null) {
        Node copy = new Node(curr.val);
        copy.next = curr.next;
        curr.next = copy;
        curr = copy.next;
    }
    // Pass 2: assign random pointers via neighbors
    curr = head;
    while (curr != null) {
        if (curr.random != null) {
            curr.next.random = curr.random.next;
        }
        curr = curr.next.next;
    }
    // Pass 3: detach the copied list
    curr = head;
    Node copyHead = head.next;
    while (curr != null) {
        Node copy = curr.next;
        curr.next = copy.next;
        copy.next = copy.next != null ? copy.next.next : null;
        curr = curr.next;
    }
    return copyHead;
}`,
      },
      run: runCopyListRandomPointerInterleave,
      lineExplanations: {
        python: {
          1: 'Define function taking head of linked list',
          2: 'Guard against an empty list',
          3: 'Nothing to copy — return None',
          5: 'Pass 1 starts at the head',
          6: 'Visit every original node',
          7: 'Create the copy of the current node',
          8: 'Copy points at the next original',
          9: 'Original points at its copy — the weave: A -> A\' -> B -> B\'',
          10: 'Jump over the copy to the next original',
          12: 'Pass 2 starts back at the head',
          13: 'Visit each original again',
          14: 'Only copy random pointers that exist',
          15: 'Key insight: the copy of curr.random is always curr.random.next',
          16: 'Skip over the copy to the next original',
          18: 'Pass 3 starts back at the head',
          19: 'The first copy is the head of the new list',
          20: 'Unzip the interleaved list',
          21: 'Grab the copy sitting after the original',
          22: 'Restore the original list link',
          23: 'Copy links to the next copy (two nodes ahead)',
          24: 'Advance to the next original',
          25: 'Return the detached copied list',
        },
        javascript: {
          1: 'Define function taking head of linked list',
          2: 'Empty list — nothing to copy',
          4: 'Pass 1 starts at the head',
          5: 'Visit every original node',
          6: 'Create the copy of the current node',
          7: 'Copy points at the next original',
          8: 'Original points at its copy — the weave: A -> A\' -> B -> B\'',
          9: 'Jump over the copy to the next original',
          12: 'Pass 2 starts back at the head',
          13: 'Visit each original again',
          14: 'Only copy random pointers that exist',
          15: 'Key insight: the copy of curr.random is always curr.random.next',
          17: 'Skip over the copy to the next original',
          20: 'Pass 3 starts back at the head',
          21: 'The first copy is the head of the new list',
          22: 'Unzip the interleaved list',
          23: 'Grab the copy sitting after the original',
          24: 'Restore the original list link',
          25: 'Copy links to the next copy (two nodes ahead)',
          26: 'Advance to the next original',
          28: 'Return the detached copied list',
        },
        java: {
          1: 'Define method taking head of linked list',
          2: 'Empty list — nothing to copy',
          4: 'Pass 1 starts at the head',
          5: 'Visit every original node',
          6: 'Create the copy of the current node',
          7: 'Copy points at the next original',
          8: 'Original points at its copy — the weave: A -> A\' -> B -> B\'',
          9: 'Jump over the copy to the next original',
          12: 'Pass 2 starts back at the head',
          13: 'Visit each original again',
          14: 'Only copy random pointers that exist',
          15: 'Key insight: the copy of curr.random is always curr.random.next',
          17: 'Skip over the copy to the next original',
          20: 'Pass 3 starts back at the head',
          21: 'The first copy is the head of the new list',
          22: 'Unzip the interleaved list',
          23: 'Grab the copy sitting after the original',
          24: 'Restore the original list link',
          25: 'Copy links to the next copy (two nodes ahead)',
          26: 'Advance to the next original',
          28: 'Return the detached copied list',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking head of linked list',
      2: 'Init map with None->None for null random ptrs',
      4: 'Set traversal pointer to head',
      5: 'Iterate through every node in the list',
      6: 'Create a copy node and map original to copy',
      7: 'Move to the next original node',
      9: 'Reset traversal pointer to head',
      10: 'Iterate again to wire up pointers',
      11: 'Get the copy of the current node',
      12: 'Set copy next to the copy of original next',
      13: 'Set copy random to the copy of original random',
      14: 'Move to the next original node',
      15: 'Return the copy of the head node',
    },
    javascript: {
      1: 'Define function taking head of linked list',
      2: 'Create map to store old node to new node mapping',
      3: 'Map null to null for edge cases',
      5: 'Set traversal pointer to head',
      6: 'Iterate through every node in the list',
      7: 'Create copy node and store mapping',
      8: 'Move to the next original node',
      11: 'Reset traversal pointer to head',
      12: 'Iterate again to wire up pointers',
      13: 'Get the copy of the current node',
      14: 'Set copy next to the copy of original next',
      15: 'Set copy random to the copy of original random',
      16: 'Move to the next original node',
      18: 'Return the copy of the head node',
    },
    java: {
      1: 'Define method taking head of linked list',
      2: 'Create HashMap for old-to-new node mapping',
      3: 'Map null to null for edge cases',
      6: 'Set traversal pointer to head',
      7: 'Iterate through every node in the list',
      8: 'Create copy node and store mapping',
      9: 'Move to the next original node',
      13: 'Reset traversal pointer to head',
      14: 'Iterate again to wire up pointers',
      15: 'Set copy next to the copy of original next',
      16: 'Set copy random to the copy of original random',
      17: 'Move to the next original node',
      20: 'Return the copy of the head node',
    },
  },
};
