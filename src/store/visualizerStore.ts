import { create } from 'zustand';
import type { Algorithm, AlgorithmStep } from '../types/algorithm';
import { loadAlgorithm, getLoaded } from '../algorithms/registry';
import { getActiveApproach, OPTIMAL_APPROACH_ID } from '../utils/approaches';

interface VisualizerState {
  // Current algorithm
  currentAlgorithm: Algorithm | null;
  /** Select by id; the implementation is fetched on demand. */
  selectAlgorithm: (id: string) => Promise<void>;
  /** Non-null while an implementation is in flight, so the UI can show a placeholder. */
  loadingId: string | null;
  /** Set when loading an implementation failed (a chunk that would not download). */
  loadError: string | null;

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
  language: 'python' | 'javascript' | 'java';
  setLanguage: (lang: 'python' | 'javascript' | 'java') => void;

  /** Set when the active approach's run() threw, so the UI can say so. */
  runError: string | null;

  // Solution approach ('optimal' = the algorithm's flat/default solution)
  approachId: string;
  setApproachId: (id: string) => void;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  runAlgorithm: () => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  currentAlgorithm: null,
  loadingId: null,
  loadError: null,

  selectAlgorithm: async (id) => {
    // Already resolved: swap synchronously so revisiting a problem never flashes a spinner.
    const cached = getLoaded(id);
    if (cached) {
      set({ currentAlgorithm: cached, approachId: OPTIMAL_APPROACH_ID, input: cached.defaultInput, loadingId: null, loadError: null });
      get().runAlgorithm();
      return;
    }

    set({ loadingId: id, loadError: null });
    try {
      const algorithm = await loadAlgorithm(id);
      // A newer selection may have started while this was in flight; that one wins.
      if (get().loadingId !== id) return;
      set({ currentAlgorithm: algorithm, approachId: OPTIMAL_APPROACH_ID, input: algorithm.defaultInput, loadingId: null });
      get().runAlgorithm();
    } catch (err) {
      console.error(`[AlgoFlow] failed to load ${id}:`, err);
      set({ loadingId: null, loadError: err instanceof Error ? err.message : String(err) });
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

  runError: null,

  approachId: OPTIMAL_APPROACH_ID,
  setApproachId: (id) => {
    set({ approachId: id });
    get().runAlgorithm();
  },

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
    const { currentAlgorithm, input, approachId } = get();
    if (!currentAlgorithm || input === null) return;
    const approach = getActiveApproach(currentAlgorithm, approachId);
    try {
      const steps = approach.run(input);
      set({ steps, currentStepIndex: 0, isPlaying: false, runError: null });
    } catch (err) {
      // Clear the steps so the previous problem's visualization cannot be mistaken for this
      // one's, and surface the failure instead of failing silently.
      console.error(`[AlgoFlow] ${currentAlgorithm.id} / ${approach.id} threw while generating steps:`, err);
      set({
        steps: [],
        currentStepIndex: 0,
        isPlaying: false,
        runError: err instanceof Error ? err.message : String(err),
      });
    }
  },
}));
