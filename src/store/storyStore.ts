import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emptyStory, type Story } from '../utils/stories';

/**
 * Your own behavioral stories.
 *
 * This is the only store in the app holding text the user wrote themselves, so it is versioned
 * from the start — a shape change here that discarded data would lose work nothing else can
 * reconstruct.
 */
const PERSIST_VERSION = 1;

interface StoryState {
  stories: Story[];
  /**
   * Returns the new story's id so the caller can open it for editing.
   *
   * The clock and the id generator are defaulted here rather than passed in, because both are
   * impure and calling them from a component body trips React's purity rule — the same reason
   * progressStore defaults its own `now`.
   */
  addStory: (principles: string[], now?: number, id?: string) => string;
  updateStory: (id: string, patch: Partial<Omit<Story, 'id'>>, now?: number) => void;
  togglePrinciple: (id: string, principleId: string, now?: number) => void;
  removeStory: (id: string) => void;
  clearStories: () => void;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      stories: [],

      addStory: (principles, now = Date.now(), id = crypto.randomUUID()) => {
        set({ stories: [...get().stories, emptyStory(id, now, principles)] });
        return id;
      },

      updateStory: (id, patch, now = Date.now()) =>
        set({
          stories: get().stories.map((s) =>
            s.id === id ? { ...s, ...patch, updatedAt: now } : s
          ),
        }),

      togglePrinciple: (id, principleId, now = Date.now()) =>
        set({
          stories: get().stories.map((s) => {
            if (s.id !== id) return s;
            const has = s.principles.includes(principleId);
            return {
              ...s,
              principles: has
                ? s.principles.filter((p) => p !== principleId)
                : [...s.principles, principleId],
              updatedAt: now,
            };
          }),
        }),

      removeStory: (id) => set({ stories: get().stories.filter((s) => s.id !== id) }),

      clearStories: () => set({ stories: [] }),
    }),
    {
      name: 'sdetprep-stories',
      version: PERSIST_VERSION,
    }
  )
);
