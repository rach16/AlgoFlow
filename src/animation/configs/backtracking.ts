import { createConfig, backtrackingTemplate } from '../templates';

const t = backtrackingTemplate;

export const backtrackingConfigs = [
  createConfig(t, {
    algorithmId: 'subsets',
    title: 'Subsets',
    subtitle: 'Generate all subsets',
    codeSnippet: `def subsets(nums):
    result = []
    subset = []
    def dfs(i):
        if i >= len(nums):
            result.append(subset[:])
            return
        subset.append(nums[i])
        dfs(i + 1)
        subset.pop()
        dfs(i + 1)
    dfs(0)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'combination-sum',
    title: 'Combination Sum',
    subtitle: 'Find combinations that sum to target',
    codeSnippet: `def combinationSum(candidates, target):
    result = []
    def dfs(i, cur, total):
        if total == target:
            result.append(cur[:])
            return
        if i >= len(candidates) or total > target:
            return
        cur.append(candidates[i])
        dfs(i, cur, total + candidates[i])
        cur.pop()
        dfs(i + 1, cur, total)
    dfs(0, [], 0)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'permutations',
    title: 'Permutations',
    subtitle: 'Generate all permutations',
    codeSnippet: `def permute(nums):
    result = []
    if len(nums) == 1:
        return [nums[:]]
    for i in range(len(nums)):
        n = nums.pop(0)
        perms = permute(nums)
        for perm in perms:
            perm.append(n)
        result.extend(perms)
        nums.append(n)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'subsets-ii',
    title: 'Subsets II',
    subtitle: 'Subsets with duplicates',
    codeSnippet: `def subsetsWithDup(nums):
    nums.sort()
    result = []
    subset = []
    def dfs(i):
        if i >= len(nums):
            result.append(subset[:])
            return
        subset.append(nums[i])
        dfs(i + 1)
        subset.pop()
        while i + 1 < len(nums) and nums[i] == nums[i+1]:
            i += 1
        dfs(i + 1)
    dfs(0)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'combination-sum-ii',
    title: 'Combination Sum II',
    subtitle: 'Combinations with no duplicates',
    codeSnippet: `def combinationSum2(candidates, target):
    candidates.sort()
    result = []
    def dfs(i, cur, total):
        if total == target:
            result.append(cur[:])
            return
        for j in range(i, len(candidates)):
            if j > i and candidates[j] == candidates[j-1]:
                continue
            if total + candidates[j] > target:
                break
            cur.append(candidates[j])
            dfs(j + 1, cur, total + candidates[j])
            cur.pop()
    dfs(0, [], 0)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'word-search',
    title: 'Word Search',
    subtitle: 'Find word in grid via DFS',
    codeSnippet: `def exist(board, word):
    rows, cols = len(board), len(board[0])
    path = set()
    def dfs(r, c, i):
        if i == len(word):
            return True
        if (r < 0 or c < 0 or r >= rows or c >= cols or
            word[i] != board[r][c] or (r,c) in path):
            return False
        path.add((r, c))
        res = (dfs(r+1,c,i+1) or dfs(r-1,c,i+1) or
               dfs(r,c+1,i+1) or dfs(r,c-1,i+1))
        path.remove((r, c))
        return res`,
  }),
  createConfig(t, {
    algorithmId: 'palindrome-partitioning',
    title: 'Palindrome Partitioning',
    subtitle: 'Partition string into palindromes',
    codeSnippet: `def partition(s):
    result = []
    part = []
    def dfs(i):
        if i >= len(s):
            result.append(part[:])
            return
        for j in range(i, len(s)):
            if isPali(s, i, j):
                part.append(s[i:j+1])
                dfs(j + 1)
                part.pop()
    dfs(0)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'letter-combinations',
    title: 'Letter Combinations of a Phone Number',
    subtitle: 'Generate letter combos from digits',
    codeSnippet: `def letterCombinations(digits):
    if not digits: return []
    phone = {'2':'abc','3':'def','4':'ghi','5':'jkl',
             '6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}
    result = []
    def backtrack(i, cur):
        if i == len(digits):
            result.append(cur)
            return
        for c in phone[digits[i]]:
            backtrack(i + 1, cur + c)
    backtrack(0, '')
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'n-queens',
    title: 'N-Queens',
    subtitle: 'Place N queens on NxN board',
    codeSnippet: `def solveNQueens(n):
    col = set()
    posDiag = set()
    negDiag = set()
    result = []
    board = [['.']*n for _ in range(n)]
    def backtrack(r):
        if r == n:
            result.append([''.join(row) for row in board])
            return
        for c in range(n):
            if c in col or (r+c) in posDiag or (r-c) in negDiag:
                continue
            col.add(c)
            posDiag.add(r+c)
            negDiag.add(r-c)
            board[r][c] = 'Q'
            backtrack(r + 1)
            col.remove(c)
            posDiag.remove(r+c)
            negDiag.remove(r-c)
            board[r][c] = '.'
    backtrack(0)
    return result`,
  }),
];
