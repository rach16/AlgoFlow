import { createConfig, slidingWindowTemplate } from '../templates';

const t = slidingWindowTemplate;

export const slidingWindowNewConfigs = [
  createConfig(t, {
    algorithmId: 'contains-duplicate-ii',
    title: 'Contains Duplicate II',
    subtitle: 'Hash set holding only the last k values',
    codeSnippet: `def containsNearbyDuplicate(nums, k):
    window = set()

    for i in range(len(nums)):
        if i > k:
            window.remove(nums[i - k - 1])
        if nums[i] in window:
            return True
        window.add(nums[i])

    return False`,
  }),
  createConfig(t, {
    algorithmId: 'min-size-subarray-sum',
    title: 'Minimum Size Subarray Sum',
    subtitle: 'Expand to reach the target, shrink to minimize length',
    codeSnippet: `def minSubArrayLen(target, nums):
    left = 0
    total = 0
    res = float("inf")

    for right in range(len(nums)):
        total += nums[right]
        while total >= target:
            res = min(res, right - left + 1)
            total -= nums[left]
            left += 1

    return 0 if res == float("inf") else res`,
  }),
  createConfig(t, {
    algorithmId: 'find-k-closest-elements',
    title: 'Find K Closest Elements',
    subtitle: 'Binary search the start of the fixed-size window',
    codeSnippet: `def findClosestElements(arr, k, x):
    lo, hi = 0, len(arr) - k

    while lo < hi:
        mid = (lo + hi) // 2
        if x - arr[mid] > arr[mid + k] - x:
            lo = mid + 1
        else:
            hi = mid

    return arr[lo:lo + k]`,
  }),
];
