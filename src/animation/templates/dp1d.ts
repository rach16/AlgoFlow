import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const dp1dTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set base cases' },
    { id: 'iterate', label: 'Iterate', description: 'Process subproblem' },
    { id: 'compute', label: 'Compute', description: 'Apply recurrence' },
    { id: 'fill', label: 'Fill DP', description: 'Store in table' },
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
    const items = (state.nums ?? state.coins ?? state.cost ?? state.chars ?? state.s ?? state.words ?? []) as (string | number)[];
    if (!Array.isArray(items)) return [];
    return items.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.dp && Array.isArray(state.dp)) {
      return { type: 'dp', data: state.dp, label: 'DP Table', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Input',
  dsLabel: 'DP Table',
};
