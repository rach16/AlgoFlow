import { useMemo } from 'react';

interface ArrayBarProps {
  values: number[];
  highlights: number[];
  secondary?: number[];
  pointers?: Record<string, number>;
  maxValue?: number;
}

const POINTER_COLORS: Record<string, string> = {
  i: 'text-blue-400',
  j: 'text-green-400',
  left: 'text-yellow-400',
  right: 'text-purple-400',
  mid: 'text-pink-400',
  target: 'text-red-400',
};

export function ArrayBar({ values, highlights, secondary = [], pointers = {}, maxValue }: ArrayBarProps) {
  const max = useMemo(() => maxValue || Math.max(...values, 1), [values, maxValue]);

  return (
    <div className="flex items-end justify-center gap-1 h-64 px-4">
      {values.map((value, index) => {
        const isHighlighted = highlights.includes(index);
        const isSecondary = secondary.includes(index);
        const height = (value / max) * 100;

        // Find which pointers point to this index
        const pointersAtIndex = Object.entries(pointers)
          .filter(([, idx]) => idx === index)
          .map(([name]) => name);

        return (
          <div key={index} className="flex flex-col items-center gap-1 flex-1 max-w-16">
            {/* Pointer labels */}
            <div className="h-6 flex gap-1">
              {pointersAtIndex.map((name) => (
                <span
                  key={name}
                  className={`text-xs font-bold ${POINTER_COLORS[name] || 'text-white'}`}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Bar */}
            <div
              className={`
                w-full rounded-t-md transition-all duration-300 flex items-end justify-center
                ${isHighlighted ? 'bg-indigo-500 animate-highlight' : ''}
                ${isSecondary && !isHighlighted ? 'bg-green-500' : ''}
                ${!isHighlighted && !isSecondary ? 'bg-slate-600' : ''}
              `}
              style={{ height: `${height}%`, minHeight: '20px' }}
            >
              <span className="text-xs font-mono text-white pb-1">{value}</span>
            </div>

            {/* Index */}
            <span className="text-xs text-slate-500">[{index}]</span>
          </div>
        );
      })}
    </div>
  );
}
