import { useParams } from 'react-router-dom';
import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { getAlgorithmById } from '../algorithms';
import { getAnimationConfig } from '../animation/configs';
import type { AlgorithmStep } from '../types/algorithm';
import AnimationLayout from '../animation/components/AnimationLayout';

interface PlaybackState {
  stepIndex: number;
  isPlaying: boolean;
  speed: number; // ms per step
  steps: AlgorithmStep[];
}

type PlaybackAction =
  | { type: 'SET_STEPS'; steps: AlgorithmStep[] }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GOTO'; index: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE' }
  | { type: 'RESET' }
  | { type: 'SET_SPEED'; speed: number };

function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'SET_STEPS':
      return { ...state, steps: action.steps, stepIndex: 0, isPlaying: false };
    case 'NEXT':
      if (state.stepIndex >= state.steps.length - 1) {
        return { ...state, isPlaying: false };
      }
      return { ...state, stepIndex: state.stepIndex + 1 };
    case 'PREV':
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1) };
    case 'GOTO':
      return { ...state, stepIndex: Math.min(action.index, state.steps.length - 1) };
    case 'PLAY':
      if (state.stepIndex >= state.steps.length - 1) {
        return { ...state, stepIndex: 0, isPlaying: true };
      }
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'TOGGLE':
      if (state.isPlaying) return { ...state, isPlaying: false };
      if (state.stepIndex >= state.steps.length - 1) {
        return { ...state, stepIndex: 0, isPlaying: true };
      }
      return { ...state, isPlaying: true };
    case 'RESET':
      return { ...state, stepIndex: 0, isPlaying: false };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    default:
      return state;
  }
}

export default function AnimationPage() {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const algorithm = algorithmId ? getAlgorithmById(algorithmId) : undefined;
  const config = algorithmId ? getAnimationConfig(algorithmId) : undefined;

  const [state, dispatch] = useReducer(playbackReducer, {
    stepIndex: 0,
    isPlaying: false,
    speed: 800,
    steps: [],
  });

  // Run the algorithm on mount
  useEffect(() => {
    if (algorithm) {
      const steps = algorithm.run(algorithm.defaultInput);
      dispatch({ type: 'SET_STEPS', steps });
    }
  }, [algorithm]);

  // Auto-advance
  useEffect(() => {
    if (!state.isPlaying) return;
    const timer = setInterval(() => {
      dispatch({ type: 'NEXT' });
    }, state.speed);
    return () => clearInterval(timer);
  }, [state.isPlaying, state.speed]);

  const currentStep = state.steps[state.stepIndex] ?? null;

  const handlers = useMemo(() => ({
    onPlay: () => dispatch({ type: 'PLAY' }),
    onPause: () => dispatch({ type: 'PAUSE' }),
    onToggle: () => dispatch({ type: 'TOGGLE' }),
    onNext: () => dispatch({ type: 'NEXT' }),
    onPrev: () => dispatch({ type: 'PREV' }),
    onReset: () => dispatch({ type: 'RESET' }),
    onGoto: (i: number) => dispatch({ type: 'GOTO', index: i }),
    onSetSpeed: (s: number) => dispatch({ type: 'SET_SPEED', speed: s }),
  }), []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      dispatch({ type: 'TOGGLE' });
    } else if (e.key === 'ArrowRight' || e.key === 'l') {
      dispatch({ type: 'NEXT' });
    } else if (e.key === 'ArrowLeft' || e.key === 'h') {
      dispatch({ type: 'PREV' });
    } else if (e.key === 'r') {
      dispatch({ type: 'RESET' });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!algorithm || !config) {
    return (
      <div className="anim-page flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-300 mb-2">Algorithm Not Found</h1>
          <p className="text-gray-500">No animation config for "{algorithmId}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-page min-h-screen">
      <AnimationLayout
        config={config}
        algorithm={algorithm}
        currentStep={currentStep}
        stepIndex={state.stepIndex}
        totalSteps={state.steps.length}
        isPlaying={state.isPlaying}
        speed={state.speed}
        handlers={handlers}
      />
    </div>
  );
}
