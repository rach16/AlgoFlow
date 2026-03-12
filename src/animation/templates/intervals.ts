import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const intervalsTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Sort / Init', description: 'Prepare intervals' },
    { id: 'iterate', label: 'Next Interval', description: 'Process current' },
    { id: 'check', label: 'Check Overlap', description: 'Compare bounds' },
    { id: 'merge', label: 'Merge / Insert', description: 'Update result' },
    { id: 'result', label: 'Return Result', description: 'Output intervals' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'compare') return 'check';
    if (step.action === 'insert' || step.action === 'swap') return 'merge';
    return 'iterate';
  },
  mapInputState: (step) => {
    const state = s(step);
    const intervals = (state.intervals ?? []) as [number, number][];
    if (!Array.isArray(intervals)) return [];
    return intervals.map((v, i) => ({
      value: `[${v[0]},${v[1]}]`,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.resultIntervals && Array.isArray(state.resultIntervals)) {
      const ri = state.resultIntervals as [number, number][];
      return { type: 'array', data: ri.map(v => `[${v[0]},${v[1]}]`), label: 'Result', updated: step.action === 'insert' };
    }
    if (state.result && Array.isArray(state.result)) {
      return { type: 'array', data: state.result, label: 'Result', updated: step.action === 'insert' };
    }
    return null;
  },
  inputLabel: 'Intervals',
  dsLabel: 'Result',
};
