export function TrieDiagram() {
  return (
    <svg viewBox="0 0 240 150" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {/* Root */}
      <circle cx="120" cy="20" r="12" fill="#334155" stroke="#6366f1" strokeWidth="1.5" />
      <text x="120" y="24" textAnchor="middle" fill="#a5b4fc" fontSize="8" fontFamily="monospace">
        root
      </text>

      {/* Root → 'a' edge */}
      <line x1="111" y1="30" x2="60" y2="52" stroke="#6366f1" strokeWidth="1.5" />
      <text x="80" y="38" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">a</text>
      <circle cx="50" cy="60" r="12" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="50" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">a</text>

      {/* Root → 't' edge */}
      <line x1="129" y1="30" x2="180" y2="52" stroke="#475569" strokeWidth="1.5" />
      <text x="160" y="38" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">t</text>
      <circle cx="190" cy="60" r="12" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="190" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">t</text>

      {/* 'a' → 'p' */}
      <line x1="42" y1="70" x2="30" y2="90" stroke="#475569" strokeWidth="1" />
      <text x="30" y="82" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">p</text>
      <circle cx="24" cy="100" r="12" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="24" y="104" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">p</text>

      {/* 'a' → 'n' */}
      <line x1="58" y1="70" x2="76" y2="90" stroke="#475569" strokeWidth="1" />
      <text x="72" y="82" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">n</text>
      <circle cx="82" cy="100" r="12" fill="#334155" stroke="#475569" strokeWidth="1" />
      <text x="82" y="104" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">n</text>

      {/* 'p' → 'p' (apple) */}
      <line x1="18" y1="110" x2="14" y2="126" stroke="#475569" strokeWidth="1" />
      <text x="9" y="122" fill="#22c55e" fontSize="8" fontFamily="monospace">p</text>
      <circle cx="14" cy="136" r="10" fill="#4f46e5" fillOpacity="0.3" stroke="#6366f1" strokeWidth="1" />
      <text x="14" y="140" textAnchor="middle" fill="#a5b4fc" fontSize="7" fontFamily="monospace">*</text>

      {/* 't' → 'o' */}
      <line x1="190" y1="72" x2="190" y2="90" stroke="#475569" strokeWidth="1" />
      <text x="196" y="84" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">o</text>
      <circle cx="190" cy="100" r="12" fill="#4f46e5" fillOpacity="0.3" stroke="#6366f1" strokeWidth="1" />
      <text x="190" y="104" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace">*</text>

      {/* End-of-word indicators */}
      <text x="14" y="150" textAnchor="middle" fill="#6366f1" fontSize="6">app...</text>
      <text x="190" y="120" textAnchor="middle" fill="#6366f1" fontSize="7">"to"</text>

      <text x="120" y="148" textAnchor="middle" fill="#64748b" fontSize="7">
        * = end of word | edges = characters
      </text>
    </svg>
  );
}
