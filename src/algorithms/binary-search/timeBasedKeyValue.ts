import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type Operation = [string, ...string[]];

function runTimeBasedKeyValue(input: unknown): AlgorithmStep[] {
  const operations = input as Operation[];
  const steps: AlgorithmStep[] = [];

  // Internal store: key -> [[value, timestamp], ...]
  const store: Record<string, [string, number][]> = {};

  // Deep copy store for snapshots
  const copyStore = (): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(store)) {
      result[key] = store[key].map(([v, t]) => `${v} (t=${t})`);
    }
    return result;
  };

  steps.push({
    state: { hashMap: {} },
    highlights: [],
    message: `Initialize TimeMap — processing ${operations.length} operations`,
    codeLine: 1,
  });

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];

    if (op[0] === 'set') {
      const key = op[1];
      const value = op[2];
      const timestamp = Number(op[3]);

      steps.push({
        state: { hashMap: copyStore(), operation: `set("${key}", "${value}", ${timestamp})` },
        highlights: [],
        message: `Operation ${i + 1}: set("${key}", "${value}", ${timestamp})`,
        codeLine: 3,
        action: 'visit',
      });

      if (!store[key]) {
        store[key] = [];
      }
      store[key].push([value, timestamp]);

      steps.push({
        state: { hashMap: copyStore(), operation: `set("${key}", "${value}", ${timestamp})` },
        highlights: [],
        message: `Stored: ${key} -> "${value}" at timestamp ${timestamp}`,
        codeLine: 5,
        action: 'insert',
      });
    } else if (op[0] === 'get') {
      const key = op[1];
      const timestamp = Number(op[2]);

      steps.push({
        state: { hashMap: copyStore(), operation: `get("${key}", ${timestamp})` },
        highlights: [],
        message: `Operation ${i + 1}: get("${key}", ${timestamp})`,
        codeLine: 7,
        action: 'visit',
      });

      if (!store[key] || store[key].length === 0) {
        steps.push({
          state: { hashMap: copyStore(), operation: `get("${key}", ${timestamp})`, result: '' },
          highlights: [],
          message: `Key "${key}" not found — return ""`,
          codeLine: 9,
        });
        continue;
      }

      // Binary search for largest timestamp <= given timestamp
      const values = store[key];

      steps.push({
        state: {
          hashMap: copyStore(),
          operation: `get("${key}", ${timestamp})`,
          searchValues: values.map(([v, t]) => `"${v}" (t=${t})`),
        },
        highlights: [],
        message: `Binary search in ${key}'s timestamps for largest <= ${timestamp}`,
        codeLine: 10,
      });

      let left = 0;
      let right = values.length - 1;
      let resultValue = '';

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const [midVal, midTs] = values[mid];

        steps.push({
          state: {
            hashMap: copyStore(),
            operation: `get("${key}", ${timestamp})`,
            searchValues: values.map(([v, t]) => `"${v}" (t=${t})`),
            left,
            right,
            mid,
          },
          highlights: [mid],
          pointers: { left, mid, right },
          message: `mid=${mid}: "${midVal}" at t=${midTs}`,
          codeLine: 12,
          action: 'compare',
        });

        if (midTs <= timestamp) {
          resultValue = midVal;

          steps.push({
            state: {
              hashMap: copyStore(),
              operation: `get("${key}", ${timestamp})`,
              searchValues: values.map(([v, t]) => `"${v}" (t=${t})`),
              left,
              right,
              mid,
              currentBest: resultValue,
            },
            highlights: [mid],
            pointers: { left, mid, right },
            message: `t=${midTs} <= ${timestamp} — candidate "${midVal}", search right for closer match`,
            codeLine: 14,
            action: 'compare',
          });

          left = mid + 1;
        } else {
          steps.push({
            state: {
              hashMap: copyStore(),
              operation: `get("${key}", ${timestamp})`,
              searchValues: values.map(([v, t]) => `"${v}" (t=${t})`),
              left,
              right,
              mid,
            },
            highlights: [mid],
            pointers: { left, mid, right },
            message: `t=${midTs} > ${timestamp} — too new, search left`,
            codeLine: 16,
            action: 'compare',
          });

          right = mid - 1;
        }
      }

      steps.push({
        state: {
          hashMap: copyStore(),
          operation: `get("${key}", ${timestamp})`,
          result: resultValue,
        },
        highlights: [],
        message: `get("${key}", ${timestamp}) = "${resultValue}"`,
        codeLine: 18,
        action: 'found',
      });
    }
  }

  // Final state
  steps.push({
    state: { hashMap: copyStore() },
    highlights: [],
    message: `All operations complete. Final store: ${JSON.stringify(copyStore())}`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

export const timeBasedKeyValue: Algorithm = {
  id: 'time-based-key-value',
  name: 'Time Based Key-Value Store',
  category: 'Binary Search',
  difficulty: 'Medium',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map + Binary Search — store by key, binary search timestamps',
  description:
    'Design a time-based key-value data structure that can store multiple values for the same key at different timestamps and retrieve the key\'s value at a certain timestamp. Implement the TimeMap class with set(key, value, timestamp) and get(key, timestamp) that returns the value with the largest timestamp <= the given timestamp.',
  problemUrl: 'https://leetcode.com/problems/time-based-key-value-store/',
  code: {
    python: `class TimeMap:
    def __init__(self):
        self.store = {}  # key: [(value, timestamp)]

    def set(self, key, value, timestamp):
        if key not in self.store:
            self.store[key] = []
        self.store[key].append((value, timestamp))

    def get(self, key, timestamp):
        values = self.store.get(key, [])
        result = ""
        left, right = 0, len(values) - 1

        while left <= right:
            mid = (left + right) // 2
            if values[mid][1] <= timestamp:
                result = values[mid][0]
                left = mid + 1
            else:
                right = mid - 1

        return result`,
    javascript: `class TimeMap {
    constructor() {
        this.store = {}; // key: [[value, timestamp]]
    }

    set(key, value, timestamp) {
        if (!this.store[key]) {
            this.store[key] = [];
        }
        this.store[key].push([value, timestamp]);
    }

    get(key, timestamp) {
        const values = this.store[key] || [];
        let result = "";
        let left = 0, right = values.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (values[mid][1] <= timestamp) {
                result = values[mid][0];
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return result;
    }
}`,
  },
  defaultInput: [
    ['set', 'foo', 'bar', '1'],
    ['get', 'foo', '1'],
    ['get', 'foo', '3'],
    ['set', 'foo', 'bar2', '4'],
    ['get', 'foo', '4'],
    ['get', 'foo', '5'],
  ],
  run: runTimeBasedKeyValue,
};
