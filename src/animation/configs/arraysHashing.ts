import { createConfig, arraysHashingTemplate } from '../templates';

const t = arraysHashingTemplate;

export const arraysHashingConfigs = [
  createConfig(t, {
    algorithmId: 'two-sum',
    title: 'Two Sum',
    subtitle: 'Find two numbers that sum to target',
    codeSnippet: `def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []`,
  }),
  createConfig(t, {
    algorithmId: 'contains-duplicate',
    title: 'Contains Duplicate',
    subtitle: 'Check if array has duplicate values',
    codeSnippet: `def containsDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
  }),
  createConfig(t, {
    algorithmId: 'valid-anagram',
    title: 'Valid Anagram',
    subtitle: 'Check if two strings are anagrams',
    codeSnippet: `def isAnagram(s, t):
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
    return all(v == 0 for v in count.values())`,
  }),
  createConfig(t, {
    algorithmId: 'group-anagrams',
    title: 'Group Anagrams',
    subtitle: 'Group strings by anagram',
    codeSnippet: `def groupAnagrams(strs):
    groups = {}
    for s in strs:
        key = tuple(sorted(s))
        groups.setdefault(key, []).append(s)
    return list(groups.values())`,
  }),
  createConfig(t, {
    algorithmId: 'top-k-frequent',
    title: 'Top K Frequent Elements',
    subtitle: 'Find k most frequent elements',
    codeSnippet: `def topKFrequent(nums, k):
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums)+1)]
    for num, freq in count.items():
        buckets[freq].append(num)
    result = []
    for i in range(len(buckets)-1, -1, -1):
        result.extend(buckets[i])
        if len(result) >= k:
            return result[:k]`,
  }),
  createConfig(t, {
    algorithmId: 'encode-decode-strings',
    title: 'Encode and Decode Strings',
    subtitle: 'Design encode/decode for string list',
    codeSnippet: `def encode(strs):
    return ''.join(f'{len(s)}#{s}' for s in strs)

def decode(s):
    result, i = [], 0
    while i < len(s):
        j = s.index('#', i)
        length = int(s[i:j])
        result.append(s[j+1:j+1+length])
        i = j + 1 + length
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'product-except-self',
    title: 'Product of Array Except Self',
    subtitle: 'Product of all elements except current',
    codeSnippet: `def productExceptSelf(nums):
    n = len(nums)
    result = [1] * n
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]
    postfix = 1
    for i in range(n-1, -1, -1):
        result[i] *= postfix
        postfix *= nums[i]
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'valid-sudoku',
    title: 'Valid Sudoku',
    subtitle: 'Validate a 9x9 Sudoku board',
    codeSnippet: `def isValidSudoku(board):
    rows = defaultdict(set)
    cols = defaultdict(set)
    boxes = defaultdict(set)
    for r in range(9):
        for c in range(9):
            if board[r][c] == '.':
                continue
            if (board[r][c] in rows[r] or
                board[r][c] in cols[c] or
                board[r][c] in boxes[(r//3,c//3)]):
                return False
            rows[r].add(board[r][c])
            cols[c].add(board[r][c])
            boxes[(r//3,c//3)].add(board[r][c])
    return True`,
  }),
  createConfig(t, {
    algorithmId: 'longest-consecutive',
    title: 'Longest Consecutive Sequence',
    subtitle: 'Find longest consecutive element sequence',
    codeSnippet: `def longestConsecutive(nums):
    numSet = set(nums)
    longest = 0
    for n in numSet:
        if n - 1 not in numSet:
            length = 1
            while n + length in numSet:
                length += 1
            longest = max(longest, length)
    return longest`,
  }),
];
