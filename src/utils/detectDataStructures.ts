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

  // Category-based detection for data structures without explicit state fields
  if (category === 'heap') {
    detected.push('heap');
  }
  if (category === 'tries') {
    detected.push('trie');
  }

  return detected;
}
