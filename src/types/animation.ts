import type { AlgorithmStep } from './algorithm';

export interface FlowPhase {
  id: string;
  label: string;
  description: string;
}

export interface InputItem {
  value: string | number;
  status: 'default' | 'active' | 'done' | 'found';
  label?: string;
}

export interface DSState {
  type: 'hashmap' | 'stack' | 'queue' | 'set' | 'array' | 'tree' | 'graph' | 'matrix' | 'heap' | 'trie' | 'linkedlist' | 'intervals' | 'bits' | 'dp' | 'custom';
  data: unknown;
  label?: string;
  updated?: boolean;
}

export interface AnimationConfig {
  algorithmId: string;
  title: string;
  subtitle: string;
  codeSnippet: string;
  flowPhases: FlowPhase[];
  mapStepToPhase: (step: AlgorithmStep, index: number, total: number) => string;
  mapInputState: (step: AlgorithmStep) => InputItem[];
  extractDSState: (step: AlgorithmStep) => DSState | null;
  inputLabel: string;
  dsLabel: string;
}

export interface AnimationTemplate {
  flowPhases: FlowPhase[];
  mapStepToPhase: (step: AlgorithmStep, index: number, total: number) => string;
  mapInputState: (step: AlgorithmStep) => InputItem[];
  extractDSState: (step: AlgorithmStep) => DSState | null;
  inputLabel: string;
  dsLabel: string;
}

export interface AnimationConfigOverrides {
  algorithmId: string;
  title: string;
  subtitle: string;
  codeSnippet: string;
  flowPhases?: FlowPhase[];
  mapStepToPhase?: (step: AlgorithmStep, index: number, total: number) => string;
  mapInputState?: (step: AlgorithmStep) => InputItem[];
  extractDSState?: (step: AlgorithmStep) => DSState | null;
  inputLabel?: string;
  dsLabel?: string;
}
