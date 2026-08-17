import type { AnimationConfig } from '../../types/animation';
import { arraysHashingConfigs } from './arraysHashing';
import { twoPointersConfigs } from './twoPointers';
import { stackConfigs } from './stack';
import { slidingWindowConfigs } from './slidingWindow';
import { binarySearchConfigs } from './binarySearch';
import { linkedListConfigs } from './linkedList';
import { backtrackingConfigs } from './backtracking';
import { triesConfigs } from './tries';
import { heapConfigs } from './heap';
import { treesConfigs } from './trees';
import { dp1dConfigs } from './dp1d';
import { dp2dConfigs } from './dp2d';
import { greedyConfigs } from './greedy';
import { intervalsConfigs } from './intervals';
import { mathGeometryConfigs } from './mathGeometry';
import { bitManipulationConfigs } from './bitManipulation';
import { graphsConfigs } from './graphs';
import { advancedGraphsConfigs } from './advancedGraphs';

// NeetCode 250 additions
import { arraysHashingNewAConfigs } from './arraysHashingNewA';
import { arraysHashingNewBConfigs } from './arraysHashingNewB';
import { twoPointersNewAConfigs } from './twoPointersNewA';
import { twoPointersNewBConfigs } from './twoPointersNewB';
import { slidingWindowNewConfigs } from './slidingWindowNew';
import { stackNewAConfigs } from './stackNewA';
import { stackNewBConfigs } from './stackNewB';
import { binarySearchNewAConfigs } from './binarySearchNewA';
import { binarySearchLinkedListNewConfigs } from './binarySearchLinkedListNew';
import { treesNewAConfigs } from './treesNewA';
import { treesNewBConfigs } from './treesNewB';

const allConfigs: AnimationConfig[] = [
  ...arraysHashingConfigs,
  ...twoPointersConfigs,
  ...stackConfigs,
  ...slidingWindowConfigs,
  ...binarySearchConfigs,
  ...linkedListConfigs,
  ...backtrackingConfigs,
  ...triesConfigs,
  ...heapConfigs,
  ...treesConfigs,
  ...dp1dConfigs,
  ...dp2dConfigs,
  ...greedyConfigs,
  ...intervalsConfigs,
  ...mathGeometryConfigs,
  ...bitManipulationConfigs,
  ...graphsConfigs,
  ...advancedGraphsConfigs,
  // NeetCode 250 additions
  ...arraysHashingNewAConfigs,
  ...arraysHashingNewBConfigs,
  ...twoPointersNewAConfigs,
  ...twoPointersNewBConfigs,
  ...slidingWindowNewConfigs,
  ...stackNewAConfigs,
  ...stackNewBConfigs,
  ...binarySearchNewAConfigs,
  ...binarySearchLinkedListNewConfigs,
  ...treesNewAConfigs,
  ...treesNewBConfigs,
];

const configMap = new Map<string, AnimationConfig>();
for (const config of allConfigs) {
  configMap.set(config.algorithmId, config);
}

export function getAnimationConfig(algorithmId: string): AnimationConfig | undefined {
  return configMap.get(algorithmId);
}
