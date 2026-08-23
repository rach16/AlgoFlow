import { useEffect } from 'react';
import { useVisualizerStore } from '../store/visualizerStore';
import { getApproaches } from '../utils/approaches';

const LANGUAGE_KEYS = { '1': 'python', '2': 'javascript', '3': 'java' } as const;

/** True for anything the user could be typing into, so a shortcut never eats a keystroke. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Keyboard control for the visualizer. Stepping through a 20-step animation was 20 clicks;
 * these are the same keys the /animate page already uses, plus language and approach switching.
 *
 * Registered on the shell rather than inside Controls so it can be disabled while the search
 * palette owns the keyboard. State is read via getState() inside the handler so the listener
 * is registered once instead of on every step.
 */
export function useVisualizerShortcuts(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      // Leave browser and app chords (⌘K, ⌘R, ⌥→) alone.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const s = useVisualizerStore.getState();
      if (!s.currentAlgorithm || s.steps.length === 0) return;
      const lastIndex = s.steps.length - 1;

      switch (e.key) {
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          s.nextStep();
          return;
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          s.prevStep();
          return;
        case ' ':
        case 'k':
          e.preventDefault();
          if (s.isPlaying) {
            s.setIsPlaying(false);
          } else {
            // Replaying from the end restarts, matching the /animate page.
            if (s.currentStepIndex >= lastIndex) s.setCurrentStepIndex(0);
            s.setIsPlaying(true);
          }
          return;
        case 'r':
          e.preventDefault();
          s.reset();
          return;
        case 'Home':
          e.preventDefault();
          s.setCurrentStepIndex(0);
          return;
        case 'End':
          e.preventDefault();
          s.setIsPlaying(false);
          s.setCurrentStepIndex(lastIndex);
          return;
        case '1':
        case '2':
        case '3':
          e.preventDefault();
          s.setLanguage(LANGUAGE_KEYS[e.key]);
          return;
        case '[':
        case ']': {
          e.preventDefault();
          const approaches = getApproaches(s.currentAlgorithm);
          if (approaches.length < 2) return;
          const at = approaches.findIndex((a) => a.id === s.approachId);
          const delta = e.key === ']' ? 1 : approaches.length - 1;
          s.setApproachId(approaches[(at + delta) % approaches.length].id);
          return;
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
