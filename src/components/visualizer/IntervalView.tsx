interface IntervalViewProps {
  intervals: [number, number][];
  highlights?: number[];
  secondary?: number[];
  result?: [number, number][];
  title?: string;
}

export function IntervalView({ intervals, highlights = [], secondary = [], result, title = 'Intervals' }: IntervalViewProps) {
  if (intervals.length === 0) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm italic">No intervals</p>
      </div>
    );
  }

  const allValues = intervals.flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      <div className="space-y-2">
        {intervals.map(([start, end], i) => {
          const isHighlighted = highlights.includes(i);
          const isSecondary = secondary.includes(i);
          const left = ((start - min) / range) * 100;
          const width = Math.max(((end - start) / range) * 100, 2);

          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-16 text-right">
                [{start},{end}]
              </span>
              <div className="flex-1 h-6 bg-slate-800 rounded relative">
                <div
                  className={`
                    absolute h-full rounded transition-all duration-300 flex items-center justify-center text-xs font-mono
                    ${isHighlighted ? 'bg-indigo-500' : ''}
                    ${isSecondary && !isHighlighted ? 'bg-green-500' : ''}
                    ${!isHighlighted && !isSecondary ? 'bg-slate-600' : ''}
                  `}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {result && (
        <div className="mt-4 pt-3 border-t border-slate-600">
          <h4 className="text-xs text-slate-400 mb-2">Result</h4>
          <div className="space-y-1">
            {result.map(([start, end], i) => {
              const left = ((start - min) / range) * 100;
              const width = Math.max(((end - start) / range) * 100, 2);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-green-400 w-16 text-right">[{start},{end}]</span>
                  <div className="flex-1 h-6 bg-slate-800 rounded relative">
                    <div className="absolute h-full rounded bg-green-600" style={{ left: `${left}%`, width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
