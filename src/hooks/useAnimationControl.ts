import { useEffect, useRef, useCallback } from 'react';
import { useVisualizerStore } from '../store/visualizerStore';

export function useAnimationControl() {
  const { isPlaying, speed, nextStep, steps, currentStepIndex } = useVisualizerStore();
  const intervalRef = useRef<number | null>(null);

  const clearAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearAnimation();

    if (isPlaying && currentStepIndex < steps.length - 1) {
      const interval = 1000 / speed;
      intervalRef.current = window.setInterval(() => {
        nextStep();
      }, interval);
    }

    return clearAnimation;
  }, [isPlaying, speed, currentStepIndex, steps.length, nextStep, clearAnimation]);

  return { clearAnimation };
}
