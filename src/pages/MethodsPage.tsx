import { useState } from 'react';
import { dataStructureDefinitions } from '../components/visualizer/data-structure-info/data/dataStructureDefinitions';
import { MethodReferenceTable } from '../components/visualizer/data-structure-info/MethodReferenceTable';
import { DataStructureDiagram } from '../components/visualizer/data-structure-info/DataStructureDiagram';

type Lang = 'python' | 'javascript' | 'java';

const LANGS: { id: Lang; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
];

/** Most-reached-for first, rather than alphabetical. */
const ORDER = [
  'string', 'char', 'hashmap', 'hashset', 'array',
  'stack', 'queue', 'heap',
  'linkedlist', 'binarytree', 'graph', 'trie',
];

export function MethodsPage() {
  const [lang, setLang] = useState<Lang>('python');
  const [open, setOpen] = useState<string[]>(['string']);

  const toggle = (type: string) =>
    setOpen((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));

  const defs = ORDER.map((t) => dataStructureDefinitions[t]).filter(Boolean);
  const totalMethods = defs.reduce((n, d) => n + d.methods.length, 0);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-1">Method reference</h2>
          <p className="text-sm text-slate-400 mb-4">
            {totalMethods} operations across {defs.length} structures, in the language you are
            actually writing. Pick a language and the whole page switches.
          </p>

          <div className="flex bg-slate-700 rounded-lg p-1 w-fit">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  lang === l.id ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {defs.map((d) => (
              <button
                key={d.type}
                onClick={() => {
                  if (!open.includes(d.type)) toggle(d.type);
                  document.getElementById(`ds-${d.type}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-2.5 py-1 rounded-md text-xs bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {defs.map((def) => {
          const isOpen = open.includes(def.type);
          return (
            <div key={def.type} id={`ds-${def.type}`} className="bg-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(def.type)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-700/40 transition-colors"
              >
                <span className="text-lg font-bold flex-1">{def.name}</span>
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {def.methods.length} operations
                </span>
                <svg
                  className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4">
                  <p className="text-sm text-slate-300">{def.description}</p>
                  <ul className="text-sm text-slate-400 space-y-1">
                    {def.keyProperties.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <DataStructureDiagram type={def.type} />
                  <MethodReferenceTable methods={def.methods} language={lang} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
