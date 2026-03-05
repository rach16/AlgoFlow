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
