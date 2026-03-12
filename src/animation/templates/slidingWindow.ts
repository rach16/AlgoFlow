import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const slidingWindowTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set window start' },
    { id: 'expand', label: 'Expand Window', description: 'Move right pointer' },
    { id: 'check', label: 'Check Condition', description: 'Validate window' },
    { id: 'shrink', label: 'Shrink Window', description: 'Move left pointer' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'delete') return 'shrink';
    if (step.action === 'compare') return 'check';
    if (step.action === 'insert') return 'expand';
    return 'expand';
  },
  mapInputState: (step) => {
    const state = s(step);
    const items = (state.nums ?? state.prices ?? state.chars ?? state.s ?? []) as (string | number)[];
    if (!Array.isArray(items)) return [];
    const left = step.pointers?.left ?? step.pointers?.l ?? -1;
    const right = step.pointers?.right ?? step.pointers?.r ?? step.pointers?.i ?? -1;
    return items.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const
        : (typeof left === 'number' && typeof right === 'number' && i >= left && i <= right) ? 'active' as const
        : 'default' as const,
      label: step.pointers ? Object.entries(step.pointers).filter(([, idx]) => idx === i).map(([k]) => k)[0] : undefined,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.hashMap && typeof state.hashMap === 'object') {
      return { type: 'hashmap', data: state.hashMap, label: 'Window Map', updated: step.action === 'insert' || step.action === 'delete' };
    }
    if (state.seen) {
      const seen = state.seen;
      return { type: 'set', data: Array.isArray(seen) ? seen : Object.keys(seen as object), label: 'Window Set', updated: step.action === 'insert' };
    }
    if (state.count && typeof state.count === 'object') {
      return { type: 'hashmap', data: state.count, label: 'Frequency', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Array / String',
  dsLabel: 'Window State',
};
