export function GraphDiagram() {
  return (
    <svg viewBox="0 0 260 140" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      <text x="130" y="14" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
        Adjacency List
      </text>

      {/* Vertex labels */}
      {['0', '1', '2', '3'].map((v, i) => (
        <g key={v}>
          <rect x="10" y={24 + i * 28} width="26" height="22" rx="4" fill="#4f46e5" fillOpacity="0.3" stroke="#6366f1" strokeWidth="1" />
          <text x="23" y={39 + i * 28} textAnchor="middle" fill="#a5b4fc" fontSize="10" fontFamily="monospace">
            {v}
          </text>
          <line x1="36" y1={35 + i * 28} x2="52" y2={35 + i * 28} stroke="#6366f1" strokeWidth="1" markerEnd="url(#gArr)" />
        </g>
      ))}

      {/* Adjacency entries */}
      {[
        ['1', '2'],
        ['0', '3'],
        ['0', '3'],
        ['1', '2'],
      ].map((neighbors, i) => (
        <g key={i}>
          {neighbors.map((n, j) => (
            <g key={j}>
              <rect x={56 + j * 42} y={24 + i * 28} width="36" height="22" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
              <text x={74 + j * 42} y={39 + i * 28} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                {n}
              </text>
              {j < neighbors.length - 1 && (
                <line x1={92 + j * 42} y1={35 + i * 28} x2={98 + j * 42} y2={35 + i * 28} stroke="#475569" strokeWidth="1" />
              )}
            </g>
          ))}
        </g>
      ))}

      {/* Visual graph on right side */}
      <circle cx="182" cy="38" r="12" fill="#334155" stroke="#6366f1" strokeWidth="1.5" />
      <text x="182" y="42" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace">0</text>

      <circle cx="232" cy="38" r="12" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="232" y="42" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">1</text>

      <circle cx="182" cy="100" r="12" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="182" y="104" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">2</text>

      <circle cx="232" cy="100" r="12" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="232" y="104" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">3</text>

      {/* Edges */}
      <line x1="194" y1="38" x2="220" y2="38" stroke="#6366f1" strokeWidth="1.5" />
      <line x1="182" y1="50" x2="182" y2="88" stroke="#6366f1" strokeWidth="1.5" />
      <line x1="232" y1="50" x2="232" y2="88" stroke="#475569" strokeWidth="1.5" />
      <line x1="194" y1="100" x2="220" y2="100" stroke="#475569" strokeWidth="1.5" />

      <text x="130" y="136" textAnchor="middle" fill="#64748b" fontSize="7">
        Vertices connected by edges
      </text>

      <defs>
        <marker id="gArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#6366f1" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
