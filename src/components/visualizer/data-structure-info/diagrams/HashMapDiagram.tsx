export function HashMapDiagram() {
  return (
    <svg viewBox="0 0 280 160" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {/* Hash function label */}
      <text x="140" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
        hash(key) → index
      </text>

      {/* Key input */}
      <rect x="10" y="28" width="50" height="22" rx="4" fill="#4f46e5" opacity="0.3" stroke="#6366f1" strokeWidth="1" />
      <text x="35" y="43" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace">
        "key"
      </text>

      {/* Arrow to bucket */}
      <line x1="60" y1="39" x2="88" y2="39" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowHead)" />
      <text x="74" y="34" textAnchor="middle" fill="#6366f1" fontSize="8" fontFamily="monospace">
        h()
      </text>

      {/* Bucket array */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x="92"
            y={28 + i * 26}
            width="28"
            height="22"
            rx="3"
            fill={i === 1 ? '#4f46e5' : '#334155'}
            fillOpacity={i === 1 ? 0.4 : 0.6}
            stroke={i === 1 ? '#6366f1' : '#475569'}
            strokeWidth="1"
          />
          <text x="106" y={43 + i * 26} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
            {i}
          </text>
        </g>
      ))}

      {/* Chained entries at bucket 1 */}
      <line x1="120" y1="65" x2="142" y2="65" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowHead)" />
      <rect x="144" y="54" width="56" height="22" rx="4" fill="#334155" stroke="#6366f1" strokeWidth="1" />
      <text x="172" y="69" textAnchor="middle" fill="#a5b4fc" fontSize="8" fontFamily="monospace">
        k:v
      </text>

      <line x1="200" y1="65" x2="218" y2="65" stroke="#6366f1" strokeWidth="1" markerEnd="url(#arrowHead)" />
      <rect x="220" y="54" width="50" height="22" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="245" y="69" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        k:v
      </text>

      {/* Chain at bucket 3 */}
      <line x1="120" y1="117" x2="142" y2="117" stroke="#475569" strokeWidth="1" markerEnd="url(#arrowHead)" />
      <rect x="144" y="106" width="56" height="22" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="172" y="121" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        k:v
      </text>

      {/* Labels */}
      <text x="106" y="158" textAnchor="middle" fill="#64748b" fontSize="8">
        Buckets
      </text>
      <text x="196" y="158" textAnchor="middle" fill="#64748b" fontSize="8">
        Chained Entries
      </text>

      <defs>
        <marker id="arrowHead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#6366f1" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
