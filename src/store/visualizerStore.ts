import { create } from 'zustand';
import type { Algorithm, AlgorithmStep } from '../types/algorithm';

interface VisualizerState {
  // Current algorithm
  currentAlgorithm: Algorithm | null;
  setCurrentAlgorithm: (algorithm: Algorithm | null) => void;

  // Input
  input: unknown;
  setInput: (input: unknown) => void;

  // Steps
  steps: AlgorithmStep[];
  setSteps: (steps: AlgorithmStep[]) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;

  // Playback
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;

  // Code language
  language: 'python' | 'javascript';
  setLanguage: (lang: 'python' | 'javascript') => void;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  runAlgorithm: () => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  currentAlgorithm: null,
  setCurrentAlgorithm: (algorithm) => {
    set({ currentAlgorithm: algorithm });
    if (algorithm) {
      set({ input: algorithm.defaultInput });
      get().runAlgorithm();
    }
  },

  input: null,
  setInput: (input) => {
    set({ input });
    get().runAlgorithm();
  },

  steps: [],
  setSteps: (steps) => set({ steps }),
  currentStepIndex: 0,
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  speed: 1,
  setSpeed: (speed) => set({ speed }),

  language: 'python',
  setLanguage: (lang) => set({ language: lang }),

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  reset: () => {
    set({ currentStepIndex: 0, isPlaying: false });
  },

  runAlgorithm: () => {
    const { currentAlgorithm, input } = get();
    if (currentAlgorithm && input !== null) {
      const steps = currentAlgorithm.run(input);
      set({ steps, currentStepIndex: 0, isPlaying: false });
    }
  },
}));
