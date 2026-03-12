import { createConfig, heapTemplate } from '../templates';

const t = heapTemplate;

export const heapConfigs = [
  createConfig(t, {
    algorithmId: 'kth-largest-stream',
    title: 'Kth Largest Element in a Stream',
    subtitle: 'Maintain kth largest with min heap',
    codeSnippet: `class KthLargest:
    def __init__(self, k, nums):
        self.minHeap = nums
        self.k = k
        heapq.heapify(self.minHeap)
        while len(self.minHeap) > k:
            heapq.heappop(self.minHeap)
    def add(self, val):
        heapq.heappush(self.minHeap, val)
        if len(self.minHeap) > self.k:
            heapq.heappop(self.minHeap)
        return self.minHeap[0]`,
  }),
  createConfig(t, {
    algorithmId: 'last-stone-weight',
    title: 'Last Stone Weight',
    subtitle: 'Smash heaviest stones using max heap',
    codeSnippet: `def lastStoneWeight(stones):
    stones = [-s for s in stones]
    heapq.heapify(stones)
    while len(stones) > 1:
        first = -heapq.heappop(stones)
        second = -heapq.heappop(stones)
        if first != second:
            heapq.heappush(stones, -(first - second))
    return -stones[0] if stones else 0`,
  }),
  createConfig(t, {
    algorithmId: 'k-closest-points',
    title: 'K Closest Points to Origin',
    subtitle: 'Find k nearest points',
    codeSnippet: `def kClosest(points, k):
    minHeap = []
    for x, y in points:
        dist = x*x + y*y
        minHeap.append([dist, x, y])
    heapq.heapify(minHeap)
    result = []
    for _ in range(k):
        _, x, y = heapq.heappop(minHeap)
        result.append([x, y])
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'kth-largest-element',
    title: 'Kth Largest Element in an Array',
    subtitle: 'Find kth largest element',
    codeSnippet: `def findKthLargest(nums, k):
    minHeap = []
    for num in nums:
        heapq.heappush(minHeap, num)
        if len(minHeap) > k:
            heapq.heappop(minHeap)
    return minHeap[0]`,
  }),
  createConfig(t, {
    algorithmId: 'task-scheduler',
    title: 'Task Scheduler',
    subtitle: 'Schedule tasks with cooldown',
    codeSnippet: `def leastInterval(tasks, n):
    count = Counter(tasks)
    maxHeap = [-c for c in count.values()]
    heapq.heapify(maxHeap)
    time = 0
    queue = deque()
    while maxHeap or queue:
        time += 1
        if maxHeap:
            cnt = 1 + heapq.heappop(maxHeap)
            if cnt:
                queue.append([cnt, time + n])
        if queue and queue[0][1] == time:
            heapq.heappush(maxHeap, queue.popleft()[0])
    return time`,
  }),
  createConfig(t, {
    algorithmId: 'design-twitter',
    title: 'Design Twitter',
    subtitle: 'Twitter feed with merge k sorted',
    codeSnippet: `class Twitter:
    def __init__(self):
        self.count = 0
        self.tweetMap = defaultdict(list)
        self.followMap = defaultdict(set)
    def postTweet(self, userId, tweetId):
        self.tweetMap[userId].append([self.count, tweetId])
        self.count -= 1
    def getNewsFeed(self, userId):
        minHeap = []
        self.followMap[userId].add(userId)
        for followeeId in self.followMap[userId]:
            if self.tweetMap[followeeId]:
                idx = len(self.tweetMap[followeeId]) - 1
                count, tweetId = self.tweetMap[followeeId][idx]
                heapq.heappush(minHeap, [count, tweetId, followeeId, idx - 1])
        feed = []
        while minHeap and len(feed) < 10:
            count, tweetId, followeeId, idx = heapq.heappop(minHeap)
            feed.append(tweetId)
            if idx >= 0:
                count, tweetId = self.tweetMap[followeeId][idx]
                heapq.heappush(minHeap, [count, tweetId, followeeId, idx - 1])
        return feed`,
  }),
  createConfig(t, {
    algorithmId: 'find-median-data-stream',
    title: 'Find Median from Data Stream',
    subtitle: 'Median using two heaps',
    codeSnippet: `class MedianFinder:
    def __init__(self):
        self.small = []  # max heap
        self.large = []  # min heap
    def addNum(self, num):
        heapq.heappush(self.small, -num)
        if self.small and self.large and (-self.small[0]) > self.large[0]:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        if len(self.large) > len(self.small) + 1:
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)
    def findMedian(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        if len(self.large) > len(self.small):
            return self.large[0]
        return (-self.small[0] + self.large[0]) / 2`,
  }),
];
