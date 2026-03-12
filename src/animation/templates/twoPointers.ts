import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const twoPointersTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Place pointers' },
    { id: 'compare', label: 'Compare', description: 'Check pointer values' },
    { id: 'move', label: 'Move Pointer', description: 'Advance pointer' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'compare') return 'compare';
    return 'move';
  },
  mapInputState: (step) => {
    const state = s(step);
    const nums = (state.nums ?? state.chars ?? state.height ?? []) as (string | number)[];
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
    if (state.result && Array.isArray(state.result)) {
      return { type: 'array', data: state.result, label: 'Result' };
    }
    if (state.water !== undefined) {
      return { type: 'custom', data: `Max Water: ${state.water}`, label: 'Current Max' };
    }
    return null;
  },
  inputLabel: 'Array',
  dsLabel: 'Result',
};
