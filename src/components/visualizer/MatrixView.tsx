/** Cell references are [row, col] tuples, but some algorithms emit {row, col} objects.
 *  Destructuring an object as an array yields undefined, so those highlights silently
 *  never match — normalize instead of trusting the caller. */
type LooseCell = [number, number] | { row: number; col: number };

const toCell = (c: LooseCell): [number, number] =>
  Array.isArray(c) ? c : [c.row, c.col];

interface MatrixViewProps {
  matrix: (number | string)[][];
  highlights?: LooseCell[];
  secondary?: LooseCell[];
  pointers?: Record<string, LooseCell>;
  title?: string;
}

export function MatrixView({
  matrix,
  highlights: rawHighlights = [],
  secondary: rawSecondary = [],
  pointers: rawPointers = {},
  title = 'Matrix',
}: MatrixViewProps) {
  const highlights = rawHighlights.map(toCell);
  const secondary = rawSecondary.map(toCell);
  const pointers = Object.fromEntries(
    Object.entries(rawPointers).map(([k, v]) => [k, toCell(v)])
  ) as Record<string, [number, number]>;
  if (matrix.length === 0) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm italic">Empty matrix</p>
      </div>
    );
  }

  const isHighlighted = (r: number, c: number) =>
    highlights.some(([hr, hc]) => hr === r && hc === c);

  const isSecondaryCell = (r: number, c: number) =>
    secondary.some(([sr, sc]) => sr === r && sc === c);

  const getPointers = (r: number, c: number) =>
    Object.entries(pointers)
      .filter(([, [pr, pc]]) => pr === r && pc === c)
      .map(([name]) => name);

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 overflow-x-auto">
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` }}>
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            const highlighted = isHighlighted(r, c);
            const secondaryHighlight = isSecondaryCell(r, c);
            const cellPointers = getPointers(r, c);

            return (
              <div key={`${r}-${c}`} className="flex flex-col items-center">
                {cellPointers.length > 0 && (
                  <div className="flex gap-0.5">
                    {cellPointers.map((name) => (
                      <span key={name} className="text-[9px] font-bold text-blue-400">{name}</span>
                    ))}
                  </div>
                )}
                <div
                  className={`
                    w-10 h-10 flex items-center justify-center rounded font-mono text-sm
                    transition-all duration-300
                    ${highlighted ? 'bg-indigo-500 scale-105' : ''}
                    ${secondaryHighlight && !highlighted ? 'bg-green-500' : ''}
                    ${!highlighted && !secondaryHighlight ? 'bg-slate-800' : ''}
                  `}
                >
                  {cell}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
