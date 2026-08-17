import { createConfig, arraysHashingTemplate } from '../templates';

const t = arraysHashingTemplate;

export const arraysHashingNewAConfigs = [
  createConfig(t, {
    algorithmId: 'concatenation-of-array',
    title: 'Concatenation of Array',
    subtitle: 'Append the array to itself',
    codeSnippet: `def getConcatenation(nums):
    ans = []
    for num in nums:
        ans.append(num)
    for num in nums:
        ans.append(num)
    return ans`,
  }),
  createConfig(t, {
    algorithmId: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    subtitle: 'Scan columns until words disagree',
    codeSnippet: `def longestCommonPrefix(strs):
    if not strs:
        return ""
    for i in range(len(strs[0])):
        c = strs[0][i]
        for s in strs[1:]:
            if i == len(s) or s[i] != c:
                return strs[0][:i]
    return strs[0]`,
  }),
  createConfig(t, {
    algorithmId: 'remove-element',
    title: 'Remove Element',
    subtitle: 'Pack keepers with a write pointer',
    codeSnippet: `def removeElement(nums, val):
    k = 0
    for i in range(len(nums)):
        if nums[i] != val:
            nums[k] = nums[i]
            k += 1
    return k`,
  }),
  createConfig(t, {
    algorithmId: 'majority-element',
    title: 'Majority Element',
    subtitle: 'Boyer-Moore vote cancellation',
    codeSnippet: `def majorityElement(nums):
    count = 0
    candidate = None
    for num in nums:
        if count == 0:
            candidate = num
        count += 1 if num == candidate else -1
    return candidate`,
  }),
  createConfig(t, {
    algorithmId: 'sort-colors',
    title: 'Sort Colors',
    subtitle: 'Dutch National Flag one-pass partition',
    codeSnippet: `def sortColors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
    return nums`,
  }),
  createConfig(t, {
    algorithmId: 'design-hash-set',
    title: 'Design HashSet',
    subtitle: 'Bucket array with separate chaining',
    codeSnippet: `class MyHashSet:
    def __init__(self):
        self.size = 1000
        self.buckets = [[] for _ in range(self.size)]

    def _hash(self, key):
        return key % self.size

    def add(self, key):
        b = self.buckets[self._hash(key)]
        if key not in b:
            b.append(key)

    def remove(self, key):
        b = self.buckets[self._hash(key)]
        if key in b:
            b.remove(key)

    def contains(self, key):
        return key in self.buckets[self._hash(key)]`,
  }),
  createConfig(t, {
    algorithmId: 'design-hash-map',
    title: 'Design HashMap',
    subtitle: 'Key/value chains inside hash buckets',
    codeSnippet: `class MyHashMap:
    def __init__(self):
        self.size = 1000
        self.buckets = [[] for _ in range(self.size)]

    def _hash(self, key):
        return key % self.size

    def put(self, key, value):
        b = self.buckets[self._hash(key)]
        for pair in b:
            if pair[0] == key:
                pair[1] = value
                return
        b.append([key, value])

    def get(self, key):
        for pair in self.buckets[self._hash(key)]:
            if pair[0] == key:
                return pair[1]
        return -1

    def remove(self, key):
        b = self.buckets[self._hash(key)]
        for i, pair in enumerate(b):
            if pair[0] == key:
                b.pop(i)
                return`,
  }),
];
