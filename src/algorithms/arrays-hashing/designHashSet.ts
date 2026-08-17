import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type HashSetOperation = [string, number];

const SIZE = 1000;

function runDesignHashSet(input: unknown): AlgorithmStep[] {
  const operations = input as HashSetOperation[];
  const steps: AlgorithmStep[] = [];
  const buckets = new Map<number, number[]>();
  const output: (boolean | null)[] = [];

  const view = (): Record<string, string> => {
    const map: Record<string, string> = {};
    const indexes = [...buckets.keys()].sort((a, b) => a - b);
    for (const idx of indexes) {
      map[`bucket ${idx}`] = `[${buckets.get(idx)!.join(' -> ')}]`;
    }
    if (indexes.length === 0) map['(all buckets)'] = 'empty';
    return map;
  };

  const bucketOf = (key: number) => {
    const idx = key % SIZE;
    if (!buckets.has(idx)) buckets.set(idx, []);
    return { idx, list: buckets.get(idx)! };
  };

  steps.push({
    state: { hashMap: view() },
    highlights: [],
    message: `MyHashSet with ${SIZE} buckets. key % ${SIZE} picks a bucket; each bucket is a small list, so colliding keys simply chain together.`,
    codeLine: 4,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, key] = operations[i];
    const idx = key % SIZE;

    steps.push({
      state: { hashMap: view() },
      highlights: [],
      message: `Op ${i + 1}: ${op}(${key}) — hash first: ${key} % ${SIZE} = bucket ${idx}`,
      codeLine: 7,
      action: 'visit',
    });

    if (op === 'add') {
      const { list } = bucketOf(key);
      const already = list.includes(key);
      if (!already) list.push(key);
      output.push(null);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: already
          ? `${key} is already in bucket ${idx} — a set holds no duplicates, so nothing changes.`
          : `Append ${key} to bucket ${idx}${list.length > 1 ? ` — it collides with ${list.slice(0, -1).join(', ')} and chains behind it` : ''}. Bucket is now [${list.join(' -> ')}].`,
        codeLine: 12,
        action: 'insert',
      });
    } else if (op === 'remove') {
      const { list } = bucketOf(key);
      const at = list.indexOf(key);
      if (at >= 0) list.splice(at, 1);
      output.push(null);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message:
          at >= 0
            ? `Found ${key} in bucket ${idx} — splice it out. Bucket is now [${list.join(' -> ')}].`
            : `${key} is not in bucket ${idx} — nothing to remove.`,
        codeLine: 17,
        action: 'delete',
      });
    } else {
      const { list } = bucketOf(key);
      const found = list.includes(key);
      output.push(found);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: `Scan bucket ${idx} = [${list.join(' -> ')}] for ${key} → ${found}. Only this one short chain is searched, never the whole set.`,
        codeLine: 20,
        action: found ? 'found' : 'compare',
      });
    }
  }

  steps.push({
    state: { hashMap: view(), result: output },
    highlights: [],
    message: `All ${operations.length} operations done. Outputs: [${output.map((v) => String(v)).join(', ')}] (null = void add/remove).`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

function runDesignHashSetBooleanArray(input: unknown): AlgorithmStep[] {
  const operations = input as HashSetOperation[];
  const steps: AlgorithmStep[] = [];
  const present = new Set<number>();
  const output: (boolean | null)[] = [];

  const view = (): Record<string, string> => {
    const map: Record<string, string> = {};
    const keys = [...present].sort((a, b) => a - b);
    for (const k of keys) map[`data[${k}]`] = 'true';
    if (keys.length === 0) map['(all slots)'] = 'false';
    return map;
  };

  steps.push({
    state: { hashMap: view() },
    highlights: [],
    message: `Keys are bounded by 10^6, so skip hashing entirely: allocate one boolean per possible key and index it directly. Every operation is a single array access.`,
    codeLine: 3,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, key] = operations[i];

    if (op === 'add') {
      present.add(key);
      output.push(null);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: `Op ${i + 1}: add(${key}) → data[${key}] = true. No hash, no chain — just one write.`,
        codeLine: 6,
        action: 'insert',
      });
    } else if (op === 'remove') {
      present.delete(key);
      output.push(null);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: `Op ${i + 1}: remove(${key}) → data[${key}] = false.`,
        codeLine: 9,
        action: 'delete',
      });
    } else {
      const found = present.has(key);
      output.push(found);
      steps.push({
        state: { hashMap: view() },
        highlights: [],
        message: `Op ${i + 1}: contains(${key}) → data[${key}] is ${found}. True O(1) worst case, but it costs a 10^6-slot array up front.`,
        codeLine: 12,
        action: found ? 'found' : 'compare',
      });
    }
  }

  steps.push({
    state: { hashMap: view(), result: output },
    highlights: [],
    message: `All ${operations.length} operations done. Outputs: [${output.map((v) => String(v)).join(', ')}] — identical to the chained version, traded time-per-op for memory.`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const designHashSet: Algorithm = {
  id: 'design-hash-set',
  name: 'Design HashSet',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n / k) average per operation',
  spaceComplexity: 'O(n + k)',
  pattern: 'Hash Set — bucket array with separate chaining',
  description:
    'Design a HashSet without using any built-in hash table libraries. Implement add(key) to insert a value, contains(key) to report whether it is present, and remove(key) to delete it.',
  problemUrl: 'https://leetcode.com/problems/design-hashset/',
  code: {
    python: `class MyHashSet:
    def __init__(self):
        self.size = 1000
        self.buckets = [[] for _ in range(self.size)]

    def _hash(self, key):
        return key % self.size

    def add(self, key):
        b = self.buckets[self._hash(key)]
        if key not in b:
            b.append(key)

    def remove(self, key):
        b = self.buckets[self._hash(key)]
        if key in b:
            b.remove(key)

    def contains(self, key):
        return key in self.buckets[self._hash(key)]`,
    javascript: `class MyHashSet {
    constructor() {
        this.size = 1000;
        this.buckets = Array.from({ length: this.size }, () => []);
    }

    _hash(key) {
        return key % this.size;
    }

    add(key) {
        const b = this.buckets[this._hash(key)];
        if (!b.includes(key)) {
            b.push(key);
        }
    }

    remove(key) {
        const b = this.buckets[this._hash(key)];
        const i = b.indexOf(key);
        if (i !== -1) {
            b.splice(i, 1);
        }
    }

    contains(key) {
        return this.buckets[this._hash(key)].includes(key);
    }
}`,
    java: `class MyHashSet {
    private static final int SIZE = 1000;
    private List<Integer>[] buckets;

    @SuppressWarnings("unchecked")
    public MyHashSet() {
        buckets = new List[SIZE];
        for (int i = 0; i < SIZE; i++) {
            buckets[i] = new LinkedList<>();
        }
    }

    private int hash(int key) {
        return key % SIZE;
    }

    public void add(int key) {
        List<Integer> b = buckets[hash(key)];
        if (!b.contains(key)) {
            b.add(key);
        }
    }

    public void remove(int key) {
        buckets[hash(key)].remove(Integer.valueOf(key));
    }

    public boolean contains(int key) {
        return buckets[hash(key)].contains(key);
    }
}`,
  },
  defaultInput: [
    ['add', 1],
    ['add', 2],
    ['contains', 1],
    ['contains', 3],
    ['add', 1001],
    ['contains', 1001],
    ['remove', 2],
    ['contains', 2],
  ],
  run: runDesignHashSet,
  optimalApproachName: 'Bucket Chaining',
  approaches: [
    {
      id: 'boolean-array',
      name: 'Boolean Array',
      timeComplexity: 'O(1) worst case per operation',
      spaceComplexity: 'O(range)',
      description:
        'Because keys are capped at 10^6, a single boolean per possible key removes hashing and chaining altogether — worst-case O(1) instead of average O(n/k), paid for with a fixed 10^6-slot array.',
      code: {
        python: `class MyHashSet:
    def __init__(self):
        self.data = [False] * 1000001

    def add(self, key):
        self.data[key] = True

    def remove(self, key):
        self.data[key] = False

    def contains(self, key):
        return self.data[key]`,
        javascript: `class MyHashSet {
    constructor() {
        this.data = new Array(1000001).fill(false);
    }

    add(key) {
        this.data[key] = true;
    }

    remove(key) {
        this.data[key] = false;
    }

    contains(key) {
        return this.data[key];
    }
}`,
        java: `class MyHashSet {
    private boolean[] data;

    public MyHashSet() {
        data = new boolean[1000001];
    }

    public void add(int key) {
        data[key] = true;
    }

    public void remove(int key) {
        data[key] = false;
    }

    public boolean contains(int key) {
        return data[key];
    }
}`,
      },
      run: runDesignHashSetBooleanArray,
      lineExplanations: {
        python: {
          1: 'The hash set class',
          2: 'Constructor — no buckets needed',
          3: 'One boolean slot for every key the problem allows',
          5: 'add(key)',
          6: 'Flip the slot on — O(1), no collision handling',
          8: 'remove(key)',
          9: 'Flip the slot off',
          11: 'contains(key)',
          12: 'The slot value is the answer',
        },
        javascript: {
          1: 'The hash set class',
          2: 'Constructor — no buckets needed',
          3: 'One boolean slot for every key the problem allows',
          6: 'add(key)',
          7: 'Flip the slot on — O(1), no collision handling',
          10: 'remove(key)',
          11: 'Flip the slot off',
          14: 'contains(key)',
          15: 'The slot value is the answer',
        },
        java: {
          1: 'The hash set class',
          2: 'A flat boolean array replaces the bucket table',
          4: 'Constructor allocates one slot per possible key',
          8: 'add(key)',
          9: 'Flip the slot on — O(1), no collision handling',
          12: 'remove(key)',
          13: 'Flip the slot off',
          16: 'contains(key)',
          17: 'The slot value is the answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'The hash set class',
      2: 'Constructor sets up the bucket table',
      3: 'Number of buckets — more buckets means shorter chains',
      4: 'Each bucket is its own list, so collisions can chain',
      6: 'Hash function mapping a key to a bucket index',
      7: 'Modulo spreads keys across the buckets',
      9: 'add(key)',
      10: 'Jump straight to the one bucket this key can live in',
      11: 'A set holds no duplicates',
      12: 'Chain the new key onto the end of that bucket',
      14: 'remove(key)',
      15: 'Same bucket lookup',
      16: 'Only remove if it is actually there',
      17: 'Unlink it from the chain',
      19: 'contains(key)',
      20: 'Search just that one short chain, never the whole set',
    },
    javascript: {
      1: 'The hash set class',
      2: 'Constructor sets up the bucket table',
      3: 'Number of buckets — more buckets means shorter chains',
      4: 'Each bucket is its own array, so collisions can chain',
      7: 'Hash function mapping a key to a bucket index',
      8: 'Modulo spreads keys across the buckets',
      11: 'add(key)',
      12: 'Jump straight to the one bucket this key can live in',
      13: 'A set holds no duplicates',
      14: 'Chain the new key onto the end of that bucket',
      18: 'remove(key)',
      20: 'Find its position within the chain',
      22: 'Splice it out of the chain',
      26: 'contains(key)',
      27: 'Search just that one short chain, never the whole set',
    },
    java: {
      1: 'The hash set class',
      2: 'Fixed number of buckets',
      3: 'Array of lists — one chain per bucket',
      6: 'Constructor allocates the table',
      8: 'Give every bucket its own empty chain',
      13: 'Hash function mapping a key to a bucket index',
      14: 'Modulo spreads keys across the buckets',
      17: 'add(key)',
      18: 'Jump straight to the one bucket this key can live in',
      19: 'A set holds no duplicates',
      20: 'Chain the new key onto that bucket',
      24: 'remove(key)',
      25: 'Remove by value (not index) from the chain',
      28: 'contains(key)',
      29: 'Search just that one short chain, never the whole set',
    },
  },
};
