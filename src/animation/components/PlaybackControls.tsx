interface PlaybackControlsProps {
  isPlaying: boolean;
  stepIndex: number;
  totalSteps: number;
  speed: number;
  handlers: {
    onToggle: () => void;
    onNext: () => void;
    onPrev: () => void;
    onReset: () => void;
    onGoto: (i: number) => void;
    onSetSpeed: (s: number) => void;
  };
}

export default function PlaybackControls({
  isPlaying,
  stepIndex,
  totalSteps,
  speed,
  handlers,
}: PlaybackControlsProps) {
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar */}
      <div className="relative w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          handlers.onGoto(Math.round(pct * (totalSteps - 1)));
        }}
      >
        <div
          className="absolute left-0 top-0 h-full bg-green-400 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            onClick={handlers.onReset}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm"
            title="Reset (R)"
          >
            ↺
          </button>

          {/* Prev */}
          <button
            onClick={handlers.onPrev}
            disabled={stepIndex === 0}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            title="Previous (←)"
          >
            ◁
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlers.onToggle}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-green-400/50 bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors text-lg"
            title="Play/Pause (Space)"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* Next */}
          <button
            onClick={handlers.onNext}
            disabled={stepIndex >= totalSteps - 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            title="Next (→)"
          >
            ▷
          </button>
        </div>

        {/* Step counter */}
        <span className="font-mono text-xs text-gray-500">
          {stepIndex + 1} / {totalSteps}
        </span>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-600">SPEED</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={2100 - speed}
            onChange={(e) => handlers.onSetSpeed(2100 - Number(e.target.value))}
            className="w-20 h-1 accent-green-400 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-gray-500 w-10 text-right">
            {speed < 400 ? 'Fast' : speed < 1000 ? 'Med' : 'Slow'}
          </span>
        </div>
      </div>
    </div>
  );
}
