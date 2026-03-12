import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const stackTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Create stack' },
    { id: 'iterate', label: 'Read Input', description: 'Process next element' },
    { id: 'check', label: 'Check Stack', description: 'Peek / compare top' },
    { id: 'modify', label: 'Push / Pop', description: 'Modify stack' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'push' || step.action === 'pop') return 'modify';
    if (step.action === 'compare') return 'check';
    return 'iterate';
  },
  mapInputState: (step) => {
    const state = s(step);
    const items = (state.tokens ?? state.chars ?? state.nums ?? state.s ?? state.temperatures ?? []) as (string | number)[];
    if (!Array.isArray(items)) return [];
    return items.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      label: step.pointers ? Object.entries(step.pointers).filter(([, idx]) => idx === i).map(([k]) => k)[0] : undefined,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.stack && Array.isArray(state.stack)) {
      return { type: 'stack', data: state.stack, updated: step.action === 'push' || step.action === 'pop' };
    }
    return null;
  },
  inputLabel: 'Input',
  dsLabel: 'Stack',
};
