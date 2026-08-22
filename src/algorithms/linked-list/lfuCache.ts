import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type Operation = [string, ...number[]];

const CAPACITY = 2;

function runLfuCache(input: unknown): AlgorithmStep[] {
  const operations = input as Operation[];
  const steps: AlgorithmStep[] = [];

  const cache = new Map<number, number>();
  const counts = new Map<number, number>();
  const buckets = new Map<number, number[]>(); // freq -> keys, least-recent first
  let minCount = 0;
  const results: number[] = [];

  const order = () => {
    const freqs = [...buckets.keys()].sort((a, b) => a - b);
    const out: { val: string; id: number }[] = [];
    for (const f of freqs) {
      for (const k of buckets.get(f)!) {
        out.push({ val: `${k}:${cache.get(k)} f${f}`, id: k });
      }
    }
    return out;
  };
  const hm = () => {
    const map: Record<string, string> = {};
    cache.forEach((v, k) => {
      map[`key=${k}`] = `val=${v}, freq=${counts.get(k)}`;
    });
    return map;
  };
  const idxOf = (key: number) => order().findIndex((n) => n.id === key);
  const bucketSummary = () =>
    [...buckets.keys()]
      .sort((a, b) => a - b)
      .map((f) => `f${f}:[${buckets.get(f)!.join(',')}]`)
      .join(' ');

  steps.push({
    state: {
      linkedList: [],
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: {},
    },
    highlights: [],
    message: `LFU cache, capacity ${CAPACITY}. Evict the LEAST-USED key; break ties by least-recently-used. Trick: bucket keys by use count, keep each bucket in LRU order, and track minCount — every operation stays O(1). The list below is drawn in eviction order (victim on the left).`,
    codeLine: 6,
  });

  const touch = (key: number, prefix: string) => {
    const c = counts.get(key)!;
    const arr = buckets.get(c)!;
    arr.splice(arr.indexOf(key), 1);
    if (arr.length === 0) {
      buckets.delete(c);
      if (minCount === c) minCount = c + 1;
    }
    counts.set(key, c + 1);
    if (!buckets.has(c + 1)) buckets.set(c + 1, []);
    buckets.get(c + 1)!.push(key);

    steps.push({
      state: {
        linkedList: order(),
        linkedListHighlights: [idxOf(key)],
        linkedListSecondary: [],
        linkedListPointers: { 'next victim': 0 },
        hashMap: hm(),
      },
      highlights: [idxOf(key)],
      message: `${prefix} key ${key} moves from bucket ${c} to bucket ${c + 1} and goes to the back of it (most recent). minCount = ${minCount}. Buckets: ${bucketSummary()}.`,
      codeLine: 17,
      action: 'swap',
    });
  };

  for (let opIdx = 0; opIdx < operations.length; opIdx++) {
    const [name, key, value] = operations[opIdx];

    if (name === 'put') {
      if (cache.has(key)) {
        cache.set(key, value);
        steps.push({
          state: {
            linkedList: order(),
            linkedListHighlights: [idxOf(key)],
            linkedListSecondary: [],
            linkedListPointers: { 'next victim': 0 },
            hashMap: hm(),
          },
          highlights: [idxOf(key)],
          message: `Op ${opIdx + 1}: put(${key}, ${value}) — key ${key} already cached, so overwrite the value. A write counts as a use.`,
          codeLine: 29,
          action: 'visit',
        });
        touch(key, 'Overwrite counts as a use:');
        continue;
      }

      if (cache.size === CAPACITY) {
        const victim = buckets.get(minCount)![0];
        steps.push({
          state: {
            linkedList: order(),
            linkedListHighlights: [0],
            linkedListSecondary: [],
            linkedListPointers: { evict: 0 },
            hashMap: hm(),
          },
          highlights: [0],
          message: `Op ${opIdx + 1}: put(${key}, ${value}) — cache is full. minCount = ${minCount}, and the front of bucket ${minCount} is key ${victim}, so it is both least-used and least-recently-used. Evict it. No scanning required.`,
          codeLine: 33,
          action: 'delete',
        });
        buckets.get(minCount)!.splice(0, 1);
        if (buckets.get(minCount)!.length === 0) buckets.delete(minCount);
        cache.delete(victim);
        counts.delete(victim);
      }

      cache.set(key, value);
      counts.set(key, 1);
      if (!buckets.has(1)) buckets.set(1, []);
      buckets.get(1)!.push(key);
      minCount = 1;

      steps.push({
        state: {
          linkedList: order(),
          linkedListHighlights: [idxOf(key)],
          linkedListSecondary: [],
          linkedListPointers: { 'next victim': 0 },
          hashMap: hm(),
        },
        highlights: [idxOf(key)],
        message: `Insert ${key}:${value} with count 1 and reset minCount = 1 — a brand-new key is always the least used. Buckets: ${bucketSummary()}.`,
        codeLine: 38,
        action: 'insert',
      });
    } else if (name === 'get') {
      if (!cache.has(key)) {
        results.push(-1);
        steps.push({
          state: {
            linkedList: order(),
            linkedListHighlights: [],
            linkedListSecondary: [],
            linkedListPointers: { 'next victim': 0 },
            hashMap: hm(),
          },
          highlights: [],
          message: `Op ${opIdx + 1}: get(${key}) — miss (it was evicted earlier). Return -1, and a miss does NOT create or bump any count.`,
          codeLine: 21,
          action: 'compare',
        });
        continue;
      }

      const v = cache.get(key)!;
      results.push(v);
      steps.push({
        state: {
          linkedList: order(),
          linkedListHighlights: [idxOf(key)],
          linkedListSecondary: [],
          linkedListPointers: { 'next victim': 0 },
          hashMap: hm(),
        },
        highlights: [idxOf(key)],
        message: `Op ${opIdx + 1}: get(${key}) — hit, return ${v}. Now bump its use count.`,
        codeLine: 23,
        action: 'found',
      });
      touch(key, 'Read counts as a use:');
    }
  }

  steps.push({
    state: {
      linkedList: order(),
      linkedListHighlights: order().map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: order().length ? { 'next victim': 0 } : {},
      hashMap: hm(),
      result: results.join(', '),
    },
    highlights: [],
    message: `All ops done. get outputs: [${results.join(', ')}]. Final buckets: ${bucketSummary()} — every get, put and eviction was O(1).`,
    codeLine: 39,
    action: 'found',
  });

  return steps;
}

function runLfuCacheScan(input: unknown): AlgorithmStep[] {
  const operations = input as Operation[];
  const steps: AlgorithmStep[] = [];

  // key -> [value, count, lastUsed]
  const cache = new Map<number, [number, number, number]>();
  let time = 0;
  const results: number[] = [];

  const show = () =>
    [...cache.entries()].map(([k, e]) => ({ val: `${k}:${e[0]} f${e[1]} t${e[2]}`, id: k }));
  const hm = () => {
    const map: Record<string, string> = {};
    cache.forEach((e, k) => {
      map[`key=${k}`] = `val=${e[0]}, freq=${e[1]}, used@${e[2]}`;
    });
    return map;
  };
  const idxOf = (key: number) => show().findIndex((n) => n.id === key);

  steps.push({
    state: {
      linkedList: [],
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: {},
    },
    highlights: [],
    message: `Simpler LFU: one hash map storing [value, useCount, lastUsedTime] per key. get and put are O(1), but choosing a victim means scanning every entry — O(n) on eviction.`,
    codeLine: 4,
  });

  for (let opIdx = 0; opIdx < operations.length; opIdx++) {
    const [name, key, value] = operations[opIdx];
    time++;

    if (name === 'put') {
      if (cache.has(key)) {
        const e = cache.get(key)!;
        e[0] = value;
        e[1]++;
        e[2] = time;
        steps.push({
          state: {
            linkedList: show(),
            linkedListHighlights: [idxOf(key)],
            linkedListSecondary: [],
            linkedListPointers: {},
            hashMap: hm(),
          },
          highlights: [idxOf(key)],
          message: `Op ${opIdx + 1}: put(${key}, ${value}) — key present, so overwrite the value, bump count to ${e[1]} and stamp time ${time}.`,
          codeLine: 20,
          action: 'insert',
        });
        continue;
      }

      if (cache.size === CAPACITY) {
        let victim = -1;
        for (const [k, e] of cache) {
          if (
            victim === -1 ||
            e[1] < cache.get(victim)![1] ||
            (e[1] === cache.get(victim)![1] && e[2] < cache.get(victim)![2])
          ) {
            victim = k;
          }
        }
        const ve = cache.get(victim)!;
        steps.push({
          state: {
            linkedList: show(),
            linkedListHighlights: [idxOf(victim)],
            linkedListSecondary: show().map((_, i) => i),
            linkedListPointers: { evict: idxOf(victim) },
            hashMap: hm(),
          },
          highlights: [idxOf(victim)],
          message: `Op ${opIdx + 1}: put(${key}, ${value}) — full, so scan ALL ${cache.size} entries comparing (count, lastUsed). Winner: key ${victim} with count ${ve[1]}, last used at ${ve[2]}. Evict it. This scan is the O(n) the bucket design avoids.`,
          codeLine: 25,
          action: 'delete',
        });
        cache.delete(victim);
      }

      cache.set(key, [value, 1, time]);
      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: [idxOf(key)],
          linkedListSecondary: [],
          linkedListPointers: {},
          hashMap: hm(),
        },
        highlights: [idxOf(key)],
        message: `Insert ${key}:${value} with count 1, time ${time}.`,
        codeLine: 27,
        action: 'insert',
      });
    } else if (name === 'get') {
      if (!cache.has(key)) {
        results.push(-1);
        steps.push({
          state: {
            linkedList: show(),
            linkedListHighlights: [],
            linkedListSecondary: [],
            linkedListPointers: {},
            hashMap: hm(),
          },
          highlights: [],
          message: `Op ${opIdx + 1}: get(${key}) — not cached, return -1.`,
          codeLine: 10,
          action: 'compare',
        });
        continue;
      }

      const e = cache.get(key)!;
      e[1]++;
      e[2] = time;
      results.push(e[0]);
      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: [idxOf(key)],
          linkedListSecondary: [],
          linkedListPointers: {},
          hashMap: hm(),
        },
        highlights: [idxOf(key)],
        message: `Op ${opIdx + 1}: get(${key}) — hit, return ${e[0]}. Count becomes ${e[1]}, last-used time ${time} (the tiebreaker on eviction).`,
        codeLine: 13,
        action: 'found',
      });
    }
  }

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: show().map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: hm(),
      result: results.join(', '),
    },
    highlights: [],
    message: `All ops done. get outputs: [${results.join(', ')}] — identical to the bucket design, but each eviction cost a full O(n) scan instead of O(1).`,
    codeLine: 27,
    action: 'found',
  });

  return steps;
}

export const lfuCache: Algorithm = {
  id: 'lfu-cache',
  name: 'LFU Cache',
  category: 'Linked List',
  difficulty: 'Hard',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map + Frequency Buckets — O(1) get, put and eviction',
  description:
    'Design a Least Frequently Used cache with capacity, supporting get and put in O(1) average time. When the cache is full, evict the least frequently used key, breaking ties by evicting the least recently used among them.',
  problemUrl: 'https://leetcode.com/problems/lfu-cache/',
  code: {
    python: `from collections import defaultdict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.counts = {}
        self.buckets = defaultdict(OrderedDict)
        self.min_count = 0

    def _touch(self, key):
        count = self.counts[key]
        del self.buckets[count][key]
        if not self.buckets[count]:
            del self.buckets[count]
            if self.min_count == count:
                self.min_count += 1
        self.counts[key] = count + 1
        self.buckets[count + 1][key] = None

    def get(self, key):
        if key not in self.cache:
            return -1
        self._touch(key)
        return self.cache[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.cache:
            self.cache[key] = value
            self._touch(key)
            return
        if len(self.cache) == self.cap:
            evict, _ = self.buckets[self.min_count].popitem(last=False)
            del self.cache[evict]
            del self.counts[evict]
        self.cache[key] = value
        self.counts[key] = 1
        self.buckets[1][key] = None
        self.min_count = 1`,
    javascript: `class LFUCache {
    constructor(capacity) {
        this.cap = capacity;
        this.cache = new Map();
        this.counts = new Map();
        this.buckets = new Map();
        this.minCount = 0;
    }

    touch(key) {
        const count = this.counts.get(key);
        this.buckets.get(count).delete(key);
        if (this.buckets.get(count).size === 0) {
            this.buckets.delete(count);
            if (this.minCount === count) {
                this.minCount = count + 1;
            }
        }
        this.counts.set(key, count + 1);
        if (!this.buckets.has(count + 1)) {
            this.buckets.set(count + 1, new Set());
        }
        this.buckets.get(count + 1).add(key);
    }

    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        this.touch(key);
        return this.cache.get(key);
    }

    put(key, value) {
        if (this.cap === 0) {
            return;
        }
        if (this.cache.has(key)) {
            this.cache.set(key, value);
            this.touch(key);
            return;
        }
        if (this.cache.size === this.cap) {
            const evict = this.buckets.get(this.minCount).values().next().value;
            this.buckets.get(this.minCount).delete(evict);
            this.cache.delete(evict);
            this.counts.delete(evict);
        }
        this.cache.set(key, value);
        this.counts.set(key, 1);
        if (!this.buckets.has(1)) {
            this.buckets.set(1, new Set());
        }
        this.buckets.get(1).add(key);
        this.minCount = 1;
    }
}`,
    java: `class LFUCache {
    private int cap;
    private int minCount;
    private Map<Integer, Integer> cache = new HashMap<>();
    private Map<Integer, Integer> counts = new HashMap<>();
    private Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();

    public LFUCache(int capacity) {
        cap = capacity;
        minCount = 0;
    }

    private void touch(int key) {
        int count = counts.get(key);
        buckets.get(count).remove(key);
        if (buckets.get(count).isEmpty()) {
            buckets.remove(count);
            if (minCount == count) {
                minCount = count + 1;
            }
        }
        counts.put(key, count + 1);
        buckets.computeIfAbsent(count + 1, x -> new LinkedHashSet<>()).add(key);
    }

    public int get(int key) {
        if (!cache.containsKey(key)) {
            return -1;
        }
        touch(key);
        return cache.get(key);
    }

    public void put(int key, int value) {
        if (cap == 0) {
            return;
        }
        if (cache.containsKey(key)) {
            cache.put(key, value);
            touch(key);
            return;
        }
        if (cache.size() == cap) {
            int evict = buckets.get(minCount).iterator().next();
            buckets.get(minCount).remove(evict);
            cache.remove(evict);
            counts.remove(evict);
        }
        cache.put(key, value);
        counts.put(key, 1);
        buckets.computeIfAbsent(1, x -> new LinkedHashSet<>()).add(key);
        minCount = 1;
    }
}`,
  },
  defaultInput: [
    ['put', 1, 1],
    ['put', 2, 2],
    ['get', 1],
    ['put', 3, 3],
    ['get', 2],
    ['get', 3],
    ['put', 4, 4],
    ['get', 1],
    ['get', 3],
    ['get', 4],
  ],
  run: runLfuCache,
  optimalApproachName: 'Frequency Buckets + minCount',
  approaches: [
    {
      id: 'linear-scan-eviction',
      name: 'Hash Map + Linear-Scan Eviction',
      timeComplexity: 'O(1) get/put, O(n) eviction',
      spaceComplexity: 'O(n)',
      description:
        'Store (value, count, lastUsed) per key in one hash map and scan every entry to pick the victim — much simpler to write, but eviction degrades to O(n) instead of the bucket design\'s O(1).',
      code: {
        python: `class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.time = 0

    def get(self, key):
        self.time += 1
        if key not in self.cache:
            return -1
        self.cache[key][1] += 1
        self.cache[key][2] = self.time
        return self.cache[key][0]

    def put(self, key, value):
        self.time += 1
        if self.cap == 0:
            return
        if key in self.cache:
            self.cache[key][0] = value
            self.cache[key][1] += 1
            self.cache[key][2] = self.time
            return
        if len(self.cache) == self.cap:
            victim = min(self.cache, key=lambda k: (self.cache[k][1], self.cache[k][2]))
            del self.cache[victim]
        self.cache[key] = [value, 1, self.time]`,
        javascript: `class LFUCache {
    constructor(capacity) {
        this.cap = capacity;
        this.cache = new Map();
        this.time = 0;
    }

    get(key) {
        this.time++;
        if (!this.cache.has(key)) {
            return -1;
        }
        const entry = this.cache.get(key);
        entry[1]++;
        entry[2] = this.time;
        return entry[0];
    }

    put(key, value) {
        this.time++;
        if (this.cap === 0) {
            return;
        }
        if (this.cache.has(key)) {
            const entry = this.cache.get(key);
            entry[0] = value;
            entry[1]++;
            entry[2] = this.time;
            return;
        }
        if (this.cache.size === this.cap) {
            let victim = null;
            for (const [k, e] of this.cache) {
                const best = victim === null ? null : this.cache.get(victim);
                if (best === null || e[1] < best[1] || (e[1] === best[1] && e[2] < best[2])) {
                    victim = k;
                }
            }
            this.cache.delete(victim);
        }
        this.cache.set(key, [value, 1, this.time]);
    }
}`,
        java: `class LFUCache {
    private int cap;
    private int time;
    private Map<Integer, int[]> cache = new HashMap<>();

    public LFUCache(int capacity) {
        cap = capacity;
        time = 0;
    }

    public int get(int key) {
        time++;
        if (!cache.containsKey(key)) {
            return -1;
        }
        int[] entry = cache.get(key);
        entry[1]++;
        entry[2] = time;
        return entry[0];
    }

    public void put(int key, int value) {
        time++;
        if (cap == 0) {
            return;
        }
        if (cache.containsKey(key)) {
            int[] entry = cache.get(key);
            entry[0] = value;
            entry[1]++;
            entry[2] = time;
            return;
        }
        if (cache.size() == cap) {
            int victim = -1;
            for (Map.Entry<Integer, int[]> e : cache.entrySet()) {
                int[] v = e.getValue();
                int[] best = victim == -1 ? null : cache.get(victim);
                if (best == null || v[1] < best[1] || (v[1] == best[1] && v[2] < best[2])) {
                    victim = e.getKey();
                }
            }
            cache.remove(victim);
        }
        cache.put(key, new int[] { value, 1, time });
    }
}`,
      },
      run: runLfuCacheScan,
      lineExplanations: {
        python: {
          1: 'Define the LFU cache class',
          2: 'Constructor takes the capacity',
          3: 'Store the capacity limit',
          4: 'One map: key -> [value, use count, last used time]',
          5: 'Logical clock used as the LRU tiebreaker',
          7: 'Read a key',
          8: 'Every operation ticks the clock',
          9: 'Miss?',
          10: 'Return -1 without recording anything',
          11: 'Hit — bump the use count',
          12: 'Stamp the current time',
          13: 'Return the stored value',
          15: 'Write a key',
          16: 'Tick the clock',
          17: 'Zero-capacity cache stores nothing',
          18: 'Nothing to do',
          19: 'Key already present?',
          20: 'Overwrite the value',
          21: 'A write counts as a use',
          22: 'Stamp the current time',
          23: 'Done — no eviction needed',
          24: 'Cache is full and this is a new key',
          25: 'Scan EVERY entry for the smallest (count, time) — the O(n) step',
          26: 'Drop the victim',
          27: 'Insert the new key with count 1',
        },
        javascript: {
          1: 'Define the LFU cache class',
          2: 'Constructor takes the capacity',
          3: 'Store the capacity limit',
          4: 'One map: key -> [value, use count, last used time]',
          5: 'Logical clock used as the LRU tiebreaker',
          8: 'Read a key',
          9: 'Every operation ticks the clock',
          10: 'Miss?',
          11: 'Return -1 without recording anything',
          13: 'Hit — grab the entry',
          14: 'Bump the use count',
          15: 'Stamp the current time',
          16: 'Return the stored value',
          19: 'Write a key',
          20: 'Tick the clock',
          21: 'Zero-capacity cache stores nothing',
          24: 'Key already present?',
          26: 'Overwrite the value',
          27: 'A write counts as a use',
          28: 'Stamp the current time',
          31: 'Cache is full and this is a new key',
          33: 'Scan EVERY entry — the O(n) step',
          35: 'Compare on count, then on last-used time',
          36: 'This entry is a better victim',
          39: 'Drop the victim',
          41: 'Insert the new key with count 1',
        },
        java: {
          1: 'Define the LFU cache class',
          2: 'Capacity limit',
          3: 'Logical clock used as the LRU tiebreaker',
          4: 'One map: key -> {value, use count, last used time}',
          6: 'Constructor takes the capacity',
          7: 'Store the capacity limit',
          11: 'Read a key',
          12: 'Every operation ticks the clock',
          13: 'Miss?',
          14: 'Return -1 without recording anything',
          16: 'Hit — grab the entry',
          17: 'Bump the use count',
          18: 'Stamp the current time',
          19: 'Return the stored value',
          22: 'Write a key',
          23: 'Tick the clock',
          24: 'Zero-capacity cache stores nothing',
          27: 'Key already present?',
          29: 'Overwrite the value',
          30: 'A write counts as a use',
          31: 'Stamp the current time',
          34: 'Cache is full and this is a new key',
          36: 'Scan EVERY entry — the O(n) step',
          39: 'Compare on count, then on last-used time',
          40: 'This entry is a better victim',
          43: 'Drop the victim',
          45: 'Insert the new key with count 1',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'defaultdict creates the empty value on first touch, so no "is this key here?" check',
      3: 'Define the LFU cache class',
      4: 'Constructor takes the capacity',
      5: 'Store the capacity limit',
      6: 'key -> value',
      7: 'key -> how many times it has been used',
      8: 'use count -> ordered keys with that count (LRU first)',
      9: 'Smallest use count currently present — the eviction pointer',
      11: 'Helper: record one more use of a key',
      12: 'Its current count',
      13: 'Remove it from that bucket',
      14: 'Did that empty the bucket?',
      15: 'Drop the empty bucket',
      16: 'If it was the minimum bucket...',
      17: '...the minimum shifts up by one (the only way min_count ever rises)',
      18: 'Record the new count',
      19: 'Append to the next bucket — appending keeps LRU order inside it',
      21: 'Read a key',
      22: 'Not cached?',
      23: 'Return -1 — a miss records nothing',
      24: 'Hit: count this use',
      25: 'Return the stored value',
      27: 'Write a key',
      28: 'Zero-capacity cache stores nothing',
      29: 'Nothing to do',
      30: 'Key already present?',
      31: 'Overwrite the value',
      32: 'A write counts as a use',
      33: 'Done — size did not change',
      34: 'New key and the cache is full',
      35: 'Pop the FRONT of the min bucket: least used, and least recent among those',
      36: 'Remove it from the value map',
      37: 'Remove its count',
      38: 'Store the new value',
      39: 'A brand-new key has been used once',
      40: 'Put it in bucket 1',
      41: 'Reset min_count to 1 — a fresh key is always the least used',
    },
    javascript: {
      1: 'Define the LFU cache class',
      2: 'Constructor takes the capacity',
      3: 'Store the capacity limit',
      4: 'key -> value',
      5: 'key -> how many times it has been used',
      6: 'use count -> insertion-ordered Set of keys (LRU first)',
      7: 'Smallest use count currently present — the eviction pointer',
      10: 'Helper: record one more use of a key',
      11: 'Its current count',
      12: 'Remove it from that bucket',
      13: 'Did that empty the bucket?',
      14: 'Drop the empty bucket',
      15: 'If it was the minimum bucket...',
      16: '...the minimum shifts up by one',
      19: 'Record the new count',
      20: 'Create the next bucket if needed',
      23: 'Append to it — Sets keep insertion order, so this is LRU order',
      26: 'Read a key',
      27: 'Not cached?',
      28: 'Return -1 — a miss records nothing',
      30: 'Hit: count this use',
      31: 'Return the stored value',
      34: 'Write a key',
      35: 'Zero-capacity cache stores nothing',
      38: 'Key already present?',
      39: 'Overwrite the value',
      40: 'A write counts as a use',
      43: 'New key and the cache is full',
      44: 'First key of the min bucket: least used, least recent among those',
      45: 'Remove it from the bucket',
      46: 'Remove it from the value map',
      47: 'Remove its count',
      49: 'Store the new value',
      50: 'A brand-new key has been used once',
      54: 'Put it in bucket 1',
      55: 'Reset minCount to 1',
    },
    java: {
      1: 'Define the LFU cache class',
      2: 'Capacity limit',
      3: 'Smallest use count currently present — the eviction pointer',
      4: 'key -> value',
      5: 'key -> how many times it has been used',
      6: 'use count -> LinkedHashSet of keys, which preserves LRU order',
      8: 'Constructor takes the capacity',
      9: 'Store the capacity limit',
      13: 'Helper: record one more use of a key',
      14: 'Its current count',
      15: 'Remove it from that bucket',
      16: 'Did that empty the bucket?',
      17: 'Drop the empty bucket',
      18: 'If it was the minimum bucket...',
      19: '...the minimum shifts up by one',
      22: 'Record the new count',
      23: 'Append to the next bucket, creating it if needed',
      26: 'Read a key',
      27: 'Not cached?',
      28: 'Return -1 — a miss records nothing',
      30: 'Hit: count this use',
      31: 'Return the stored value',
      34: 'Write a key',
      35: 'Zero-capacity cache stores nothing',
      38: 'Key already present?',
      39: 'Overwrite the value',
      40: 'A write counts as a use',
      43: 'New key and the cache is full',
      44: 'First key of the min bucket: least used, least recent among those',
      45: 'Remove it from the bucket',
      46: 'Remove it from the value map',
      47: 'Remove its count',
      49: 'Store the new value',
      50: 'A brand-new key has been used once',
      51: 'Put it in bucket 1',
      52: 'Reset minCount to 1',
    },
  },
};
