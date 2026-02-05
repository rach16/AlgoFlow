import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type Operation = [string, ...number[]];

function runLruCache(input: unknown): AlgorithmStep[] {
  const operations = input as Operation[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  // LRU Cache simulation
  const capacity = 2; // default capacity for visualization
  const cache = new Map<number, number>(); // key -> value
  const order: { val: number | string; id: number }[] = []; // most recent at end

  // Initial state
  steps.push({
    state: {
      linkedList: [],
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
      hashMap: {},
    },
    highlights: [],
    message: `Initialize LRU Cache with capacity ${capacity}. Uses a doubly linked list for order and a hashmap for O(1) access.`,
    codeLine: 1,
  });

  const getOrderDisplay = () => order.map((n) => ({ ...n }));
  const getHashMapDisplay = () => {
    const hm: Record<string, string> = {};
    cache.forEach((val, key) => {
      hm[`key=${key}`] = `val=${val}`;
    });
    return hm;
  };

  for (let opIdx = 0; opIdx < operations.length; opIdx++) {
    const op = operations[opIdx];
    const opName = op[0];

    if (opName === 'put') {
      const key = op[1];
      const value = op[2];

      steps.push({
        state: {
          linkedList: getOrderDisplay(),
          linkedListHighlights: [],
          linkedListSecondary: [],
          linkedListPointers: {},
          hashMap: getHashMapDisplay(),
        },
        highlights: [],
        message: `Operation ${opIdx + 1}: put(${key}, ${value})`,
        codeLine: 3,
        action: 'visit',
      });

      if (cache.has(key)) {
        // Update existing: remove from order, add to end
        const existingIdx = order.findIndex((n) => n.val === `${key}:${cache.get(key)}`);

        steps.push({
          state: {
            linkedList: getOrderDisplay(),
            linkedListHighlights: existingIdx >= 0 ? [existingIdx] : [],
            linkedListSecondary: [],
            linkedListPointers: existingIdx >= 0 ? { found: existingIdx } : {},
            hashMap: getHashMapDisplay(),
          },
          highlights: existingIdx >= 0 ? [existingIdx] : [],
          message: `Key ${key} already exists. Update value to ${value} and move to most recent.`,
          codeLine: 4,
          action: 'visit',
        });

        if (existingIdx >= 0) {
          order.splice(existingIdx, 1);
        }
        cache.set(key, value);
        order.push({ val: `${key}:${value}`, id: nodeId++ });
      } else {
        // Check capacity
        if (cache.size >= capacity) {
          // Evict LRU (first in order)
          const evicted = order[0];
          const evictedKey = parseInt(String(evicted.val).split(':')[0], 10);

          steps.push({
            state: {
              linkedList: getOrderDisplay(),
              linkedListHighlights: [0],
              linkedListSecondary: [],
              linkedListPointers: { 'LRU (evict)': 0 },
              hashMap: getHashMapDisplay(),
            },
            highlights: [0],
            message: `Cache full (capacity=${capacity}). Evict LRU node: key=${evictedKey} (${evicted.val})`,
            codeLine: 5,
            action: 'delete',
          });

          cache.delete(evictedKey);
          order.shift();
        }

        // Insert new
        cache.set(key, value);
        order.push({ val: `${key}:${value}`, id: nodeId++ });

        steps.push({
          state: {
            linkedList: getOrderDisplay(),
            linkedListHighlights: [order.length - 1],
            linkedListSecondary: [],
            linkedListPointers: { 'MRU (new)': order.length - 1 },
            hashMap: getHashMapDisplay(),
          },
          highlights: [order.length - 1],
          message: `Insert key=${key}, value=${value}. Added as most recently used.`,
          codeLine: 6,
          action: 'insert',
        });
      }
    } else if (opName === 'get') {
      const key = op[1];

      steps.push({
        state: {
          linkedList: getOrderDisplay(),
          linkedListHighlights: [],
          linkedListSecondary: [],
          linkedListPointers: {},
          hashMap: getHashMapDisplay(),
        },
        highlights: [],
        message: `Operation ${opIdx + 1}: get(${key})`,
        codeLine: 7,
        action: 'visit',
      });

      if (cache.has(key)) {
        const value = cache.get(key)!;
        const foundIdx = order.findIndex((n) => n.val === `${key}:${value}`);

        steps.push({
          state: {
            linkedList: getOrderDisplay(),
            linkedListHighlights: foundIdx >= 0 ? [foundIdx] : [],
            linkedListSecondary: [],
            linkedListPointers: foundIdx >= 0 ? { found: foundIdx } : {},
            hashMap: getHashMapDisplay(),
          },
          highlights: foundIdx >= 0 ? [foundIdx] : [],
          message: `Key ${key} found in cache! Value = ${value}. Move to most recently used.`,
          codeLine: 8,
          action: 'found',
        });

        // Move to end (most recently used)
        if (foundIdx >= 0) {
          const [node] = order.splice(foundIdx, 1);
          order.push(node);
        }

        steps.push({
          state: {
            linkedList: getOrderDisplay(),
            linkedListHighlights: [order.length - 1],
            linkedListSecondary: [],
            linkedListPointers: { MRU: order.length - 1 },
            hashMap: getHashMapDisplay(),
          },
          highlights: [order.length - 1],
          message: `Moved key=${key} to most recently used position. Return ${value}.`,
          codeLine: 9,
          action: 'visit',
        });
      } else {
        steps.push({
          state: {
            linkedList: getOrderDisplay(),
            linkedListHighlights: [],
            linkedListSecondary: [],
            linkedListPointers: {},
            hashMap: getHashMapDisplay(),
          },
          highlights: [],
          message: `Key ${key} not found in cache. Return -1.`,
          codeLine: 10,
          action: 'visit',
        });
      }
    }
  }

  // Final state
  steps.push({
    state: {
      linkedList: getOrderDisplay(),
      linkedListHighlights: order.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: order.length > 0 ? { LRU: 0, MRU: order.length - 1 } : {},
      hashMap: getHashMapDisplay(),
    },
    highlights: [],
    message: `All operations complete. Cache state: [${order.map((n) => n.val).join(' <-> ')}] (LRU on left, MRU on right)`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const lruCache: Algorithm = {
  id: 'lru-cache',
  name: 'LRU Cache',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map + Doubly Linked List — O(1) get and put',
  description:
    'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put operations in O(1) time complexity.',
  problemUrl: 'https://leetcode.com/problems/lru-cache/',
  code: {
    python: `class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}  # key -> node
        # Doubly linked list with sentinel nodes
        self.left, self.right = Node(0, 0), Node(0, 0)
        self.left.next = self.right
        self.right.prev = self.left

    def get(self, key):
        if key in self.cache:
            self.remove(self.cache[key])
            self.insert(self.cache[key])
            return self.cache[key].val
        return -1

    def put(self, key, value):
        if key in self.cache:
            self.remove(self.cache[key])
        self.cache[key] = Node(key, value)
        self.insert(self.cache[key])
        if len(self.cache) > self.cap:
            lru = self.left.next
            self.remove(lru)
            del self.cache[lru.key]`,
    javascript: `class LRUCache {
    constructor(capacity) {
        this.cap = capacity;
        this.cache = new Map();
    }

    get(key) {
        if (this.cache.has(key)) {
            const val = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, val);
            return val;
        }
        return -1;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        this.cache.set(key, value);
        if (this.cache.size > this.cap) {
            const lruKey = this.cache.keys().next().value;
            this.cache.delete(lruKey);
        }
    }
}`,
  },
  defaultInput: [
    ['put', 1, 1],
    ['put', 2, 2],
    ['get', 1],
    ['put', 3, 3],
    ['get', 2],
  ],
  run: runLruCache,
};
