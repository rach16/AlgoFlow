export function HashSetDiagram() {
  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      <text x="120" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
        hash(value) → index
      </text>

      {/* Value input */}
      <rect x="10" y="30" width="44" height="22" rx="4" fill="#4f46e5" opacity="0.3" stroke="#6366f1" strokeWidth="1" />
      <text x="32" y="45" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace">
        val
      </text>

      {/* Arrow */}
      <line x1="54" y1="41" x2="78" y2="41" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#setArr)" />

      {/* Bucket array with single values */}
      {[0, 1, 2, 3, 4].map((i) => {
        const hasVal = i === 1 || i === 3;
        return (
          <g key={i}>
            <rect
              x="82"
              y={28 + i * 22}
              width="28"
              height="18"
              rx="3"
              fill={hasVal ? '#334155' : '#1e293b'}
              stroke={hasVal ? '#6366f1' : '#475569'}
              strokeWidth="1"
            />
            <text x="96" y={41 + i * 22} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              {i}
            </text>
            {hasVal && (
              <>
                <line x1="110" y1={37 + i * 22} x2="128" y2={37 + i * 22} stroke="#6366f1" strokeWidth="1" markerEnd="url(#setArr)" />
                <rect x="130" y={28 + i * 22} width="40" height="18" rx="4" fill="#4f46e5" fillOpacity="0.2" stroke="#6366f1" strokeWidth="1" />
                <text x="150" y={41 + i * 22} textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace">
                  {i === 1 ? '5' : '12'}
                </text>
              </>
            )}
          </g>
        );
      })}

      <text x="96" y="138" textAnchor="middle" fill="#64748b" fontSize="8">Buckets</text>
      <text x="150" y="138" textAnchor="middle" fill="#64748b" fontSize="8">Values</text>

      <defs>
        <marker id="setArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#6366f1" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
