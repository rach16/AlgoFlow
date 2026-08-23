import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyRating, isDue, type Confidence, type ReviewRecord } from '../utils/review';

/**
 * Persisted progress: which problems are solved, plus spaced-repetition state.
 *
 * VERSIONING. This store is the only thing in the app that holds user data, and it lives in
 * localStorage where it survives deploys. Adding `version` + `migrate` means a future shape
 * change upgrades existing data instead of zustand discarding it — without this, adding a field
 * silently wipes everyone's progress. v0 was `{ solvedProblems: string[] }` with no version key.
 *
 * Bump PERSIST_VERSION and extend `migrate` for any future shape change.
 */
const PERSIST_VERSION = 1;

interface ProgressState {
  solvedProblems: string[];
  /** algorithmId -> spaced-repetition record */
  reviews: Record<string, ReviewRecord>;

  toggleSolved: (algorithmId: string) => void;
  /** Record how a problem went, and schedule the next review. */
  rateProblem: (algorithmId: string, confidence: Confidence, now?: number) => void;
  /**
   * Schedule a review for something that is not a problem — currently a behavioral story.
   * Deliberately does NOT touch `solvedProblems`: that list feeds the "N / 254" progress bar, so
   * putting a story id in it would quietly make the count wrong.
   */
  rateOther: (reviewId: string, confidence: Confidence, now?: number) => void;
  clearReview: (algorithmId: string) => void;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      solvedProblems: [],
      reviews: {},

      toggleSolved: (algorithmId: string) => {
        const current = get().solvedProblems;
        if (current.includes(algorithmId)) {
          set({ solvedProblems: current.filter((id) => id !== algorithmId) });
        } else {
          set({ solvedProblems: [...current, algorithmId] });
        }
      },

      rateProblem: (algorithmId, confidence, now = Date.now()) => {
        const { reviews, solvedProblems } = get();
        set({
          reviews: {
            ...reviews,
            [algorithmId]: applyRating(reviews[algorithmId], confidence, now),
          },
          // Rating a problem at all means you attempted it, so treat anything but "again" as
          // solved. Saves the double click of rating and then marking solved separately.
          solvedProblems:
            confidence === 'again' || solvedProblems.includes(algorithmId)
              ? solvedProblems
              : [...solvedProblems, algorithmId],
        });
      },

      rateOther: (reviewId, confidence, now = Date.now()) => {
        const { reviews } = get();
        set({
          reviews: {
            ...reviews,
            [reviewId]: applyRating(reviews[reviewId], confidence, now),
          },
        });
      },

      clearReview: (algorithmId) => {
        const next = { ...get().reviews };
        delete next[algorithmId];
        set({ reviews: next });
      },

      clearProgress: () => set({ solvedProblems: [], reviews: {} }),
    }),
    {
      name: 'algoflow-progress',
      version: PERSIST_VERSION,
      migrate: (persisted, fromVersion) => {
        const state = (persisted ?? {}) as Partial<ProgressState>;
        // v0 -> v1: spaced repetition added. Keep the solved list, start with no review history.
        if (fromVersion < 1) {
          return {
            solvedProblems: Array.isArray(state.solvedProblems) ? state.solvedProblems : [],
            reviews: {},
          } as ProgressState;
        }
        return state as ProgressState;
      },
    }
  )
);

/** Problems due for review right now, most overdue first. */
export function selectDue(
  reviews: Record<string, ReviewRecord>,
  now: number = Date.now()
): { id: string; record: ReviewRecord }[] {
  return Object.entries(reviews)
    .filter(([, r]) => isDue(r, now))
    .map(([id, record]) => ({ id, record }))
    .sort((a, b) => a.record.dueAt - b.record.dueAt);
}

/** Problems scheduled but not yet due, soonest first. */
export function selectUpcoming(
  reviews: Record<string, ReviewRecord>,
  now: number = Date.now()
): { id: string; record: ReviewRecord }[] {
  return Object.entries(reviews)
    .filter(([, r]) => !isDue(r, now))
    .map(([id, record]) => ({ id, record }))
    .sort((a, b) => a.record.dueAt - b.record.dueAt);
}
