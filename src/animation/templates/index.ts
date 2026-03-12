import type { AnimationConfig, AnimationTemplate, AnimationConfigOverrides } from '../../types/animation';

export function createConfig(template: AnimationTemplate, overrides: AnimationConfigOverrides): AnimationConfig {
  return {
    algorithmId: overrides.algorithmId,
    title: overrides.title,
    subtitle: overrides.subtitle,
    codeSnippet: overrides.codeSnippet,
    flowPhases: overrides.flowPhases ?? template.flowPhases,
    mapStepToPhase: overrides.mapStepToPhase ?? template.mapStepToPhase,
    mapInputState: overrides.mapInputState ?? template.mapInputState,
    extractDSState: overrides.extractDSState ?? template.extractDSState,
    inputLabel: overrides.inputLabel ?? template.inputLabel,
    dsLabel: overrides.dsLabel ?? template.dsLabel,
  };
}

export { arraysHashingTemplate } from './arraysHashing';
export { twoPointersTemplate } from './twoPointers';
export { stackTemplate } from './stack';
export { slidingWindowTemplate } from './slidingWindow';
export { binarySearchTemplate } from './binarySearch';
export { linkedListTemplate } from './linkedList';
export { backtrackingTemplate } from './backtracking';
export { triesTemplate } from './tries';
export { heapTemplate } from './heap';
export { treesTemplate } from './trees';
export { dp1dTemplate } from './dp1d';
export { dp2dTemplate } from './dp2d';
export { greedyTemplate } from './greedy';
export { intervalsTemplate } from './intervals';
export { mathGeometryTemplate } from './mathGeometry';
export { bitManipulationTemplate } from './bitManipulation';
export { graphsTemplate } from './graphs';
export { advancedGraphsTemplate } from './advancedGraphs';
