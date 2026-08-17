import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runDota2Senate(input: unknown): AlgorithmStep[] {
  const senate = input as string;
  const steps: AlgorithmStep[] = [];
  const n = senate.length;
  const chars = senate.split('');

  const radiant: number[] = [];
  const dire: number[] = [];
  for (let i = 0; i < n; i++) {
    if (senate[i] === 'R') radiant.push(i);
    else dire.push(i);
  }

  const liveQueue = () =>
    [...radiant.map((i) => `R@${i}`), ...dire.map((i) => `D@${i}`)].sort(
      (a, b) => Number(a.split('@')[1]) - Number(b.split('@')[1])
    );

  steps.push({
    state: {
      chars: [...chars],
      hashMap: { Radiant: `[${radiant.join(', ')}]`, Dire: `[${dire.join(', ')}]` },
      queue: liveQueue(),
      result: 'Who wins?',
    },
    highlights: [],
    message: `Senators vote in round-robin order. The greedy move for every senator is to ban the nearest upcoming opponent. Keep each party's indices in a queue; a survivor re-enters at index + ${n} (the next round).`,
    codeLine: 12,
  });

  let round = 1;

  while (radiant.length && dire.length) {
    const r = radiant.shift() as number;
    const d = dire.shift() as number;

    if (r < d) {
      radiant.push(r + n);
      steps.push({
        state: {
          chars: [...chars],
          hashMap: { Radiant: `[${radiant.join(', ')}]`, Dire: `[${dire.join(', ')}]` },
          queue: liveQueue(),
          result: `Radiant: ${radiant.length}, Dire: ${dire.length}`,
        },
        highlights: [r % n],
        secondary: [d % n],
        pointers: { R: r % n, D: d % n },
        message: `Turn ${round}: Radiant senator (slot ${r}) speaks before Dire senator (slot ${d}), so R bans D. The Radiant senator survives and re-queues at slot ${r + n} for the next round.`,
        codeLine: 16,
        action: 'delete',
      });
    } else {
      dire.push(d + n);
      steps.push({
        state: {
          chars: [...chars],
          hashMap: { Radiant: `[${radiant.join(', ')}]`, Dire: `[${dire.join(', ')}]` },
          queue: liveQueue(),
          result: `Radiant: ${radiant.length}, Dire: ${dire.length}`,
        },
        highlights: [d % n],
        secondary: [r % n],
        pointers: { D: d % n, R: r % n },
        message: `Turn ${round}: Dire senator (slot ${d}) speaks before Radiant senator (slot ${r}), so D bans R. The Dire senator survives and re-queues at slot ${d + n}.`,
        codeLine: 18,
        action: 'delete',
      });
    }
    round++;
  }

  const winner = radiant.length ? 'Radiant' : 'Dire';

  steps.push({
    state: {
      chars: [...chars],
      hashMap: { Radiant: `[${radiant.join(', ')}]`, Dire: `[${dire.join(', ')}]` },
      queue: liveQueue(),
      result: winner,
    },
    highlights: (radiant.length ? radiant : dire).map((i) => i % n),
    message: `One queue is empty — every ${winner === 'Radiant' ? 'Dire' : 'Radiant'} senator has been banned. Winner: ${winner}.`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

function runDota2SenateCounters(input: unknown): AlgorithmStep[] {
  const senate = input as string;
  const steps: AlgorithmStep[] = [];
  const people = senate.split('');

  let rBan = 0;
  let dBan = 0;
  let rCount = people.filter((c) => c === 'R').length;
  let dCount = people.filter((c) => c === 'D').length;

  steps.push({
    state: {
      chars: [...people],
      hashMap: { 'R alive': rCount, 'D alive': dCount, 'bans on R': 0, 'bans on D': 0 },
      result: 'Who wins?',
    },
    highlights: [],
    message: `No queues at all: sweep the seats in a loop, carrying two counters of pending bans. A senator who is already under a pending ban is silenced; otherwise they place a ban on the other party.`,
    codeLine: 6,
  });

  let round = 1;
  let guard = 0;

  while (rCount > 0 && dCount > 0 && guard++ < 50) {
    for (let i = 0; i < people.length; i++) {
      const c = people[i];
      if (c !== 'R' && c !== 'D') continue;

      if (c === 'R') {
        if (rBan > 0) {
          rBan--;
          people[i] = 'x';
          rCount--;
          steps.push({
            state: {
              chars: [...people],
              hashMap: { 'R alive': rCount, 'D alive': dCount, 'bans on R': rBan, 'bans on D': dBan },
              result: `Radiant: ${rCount}, Dire: ${dCount}`,
            },
            highlights: [i],
            pointers: { i },
            message: `Round ${round}, seat ${i} (R): a pending ban on Radiant is waiting — this senator is silenced and removed. Pending bans on R: ${rBan}.`,
            codeLine: 11,
            action: 'delete',
          });
        } else {
          dBan++;
          steps.push({
            state: {
              chars: [...people],
              hashMap: { 'R alive': rCount, 'D alive': dCount, 'bans on R': rBan, 'bans on D': dBan },
              result: `Radiant: ${rCount}, Dire: ${dCount}`,
            },
            highlights: [i],
            pointers: { i },
            message: `Round ${round}, seat ${i} (R): no ban waiting, so this senator bans the next Dire senator to speak. Pending bans on D: ${dBan}.`,
            codeLine: 14,
            action: 'insert',
          });
        }
      } else {
        if (dBan > 0) {
          dBan--;
          people[i] = 'x';
          dCount--;
          steps.push({
            state: {
              chars: [...people],
              hashMap: { 'R alive': rCount, 'D alive': dCount, 'bans on R': rBan, 'bans on D': dBan },
              result: `Radiant: ${rCount}, Dire: ${dCount}`,
            },
            highlights: [i],
            pointers: { i },
            message: `Round ${round}, seat ${i} (D): a pending ban on Dire is waiting — this senator is silenced and removed. Pending bans on D: ${dBan}.`,
            codeLine: 18,
            action: 'delete',
          });
        } else {
          rBan++;
          steps.push({
            state: {
              chars: [...people],
              hashMap: { 'R alive': rCount, 'D alive': dCount, 'bans on R': rBan, 'bans on D': dBan },
              result: `Radiant: ${rCount}, Dire: ${dCount}`,
            },
            highlights: [i],
            pointers: { i },
            message: `Round ${round}, seat ${i} (D): no ban waiting, so this senator bans the next Radiant senator to speak. Pending bans on R: ${rBan}.`,
            codeLine: 21,
            action: 'insert',
          });
        }
      }
    }
    round++;
  }

  const winner = rCount > 0 ? 'Radiant' : 'Dire';

  steps.push({
    state: {
      chars: [...people],
      hashMap: { 'R alive': rCount, 'D alive': dCount, 'bans on R': rBan, 'bans on D': dBan },
      result: winner,
    },
    highlights: people.map((c, i) => (c === 'R' || c === 'D' ? i : -1)).filter((i) => i >= 0),
    message: `One party has no senators left. Winner: ${winner} — the same answer as the two-queue simulation, without ever building a queue.`,
    codeLine: 22,
    action: 'found',
  });

  return steps;
}

export const dota2Senate: Algorithm = {
  id: 'dota2-senate',
  name: 'Dota2 Senate',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Greedy — ban the nearest opponent, requeue survivors',
  description:
    "Senators from the Radiant ('R') and Dire ('D') parties vote in round-robin order, and on their turn a senator may ban one senator from the other party from all future rounds. If every remaining senator belongs to one party, that party wins. Return the winning party assuming both play optimally.",
  problemUrl: 'https://leetcode.com/problems/dota2-senate/',
  code: {
    python: `from collections import deque

def predictPartyVictory(senate):
    n = len(senate)
    radiant = deque()
    dire = deque()
    for i, c in enumerate(senate):
        if c == 'R':
            radiant.append(i)
        else:
            dire.append(i)
    while radiant and dire:
        r = radiant.popleft()
        d = dire.popleft()
        if r < d:
            radiant.append(r + n)
        else:
            dire.append(d + n)
    return "Radiant" if radiant else "Dire"`,
    javascript: `function predictPartyVictory(senate) {
    const n = senate.length;
    const radiant = [], dire = [];
    for (let i = 0; i < n; i++) {
        if (senate[i] === 'R') radiant.push(i);
        else dire.push(i);
    }
    while (radiant.length && dire.length) {
        const r = radiant.shift();
        const d = dire.shift();
        if (r < d) radiant.push(r + n);
        else dire.push(d + n);
    }
    return radiant.length ? "Radiant" : "Dire";
}`,
    java: `public static String predictPartyVictory(String senate) {
    int n = senate.length();
    Queue<Integer> radiant = new ArrayDeque<>();
    Queue<Integer> dire = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        if (senate.charAt(i) == 'R') radiant.add(i);
        else dire.add(i);
    }
    while (!radiant.isEmpty() && !dire.isEmpty()) {
        int r = radiant.poll();
        int d = dire.poll();
        if (r < d) radiant.add(r + n);
        else dire.add(d + n);
    }
    return radiant.isEmpty() ? "Dire" : "Radiant";
}`,
  },
  defaultInput: 'RRDDD',
  run: runDota2Senate,
  optimalApproachName: 'Two Queues (Round Robin)',
  approaches: [
    {
      id: 'pending-ban-counters',
      name: 'Pending-Ban Counters',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Drop the queues entirely: sweep the seats in repeated rounds carrying two counters of bans still owed, silencing any senator whose party already has a ban pending.',
      code: {
        python: `def predictPartyVictory(senate):
    people = list(senate)
    rBan = dBan = 0
    rCount = senate.count('R')
    dCount = senate.count('D')
    while rCount > 0 and dCount > 0:
        for i, c in enumerate(people):
            if c == 'R':
                if rBan > 0:
                    rBan -= 1
                    people[i] = 'x'
                    rCount -= 1
                else:
                    dBan += 1
            elif c == 'D':
                if dBan > 0:
                    dBan -= 1
                    people[i] = 'x'
                    dCount -= 1
                else:
                    rBan += 1
    return "Radiant" if rCount > 0 else "Dire"`,
        javascript: `function predictPartyVictory(senate) {
    const people = senate.split('');
    let rBan = 0, dBan = 0;
    let rCount = people.filter(c => c === 'R').length;
    let dCount = people.filter(c => c === 'D').length;
    while (rCount > 0 && dCount > 0) {
        for (let i = 0; i < people.length; i++) {
            if (people[i] === 'R') {
                if (rBan > 0) {
                    rBan--;
                    people[i] = 'x';
                    rCount--;
                } else {
                    dBan++;
                }
            } else if (people[i] === 'D') {
                if (dBan > 0) {
                    dBan--;
                    people[i] = 'x';
                    dCount--;
                } else {
                    rBan++;
                }
            }
        }
    }
    return rCount > 0 ? "Radiant" : "Dire";
}`,
        java: `public static String predictPartyVictory(String senate) {
    char[] people = senate.toCharArray();
    int rBan = 0, dBan = 0;
    int rCount = 0, dCount = 0;
    for (char c : people) {
        if (c == 'R') rCount++;
        else dCount++;
    }
    while (rCount > 0 && dCount > 0) {
        for (int i = 0; i < people.length; i++) {
            if (people[i] == 'R') {
                if (rBan > 0) {
                    rBan--;
                    people[i] = 'x';
                    rCount--;
                } else {
                    dBan++;
                }
            } else if (people[i] == 'D') {
                if (dBan > 0) {
                    dBan--;
                    people[i] = 'x';
                    dCount--;
                } else {
                    rBan++;
                }
            }
        }
    }
    return rCount > 0 ? "Radiant" : "Dire";
}`,
      },
      run: runDota2SenateCounters,
      lineExplanations: {
        python: {
          1: 'Define function taking the senate string',
          2: 'Mutable seats so we can cross out silenced senators',
          3: 'Bans still owed against each party',
          4: 'Living Radiant senators',
          5: 'Living Dire senators',
          6: 'Keep running rounds until one party is wiped out',
          7: 'One round = one sweep of the seats in order',
          8: 'A Radiant senator takes their turn',
          9: 'Is a ban already waiting for them?',
          10: 'Consume the pending ban',
          11: 'Cross them out of the seating',
          12: 'One fewer Radiant senator',
          13: 'Otherwise they act',
          14: 'They ban the next Dire senator to speak',
          15: 'A Dire senator takes their turn',
          16: 'Is a ban already waiting for them?',
          17: 'Consume the pending ban',
          18: 'Cross them out of the seating',
          19: 'One fewer Dire senator',
          20: 'Otherwise they act',
          21: 'They ban the next Radiant senator to speak',
          22: 'Whichever party still has senators wins',
        },
        javascript: {
          1: 'Define function taking the senate string',
          2: 'Mutable seats so we can cross out silenced senators',
          3: 'Bans still owed against each party',
          4: 'Living Radiant senators',
          5: 'Living Dire senators',
          6: 'Keep running rounds until one party is wiped out',
          7: 'One round = one sweep of the seats in order',
          8: 'A Radiant senator takes their turn',
          9: 'Is a ban already waiting for them?',
          10: 'Consume the pending ban',
          11: 'Cross them out of the seating',
          12: 'One fewer Radiant senator',
          14: 'Otherwise they ban the next Dire senator',
          16: 'A Dire senator takes their turn',
          17: 'Is a ban already waiting for them?',
          18: 'Consume the pending ban',
          19: 'Cross them out of the seating',
          20: 'One fewer Dire senator',
          22: 'Otherwise they ban the next Radiant senator',
          27: 'Whichever party still has senators wins',
        },
        java: {
          1: 'Define method taking the senate string',
          2: 'Mutable seats so we can cross out silenced senators',
          3: 'Bans still owed against each party',
          4: 'Living senators per party',
          5: 'Count the initial senators',
          6: 'Radiant seat',
          7: 'Otherwise Dire',
          9: 'Keep running rounds until one party is wiped out',
          10: 'One round = one sweep of the seats in order',
          11: 'A Radiant senator takes their turn',
          12: 'Is a ban already waiting for them?',
          13: 'Consume the pending ban',
          14: 'Cross them out of the seating',
          15: 'One fewer Radiant senator',
          17: 'Otherwise they ban the next Dire senator',
          19: 'A Dire senator takes their turn',
          20: 'Is a ban already waiting for them?',
          21: 'Consume the pending ban',
          22: 'Cross them out of the seating',
          23: 'One fewer Dire senator',
          25: 'Otherwise they ban the next Radiant senator',
          30: 'Whichever party still has senators wins',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Deque gives O(1) pops from the front',
      3: 'Define function taking the senate string',
      4: 'Number of seats — the length of one full round',
      5: 'Queue of Radiant senator turn positions',
      6: 'Queue of Dire senator turn positions',
      7: 'Walk the seating order once',
      8: 'A Radiant senator',
      9: 'Record their turn position',
      10: 'Otherwise Dire',
      11: 'Record their turn position',
      12: 'While both parties still have senators',
      13: 'Next Radiant senator to speak',
      14: 'Next Dire senator to speak',
      15: 'Whoever speaks first bans the other',
      16: 'Radiant wins the turn and returns next round at r + n',
      17: 'Otherwise Dire spoke first',
      18: 'Dire wins the turn and returns next round at d + n',
      19: 'The party with senators left wins',
    },
    javascript: {
      1: 'Define function taking the senate string',
      2: 'Number of seats — the length of one full round',
      3: 'Queues of turn positions for each party',
      4: 'Walk the seating order once',
      5: 'Record Radiant turn positions',
      6: 'Record Dire turn positions',
      8: 'While both parties still have senators',
      9: 'Next Radiant senator to speak',
      10: 'Next Dire senator to speak',
      11: 'Radiant spoke first: bans D, returns next round at r + n',
      12: 'Otherwise Dire bans R and returns at d + n',
      14: 'The party with senators left wins',
    },
    java: {
      1: 'Define method taking the senate string',
      2: 'Number of seats — the length of one full round',
      3: 'Queue of Radiant turn positions',
      4: 'Queue of Dire turn positions',
      5: 'Walk the seating order once',
      6: 'Record Radiant turn positions',
      7: 'Record Dire turn positions',
      9: 'While both parties still have senators',
      10: 'Next Radiant senator to speak',
      11: 'Next Dire senator to speak',
      12: 'Radiant spoke first: bans D, returns next round at r + n',
      13: 'Otherwise Dire bans R and returns at d + n',
      15: 'The party with senators left wins',
    },
  },
};
