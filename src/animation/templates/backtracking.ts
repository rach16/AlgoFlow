import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const backtrackingTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Set up recursion' },
    { id: 'choose', label: 'Choose', description: 'Pick next option' },
    { id: 'explore', label: 'Explore', description: 'Recurse deeper' },
    { id: 'backtrack', label: 'Backtrack', description: 'Undo & try next' },
    { id: 'result', label: 'Collect Result', description: 'Store solution' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1) return 'result';
    if (step.action === 'found') return 'result';
    if (step.action === 'pop' || step.action === 'delete') return 'backtrack';
    if (step.action === 'push' || step.action === 'insert') return 'choose';
    return 'explore';
  },
  mapInputState: (step) => {
    const state = s(step);
    const nums = (state.nums ?? state.candidates ?? state.chars ?? state.board ?? []) as (string | number)[];
    if (!Array.isArray(nums)) return [];
    return nums.map((v, i) => ({
      value: v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.current && Array.isArray(state.current)) {
      return { type: 'stack', data: state.current, label: 'Current Path', updated: step.action === 'push' || step.action === 'pop' };
    }
    if (state.stack && Array.isArray(state.stack)) {
      return { type: 'stack', data: state.stack, label: 'Current Path', updated: step.action === 'push' || step.action === 'pop' };
    }
    if (state.result && Array.isArray(state.result)) {
      return { type: 'custom', data: JSON.stringify(state.result), label: 'Results Found' };
    }
    return null;
  },
  inputLabel: 'Input',
  dsLabel: 'Current Path',
};
