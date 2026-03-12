import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const dp2dTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set up 2D table' },
    { id: 'iterate', label: 'Iterate', description: 'Next cell' },
    { id: 'compute', label: 'Compute', description: 'Apply recurrence' },
    { id: 'fill', label: 'Fill Cell', description: 'Store value' },
    { id: 'result', label: 'Return Result', description: 'Read answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'insert') return 'fill';
    if (step.action === 'compare') return 'compute';
    return 'iterate';
  },
  mapInputState: (step) => {
    const state = s(step);
    const s1 = (state.s1 ?? state.text1 ?? state.s ?? state.nums ?? []) as (string | number)[];
    if (typeof s1 === 'string') {
      return (s1 as string).split('').map((c: string, i: number) => ({
        value: c,
        status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      }));
    }
    if (!Array.isArray(s1)) return [];
    return s1.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.dp2d && Array.isArray(state.dp2d)) {
      return { type: 'matrix', data: state.dp2d, label: 'DP Table', updated: step.action === 'insert' };
    }
    if (state.dp && Array.isArray(state.dp)) {
      if (Array.isArray((state.dp as unknown[])[0])) {
        return { type: 'matrix', data: state.dp, label: 'DP Table', updated: step.action === 'insert' };
      }
      return { type: 'dp', data: state.dp, label: 'DP Table', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Input',
  dsLabel: 'DP Table',
};
