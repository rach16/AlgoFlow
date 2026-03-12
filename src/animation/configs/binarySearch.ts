import { createConfig, binarySearchTemplate } from '../templates';

const t = binarySearchTemplate;

export const binarySearchConfigs = [
  createConfig(t, {
    algorithmId: 'binary-search',
    title: 'Binary Search',
    subtitle: 'Search sorted array in O(log n)',
    codeSnippet: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`,
  }),
  createConfig(t, {
    algorithmId: 'search-2d-matrix',
    title: 'Search a 2D Matrix',
    subtitle: 'Binary search in sorted matrix',
    codeSnippet: `def searchMatrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    l, r = 0, m * n - 1
    while l <= r:
        mid = (l + r) // 2
        val = matrix[mid // n][mid % n]
        if val == target: return True
        elif val < target: l = mid + 1
        else: r = mid - 1
    return False`,
  }),
  createConfig(t, {
    algorithmId: 'koko-eating-bananas',
    title: 'Koko Eating Bananas',
    subtitle: 'Minimum eating speed to finish in h hours',
    codeSnippet: `def minEatingSpeed(piles, h):
    l, r = 1, max(piles)
    result = r
    while l <= r:
        k = (l + r) // 2
        hours = sum(ceil(p / k) for p in piles)
        if hours <= h:
            result = k
            r = k - 1
        else:
            l = k + 1
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'find-min-rotated-sorted',
    title: 'Find Minimum in Rotated Sorted Array',
    subtitle: 'Find min in rotated array',
    codeSnippet: `def findMin(nums):
    l, r = 0, len(nums) - 1
    result = nums[0]
    while l <= r:
        if nums[l] < nums[r]:
            result = min(result, nums[l])
            break
        mid = (l + r) // 2
        result = min(result, nums[mid])
        if nums[mid] >= nums[l]:
            l = mid + 1
        else:
            r = mid - 1
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'search-rotated-sorted',
    title: 'Search in Rotated Sorted Array',
    subtitle: 'Search target in rotated array',
    codeSnippet: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        if nums[l] <= nums[mid]:
            if target > nums[mid] or target < nums[l]:
                l = mid + 1
            else:
                r = mid - 1
        else:
            if target < nums[mid] or target > nums[r]:
                r = mid - 1
            else:
                l = mid + 1
    return -1`,
  }),
  createConfig(t, {
    algorithmId: 'time-based-key-value',
    title: 'Time Based Key-Value Store',
    subtitle: 'Key-value store with timestamp',
    codeSnippet: `class TimeMap:
    def __init__(self):
        self.store = {}
    def set(self, key, value, timestamp):
        if key not in self.store:
            self.store[key] = []
        self.store[key].append([value, timestamp])
    def get(self, key, timestamp):
        values = self.store.get(key, [])
        l, r = 0, len(values) - 1
        result = ""
        while l <= r:
            mid = (l + r) // 2
            if values[mid][1] <= timestamp:
                result = values[mid][0]
                l = mid + 1
            else:
                r = mid - 1
        return result`,
  }),
  createConfig(t, {
    algorithmId: 'median-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    subtitle: 'Find median in O(log(min(m,n)))',
    codeSnippet: `def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A
    total = len(A) + len(B)
    half = total // 2
    l, r = 0, len(A) - 1
    while True:
        i = (l + r) // 2
        j = half - i - 2
        Aleft = A[i] if i >= 0 else float('-inf')
        Aright = A[i+1] if i+1 < len(A) else float('inf')
        Bleft = B[j] if j >= 0 else float('-inf')
        Bright = B[j+1] if j+1 < len(B) else float('inf')
        if Aleft <= Bright and Bleft <= Aright:
            if total % 2:
                return min(Aright, Bright)
            return (max(Aleft, Bleft) + min(Aright, Bright)) / 2
        elif Aleft > Bright:
            r = i - 1
        else:
            l = i + 1`,
  }),
];
