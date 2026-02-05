interface BitViewProps {
  value: number;
  bits?: number;
  highlights?: number[];
  secondary?: number[];
  label?: string;
  title?: string;
}

export function BitView({ value, bits = 8, highlights = [], secondary = [], label, title = 'Bits' }: BitViewProps) {
  const unsigned = value >>> 0;
  const bitString = unsigned.toString(2).padStart(bits, '0').slice(-bits);
  const bitArray = bitString.split('').map(Number);

  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-2">
        {title} {label && <span className="text-slate-300">({label} = {value})</span>}
      </h3>
      <div className="flex gap-1 justify-center">
        {bitArray.map((bit, i) => {
          const bitPos = bits - 1 - i;
          const isHighlighted = highlights.includes(bitPos);
          const isSecondary = secondary.includes(bitPos);

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-8 h-10 flex items-center justify-center rounded font-mono text-lg
                  transition-all duration-300
                  ${isHighlighted ? 'bg-indigo-500 scale-105' : ''}
                  ${isSecondary && !isHighlighted ? 'bg-green-500' : ''}
                  ${!isHighlighted && !isSecondary ? (bit ? 'bg-slate-600' : 'bg-slate-800') : ''}
                `}
              >
                {bit}
              </div>
              <span className="text-[9px] text-slate-500">{bitPos}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-2 text-sm font-mono text-slate-400">
        Decimal: {value} | Hex: 0x{(unsigned).toString(16).toUpperCase()}
      </div>
    </div>
  );
}
