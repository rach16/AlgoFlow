import { createConfig, linkedListTemplate } from '../templates';

const t = linkedListTemplate;

export const linkedListConfigs = [
  createConfig(t, {
    algorithmId: 'reverse-linked-list',
    title: 'Reverse Linked List',
    subtitle: 'Reverse a singly linked list',
    codeSnippet: `def reverseList(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
  }),
  createConfig(t, {
    algorithmId: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    subtitle: 'Merge two sorted linked lists',
    codeSnippet: `def mergeTwoLists(l1, l2):
    dummy = ListNode()
    tail = dummy
    while l1 and l2:
        if l1.val < l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next`,
  }),
  createConfig(t, {
    algorithmId: 'reorder-list',
    title: 'Reorder List',
    subtitle: 'Reorder L0→Ln→L1→Ln-1→...',
    codeSnippet: `def reorderList(head):
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    first, second = head, prev
    while second:
        tmp1, tmp2 = first.next, second.next
        first.next = second
        second.next = tmp1
        first, second = tmp1, tmp2`,
  }),
  createConfig(t, {
    algorithmId: 'remove-nth-from-end',
    title: 'Remove Nth Node From End',
    subtitle: 'Remove nth node from list end',
    codeSnippet: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    left = dummy
    right = head
    while n > 0:
        right = right.next
        n -= 1
    while right:
        left = left.next
        right = right.next
    left.next = left.next.next
    return dummy.next`,
  }),
  createConfig(t, {
    algorithmId: 'copy-list-random-pointer',
    title: 'Copy List with Random Pointer',
    subtitle: 'Deep copy linked list with random pointers',
    codeSnippet: `def copyRandomList(head):
    oldToNew = {None: None}
    cur = head
    while cur:
        oldToNew[cur] = Node(cur.val)
        cur = cur.next
    cur = head
    while cur:
        copy = oldToNew[cur]
        copy.next = oldToNew[cur.next]
        copy.random = oldToNew[cur.random]
        cur = cur.next
    return oldToNew[head]`,
  }),
  createConfig(t, {
    algorithmId: 'add-two-numbers',
    title: 'Add Two Numbers',
    subtitle: 'Add numbers as linked lists',
    codeSnippet: `def addTwoNumbers(l1, l2):
    dummy = ListNode()
    cur = dummy
    carry = 0
    while l1 or l2 or carry:
        v1 = l1.val if l1 else 0
        v2 = l2.val if l2 else 0
        val = v1 + v2 + carry
        carry = val // 10
        cur.next = ListNode(val % 10)
        cur = cur.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next`,
  }),
  createConfig(t, {
    algorithmId: 'linked-list-cycle',
    title: 'Linked List Cycle',
    subtitle: 'Detect cycle using Floyd\'s algorithm',
    codeSnippet: `def hasCycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
  }),
  createConfig(t, {
    algorithmId: 'find-duplicate-number',
    title: 'Find the Duplicate Number',
    subtitle: 'Find duplicate using Floyd\'s cycle',
    codeSnippet: `def findDuplicate(nums):
    slow, fast = 0, 0
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow2 = 0
    while slow != slow2:
        slow = nums[slow]
        slow2 = nums[slow2]
    return slow`,
  }),
  createConfig(t, {
    algorithmId: 'lru-cache',
    title: 'LRU Cache',
    subtitle: 'Least recently used cache',
    codeSnippet: `class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.order = OrderedDict()
    def get(self, key):
        if key not in self.cache:
            return -1
        self.order.move_to_end(key)
        return self.cache[key]
    def put(self, key, value):
        if key in self.cache:
            self.order.move_to_end(key)
        self.cache[key] = value
        self.order[key] = None
        if len(self.cache) > self.cap:
            oldest = next(iter(self.order))
            del self.cache[oldest]
            del self.order[oldest]`,
  }),
  createConfig(t, {
    algorithmId: 'merge-k-sorted-lists',
    title: 'Merge K Sorted Lists',
    subtitle: 'Merge k sorted linked lists',
    codeSnippet: `def mergeKLists(lists):
    if not lists:
        return None
    while len(lists) > 1:
        merged = []
        for i in range(0, len(lists), 2):
            l1 = lists[i]
            l2 = lists[i+1] if i+1 < len(lists) else None
            merged.append(mergeTwoLists(l1, l2))
        lists = merged
    return lists[0]`,
  }),
  createConfig(t, {
    algorithmId: 'reverse-nodes-k-group',
    title: 'Reverse Nodes in k-Group',
    subtitle: 'Reverse list in groups of k',
    codeSnippet: `def reverseKGroup(head, k):
    dummy = ListNode(0, head)
    groupPrev = dummy
    while True:
        kth = getKth(groupPrev, k)
        if not kth:
            break
        groupNext = kth.next
        prev, curr = kth.next, groupPrev.next
        while curr != groupNext:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        tmp = groupPrev.next
        groupPrev.next = kth
        groupPrev = tmp
    return dummy.next`,
  }),
];
