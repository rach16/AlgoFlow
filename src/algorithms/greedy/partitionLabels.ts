import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPartitionLabels(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  steps.push({
    state: {
      chars: [...chars],
      result: 'Finding partition sizes...',
    },
    highlights: [],
    message: `Partition "${s}" so each letter appears in at most one part. Find last occurrence of each char.`,
    codeLine: 1,
  });

  // Find last occurrence of each character
  const lastIndex: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    lastIndex[s[i]] = i;
  }

  steps.push({
    state: {
      chars: [...chars],
      hashMap: { ...lastIndex },
      result: 'Last occurrences computed',
    },
    highlights: [],
    message: `Last occurrences: ${Object.entries(lastIndex).map(([k, v]) => `${k}:${v}`).join(', ')}.`,
    codeLine: 2,
    action: 'visit',
  });

  const partitions: number[] = [];
  let partStart = 0;
  let partEnd = 0;

  for (let i = 0; i < s.length; i++) {
    partEnd = Math.max(partEnd, lastIndex[s[i]]);

    // Highlight current partition range
    const partHighlights: number[] = [];
    for (let j = partStart; j <= Math.min(partEnd, s.length - 1); j++) partHighlights.push(j);

    steps.push({
      state: {
        chars: [...chars],
        hashMap: { ...lastIndex },
        result: `Partitions: [${partitions.join(', ')}]`,
      },
      highlights: partHighlights,
      pointers: { i, partStart, partEnd },
      message: `i=${i}, char='${s[i]}', last occurrence=${lastIndex[s[i]]}. Partition end = max(${partEnd}, ${lastIndex[s[i]]}) = ${partEnd}.`,
      codeLine: 4,
      action: 'compare',
    });

    if (i === partEnd) {
      const size = partEnd - partStart + 1;
      partitions.push(size);

      const finishedHighlights: number[] = [];
      for (let j = partStart; j <= partEnd; j++) finishedHighlights.push(j);

      steps.push({
        state: {
          chars: [...chars],
          hashMap: { ...lastIndex },
          result: `Partitions: [${partitions.join(', ')}]`,
        },
        highlights: finishedHighlights,
        pointers: { i, partStart, partEnd },
        message: `i == partEnd (${partEnd}). Partition complete! Size = ${size}. "${s.substring(partStart, partEnd + 1)}"`,
        codeLine: 6,
        action: 'found',
      });

      partStart = i + 1;
    }
  }

  steps.push({
    state: {
      chars: [...chars],
      result: `Partitions: [${partitions.join(', ')}]`,
    },
    highlights: [],
    message: `Done! Partition sizes: [${partitions.join(', ')}]. Total ${partitions.length} partitions.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const partitionLabels: Algorithm = {
  id: 'partition-labels',
  name: 'Partition Labels',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — track last occurrence, extend partition to cover all',
  description:
    'You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.',
  problemUrl: 'https://leetcode.com/problems/partition-labels/',
  code: {
    python: `def partitionLabels(s):
    lastIndex = {}
    for i, c in enumerate(s):
        lastIndex[c] = i

    result = []
    size, end = 0, 0
    for i, c in enumerate(s):
        size += 1
        end = max(end, lastIndex[c])
        if i == end:
            result.append(size)
            size = 0

    return result`,
    javascript: `function partitionLabels(s) {
    const lastIndex = {};
    for (let i = 0; i < s.length; i++)
        lastIndex[s[i]] = i;

    const result = [];
    let size = 0, end = 0;
    for (let i = 0; i < s.length; i++) {
        size++;
        end = Math.max(end, lastIndex[s[i]]);
        if (i === end) {
            result.push(size);
            size = 0;
        }
    }
    return result;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: 'ababcbacadefegdehijhklij',
  run: runPartitionLabels,
};
