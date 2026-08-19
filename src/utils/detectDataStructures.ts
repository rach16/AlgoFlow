/**
 * Detects which data structures are active based on step state and algorithm category.
 */
export function detectDataStructures(
  state: Record<string, unknown> | undefined,
  category: string | undefined
): string[] {
  const detected: string[] = [];
  if (!state) return detected;

  if (state.hashMap || state.sCount || state.tCount || state.count) {
    detected.push('hashmap');
  }
  if (state.seen) {
    detected.push('hashset');
  }
  if (state.stack) {
    detected.push('stack');
  }
  if (state.queue) {
    detected.push('queue');
  }
  if (state.linkedList) {
    detected.push('linkedlist');
  }
  if (state.tree) {
    detected.push('binarytree');
  }
  if (state.graph) {
    detected.push('graph');
  }

  // Category-based detection for structures with no distinctive state field.
  // NB: `category` is the DISPLAY name ('Heap / Priority Queue', 'Tries'), not the category id,
  // so these must match on substrings — comparing to 'heap'/'tries' never fired.
  const cat = (category ?? '').toLowerCase();
  if (cat.includes('heap')) {
    detected.push('heap');
  }
  if (cat.includes('trie')) {
    detected.push('trie');
  }

  // Strings and arrays are what most problems actually manipulate, and their method reference is
  // the one people reach for most, so surface it whenever they are present. Algorithms name their
  // string state inconsistently (`chars`, but also `s`, `t`, `word`, ...), so detect by VALUE
  // type rather than by key name — checking only `chars` missed Valid Anagram, which uses s/t.
  const hasStringValue = Object.values(state).some(
    (v) =>
      typeof v === 'string' ||
      (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string'))
  );
  if (hasStringValue) {
    detected.push('string');
  }
  if (Array.isArray(state.nums)) {
    detected.push('array');
  }

  return detected;
}
