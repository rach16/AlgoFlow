import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type LockInput = { deadends: string[]; target: string };

/** All 8 combos one wheel-turn away, wheel 0..3, up then down. */
function neighbors(combo: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < 4; i++) {
    const d = Number(combo[i]);
    out.push(combo.slice(0, i) + String((d + 1) % 10) + combo.slice(i + 1));
    out.push(combo.slice(0, i) + String((d + 9) % 10) + combo.slice(i + 1));
  }
  return out;
}

function runOpenTheLock(input: unknown): AlgorithmStep[] {
  const { deadends, target } = input as LockInput;
  const steps: AlgorithmStep[] = [];
  const dead = new Set(deadends);

  const snapshot = (queue: string[], seen: Set<string>, extra: Record<string, string | number>) => ({
    queue: [...queue],
    seen: [...seen],
    hashMap: { target, deadends: deadends.join(' ') || '(none)', ...extra },
  });

  if (dead.has('0000')) {
    steps.push({
      state: { ...snapshot([], new Set(), { turns: 0 }), result: -1 },
      highlights: [],
      message: 'The starting state "0000" is itself a deadend — the lock can never even be touched → -1.',
      codeLine: 4,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  steps.push({
    state: { ...snapshot(['0000'], new Set(['0000']), { turns: 0 }), result: 'searching...' },
    highlights: [],
    message: `Each combo is a node and each single wheel turn is an edge, so the fewest turns is a shortest path. BFS from "0000" toward "${target}", never entering a deadend: ${deadends.join(', ') || 'none'}.`,
    codeLine: 7,
    action: 'push',
  } as AlgorithmStep);

  if (target === '0000') {
    steps.push({
      state: { ...snapshot(['0000'], new Set(['0000']), { turns: 0 }), result: 0 },
      highlights: [],
      message: 'The target is already "0000" — the lock starts open, 0 turns.',
      codeLine: 6,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  const queue: string[] = ['0000'];
  const seen = new Set<string>(['0000']);
  let turns = 0;
  let answer = -1;

  bfs: while (queue.length > 0) {
    turns += 1;
    const levelSize = queue.length;

    steps.push({
      state: { ...snapshot(queue, seen, { turns, 'frontier size': levelSize }), result: 'searching...' },
      highlights: [],
      message: `--- Turn ${turns} --- Every combo reachable in ${turns} turn(s) comes from expanding these ${levelSize} frontier combo(s). The first time we generate "${target}", the answer is ${turns}.`,
      codeLine: 11,
    } as AlgorithmStep);

    for (let k = 0; k < levelSize; k++) {
      const combo = queue.shift()!;

      steps.push({
        state: { ...snapshot(queue, seen, { turns, expanding: combo }), result: 'searching...' },
        highlights: [],
        message: `Dequeue "${combo}" and try all 8 single-wheel turns from it.`,
        codeLine: 13,
        action: 'pop',
      } as AlgorithmStep);

      const added: string[] = [];
      const blocked: string[] = [];
      const repeats: string[] = [];
      let hit = false;

      for (const nxt of neighbors(combo)) {
        if (seen.has(nxt)) {
          repeats.push(nxt);
          continue;
        }
        if (dead.has(nxt)) {
          blocked.push(nxt);
          continue;
        }
        if (nxt === target) {
          hit = true;
          answer = turns;
          steps.push({
            state: { ...snapshot(queue, seen, { turns, expanding: combo }), result: turns },
            highlights: [],
            message: `Turning one wheel on "${combo}" produces "${nxt}" — the target! It first appears at turn ${turns}, and BFS reaches every state by its shortest route, so ${turns} is the minimum.`,
            codeLine: 21,
            action: 'found',
          } as AlgorithmStep);
          break;
        }
        seen.add(nxt);
        queue.push(nxt);
        added.push(nxt);
      }

      if (hit) break bfs;

      steps.push({
        state: { ...snapshot(queue, seen, { turns, expanding: combo }), result: 'searching...' },
        highlights: [],
        message: `From "${combo}": queued ${added.length} new combo(s)${added.length ? ` (${added.join(', ')})` : ''}${blocked.length ? `; skipped deadend ${blocked.join(', ')}` : ''}${repeats.length ? `; ${repeats.length} already seen` : ''}. Marking on enqueue keeps each combo out of the queue twice.`,
        codeLine: 23,
        action: 'push',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      ...snapshot(queue, seen, { turns: answer === -1 ? turns : answer }),
      result: answer,
    },
    highlights: [],
    message: answer === -1
      ? `The queue drained after exploring ${seen.size} reachable combos and "${target}" was never among them — deadends seal it off → -1.`
      : `Shortest path found: "${target}" is ${answer} turn(s) from "0000", after touching only ${seen.size} of the 10000 states.`,
    codeLine: answer === -1 ? 24 : 21,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runOpenTheLockBidirectional(input: unknown): AlgorithmStep[] {
  const { deadends, target } = input as LockInput;
  const steps: AlgorithmStep[] = [];
  const dead = new Set(deadends);

  const snapshot = (
    frontier: Set<string>,
    other: Set<string>,
    seen: Set<string>,
    extra: Record<string, string | number>
  ) => ({
    queue: [...frontier],
    seen: [...seen],
    hashMap: {
      target,
      'other side': [...other].slice(0, 8).join(' ') + (other.size > 8 ? ` +${other.size - 8}` : ''),
      ...extra,
    },
  });

  if (dead.has('0000')) {
    steps.push({
      state: { ...snapshot(new Set(), new Set(), new Set(), { turns: 0 }), result: -1 },
      highlights: [],
      message: 'The starting state "0000" is itself a deadend → -1.',
      codeLine: 4,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  if (target === '0000') {
    steps.push({
      state: { ...snapshot(new Set(['0000']), new Set(), new Set(['0000']), { turns: 0 }), result: 0 },
      highlights: [],
      message: 'The target is already "0000" — 0 turns.',
      codeLine: 6,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  let begin = new Set<string>(['0000']);
  let end = new Set<string>([target]);
  const seen = new Set<string>(['0000', target]);
  let turns = 0;
  let answer = -1;

  steps.push({
    state: { ...snapshot(begin, end, seen, { turns }), result: 'searching...' },
    highlights: [],
    message: `Grow two frontiers at once: one from "0000", one from "${target}". A single-direction BFS balloons by 8x per level; meeting in the middle keeps both halves small.`,
    codeLine: 7,
    action: 'push',
  } as AlgorithmStep);

  search: while (begin.size > 0 && end.size > 0) {
    if (begin.size > end.size) {
      const tmp = begin;
      begin = end;
      end = tmp;

      steps.push({
        state: { ...snapshot(begin, end, seen, { turns }), result: 'searching...' },
        highlights: [],
        message: `The other frontier is smaller (${begin.size} vs ${end.size}), so expand that one instead. Always growing the cheaper side is what keeps the search balanced.`,
        codeLine: 12,
      } as AlgorithmStep);
    }

    turns += 1;
    const nextLevel = new Set<string>();

    steps.push({
      state: { ...snapshot(begin, end, seen, { turns }), result: 'searching...' },
      highlights: [],
      message: `--- Turn ${turns} --- Expand the ${begin.size} combo(s) on this side; if any neighbour is already on the opposite frontier, the two paths join and the total is ${turns}.`,
      codeLine: 13,
    } as AlgorithmStep);

    for (const combo of begin) {
      for (const nxt of neighbors(combo)) {
        if (end.has(nxt)) {
          answer = turns;
          steps.push({
            state: { ...snapshot(begin, end, seen, { turns, meeting: nxt }), result: turns },
            highlights: [],
            message: `"${combo}" → "${nxt}", and "${nxt}" is already on the opposite frontier — the two searches met. Total turns = ${turns}.`,
            codeLine: 21,
            action: 'found',
          } as AlgorithmStep);
          break search;
        }

        if (seen.has(nxt) || dead.has(nxt)) {
          steps.push({
            state: { ...snapshot(begin, end, seen, { turns, rejected: nxt }), result: 'searching...' },
            highlights: [],
            message: `"${combo}" → "${nxt}": ${dead.has(nxt) ? 'a deadend, the lock jams — skip it' : 'already seen by one of the frontiers — skip it'}.`,
            codeLine: 23,
            action: 'compare',
          } as AlgorithmStep);
          continue;
        }

        seen.add(nxt);
        nextLevel.add(nxt);

        steps.push({
          state: { ...snapshot(begin, end, seen, { turns, added: nxt }), result: 'searching...' },
          highlights: [],
          message: `"${combo}" → "${nxt}": new combo, add it to the next layer of this side (${nextLevel.size} so far).`,
          codeLine: 25,
          action: 'push',
        } as AlgorithmStep);
      }
    }

    begin = nextLevel;
  }

  steps.push({
    state: { ...snapshot(begin, end, seen, { turns: answer === -1 ? turns : answer }), result: answer },
    highlights: [],
    message: answer === -1
      ? `One frontier ran dry without ever touching the other — deadends separate "0000" from "${target}" → -1.`
      : `The frontiers met after ${answer} turn(s), and only ${seen.size} combos were ever touched — far fewer than the one-sided BFS needs.`,
    codeLine: answer === -1 ? 27 : 21,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const openTheLock: Algorithm = {
  id: 'open-the-lock',
  name: 'Open the Lock',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(10^4 · 4 · 10)',
  spaceComplexity: 'O(10^4)',
  pattern: 'BFS — shortest path over lock states, deadends blocked',
  description:
    'A lock has 4 circular wheels, each showing a digit 0-9, and starts at "0000". One move turns a single wheel one slot in either direction. Given a list of deadend states the lock must never display and a target, return the minimum number of moves to open it, or -1 if impossible.',
  problemUrl: 'https://leetcode.com/problems/open-the-lock/',
  code: {
    python: `def openLock(deadends, target):
    dead = set(deadends)
    if "0000" in dead:
        return -1
    if target == "0000":
        return 0
    queue = deque(["0000"])
    seen = {"0000"}
    turns = 0
    while queue:
        turns += 1
        for _ in range(len(queue)):
            combo = queue.popleft()
            for i in range(4):
                d = int(combo[i])
                for nd in ((d + 1) % 10, (d - 1) % 10):
                    nxt = combo[:i] + str(nd) + combo[i+1:]
                    if nxt in seen or nxt in dead:
                        continue
                    if nxt == target:
                        return turns
                    seen.add(nxt)
                    queue.append(nxt)
    return -1`,
    javascript: `function openLock(deadends, target) {
    const dead = new Set(deadends);
    if (dead.has("0000")) return -1;
    if (target === "0000") return 0;
    let queue = ["0000"];
    const seen = new Set(["0000"]);
    let turns = 0;
    while (queue.length > 0) {
        turns++;
        const size = queue.length;
        for (let k = 0; k < size; k++) {
            const combo = queue.shift();
            for (let i = 0; i < 4; i++) {
                const d = Number(combo[i]);
                for (const nd of [(d + 1) % 10, (d + 9) % 10]) {
                    const nxt = combo.slice(0, i) + nd + combo.slice(i + 1);
                    if (seen.has(nxt) || dead.has(nxt)) continue;
                    if (nxt === target) return turns;
                    seen.add(nxt);
                    queue.push(nxt);
                }
            }
        }
    }
    return -1;
}`,
    java: `public static int openLock(String[] deadends, String target) {
    Set<String> dead = new HashSet<>(Arrays.asList(deadends));
    if (dead.contains("0000")) return -1;
    if (target.equals("0000")) return 0;
    Queue<String> queue = new LinkedList<>();
    queue.add("0000");
    Set<String> seen = new HashSet<>();
    seen.add("0000");
    int turns = 0;
    while (!queue.isEmpty()) {
        turns++;
        int size = queue.size();
        for (int k = 0; k < size; k++) {
            char[] combo = queue.poll().toCharArray();
            for (int i = 0; i < 4; i++) {
                char old = combo[i];
                for (int delta : new int[]{1, 9}) {
                    combo[i] = (char) ('0' + (old - '0' + delta) % 10);
                    String nxt = new String(combo);
                    if (seen.contains(nxt) || dead.contains(nxt)) continue;
                    if (nxt.equals(target)) return turns;
                    seen.add(nxt);
                    queue.add(nxt);
                }
                combo[i] = old;
            }
        }
    }
    return -1;
}`,
  },
  defaultInput: {
    deadends: ['0009', '0900'],
    target: '0011',
  },
  run: runOpenTheLock,
  optimalApproachName: 'BFS Level Order',
  approaches: [
    {
      id: 'bidirectional-bfs',
      name: 'Bidirectional BFS',
      timeComplexity: 'O(10^4 · 4 · 10)',
      spaceComplexity: 'O(10^4)',
      description:
        'Runs two BFS frontiers — one from "0000", one from the target — and always expands the smaller one, so the two half-depth searches meet in the middle instead of one search fanning out 8x per level for the full distance.',
      code: {
        python: `def openLock(deadends, target):
    dead = set(deadends)
    if "0000" in dead:
        return -1
    if target == "0000":
        return 0
    begin, end = {"0000"}, {target}
    seen = {"0000", target}
    turns = 0
    while begin and end:
        if len(begin) > len(end):
            begin, end = end, begin
        turns += 1
        next_level = set()
        for combo in begin:
            for i in range(4):
                d = int(combo[i])
                for nd in ((d + 1) % 10, (d - 1) % 10):
                    nxt = combo[:i] + str(nd) + combo[i+1:]
                    if nxt in end:
                        return turns
                    if nxt in seen or nxt in dead:
                        continue
                    seen.add(nxt)
                    next_level.add(nxt)
        begin = next_level
    return -1`,
        javascript: `function openLock(deadends, target) {
    const dead = new Set(deadends);
    if (dead.has("0000")) return -1;
    if (target === "0000") return 0;
    let begin = new Set(["0000"]);
    let end = new Set([target]);
    const seen = new Set(["0000", target]);
    let turns = 0;
    while (begin.size > 0 && end.size > 0) {
        if (begin.size > end.size) [begin, end] = [end, begin];
        turns++;
        const nextLevel = new Set();
        for (const combo of begin) {
            for (let i = 0; i < 4; i++) {
                const d = Number(combo[i]);
                for (const nd of [(d + 1) % 10, (d + 9) % 10]) {
                    const nxt = combo.slice(0, i) + nd + combo.slice(i + 1);
                    if (end.has(nxt)) return turns;
                    if (seen.has(nxt) || dead.has(nxt)) continue;
                    seen.add(nxt);
                    nextLevel.add(nxt);
                }
            }
        }
        begin = nextLevel;
    }
    return -1;
}`,
        java: `public static int openLock(String[] deadends, String target) {
    Set<String> dead = new HashSet<>(Arrays.asList(deadends));
    if (dead.contains("0000")) return -1;
    if (target.equals("0000")) return 0;
    Set<String> begin = new HashSet<>(List.of("0000"));
    Set<String> end = new HashSet<>(List.of(target));
    Set<String> seen = new HashSet<>(List.of("0000", target));
    int turns = 0;
    while (!begin.isEmpty() && !end.isEmpty()) {
        if (begin.size() > end.size()) {
            Set<String> tmp = begin; begin = end; end = tmp;
        }
        turns++;
        Set<String> nextLevel = new HashSet<>();
        for (String combo : begin) {
            for (int i = 0; i < 4; i++) {
                int d = combo.charAt(i) - '0';
                for (int delta : new int[]{1, 9}) {
                    String nxt = combo.substring(0, i)
                        + (char) ('0' + (d + delta) % 10)
                        + combo.substring(i + 1);
                    if (end.contains(nxt)) return turns;
                    if (seen.contains(nxt) || dead.contains(nxt)) continue;
                    seen.add(nxt);
                    nextLevel.add(nxt);
                }
            }
        }
        begin = nextLevel;
    }
    return -1;
}`,
      },
      run: runOpenTheLockBidirectional,
      lineExplanations: {
        python: {
          1: 'Define function taking deadends and the target combo',
          2: 'Deadends as a set for O(1) rejection',
          3: 'Start state blocked...',
          4: '...the lock can never move',
          5: 'Target is the start',
          6: 'Zero turns needed',
          7: 'Two frontiers: one from the start, one from the target',
          8: 'Shared seen set covers both sides',
          9: 'Turn counter across both halves',
          10: 'Stop as soon as either side runs dry',
          11: 'Always expand the smaller frontier...',
          12: '...by swapping the roles of the two sides',
          13: 'This layer costs one more turn',
          14: 'Collect the next layer of this side',
          15: 'Expand every combo on the current frontier',
          16: 'Each of the four wheels',
          17: 'Its current digit',
          18: 'Turn it one slot up or down',
          19: 'Build the resulting combo',
          20: 'It is already on the opposite frontier — the paths join',
          21: 'That meeting point is the answer',
          22: 'Skip repeats and jammed states',
          23: 'Continue to the next candidate',
          24: 'Claim it so neither side revisits it',
          25: 'It belongs to this side next layer',
          26: 'Advance this frontier one layer',
          27: 'The frontiers never met — unreachable',
        },
        javascript: {
          1: 'Define function taking deadends and the target combo',
          2: 'Deadends as a Set for O(1) rejection',
          3: 'Start state blocked — the lock can never move',
          4: 'Target is the start — zero turns',
          5: 'Frontier growing from "0000"',
          6: 'Frontier growing from the target',
          7: 'Shared seen set covers both sides',
          8: 'Turn counter across both halves',
          9: 'Stop as soon as either side runs dry',
          10: 'Always expand the smaller frontier',
          11: 'This layer costs one more turn',
          12: 'Collect the next layer of this side',
          13: 'Expand every combo on the current frontier',
          14: 'Each of the four wheels',
          15: 'Its current digit',
          16: 'Turn it one slot up or down',
          17: 'Build the resulting combo',
          18: 'On the opposite frontier — the paths join, done',
          19: 'Skip repeats and jammed states',
          20: 'Claim it so neither side revisits it',
          21: 'It belongs to this side next layer',
          25: 'Advance this frontier one layer',
          27: 'The frontiers never met — unreachable',
        },
        java: {
          1: 'Define method taking deadends and the target combo',
          2: 'Deadends as a set for O(1) rejection',
          3: 'Start state blocked — the lock can never move',
          4: 'Target is the start — zero turns',
          5: 'Frontier growing from "0000"',
          6: 'Frontier growing from the target',
          7: 'Shared seen set covers both sides',
          8: 'Turn counter across both halves',
          9: 'Stop as soon as either side runs dry',
          10: 'Always expand the smaller frontier...',
          11: '...by swapping the roles of the two sides',
          13: 'This layer costs one more turn',
          14: 'Collect the next layer of this side',
          15: 'Expand every combo on the current frontier',
          16: 'Each of the four wheels',
          17: 'Its current digit',
          18: 'Turn it one slot up or down',
          19: 'Build the resulting combo',
          22: 'On the opposite frontier — the paths join, done',
          23: 'Skip repeats and jammed states',
          24: 'Claim it so neither side revisits it',
          25: 'It belongs to this side next layer',
          29: 'Advance this frontier one layer',
          31: 'The frontiers never met — unreachable',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking deadends and the target combo',
      2: 'Deadends as a set for O(1) rejection',
      3: 'Start state blocked...',
      4: '...the lock can never move',
      5: 'Target is the start',
      6: 'Zero turns needed',
      7: 'BFS queue seeded with the starting combo',
      8: 'Seen set so no combo is queued twice',
      9: 'Turn counter, one per BFS layer',
      10: 'Keep going while the frontier has combos',
      11: 'Everything popped this round costs one more turn',
      12: 'Freeze the layer size so the layer stays clean',
      13: 'Take the next combo off the frontier',
      14: 'Each of the four wheels',
      15: 'Its current digit',
      16: 'Turn it one slot up or one slot down',
      17: 'Build the resulting combo',
      18: 'Already visited, or a jammed deadend',
      19: 'Skip it',
      20: 'First sighting of the target...',
      21: '...and BFS guarantees this is the shortest route',
      22: 'Claim it on enqueue, not on dequeue',
      23: 'Push it onto the next layer',
      24: 'Frontier drained without reaching the target',
    },
    javascript: {
      1: 'Define function taking deadends and the target combo',
      2: 'Deadends as a Set for O(1) rejection',
      3: 'Start state blocked — the lock can never move',
      4: 'Target is the start — zero turns',
      5: 'BFS queue seeded with the starting combo',
      6: 'Seen set so no combo is queued twice',
      7: 'Turn counter, one per BFS layer',
      8: 'Keep going while the frontier has combos',
      9: 'Everything popped this round costs one more turn',
      10: 'Freeze the layer size so the layer stays clean',
      12: 'Take the next combo off the frontier',
      13: 'Each of the four wheels',
      14: 'Its current digit',
      15: 'Turn it one slot up or one slot down',
      16: 'Build the resulting combo',
      17: 'Skip visited combos and jammed deadends',
      18: 'First sighting of the target is the shortest route',
      19: 'Claim it on enqueue, not on dequeue',
      20: 'Push it onto the next layer',
      25: 'Frontier drained without reaching the target',
    },
    java: {
      1: 'Define method taking deadends and the target combo',
      2: 'Deadends as a set for O(1) rejection',
      3: 'Start state blocked — the lock can never move',
      4: 'Target is the start — zero turns',
      5: 'BFS queue',
      6: 'Seed it with the starting combo',
      7: 'Seen set so no combo is queued twice',
      8: 'Mark the start as seen',
      9: 'Turn counter, one per BFS layer',
      10: 'Keep going while the frontier has combos',
      11: 'Everything popped this round costs one more turn',
      12: 'Freeze the layer size so the layer stays clean',
      14: 'Take the next combo off the frontier',
      15: 'Each of the four wheels',
      16: 'Remember the digit so it can be restored',
      17: 'Turn it one slot up (+1) or down (+9 mod 10)',
      18: 'Apply the turn in place',
      19: 'Snapshot it as a string',
      20: 'Skip visited combos and jammed deadends',
      21: 'First sighting of the target is the shortest route',
      22: 'Claim it on enqueue, not on dequeue',
      23: 'Push it onto the next layer',
      25: 'Restore the wheel before moving to the next one',
      29: 'Frontier drained without reaching the target',
    },
  },
};
