import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLemonadeChange(input: unknown): AlgorithmStep[] {
  const bills = input as number[];
  const steps: AlgorithmStep[] = [];

  let five = 0;
  let ten = 0;

  steps.push({
    state: {
      nums: [...bills],
      hashMap: { $5: 0, $10: 0 },
      result: 'Can we give correct change to everyone?',
    },
    highlights: [],
    message: `Each lemonade costs $5. Customers pay with $5, $10 or $20 bills. We start with an empty till, so every dollar of change must come from bills already collected.`,
    codeLine: 2,
  });

  for (let i = 0; i < bills.length; i++) {
    const b = bills[i];

    if (b === 5) {
      five++;
      steps.push({
        state: {
          nums: [...bills],
          hashMap: { $5: five, $10: ten },
          result: `Till: ${five} x $5, ${ten} x $10`,
        },
        highlights: [i],
        pointers: { i },
        message: `Customer ${i} pays $5 — exact price, no change needed. Keep the bill: now ${five} five(s) in the till.`,
        codeLine: 5,
        action: 'insert',
      });
    } else if (b === 10) {
      if (five === 0) {
        steps.push({
          state: {
            nums: [...bills],
            hashMap: { $5: five, $10: ten },
            result: 'false - ran out of change',
          },
          highlights: [i],
          pointers: { i },
          message: `Customer ${i} pays $10 and needs $5 back, but the till has no fives. Return false.`,
          codeLine: 8,
          action: 'found',
        });
        return steps;
      }
      five--;
      ten++;
      steps.push({
        state: {
          nums: [...bills],
          hashMap: { $5: five, $10: ten },
          result: `Till: ${five} x $5, ${ten} x $10`,
        },
        highlights: [i],
        pointers: { i },
        message: `Customer ${i} pays $10 — hand back one $5 (the only possible change). Till: ${five} x $5, ${ten} x $10.`,
        codeLine: 10,
        action: 'compare',
      });
    } else {
      if (ten > 0 && five > 0) {
        ten--;
        five--;
        steps.push({
          state: {
            nums: [...bills],
            hashMap: { $5: five, $10: ten },
            result: `Till: ${five} x $5, ${ten} x $10`,
          },
          highlights: [i],
          pointers: { i },
          message: `Customer ${i} pays $20 — owe $15. Greedy: pay $10 + $5 first, saving the flexible fives for later. Till: ${five} x $5, ${ten} x $10.`,
          codeLine: 14,
          action: 'compare',
        });
      } else if (five >= 3) {
        five -= 3;
        steps.push({
          state: {
            nums: [...bills],
            hashMap: { $5: five, $10: ten },
            result: `Till: ${five} x $5, ${ten} x $10`,
          },
          highlights: [i],
          pointers: { i },
          message: `Customer ${i} pays $20 — owe $15 and there is no $10, so spend three fives. Till: ${five} x $5, ${ten} x $10.`,
          codeLine: 16,
          action: 'compare',
        });
      } else {
        steps.push({
          state: {
            nums: [...bills],
            hashMap: { $5: five, $10: ten },
            result: 'false - ran out of change',
          },
          highlights: [i],
          pointers: { i },
          message: `Customer ${i} pays $20 and needs $15 back, but the till only holds ${five} x $5 and ${ten} x $10. Return false.`,
          codeLine: 18,
          action: 'found',
        });
        return steps;
      }
    }
  }

  steps.push({
    state: {
      nums: [...bills],
      hashMap: { $5: five, $10: ten },
      result: 'true - everyone got correct change!',
    },
    highlights: bills.map((_, i) => i),
    message: `All ${bills.length} customers served with correct change. Return true.`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

function runLemonadeChangeDrawer(input: unknown): AlgorithmStep[] {
  const bills = input as number[];
  const steps: AlgorithmStep[] = [];
  const drawer: number[] = [];

  steps.push({
    state: { nums: [...bills], queue: [], result: 'Simulating the cash drawer' },
    highlights: [],
    message: `Simulation view: keep the actual multiset of bills in the drawer and pay change with the largest bill that still fits. Same greedy rule, made explicit.`,
    codeLine: 2,
  });

  for (let i = 0; i < bills.length; i++) {
    const b = bills[i];
    let change = b - 5;
    const paid: number[] = [];

    for (const c of [10, 5]) {
      while (change >= c && drawer.includes(c)) {
        drawer.splice(drawer.indexOf(c), 1);
        change -= c;
        paid.push(c);
      }
    }

    if (change > 0) {
      steps.push({
        state: {
          nums: [...bills],
          queue: drawer.map((x) => `$${x}`),
          result: 'false - ran out of change',
        },
        highlights: [i],
        pointers: { i },
        message: `Customer ${i} pays $${b}, owed $${b - 5}. Best effort paid ${paid.length ? paid.map((x) => `$${x}`).join(' + ') : 'nothing'}, still $${change} short — the drawer cannot cover it. Return false.`,
        codeLine: 10,
        action: 'found',
      });
      return steps;
    }

    drawer.push(b);
    drawer.sort((x, y) => x - y);

    steps.push({
      state: {
        nums: [...bills],
        queue: drawer.map((x) => `$${x}`),
        result: `Drawer: ${drawer.map((x) => `$${x}`).join(', ')}`,
      },
      highlights: [i],
      pointers: { i },
      message: `Customer ${i} pays $${b}, owed $${b - 5}. ${paid.length ? `Paid ${paid.map((x) => `$${x}`).join(' + ')} largest-first.` : 'No change needed.'} Drop the $${b} in: drawer = [${drawer.map((x) => `$${x}`).join(', ')}].`,
      codeLine: 11,
      action: 'push',
    });
  }

  steps.push({
    state: {
      nums: [...bills],
      queue: drawer.map((x) => `$${x}`),
      result: 'true - everyone got correct change!',
    },
    highlights: bills.map((_, i) => i),
    message: `Every customer was paid from the drawer. Paying with $10s before $5s is what keeps the flexible fives available. Return true.`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

export const lemonadeChange: Algorithm = {
  id: 'lemonade-change',
  name: 'Lemonade Change',
  category: 'Greedy',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — spend the least flexible bill first',
  description:
    'At a lemonade stand each drink costs $5 and customers pay in order with a $5, $10, or $20 bill. You start with no change and must give the correct change to every customer. Return true if you can serve them all.',
  problemUrl: 'https://leetcode.com/problems/lemonade-change/',
  code: {
    python: `def lemonadeChange(bills):
    five, ten = 0, 0
    for b in bills:
        if b == 5:
            five += 1
        elif b == 10:
            if five == 0:
                return False
            five -= 1
            ten += 1
        else:
            if ten > 0 and five > 0:
                ten -= 1
                five -= 1
            elif five >= 3:
                five -= 3
            else:
                return False
    return True`,
    javascript: `function lemonadeChange(bills) {
    let five = 0, ten = 0;
    for (const b of bills) {
        if (b === 5) {
            five++;
        } else if (b === 10) {
            if (five === 0) return false;
            five--;
            ten++;
        } else {
            if (ten > 0 && five > 0) {
                ten--;
                five--;
            } else if (five >= 3) {
                five -= 3;
            } else {
                return false;
            }
        }
    }
    return true;
}`,
    java: `public static boolean lemonadeChange(int[] bills) {
    int five = 0, ten = 0;
    for (int b : bills) {
        if (b == 5) {
            five++;
        } else if (b == 10) {
            if (five == 0) return false;
            five--;
            ten++;
        } else {
            if (ten > 0 && five > 0) {
                ten--;
                five--;
            } else if (five >= 3) {
                five -= 3;
            } else {
                return false;
            }
        }
    }
    return true;
}`,
  },
  defaultInput: [5, 5, 5, 10, 20],
  run: runLemonadeChange,
  optimalApproachName: 'Greedy Bill Counters',
  approaches: [
    {
      id: 'drawer-simulation',
      name: 'Drawer Simulation',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of two integer counters, keep the real multiset of bills in the drawer and pay change largest-bill-first — the same greedy rule, but visible as an actual cash drawer.',
      code: {
        python: `def lemonadeChange(bills):
    drawer = []
    for b in bills:
        change = b - 5
        for c in (10, 5):
            while change >= c and c in drawer:
                drawer.remove(c)
                change -= c
        if change > 0:
            return False
        drawer.append(b)
        drawer.sort()
    return True`,
        javascript: `function lemonadeChange(bills) {
    const drawer = [];
    for (const b of bills) {
        let change = b - 5;
        for (const c of [10, 5]) {
            while (change >= c && drawer.includes(c)) {
                drawer.splice(drawer.indexOf(c), 1);
                change -= c;
            }
        }
        if (change > 0) return false;
        drawer.push(b);
        drawer.sort((x, y) => x - y);
    }
    return true;
}`,
        java: `public static boolean lemonadeChange(int[] bills) {
    List<Integer> drawer = new ArrayList<>();
    for (int b : bills) {
        int change = b - 5;
        for (int c : new int[] { 10, 5 }) {
            while (change >= c && drawer.contains(c)) {
                drawer.remove(Integer.valueOf(c));
                change -= c;
            }
        }
        if (change > 0) return false;
        drawer.add(b);
        Collections.sort(drawer);
    }
    return true;
}`,
      },
      run: runLemonadeChangeDrawer,
      lineExplanations: {
        python: {
          1: 'Define function taking the list of bills',
          2: 'The drawer holds every bill we have collected',
          3: 'Serve customers in order',
          4: 'Change owed = what they paid minus the $5 price',
          5: 'Try the biggest denominations first',
          6: 'While this bill fits in the remaining change and we own one',
          7: 'Hand it over',
          8: 'Reduce the change still owed',
          9: 'Could not cover the full amount?',
          10: 'Return false — this customer walks away unpaid',
          11: 'Their bill goes into the drawer',
          12: 'Keep the drawer sorted so lookups stay tidy',
          13: 'Everyone was served correctly',
        },
        javascript: {
          1: 'Define function taking the array of bills',
          2: 'The drawer holds every bill we have collected',
          3: 'Serve customers in order',
          4: 'Change owed = what they paid minus the $5 price',
          5: 'Try the biggest denominations first',
          6: 'While this bill fits in the remaining change and we own one',
          7: 'Remove it from the drawer',
          8: 'Reduce the change still owed',
          11: 'Could not cover the full amount — return false',
          12: 'Their bill goes into the drawer',
          13: 'Keep the drawer sorted',
          15: 'Everyone was served correctly',
        },
        java: {
          1: 'Define method taking the array of bills',
          2: 'The drawer holds every bill we have collected',
          3: 'Serve customers in order',
          4: 'Change owed = what they paid minus the $5 price',
          5: 'Try the biggest denominations first',
          6: 'While this bill fits in the remaining change and we own one',
          7: 'Remove it by value (not by index!)',
          8: 'Reduce the change still owed',
          11: 'Could not cover the full amount — return false',
          12: 'Their bill goes into the drawer',
          13: 'Keep the drawer sorted',
          15: 'Everyone was served correctly',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the list of bills',
      2: 'Count the $5 and $10 bills in the till ($20s are useless as change)',
      3: 'Serve customers in order',
      4: 'A $5 payment is exact',
      5: 'Just bank the bill',
      6: 'A $10 payment needs $5 back',
      7: 'No fives left?',
      8: 'Impossible — return false',
      9: 'Spend one five',
      10: 'Bank the ten',
      11: 'Otherwise it is a $20, needing $15 back',
      12: 'Prefer $10 + $5 when possible',
      13: 'Spend the ten',
      14: 'And one five',
      15: 'Otherwise fall back on three fives',
      16: 'Spend three fives',
      17: 'Neither combination is available',
      18: 'Impossible — return false',
      19: 'Everyone was served correctly',
    },
    javascript: {
      1: 'Define function taking the array of bills',
      2: 'Count the $5 and $10 bills in the till',
      3: 'Serve customers in order',
      4: 'A $5 payment is exact',
      5: 'Just bank the bill',
      6: 'A $10 payment needs $5 back',
      7: 'No fives left — impossible',
      8: 'Spend one five',
      9: 'Bank the ten',
      11: 'Otherwise it is a $20, needing $15 back',
      12: 'Prefer $10 + $5 when possible',
      13: 'Spend the ten',
      14: 'And one five',
      15: 'Otherwise fall back on three fives',
      16: 'Spend three fives',
      17: 'Neither combination is available — return false',
      21: 'Everyone was served correctly',
    },
    java: {
      1: 'Define method taking the array of bills',
      2: 'Count the $5 and $10 bills in the till',
      3: 'Serve customers in order',
      4: 'A $5 payment is exact',
      5: 'Just bank the bill',
      6: 'A $10 payment needs $5 back',
      7: 'No fives left — impossible',
      8: 'Spend one five',
      9: 'Bank the ten',
      11: 'Otherwise it is a $20, needing $15 back',
      12: 'Prefer $10 + $5 when possible',
      13: 'Spend the ten',
      14: 'And one five',
      15: 'Otherwise fall back on three fives',
      16: 'Spend three fives',
      17: 'Neither combination is available — return false',
      21: 'Everyone was served correctly',
    },
  },
};
