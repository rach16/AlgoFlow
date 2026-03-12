import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const mathGeometryTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set up state' },
    { id: 'iterate', label: 'Process', description: 'Next iteration' },
    { id: 'compute', label: 'Compute', description: 'Apply formula' },
    { id: 'update', label: 'Update', description: 'Modify state' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'swap' || step.action === 'insert') return 'update';
    if (step.action === 'compare') return 'compute';
    return 'iterate';
  },
  mapInputState: (step) => {
    const state = s(step);
    if (state.matrix && Array.isArray(state.matrix)) {
      const flat = (state.matrix as number[][]).flat();
      return flat.map((v, i) => ({
        value: v,
        status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      }));
    }
    const nums = (state.nums ?? state.digits ?? []) as (string | number)[];
    if (!Array.isArray(nums)) return [];
    return nums.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.matrix && Array.isArray(state.matrix)) {
      return { type: 'matrix', data: state.matrix, updated: step.action === 'swap' };
    }
    if (state.result !== undefined) {
      return { type: 'custom', data: JSON.stringify(state.result), label: 'Result' };
    }
    return null;
  },
  inputLabel: 'Input',
  dsLabel: 'State',
};
