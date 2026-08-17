import { createConfig, binarySearchTemplate, linkedListTemplate } from '../templates';

const bs = binarySearchTemplate;
const ll = linkedListTemplate;

export const binarySearchLinkedListNewConfigs = [
  createConfig(bs, {
    algorithmId: 'search-rotated-sorted-ii',
    title: 'Search In Rotated Sorted Array II',
    subtitle: 'Sorted-half binary search, shrinking ends on duplicates',
    codeSnippet: `def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return True

        if nums[left] == nums[mid] == nums[right]:
            left += 1
            right -= 1
        elif nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return False`,
  }),
  createConfig(bs, {
    algorithmId: 'split-array-largest-sum',
    title: 'Split Array Largest Sum',
    subtitle: 'Binary search the answer, greedy feasibility check',
    codeSnippet: `def splitArray(nums, k):
    left, right = max(nums), sum(nums)

    def pieces(limit):
        count, curr = 1, 0
        for num in nums:
            if curr + num > limit:
                count += 1
                curr = num
            else:
                curr += num
        return count

    while left < right:
        mid = (left + right) // 2
        if pieces(mid) <= k:
            right = mid
        else:
            left = mid + 1

    return left`,
  }),
  createConfig(bs, {
    algorithmId: 'find-in-mountain-array',
    title: 'Find in Mountain Array',
    subtitle: 'Binary search the peak, then each slope',
    codeSnippet: `def findInMountainArray(target, arr):
    left, right = 0, len(arr) - 1
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < arr[mid + 1]:
            left = mid + 1
        else:
            right = mid
    peak = left

    left, right = 0, peak
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    left, right = peak + 1, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] > target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
  }),
  createConfig(ll, {
    algorithmId: 'reverse-linked-list-ii',
    title: 'Reverse Linked List II',
    subtitle: 'One-pass head insertion behind a dummy node',
    codeSnippet: `def reverseBetween(head, left, right):
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
  }),
  createConfig(ll, {
    algorithmId: 'design-circular-queue',
    title: 'Design Circular Queue',
    subtitle: 'Ring buffer with head, size and modulo wraparound',
    codeSnippet: `class MyCircularQueue:
    def __init__(self, k):
        self.q = [0] * k
        self.size = 0
        self.head = 0
        self.capacity = k

    def enQueue(self, value):
        if self.size == self.capacity:
            return False
        tail = (self.head + self.size) % self.capacity
        self.q[tail] = value
        self.size += 1
        return True

    def deQueue(self):
        if self.size == 0:
            return False
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return True

    def Front(self):
        return -1 if self.size == 0 else self.q[self.head]

    def Rear(self):
        if self.size == 0:
            return -1
        return self.q[(self.head + self.size - 1) % self.capacity]

    def isEmpty(self):
        return self.size == 0

    def isFull(self):
        return self.size == self.capacity`,
  }),
  createConfig(ll, {
    algorithmId: 'lfu-cache',
    title: 'LFU Cache',
    subtitle: 'Frequency buckets plus a minCount pointer for O(1) eviction',
    codeSnippet: `class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.counts = {}
        self.buckets = defaultdict(OrderedDict)
        self.min_count = 0

    def _touch(self, key):
        count = self.counts[key]
        del self.buckets[count][key]
        if not self.buckets[count]:
            del self.buckets[count]
            if self.min_count == count:
                self.min_count += 1
        self.counts[key] = count + 1
        self.buckets[count + 1][key] = None

    def get(self, key):
        if key not in self.cache:
            return -1
        self._touch(key)
        return self.cache[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.cache:
            self.cache[key] = value
            self._touch(key)
            return
        if len(self.cache) == self.cap:
            evict, _ = self.buckets[self.min_count].popitem(last=False)
            del self.cache[evict]
            del self.counts[evict]
        self.cache[key] = value
        self.counts[key] = 1
        self.buckets[1][key] = None
        self.min_count = 1`,
  }),
];
