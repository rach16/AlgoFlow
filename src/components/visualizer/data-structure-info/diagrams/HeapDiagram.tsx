export function HeapDiagram() {
  return (
    <svg viewBox="0 0 260 160" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {/* Tree representation */}
      <text x="130" y="12" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
        Min-Heap (tree view)
      </text>

      {/* Root */}
      <circle cx="130" cy="32" r="14" fill="#4f46e5" fillOpacity="0.3" stroke="#6366f1" strokeWidth="1.5" />
      <text x="130" y="37" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontFamily="monospace">1</text>

      {/* Edges */}
      <line x1="119" y1="43" x2="78" y2="62" stroke="#475569" strokeWidth="1" />
      <line x1="141" y1="43" x2="182" y2="62" stroke="#475569" strokeWidth="1" />

      {/* Level 1 */}
      <circle cx="70" cy="72" r="14" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="70" y="77" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">3</text>
      <circle cx="190" cy="72" r="14" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="190" y="77" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">5</text>

      {/* Level 1 edges */}
      <line x1="60" y1="84" x2="40" y2="98" stroke="#475569" strokeWidth="1" />
      <line x1="80" y1="84" x2="100" y2="98" stroke="#475569" strokeWidth="1" />
      <line x1="180" y1="84" x2="164" y2="98" stroke="#475569" strokeWidth="1" />

      {/* Level 2 */}
      <circle cx="34" cy="108" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="34" y="112" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">7</text>
      <circle cx="106" cy="108" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="106" y="112" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">4</text>
      <circle cx="158" cy="108" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="158" y="112" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">8</text>

      {/* Array mapping */}
      <text x="130" y="134" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        Array: [1, 3, 5, 7, 4, 8]
      </text>
      <text x="130" y="146" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
        idx:   0  1  2  3  4  5
      </text>
      <text x="130" y="158" textAnchor="middle" fill="#64748b" fontSize="7">
        parent(i) = (i-1)/2 | children = 2i+1, 2i+2
      </text>
    </svg>
  );
}
