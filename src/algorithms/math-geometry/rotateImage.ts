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

function runRotateImageLayerRotation(input: unknown): AlgorithmStep[] {
  const matrix = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const n = matrix.length;

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Rotating layer by layer',
    },
    highlights: [],
    message: `Rotate ${n}x${n} matrix in concentric layers: each cell moves 4 positions in one cycle, so every element is placed exactly once.`,
    codeLine: 1,
  } as AlgorithmStep);

  for (let layer = 0; layer < Math.floor(n / 2); layer++) {
    const first = layer;
    const last = n - 1 - layer;

    steps.push({
      state: {
        matrix: matrix.map(row => [...row]),
        matrixHighlights: [],
        matrixSecondary: [
          ...Array.from({ length: last - first + 1 }, (_, k) => [first, first + k] as [number, number]),
          ...Array.from({ length: last - first + 1 }, (_, k) => [last, first + k] as [number, number]),
          ...Array.from({ length: last - first - 1 }, (_, k) => [first + 1 + k, first] as [number, number]),
          ...Array.from({ length: last - first - 1 }, (_, k) => [first + 1 + k, last] as [number, number]),
        ],
        result: `Layer ${layer}: ring from (${first},${first}) to (${last},${last})`,
      },
      highlights: [],
      message: `Layer ${layer}: rotate the ring bounded by rows/cols ${first}..${last}. Each edge has ${last - first} cells to cycle.`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);

    for (let i = first; i < last; i++) {
      const offset = i - first;
      const cells: [number, number][] = [
        [first, i],
        [last - offset, first],
        [last, last - offset],
        [i, last],
      ];

      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: cells.map(c => [...c] as [number, number]),
          matrixSecondary: [],
          result: `4-way cycle at offset ${offset}`,
        },
        highlights: [],
        message: `Cycle 4 cells: top (${first},${i})=${matrix[first][i]} <- left (${last - offset},${first})=${matrix[last - offset][first]} <- bottom (${last},${last - offset})=${matrix[last][last - offset]} <- right (${i},${last})=${matrix[i][last]} <- top.`,
        codeLine: 7,
        action: 'compare',
      } as AlgorithmStep);

      const top = matrix[first][i];
      matrix[first][i] = matrix[last - offset][first];
      matrix[last - offset][first] = matrix[last][last - offset];
      matrix[last][last - offset] = matrix[i][last];
      matrix[i][last] = top;

      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: cells.map(c => [...c] as [number, number]),
          matrixSecondary: [],
          result: `Cycle complete for offset ${offset}`,
        },
        highlights: [],
        message: `After the 4-way swap each of the 4 cells landed in its rotated position — no extra memory beyond one temp variable.`,
        codeLine: 11,
        action: 'swap',
      } as AlgorithmStep);
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
    message: `Done! All layers rotated — matrix turned 90 degrees clockwise in a single pass over each ring.`,
    codeLine: 11,
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
    java: `public static void rotate(int[][] matrix) {
    int n = matrix.length;
    // Transpose
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
    // Reverse each row
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n / 2; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[i][n - 1 - j];
            matrix[i][n - 1 - j] = temp;
        }
    }
}`,
  },
  defaultInput: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  run: runRotateImage,
  optimalApproachName: 'Transpose + Reverse Rows',
  approaches: [
    {
      id: 'layer-by-layer-rotation',
      name: 'Layer-by-Layer Rotation',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of two passes (transpose, then reverse), rotate each concentric ring directly with a four-way cyclic swap, placing every element in its final position in one pass.',
      code: {
        python: `def rotate(matrix):
    n = len(matrix)
    for layer in range(n // 2):
        first, last = layer, n - 1 - layer
        for i in range(first, last):
            offset = i - first
            top = matrix[first][i]
            matrix[first][i] = matrix[last - offset][first]
            matrix[last - offset][first] = matrix[last][last - offset]
            matrix[last][last - offset] = matrix[i][last]
            matrix[i][last] = top`,
        javascript: `function rotate(matrix) {
    const n = matrix.length;
    for (let layer = 0; layer < Math.floor(n / 2); layer++) {
        const first = layer, last = n - 1 - layer;
        for (let i = first; i < last; i++) {
            const offset = i - first;
            const top = matrix[first][i];
            matrix[first][i] = matrix[last - offset][first];
            matrix[last - offset][first] = matrix[last][last - offset];
            matrix[last][last - offset] = matrix[i][last];
            matrix[i][last] = top;
        }
    }
}`,
        java: `public static void rotate(int[][] matrix) {
    int n = matrix.length;
    for (int layer = 0; layer < n / 2; layer++) {
        int first = layer, last = n - 1 - layer;
        for (int i = first; i < last; i++) {
            int offset = i - first;
            int top = matrix[first][i];
            matrix[first][i] = matrix[last - offset][first];
            matrix[last - offset][first] = matrix[last][last - offset];
            matrix[last][last - offset] = matrix[i][last];
            matrix[i][last] = top;
        }
    }
}`,
      },
      run: runRotateImageLayerRotation,
      lineExplanations: {
        python: {
          1: 'Define function taking matrix',
          2: 'Get matrix dimension n',
          3: 'Process each concentric layer (ring), outermost first',
          4: 'Layer bounds: first row/col and last row/col of the ring',
          5: 'Walk the top edge of the ring (last cell belongs to the next cycle)',
          6: 'Offset of this cell from the layer start',
          7: 'Save the top cell — the cycle overwrites it first',
          8: 'Top gets the left-edge value',
          9: 'Left gets the bottom-edge value',
          10: 'Bottom gets the right-edge value',
          11: 'Right gets the saved top value — 4-cycle done',
        },
        javascript: {
          1: 'Define function taking matrix',
          2: 'Get matrix dimension n',
          3: 'Process each concentric layer (ring), outermost first',
          4: 'Layer bounds: first row/col and last row/col of the ring',
          5: 'Walk the top edge of the ring',
          6: 'Offset of this cell from the layer start',
          7: 'Save the top cell — the cycle overwrites it first',
          8: 'Top gets the left-edge value',
          9: 'Left gets the bottom-edge value',
          10: 'Bottom gets the right-edge value',
          11: 'Right gets the saved top value — 4-cycle done',
        },
        java: {
          1: 'Define method taking matrix',
          2: 'Get matrix dimension n',
          3: 'Process each concentric layer (ring), outermost first',
          4: 'Layer bounds: first row/col and last row/col of the ring',
          5: 'Walk the top edge of the ring',
          6: 'Offset of this cell from the layer start',
          7: 'Save the top cell — the cycle overwrites it first',
          8: 'Top gets the left-edge value',
          9: 'Left gets the bottom-edge value',
          10: 'Bottom gets the right-edge value',
          11: 'Right gets the saved top value — 4-cycle done',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking matrix',
      2: 'Get matrix dimension n',
      3: 'Step 1: Transpose the matrix',
      4: 'Iterate over rows',
      5: 'Only swap above the diagonal (j > i)',
      6: 'Swap matrix[i][j] with matrix[j][i]',
      7: 'Step 2: Reverse each row',
      8: 'Iterate over rows',
      9: 'Reverse the row in place',
    },
    javascript: {
      1: 'Define function taking matrix',
      2: 'Get matrix dimension n',
      3: 'Step 1: Transpose the matrix',
      4: 'Iterate over rows',
      5: 'Only swap above the diagonal (j > i)',
      6: 'Destructuring swap of [i][j] and [j][i]',
      8: 'Step 2: Reverse each row',
      9: 'Iterate over rows',
      10: 'Reverse the row in place',
    },
    java: {
      1: 'Define method taking matrix',
      2: 'Get matrix dimension n',
      3: 'Step 1: Transpose the matrix',
      4: 'Iterate over rows',
      5: 'Only swap above the diagonal',
      6: 'Store matrix[i][j] in temp',
      7: 'Set matrix[i][j] to matrix[j][i]',
      8: 'Set matrix[j][i] to temp',
      10: 'Step 2: Reverse each row',
      11: 'Iterate over rows',
      12: 'Use two pointers to swap from ends',
      13: 'Store left element in temp',
      14: 'Set left to right mirror element',
      15: 'Set right mirror to temp',
    },
  },
};
