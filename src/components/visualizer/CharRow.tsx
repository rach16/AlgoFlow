interface CharRowProps {
  chars: string[];
  /** Shown to the left, so multiple rows (s vs t) are tellable apart. */
  label?: string;
  highlights?: number[];
  secondary?: number[];
  pointers?: Record<string, number>;
}

/**
 * A string rendered as indexed character cells. Used both for the `chars` state key and for
 * raw string state (s, t, word1, ...) which previously rendered nothing at all — several string
 * problems showed only their hash map, never the words being compared.
 */
export function CharRow({ chars, label, highlights = [], secondary = [], pointers = {} }: CharRowProps) {
  const pointersAt = (i: number) =>
    Object.entries(pointers)
      .filter(([, v]) => v === i)
      .map(([k]) => k);

  return (
    <div className="flex items-start gap-2 mb-3">
      {label && (
        <span className="font-mono text-xs text-slate-500 pt-3 w-8 flex-shrink-0 text-right">
          {label}
        </span>
      )}
      <div className="flex gap-1 flex-wrap">
        {chars.map((char, idx) => {
          const isPrimary = highlights.includes(idx);
          const isSecondary = secondary.includes(idx);
          const marks = pointersAt(idx);
          return (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-lg font-mono text-base transition-all duration-300 ${
                  isPrimary
                    ? 'bg-indigo-500 text-white scale-110'
                    : isSecondary
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {char === ' ' ? '␣' : char}
              </div>
              <span className="text-[9px] text-slate-600 leading-tight mt-0.5">{idx}</span>
              {marks.length > 0 && (
                <span className="text-[9px] text-indigo-400 leading-tight font-mono">
                  {marks.join(',')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
