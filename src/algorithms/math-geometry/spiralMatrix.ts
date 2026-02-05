import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSpiralMatrix(input: unknown): AlgorithmStep[] {
  const matrix = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = matrix.length;
  const cols = matrix[0].length;

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Spiral order: []',
    },
    highlights: [],
    message: `Traverse ${rows}x${cols} matrix in spiral order. Use four boundaries.`,
    codeLine: 1,
  } as AlgorithmStep);

  const result: number[] = [];
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  const visited: [number, number][] = [];

  while (top <= bottom && left <= right) {
    // Move right
    for (let c = left; c <= right; c++) {
      result.push(matrix[top][c]);
      visited.push([top, c]);

      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: visited.map(v => [...v] as [number, number]),
          matrixSecondary: [[top, c]],
          result: `Spiral: [${result.join(', ')}]`,
        },
        highlights: [],
        message: `Right: matrix[${top}][${c}] = ${matrix[top][c]}. Add to result.`,
        codeLine: 3,
        action: 'visit',
      } as AlgorithmStep);
    }
    top++;

    // Move down
    for (let r = top; r <= bottom; r++) {
      result.push(matrix[r][right]);
      visited.push([r, right]);

      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: visited.map(v => [...v] as [number, number]),
          matrixSecondary: [[r, right]],
          result: `Spiral: [${result.join(', ')}]`,
        },
        highlights: [],
        message: `Down: matrix[${r}][${right}] = ${matrix[r][right]}. Add to result.`,
        codeLine: 5,
        action: 'visit',
      } as AlgorithmStep);
    }
    right--;

    // Move left
    if (top <= bottom) {
      for (let c = right; c >= left; c--) {
        result.push(matrix[bottom][c]);
        visited.push([bottom, c]);

        steps.push({
          state: {
            matrix: matrix.map(row => [...row]),
            matrixHighlights: visited.map(v => [...v] as [number, number]),
            matrixSecondary: [[bottom, c]],
            result: `Spiral: [${result.join(', ')}]`,
          },
          highlights: [],
          message: `Left: matrix[${bottom}][${c}] = ${matrix[bottom][c]}. Add to result.`,
          codeLine: 7,
          action: 'visit',
        } as AlgorithmStep);
      }
      bottom--;
    }

    // Move up
    if (left <= right) {
      for (let r = bottom; r >= top; r--) {
        result.push(matrix[r][left]);
        visited.push([r, left]);

        steps.push({
          state: {
            matrix: matrix.map(row => [...row]),
            matrixHighlights: visited.map(v => [...v] as [number, number]),
            matrixSecondary: [[r, left]],
            result: `Spiral: [${result.join(', ')}]`,
          },
          highlights: [],
          message: `Up: matrix[${r}][${left}] = ${matrix[r][left]}. Add to result.`,
          codeLine: 9,
          action: 'visit',
        } as AlgorithmStep);
      }
      left++;
    }
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: visited.map(v => [...v] as [number, number]),
      matrixSecondary: [],
      result: `Spiral: [${result.join(', ')}]`,
    },
    highlights: [],
    message: `Done! Spiral order: [${result.join(', ')}].`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const spiralMatrix: Algorithm = {
  id: 'spiral-matrix',
  name: 'Spiral Matrix',
  category: 'Math & Geometry',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(1)',
  pattern: 'Matrix — shrink boundaries: top, right, bottom, left',
  description:
    'Given an m x n matrix, return all elements of the matrix in spiral order.',
  problemUrl: 'https://leetcode.com/problems/spiral-matrix/',
  code: {
    python: `def spiralOrder(matrix):
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            result.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            result.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                result.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                result.append(matrix[r][left])
            left += 1

    return result`,
    javascript: `function spiralOrder(matrix) {
    const result = [];
    let top = 0, bottom = matrix.length - 1;
    let left = 0, right = matrix[0].length - 1;

    while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c++)
            result.push(matrix[top][c]);
        top++;
        for (let r = top; r <= bottom; r++)
            result.push(matrix[r][right]);
        right--;
        if (top <= bottom) {
            for (let c = right; c >= left; c--)
                result.push(matrix[bottom][c]);
            bottom--;
        }
        if (left <= right) {
            for (let r = bottom; r >= top; r--)
                result.push(matrix[r][left]);
            left++;
        }
    }
    return result;
}`,
  },
  defaultInput: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  run: runSpiralMatrix,
};
