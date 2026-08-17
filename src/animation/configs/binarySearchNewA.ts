import { createConfig, binarySearchTemplate } from '../templates';

const t = binarySearchTemplate;

export const binarySearchNewAConfigs = [
  createConfig(t, {
    algorithmId: 'search-insert-position',
    title: 'Search Insert Position',
    subtitle: 'Lower bound: first index with nums[i] >= target',
    codeSnippet: `def searchInsert(nums, target):
    lo, hi = 0, len(nums)

    while lo < hi:
        mid = (lo + hi) // 2

        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid

    return lo`,
  }),
  createConfig(t, {
    algorithmId: 'guess-number',
    title: 'Guess Number Higher or Lower',
    subtitle: 'Halve the guess range on higher/lower feedback',
    codeSnippet: `def guessNumber(n):
    lo, hi = 1, n

    while lo <= hi:
        mid = (lo + hi) // 2
        res = guess(mid)

        if res == 0:
            return mid
        elif res < 0:
            hi = mid - 1
        else:
            lo = mid + 1

    return -1`,
  }),
  createConfig(t, {
    algorithmId: 'sqrt-x',
    title: 'Sqrt(x)',
    subtitle: 'Binary search the largest r with r * r <= x',
    codeSnippet: `def mySqrt(x):
    if x < 2:
        return x

    lo, hi = 1, x // 2
    ans = 1

    while lo <= hi:
        mid = (lo + hi) // 2
        sq = mid * mid

        if sq == x:
            return mid
        elif sq < x:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1

    return ans`,
  }),
  createConfig(t, {
    algorithmId: 'capacity-to-ship-packages',
    title: 'Capacity To Ship Packages Within D Days',
    subtitle: 'Binary search capacity with a greedy feasibility check',
    codeSnippet: `def shipWithinDays(weights, days):
    lo, hi = max(weights), sum(weights)

    while lo < hi:
        mid = (lo + hi) // 2

        needed, load = 1, 0
        for w in weights:
            if load + w > mid:
                needed += 1
                load = 0
            load += w

        if needed <= days:
            hi = mid
        else:
            lo = mid + 1

    return lo`,
  }),
];
