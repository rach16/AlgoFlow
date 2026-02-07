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
};
