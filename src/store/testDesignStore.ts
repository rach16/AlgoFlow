import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveDesignAttempt, DesignAttempt } from '../utils/testDesign';

/**
 * Test-design attempts.
 *
 * The in-progress attempt is persisted alongside the history, for the same reason the drill store
 * persists its active session: this holds text the user typed, and a refresh ten minutes into an
 * enumeration must not throw it away. `startedAt` is stored rather than an elapsed counter, so the
 * timer stays honest across a reload.
 *
 * `revealedAt` is one-way on purpose. Once you have seen the reference list, the enumeration is
 * over — letting you hide it again and keep typing would quietly turn the exercise into copying.
 */
const PERSIST_VERSION = 1;

interface TestDesignState {
  active: ActiveDesignAttempt | null;
  attempts: DesignAttempt[];

  begin: (exerciseId: string, startedAt: number) => void;
  setNotes: (notes: string) => void;
  reveal: (revealedAt: number) => void;
  toggleChecked: (caseId: string) => void;
  /** Save the scored attempt to history and clear the active one. */
  commit: (finishedAt: number) => void;
  /** Throw the active attempt away without recording it. */
  abandon: () => void;
  clearAttempts: () => void;
}

export const useTestDesignStore = create<TestDesignState>()(
  persist(
    (set, get) => ({
      active: null,
      attempts: [],

      begin: (exerciseId, startedAt) =>
        set({ active: { exerciseId, notes: '', startedAt, checked: [] } }),

      setNotes: (notes) => {
        const active = get().active;
        if (!active) return;
        set({ active: { ...active, notes } });
      },

      reveal: (revealedAt) => {
        const active = get().active;
        if (!active || active.revealedAt) return;
        set({ active: { ...active, revealedAt } });
      },

      toggleChecked: (caseId) => {
        const active = get().active;
        if (!active) return;
        const has = active.checked.includes(caseId);
        set({
          active: {
            ...active,
            checked: has
              ? active.checked.filter((id) => id !== caseId)
              : [...active.checked, caseId],
          },
        });
      },

      commit: (finishedAt) => {
        const active = get().active;
        if (!active) return;
        const attempt: DesignAttempt = {
          exerciseId: active.exerciseId,
          notes: active.notes,
          checked: active.checked,
          startedAt: active.startedAt,
          finishedAt,
        };
        set({ attempts: [...get().attempts, attempt], active: null });
      },

      abandon: () => set({ active: null }),

      clearAttempts: () => set({ attempts: [] }),
    }),
    {
      name: 'sdetprep-test-design',
      version: PERSIST_VERSION,
    }
  )
);
