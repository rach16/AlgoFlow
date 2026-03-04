export function LinkedListDiagram() {
  const nodes = [
    { val: '3', label: 'head' },
    { val: '7', label: '' },
    { val: '1', label: '' },
  ];
  return (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {nodes.map((node, i) => {
        const x = 16 + i * 90;
        return (
          <g key={i}>
            {/* Node box split: data | next */}
            <rect x={x} y={30} width="50" height="28" rx="4" fill="#334155" stroke={i === 0 ? '#6366f1' : '#475569'} strokeWidth="1" />
            <line x1={x + 34} y1={30} x2={x + 34} y2={58} stroke="#475569" strokeWidth="1" />
            <text x={x + 17} y={49} textAnchor="middle" fill="#a5b4fc" fontSize="12" fontFamily="monospace">
              {node.val}
            </text>
            <text x={x + 42} y={48} textAnchor="middle" fill="#64748b" fontSize="8">
              ●
            </text>

            {/* Label */}
            {node.label && (
              <text x={x + 17} y={24} textAnchor="middle" fill="#6366f1" fontSize="8" fontFamily="monospace">
                {node.label}
              </text>
            )}

            {/* Pointer arrow to next */}
            {i < nodes.length - 1 && (
              <line x1={x + 50} y1={44} x2={x + 90} y2={44} stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#llArr)" />
            )}
          </g>
        );
      })}

      {/* Null terminator */}
      <text x={16 + nodes.length * 90} y={49} fill="#64748b" fontSize="10" fontFamily="monospace">
        null
      </text>
      <line x1={16 + (nodes.length - 1) * 90 + 50} y1={44} x2={16 + nodes.length * 90 - 4} y2={44} stroke="#475569" strokeWidth="1.5" markerEnd="url(#llArr)" />

      {/* Legend */}
      <text x="16" y="82" fill="#64748b" fontSize="8">
        data
      </text>
      <line x1="36" y1="80" x2="44" y2="80" stroke="#475569" strokeWidth="1" />
      <text x="48" y="82" fill="#64748b" fontSize="8">
        next pointer
      </text>
      <text x="140" y="96" textAnchor="middle" fill="#64748b" fontSize="8">
        Each node stores data + pointer to next node
      </text>

      <defs>
        <marker id="llArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#6366f1" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
