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

function runWordLadderBidirectional(input: unknown): AlgorithmStep[] {
  const { beginWord, endWord, wordList } = input as {
    beginWord: string;
    endWord: string;
    wordList: string[];
  };
  const steps: AlgorithmStep[] = [];
  const wordSet = new Set(wordList);

  steps.push({
    state: {
      result: `Begin: "${beginWord}" <-> End: "${endWord}"`,
      hashMap: { beginWord, endWord, wordListSize: `${wordList.length}` },
      queue: [],
    },
    highlights: [],
    message: `Bidirectional BFS: grow one frontier from "${beginWord}" and another from "${endWord}" simultaneously. Two half-depth searches are exponentially smaller than one full-depth search.`,
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

  let front = new Set<string>([beginWord]);
  let back = new Set<string>([endWord]);
  let frontLabel = 'begin';
  let backLabel = 'end';
  const visited = new Set<string>([beginWord, endWord]);
  let level = 1;

  function roleMap(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const w of visited) map[w] = 'visited';
    for (const w of back) map[w] = `${backLabel} frontier`;
    for (const w of front) map[w] = `${frontLabel} frontier`;
    return map;
  }

  steps.push({
    state: {
      result: `Level: ${level}`,
      hashMap: roleMap(),
      queue: [...front],
    },
    highlights: [],
    message: `Two frontiers: {${beginWord}} grows forward, {${endWord}} grows backward. They will meet in the middle.`,
    codeLine: 5,
    action: 'push',
  } as AlgorithmStep);

  let answer = 0;

  outer: while (front.size > 0 && back.size > 0) {
    if (front.size > back.size) {
      [front, back] = [back, front];
      [frontLabel, backLabel] = [backLabel, frontLabel];

      steps.push({
        state: {
          result: `Swapped: expanding "${frontLabel}" side (${front.size} word(s))`,
          hashMap: roleMap(),
          queue: [...front],
        },
        highlights: [],
        message: `The "${frontLabel}" frontier (${front.size}) is smaller than the "${backLabel}" frontier (${back.size}) — always expand the smaller side to keep the search tree tiny.`,
        codeLine: 11,
      } as AlgorithmStep);
    }

    const nextSet = new Set<string>();

    for (const word of front) {
      const chars = word.split('');
      for (let i = 0; i < chars.length; i++) {
        const originalChar = chars[i];
        for (let charCode = 97; charCode <= 122; charCode++) {
          const newChar = String.fromCharCode(charCode);
          if (newChar === originalChar) continue;
          chars[i] = newChar;
          const newWord = chars.join('');

          if (back.has(newWord)) {
            answer = level + 1;
            steps.push({
              state: {
                result: `Frontiers meet! Length = ${answer}`,
                hashMap: roleMap(),
                queue: [...front],
              },
              highlights: [],
              message: `"${word}" (${frontLabel} side) transforms into "${newWord}" — which is on the ${backLabel} frontier! The searches meet: total length = ${answer}.`,
              codeLine: 18,
              action: 'found',
            } as AlgorithmStep);
            break outer;
          }

          if (wordSet.has(newWord) && !visited.has(newWord)) {
            visited.add(newWord);
            nextSet.add(newWord);
            steps.push({
              state: {
                result: `"${newWord}" joins the ${frontLabel} frontier`,
                hashMap: { ...roleMap(), [newWord]: 'new' },
                queue: [...nextSet],
              },
              highlights: [],
              message: `"${word}" -> "${newWord}" (pos ${i}: '${originalChar}'->'${newChar}') is a valid unvisited word. Add it to the next ${frontLabel}-side frontier.`,
              codeLine: 21,
              action: 'push',
            } as AlgorithmStep);
          }

          chars[i] = originalChar;
        }
      }
    }

    front = nextSet;
    level++;

    steps.push({
      state: {
        result: `Level: ${level}, ${frontLabel} frontier: {${[...front].join(', ')}}`,
        hashMap: roleMap(),
        queue: [...front],
      },
      highlights: [],
      message: front.size > 0
        ? `Level ${level}: the ${frontLabel}-side frontier is now {${[...front].join(', ')}}. The ${backLabel} side still holds {${[...back].join(', ')}}.`
        : `The ${frontLabel}-side frontier is empty — the two searches can never meet.`,
      codeLine: 23,
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      result: `Answer: ${answer}`,
      hashMap: roleMap(),
    },
    highlights: [],
    message: answer > 0
      ? `Done! Shortest transformation length = ${answer}. Each side only searched about half the depth — that is the bidirectional speed-up.`
      : `Done! No transformation sequence exists. Return 0.`,
    codeLine: answer > 0 ? 18 : 25,
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
  optimalApproachName: 'Single-direction BFS',
  approaches: [
    {
      id: 'bidirectional-bfs',
      name: 'Bidirectional BFS',
      timeComplexity: 'O(m²·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Searches from beginWord and endWord at the same time, always expanding the smaller frontier — the two half-depth searches meet in the middle, exploring far fewer words than one deep BFS in practice.',
      code: {
        python: `def ladderLength(beginWord, endWord, wordList):
    wordSet = set(wordList)
    if endWord not in wordSet:
        return 0
    begin, end = {beginWord}, {endWord}
    visited = {beginWord, endWord}
    level = 1

    while begin and end:
        if len(begin) > len(end):
            begin, end = end, begin
        nextSet = set()
        for word in begin:
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    newWord = word[:i] + c + word[i+1:]
                    if newWord in end:
                        return level + 1
                    if newWord in wordSet and newWord not in visited:
                        visited.add(newWord)
                        nextSet.add(newWord)
        begin = nextSet
        level += 1

    return 0`,
        javascript: `function ladderLength(beginWord, endWord, wordList) {
    const wordSet = new Set(wordList);
    if (!wordSet.has(endWord)) return 0;
    let begin = new Set([beginWord]);
    let end = new Set([endWord]);
    const visited = new Set([beginWord, endWord]);
    let level = 1;

    while (begin.size && end.size) {
        if (begin.size > end.size) [begin, end] = [end, begin];
        const nextSet = new Set();
        for (const word of begin) {
            for (let i = 0; i < word.length; i++) {
                for (let c = 97; c <= 122; c++) {
                    const newWord = word.slice(0, i) +
                        String.fromCharCode(c) + word.slice(i + 1);
                    if (end.has(newWord)) return level + 1;
                    if (wordSet.has(newWord) && !visited.has(newWord)) {
                        visited.add(newWord);
                        nextSet.add(newWord);
                    }
                }
            }
        }
        begin = nextSet;
        level++;
    }
    return 0;
}`,
        java: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> wordSet = new HashSet<>(wordList);
    if (!wordSet.contains(endWord)) return 0;
    Set<String> begin = new HashSet<>(Arrays.asList(beginWord));
    Set<String> end = new HashSet<>(Arrays.asList(endWord));
    Set<String> visited = new HashSet<>(Arrays.asList(beginWord, endWord));
    int level = 1;

    while (!begin.isEmpty() && !end.isEmpty()) {
        if (begin.size() > end.size()) {
            Set<String> tmp = begin; begin = end; end = tmp;
        }
        Set<String> nextSet = new HashSet<>();
        for (String word : begin) {
            for (int i = 0; i < word.length(); i++) {
                char[] chars = word.toCharArray();
                for (char c = 'a'; c <= 'z'; c++) {
                    chars[i] = c;
                    String newWord = new String(chars);
                    if (end.contains(newWord)) return level + 1;
                    if (wordSet.contains(newWord) && !visited.contains(newWord)) {
                        visited.add(newWord);
                        nextSet.add(newWord);
                    }
                }
            }
        }
        begin = nextSet;
        level++;
    }
    return 0;
}`,
      },
      run: runWordLadderBidirectional,
      lineExplanations: {
        python: {
          1: 'Define function with begin, end, and word list',
          2: 'Convert word list to set for O(1) lookup',
          3: 'endWord must be reachable at all',
          4: 'Return 0 if it is not in the list',
          5: 'Two frontiers: one from each end of the ladder',
          6: 'Shared visited set covers both directions',
          7: 'Path length starts at 1 (just beginWord)',
          9: 'Search while both frontiers are alive',
          10: 'Compare frontier sizes...',
          11: '...and always expand the smaller one (huge pruning win)',
          12: 'Next frontier for the side being expanded',
          13: 'Expand every word on the smaller frontier',
          14: 'Try changing each character position',
          15: 'Try all 26 lowercase letters',
          16: 'Build the one-letter-changed candidate',
          17: 'Is the candidate on the OPPOSITE frontier?',
          18: 'The searches meet — total length is level + 1',
          19: 'Valid dictionary word not seen by either side',
          20: 'Mark it visited (shared between directions)',
          21: 'It joins the next frontier of this side',
          22: 'Advance this side to its new frontier',
          23: 'One more level of transformations used',
          25: 'A frontier died out — no ladder exists',
        },
        javascript: {
          1: 'Define function with begin, end, and word list',
          2: 'Convert word list to set for O(1) lookup',
          3: 'Return 0 if endWord is not in the list',
          4: 'Forward frontier starts at beginWord',
          5: 'Backward frontier starts at endWord',
          6: 'Shared visited set covers both directions',
          7: 'Path length starts at 1 (just beginWord)',
          9: 'Search while both frontiers are alive',
          10: 'Always expand the smaller frontier (huge pruning win)',
          11: 'Next frontier for the side being expanded',
          12: 'Expand every word on the smaller frontier',
          13: 'Try changing each character position',
          14: 'Try all 26 lowercase ASCII codes',
          15: 'Build the one-letter-changed candidate...',
          16: '...by splicing in the substituted character',
          17: 'Candidate on the OPPOSITE frontier? Searches meet: level + 1',
          18: 'Valid dictionary word not seen by either side',
          19: 'Mark it visited (shared between directions)',
          20: 'It joins the next frontier of this side',
          25: 'Advance this side to its new frontier',
          26: 'One more level of transformations used',
          28: 'A frontier died out — no ladder exists',
        },
        java: {
          1: 'Define method with begin, end, and word list',
          2: 'Convert word list to HashSet for O(1) lookup',
          3: 'Return 0 if endWord is not in the list',
          4: 'Forward frontier starts at beginWord',
          5: 'Backward frontier starts at endWord',
          6: 'Shared visited set covers both directions',
          7: 'Path length starts at 1 (just beginWord)',
          9: 'Search while both frontiers are alive',
          10: 'Compare frontier sizes...',
          11: '...and swap so we always expand the smaller one',
          13: 'Next frontier for the side being expanded',
          14: 'Expand every word on the smaller frontier',
          15: 'Try changing each character position',
          16: 'Convert word to char array for mutation',
          17: 'Try all 26 lowercase letters',
          18: 'Substitute the character at position i',
          19: 'Build the one-letter-changed candidate',
          20: 'Candidate on the OPPOSITE frontier? Searches meet: level + 1',
          21: 'Valid dictionary word not seen by either side',
          22: 'Mark it visited (shared between directions)',
          23: 'It joins the next frontier of this side',
          28: 'Advance this side to its new frontier',
          29: 'One more level of transformations used',
          31: 'A frontier died out — no ladder exists',
        },
      },
    },
  ],
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
