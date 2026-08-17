import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type Node = { val: number; id: number };

function buildNodes(nums: number[]): Node[] {
  let nodeId = 0;
  return nums.map((val) => ({ val, id: nodeId++ }));
}

function runPalindromeLinkedListArray(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const linkedList = buildNodes(nums);
  const n = linkedList.length;

  steps.push({
    state: {
      linkedList: linkedList.map((node) => ({ ...node })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      nums: [],
    },
    highlights: [],
    message: `The easy-to-write version: copy every value into an array, then two-pointer compare. Correct and fast, but it costs O(n) EXTRA space — the exact thing the interviewer's "without using extra space" follow-up rules out.`,
    codeLine: 1,
  });

  if (n === 0) {
    steps.push({
      state: {
        linkedList: [],
        linkedListHighlights: [],
        linkedListSecondary: [],
        linkedListPointers: {},
        nums: [],
        result: true,
      },
      highlights: [],
      message: `Empty list — the array is empty, left starts at 0 and right at -1, so the compare loop never runs. Vacuously a palindrome.`,
      codeLine: 13,
      action: 'found',
    });
    return steps;
  }

  const vals: number[] = [];
  for (let i = 0; i < n; i++) {
    vals.push(linkedList[i].val);
    steps.push({
      state: {
        linkedList: linkedList.map((node) => ({ ...node })),
        linkedListHighlights: [i],
        linkedListSecondary: [],
        linkedListPointers: { node: i },
        nums: [...vals],
      },
      highlights: [vals.length - 1],
      message: `Copy node ${linkedList[i].val} into the array — the array now holds ${vals.length} of ${n} values. This is the O(n) memory the O(1) solution avoids.`,
      codeLine: 5,
      action: 'push',
    });
  }

  let left = 0;
  let right = n - 1;

  steps.push({
    state: {
      linkedList: linkedList.map((node) => ({ ...node })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      nums: [...vals],
    },
    highlights: [],
    secondary: [],
    pointers: { left, right },
    message: `Array copy done: [${vals.join(', ')}]. Now the standard palindrome check — left at 0, right at ${right}, walk inward. Random access is what the linked list could not give us.`,
    codeLine: 7,
  });

  while (left < right) {
    if (vals[left] !== vals[right]) {
      steps.push({
        state: {
          linkedList: linkedList.map((node) => ({ ...node })),
          linkedListHighlights: [left],
          linkedListSecondary: [right],
          linkedListPointers: { left, right },
          nums: [...vals],
          result: false,
        },
        highlights: [left],
        secondary: [right],
        pointers: { left, right },
        message: `vals[${left}] = ${vals[left]} != vals[${right}] = ${vals[right]} — mismatch, so it is not a palindrome. Return false immediately.`,
        codeLine: 10,
        action: 'compare',
      });
      return steps;
    }

    steps.push({
      state: {
        linkedList: linkedList.map((node) => ({ ...node })),
        linkedListHighlights: [left],
        linkedListSecondary: [right],
        linkedListPointers: { left, right },
        nums: [...vals],
      },
      highlights: [left],
      secondary: [right],
      pointers: { left, right },
      message: `vals[${left}] = ${vals[left]} == vals[${right}] = ${vals[right]} — matches. Step left in, right out.`,
      codeLine: 9,
      action: 'compare',
    });
    left++;
    right--;
  }

  steps.push({
    state: {
      linkedList: linkedList.map((node) => ({ ...node })),
      linkedListHighlights: linkedList.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: {},
      nums: [...vals],
      result: true,
    },
    highlights: [],
    message:
      n % 2 === 1
        ? `Pointers met on the middle value ${vals[(n - 1) / 2]} (odd length ${n}) — every mirrored pair matched. Palindrome: true. Same O(n) time as the reversal solution, but O(n) space instead of O(1).`
        : `Pointers crossed between the two middle values (even length ${n}) — every mirrored pair matched. Palindrome: true. Same O(n) time as the reversal solution, but O(n) space instead of O(1).`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

function runPalindromeLinkedList(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const linkedList = buildNodes(nums);
  const n = linkedList.length;
  const snapshot = () => linkedList.map((node) => ({ ...node }));

  steps.push({
    state: {
      linkedList: snapshot(),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Decide if the list reads the same forwards and backwards WITHOUT using extra space — that O(1) constraint is the whole question. Three phases, all in place: find the middle with fast/slow, reverse the second half, then compare the halves.`,
    codeLine: 1,
  });

  if (n <= 1) {
    steps.push({
      state: {
        linkedList: snapshot(),
        linkedListHighlights: n === 1 ? [0] : [],
        linkedListSecondary: [],
        linkedListPointers: {},
        result: true,
      },
      highlights: [],
      message:
        n === 0
          ? `Empty list — slow and fast are both null, so every loop is skipped and we return true. No guard clause needed.`
          : `Single node — the fast/slow loop never runs and the compare loop has nothing to disagree with, so it returns true. Both edge cases fall out of the same code.`,
      codeLine: 18,
      action: 'found',
    });
    return steps;
  }

  // Phase 1: fast/slow to find the start of the second half.
  let slow = 0;
  let fast = 0;

  steps.push({
    state: {
      linkedList: snapshot(),
      linkedListHighlights: [0],
      linkedListSecondary: [0],
      linkedListPointers: { slow: 0, fast: 0 },
    },
    highlights: [0],
    secondary: [0],
    pointers: { slow: 0, fast: 0 },
    message: `Phase 1 — slow = fast = head. fast moves two nodes per step, slow one, so when fast falls off the end slow sits at the middle. No counting pass, no length variable.`,
    codeLine: 2,
  });

  while (fast < n && fast + 1 < n) {
    slow += 1;
    fast += 2;
    steps.push({
      state: {
        linkedList: snapshot(),
        linkedListHighlights: [slow],
        linkedListSecondary: fast < n ? [fast] : [],
        linkedListPointers: fast < n ? { slow, fast } : { slow },
      },
      highlights: [slow],
      secondary: fast < n ? [fast] : [],
      pointers: fast < n ? { slow, fast } : { slow },
      message: `slow -> index ${slow} (val ${linkedList[slow].val}), fast -> ${
        fast < n ? `index ${fast} (val ${linkedList[fast].val})` : 'past the end (null)'
      }.`,
      codeLine: 5,
      action: 'visit',
    });
  }

  const mid = slow;
  steps.push({
    state: {
      linkedList: snapshot(),
      linkedListHighlights: linkedList.map((_, i) => i).filter((i) => i >= mid),
      linkedListSecondary: linkedList.map((_, i) => i).filter((i) => i < mid),
      linkedListPointers: { slow: mid },
    },
    highlights: [mid],
    pointers: { slow: mid },
    message:
      n % 2 === 1
        ? `Odd length ${n}: slow stopped ON the middle node (val ${linkedList[mid].val}). The second half therefore INCLUDES the middle, which is harmless — the middle just ends up compared against itself.`
        : `Even length ${n}: slow stopped on the first node of the second half (val ${linkedList[mid].val}). The two halves are exactly ${n / 2} nodes each.`,
    codeLine: 5,
    action: 'found',
  });

  // Phase 2: reverse the second half in place.
  const firstHalf = linkedList.slice(0, mid).map((node) => ({ ...node }));
  const secondHalf = linkedList.slice(mid).map((node) => ({ ...node }));
  const reversed: Node[] = [];

  steps.push({
    state: {
      linkedList: firstHalf.map((node) => ({ ...node })),
      linkedList2: secondHalf.map((node) => ({ ...node })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Phase 2 — reverse the second half [${secondHalf
      .map((node) => node.val)
      .join(' -> ')}] in place with prev/curr/next. We rewire the existing nodes, so still O(1) space.`,
    codeLine: 6,
  });

  for (let k = 0; k < secondHalf.length; k++) {
    reversed.unshift({ ...secondHalf[k] });
    steps.push({
      state: {
        linkedList: firstHalf.map((node) => ({ ...node })),
        linkedList2: reversed.map((node) => ({ ...node })),
        linkedListHighlights: [],
        linkedListSecondary: [],
        linkedListPointers: {},
      },
      highlights: [],
      message: `Flip node ${secondHalf[k].val}: its next now points at prev. Reversed portion is [${reversed
        .map((node) => node.val)
        .join(' -> ')}].`,
      codeLine: 9,
      action: 'swap',
    });
  }

  steps.push({
    state: {
      linkedList: firstHalf.map((node) => ({ ...node })),
      linkedList2: reversed.map((node) => ({ ...node })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Second half reversed: [${reversed
      .map((node) => node.val)
      .join(' -> ')}]. prev is its new head — call it right. left starts back at the original head.`,
    codeLine: 12,
  });

  // Phase 3: compare left (walking forward) against right (the reversed tail).
  let ok = true;
  const rightLen = reversed.length;

  for (let k = 0; k < rightLen; k++) {
    const leftIdx = k;
    const rightIdx = n - 1 - k; // position in the ORIGINAL list that right currently points at
    const leftVal = linkedList[leftIdx].val;
    const rightVal = reversed[k].val;

    if (leftVal !== rightVal) {
      ok = false;
      steps.push({
        state: {
          linkedList: snapshot(),
          linkedListHighlights: [leftIdx],
          linkedListSecondary: [rightIdx],
          linkedListPointers: { left: leftIdx, right: rightIdx },
          result: false,
        },
        highlights: [leftIdx],
        secondary: [rightIdx],
        pointers: { left: leftIdx, right: rightIdx },
        message: `Phase 3 — left.val = ${leftVal} vs right.val = ${rightVal}: MISMATCH. Return false without walking the rest.`,
        codeLine: 15,
        action: 'compare',
      });
      break;
    }

    steps.push({
      state: {
        linkedList: snapshot(),
        linkedListHighlights: [leftIdx],
        linkedListSecondary: [rightIdx],
        linkedListPointers: { left: leftIdx, right: rightIdx },
      },
      highlights: [leftIdx],
      secondary: [rightIdx],
      pointers: { left: leftIdx, right: rightIdx },
      message:
        leftIdx === rightIdx
          ? `Phase 3 — left and right meet on the middle node ${leftVal} (odd length). It equals itself, which is why including the middle in the reversed half is safe.`
          : `Phase 3 — left.val = ${leftVal} == right.val = ${rightVal}. Match; advance left forward and right along the reversed half.`,
      codeLine: 14,
      action: 'compare',
    });
  }

  if (!ok) {
    return steps;
  }

  steps.push({
    state: {
      linkedList: snapshot(),
      linkedListHighlights: linkedList.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: {},
      result: true,
    },
    highlights: [],
    message: `right ran out — all ${rightLen} mirrored pair(s) matched, so [${nums.join(
      ' -> '
    )}] IS a palindrome. O(n) time, O(1) space: no array, no stack, no recursion. Mention in the interview that a polite implementation restores the list by reversing the second half back.`,
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

export const palindromeLinkedList: Algorithm = {
  id: 'palindrome-linked-list',
  name: 'Palindrome Linked List',
  category: 'Linked List',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Fast & Slow Pointers — find middle, reverse second half, compare in place',
  description:
    'Given the head of a singly linked list, return true if it is a palindrome. The follow-up that interviewers actually grade is doing it in O(n) time and O(1) space — without using extra space, so no value array, stack or recursion.',
  problemUrl: 'https://leetcode.com/problems/palindrome-linked-list/',
  code: {
    python: `def isPalindrome(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev = slow
        slow = nxt
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    return True`,
    javascript: `function isPalindrome(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    let prev = null;
    while (slow) {
        const nxt = slow.next;
        slow.next = prev;
        prev = slow;
        slow = nxt;
    }
    let left = head, right = prev;
    while (right) {
        if (left.val !== right.val) {
            return false;
        }
        left = left.next;
        right = right.next;
    }
    return true;
}`,
    java: `public static boolean isPalindrome(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    ListNode prev = null;
    while (slow != null) {
        ListNode nxt = slow.next;
        slow.next = prev;
        prev = slow;
        slow = nxt;
    }
    ListNode left = head, right = prev;
    while (right != null) {
        if (left.val != right.val) {
            return false;
        }
        left = left.next;
        right = right.next;
    }
    return true;
}`,
  },
  defaultInput: [1, 2, 3, 2, 1],
  run: runPalindromeLinkedList,
  optimalApproachName: 'Reverse Second Half (O(1) Space)',
  approaches: [
    {
      id: 'copy-to-array',
      name: 'Copy to Array + Two Pointers',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Dump every value into an array and two-pointer compare — six lines and obviously correct, but the O(n) buffer is exactly what the "without using extra space" follow-up disallows.',
      code: {
        python: `def isPalindrome(head):
    vals = []
    node = head
    while node:
        vals.append(node.val)
        node = node.next
    left, right = 0, len(vals) - 1
    while left < right:
        if vals[left] != vals[right]:
            return False
        left += 1
        right -= 1
    return True`,
        javascript: `function isPalindrome(head) {
    const vals = [];
    let node = head;
    while (node) {
        vals.push(node.val);
        node = node.next;
    }
    let left = 0, right = vals.length - 1;
    while (left < right) {
        if (vals[left] !== vals[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
        java: `public static boolean isPalindrome(ListNode head) {
    List<Integer> vals = new ArrayList<>();
    ListNode node = head;
    while (node != null) {
        vals.add(node.val);
        node = node.next;
    }
    int left = 0, right = vals.size() - 1;
    while (left < right) {
        if (!vals.get(left).equals(vals.get(right))) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
      },
      run: runPalindromeLinkedListArray,
      lineExplanations: {
        python: {
          1: 'Define function taking the head node',
          2: 'The O(n) buffer — the reason this approach is rejected on the follow-up',
          3: 'Walk pointer starting at head',
          4: 'Traverse until we fall off the end',
          5: 'Copy the value out of the node',
          6: 'Step to the next node',
          7: 'Two indices at the ends of the array',
          8: 'Empty and single-element inputs skip this loop entirely',
          9: 'Mirrored values must be equal',
          10: 'Any mismatch disproves the palindrome',
          11: 'Move left inward',
          12: 'Move right inward',
          13: 'Pointers met or crossed with no mismatch',
        },
        javascript: {
          1: 'Define function taking the head node',
          2: 'The O(n) buffer — the reason this approach is rejected on the follow-up',
          3: 'Walk pointer starting at head',
          4: 'Traverse until we fall off the end',
          5: 'Copy the value out of the node',
          6: 'Step to the next node',
          8: 'Two indices at the ends of the array',
          9: 'Empty and single-element inputs skip this loop entirely',
          10: 'Mirrored values must be equal',
          11: 'Any mismatch disproves the palindrome',
          13: 'Move left inward',
          14: 'Move right inward',
          16: 'Pointers met or crossed with no mismatch',
        },
        java: {
          1: 'Define method taking the head node',
          2: 'The O(n) buffer — the reason this approach is rejected on the follow-up',
          3: 'Walk pointer starting at head',
          4: 'Traverse until we fall off the end',
          5: 'Copy the value out of the node',
          6: 'Step to the next node',
          8: 'Two indices at the ends of the list',
          9: 'Empty and single-element inputs skip this loop entirely',
          10: 'equals(), not == — these are boxed Integers',
          11: 'Any mismatch disproves the palindrome',
          13: 'Move left inward',
          14: 'Move right inward',
          16: 'Pointers met or crossed with no mismatch',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the head node — no auxiliary structure anywhere',
      2: 'Both pointers start at head',
      3: 'Fast walks two nodes for every one of slow',
      4: 'Slow advances one node',
      5: 'When fast falls off the end, slow is at the middle',
      6: 'prev = None: standard in-place reversal setup',
      7: 'Reverse from the middle to the tail',
      8: 'Save the next node before the link is overwritten',
      9: 'Flip this node to point backwards',
      10: 'prev follows along — it ends up as the new tail-first head',
      11: 'Advance slow to the saved next node',
      12: 'left = original head, right = head of the reversed second half',
      13: 'right is the shorter walk, so it decides when to stop',
      14: 'Mirrored nodes must hold equal values',
      15: 'Return false on the first mismatch',
      16: 'Advance left forward through the first half',
      17: 'Advance right through the reversed half',
      18: 'Every mirrored pair matched, in O(n) time and O(1) space',
    },
    javascript: {
      1: 'Define function taking the head node — no auxiliary structure anywhere',
      2: 'Both pointers start at head',
      3: 'Fast walks two nodes for every one of slow',
      4: 'Slow advances one node',
      5: 'When fast falls off the end, slow is at the middle',
      7: 'prev = null: standard in-place reversal setup',
      8: 'Reverse from the middle to the tail',
      9: 'Save the next node before the link is overwritten',
      10: 'Flip this node to point backwards',
      11: 'prev follows along — it ends up as the new tail-first head',
      12: 'Advance slow to the saved next node',
      14: 'left = original head, right = head of the reversed second half',
      15: 'right is the shorter walk, so it decides when to stop',
      16: 'Mirrored nodes must hold equal values',
      17: 'Return false on the first mismatch',
      19: 'Advance left forward through the first half',
      20: 'Advance right through the reversed half',
      22: 'Every mirrored pair matched, in O(n) time and O(1) space',
    },
    java: {
      1: 'Define method taking the head node — no auxiliary structure anywhere',
      2: 'Both pointers start at head',
      3: 'Fast walks two nodes for every one of slow',
      4: 'Slow advances one node',
      5: 'When fast falls off the end, slow is at the middle',
      7: 'prev = null: standard in-place reversal setup',
      8: 'Reverse from the middle to the tail',
      9: 'Save the next node before the link is overwritten',
      10: 'Flip this node to point backwards',
      11: 'prev follows along — it ends up as the new tail-first head',
      12: 'Advance slow to the saved next node',
      14: 'left = original head, right = head of the reversed second half',
      15: 'right is the shorter walk, so it decides when to stop',
      16: 'int vals compare with == safely here',
      17: 'Return false on the first mismatch',
      19: 'Advance left forward through the first half',
      20: 'Advance right through the reversed half',
      22: 'Every mirrored pair matched, in O(n) time and O(1) space',
    },
  },
};
