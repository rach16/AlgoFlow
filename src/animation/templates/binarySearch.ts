import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const binarySearchTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set search bounds' },
    { id: 'compute', label: 'Compute Mid', description: 'Calculate midpoint' },
    { id: 'compare', label: 'Compare', description: 'Check mid value' },
    { id: 'narrow', label: 'Narrow Range', description: 'Update bounds' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'compare') return 'compare';
    if (step.message?.toLowerCase().includes('mid')) return 'compute';
    return 'narrow';
  },
  mapInputState: (step) => {
    const state = s(step);
    const nums = (state.nums ?? state.matrix ?? state.piles ?? []) as (string | number)[];
    if (!Array.isArray(nums)) return [];
    return nums.map((v, i) => ({
      value: v,
      status: step.action === 'found' && step.highlights.includes(i) ? 'found' as const
        : step.highlights.includes(i) ? 'active' as const
        : 'default' as const,
      label: step.pointers ? Object.entries(step.pointers).filter(([, idx]) => idx === i).map(([k]) => k)[0] : undefined,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.hashMap && typeof state.hashMap === 'object') {
      return { type: 'hashmap', data: state.hashMap, updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Sorted Array',
  dsLabel: 'Search State',
};
