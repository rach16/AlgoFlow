import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function runInsertGreatestCommonDivisors(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  // Build the linked list exactly like the linked-list category files do.
  const list: { val: number; id: number }[] = nums.map((val) => ({ val, id: nodeId++ }));

  steps.push({
    state: {
      linkedList: list.map((n) => ({ ...n })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: { curr: 0 },
      result: `Splicing gcd nodes between every adjacent pair`,
    },
    highlights: [],
    message: `Walk the list once with curr. For each adjacent pair (curr, curr.next), build a node holding gcd(curr.val, curr.next.val) and splice it between them — then jump curr TWO nodes forward so the freshly inserted node is never re-examined.`,
    codeLine: 3,
  } as AlgorithmStep);

  let idx = 0;

  while (idx + 1 < list.length) {
    const a = list[idx].val;
    const b = list[idx + 1].val;
    const g = gcd(a, b);

    steps.push({
      state: {
        linkedList: list.map((n) => ({ ...n })),
        linkedListHighlights: [idx, idx + 1],
        linkedListSecondary: [],
        linkedListPointers: { curr: idx, next: idx + 1 },
        result: `gcd(${a}, ${b}) = ${g}`,
      },
      highlights: [idx, idx + 1],
      pointers: { curr: idx },
      message: `Pair (${a}, ${b}): gcd(${a}, ${b}) = ${g}. Euclid on the two values gives the node to insert.`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);

    list.splice(idx + 1, 0, { val: g, id: nodeId++ });

    steps.push({
      state: {
        linkedList: list.map((n) => ({ ...n })),
        linkedListHighlights: [idx + 1],
        linkedListSecondary: [],
        linkedListPointers: { curr: idx + 2 },
        result: `Inserted ${g} between ${a} and ${b}`,
      },
      highlights: [idx + 1],
      pointers: { curr: idx + 2 },
      message: `curr.next = new node(${g}) pointing at the old next, so the chain reads ... ${a} -> ${g} -> ${b} ... Now advance curr TWO steps (past the inserted node) to node ${b}.`,
      codeLine: 7,
      action: 'insert',
    } as AlgorithmStep);

    idx += 2;
  }

  const finalText = list.map((n) => n.val).join(' -> ');

  steps.push({
    state: {
      linkedList: list.map((n) => ({ ...n })),
      linkedListHighlights: list.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
      result: `Final list: ${finalText}`,
    },
    highlights: list.map((_, i) => i),
    message: `curr.next is null, so every original pair has a gcd between it. Final list: ${finalText}. One pass, O(1) extra space beyond the new nodes.`,
    codeLine: 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runInsertGreatestCommonDivisorsRebuild(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const original: { val: number; id: number }[] = nums.map((val) => ({ val, id: nodeId++ }));

  steps.push({
    state: {
      linkedList: original.map((n) => ({ ...n })),
      linkedList2: [],
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      result: `Pass 1: copy the values into an array`,
    },
    highlights: [],
    message: `Pointer splicing is fiddly, so trade O(n) memory for clarity: first read every value into an array, then build a brand-new list from scratch. No node is ever rewired mid-traversal.`,
    codeLine: 4,
  } as AlgorithmStep);

  const values: number[] = [];
  for (let i = 0; i < original.length; i++) {
    values.push(original[i].val);

    steps.push({
      state: {
        linkedList: original.map((n) => ({ ...n })),
        linkedList2: [],
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { curr: i },
        result: `values = [${values.join(', ')}]`,
      },
      highlights: [i],
      pointers: { curr: i },
      message: `Read node ${original[i].val} into the array: values = [${values.join(', ')}].`,
      codeLine: 7,
      action: 'visit',
    } as AlgorithmStep);
  }

  const built: { val: number; id: number }[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i > 0) {
      const g = gcd(values[i - 1], values[i]);
      built.push({ val: g, id: nodeId++ });

      steps.push({
        state: {
          linkedList: original.map((n) => ({ ...n })),
          linkedList2: built.map((n) => ({ ...n })),
          linkedListHighlights: [i - 1, i],
          linkedListSecondary: [],
          linkedListPointers: { i },
          result: `Appended gcd(${values[i - 1]}, ${values[i]}) = ${g}`,
        },
        highlights: [i - 1, i],
        pointers: { i },
        message: `Before copying values[${i}] = ${values[i]}, append gcd(${values[i - 1]}, ${values[i]}) = ${g} to the new list: ${built.map((n) => n.val).join(' -> ')}.`,
        codeLine: 13,
        action: 'insert',
      } as AlgorithmStep);
    }

    built.push({ val: values[i], id: nodeId++ });

    steps.push({
      state: {
        linkedList: original.map((n) => ({ ...n })),
        linkedList2: built.map((n) => ({ ...n })),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { i },
        result: `Appended original value ${values[i]}`,
      },
      highlights: [i],
      pointers: { i },
      message: `Append the original value ${values[i]}: ${built.map((n) => n.val).join(' -> ')}.`,
      codeLine: 15,
      action: 'insert',
    } as AlgorithmStep);
  }

  const finalText = built.map((n) => n.val).join(' -> ');

  steps.push({
    state: {
      linkedList: built.map((n) => ({ ...n })),
      linkedListHighlights: built.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: { head: 0 },
      result: `Final list: ${finalText}`,
    },
    highlights: built.map((_, i) => i),
    message: `Return dummy.next. Final list: ${finalText} — identical to the in-place splice, but it allocated an O(n) value array and a whole new chain of nodes.`,
    codeLine: 17,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const insertGreatestCommonDivisors: Algorithm = {
  id: 'insert-gcd-linked-list',
  name: 'Insert Greatest Common Divisors in Linked List',
  category: 'Math & Geometry',
  difficulty: 'Medium',
  timeComplexity: 'O(n log M)',
  spaceComplexity: 'O(1)',
  pattern: 'Math — gcd of adjacent values, spliced in one pass',
  description:
    'Given the head of a linked list, insert a new node between every pair of adjacent nodes whose value is the greatest common divisor of them. Return the head of the modified list.',
  problemUrl: 'https://leetcode.com/problems/insert-greatest-common-divisors-in-linked-list/',
  code: {
    python: `from math import gcd

def insertGreatestCommonDivisors(head):
    curr = head
    while curr.next:
        g = gcd(curr.val, curr.next.val)
        curr.next = ListNode(g, curr.next)
        curr = curr.next.next
    return head`,
    javascript: `function insertGreatestCommonDivisors(head) {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    let curr = head;
    while (curr.next) {
        const g = gcd(curr.val, curr.next.val);
        curr.next = new ListNode(g, curr.next);
        curr = curr.next.next;
    }
    return head;
}`,
    java: `public static ListNode insertGreatestCommonDivisors(ListNode head) {
    ListNode curr = head;
    while (curr.next != null) {
        int g = gcd(curr.val, curr.next.val);
        curr.next = new ListNode(g, curr.next);
        curr = curr.next.next;
    }
    return head;
}

private static int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}`,
  },
  defaultInput: [18, 6, 10, 3],
  run: runInsertGreatestCommonDivisors,
  optimalApproachName: 'One-Pass Splice',
  approaches: [
    {
      id: 'collect-values-rebuild',
      name: 'Collect Values, Rebuild',
      timeComplexity: 'O(n log M)',
      spaceComplexity: 'O(n)',
      description:
        'Reads all values into an array first and then builds a brand-new list behind a dummy head, avoiding any mid-traversal pointer rewiring — costs O(n) extra space that the in-place splice does not need.',
      code: {
        python: `from math import gcd

def insertGreatestCommonDivisors(head):
    values = []
    curr = head
    while curr:
        values.append(curr.val)
        curr = curr.next
    dummy = ListNode(0)
    tail = dummy
    for i, v in enumerate(values):
        if i > 0:
            tail.next = ListNode(gcd(values[i - 1], v))
            tail = tail.next
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next`,
        javascript: `function insertGreatestCommonDivisors(head) {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const values = [];
    for (let curr = head; curr; curr = curr.next) {
        values.push(curr.val);
    }
    const dummy = new ListNode(0);
    let tail = dummy;
    for (let i = 0; i < values.length; i++) {
        if (i > 0) {
            tail.next = new ListNode(gcd(values[i - 1], values[i]));
            tail = tail.next;
        }
        tail.next = new ListNode(values[i]);
        tail = tail.next;
    }
    return dummy.next;
}`,
        java: `public static ListNode insertGreatestCommonDivisors(ListNode head) {
    List<Integer> values = new ArrayList<>();
    for (ListNode curr = head; curr != null; curr = curr.next) {
        values.add(curr.val);
    }
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    for (int i = 0; i < values.size(); i++) {
        if (i > 0) {
            tail.next = new ListNode(gcd(values.get(i - 1), values.get(i)));
            tail = tail.next;
        }
        tail.next = new ListNode(values.get(i));
        tail = tail.next;
    }
    return dummy.next;
}

private static int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}`,
      },
      run: runInsertGreatestCommonDivisorsRebuild,
      lineExplanations: {
        python: {
          1: 'math.gcd implements Euclid for us',
          3: 'Define function taking the head of the list',
          4: 'Array that will hold every original value',
          5: 'Start at the head',
          6: 'Pass 1: walk the whole list',
          7: 'Copy this value out',
          8: 'Step to the next node',
          9: 'Dummy head removes the empty-list special case',
          10: 'tail always points at the last node built so far',
          11: 'Pass 2: rebuild from the collected values',
          12: 'Every value except the first is preceded by a gcd node',
          13: 'Append gcd(previous, current)',
          14: 'Move the tail onto it',
          15: 'Append the original value',
          16: 'Move the tail onto it',
          17: 'dummy.next is the real head of the new list',
        },
        javascript: {
          1: 'Define function taking the head of the list',
          2: 'Recursive Euclid helper',
          3: 'Array that will hold every original value',
          4: 'Pass 1: walk the whole list',
          5: 'Copy this value out',
          7: 'Dummy head removes the empty-list special case',
          8: 'tail always points at the last node built so far',
          9: 'Pass 2: rebuild from the collected values',
          10: 'Every value except the first is preceded by a gcd node',
          11: 'Append gcd(previous, current)',
          12: 'Move the tail onto it',
          14: 'Append the original value',
          15: 'Move the tail onto it',
          17: 'dummy.next is the real head of the new list',
        },
        java: {
          1: 'Define method taking the head of the list',
          2: 'List that will hold every original value',
          3: 'Pass 1: walk the whole list',
          4: 'Copy this value out',
          6: 'Dummy head removes the empty-list special case',
          7: 'tail always points at the last node built so far',
          8: 'Pass 2: rebuild from the collected values',
          9: 'Every value except the first is preceded by a gcd node',
          10: 'Append gcd(previous, current)',
          11: 'Move the tail onto it',
          13: 'Append the original value',
          14: 'Move the tail onto it',
          16: 'dummy.next is the real head of the new list',
          19: 'Euclid: gcd(a, b) = gcd(b, a % b)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'math.gcd implements Euclid for us',
      3: 'Define function taking the head of the list',
      4: 'curr walks the ORIGINAL nodes only',
      5: 'Stop when there is no next node to pair with',
      6: 'gcd of the current pair of adjacent values',
      7: 'Splice a new node between curr and curr.next',
      8: 'Skip TWO nodes: past the inserted one, onto the old next',
      9: 'The head never changes, so return it unchanged',
    },
    javascript: {
      1: 'Define function taking the head of the list',
      2: 'Recursive Euclid: gcd(a, b) = gcd(b, a % b)',
      3: 'curr walks the ORIGINAL nodes only',
      4: 'Stop when there is no next node to pair with',
      5: 'gcd of the current pair of adjacent values',
      6: 'Splice a new node between curr and curr.next',
      7: 'Skip TWO nodes: past the inserted one, onto the old next',
      9: 'The head never changes, so return it unchanged',
    },
    java: {
      1: 'Define method taking the head of the list',
      2: 'curr walks the ORIGINAL nodes only',
      3: 'Stop when there is no next node to pair with',
      4: 'gcd of the current pair of adjacent values',
      5: 'Splice a new node between curr and curr.next',
      6: 'Skip TWO nodes: past the inserted one, onto the old next',
      8: 'The head never changes, so return it unchanged',
      11: 'Euclid: gcd(a, b) = gcd(b, a % b)',
      12: 'Base case b == 0 returns a',
    },
  },
};
