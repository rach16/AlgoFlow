import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runWordLadder(input: unknown): AlgorithmStep[] {
  const { beginWord, endWord, wordList } = input as {
    beginWord: string;
    endWord: string;
    wordList: string[];
  };
  const steps: AlgorithmStep[] = [];

  const wordSet = new Set(wordList);

  steps.push({
    state: {
      result: `Begin: "${beginWord}" -> End: "${endWord}"`,
      hashMap: { beginWord, endWord, wordListSize: `${wordList.length}` },
      queue: [],
    },
    highlights: [],
    message: `Find shortest transformation from "${beginWord}" to "${endWord}". Each step changes one letter. BFS approach.`,
    codeLine: 1,
  } as AlgorithmStep);

  if (!wordSet.has(endWord)) {
    steps.push({
      state: {
        result: '0 - endWord not in wordList',
        hashMap: { beginWord, endWord, status: 'not found in list' },
      },
      highlights: [],
      message: `"${endWord}" is not in the word list. Transformation impossible. Return 0.`,
      codeLine: 3,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  // BFS
  const visited = new Set<string>([beginWord]);
  const queue: string[] = [beginWord];
  let level = 1;

  steps.push({
    state: {
      result: `Level: ${level}`,
      hashMap: Object.fromEntries(
        Array.from(visited).map(w => [w, 'visited'])
      ),
      queue: [...queue],
    },
    highlights: [],
    message: `Initialize BFS. Start with "${beginWord}" at level ${level}.`,
    codeLine: 5,
    action: 'push',
  } as AlgorithmStep);

  let found = false;

  while (queue.length > 0 && !found) {
    const levelSize = queue.length;
    level++;

    steps.push({
      state: {
        result: `Level: ${level}, Queue size: ${levelSize}`,
        hashMap: Object.fromEntries(
          Array.from(visited).map(w => [w, 'visited'])
        ),
        queue: [...queue],
      },
      highlights: [],
      message: `--- Level ${level} --- Process ${levelSize} word(s) from the queue.`,
      codeLine: 7,
    } as AlgorithmStep);

    for (let q = 0; q < levelSize; q++) {
      const word = queue.shift()!;
      const chars = word.split('');

      steps.push({
        state: {
          result: `Processing: "${word}"`,
          hashMap: Object.fromEntries(
            Array.from(visited).map(w => [w, w === word ? 'current' : 'visited'])
          ),
          queue: [...queue],
        },
        highlights: [],
        message: `Dequeue "${word}". Try changing each character position.`,
        codeLine: 9,
        action: 'pop',
      } as AlgorithmStep);

      for (let i = 0; i < chars.length; i++) {
        const originalChar = chars[i];

        for (let charCode = 97; charCode <= 122; charCode++) {
          const newChar = String.fromCharCode(charCode);
          if (newChar === originalChar) continue;

          chars[i] = newChar;
          const newWord = chars.join('');

          if (newWord === endWord) {
            found = true;

            steps.push({
              state: {
                result: `Found! Length = ${level}`,
                hashMap: Object.fromEntries(
                  Array.from(visited).map(w => [w, 'visited'])
                ),
                queue: [...queue],
              },
              highlights: [],
              message: `Found endWord "${endWord}"! Changed "${word}" position ${i}: '${originalChar}' -> '${newChar}'. Shortest path length = ${level}.`,
              codeLine: 13,
              action: 'found',
            } as AlgorithmStep);

            break;
          }

          if (wordSet.has(newWord) && !visited.has(newWord)) {
            visited.add(newWord);
            queue.push(newWord);

            steps.push({
              state: {
                result: `Level ${level}: Found "${newWord}"`,
                hashMap: Object.fromEntries(
                  Array.from(visited).map(w => [w, w === newWord ? 'new' : 'visited'])
                ),
                queue: [...queue],
              },
              highlights: [],
              message: `"${newWord}" is in word list! (Changed pos ${i}: '${originalChar}'->'${newChar}'). Add to queue.`,
              codeLine: 11,
              action: 'push',
            } as AlgorithmStep);
          }

          chars[i] = originalChar;
        }

        if (found) break;
      }

      if (found) break;
    }
  }

  const answer = found ? level : 0;

  steps.push({
    state: {
      result: `Answer: ${answer}`,
      hashMap: Object.fromEntries(
        Array.from(visited).map(w => [w, 'visited'])
      ),
    },
    highlights: [],
    message: found
      ? `Done! Shortest transformation sequence length = ${answer}.`
      : `Done! No transformation sequence exists. Return 0.`,
    codeLine: 15,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const wordLadder: Algorithm = {
  id: 'word-ladder',
  name: 'Word Ladder',
  category: 'Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(m²·n)',
  spaceComplexity: 'O(m²·n)',
  pattern: 'BFS — shortest path, try all one-letter transformations',
  description:
    'Given beginWord, endWord, and a word list, find the length of the shortest transformation sequence from beginWord to endWord, changing one letter at a time. Each transformed word must exist in the word list. Return 0 if no sequence exists.',
  problemUrl: 'https://leetcode.com/problems/word-ladder/',
  code: {
    python: `def ladderLength(beginWord, endWord, wordList):
    if endWord not in wordList:
        return 0
    wordSet = set(wordList)
    queue = deque([beginWord])
    visited = set([beginWord])
    level = 1

    while queue:
        for _ in range(len(queue)):
            word = queue.popleft()
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    newWord = word[:i] + c + word[i+1:]
                    if newWord == endWord:
                        return level + 1
                    if newWord in wordSet and newWord not in visited:
                        visited.add(newWord)
                        queue.append(newWord)
        level += 1

    return 0`,
    javascript: `function ladderLength(beginWord, endWord, wordList) {
    if (!wordList.includes(endWord)) return 0;
    const wordSet = new Set(wordList);
    const queue = [beginWord];
    const visited = new Set([beginWord]);
    let level = 1;

    while (queue.length) {
        const size = queue.length;
        for (let q = 0; q < size; q++) {
            const word = queue.shift();
            for (let i = 0; i < word.length; i++) {
                for (let c = 97; c <= 122; c++) {
                    const newWord = word.slice(0,i) +
                        String.fromCharCode(c) + word.slice(i+1);
                    if (newWord === endWord)
                        return level + 1;
                    if (wordSet.has(newWord) && !visited.has(newWord)) {
                        visited.add(newWord);
                        queue.push(newWord);
                    }
                }
            }
        }
        level++;
    }
    return 0;
}`,
    java: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    if (!wordList.contains(endWord)) return 0;
    Set<String> wordSet = new HashSet<>(wordList);
    Queue<String> queue = new LinkedList<>();
    Set<String> visited = new HashSet<>();
    queue.offer(beginWord);
    visited.add(beginWord);
    int level = 1;

    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            String word = queue.poll();
            for (int j = 0; j < word.length(); j++) {
                char[] chars = word.toCharArray();
                for (char c = 'a'; c <= 'z'; c++) {
                    chars[j] = c;
                    String newWord = new String(chars);
                    if (newWord.equals(endWord)) return level + 1;
                    if (wordSet.contains(newWord) && !visited.contains(newWord)) {
                        visited.add(newWord);
                        queue.offer(newWord);
                    }
                }
            }
        }
        level++;
    }
    return 0;
}`,
  },
  defaultInput: {
    beginWord: 'hit',
    endWord: 'cog',
    wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'],
  },
  run: runWordLadder,
  lineExplanations: {
    python: {
      1: 'Define function with begin, end, and word list',
      2: 'Check if endWord exists in word list',
      3: 'Return 0 if endWord not reachable',
      4: 'Convert word list to set for O(1) lookup',
      5: 'Initialize BFS queue with beginWord',
      6: 'Track visited words to avoid revisits',
      7: 'Start at transformation level 1',
      9: 'BFS loop while queue has words',
      10: 'Process all words at current level',
      11: 'Dequeue one word',
      12: 'Try changing each character position',
      13: 'Try all 26 lowercase letters',
      14: 'Build new word with one char changed',
      15: 'If new word is endWord, found shortest',
      16: 'Return level + 1 as path length',
      17: 'If new word exists and not visited',
      18: 'Mark as visited',
      19: 'Add to queue for next level',
      20: 'Increment level after processing all words',
      22: 'No transformation sequence found',
    },
    javascript: {
      1: 'Define function with begin, end, and word list',
      2: 'Return 0 if endWord not in list',
      3: 'Convert list to set for O(1) lookup',
      4: 'Initialize BFS queue with beginWord',
      5: 'Track visited words to avoid revisits',
      6: 'Start at transformation level 1',
      8: 'BFS loop while queue has words',
      9: 'Save current level size',
      10: 'Process all words at current level',
      11: 'Dequeue one word',
      12: 'Try changing each character position',
      13: 'Try all 26 lowercase ASCII codes',
      14: 'Build new word with substituted char',
      15: 'Continue building the new word',
      16: 'If new word is endWord, found shortest',
      17: 'Return level + 1 as path length',
      18: 'If new word exists and not visited',
      19: 'Mark as visited',
      20: 'Add to queue for next level',
      24: 'Increment level after processing all words',
      26: 'No transformation sequence found',
    },
    java: {
      1: 'Define method with begin, end, and word list',
      2: 'Return 0 if endWord not in list',
      3: 'Convert list to HashSet for O(1) lookup',
      4: 'Initialize BFS queue',
      5: 'Track visited words with HashSet',
      6: 'Seed queue with beginWord',
      7: 'Mark beginWord as visited',
      8: 'Start at transformation level 1',
      10: 'BFS loop while queue has words',
      11: 'Save current level size',
      12: 'Process all words at current level',
      13: 'Dequeue one word',
      14: 'Try changing each character position',
      15: 'Convert word to char array for mutation',
      16: 'Try all 26 lowercase letters',
      17: 'Replace character at position j',
      18: 'Build new word from char array',
      19: 'If new word is endWord, found shortest',
      20: 'If new word exists and not visited',
      21: 'Mark as visited',
      22: 'Add to queue for next level',
      27: 'Increment level after processing all words',
      29: 'No transformation sequence found',
    },
  },
};
