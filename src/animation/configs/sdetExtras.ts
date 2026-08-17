import { createConfig, arraysHashingTemplate, linkedListTemplate } from '../templates';

const ah = arraysHashingTemplate;
const ll = linkedListTemplate;

export const sdetExtrasConfigs = [
  createConfig(ah, {
    algorithmId: 'move-zeroes',
    title: 'Move Zeroes',
    subtitle: 'Pack non-zeros with a write pointer, in place',
    codeSnippet: `def moveZeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
    return nums`,
  }),
  createConfig(ah, {
    algorithmId: 'first-unique-character',
    title: 'First Unique Character in a String',
    subtitle: 'Count frequencies, then rescan in order',
    codeSnippet: `def firstUniqChar(s):
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for i, c in enumerate(s):
        if count[c] == 1:
            return i
    return -1`,
  }),
  createConfig(ah, {
    algorithmId: 'intersection-of-two-arrays',
    title: 'Intersection of Two Arrays II',
    subtitle: 'Count the smaller array, decrement while scanning',
    codeSnippet: `def intersect(nums1, nums2):
    if len(nums1) > len(nums2):
        return intersect(nums2, nums1)
    count = {}
    for num in nums1:
        count[num] = count.get(num, 0) + 1
    res = []
    for num in nums2:
        if count.get(num, 0) > 0:
            res.append(num)
            count[num] -= 1
    return res`,
  }),
  createConfig(ll, {
    algorithmId: 'palindrome-linked-list',
    title: 'Palindrome Linked List',
    subtitle: 'Find middle, reverse second half, compare — O(1) space',
    codeSnippet: `def isPalindrome(head):
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
  }),
];
