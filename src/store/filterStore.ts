import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudienceId } from '../data/audiences';

/**
 * Which audiences the catalogue is narrowed to. Empty means no filter.
 *
 * Persisted, because "I am preparing for a big-tech loop" is a state that lasts weeks, not one
 * session. Kept separate from progressStore: that store holds user data worth migrating carefully,
 * this one holds a view preference that is safe to lose.
 */
const PERSIST_VERSION = 1;

interface FilterState {
  audiences: AudienceId[];
  toggleAudience: (id: AudienceId) => void;
  clearAudiences: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      audiences: [],

      toggleAudience: (id) => {
        const current = get().audiences;
        set({
          audiences: current.includes(id)
            ? current.filter((a) => a !== id)
            : [...current, id],
        });
      },

      clearAudiences: () => set({ audiences: [] }),
    }),
    {
      name: 'sdetprep-filters',
      version: PERSIST_VERSION,
    }
  )
);
