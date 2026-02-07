import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runAlienDictionary(input: unknown): AlgorithmStep[] {
  const words = input as string[];
  const steps: AlgorithmStep[] = [];

  // Collect all unique characters
  const allChars = new Set<string>();
  for (const word of words) {
    for (const ch of word) allChars.add(ch);
  }

  // Build adjacency list and in-degree map
  const adj: Record<string, Set<string>> = {};
  const inDegree: Record<string, number> = {};
  for (const ch of allChars) {
    adj[ch] = new Set();
    inDegree[ch] = 0;
  }

  let invalid = false;

  steps.push({
    state: {
      graph: { nodes: Array.from(allChars), edges: [] },
      graphDirected: true,
      graphHighlights: [],
      graphVisitedEdges: [],
      chars: [...words],
      result: 'Building character ordering graph...',
    },
    highlights: [],
    message: `Words: [${words.join(', ')}]. Extract character ordering from adjacent word pairs.`,
    codeLine: 1,
  } as AlgorithmStep);

  const graphEdges: { from: string; to: string }[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);

    // Check invalid case: w1 is prefix of w2 but longer
    if (w1.length > w2.length && w1.startsWith(w2)) {
      invalid = true;
      steps.push({
        state: {
          graph: { nodes: Array.from(allChars), edges: graphEdges.map(e => ({ ...e })) },
          graphDirected: true,
          graphHighlights: [],
          graphVisitedEdges: [],
          chars: [...words],
          result: 'Invalid ordering!',
        },
        highlights: [i, i + 1],
        message: `"${w1}" is longer than "${w2}" but "${w2}" is a prefix of "${w1}". Invalid!`,
        codeLine: 3,
        action: 'compare',
      } as AlgorithmStep);
      break;
    }

    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        if (!adj[w1[j]].has(w2[j])) {
          adj[w1[j]].add(w2[j]);
          inDegree[w2[j]]++;
          graphEdges.push({ from: w1[j], to: w2[j] });

          steps.push({
            state: {
              graph: { nodes: Array.from(allChars), edges: graphEdges.map(e => ({ ...e })) },
              graphDirected: true,
              graphHighlights: [w1[j], w2[j]],
              graphVisitedEdges: [{ from: w1[j], to: w2[j] }],
              chars: [...words],
              result: `Edge: ${w1[j]} -> ${w2[j]}`,
            },
            highlights: [i, i + 1],
            message: `Comparing "${w1}" and "${w2}": first diff at index ${j}: '${w1[j]}' < '${w2[j]}'. Add edge ${w1[j]} -> ${w2[j]}.`,
            codeLine: 5,
            action: 'insert',
          } as AlgorithmStep);
        }
        break;
      }
    }
  }

  if (invalid) {
    steps.push({
      state: {
        graph: { nodes: Array.from(allChars), edges: graphEdges.map(e => ({ ...e })) },
        graphDirected: true,
        graphHighlights: [],
        graphVisitedEdges: [],
        chars: [...words],
        result: 'Result: "" (invalid)',
      },
      highlights: [],
      message: 'Invalid ordering detected. Return empty string.',
      codeLine: 13,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  // Topological sort (BFS / Kahn's)
  const queue: string[] = [];
  for (const ch of allChars) {
    if (inDegree[ch] === 0) queue.push(ch);
  }
  queue.sort(); // Lexical order for determinism

  steps.push({
    state: {
      graph: { nodes: Array.from(allChars), edges: graphEdges.map(e => ({ ...e })) },
      graphDirected: true,
      graphHighlights: [...queue],
      graphVisitedEdges: [],
      queue: [...queue],
      result: `Starting BFS topological sort...`,
    },
    highlights: [],
    message: `Topological sort: characters with in-degree 0: [${queue.join(', ')}].`,
    codeLine: 7,
  } as AlgorithmStep);

  const order: string[] = [];
  const visitedEdgesViz: { from: string; to: string }[] = [];

  while (queue.length > 0) {
    const ch = queue.shift()!;
    order.push(ch);

    steps.push({
      state: {
        graph: { nodes: Array.from(allChars), edges: graphEdges.map(e => ({ ...e })) },
        graphDirected: true,
        graphHighlights: [ch],
        graphVisitedEdges: visitedEdgesViz.map(e => ({ ...e })),
        queue: [...queue],
        result: `Order so far: ${order.join('')}`,
      },
      highlights: [],
      message: `Dequeue '${ch}'. Add to result. Order so far: "${order.join('')}".`,
      codeLine: 9,
      action: 'pop',
    } as AlgorithmStep);

    const neighbors = Array.from(adj[ch]).sort();
    for (const neighbor of neighbors) {
      inDegree[neighbor]--;
      visitedEdgesViz.push({ from: ch, to: neighbor });

      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
        queue.sort();

        steps.push({
          state: {
            graph: { nodes: Array.from(allChars), edges: graphEdges.map(e => ({ ...e })) },
            graphDirected: true,
            graphHighlights: [neighbor],
            graphVisitedEdges: visitedEdgesViz.map(e => ({ ...e })),
            queue: [...queue],
            result: `Order so far: ${order.join('')}`,
          },
          highlights: [],
          message: `'${neighbor}' in-degree becomes 0. Add to queue.`,
          codeLine: 10,
          action: 'push',
        } as AlgorithmStep);
      }
    }
  }

  const hasCycle = order.length !== allChars.size;
  const result = hasCycle ? '' : order.join('');

  steps.push({
    state: {
      graph: { nodes: Array.from(allChars), edges: graphEdges.map(e => ({ ...e })) },
      graphDirected: true,
      graphHighlights: [],
      graphVisitedEdges: visitedEdgesViz.map(e => ({ ...e })),
      result: hasCycle ? 'Result: "" (cycle detected)' : `Alien alphabet: "${result}"`,
    },
    highlights: [],
    message: hasCycle
      ? `Cycle detected! Only ${order.length}/${allChars.size} chars processed. Return "".`
      : `Done! Alien dictionary order: "${result}".`,
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const alienDictionary: Algorithm = {
  id: 'alien-dictionary',
  name: 'Alien Dictionary',
  category: 'Advanced Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(C)',
  spaceComplexity: 'O(V+E)',
  pattern: 'Topological Sort — compare adjacent words for char ordering',
  description:
    'There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you. You are given a list of strings words from the alien language\'s dictionary, where the strings in words are sorted lexicographically by the rules of this new language. Derive the order of letters in this language.',
  problemUrl: 'https://leetcode.com/problems/alien-dictionary/',
  code: {
    python: `def alienOrder(words):
    adj = {c: set() for w in words for c in w}
    in_degree = {c: 0 for c in adj}

    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i+1]
        minLen = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:minLen] == w2[:minLen]:
            return ""
        for j in range(minLen):
            if w1[j] != w2[j]:
                if w2[j] not in adj[w1[j]]:
                    adj[w1[j]].add(w2[j])
                    in_degree[w2[j]] += 1
                break

    queue = deque([c for c in in_degree if in_degree[c] == 0])
    result = []
    while queue:
        c = queue.popleft()
        result.append(c)
        for nei in adj[c]:
            in_degree[nei] -= 1
            if in_degree[nei] == 0:
                queue.append(nei)

    return "".join(result) if len(result) == len(adj) else ""`,
    javascript: `function alienOrder(words) {
    const adj = {}, inDegree = {};
    for (const w of words)
        for (const c of w) { adj[c] = new Set(); inDegree[c] = 0; }

    for (let i = 0; i < words.length - 1; i++) {
        const [w1, w2] = [words[i], words[i+1]];
        const minLen = Math.min(w1.length, w2.length);
        if (w1.length > w2.length && w1.startsWith(w2)) return "";
        for (let j = 0; j < minLen; j++) {
            if (w1[j] !== w2[j]) {
                if (!adj[w1[j]].has(w2[j])) {
                    adj[w1[j]].add(w2[j]);
                    inDegree[w2[j]]++;
                }
                break;
            }
        }
    }

    const queue = Object.keys(inDegree).filter(c => inDegree[c] === 0);
    const result = [];
    while (queue.length) {
        const c = queue.shift();
        result.push(c);
        for (const nei of adj[c]) {
            inDegree[nei]--;
            if (inDegree[nei] === 0) queue.push(nei);
        }
    }
    return result.length === Object.keys(adj).length ? result.join("") : "";
}`,
    java: `public String alienOrder(String[] words) {
    Map<Character, Set<Character>> adj = new HashMap<>();
    Map<Character, Integer> inDegree = new HashMap<>();
    for (String w : words) {
        for (char c : w.toCharArray()) {
            adj.putIfAbsent(c, new HashSet<>());
            inDegree.putIfAbsent(c, 0);
        }
    }

    for (int i = 0; i < words.length - 1; i++) {
        String w1 = words[i], w2 = words[i + 1];
        int minLen = Math.min(w1.length(), w2.length());
        if (w1.length() > w2.length() && w1.substring(0, minLen).equals(w2.substring(0, minLen))) {
            return "";
        }
        for (int j = 0; j < minLen; j++) {
            if (w1.charAt(j) != w2.charAt(j)) {
                if (!adj.get(w1.charAt(j)).contains(w2.charAt(j))) {
                    adj.get(w1.charAt(j)).add(w2.charAt(j));
                    inDegree.put(w2.charAt(j), inDegree.get(w2.charAt(j)) + 1);
                }
                break;
            }
        }
    }

    Queue<Character> queue = new LinkedList<>();
    for (char c : inDegree.keySet()) {
        if (inDegree.get(c) == 0) queue.offer(c);
    }

    StringBuilder result = new StringBuilder();
    while (!queue.isEmpty()) {
        char c = queue.poll();
        result.append(c);
        for (char nei : adj.get(c)) {
            inDegree.put(nei, inDegree.get(nei) - 1);
            if (inDegree.get(nei) == 0) queue.offer(nei);
        }
    }
    return result.length() == adj.size() ? result.toString() : "";
}`,
  },
  defaultInput: ['wrt', 'wrf', 'er', 'ett', 'rftt'],
  run: runAlienDictionary,
};
