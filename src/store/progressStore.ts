import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  solvedProblems: string[];
  toggleSolved: (algorithmId: string) => void;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      solvedProblems: [],

      toggleSolved: (algorithmId: string) => {
        const current = get().solvedProblems;
        if (current.includes(algorithmId)) {
          set({ solvedProblems: current.filter((id) => id !== algorithmId) });
        } else {
          set({ solvedProblems: [...current, algorithmId] });
        }
      },

      clearProgress: () => set({ solvedProblems: [] }),
    }),
    { name: 'algoflow-progress' }
  )
);
