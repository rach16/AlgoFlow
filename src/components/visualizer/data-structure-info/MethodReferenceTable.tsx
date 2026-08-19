import { useVisualizerStore } from '../../../store/visualizerStore';
import type { DSMethod } from './data/dataStructureDefinitions';

interface MethodReferenceTableProps {
  methods: DSMethod[];
  /** Override the language instead of following the code panel (used by the Methods tab). */
  language?: 'python' | 'javascript' | 'java';
}

const LANGUAGE_LABEL: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
};

export function MethodReferenceTable({ methods, language }: MethodReferenceTableProps) {
  const storeLanguage = useVisualizerStore((s) => s.language);
  const lang = language ?? storeLanguage;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-1.5 pr-3 text-slate-400 font-medium whitespace-nowrap">
              {LANGUAGE_LABEL[lang]}
            </th>
            <th className="text-left py-1.5 pr-3 text-slate-400 font-medium">Does what</th>
            <th className="text-right py-1.5 text-slate-400 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {methods.map((m) => {
            const call = m[lang];
            // '-' marks an operation with no direct equivalent in this language.
            const unavailable = call.trim().startsWith('-');
            return (
              <tr key={m.description} className="border-b border-slate-700/50 align-top">
                <td
                  className={`py-1.5 pr-3 font-mono whitespace-pre-wrap ${
                    unavailable ? 'text-slate-500 italic' : 'text-indigo-400'
                  }`}
                >
                  {call}
                </td>
                <td className="py-1.5 pr-3 text-slate-300">{m.description}</td>
                <td className="py-1.5 text-right font-mono text-green-400 whitespace-nowrap">
                  {m.timeComplexity}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
