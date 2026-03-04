export function QueueDiagram() {
  const items = ['A', 'B', 'C'];
  return (
    <svg viewBox="0 0 260 110" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {/* Offer arrow (right side) */}
      <text x="228" y="18" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">
        offer
      </text>
      <line x1="228" y1="22" x2="228" y2="38" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#qArrG)" />

      {/* Poll arrow (left side) */}
      <text x="42" y="90" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
        poll
      </text>
      <line x1="42" y1="72" x2="42" y2="84" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#qArrR)" />

      {/* Container */}
      <line x1="20" y1="40" x2="248" y2="40" stroke="#475569" strokeWidth="2" />
      <line x1="20" y1="74" x2="248" y2="74" stroke="#475569" strokeWidth="2" />
      <line x1="20" y1="40" x2="20" y2="74" stroke="#475569" strokeWidth="2" />
      <line x1="248" y1="40" x2="248" y2="74" stroke="#475569" strokeWidth="2" />

      {/* Queue items */}
      {items.map((item, i) => (
        <g key={i}>
          <rect
            x={32 + i * 72}
            y={44}
            width="60"
            height="26"
            rx="4"
            fill={i === 0 ? '#4f46e5' : '#334155'}
            fillOpacity={i === 0 ? 0.4 : 0.6}
            stroke={i === 0 ? '#6366f1' : '#475569'}
            strokeWidth="1"
          />
          <text
            x={62 + i * 72}
            y={61}
            textAnchor="middle"
            fill={i === 0 ? '#a5b4fc' : '#94a3b8'}
            fontSize="12"
            fontFamily="monospace"
          >
            {item}
          </text>
        </g>
      ))}

      {/* Front / Back labels */}
      <text x="42" y="36" textAnchor="middle" fill="#6366f1" fontSize="8" fontFamily="monospace">
        front
      </text>
      <text x="228" y="36" textAnchor="middle" fill="#6366f1" fontSize="8" fontFamily="monospace">
        back
      </text>

      <text x="134" y="106" textAnchor="middle" fill="#64748b" fontSize="8">
        FIFO — First In, First Out
      </text>

      <defs>
        <marker id="qArrG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#22c55e" strokeWidth="1" />
        </marker>
        <marker id="qArrR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#ef4444" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
