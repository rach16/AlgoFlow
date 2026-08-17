import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type HashMapOperation = [string, ...number[]];

const SIZE = 1000;

function runDesignHashMap(input: unknown): AlgorithmStep[] {
  const operations = input as HashMapOperation[];
  const steps: AlgorithmStep[] = [];
  const buckets = new Map<number, [number, number][]>();
  const output: (number | null)[] = [];

  const view = (): Record<string, string> => {
    const map: Record<string, string> = {};
    const indexes = [...buckets.keys()].sort((a, b) => a - b);
    for (const idx of indexes) {
      const chain = buckets.get(idx)!;
      map[`bucket ${idx}`] = chain.length
        ? chain.map(([k, v]) => `${k}=${v}`).join(' -> ')
        : '(empty)';
    }
    if (indexes.length === 0) map['(all buckets)'] = 'empty';
    return map;
  };

  const bucketOf = (key: number) => {
    const idx = key % SIZE;
    if (!buckets.has(idx)) buckets.set(idx, []);
    return { idx, chain: buckets.get(idx)! };
  };

  steps.push({
    state: { hashMap: view() },
    highlights: [],
    message: `MyHashMap with ${SIZE} buckets. key % ${SIZE} picks a bucket; each bucket stores a chain of [key, value] pairs, so colliding keys coexist.`,
    codeLine: 4,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, key, value] = operations[i];
    const idx = key % SIZE;
    const label = op === 'put' ? `put(${key}, ${value})` : `${op}(${key})`;

    steps.push({
      state: { hashMap: view() },
      highlights: [],
      message: `Op ${i + 1}: ${label} — hash first: ${key} % ${SIZE} = bucket ${idx}`,
      codeLine: 7,
      action: 'visit',
    });

    if (op === 'put') {
      const { chain } = bucketOf(key);
      const existing = chain.find(([k]) => k === key);
      if (existing) {
        const old = existing[1];
        existing[1] = value;
        output.push(null);
        steps.push({
          state: { hashMap: view() },
          highlights: [],
          message: `Key ${key} already sits in bucket ${idx} — overwrite its value ${old} with ${value} instead of adding a duplicate.`,
          codeLine: 13,
          action: 'insert',
        });
      } else {
        chain.push([key, value]);
        output.push(null);
        steps.push({
          state: { hashMap: view() },
          highlights: [],
          message: `New key — append [${key}, ${value}] to bucket ${idx}${chain.length > 1 ? `, chaining behind ${chain.slice(0, -1).map(([k]) => k).join(', ')}` : ''}. Bucket: ${chain.map(([k, v]) => `${k}=${v}`).join(' -> ')}`,
          codeLine: 15,
          action: 'insert',
        });
      }
    } else if (op === 'get') {
      const { chain } = bucketOf(key);
      const hit = chain.find(([k]) => k === key);
      const answer = hit ? hit[1] : -1;
      output.push(answer);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: hit
          ? `Walk bucket ${idx} = ${chain.map(([k, v]) => `${k}=${v}`).join(' -> ')} and match key ${key} → return ${answer}`
          : `Bucket ${idx} = ${chain.length ? chain.map(([k, v]) => `${k}=${v}`).join(' -> ') : '(empty)'} has no key ${key} → return -1`,
        codeLine: hit ? 20 : 21,
        action: hit ? 'found' : 'compare',
      });
    } else {
      const { chain } = bucketOf(key);
      const at = chain.findIndex(([k]) => k === key);
      if (at >= 0) chain.splice(at, 1);
      output.push(null);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message:
          at >= 0
            ? `Found key ${key} in bucket ${idx} — pop that pair out. Bucket: ${chain.length ? chain.map(([k, v]) => `${k}=${v}`).join(' -> ') : '(empty)'}`
            : `Key ${key} is not in bucket ${idx} — nothing to remove.`,
        codeLine: 27,
        action: 'delete',
      });
    }
  }

  steps.push({
    state: { hashMap: view(), result: output },
    highlights: [],
    message: `All ${operations.length} operations done. Outputs: [${output.map((v) => String(v)).join(', ')}] (null = void put/remove).`,
    codeLine: 21,
    action: 'found',
  });

  return steps;
}

function runDesignHashMapDirectAddress(input: unknown): AlgorithmStep[] {
  const operations = input as HashMapOperation[];
  const steps: AlgorithmStep[] = [];
  const data = new Map<number, number>();
  const output: (number | null)[] = [];

  const view = (): Record<string, string> => {
    const map: Record<string, string> = {};
    const keys = [...data.keys()].sort((a, b) => a - b);
    for (const k of keys) map[`data[${k}]`] = String(data.get(k));
    if (keys.length === 0) map['(all slots)'] = '-1';
    return map;
  };

  steps.push({
    state: { hashMap: view() },
    highlights: [],
    message: `Keys are capped at 10^6, so the key IS the index: one array of 10^6+1 slots prefilled with -1. No hashing, no chains, no collisions.`,
    codeLine: 3,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, key, value] = operations[i];

    if (op === 'put') {
      data.set(key, value);
      output.push(null);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: `Op ${i + 1}: put(${key}, ${value}) → data[${key}] = ${value}. A single write, no chain to walk.`,
        codeLine: 6,
        action: 'insert',
      });
    } else if (op === 'get') {
      const answer = data.has(key) ? data.get(key)! : -1;
      output.push(answer);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: `Op ${i + 1}: get(${key}) → data[${key}] = ${answer}${answer === -1 ? ' (the sentinel meaning "absent")' : ''}. Worst-case O(1), unlike walking a chain.`,
        codeLine: 9,
        action: answer === -1 ? 'compare' : 'found',
      });
    } else {
      data.delete(key);
      output.push(null);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: `Op ${i + 1}: remove(${key}) → reset data[${key}] to the -1 sentinel.`,
        codeLine: 12,
        action: 'delete',
      });
    }
  }

  steps.push({
    state: { hashMap: view(), result: output },
    highlights: [],
    message: `All ${operations.length} operations done. Outputs: [${output.map((v) => String(v)).join(', ')}] — same answers as chaining, trading ~4 MB of memory for guaranteed O(1).`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const designHashMap: Algorithm = {
  id: 'design-hash-map',
  name: 'Design HashMap',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n / k) average per operation',
  spaceComplexity: 'O(n + k)',
  pattern: 'Hash Map — bucket array with separate chaining',
  description:
    'Design a HashMap without using any built-in hash table libraries. Implement put(key, value) to insert or update a mapping, get(key) to return the mapped value or -1 if absent, and remove(key) to delete the mapping.',
  problemUrl: 'https://leetcode.com/problems/design-hashmap/',
  code: {
    python: `class MyHashMap:
    def __init__(self):
        self.size = 1000
        self.buckets = [[] for _ in range(self.size)]

    def _hash(self, key):
        return key % self.size

    def put(self, key, value):
        b = self.buckets[self._hash(key)]
        for pair in b:
            if pair[0] == key:
                pair[1] = value
                return
        b.append([key, value])

    def get(self, key):
        for pair in self.buckets[self._hash(key)]:
            if pair[0] == key:
                return pair[1]
        return -1

    def remove(self, key):
        b = self.buckets[self._hash(key)]
        for i, pair in enumerate(b):
            if pair[0] == key:
                b.pop(i)
                return`,
    javascript: `class MyHashMap {
    constructor() {
        this.size = 1000;
        this.buckets = Array.from({ length: this.size }, () => []);
    }

    _hash(key) {
        return key % this.size;
    }

    put(key, value) {
        const b = this.buckets[this._hash(key)];
        for (const pair of b) {
            if (pair[0] === key) {
                pair[1] = value;
                return;
            }
        }
        b.push([key, value]);
    }

    get(key) {
        for (const pair of this.buckets[this._hash(key)]) {
            if (pair[0] === key) {
                return pair[1];
            }
        }
        return -1;
    }

    remove(key) {
        const b = this.buckets[this._hash(key)];
        for (let i = 0; i < b.length; i++) {
            if (b[i][0] === key) {
                b.splice(i, 1);
                return;
            }
        }
    }
}`,
    java: `class MyHashMap {
    private static final int SIZE = 1000;
    private List<int[]>[] buckets;

    @SuppressWarnings("unchecked")
    public MyHashMap() {
        buckets = new List[SIZE];
        for (int i = 0; i < SIZE; i++) {
            buckets[i] = new LinkedList<>();
        }
    }

    private int hash(int key) {
        return key % SIZE;
    }

    public void put(int key, int value) {
        List<int[]> b = buckets[hash(key)];
        for (int[] pair : b) {
            if (pair[0] == key) {
                pair[1] = value;
                return;
            }
        }
        b.add(new int[] { key, value });
    }

    public int get(int key) {
        for (int[] pair : buckets[hash(key)]) {
            if (pair[0] == key) {
                return pair[1];
            }
        }
        return -1;
    }

    public void remove(int key) {
        buckets[hash(key)].removeIf(pair -> pair[0] == key);
    }
}`,
  },
  defaultInput: [
    ['put', 1, 1],
    ['put', 2, 2],
    ['get', 1],
    ['get', 3],
    ['put', 2, 1],
    ['get', 2],
    ['put', 1001, 7],
    ['get', 1001],
    ['remove', 2],
    ['get', 2],
  ],
  run: runDesignHashMap,
  optimalApproachName: 'Bucket Chaining',
  approaches: [
    {
      id: 'direct-address-array',
      name: 'Direct Address Array',
      timeComplexity: 'O(1) worst case per operation',
      spaceComplexity: 'O(range)',
      description:
        'Since keys are capped at 10^6, use the key itself as the array index with -1 as the "absent" sentinel — no hash function and no chain walking, so every operation is worst-case O(1) instead of average O(n/k).',
      code: {
        python: `class MyHashMap:
    def __init__(self):
        self.data = [-1] * 1000001

    def put(self, key, value):
        self.data[key] = value

    def get(self, key):
        return self.data[key]

    def remove(self, key):
        self.data[key] = -1`,
        javascript: `class MyHashMap {
    constructor() {
        this.data = new Array(1000001).fill(-1);
    }

    put(key, value) {
        this.data[key] = value;
    }

    get(key) {
        return this.data[key];
    }

    remove(key) {
        this.data[key] = -1;
    }
}`,
        java: `class MyHashMap {
    private int[] data;

    public MyHashMap() {
        data = new int[1000001];
        Arrays.fill(data, -1);
    }

    public void put(int key, int value) {
        data[key] = value;
    }

    public int get(int key) {
        return data[key];
    }

    public void remove(int key) {
        data[key] = -1;
    }
}`,
      },
      run: runDesignHashMapDirectAddress,
      lineExplanations: {
        python: {
          1: 'The hash map class',
          2: 'Constructor — no bucket table needed',
          3: 'One slot per possible key, prefilled with the -1 sentinel',
          5: 'put(key, value)',
          6: 'The key is the index — a single write',
          8: 'get(key)',
          9: 'Read the slot; -1 already means "absent"',
          11: 'remove(key)',
          12: 'Reset the slot to the sentinel',
        },
        javascript: {
          1: 'The hash map class',
          2: 'Constructor — no bucket table needed',
          3: 'One slot per possible key, prefilled with the -1 sentinel',
          6: 'put(key, value)',
          7: 'The key is the index — a single write',
          10: 'get(key)',
          11: 'Read the slot; -1 already means "absent"',
          14: 'remove(key)',
          15: 'Reset the slot to the sentinel',
        },
        java: {
          1: 'The hash map class',
          2: 'A flat int array replaces the bucket table',
          4: 'Constructor allocates one slot per possible key',
          6: 'Prefill every slot with the -1 sentinel',
          9: 'put(key, value)',
          10: 'The key is the index — a single write',
          13: 'get(key)',
          14: 'Read the slot; -1 already means "absent"',
          17: 'remove(key)',
          18: 'Reset the slot to the sentinel',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'The hash map class',
      2: 'Constructor sets up the bucket table',
      3: 'Number of buckets — more buckets means shorter chains',
      4: 'Each bucket holds its own chain of [key, value] pairs',
      6: 'Hash function mapping a key to a bucket index',
      7: 'Modulo spreads keys across the buckets',
      9: 'put(key, value)',
      10: 'Only one bucket can hold this key',
      11: 'Walk that bucket chain',
      12: 'Key already present?',
      13: 'Overwrite the value instead of adding a duplicate',
      15: 'New key — chain the pair onto the bucket',
      17: 'get(key)',
      18: 'Walk only the chain the key hashes to',
      20: 'Return the paired value',
      21: '-1 is the agreed sentinel for a missing key',
      23: 'remove(key)',
      25: 'Scan the chain with positions so we can pop',
      27: 'Unlink the pair from the chain',
    },
    javascript: {
      1: 'The hash map class',
      2: 'Constructor sets up the bucket table',
      3: 'Number of buckets — more buckets means shorter chains',
      4: 'Each bucket holds its own chain of [key, value] pairs',
      7: 'Hash function mapping a key to a bucket index',
      8: 'Modulo spreads keys across the buckets',
      11: 'put(key, value)',
      12: 'Only one bucket can hold this key',
      13: 'Walk that bucket chain',
      14: 'Key already present?',
      15: 'Overwrite the value instead of adding a duplicate',
      19: 'New key — chain the pair onto the bucket',
      22: 'get(key)',
      23: 'Walk only the chain the key hashes to',
      25: 'Return the paired value',
      28: '-1 is the agreed sentinel for a missing key',
      31: 'remove(key)',
      33: 'Scan the chain by index so we can splice',
      35: 'Unlink the pair from the chain',
    },
    java: {
      1: 'The hash map class',
      2: 'Fixed number of buckets',
      3: 'Array of lists — one chain of int[2] pairs per bucket',
      6: 'Constructor allocates the table',
      8: 'Give every bucket its own empty chain',
      13: 'Hash function mapping a key to a bucket index',
      14: 'Modulo spreads keys across the buckets',
      17: 'put(key, value)',
      18: 'Only one bucket can hold this key',
      19: 'Walk that bucket chain',
      21: 'Overwrite the value instead of adding a duplicate',
      25: 'New key — chain the pair onto the bucket',
      28: 'get(key)',
      29: 'Walk only the chain the key hashes to',
      31: 'Return the paired value',
      34: '-1 is the agreed sentinel for a missing key',
      37: 'remove(key)',
      38: 'Drop the matching pair from the chain',
    },
  },
};
