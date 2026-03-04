export function StackDiagram() {
  const items = ['C', 'B', 'A'];
  return (
    <svg viewBox="0 0 180 150" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {/* Push arrow */}
      <line x1="30" y1="20" x2="30" y2="42" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#stkArrG)" />
      <text x="30" y="14" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">
        push
      </text>

      {/* Pop arrow */}
      <line x1="150" y1="42" x2="150" y2="20" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#stkArrR)" />
      <text x="150" y="14" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
        pop
      </text>

      {/* Top label */}
      <text x="90" y="40" textAnchor="middle" fill="#6366f1" fontSize="9" fontFamily="monospace">
        ← top
      </text>

      {/* Stack items */}
      {items.map((item, i) => (
        <g key={i}>
          <rect
            x="50"
            y={46 + i * 30}
            width="80"
            height="26"
            rx="4"
            fill={i === 0 ? '#4f46e5' : '#334155'}
            fillOpacity={i === 0 ? 0.4 : 0.6}
            stroke={i === 0 ? '#6366f1' : '#475569'}
            strokeWidth="1"
          />
          <text x="90" y={63 + i * 30} textAnchor="middle" fill={i === 0 ? '#a5b4fc' : '#94a3b8'} fontSize="12" fontFamily="monospace">
            {item}
          </text>
        </g>
      ))}

      {/* Container walls */}
      <line x1="46" y1="44" x2="46" y2="135" stroke="#475569" strokeWidth="2" />
      <line x1="134" y1="44" x2="134" y2="135" stroke="#475569" strokeWidth="2" />
      <line x1="46" y1="135" x2="134" y2="135" stroke="#475569" strokeWidth="2" />

      <text x="90" y="148" textAnchor="middle" fill="#64748b" fontSize="8">
        LIFO — Last In, First Out
      </text>

      <defs>
        <marker id="stkArrG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#22c55e" strokeWidth="1" />
        </marker>
        <marker id="stkArrR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#ef4444" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
