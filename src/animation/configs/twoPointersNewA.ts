import { createConfig, twoPointersTemplate } from '../templates';

const t = twoPointersTemplate;

export const twoPointersNewAConfigs = [
  createConfig(t, {
    algorithmId: 'reverse-string',
    title: 'Reverse String',
    subtitle: 'Swap the ends inward, in place',
    codeSnippet: `def reverseString(s):
    left, right = 0, len(s) - 1

    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1

    return s`,
  }),
  createConfig(t, {
    algorithmId: 'valid-palindrome-ii',
    title: 'Valid Palindrome II',
    subtitle: 'Palindrome with at most one deletion',
    codeSnippet: `def validPalindrome(s):
    left, right = 0, len(s) - 1

    while left < right:
        if s[left] != s[right]:
            skip_left = s[left + 1:right + 1]
            skip_right = s[left:right]
            return skip_left == skip_left[::-1] or skip_right == skip_right[::-1]
        left += 1
        right -= 1

    return True`,
  }),
  createConfig(t, {
    algorithmId: 'merge-strings-alternately',
    title: 'Merge Strings Alternately',
    subtitle: 'Interleave two strings with one pointer each',
    codeSnippet: `def mergeAlternately(word1, word2):
    i, j = 0, 0
    merged = []

    while i < len(word1) and j < len(word2):
        merged.append(word1[i])
        merged.append(word2[j])
        i += 1
        j += 1

    merged.append(word1[i:])
    merged.append(word2[j:])
    return ''.join(merged)`,
  }),
  createConfig(t, {
    algorithmId: 'rotate-array',
    title: 'Rotate Array',
    subtitle: 'Rotate right by k with three reversals',
    codeSnippet: `def rotate(nums, k):
    n = len(nums)
    k %= n

    def reverse(left, right):
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return nums`,
  }),
];
