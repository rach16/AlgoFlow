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

function runTimeBasedKeyValueLinearScan(input: unknown): AlgorithmStep[] {
  const operations = input as Operation[];
  const steps: AlgorithmStep[] = [];

  const store: Record<string, [string, number][]> = {};

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
    message: `Initialize TimeMap — get() will scan timestamps newest-to-oldest instead of binary searching. Processing ${operations.length} operations`,
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
        codeLine: 5,
        action: 'visit',
      });

      if (!store[key]) {
        store[key] = [];
      }
      store[key].push([value, timestamp]);

      steps.push({
        state: { hashMap: copyStore(), operation: `set("${key}", "${value}", ${timestamp})` },
        highlights: [],
        message: `Stored: ${key} -> "${value}" at timestamp ${timestamp} (timestamps arrive in increasing order)`,
        codeLine: 8,
        action: 'insert',
      });
    } else if (op[0] === 'get') {
      const key = op[1];
      const timestamp = Number(op[2]);

      steps.push({
        state: { hashMap: copyStore(), operation: `get("${key}", ${timestamp})` },
        highlights: [],
        message: `Operation ${i + 1}: get("${key}", ${timestamp})`,
        codeLine: 10,
        action: 'visit',
      });

      const values = store[key] || [];

      if (values.length === 0) {
        steps.push({
          state: { hashMap: copyStore(), operation: `get("${key}", ${timestamp})`, result: '' },
          highlights: [],
          message: `Key "${key}" not found — return ""`,
          codeLine: 15,
        });
        continue;
      }

      steps.push({
        state: {
          hashMap: copyStore(),
          operation: `get("${key}", ${timestamp})`,
          searchValues: values.map(([v, t]) => `"${v}" (t=${t})`),
        },
        highlights: [],
        message: `Scan ${key}'s ${values.length} entries from newest to oldest for the first timestamp <= ${timestamp}`,
        codeLine: 11,
      });

      let resultValue = '';
      let found = false;

      for (let idx = values.length - 1; idx >= 0; idx--) {
        const [val, ts] = values[idx];

        steps.push({
          state: {
            hashMap: copyStore(),
            operation: `get("${key}", ${timestamp})`,
            searchValues: values.map(([v, t]) => `"${v}" (t=${t})`),
          },
          highlights: [idx],
          pointers: { i: idx },
          message: `Entry ${idx}: "${val}" at t=${ts} — is ${ts} <= ${timestamp}?`,
          codeLine: 13,
          action: 'compare',
        });

        if (ts <= timestamp) {
          resultValue = val;
          found = true;

          steps.push({
            state: {
              hashMap: copyStore(),
              operation: `get("${key}", ${timestamp})`,
              searchValues: values.map(([v, t]) => `"${v}" (t=${t})`),
              result: resultValue,
            },
            highlights: [idx],
            pointers: { i: idx },
            message: `t=${ts} <= ${timestamp} — newest valid entry, since we scan newest-first. get("${key}", ${timestamp}) = "${resultValue}"`,
            codeLine: 14,
            action: 'found',
          });
          break;
        }
      }

      if (!found) {
        steps.push({
          state: { hashMap: copyStore(), operation: `get("${key}", ${timestamp})`, result: '' },
          highlights: [],
          message: `Every stored timestamp is newer than ${timestamp} — return ""`,
          codeLine: 15,
        });
      }
    }
  }

  steps.push({
    state: { hashMap: copyStore() },
    highlights: [],
    message: `All operations complete. Linear scan makes get() O(n) per call — binary search exploits the sorted timestamps for O(log n)`,
    codeLine: 15,
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
    java: `class TimeMap {
    private Map<String, List<Pair<String, Integer>>> store;

    public TimeMap() {
        store = new HashMap<>();
    }

    public void set(String key, String value, int timestamp) {
        store.putIfAbsent(key, new ArrayList<>());
        store.get(key).add(new Pair<>(value, timestamp));
    }

    public String get(String key, int timestamp) {
        List<Pair<String, Integer>> values = store.getOrDefault(key, new ArrayList<>());
        String result = "";
        int left = 0, right = values.size() - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (values.get(mid).getValue() <= timestamp) {
                result = values.get(mid).getKey();
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return result;
    }

    static class Pair<K, V> {
        private K key;
        private V value;

        public Pair(K key, V value) {
            this.key = key;
            this.value = value;
        }

        public K getKey() { return key; }
        public V getValue() { return value; }
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
  optimalApproachName: 'Binary Search',
  approaches: [
    {
      id: 'linear-scan-timestamps',
      name: 'Linear Scan of Timestamps',
      timeComplexity: 'O(n) per get',
      spaceComplexity: 'O(n)',
      description:
        'Scan a key\'s entries from newest to oldest and return the first timestamp <= the query — an O(n) walk that ignores the sorted order binary search exploits for O(log n).',
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
        for value, ts in reversed(values):
            if ts <= timestamp:
                return value
        return ""`,
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
        for (let i = values.length - 1; i >= 0; i--) {
            if (values[i][1] <= timestamp) {
                return values[i][0];
            }
        }
        return "";
    }
}`,
        java: `class TimeMap {
    private Map<String, List<Pair<String, Integer>>> store;

    public TimeMap() {
        store = new HashMap<>();
    }

    public void set(String key, String value, int timestamp) {
        store.putIfAbsent(key, new ArrayList<>());
        store.get(key).add(new Pair<>(value, timestamp));
    }

    public String get(String key, int timestamp) {
        List<Pair<String, Integer>> values = store.getOrDefault(key, new ArrayList<>());
        for (int i = values.size() - 1; i >= 0; i--) {
            if (values.get(i).getValue() <= timestamp) {
                return values.get(i).getKey();
            }
        }
        return "";
    }

    static class Pair<K, V> {
        private K key;
        private V value;

        public Pair(K key, V value) {
            this.key = key;
            this.value = value;
        }

        public K getKey() { return key; }
        public V getValue() { return value; }
    }
}`,
      },
      run: runTimeBasedKeyValueLinearScan,
      lineExplanations: {
        python: {
          1: 'Define TimeMap class',
          2: 'Constructor initializes the store',
          3: 'Dict mapping key to list of (value, timestamp)',
          5: 'Define set method with key, value, timestamp',
          6: 'If key not yet in store, create empty list',
          7: 'Initialize empty list for new key',
          8: 'Append (value, timestamp) — timestamps arrive in increasing order',
          10: 'Define get method with key and timestamp',
          11: 'Get the list for key, or empty list',
          12: 'Walk entries newest-to-oldest so the first hit is the best one',
          13: 'Is this entry old enough (ts <= query timestamp)?',
          14: 'First valid entry seen is the newest valid one — return it',
          15: 'Every entry is too new (or key missing) — return empty string',
        },
        javascript: {
          1: 'Define TimeMap class',
          2: 'Constructor initializes the store',
          3: 'Object mapping key to array of [value, ts]',
          6: 'Define set method with key, value, timestamp',
          7: 'If key not yet in store, create empty array',
          8: 'Initialize empty array for new key',
          10: 'Append [value, timestamp] — timestamps arrive in increasing order',
          13: 'Define get method with key and timestamp',
          14: 'Get the array for key, or empty array',
          15: 'Walk entries newest-to-oldest so the first hit is the best one',
          16: 'Is this entry old enough (ts <= query timestamp)?',
          17: 'First valid entry seen is the newest valid one — return it',
          20: 'Every entry is too new (or key missing) — return empty string',
        },
        java: {
          1: 'Define TimeMap class',
          2: 'Map storing key to list of (value, timestamp)',
          4: 'Constructor initializes the store',
          5: 'Create new HashMap',
          8: 'Define set method with key, value, timestamp',
          9: 'Create list for key if absent',
          10: 'Append (value, timestamp) — timestamps arrive in increasing order',
          13: 'Define get method with key and timestamp',
          14: 'Get list for key, or empty list',
          15: 'Walk entries newest-to-oldest so the first hit is the best one',
          16: 'Is this entry old enough (ts <= query timestamp)?',
          17: 'First valid entry seen is the newest valid one — return it',
          20: 'Every entry is too new (or key missing) — return empty string',
          23: 'Inner Pair class for storing key-value pairs',
          24: 'First element (the value string)',
          25: 'Second element (the timestamp)',
          27: 'Pair constructor',
          28: 'Set the key field',
          29: 'Set the value field',
          32: 'Getter for key',
          33: 'Getter for value',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define TimeMap class',
      2: 'Constructor initializes the store',
      3: 'Dict mapping key to list of (value, timestamp)',
      5: 'Define set method with key, value, timestamp',
      6: 'If key not yet in store, create empty list',
      7: 'Initialize empty list for new key',
      8: 'Append (value, timestamp) pair to key list',
      10: 'Define get method with key and timestamp',
      11: 'Get the list for key, or empty list',
      12: 'Default result is empty string',
      13: 'Init binary search bounds on the list',
      15: 'Binary search for largest timestamp <= target',
      16: 'Compute midpoint index',
      17: 'If mid timestamp <= target, candidate found',
      18: 'Update result with this value',
      19: 'Search right for a closer timestamp',
      21: 'Mid timestamp too large, search left',
      23: 'Return best matching value or empty string',
    },
    javascript: {
      1: 'Define TimeMap class',
      2: 'Constructor initializes the store',
      3: 'Object mapping key to array of [value, ts]',
      6: 'Define set method with key, value, timestamp',
      7: 'If key not yet in store, create empty array',
      8: 'Initialize empty array for new key',
      10: 'Append [value, timestamp] pair to key array',
      13: 'Define get method with key and timestamp',
      14: 'Get the array for key, or empty array',
      15: 'Default result is empty string',
      16: 'Init binary search bounds on the array',
      18: 'Binary search for largest timestamp <= target',
      19: 'Compute midpoint index',
      20: 'If mid timestamp <= target, candidate found',
      21: 'Update result with this value',
      22: 'Search right for a closer timestamp',
      24: 'Mid timestamp too large, search left',
      28: 'Return best matching value or empty string',
    },
    java: {
      1: 'Define TimeMap class',
      2: 'Map storing key to list of (value, timestamp)',
      4: 'Constructor initializes the store',
      5: 'Create new HashMap',
      8: 'Define set method with key, value, timestamp',
      9: 'Create list for key if absent',
      10: 'Append (value, timestamp) pair',
      13: 'Define get method with key and timestamp',
      14: 'Get list for key, or empty list',
      15: 'Default result is empty string',
      16: 'Init binary search bounds on the list',
      18: 'Binary search for largest timestamp <= target',
      19: 'Compute midpoint avoiding overflow',
      20: 'If mid timestamp <= target, candidate found',
      21: 'Update result with this value',
      22: 'Search right for a closer timestamp',
      24: 'Mid timestamp too large, search left',
      28: 'Return best matching value or empty string',
      31: 'Inner Pair class for storing key-value pairs',
      32: 'First element (the value string)',
      33: 'Second element (the timestamp)',
      35: 'Pair constructor',
      36: 'Set the key field',
      37: 'Set the value field',
      40: 'Getter for key',
      41: 'Getter for value',
    },
  },
};
