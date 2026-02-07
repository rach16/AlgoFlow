import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runRotateImage(input: unknown): AlgorithmStep[] {
  const matrix = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const n = matrix.length;

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Rotating matrix 90 degrees clockwise',
    },
    highlights: [],
    message: `Rotate ${n}x${n} matrix 90 degrees clockwise. Step 1: Transpose. Step 2: Reverse each row.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Step 1: Transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: [[i, j], [j, i]],
          matrixSecondary: [],
          result: 'Transposing...',
        },
        highlights: [],
        message: `Transpose: swap matrix[${i}][${j}]=${matrix[i][j]} with matrix[${j}][${i}]=${matrix[j][i]}.`,
        codeLine: 3,
        action: 'swap',
      } as AlgorithmStep);

      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];

      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: [[i, j], [j, i]],
          matrixSecondary: [],
          result: 'Transposing...',
        },
        highlights: [],
        message: `After swap: matrix[${i}][${j}]=${matrix[i][j]}, matrix[${j}][${i}]=${matrix[j][i]}.`,
        codeLine: 4,
        action: 'swap',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Transpose complete. Now reverse each row.',
    },
    highlights: [],
    message: `Transpose complete. Now reverse each row.`,
    codeLine: 5,
  } as AlgorithmStep);

  // Step 2: Reverse each row
  for (let i = 0; i < n; i++) {
    let left = 0;
    let right = n - 1;
    while (left < right) {
      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: [[i, left], [i, right]],
          matrixSecondary: [],
          result: `Reversing row ${i}`,
        },
        highlights: [],
        message: `Row ${i}: swap col ${left} (${matrix[i][left]}) with col ${right} (${matrix[i][right]}).`,
        codeLine: 7,
        action: 'swap',
      } as AlgorithmStep);

      [matrix[i][left], matrix[i][right]] = [matrix[i][right], matrix[i][left]];
      left++;
      right--;
    }
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Rotation complete!',
    },
    highlights: [],
    message: `Done! Matrix rotated 90 degrees clockwise.`,
    codeLine: 9,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const rotateImage: Algorithm = {
  id: 'rotate-image',
  name: 'Rotate Image',
  category: 'Math & Geometry',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  pattern: 'Matrix — transpose then reverse each row',
  description:
    'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly.',
  problemUrl: 'https://leetcode.com/problems/rotate-image/',
  code: {
    python: `def rotate(matrix):
    n = len(matrix)
    # Transpose
    for i in range(n):
        for j in range(i+1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Reverse each row
    for i in range(n):
        matrix[i].reverse()`,
    javascript: `function rotate(matrix) {
    const n = matrix.length;
    // Transpose
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    // Reverse each row
    for (let i = 0; i < n; i++) {
        matrix[i].reverse();
    }
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  run: runRotateImage,
};
