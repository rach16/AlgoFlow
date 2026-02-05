import { useVisualizerStore } from '../../store/visualizerStore';
import { useAnimationControl } from '../../hooks/useAnimationControl';

export function Controls() {
  useAnimationControl();

  const {
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    currentStepIndex,
    steps,
    nextStep,
    prevStep,
    reset,
  } = useVisualizerStore();

  const isAtStart = currentStepIndex === 0;
  const isAtEnd = currentStepIndex >= steps.length - 1;

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-800 rounded-lg">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">
          Step {currentStepIndex + 1} / {steps.length}
        </span>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Reset */}
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50"
          disabled={isAtStart}
          title="Reset"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Previous */}
        <button
          onClick={prevStep}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50"
          disabled={isAtStart}
          title="Previous step"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
          disabled={isAtEnd && !isPlaying}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextStep}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50"
          disabled={isAtEnd}
          title="Next step"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400 w-16">Speed</span>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
        <span className="text-sm font-mono w-12 text-right">{speed}x</span>
      </div>
    </div>
  );
}
