import { createConfig, bitManipulationTemplate } from '../templates';

const t = bitManipulationTemplate;

export const bitManipulationConfigs = [
  createConfig(t, {
    algorithmId: 'single-number',
    title: 'Single Number',
    subtitle: 'Find element appearing once using XOR',
    codeSnippet: `def singleNumber(nums):
    result = 0
    for n in nums:
        result ^= n
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'number-of-1-bits',
    title: 'Number of 1 Bits',
    subtitle: 'Count set bits (Hamming weight)',
    codeSnippet: `def hammingWeight(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count`,
  }),
  createConfig(t, {
    algorithmId: 'counting-bits',
    title: 'Counting Bits',
    subtitle: 'Count 1-bits for 0 to n',
    codeSnippet: `def countBits(n):
    dp = [0] * (n + 1)
    offset = 1
    for i in range(1, n + 1):
        if offset * 2 == i:
            offset = i
        dp[i] = 1 + dp[i - offset]
    return dp`,
  }),
  createConfig(t, {
    algorithmId: 'reverse-bits',
    title: 'Reverse Bits',
    subtitle: 'Reverse bits of 32-bit integer',
    codeSnippet: `def reverseBits(n):
    result = 0
    for i in range(32):
        bit = (n >> i) & 1
        result |= bit << (31 - i)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'missing-number',
    title: 'Missing Number',
    subtitle: 'Find missing number in [0, n]',
    codeSnippet: `def missingNumber(nums):
    result = len(nums)
    for i in range(len(nums)):
        result ^= i ^ nums[i]
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'sum-of-two-integers',
    title: 'Sum of Two Integers',
    subtitle: 'Add without + or - operator',
    codeSnippet: `def getSum(a, b):
    MASK = 0xFFFFFFFF
    MAX = 0x7FFFFFFF
    while b & MASK:
        carry = (a & b) << 1
        a = a ^ b
        b = carry
    return a & MASK if a > MAX else a`,
  }),
  createConfig(t, {
    algorithmId: 'reverse-integer',
    title: 'Reverse Integer',
    subtitle: 'Reverse digits of integer',
    codeSnippet: `def reverse(x):
    MIN, MAX = -2**31, 2**31 - 1
    result = 0
    while x:
        digit = int(math.fmod(x, 10))
        x = int(x / 10)
        if (result > MAX // 10 or
            result < MIN // 10):
            return 0
        result = result * 10 + digit
    return result`,
  }),
];
