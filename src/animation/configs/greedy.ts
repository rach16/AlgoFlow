import { createConfig, greedyTemplate } from '../templates';

const t = greedyTemplate;

export const greedyConfigs = [
  createConfig(t, {
    algorithmId: 'maximum-subarray',
    title: 'Maximum Subarray',
    subtitle: 'Find max sum contiguous subarray',
    codeSnippet: `def maxSubArray(nums):
    maxSub = nums[0]
    curSum = 0
    for n in nums:
        if curSum < 0:
            curSum = 0
        curSum += n
        maxSub = max(maxSub, curSum)
    return maxSub`,
  }),
  createConfig(t, {
    algorithmId: 'jump-game',
    title: 'Jump Game',
    subtitle: 'Can you reach the last index',
    codeSnippet: `def canJump(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:
            goal = i
    return goal == 0`,
  }),
  createConfig(t, {
    algorithmId: 'jump-game-ii',
    title: 'Jump Game II',
    subtitle: 'Minimum jumps to reach end',
    codeSnippet: `def jump(nums):
    result = 0
    l = r = 0
    while r < len(nums) - 1:
        farthest = 0
        for i in range(l, r + 1):
            farthest = max(farthest, i + nums[i])
        l = r + 1
        r = farthest
        result += 1
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'gas-station',
    title: 'Gas Station',
    subtitle: 'Find starting gas station for circuit',
    codeSnippet: `def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    total = 0
    start = 0
    for i in range(len(gas)):
        total += gas[i] - cost[i]
        if total < 0:
            total = 0
            start = i + 1
    return start`,
  }),
  createConfig(t, {
    algorithmId: 'hand-of-straights',
    title: 'Hand of Straights',
    subtitle: 'Rearrange cards into consecutive groups',
    codeSnippet: `def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False
    count = Counter(hand)
    minHeap = list(count.keys())
    heapq.heapify(minHeap)
    while minHeap:
        first = minHeap[0]
        for i in range(first, first + groupSize):
            if i not in count:
                return False
            count[i] -= 1
            if count[i] == 0:
                if i != minHeap[0]:
                    return False
                heapq.heappop(minHeap)
    return True`,
  }),
  createConfig(t, {
    algorithmId: 'merge-triplets',
    title: 'Merge Triplets to Form Target',
    subtitle: 'Can merge triplets to reach target',
    codeSnippet: `def mergeTriplets(triplets, target):
    good = set()
    for t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue
        for i, v in enumerate(t):
            if v == target[i]:
                good.add(i)
    return len(good) == 3`,
  }),
  createConfig(t, {
    algorithmId: 'partition-labels',
    title: 'Partition Labels',
    subtitle: 'Partition string into max parts',
    codeSnippet: `def partitionLabels(s):
    lastIndex = {}
    for i, c in enumerate(s):
        lastIndex[c] = i
    result = []
    size, end = 0, 0
    for i, c in enumerate(s):
        size += 1
        end = max(end, lastIndex[c])
        if i == end:
            result.append(size)
            size = 0
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'valid-parenthesis-string',
    title: 'Valid Parenthesis String',
    subtitle: 'Check validity with * wildcards',
    codeSnippet: `def checkValidString(s):
    leftMin, leftMax = 0, 0
    for c in s:
        if c == '(':
            leftMin, leftMax = leftMin+1, leftMax+1
        elif c == ')':
            leftMin, leftMax = leftMin-1, leftMax-1
        else:
            leftMin, leftMax = leftMin-1, leftMax+1
        if leftMax < 0:
            return False
        if leftMin < 0:
            leftMin = 0
    return leftMin == 0`,
  }),
];
