import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const linkedListTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set up pointers' },
    { id: 'traverse', label: 'Traverse', description: 'Walk the list' },
    { id: 'modify', label: 'Modify Links', description: 'Rewire pointers' },
    { id: 'result', label: 'Return Result', description: 'Output list' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'swap' || step.action === 'insert' || step.action === 'delete') return 'modify';
    return 'traverse';
  },
  mapInputState: (step) => {
    const state = s(step);
    const list = (state.linkedList ?? state.list ?? state.nums ?? []) as { val: number; id?: number }[] | number[];
    if (!Array.isArray(list)) return [];
    return list.map((v, i) => ({
      value: typeof v === 'object' && v !== null ? (v as { val: number }).val : v as number,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      label: step.pointers ? Object.entries(step.pointers).filter(([, idx]) => idx === i).map(([k]) => k)[0] : undefined,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.linkedList2) {
      const list2 = state.linkedList2 as { val: number }[];
      return { type: 'linkedlist', data: list2.map(n => n.val), label: 'Second List' };
    }
    if (state.result && Array.isArray(state.result)) {
      return { type: 'array', data: state.result, label: 'Result' };
    }
    if (state.hashMap && typeof state.hashMap === 'object') {
      return { type: 'hashmap', data: state.hashMap, label: 'Cache', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Linked List',
  dsLabel: 'State',
};
