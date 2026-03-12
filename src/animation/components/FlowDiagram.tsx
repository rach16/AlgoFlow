import type { FlowPhase } from '../../types/animation';

interface FlowDiagramProps {
  phases: FlowPhase[];
  activePhaseId: string;
}

export default function FlowDiagram({ phases, activePhaseId }: FlowDiagramProps) {
  return (
    <div className="flex flex-col items-center gap-0">
      {phases.map((phase, i) => {
        const isActive = phase.id === activePhaseId;
        const activeIdx = phases.findIndex(p => p.id === activePhaseId);
        const isPast = i < activeIdx;

        return (
          <div key={phase.id} className="flex flex-col items-center">
            {/* Phase node */}
            <div
              className={`relative px-4 py-2 rounded-lg border text-center min-w-[140px] transition-all duration-300 ${
                isActive
                  ? 'border-green-400 bg-green-400/10 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                  : isPast
                  ? 'border-gray-600 bg-gray-800/50 opacity-50'
                  : 'border-[#2a2a2a] bg-[#1a1a1a]'
              }`}
            >
              {isActive && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              )}
              <div className={`text-xs font-mono font-bold ${isActive ? 'text-green-400' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                {phase.label}
              </div>
              <div className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-green-300/70' : 'text-gray-600'}`}>
                {phase.description}
              </div>
            </div>

            {/* Arrow between phases */}
            {i < phases.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className={`w-px h-4 ${isPast || isActive ? 'bg-green-400/40' : 'bg-[#2a2a2a]'}`} />
                <div className={`w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent ${
                  isPast || isActive ? 'border-t-green-400/40' : 'border-t-[#2a2a2a]'
                }`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
