import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const triesTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Create trie root' },
    { id: 'traverse', label: 'Traverse', description: 'Follow path' },
    { id: 'insert', label: 'Insert / Mark', description: 'Add node' },
    { id: 'search', label: 'Search', description: 'Look up word' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'insert' || step.action === 'push') return 'insert';
    if (step.action === 'compare') return 'search';
    return 'traverse';
  },
  mapInputState: (step) => {
    const state = s(step);
    const chars = (state.chars ?? state.word ?? []) as (string | number)[];
    if (!Array.isArray(chars)) {
      if (typeof chars === 'string') {
        return (chars as string).split('').map((c: string, i: number) => ({
          value: c,
          status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
        }));
      }
      return [];
    }
    return chars.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.trie) {
      return { type: 'trie', data: state.trie, label: 'Trie', updated: step.action === 'insert' };
    }
    if (state.tree) {
      return { type: 'tree', data: state.tree, label: 'Trie', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Characters',
  dsLabel: 'Trie',
};
