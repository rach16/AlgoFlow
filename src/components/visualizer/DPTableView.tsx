interface DPTableViewProps {
  dp: (number | string | null)[];
  labels?: string[];
  highlights?: number[];
  secondary?: number[];
  title?: string;
}

export function DPTableView({ dp, labels, highlights = [], secondary = [], title = 'DP Table' }: DPTableViewProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 overflow-x-auto">
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      <div className="flex gap-1">
        {dp.map((val, i) => {
          const isHighlighted = highlights.includes(i);
          const isSecondary = secondary.includes(i);

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              {labels && labels[i] !== undefined && (
                <span className="text-[10px] text-slate-500 font-mono">{labels[i]}</span>
              )}
              <div
                className={`
                  w-10 h-10 flex items-center justify-center rounded font-mono text-sm
                  transition-all duration-300
                  ${isHighlighted ? 'bg-indigo-500 scale-105' : ''}
                  ${isSecondary && !isHighlighted ? 'bg-green-500' : ''}
                  ${!isHighlighted && !isSecondary ? 'bg-slate-800' : ''}
                `}
              >
                {val ?? '-'}
              </div>
              <span className="text-[10px] text-slate-500">[{i}]</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
