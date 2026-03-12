import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const treesTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Start at root' },
    { id: 'visit', label: 'Visit Node', description: 'Process current' },
    { id: 'recurse', label: 'Recurse', description: 'Go left / right' },
    { id: 'compute', label: 'Compute', description: 'Calculate value' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'visit') return 'visit';
    if (step.action === 'compare') return 'compute';
    if (step.action === 'push' || step.action === 'insert') return 'recurse';
    return 'visit';
  },
  mapInputState: (step) => {
    const state = s(step);
    if (state.queue && Array.isArray(state.queue)) {
      return (state.queue as (string | number)[]).map((v, i) => ({
        value: typeof v === 'object' ? JSON.stringify(v) : v,
        status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      }));
    }
    if (state.inorder && Array.isArray(state.inorder)) {
      return (state.inorder as number[]).map((v, i) => ({
        value: v,
        status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      }));
    }
    return [];
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.tree) {
      return { type: 'tree', data: state.tree, updated: step.action === 'visit' || step.action === 'swap' };
    }
    if (state.stack && Array.isArray(state.stack)) {
      return { type: 'stack', data: state.stack, label: 'Call Stack' };
    }
    if (state.result !== undefined) {
      return { type: 'custom', data: JSON.stringify(state.result), label: 'Result' };
    }
    return null;
  },
  inputLabel: 'Traversal',
  dsLabel: 'Tree',
};
