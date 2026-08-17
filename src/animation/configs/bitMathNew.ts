import { createConfig, bitManipulationTemplate, mathGeometryTemplate } from '../templates';

const bit = bitManipulationTemplate;
const math = mathGeometryTemplate;

export const bitMathNewConfigs = [
  createConfig(bit, {
    algorithmId: 'bitwise-and-numbers-range',
    title: 'Bitwise AND of Numbers Range',
    subtitle: 'Shift both ends until they agree — the common prefix',
    codeSnippet: `def rangeBitwiseAnd(left, right):
    shift = 0
    while left < right:
        left >>= 1
        right >>= 1
        shift += 1
    return left << shift`,
  }),
  createConfig(bit, {
    algorithmId: 'add-binary',
    title: 'Add Binary',
    subtitle: 'Two pointers from the right, carrying as you go',
    codeSnippet: `def addBinary(a, b):
    result = []
    carry = 0
    i, j = len(a) - 1, len(b) - 1
    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += int(a[i])
            i -= 1
        if j >= 0:
            total += int(b[j])
            j -= 1
        result.append(str(total % 2))
        carry = total // 2
    return ''.join(reversed(result))`,
  }),
  createConfig(bit, {
    algorithmId: 'minimum-array-end',
    title: 'Minimum Array End',
    subtitle: 'Write the bits of n-1 into the zero bits of x',
    codeSnippet: `def minEnd(n, x):
    result = x
    remaining = n - 1
    bit = 0
    while remaining:
        if ((x >> bit) & 1) == 0:
            if remaining & 1:
                result |= 1 << bit
            remaining >>= 1
        bit += 1
    return result`,
  }),
  createConfig(math, {
    algorithmId: 'excel-sheet-column-title',
    title: 'Excel Sheet Column Title',
    subtitle: 'Base-26 with no zero digit — subtract 1 each round',
    codeSnippet: `def convertToTitle(columnNumber):
    result = []
    while columnNumber > 0:
        columnNumber -= 1
        result.append(chr(ord('A') + columnNumber % 26))
        columnNumber //= 26
    return ''.join(reversed(result))`,
  }),
  createConfig(math, {
    algorithmId: 'gcd-of-strings',
    title: 'Greatest Common Divisor of Strings',
    subtitle: 'Concatenation test, then gcd of the two lengths',
    codeSnippet: `def gcdOfStrings(str1, str2):
    if str1 + str2 != str2 + str1:
        return ""
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return a
    return str1[:gcd(len(str1), len(str2))]`,
  }),
  createConfig(math, {
    algorithmId: 'transpose-matrix',
    title: 'Transpose Matrix',
    subtitle: 'Cell (i, j) becomes (j, i) — the shape flips too',
    codeSnippet: `def transpose(matrix):
    m, n = len(matrix), len(matrix[0])
    result = [[0] * m for _ in range(n)]
    for i in range(m):
        for j in range(n):
            result[j][i] = matrix[i][j]
    return result`,
  }),
  createConfig(math, {
    algorithmId: 'roman-to-integer',
    title: 'Roman to Integer',
    subtitle: 'Peek at the next symbol to catch subtractive pairs',
    codeSnippet: `def romanToInt(s):
    pairs = {"IV": 4, "IX": 9, "XL": 40, "XC": 90, "CD": 400, "CM": 900}
    singles = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    i = 0
    while i < len(s):
        if s[i:i+2] in pairs:
            total += pairs[s[i:i+2]]
            i += 2
        else:
            total += singles[s[i]]
            i += 1
    return total`,
  }),
  createConfig(math, {
    algorithmId: 'insert-gcd-linked-list',
    title: 'Insert Greatest Common Divisors in Linked List',
    subtitle: 'Splice a gcd node between each adjacent pair',
    codeSnippet: `from math import gcd

def insertGreatestCommonDivisors(head):
    curr = head
    while curr.next:
        g = gcd(curr.val, curr.next.val)
        curr.next = ListNode(g, curr.next)
        curr = curr.next.next
    return head`,
  }),
];
