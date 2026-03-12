import { createConfig, twoPointersTemplate } from '../templates';

const t = twoPointersTemplate;

export const twoPointersConfigs = [
  createConfig(t, {
    algorithmId: 'valid-palindrome',
    title: 'Valid Palindrome',
    subtitle: 'Check if string is a palindrome',
    codeSnippet: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l, r = l + 1, r - 1
    return True`,
  }),
  createConfig(t, {
    algorithmId: 'two-sum-ii',
    title: 'Two Sum II',
    subtitle: 'Two sum in sorted array',
    codeSnippet: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        elif s < target:
            l += 1
        else:
            r -= 1`,
  }),
  createConfig(t, {
    algorithmId: 'three-sum',
    title: '3Sum',
    subtitle: 'Find all triplets that sum to zero',
    codeSnippet: `def threeSum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s == 0:
                result.append([nums[i], nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l-1]:
                    l += 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'container-with-most-water',
    title: 'Container With Most Water',
    subtitle: 'Find max area between two lines',
    codeSnippet: `def maxArea(height):
    l, r = 0, len(height) - 1
    maxWater = 0
    while l < r:
        area = min(height[l], height[r]) * (r - l)
        maxWater = max(maxWater, area)
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return maxWater`,
  }),
  createConfig(t, {
    algorithmId: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    subtitle: 'Calculate trapped water between bars',
    codeSnippet: `def trap(height):
    l, r = 0, len(height) - 1
    leftMax, rightMax = height[l], height[r]
    water = 0
    while l < r:
        if leftMax < rightMax:
            l += 1
            leftMax = max(leftMax, height[l])
            water += leftMax - height[l]
        else:
            r -= 1
            rightMax = max(rightMax, height[r])
            water += rightMax - height[r]
    return water`,
  }),
];
