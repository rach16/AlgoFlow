import { createConfig, intervalsTemplate, triesTemplate } from '../templates';

export const intervalsTriesNewConfigs = [
  createConfig(intervalsTemplate, {
    algorithmId: 'meeting-rooms-iii',
    title: 'Meeting Rooms III',
    subtitle: 'Two heaps: free rooms by index, busy rooms by end time',
    codeSnippet: `import heapq

def mostBooked(n, meetings):
    meetings.sort()
    free = list(range(n))
    heapq.heapify(free)
    busy = []
    count = [0] * n

    for start, end in meetings:
        while busy and busy[0][0] <= start:
            _, room = heapq.heappop(busy)
            heapq.heappush(free, room)
        if free:
            room = heapq.heappop(free)
            heapq.heappush(busy, (end, room))
        else:
            endTime, room = heapq.heappop(busy)
            heapq.heappush(busy, (endTime + end - start, room))
        count[room] += 1

    return count.index(max(count))`,
  }),
  createConfig(triesTemplate, {
    algorithmId: 'extra-characters-in-string',
    title: 'Extra Characters in a String',
    subtitle: 'Walk a trie from each index to drive a right-to-left DP',
    codeSnippet: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.isWord = False

def minExtraChar(s, dictionary):
    root = TrieNode()
    for word in dictionary:
        node = root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.isWord = True

    n = len(s)
    dp = [0] * (n + 1)

    for i in range(n - 1, -1, -1):
        dp[i] = dp[i + 1] + 1
        node = root
        for j in range(i, n):
            if s[j] not in node.children:
                break
            node = node.children[s[j]]
            if node.isWord:
                dp[i] = min(dp[i], dp[j + 1])

    return dp[0]`,
  }),
];
