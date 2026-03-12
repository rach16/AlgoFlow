import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const bitManipulationTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set up values' },
    { id: 'iterate', label: 'Process Bit', description: 'Check next bit' },
    { id: 'operate', label: 'Bit Operation', description: 'AND/OR/XOR/Shift' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'compare' || step.action === 'swap') return 'operate';
    return 'iterate';
  },
  mapInputState: (step) => {
    const state = s(step);
    if (state.bits && Array.isArray(state.bits)) {
      return (state.bits as (0 | 1)[]).map((v, i) => ({
        value: v,
        status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      }));
    }
    const nums = (state.nums ?? []) as number[];
    if (!Array.isArray(nums)) return [];
    return nums.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.bits2 && Array.isArray(state.bits2)) {
      return { type: 'bits', data: state.bits2, label: 'Result Bits', updated: step.action === 'swap' };
    }
    if (state.result !== undefined) {
      return { type: 'custom', data: `Result: ${state.result}`, label: 'Result' };
    }
    if (state.dp && Array.isArray(state.dp)) {
      return { type: 'dp', data: state.dp, label: 'DP Table', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Bits / Input',
  dsLabel: 'State',
};
