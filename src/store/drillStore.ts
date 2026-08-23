import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActiveSession,
  CompletedSession,
  DrillOutcome,
} from '../utils/drill';

/**
 * Timed-drill state.
 *
 * The active session is persisted, not just the history: an accidental refresh forty minutes into
 * a session should not destroy it. The clock is derived from `startedAt` rather than counted up in
 * memory, so it stays correct across a reload — you cannot gain time by refreshing.
 */
const PERSIST_VERSION = 1;

interface DrillState {
  active: ActiveSession | null;
  history: CompletedSession[];

  start: (problemIds: string[], limitMs: number, startedAt: number) => void;
  setCode: (id: string, code: string) => void;
  goTo: (index: number) => void;
  /** Stop the clock and move to grading. */
  finish: (finishedAt: number) => void;
  /** Save the graded session to history and clear the active one. */
  commit: (outcomes: Record<string, DrillOutcome>) => void;
  /** Throw the active session away without recording it. */
  abandon: () => void;
  clearHistory: () => void;
}

export const useDrillStore = create<DrillState>()(
  persist(
    (set, get) => ({
      active: null,
      history: [],

      start: (problemIds, limitMs, startedAt) =>
        set({
          active: { problemIds, index: 0, codeById: {}, startedAt, limitMs },
        }),

      setCode: (id, code) => {
        const active = get().active;
        if (!active) return;
        set({ active: { ...active, codeById: { ...active.codeById, [id]: code } } });
      },

      goTo: (index) => {
        const active = get().active;
        if (!active) return;
        const clamped = Math.max(0, Math.min(index, active.problemIds.length - 1));
        set({ active: { ...active, index: clamped } });
      },

      finish: (finishedAt) => {
        const active = get().active;
        if (!active || active.finishedAt) return;
        set({ active: { ...active, finishedAt } });
      },

      commit: (outcomes) => {
        const active = get().active;
        if (!active?.finishedAt) return;
        const session: CompletedSession = {
          startedAt: active.startedAt,
          finishedAt: active.finishedAt,
          limitMs: active.limitMs,
          attempts: active.problemIds.map((id) => ({
            id,
            code: active.codeById[id] ?? '',
            outcome: outcomes[id] ?? 'missed',
          })),
        };
        set({ history: [...get().history, session], active: null });
      },

      abandon: () => set({ active: null }),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'sdetprep-drills',
      version: PERSIST_VERSION,
    }
  )
);
