import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const heapTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Build heap' },
    { id: 'insert', label: 'Insert / Offer', description: 'Add to heap' },
    { id: 'extract', label: 'Extract', description: 'Remove top' },
    { id: 'process', label: 'Process', description: 'Use extracted value' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'push' || step.action === 'insert') return 'insert';
    if (step.action === 'pop' || step.action === 'delete') return 'extract';
    return 'process';
  },
  mapInputState: (step) => {
    const state = s(step);
    const items = (state.nums ?? state.stones ?? state.points ?? state.tasks ?? []) as (string | number)[];
    if (!Array.isArray(items)) return [];
    return items.map((v, i) => ({
      value: typeof v === 'object' ? JSON.stringify(v) : v,
      status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
    }));
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.heap && Array.isArray(state.heap)) {
      return { type: 'heap', data: state.heap, label: 'Heap', updated: step.action === 'push' || step.action === 'pop' };
    }
    if (state.maxHeap && Array.isArray(state.maxHeap)) {
      return { type: 'heap', data: state.maxHeap, label: 'Max Heap', updated: step.action === 'push' || step.action === 'pop' };
    }
    if (state.minHeap && Array.isArray(state.minHeap)) {
      return { type: 'heap', data: state.minHeap, label: 'Min Heap', updated: step.action === 'push' || step.action === 'pop' };
    }
    return null;
  },
  inputLabel: 'Input',
  dsLabel: 'Heap',
};
