import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const greedyTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set up state' },
    { id: 'iterate', label: 'Scan', description: 'Process element' },
    { id: 'decide', label: 'Greedy Choice', description: 'Make local best' },
    { id: 'update', label: 'Update', description: 'Track progress' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'compare') return 'decide';
    if (step.action === 'insert') return 'update';
    return 'iterate';
  },
  mapInputState: (step) => {
    const state = s(step);
    const items = (state.nums ?? state.gas ?? state.cost ?? state.s ?? state.hand ?? []) as (string | number)[];
    if (!Array.isArray(items)) return [];
    return items.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      label: step.pointers ? Object.entries(step.pointers).filter(([, idx]) => idx === i).map(([k]) => k)[0] : undefined,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.hashMap && typeof state.hashMap === 'object') {
      return { type: 'hashmap', data: state.hashMap, updated: step.action === 'insert' };
    }
    if (state.result !== undefined && typeof state.result !== 'object') {
      return { type: 'custom', data: `Result: ${state.result}`, label: 'Current Best' };
    }
    return null;
  },
  inputLabel: 'Input',
  dsLabel: 'State',
};
