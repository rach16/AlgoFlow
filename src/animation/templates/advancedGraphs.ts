import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const advancedGraphsTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Build graph' },
    { id: 'select', label: 'Select Node', description: 'Pick next node' },
    { id: 'relax', label: 'Relax Edges', description: 'Update distances' },
    { id: 'update', label: 'Update State', description: 'Priority queue / set' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'visit') return 'select';
    if (step.action === 'compare') return 'relax';
    if (step.action === 'insert' || step.action === 'push') return 'update';
    return 'select';
  },
  mapInputState: (step) => {
    const state = s(step);
    if (state.nodes && Array.isArray(state.nodes)) {
      return (state.nodes as (string | number)[]).map((v, i) => ({
        value: v,
        status: step.highlights.includes(i) ? 'active' as const : 'default' as const,
      }));
    }
    return [];
  },
  extractDSState: (step) => {
    const state = s(step);
    if (state.graph) {
      return { type: 'graph', data: state.graph, updated: step.action === 'visit' };
    }
    if (state.dist && typeof state.dist === 'object') {
      return { type: 'hashmap', data: state.dist, label: 'Distances', updated: step.action === 'compare' };
    }
    if (state.visited && typeof state.visited === 'object') {
      const visited = state.visited;
      return { type: 'set', data: Array.isArray(visited) ? visited : Object.keys(visited as object), label: 'Visited' };
    }
    return null;
  },
  inputLabel: 'Nodes',
  dsLabel: 'Distances',
};
