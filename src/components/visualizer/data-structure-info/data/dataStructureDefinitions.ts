export interface DSMethod {
  name: string;
  description: string;
  timeComplexity: string;
}

export interface DataStructureDefinition {
  type: string;
  name: string;
  description: string;
  keyProperties: string[];
  methods: DSMethod[];
}

export const dataStructureDefinitions: Record<string, DataStructureDefinition> = {
  hashmap: {
    type: 'hashmap',
    name: 'HashMap / Map',
    description:
      'A hash table that maps keys to values using a hash function. Provides near-constant time lookups by computing an index from the key.',
    keyProperties: [
      'Key-value storage with O(1) average access',
      'Uses hash function to compute bucket index',
      'Handles collisions via chaining or open addressing',
    ],
    methods: [
      { name: 'put(key, val)', description: 'Insert or update a key-value pair', timeComplexity: 'O(1)*' },
      { name: 'get(key)', description: 'Retrieve value by key', timeComplexity: 'O(1)*' },
      { name: 'getOrDefault(key, default)', description: 'Get value or return default if key missing', timeComplexity: 'O(1)*' },
      { name: 'putIfAbsent(key, val)', description: 'Insert only if key is not already present', timeComplexity: 'O(1)*' },
      { name: 'containsKey(key)', description: 'Check if key exists', timeComplexity: 'O(1)*' },
      { name: 'remove(key)', description: 'Delete a key-value pair', timeComplexity: 'O(1)*' },
      { name: 'isEmpty()', description: 'Check if map has no entries', timeComplexity: 'O(1)' },
      { name: 'size()', description: 'Number of entries', timeComplexity: 'O(1)' },
      { name: 'keySet()', description: 'Return all keys', timeComplexity: 'O(n)' },
      { name: 'values()', description: 'Return all values', timeComplexity: 'O(n)' },
      { name: 'entrySet()', description: 'Return all key-value pairs', timeComplexity: 'O(n)' },
    ],
  },
  hashset: {
    type: 'hashset',
    name: 'HashSet / Set',
    description:
      'An unordered collection of unique elements backed by a hash table. Useful for fast membership testing and deduplication.',
    keyProperties: [
      'Stores unique elements only',
      'O(1) average lookup, insert, and delete',
      'No guaranteed iteration order',
    ],
    methods: [
      { name: 'add(val)', description: 'Insert an element', timeComplexity: 'O(1)*' },
      { name: 'contains(val)', description: 'Check membership', timeComplexity: 'O(1)*' },
      { name: 'remove(val)', description: 'Delete an element', timeComplexity: 'O(1)*' },
      { name: 'isEmpty()', description: 'Check if set is empty', timeComplexity: 'O(1)' },
      { name: 'size()', description: 'Number of elements', timeComplexity: 'O(1)' },
      { name: 'addAll(collection)', description: 'Add all elements from another collection', timeComplexity: 'O(n)' },
    ],
  },
  stack: {
    type: 'stack',
    name: 'Stack',
    description:
      'A Last-In-First-Out (LIFO) data structure. Elements are added and removed from the same end (the top).',
    keyProperties: [
      'LIFO ordering — last element in is first out',
      'Only the top element is accessible',
      'Used for DFS, undo systems, expression parsing',
    ],
    methods: [
      { name: 'push(val)', description: 'Add element to top', timeComplexity: 'O(1)' },
      { name: 'pop()', description: 'Remove and return top element', timeComplexity: 'O(1)' },
      { name: 'peek()', description: 'View top element without removing', timeComplexity: 'O(1)' },
      { name: 'isEmpty()', description: 'Check if stack is empty', timeComplexity: 'O(1)' },
      { name: 'size()', description: 'Number of elements', timeComplexity: 'O(1)' },
      { name: 'peekFirst()', description: 'View front element (Deque)', timeComplexity: 'O(1)' },
      { name: 'peekLast()', description: 'View back element (Deque)', timeComplexity: 'O(1)' },
      { name: 'pollFirst()', description: 'Remove and return front element (Deque)', timeComplexity: 'O(1)' },
      { name: 'pollLast()', description: 'Remove and return back element (Deque)', timeComplexity: 'O(1)' },
      { name: 'offerLast(val)', description: 'Add element to back (Deque)', timeComplexity: 'O(1)' },
    ],
  },
  queue: {
    type: 'queue',
    name: 'Queue',
    description:
      'A First-In-First-Out (FIFO) data structure. Elements are added at the back and removed from the front.',
    keyProperties: [
      'FIFO ordering — first element in is first out',
      'Used for BFS, scheduling, buffering',
      'Deque variant allows both-end operations',
    ],
    methods: [
      { name: 'add(val)', description: 'Add element, throw if full', timeComplexity: 'O(1)' },
      { name: 'offer(val)', description: 'Add element to back', timeComplexity: 'O(1)' },
      { name: 'poll()', description: 'Remove and return front element', timeComplexity: 'O(1)' },
      { name: 'peek()', description: 'View front element without removing', timeComplexity: 'O(1)' },
      { name: 'isEmpty()', description: 'Check if queue is empty', timeComplexity: 'O(1)' },
      { name: 'size()', description: 'Number of elements', timeComplexity: 'O(1)' },
    ],
  },
  linkedlist: {
    type: 'linkedlist',
    name: 'Linked List',
    description:
      'A linear collection where each node stores data and a pointer to the next node. Allows efficient insertion and deletion without shifting elements.',
    keyProperties: [
      'Dynamic size — no pre-allocation needed',
      'O(1) insertion/deletion at head or given node',
      'O(n) random access (must traverse from head)',
    ],
    methods: [
      { name: 'addFirst(val)', description: 'Insert at head', timeComplexity: 'O(1)' },
      { name: 'addLast(val)', description: 'Insert at tail', timeComplexity: 'O(1)*' },
      { name: 'removeFirst()', description: 'Remove head node', timeComplexity: 'O(1)' },
      { name: 'get(index)', description: 'Access node by index', timeComplexity: 'O(n)' },
      { name: 'size()', description: 'Number of nodes', timeComplexity: 'O(1)' },
    ],
  },
  binarytree: {
    type: 'binarytree',
    name: 'Binary Tree',
    description:
      'A hierarchical structure where each node has at most two children (left, right). Binary Search Trees maintain left < parent < right ordering.',
    keyProperties: [
      'Hierarchical parent-child relationships',
      'BST enables O(log n) search, insert, delete',
      'Traversals: inorder, preorder, postorder, level-order',
    ],
    methods: [
      { name: 'insert(val)', description: 'Add a node (BST rules)', timeComplexity: 'O(log n)*' },
      { name: 'search(val)', description: 'Find a node by value', timeComplexity: 'O(log n)*' },
      { name: 'inorder()', description: 'Left → Root → Right traversal', timeComplexity: 'O(n)' },
      { name: 'preorder()', description: 'Root → Left → Right traversal', timeComplexity: 'O(n)' },
      { name: 'postorder()', description: 'Left → Right → Root traversal', timeComplexity: 'O(n)' },
      { name: 'levelOrder()', description: 'Breadth-first (level by level)', timeComplexity: 'O(n)' },
    ],
  },
  graph: {
    type: 'graph',
    name: 'Graph',
    description:
      'A collection of vertices (nodes) connected by edges. Can be directed or undirected, weighted or unweighted.',
    keyProperties: [
      'Vertices connected by edges',
      'Adjacency list or matrix representation',
      'Supports directed, undirected, weighted variants',
    ],
    methods: [
      { name: 'addVertex(v)', description: 'Add a new node', timeComplexity: 'O(1)' },
      { name: 'addEdge(u, v)', description: 'Connect two nodes', timeComplexity: 'O(1)' },
      { name: 'BFS(start)', description: 'Breadth-first search', timeComplexity: 'O(V+E)' },
      { name: 'DFS(start)', description: 'Depth-first search', timeComplexity: 'O(V+E)' },
      { name: 'removeEdge(u, v)', description: 'Disconnect two nodes', timeComplexity: 'O(E)' },
    ],
  },
  heap: {
    type: 'heap',
    name: 'Heap / Priority Queue',
    description:
      'A complete binary tree where every parent is smaller (min-heap) or larger (max-heap) than its children. Backed by an array.',
    keyProperties: [
      'Complete binary tree stored as array',
      'Parent at i, children at 2i+1 and 2i+2',
      'O(log n) insert and extract-min/max',
    ],
    methods: [
      { name: 'offer(val)', description: 'Insert and bubble up', timeComplexity: 'O(log n)' },
      { name: 'poll()', description: 'Remove root and heapify down', timeComplexity: 'O(log n)' },
      { name: 'peek()', description: 'View root without removing', timeComplexity: 'O(1)' },
      { name: 'isEmpty()', description: 'Check if heap is empty', timeComplexity: 'O(1)' },
      { name: 'size()', description: 'Number of elements', timeComplexity: 'O(1)' },
      { name: 'heapify(arr)', description: 'Build heap from array', timeComplexity: 'O(n)' },
    ],
  },
  trie: {
    type: 'trie',
    name: 'Trie (Prefix Tree)',
    description:
      'A tree-like structure for storing strings where each node represents a character. Shared prefixes share the same path.',
    keyProperties: [
      'Each edge represents a character',
      'Shared prefixes share nodes',
      'O(m) operations where m is word length',
    ],
    methods: [
      { name: 'insert(word)', description: 'Add a word character by character', timeComplexity: 'O(m)' },
      { name: 'search(word)', description: 'Check if exact word exists', timeComplexity: 'O(m)' },
      { name: 'startsWith(prefix)', description: 'Check if any word has prefix', timeComplexity: 'O(m)' },
    ],
  },
};
