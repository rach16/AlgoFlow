import { createConfig, twoPointersTemplate } from '../templates';

const t = twoPointersTemplate;

export const twoPointersNewBConfigs = [
  createConfig(t, {
    algorithmId: 'four-sum',
    title: '4Sum',
    subtitle: 'Fix two numbers, then two-pointer the rest',
    codeSnippet: `def fourSum(nums, target):
    nums.sort()
    res = []
    n = len(nums)

    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            l, r = j + 1, n - 1
            while l < r:
                total = nums[i] + nums[j] + nums[l] + nums[r]
                if total < target:
                    l += 1
                elif total > target:
                    r -= 1
                else:
                    res.append([nums[i], nums[j], nums[l], nums[r]])
                    l += 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
    return res`,
  }),
  createConfig(t, {
    algorithmId: 'merge-sorted-array',
    title: 'Merge Sorted Array',
    subtitle: 'Merge in place by filling from the back',
    codeSnippet: `def merge(nums1, m, nums2, n):
    i = m - 1
    j = n - 1
    k = m + n - 1

    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1

    return nums1`,
  }),
  createConfig(t, {
    algorithmId: 'remove-duplicates-sorted-array',
    title: 'Remove Duplicates From Sorted Array',
    subtitle: 'Slow write pointer, fast read pointer',
    codeSnippet: `def removeDuplicates(nums):
    if not nums:
        return 0

    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]

    return slow + 1`,
  }),
  createConfig(t, {
    algorithmId: 'boats-to-save-people',
    title: 'Boats to Save People',
    subtitle: 'Greedily pair the lightest with the heaviest',
    codeSnippet: `def numRescueBoats(people, limit):
    people.sort()
    l, r = 0, len(people) - 1
    boats = 0

    while l <= r:
        if people[l] + people[r] <= limit:
            l += 1
        r -= 1
        boats += 1

    return boats`,
  }),
];
