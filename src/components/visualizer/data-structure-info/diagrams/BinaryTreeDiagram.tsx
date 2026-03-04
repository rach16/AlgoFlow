export function BinaryTreeDiagram() {
  return (
    <svg viewBox="0 0 220 140" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {/* Root node */}
      <circle cx="110" cy="28" r="16" fill="#334155" stroke="#6366f1" strokeWidth="1.5" />
      <text x="110" y="33" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontFamily="monospace">
        8
      </text>
      <text x="110" y="10" textAnchor="middle" fill="#6366f1" fontSize="8" fontFamily="monospace">
        root
      </text>

      {/* Edges to children */}
      <line x1="97" y1="40" x2="62" y2="66" stroke="#475569" strokeWidth="1.5" />
      <line x1="123" y1="40" x2="158" y2="66" stroke="#475569" strokeWidth="1.5" />

      {/* Edge labels */}
      <text x="72" y="50" fill="#22c55e" fontSize="8" fontFamily="monospace">
        L
      </text>
      <text x="144" y="50" fill="#eab308" fontSize="8" fontFamily="monospace">
        R
      </text>

      {/* Left child */}
      <circle cx="50" cy="78" r="16" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="50" y="83" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">
        3
      </text>

      {/* Right child */}
      <circle cx="170" cy="78" r="16" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="170" y="83" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">
        10
      </text>

      {/* Grandchildren edges */}
      <line x1="40" y1="92" x2="26" y2="108" stroke="#475569" strokeWidth="1" />
      <line x1="60" y1="92" x2="74" y2="108" stroke="#475569" strokeWidth="1" />
      <line x1="180" y1="92" x2="194" y2="108" stroke="#475569" strokeWidth="1" />

      {/* Grandchildren */}
      <circle cx="20" cy="118" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="20" y="122" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
        1
      </text>
      <circle cx="80" cy="118" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="80" y="122" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
        6
      </text>
      <circle cx="200" cy="118" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="200" y="122" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
        14
      </text>

      {/* BST property hint */}
      <text x="110" y="138" textAnchor="middle" fill="#64748b" fontSize="7">
        BST: left &lt; parent &lt; right
      </text>
    </svg>
  );
}
