import type { AnimationTemplate } from '../../types/animation';
import type { AlgorithmStep } from '../../types/algorithm';

const s = (step: AlgorithmStep) => step.state as Record<string, unknown>;

export const graphsTemplate: AnimationTemplate = {
  flowPhases: [
    { id: 'init', label: 'Initialize', description: 'Build graph' },
    { id: 'visit', label: 'Visit Node', description: 'Process current' },
    { id: 'explore', label: 'Explore Edges', description: 'Check neighbors' },
    { id: 'queue', label: 'Queue / Mark', description: 'Add to frontier' },
    { id: 'result', label: 'Return Result', description: 'Output answer' },
  ],
  mapStepToPhase: (step, index, total) => {
    if (index === 0) return 'init';
    if (index === total - 1 || step.action === 'found') return 'result';
    if (step.action === 'visit') return 'visit';
    if (step.action === 'push' || step.action === 'insert') return 'queue';
    if (step.action === 'compare') return 'explore';
    return 'explore';
  },
  mapInputState: (step) => {
    const state = s(step);
    if (state.matrix && Array.isArray(state.matrix)) {
      const flat = (state.matrix as (string | number)[][]).flat();
      return flat.map((v, i) => ({
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
    if (state.visited && typeof state.visited === 'object') {
      const visited = state.visited;
      const data = Array.isArray(visited) ? visited : Object.keys(visited as object);
      return { type: 'set', data, label: 'Visited' };
    }
    if (state.queue && Array.isArray(state.queue)) {
      return { type: 'queue', data: state.queue, label: 'Queue', updated: step.action === 'push' };
    }
    return null;
  },
  inputLabel: 'Grid / Nodes',
  dsLabel: 'Graph State',
};
