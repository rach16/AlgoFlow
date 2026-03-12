import { createConfig, mathGeometryTemplate } from '../templates';

const t = mathGeometryTemplate;

export const mathGeometryConfigs = [
  createConfig(t, {
    algorithmId: 'rotate-image',
    title: 'Rotate Image',
    subtitle: 'Rotate matrix 90 degrees clockwise',
    codeSnippet: `def rotate(matrix):
    l, r = 0, len(matrix) - 1
    while l < r:
        for i in range(r - l):
            top, bottom = l, r
            topLeft = matrix[top][l + i]
            matrix[top][l + i] = matrix[bottom - i][l]
            matrix[bottom - i][l] = matrix[bottom][r - i]
            matrix[bottom][r - i] = matrix[top + i][r]
            matrix[top + i][r] = topLeft
        l += 1
        r -= 1`,
  }),
  createConfig(t, {
    algorithmId: 'spiral-matrix',
    title: 'Spiral Matrix',
    subtitle: 'Traverse matrix in spiral order',
    codeSnippet: `def spiralOrder(matrix):
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for i in range(left, right + 1):
            result.append(matrix[top][i])
        top += 1
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for i in range(right, left - 1, -1):
                result.append(matrix[bottom][i])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'set-matrix-zeroes',
    title: 'Set Matrix Zeroes',
    subtitle: 'Set row/col to 0 if element is 0',
    codeSnippet: `def setZeroes(matrix):
    ROWS, COLS = len(matrix), len(matrix[0])
    rowZero = False
    for r in range(ROWS):
        for c in range(COLS):
            if matrix[r][c] == 0:
                matrix[0][c] = 0
                if r > 0:
                    matrix[r][0] = 0
                else:
                    rowZero = True
    for r in range(1, ROWS):
        for c in range(1, COLS):
            if matrix[0][c] == 0 or matrix[r][0] == 0:
                matrix[r][c] = 0
    if matrix[0][0] == 0:
        for r in range(ROWS):
            matrix[r][0] = 0
    if rowZero:
        for c in range(COLS):
            matrix[0][c] = 0`,
  }),
  createConfig(t, {
    algorithmId: 'happy-number',
    title: 'Happy Number',
    subtitle: 'Check if number reaches 1',
    codeSnippet: `def isHappy(n):
    seen = set()
    while n not in seen:
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
        if n == 1:
            return True
    return False`,
  }),
  createConfig(t, {
    algorithmId: 'plus-one',
    title: 'Plus One',
    subtitle: 'Add one to number as digit array',
    codeSnippet: `def plusOne(digits):
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits`,
  }),
  createConfig(t, {
    algorithmId: 'pow-x-n',
    title: 'Pow(x, n)',
    subtitle: 'Calculate x raised to power n',
    codeSnippet: `def myPow(x, n):
    def helper(x, n):
        if x == 0: return 0
        if n == 0: return 1
        res = helper(x * x, n // 2)
        return x * res if n % 2 else res
    res = helper(x, abs(n))
    return res if n >= 0 else 1 / res`,
  }),
  createConfig(t, {
    algorithmId: 'multiply-strings',
    title: 'Multiply Strings',
    subtitle: 'Multiply two numbers as strings',
    codeSnippet: `def multiply(num1, num2):
    if num1 == '0' or num2 == '0':
        return '0'
    result = [0] * (len(num1) + len(num2))
    num1, num2 = num1[::-1], num2[::-1]
    for i in range(len(num1)):
        for j in range(len(num2)):
            digit = int(num1[i]) * int(num2[j])
            result[i + j] += digit
            result[i + j + 1] += result[i + j] // 10
            result[i + j] %= 10
    result = result[::-1]
    beg = 0
    while beg < len(result) and result[beg] == 0:
        beg += 1
    return ''.join(map(str, result[beg:]))`,
  }),
  createConfig(t, {
    algorithmId: 'detect-squares',
    title: 'Detect Squares',
    subtitle: 'Count axis-aligned squares',
    codeSnippet: `class DetectSquares:
    def __init__(self):
        self.ptsCount = defaultdict(int)
        self.pts = []
    def add(self, point):
        self.ptsCount[tuple(point)] += 1
        self.pts.append(point)
    def count(self, point):
        res = 0
        px, py = point
        for x, y in self.pts:
            if abs(py - y) != abs(px - x) or x == px or y == py:
                continue
            res += self.ptsCount[(x, py)] * self.ptsCount[(px, y)]
        return res`,
  }),
];
