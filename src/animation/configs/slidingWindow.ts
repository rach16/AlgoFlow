import { createConfig, slidingWindowTemplate } from '../templates';

const t = slidingWindowTemplate;

export const slidingWindowConfigs = [
  createConfig(t, {
    algorithmId: 'best-time-to-buy-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    subtitle: 'Maximum profit from one transaction',
    codeSnippet: `def maxProfit(prices):
    minPrice = float('inf')
    maxProfit = 0
    for price in prices:
        minPrice = min(minPrice, price)
        maxProfit = max(maxProfit, price - minPrice)
    return maxProfit`,
  }),
  createConfig(t, {
    algorithmId: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating',
    subtitle: 'Longest substring with unique characters',
    codeSnippet: `def lengthOfLongestSubstring(s):
    seen = set()
    l, maxLen = 0, 0
    for r in range(len(s)):
        while s[r] in seen:
            seen.remove(s[l])
            l += 1
        seen.add(s[r])
        maxLen = max(maxLen, r - l + 1)
    return maxLen`,
  }),
  createConfig(t, {
    algorithmId: 'longest-repeating-character-replacement',
    title: 'Longest Repeating Character Replacement',
    subtitle: 'Longest substring with k replacements',
    codeSnippet: `def characterReplacement(s, k):
    count = {}
    l, maxLen, maxFreq = 0, 0, 0
    for r in range(len(s)):
        count[s[r]] = count.get(s[r], 0) + 1
        maxFreq = max(maxFreq, count[s[r]])
        while (r - l + 1) - maxFreq > k:
            count[s[l]] -= 1
            l += 1
        maxLen = max(maxLen, r - l + 1)
    return maxLen`,
  }),
  createConfig(t, {
    algorithmId: 'permutation-in-string',
    title: 'Permutation in String',
    subtitle: 'Check if s1 permutation is in s2',
    codeSnippet: `def checkInclusion(s1, s2):
    if len(s1) > len(s2): return False
    s1Count = Counter(s1)
    window = Counter(s2[:len(s1)])
    if s1Count == window: return True
    for i in range(len(s1), len(s2)):
        window[s2[i]] += 1
        window[s2[i - len(s1)]] -= 1
        if window[s2[i - len(s1)]] == 0:
            del window[s2[i - len(s1)]]
        if s1Count == window: return True
    return False`,
  }),
  createConfig(t, {
    algorithmId: 'minimum-window-substring',
    title: 'Minimum Window Substring',
    subtitle: 'Smallest window containing all chars',
    codeSnippet: `def minWindow(s, t):
    need = Counter(t)
    have, total = 0, len(need)
    result, resLen = [-1, -1], float('inf')
    l = 0
    window = {}
    for r in range(len(s)):
        window[s[r]] = window.get(s[r], 0) + 1
        if s[r] in need and window[s[r]] == need[s[r]]:
            have += 1
        while have == total:
            if (r - l + 1) < resLen:
                result = [l, r]
                resLen = r - l + 1
            window[s[l]] -= 1
            if s[l] in need and window[s[l]] < need[s[l]]:
                have -= 1
            l += 1
    return s[result[0]:result[1]+1] if resLen != float('inf') else ""`,
  }),
  createConfig(t, {
    algorithmId: 'sliding-window-maximum',
    title: 'Sliding Window Maximum',
    subtitle: 'Max value in each window of size k',
    codeSnippet: `def maxSlidingWindow(nums, k):
    from collections import deque
    dq = deque()
    result = []
    for i in range(len(nums)):
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        while dq and nums[dq[-1]] < nums[i]:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result`,
  }),
];
