import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const arraysHashingTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set up structures' },
    { id: 'iterate', label: 'Iterate', description: 'Scan elements' },
    { id: 'check', label: 'Check / Compare', description: 'Evaluate condition' },
    { id: 'update', label: 'Update DS', description: 'Modify data structure' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'insert' || step.action === 'push') return 'update';
    if (step.action === 'compare') return 'check';
    return 'iterate';
  },
  mapInputState: (step) => {
    const state = s(step);
    const nums = (state.nums ?? state.chars ?? state.strs ?? state.board ?? []) as (string | number)[];
    if (!Array.isArray(nums)) return [];
    return nums.map((v, i) => ({
      value: v,
      status: step.action === 'found' && step.highlights.includes(i) ? 'found' as const
        : step.highlights.includes(i) ? 'active' as const
        : step.secondary?.includes(i) ? 'done' as const
        : 'default' as const,
      label: step.pointers ? Object.entries(step.pointers).filter(([, idx]) => idx === i).map(([k]) => k)[0] : undefined,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.hashMap && typeof state.hashMap === 'object') {
      return { type: 'hashmap', data: state.hashMap, updated: step.action === 'insert' };
    }
    if (state.seen) {
      const seen = state.seen;
      return { type: 'set', data: Array.isArray(seen) ? seen : Object.keys(seen as object), updated: step.action === 'insert' };
    }
    if (state.count && typeof state.count === 'object') {
      return { type: 'hashmap', data: state.count, label: 'Frequency Map', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Input Array',
  dsLabel: 'Hash Map',
};
