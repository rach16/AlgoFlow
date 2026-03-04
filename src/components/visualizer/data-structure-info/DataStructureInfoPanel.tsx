import { useState } from 'react';
import { dataStructureDefinitions } from './data/dataStructureDefinitions';
import { DataStructureDiagram } from './DataStructureDiagram';
import { MethodReferenceTable } from './MethodReferenceTable';

interface DataStructureInfoPanelProps {
  activeTypes: string[];
}

export function DataStructureInfoPanel({ activeTypes }: DataStructureInfoPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (activeTypes.length === 0) return null;

  const toggle = (type: string) =>
    setExpanded((prev) => ({ ...prev, [type]: !prev[type] }));

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
        Data Structure Reference
      </h4>
      {activeTypes.map((type) => {
        const def = dataStructureDefinitions[type];
        if (!def) return null;
        const isOpen = expanded[type] ?? false;
        return (
          <div key={type} className="bg-slate-700/30 rounded-lg border border-slate-700/50 overflow-hidden">
            <button
              onClick={() => toggle(type)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-200">{def.name}</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 space-y-3">
                <p className="text-xs text-slate-400">{def.description}</p>
                <ul className="text-xs text-slate-400 space-y-0.5">
                  {def.keyProperties.map((p, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-indigo-400 mt-0.5">&#x2022;</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <DataStructureDiagram type={type} />
                <MethodReferenceTable methods={def.methods} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
