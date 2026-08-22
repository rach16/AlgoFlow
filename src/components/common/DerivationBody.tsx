import type { ComplexityNote } from '../../data/complexityTypes';

/** One approach's complexity derivation: the numbered steps that build to the stated bound,
 *  plus the mistake people make on that specific problem. Shared by the Complexity tab and
 *  the visualizer's inline "Why?" panel. */
export function DerivationBody({ note }: { note: ComplexityNote }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Time</p>
        <ol className="space-y-1">
          {note.time.map((step, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-slate-600 font-mono text-xs pt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Space</p>
        <ol className="space-y-1">
          {note.space.map((step, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-slate-600 font-mono text-xs pt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      {note.gotcha && (
        <div className="md:col-span-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            What people get wrong
          </p>
          <p className="text-sm text-amber-100/90">{note.gotcha}</p>
        </div>
      )}
    </div>
  );
}
