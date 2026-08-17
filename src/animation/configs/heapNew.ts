import { createConfig, heapTemplate } from '../templates';

const t = heapTemplate;

export const heapNewConfigs = [
  createConfig(t, {
    algorithmId: 'single-threaded-cpu',
    title: 'Single Threaded CPU',
    subtitle: 'Sort by arrival, min-heap picks the shortest job',
    codeSnippet: `import heapq

def getOrder(tasks):
    indexed = sorted([(e, p, i) for i, (e, p) in enumerate(tasks)])
    heap = []
    order = []
    time = 0
    j = 0

    while len(order) < len(tasks):
        while j < len(indexed) and indexed[j][0] <= time:
            e, p, i = indexed[j]
            heapq.heappush(heap, (p, i))
            j += 1
        if not heap:
            time = indexed[j][0]
            continue
        p, i = heapq.heappop(heap)
        time += p
        order.append(i)

    return order`,
  }),
  createConfig(t, {
    algorithmId: 'reorganize-string',
    title: 'Reorganize String',
    subtitle: 'Max-heap spends the two most frequent characters',
    codeSnippet: `import heapq
from collections import Counter

def reorganizeString(s):
    count = Counter(s)
    maxHeap = [(-c, ch) for ch, c in count.items()]
    heapq.heapify(maxHeap)

    res = []
    while len(maxHeap) > 1:
        c1, ch1 = heapq.heappop(maxHeap)
        c2, ch2 = heapq.heappop(maxHeap)
        res.append(ch1)
        res.append(ch2)
        if c1 + 1 < 0:
            heapq.heappush(maxHeap, (c1 + 1, ch1))
        if c2 + 1 < 0:
            heapq.heappush(maxHeap, (c2 + 1, ch2))

    if maxHeap:
        c, ch = heapq.heappop(maxHeap)
        if -c > 1:
            return ""
        res.append(ch)

    return "".join(res)`,
  }),
  createConfig(t, {
    algorithmId: 'longest-happy-string',
    title: 'Longest Happy String',
    subtitle: 'Greedy max-heap with a three-in-a-row guard',
    codeSnippet: `import heapq

def longestDiverseString(a, b, c):
    maxHeap = []
    for count, ch in [(-a, 'a'), (-b, 'b'), (-c, 'c')]:
        if count != 0:
            heapq.heappush(maxHeap, (count, ch))

    res = []
    while maxHeap:
        count, ch = heapq.heappop(maxHeap)
        if len(res) > 1 and res[-1] == res[-2] == ch:
            if not maxHeap:
                break
            count2, ch2 = heapq.heappop(maxHeap)
            res.append(ch2)
            if count2 + 1 != 0:
                heapq.heappush(maxHeap, (count2 + 1, ch2))
            heapq.heappush(maxHeap, (count, ch))
        else:
            res.append(ch)
            if count + 1 != 0:
                heapq.heappush(maxHeap, (count + 1, ch))

    return "".join(res)`,
  }),
  createConfig(t, {
    algorithmId: 'car-pooling',
    title: 'Car Pooling',
    subtitle: 'Difference array sweep over every stop',
    codeSnippet: `def carPooling(trips, capacity):
    lastStop = max(t[2] for t in trips)
    diff = [0] * (lastStop + 1)

    for num, start, end in trips:
        diff[start] += num
        diff[end] -= num

    current = 0
    for stop in range(lastStop + 1):
        current += diff[stop]
        if current > capacity:
            return False

    return True`,
  }),
  createConfig(t, {
    algorithmId: 'ipo',
    title: 'IPO',
    subtitle: 'Unlock by capital, max-heap picks the best profit',
    codeSnippet: `import heapq

def findMaximizedCapital(k, w, profits, capital):
    projects = sorted(zip(capital, profits))
    maxHeap = []
    i = 0

    for _ in range(k):
        while i < len(projects) and projects[i][0] <= w:
            heapq.heappush(maxHeap, -projects[i][1])
            i += 1
        if not maxHeap:
            break
        w += -heapq.heappop(maxHeap)

    return w`,
  }),
];
