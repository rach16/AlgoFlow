import type { Algorithm, AlgorithmStep } from '../../types/algorithm';
import type { AnimationConfig } from '../../types/animation';
import AnimationCodeBlock from './AnimationCodeBlock';
import FlowDiagram from './FlowDiagram';
import InputVisualization from './InputVisualization';
import DSVisualization from './DSVisualization';
import PlaybackControls from './PlaybackControls';
import StatusBadge from './StatusBadge';
import StepDescription from './StepDescription';

interface AnimationLayoutProps {
  config: AnimationConfig;
  algorithm: Algorithm;
  currentStep: AlgorithmStep | null;
  stepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  handlers: {
    onPlay: () => void;
    onPause: () => void;
    onToggle: () => void;
    onNext: () => void;
    onPrev: () => void;
    onReset: () => void;
    onGoto: (i: number) => void;
    onSetSpeed: (s: number) => void;
  };
}

export default function AnimationLayout({
  config,
  algorithm,
  currentStep,
  stepIndex,
  totalSteps,
  isPlaying,
  speed,
  handlers,
}: AnimationLayoutProps) {
  if (!currentStep) return null;

  const activePhaseId = config.mapStepToPhase(currentStep, stepIndex, totalSteps);
  const inputItems = config.mapInputState(currentStep);
  const dsState = config.extractDSState(currentStep);
  const activePhase = config.flowPhases.find(p => p.id === activePhaseId);

  return (
    <div className="h-screen flex flex-col p-4 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-mono font-bold text-gray-200">{config.title}</h1>
          <p className="text-xs font-mono text-gray-500">{config.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {activePhase && <StatusBadge label={activePhase.label} phaseId={activePhaseId} />}
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
            algorithm.difficulty === 'Easy' ? 'text-green-400 border-green-400/30' :
            algorithm.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-400/30' :
            'text-red-400 border-red-400/30'
          }`}>
            {algorithm.difficulty}
          </span>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-[minmax(250px,1fr)_2fr_auto] gap-4 min-h-0">
        {/* Left: Code */}
        <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-[#2a2a2a] flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <div className="w-2 h-2 rounded-full bg-green-500/70" />
            <span className="text-[10px] font-mono text-gray-600 ml-2">{config.title.toLowerCase().replace(/\s+/g, '_')}.py</span>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <AnimationCodeBlock code={config.codeSnippet} activeLine={currentStep.codeLine} />
          </div>
        </div>

        {/* Center: Input + DS */}
        <div className="flex flex-col gap-4 min-h-0 overflow-auto">
          {/* Input visualization */}
          <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4 flex items-center justify-center">
            <InputVisualization items={inputItems} label={config.inputLabel} />
          </div>

          {/* DS visualization */}
          {dsState && (
            <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4">
              <DSVisualization dsState={dsState} label={config.dsLabel} />
            </div>
          )}

          {/* Step description */}
          <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4">
            <StepDescription message={currentStep.message} action={currentStep.action} />
          </div>
        </div>

        {/* Right: Flow diagram */}
        <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4 overflow-auto flex items-start justify-center min-w-[170px]">
          <FlowDiagram phases={config.flowPhases} activePhaseId={activePhaseId} />
        </div>
      </div>

      {/* Bottom: Controls */}
      <div className="shrink-0 rounded-lg border border-[#2a2a2a] bg-[#141414] p-4">
        <PlaybackControls
          isPlaying={isPlaying}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          speed={speed}
          handlers={handlers}
        />
      </div>
    </div>
  );
}
