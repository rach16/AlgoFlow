/**
 * Language-aware method reference.
 *
 * Every entry gives the call in Python, JavaScript AND Java, because the point of this panel is
 * to answer "what is the method called in the language I am writing" — a Java-only cheatsheet is
 * useless to someone writing Python, and vice versa. The table follows whichever language is
 * selected in the code panel.
 *
 * `-` in a language cell means there is no direct equivalent; the description says what to do
 * instead.
 */

export interface DSMethod {
  /** What the operation does, independent of language. */
  description: string;
  timeComplexity: string;
  python: string;
  javascript: string;
  java: string;
}

export interface DataStructureDefinition {
  type: string;
  name: string;
  description: string;
  keyProperties: string[];
  methods: DSMethod[];
}

export const dataStructureDefinitions: Record<string, DataStructureDefinition> = {
  string: {
    type: 'string',
    name: 'String / char',
    description:
      'Strings are immutable in all three languages, which is why building one in a loop is slow and why you collect characters then join. Most string problems reduce to indexing, slicing, or mapping a character to 0-25.',
    keyProperties: [
      'Immutable — every "modification" creates a new string',
      'Building in a loop with += can be O(n squared); collect and join instead',
      'a-z maps to 0-25 by subtracting the code of "a", which is how int[26] counting works',
    ],
    methods: [
      { description: 'Length', timeComplexity: 'O(1)', python: 'len(s)', javascript: 's.length', java: 's.length()' },
      { description: 'Character at an index', timeComplexity: 'O(1)', python: 's[i]', javascript: 's[i]', java: 's.charAt(i)' },
      { description: 'Substring from i up to j', timeComplexity: 'O(j-i)', python: 's[i:j]', javascript: 's.slice(i, j)', java: 's.substring(i, j)' },
      { description: 'Split into a character list', timeComplexity: 'O(n)', python: 'list(s)', javascript: "s.split('')", java: 's.toCharArray()' },
      { description: 'Join characters back into a string', timeComplexity: 'O(n)', python: "''.join(chars)", javascript: "chars.join('')", java: 'new String(chars)' },
      { description: 'Build a string efficiently in a loop', timeComplexity: 'O(n)', python: "parts.append(c) then ''.join(parts)", javascript: "parts.push(c) then parts.join('')", java: 'StringBuilder sb; sb.append(c)' },
      { description: 'Reverse', timeComplexity: 'O(n)', python: 's[::-1]', javascript: "[...s].reverse().join('')", java: 'new StringBuilder(s).reverse().toString()' },
      { description: 'Map a lowercase letter to 0-25', timeComplexity: 'O(1)', python: "ord(c) - ord('a')", javascript: "c.charCodeAt(0) - 97", java: "c - 'a'" },
      { description: 'Map 0-25 back to a letter', timeComplexity: 'O(1)', python: "chr(i + ord('a'))", javascript: 'String.fromCharCode(i + 97)', java: "(char)(i + 'a')" },
      { description: 'Is it a letter or digit?', timeComplexity: 'O(1)', python: 'c.isalnum()', javascript: '/[a-z0-9]/i.test(c)', java: 'Character.isLetterOrDigit(c)' },
      { description: 'Is it a digit?', timeComplexity: 'O(1)', python: 'c.isdigit()', javascript: "c >= '0' && c <= '9'", java: 'Character.isDigit(c)' },
      { description: 'Is it a letter?', timeComplexity: 'O(1)', python: 'c.isalpha()', javascript: '/[a-z]/i.test(c)', java: 'Character.isLetter(c)' },
      { description: 'Lowercase / uppercase', timeComplexity: 'O(n)', python: 's.lower() / s.upper()', javascript: 's.toLowerCase() / s.toUpperCase()', java: 's.toLowerCase() / s.toUpperCase()' },
      { description: 'Sort the characters', timeComplexity: 'O(n log n)', python: "''.join(sorted(s))", javascript: "[...s].sort().join('')", java: 'char[] c = s.toCharArray(); Arrays.sort(c)' },
      { description: 'Does it contain a substring?', timeComplexity: 'O(n·m)', python: 'sub in s', javascript: 's.includes(sub)', java: 's.contains(sub)' },
      { description: 'Index of a substring, -1 if absent', timeComplexity: 'O(n·m)', python: 's.find(sub)', javascript: 's.indexOf(sub)', java: 's.indexOf(sub)' },
      { description: 'Split on a delimiter', timeComplexity: 'O(n)', python: "s.split('/')", javascript: "s.split('/')", java: 's.split("/")' },
      { description: 'Compare for equality', timeComplexity: 'O(n)', python: 'a == b', javascript: 'a === b', java: 'a.equals(b)  // NOT ==' },
      { description: 'Digit character to its numeric value', timeComplexity: 'O(1)', python: 'int(c)', javascript: 'Number(c)', java: "c - '0'" },
    ],
  },
  array: {
    type: 'array',
    name: 'Array / List',
    description:
      'The workhorse. Indexing is O(1), but the operations people reach for without thinking — searching, inserting at the front, slicing — are all O(n), and that is where accidental quadratic complexity comes from.',
    keyProperties: [
      'Index access is O(1); searching by value is O(n)',
      'Inserting or removing at the front is O(n) because everything shifts',
      'Slicing copies, so slicing inside a loop is quietly quadratic',
    ],
    methods: [
      { description: 'Length', timeComplexity: 'O(1)', python: 'len(a)', javascript: 'a.length', java: 'a.length  /  list.size()' },
      { description: 'Append to the end', timeComplexity: 'O(1)*', python: 'a.append(x)', javascript: 'a.push(x)', java: 'list.add(x)' },
      { description: 'Remove from the end', timeComplexity: 'O(1)', python: 'a.pop()', javascript: 'a.pop()', java: 'list.remove(list.size() - 1)' },
      { description: 'Insert at the front — shifts everything', timeComplexity: 'O(n)', python: 'a.insert(0, x)', javascript: 'a.unshift(x)', java: 'list.add(0, x)' },
      { description: 'Remove from the front — use a deque instead', timeComplexity: 'O(n)', python: 'a.pop(0)', javascript: 'a.shift()', java: 'list.remove(0)' },
      { description: 'Create filled with zeros', timeComplexity: 'O(n)', python: '[0] * n', javascript: 'new Array(n).fill(0)', java: 'new int[n]' },
      { description: 'Create a 2-D grid', timeComplexity: 'O(n·m)', python: '[[0] * m for _ in range(n)]', javascript: 'Array.from({length: n}, () => Array(m).fill(0))', java: 'new int[n][m]' },
      { description: 'Sort ascending', timeComplexity: 'O(n log n)', python: 'a.sort()', javascript: 'a.sort((x, y) => x - y)', java: 'Arrays.sort(a)' },
      { description: 'Sort descending', timeComplexity: 'O(n log n)', python: 'a.sort(reverse=True)', javascript: 'a.sort((x, y) => y - x)', java: 'Arrays.sort(a, Collections.reverseOrder())' },
      { description: 'Sort by a key or field', timeComplexity: 'O(n log n)', python: 'a.sort(key=lambda p: p[1])', javascript: 'a.sort((p, q) => p[1] - q[1])', java: 'Arrays.sort(a, (p, q) -> p[1] - q[1])' },
      { description: 'Reverse in place', timeComplexity: 'O(n)', python: 'a.reverse()', javascript: 'a.reverse()', java: 'Collections.reverse(list)' },
      { description: 'Copy a slice from i up to j', timeComplexity: 'O(j-i)', python: 'a[i:j]', javascript: 'a.slice(i, j)', java: 'Arrays.copyOfRange(a, i, j)' },
      { description: 'Does it contain a value? — a scan', timeComplexity: 'O(n)', python: 'x in a', javascript: 'a.includes(x)', java: 'list.contains(x)' },
      { description: 'Index of a value, -1 / error if absent', timeComplexity: 'O(n)', python: 'a.index(x)', javascript: 'a.indexOf(x)', java: 'list.indexOf(x)' },
      { description: 'Minimum / maximum', timeComplexity: 'O(n)', python: 'min(a) / max(a)', javascript: 'Math.min(...a) / Math.max(...a)', java: 'Arrays.stream(a).min().getAsInt()' },
      { description: 'Sum', timeComplexity: 'O(n)', python: 'sum(a)', javascript: 'a.reduce((x, y) => x + y, 0)', java: 'Arrays.stream(a).sum()' },
      { description: 'Iterate with the index', timeComplexity: 'O(n)', python: 'for i, x in enumerate(a):', javascript: 'a.forEach((x, i) => ...)', java: 'for (int i = 0; i < a.length; i++)' },
      { description: 'Iterate pairs from two arrays together', timeComplexity: 'O(n)', python: 'for x, y in zip(a, b):', javascript: 'a.map((x, i) => [x, b[i]])', java: 'for (int i = 0; i < a.length; i++)' },
    ],
  },
  hashmap: {
    type: 'hashmap',
    name: 'HashMap / Map',
    description:
      'Maps keys to values with O(1) average lookup. The single most common optimisation in interviews is replacing an O(n) scan with an O(1) map lookup.',
    keyProperties: [
      'O(1) average for get, put and contains — worst case O(n) under collisions',
      'No guaranteed iteration order',
      'The counting idiom (get-or-default then add one) appears everywhere',
    ],
    methods: [
      { description: 'Insert or update', timeComplexity: 'O(1)*', python: 'd[k] = v', javascript: 'm.set(k, v)', java: 'm.put(k, v)' },
      { description: 'Read a value', timeComplexity: 'O(1)*', python: 'd[k]', javascript: 'm.get(k)', java: 'm.get(k)' },
      { description: 'Read with a fallback when missing', timeComplexity: 'O(1)*', python: 'd.get(k, 0)', javascript: 'm.get(k) ?? 0', java: 'm.getOrDefault(k, 0)' },
      { description: 'Count occurrences — the key idiom', timeComplexity: 'O(1)*', python: 'd[k] = d.get(k, 0) + 1', javascript: 'm.set(k, (m.get(k) ?? 0) + 1)', java: 'm.put(k, m.getOrDefault(k, 0) + 1)' },
      { description: 'Does the key exist?', timeComplexity: 'O(1)*', python: 'k in d', javascript: 'm.has(k)', java: 'm.containsKey(k)' },
      { description: 'Delete a key', timeComplexity: 'O(1)*', python: 'del d[k]', javascript: 'm.delete(k)', java: 'm.remove(k)' },
      { description: 'Number of entries', timeComplexity: 'O(1)', python: 'len(d)', javascript: 'm.size', java: 'm.size()' },
      { description: 'Is it empty?', timeComplexity: 'O(1)', python: 'not d', javascript: 'm.size === 0', java: 'm.isEmpty()' },
      { description: 'Iterate the keys', timeComplexity: 'O(n)', python: 'for k in d:', javascript: 'for (const k of m.keys())', java: 'for (K k : m.keySet())' },
      { description: 'Iterate the values', timeComplexity: 'O(n)', python: 'for v in d.values():', javascript: 'for (const v of m.values())', java: 'for (V v : m.values())' },
      { description: 'Iterate key and value together', timeComplexity: 'O(n)', python: 'for k, v in d.items():', javascript: 'for (const [k, v] of m)', java: 'for (Map.Entry<K,V> e : m.entrySet())' },
      { description: 'Build a frequency map in one line', timeComplexity: 'O(n)', python: 'Counter(arr)', javascript: '-  (loop and set)', java: '-  (loop and merge)' },
      { description: 'Auto-create a default value per key', timeComplexity: 'O(1)*', python: 'defaultdict(list)', javascript: '-  (check then set)', java: 'm.computeIfAbsent(k, x -> new ArrayList<>())' },
      { description: 'Group items under a key', timeComplexity: 'O(1)*', python: 'd[k].append(x)  # defaultdict', javascript: '(m.get(k) ?? []).push(x)', java: 'm.computeIfAbsent(k, x -> new ArrayList<>()).add(v)' },
    ],
  },
  hashset: {
    type: 'hashset',
    name: 'HashSet / Set',
    description:
      'An unordered collection of unique values with O(1) membership testing. Converting a list to a set before testing membership is what turns an O(n squared) loop into O(n).',
    keyProperties: [
      'Unique elements only — adding a duplicate is a no-op',
      'O(1) average membership test, versus O(n) for a list',
      'No guaranteed iteration order',
    ],
    methods: [
      { description: 'Insert', timeComplexity: 'O(1)*', python: 's.add(x)', javascript: 's.add(x)', java: 's.add(x)' },
      { description: 'Is it a member?', timeComplexity: 'O(1)*', python: 'x in s', javascript: 's.has(x)', java: 's.contains(x)' },
      { description: 'Delete', timeComplexity: 'O(1)*', python: 's.discard(x)', javascript: 's.delete(x)', java: 's.remove(x)' },
      { description: 'Number of elements', timeComplexity: 'O(1)', python: 'len(s)', javascript: 's.size', java: 's.size()' },
      { description: 'Is it empty?', timeComplexity: 'O(1)', python: 'not s', javascript: 's.size === 0', java: 's.isEmpty()' },
      { description: 'Build from a list — the dedupe trick', timeComplexity: 'O(n)', python: 'set(arr)', javascript: 'new Set(arr)', java: 'new HashSet<>(list)' },
      { description: 'Iterate', timeComplexity: 'O(n)', python: 'for x in s:', javascript: 'for (const x of s)', java: 'for (T x : s)' },
      { description: 'Elements in both', timeComplexity: 'O(min)', python: 'a & b', javascript: '[...a].filter(x => b.has(x))', java: 'a.retainAll(b)  // mutates a' },
      { description: 'Elements in either', timeComplexity: 'O(n)', python: 'a | b', javascript: 'new Set([...a, ...b])', java: 'a.addAll(b)  // mutates a' },
      { description: 'In a but not b', timeComplexity: 'O(n)', python: 'a - b', javascript: '[...a].filter(x => !b.has(x))', java: 'a.removeAll(b)  // mutates a' },
    ],
  },
  stack: {
    type: 'stack',
    name: 'Stack',
    description:
      'Last in, first out. In Python and JavaScript you just use a list or array; only Java has a distinct type, and there the recommendation is Deque rather than the legacy Stack class.',
    keyProperties: [
      'LIFO — push and pop both act on the end',
      'A plain list or array is a stack in Python and JavaScript',
      'The monotonic-stack pattern is amortised O(n): each element is pushed once and popped at most once',
    ],
    methods: [
      { description: 'Create', timeComplexity: 'O(1)', python: 'stack = []', javascript: 'const stack = []', java: 'Deque<Integer> st = new ArrayDeque<>()' },
      { description: 'Push', timeComplexity: 'O(1)', python: 'stack.append(x)', javascript: 'stack.push(x)', java: 'st.push(x)' },
      { description: 'Pop and return the top', timeComplexity: 'O(1)', python: 'stack.pop()', javascript: 'stack.pop()', java: 'st.pop()' },
      { description: 'Peek at the top without removing', timeComplexity: 'O(1)', python: 'stack[-1]', javascript: 'stack[stack.length - 1]', java: 'st.peek()' },
      { description: 'Is it empty?', timeComplexity: 'O(1)', python: 'not stack', javascript: 'stack.length === 0', java: 'st.isEmpty()' },
      { description: 'Size', timeComplexity: 'O(1)', python: 'len(stack)', javascript: 'stack.length', java: 'st.size()' },
      { description: 'Pop while a condition holds — monotonic stack', timeComplexity: 'O(n) total', python: 'while stack and stack[-1] < x:', javascript: 'while (stack.length && stack.at(-1) < x)', java: 'while (!st.isEmpty() && st.peek() < x)' },
    ],
  },
  queue: {
    type: 'queue',
    name: 'Queue / Deque',
    description:
      'First in, first out — the backbone of BFS. The trap is using a plain list in Python or shift() in JavaScript, because removing from the front is O(n); use a deque.',
    keyProperties: [
      'FIFO — add at the back, remove from the front',
      'Removing from the front of a plain list is O(n); a deque makes it O(1)',
      'A deque supports O(1) at BOTH ends, which is what monotonic-deque problems need',
    ],
    methods: [
      { description: 'Create', timeComplexity: 'O(1)', python: 'q = deque()', javascript: 'const q = []', java: 'Deque<Integer> q = new ArrayDeque<>()' },
      { description: 'Add at the back', timeComplexity: 'O(1)', python: 'q.append(x)', javascript: 'q.push(x)', java: 'q.addLast(x)  /  q.offer(x)' },
      { description: 'Remove from the front', timeComplexity: 'O(1)', python: 'q.popleft()', javascript: 'q.shift()  // O(n)!', java: 'q.pollFirst()  /  q.poll()' },
      { description: 'Peek at the front', timeComplexity: 'O(1)', python: 'q[0]', javascript: 'q[0]', java: 'q.peekFirst()' },
      { description: 'Add at the front', timeComplexity: 'O(1)', python: 'q.appendleft(x)', javascript: 'q.unshift(x)  // O(n)!', java: 'q.addFirst(x)' },
      { description: 'Remove from the back', timeComplexity: 'O(1)', python: 'q.pop()', javascript: 'q.pop()', java: 'q.pollLast()' },
      { description: 'Is it empty?', timeComplexity: 'O(1)', python: 'not q', javascript: 'q.length === 0', java: 'q.isEmpty()' },
      { description: 'Size — used to process one BFS level', timeComplexity: 'O(1)', python: 'len(q)', javascript: 'q.length', java: 'q.size()' },
      { description: 'Process exactly one BFS level', timeComplexity: 'O(level)', python: 'for _ in range(len(q)):', javascript: 'const n = q.length; for (let i = 0; i < n; i++)', java: 'int n = q.size(); for (int i = 0; i < n; i++)' },
    ],
  },
  heap: {
    type: 'heap',
    name: 'Heap / Priority Queue',
    description:
      'Keeps the smallest (or largest) element reachable in O(1) and pushes or pops in O(log n). Python only gives you a MIN heap, so getting a max heap means negating the values — that trips people up constantly.',
    keyProperties: [
      'Push and pop are O(log n); reading the top is O(1)',
      'Python heapq is min-only — push -x to simulate a max heap',
      'Building from an existing list with heapify is O(n), cheaper than n pushes',
    ],
    methods: [
      { description: 'Create', timeComplexity: 'O(1)', python: 'h = []', javascript: '-  (no built-in; write one or sort)', java: 'PriorityQueue<Integer> h = new PriorityQueue<>()' },
      { description: 'Push', timeComplexity: 'O(log n)', python: 'heapq.heappush(h, x)', javascript: '-', java: 'h.offer(x)  /  h.add(x)' },
      { description: 'Pop the smallest', timeComplexity: 'O(log n)', python: 'heapq.heappop(h)', javascript: '-', java: 'h.poll()' },
      { description: 'Peek at the smallest', timeComplexity: 'O(1)', python: 'h[0]', javascript: '-', java: 'h.peek()' },
      { description: 'Build from a list — cheaper than n pushes', timeComplexity: 'O(n)', python: 'heapq.heapify(arr)', javascript: '-', java: 'new PriorityQueue<>(list)' },
      { description: 'Max heap instead of min', timeComplexity: 'O(log n)', python: 'push -x, then negate on pop', javascript: '-', java: 'new PriorityQueue<>(Collections.reverseOrder())' },
      { description: 'Order by a custom key', timeComplexity: 'O(log n)', python: 'push a (key, value) tuple', javascript: '-', java: 'new PriorityQueue<>((a, b) -> a[1] - b[1])' },
      { description: 'Size', timeComplexity: 'O(1)', python: 'len(h)', javascript: '-', java: 'h.size()' },
      { description: 'Is it empty?', timeComplexity: 'O(1)', python: 'not h', javascript: '-', java: 'h.isEmpty()' },
      { description: 'Keep only the k largest — the size-k trick', timeComplexity: 'O(log k)', python: 'heappush then if len(h) > k: heappop(h)', javascript: '-', java: 'h.offer(x); if (h.size() > k) h.poll();' },
      { description: 'k smallest without a full sort', timeComplexity: 'O(n log k)', python: 'heapq.nsmallest(k, arr)', javascript: '-', java: '-  (use a size-k heap)' },
    ],
  },
  linkedlist: {
    type: 'linkedlist',
    name: 'Linked List',
    description:
      'Nodes joined by next pointers. There is no library API — everything is pointer manipulation, so what you need to remember is the idioms, not method names.',
    keyProperties: [
      'No index access — reaching position i costs O(i)',
      'A dummy head node removes almost all the edge cases around the first element',
      'Fast and slow pointers find the middle, or a cycle, in one pass with O(1) space',
    ],
    methods: [
      { description: 'Define a node', timeComplexity: '-', python: 'class ListNode:\n  def __init__(self, v): self.val = v; self.next = None', javascript: 'class ListNode { constructor(v) { this.val = v; this.next = null } }', java: 'class ListNode { int val; ListNode next; }' },
      { description: 'Walk the list', timeComplexity: 'O(n)', python: 'while cur:  cur = cur.next', javascript: 'while (cur) { cur = cur.next }', java: 'while (cur != null) { cur = cur.next; }' },
      { description: 'Dummy head, to avoid special-casing the first node', timeComplexity: 'O(1)', python: 'dummy = ListNode(0); dummy.next = head', javascript: 'const dummy = new ListNode(0); dummy.next = head', java: 'ListNode dummy = new ListNode(0); dummy.next = head;' },
      { description: 'Reverse — the three-pointer idiom', timeComplexity: 'O(n)', python: 'nxt = cur.next; cur.next = prev; prev = cur; cur = nxt', javascript: 'const nxt = cur.next; cur.next = prev; prev = cur; cur = nxt', java: 'ListNode nxt = cur.next; cur.next = prev; prev = cur; cur = nxt;' },
      { description: 'Find the middle — fast and slow', timeComplexity: 'O(n)', python: 'while fast and fast.next: slow = slow.next; fast = fast.next.next', javascript: 'while (fast && fast.next) { slow = slow.next; fast = fast.next.next }', java: 'while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }' },
      { description: 'Delete the node after cur', timeComplexity: 'O(1)', python: 'cur.next = cur.next.next', javascript: 'cur.next = cur.next.next', java: 'cur.next = cur.next.next;' },
      { description: 'Insert x after cur', timeComplexity: 'O(1)', python: 'node.next = cur.next; cur.next = node', javascript: 'node.next = cur.next; cur.next = node', java: 'node.next = cur.next; cur.next = node;' },
    ],
  },
  binarytree: {
    type: 'binarytree',
    name: 'Binary Tree / BST',
    description:
      'Nodes with left and right children. Again there is no API to memorise — the recall problem is the four traversal orders and when each one is the right choice.',
    keyProperties: [
      'Recursion depth is the height h: log n if balanced, n if degenerate',
      'Inorder on a BST yields sorted order — that is the whole trick behind several problems',
      'BFS needs a queue and gives you level-by-level; DFS needs a stack or recursion',
    ],
    methods: [
      { description: 'Define a node', timeComplexity: '-', python: 'class TreeNode:\n  def __init__(self, v): self.val = v; self.left = self.right = None', javascript: 'class TreeNode { constructor(v) { this.val = v; this.left = this.right = null } }', java: 'class TreeNode { int val; TreeNode left, right; }' },
      { description: 'Inorder — left, node, right (sorted for a BST)', timeComplexity: 'O(n)', python: 'dfs(node.left); visit(node); dfs(node.right)', javascript: 'dfs(node.left); visit(node); dfs(node.right)', java: 'dfs(node.left); visit(node); dfs(node.right);' },
      { description: 'Preorder — node first (used for serialising)', timeComplexity: 'O(n)', python: 'visit(node); dfs(node.left); dfs(node.right)', javascript: 'visit(node); dfs(node.left); dfs(node.right)', java: 'visit(node); dfs(node.left); dfs(node.right);' },
      { description: 'Postorder — children first (used for deleting or summing up)', timeComplexity: 'O(n)', python: 'dfs(node.left); dfs(node.right); visit(node)', javascript: 'dfs(node.left); dfs(node.right); visit(node)', java: 'dfs(node.left); dfs(node.right); visit(node);' },
      { description: 'Level order — BFS with a queue', timeComplexity: 'O(n)', python: 'q = deque([root]); while q: ...', javascript: 'const q = [root]; while (q.length) { ... }', java: 'Queue<TreeNode> q = new LinkedList<>(); q.add(root);' },
      { description: 'Base case that ends every tree recursion', timeComplexity: 'O(1)', python: 'if not node: return 0', javascript: 'if (!node) return 0', java: 'if (node == null) return 0;' },
      { description: 'BST search — use the ordering, do not scan', timeComplexity: 'O(h)', python: 'if v < node.val: go left else: go right', javascript: 'v < node.val ? node.left : node.right', java: 'v < node.val ? node.left : node.right' },
    ],
  },
  graph: {
    type: 'graph',
    name: 'Graph',
    description:
      'Nodes and edges. The step people forget is that the input is usually an edge list, and the first thing you almost always do is convert it into an adjacency list.',
    keyProperties: [
      'Bounds are O(V + E) — name both sizes, not a single n',
      'Build an adjacency list from the edge list first',
      'A visited set is mandatory, or a cycle makes the traversal run forever',
    ],
    methods: [
      { description: 'Build an adjacency list from edges', timeComplexity: 'O(E)', python: 'g = defaultdict(list)\nfor u, v in edges: g[u].append(v)', javascript: 'const g = new Map(); for (const [u,v] of edges) { ... }', java: 'Map<Integer,List<Integer>> g = new HashMap<>();' },
      { description: 'Undirected — add the edge both ways', timeComplexity: 'O(1)', python: 'g[u].append(v); g[v].append(u)', javascript: 'g.get(u).push(v); g.get(v).push(u)', java: 'g.get(u).add(v); g.get(v).add(u);' },
      { description: 'DFS with a visited set', timeComplexity: 'O(V+E)', python: 'if node in seen: return\nseen.add(node)', javascript: 'if (seen.has(n)) return; seen.add(n)', java: 'if (seen.contains(n)) return; seen.add(n);' },
      { description: 'BFS from a source', timeComplexity: 'O(V+E)', python: 'q = deque([src]); seen = {src}', javascript: 'const q = [src]; const seen = new Set([src])', java: 'Queue<Integer> q = new LinkedList<>(); q.add(src);' },
      { description: 'The four grid directions', timeComplexity: '-', python: 'for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):', javascript: 'for (const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]])', java: 'int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};' },
      { description: 'Stay inside the grid', timeComplexity: 'O(1)', python: 'if 0 <= r < rows and 0 <= c < cols:', javascript: 'if (r >= 0 && r < rows && c >= 0 && c < cols)', java: 'if (r >= 0 && r < rows && c >= 0 && c < cols)' },
      { description: 'Indegree, for a topological sort', timeComplexity: 'O(E)', python: 'indeg[v] += 1 for each edge u->v', javascript: 'indeg[v]++', java: 'indeg[v]++;' },
    ],
  },
  trie: {
    type: 'trie',
    name: 'Trie / Prefix Tree',
    description:
      'A tree keyed by characters, so a word of length m costs O(m) to insert or find no matter how many words are stored. That independence from the word count is the entire reason it exists.',
    keyProperties: [
      'Insert and search are O(m) in the word length, independent of how many words are stored',
      'Each node holds a map of children plus an end-of-word flag',
      'Shared prefixes are stored once, which is what makes prefix queries cheap',
    ],
    methods: [
      { description: 'Define a node', timeComplexity: '-', python: 'self.children = {}; self.end = False', javascript: 'this.children = {}; this.end = false', java: 'TrieNode[] children = new TrieNode[26]; boolean end;' },
      { description: 'Insert a word', timeComplexity: 'O(m)', python: 'for c in word: cur = cur.children.setdefault(c, TrieNode())', javascript: 'for (const c of word) { cur = cur.children[c] ??= new TrieNode() }', java: 'for (char c : word.toCharArray()) { ... }' },
      { description: 'Mark the end of a word', timeComplexity: 'O(1)', python: 'cur.end = True', javascript: 'cur.end = true', java: 'cur.end = true;' },
      { description: 'Search for a whole word', timeComplexity: 'O(m)', python: 'walk then return cur.end', javascript: 'walk then return cur.end', java: 'walk then return cur.end;' },
      { description: 'Does any word start with this prefix?', timeComplexity: 'O(m)', python: 'walk and return cur is not None', javascript: 'walk and return cur !== null', java: 'walk and return cur != null;' },
      { description: 'Child lookup by letter index', timeComplexity: 'O(1)', python: "cur.children.get(c)", javascript: 'cur.children[c]', java: "cur.children[c - 'a']" },
      { description: 'Wildcard match — try every child', timeComplexity: 'O(26^m) worst', python: "if c == '.': recurse into every child", javascript: "if (c === '.') recurse into every child", java: "if (c == '.') recurse into every child" },
    ],
  },
};
