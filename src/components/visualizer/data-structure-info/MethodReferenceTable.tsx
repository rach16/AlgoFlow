import type { DSMethod } from './data/dataStructureDefinitions';

interface MethodReferenceTableProps {
  methods: DSMethod[];
}

export function MethodReferenceTable({ methods }: MethodReferenceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-1.5 pr-3 text-slate-400 font-medium">Method</th>
            <th className="text-left py-1.5 pr-3 text-slate-400 font-medium">Description</th>
            <th className="text-right py-1.5 text-slate-400 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {methods.map((m) => (
            <tr key={m.name} className="border-b border-slate-700/50">
              <td className="py-1.5 pr-3 font-mono text-indigo-400 whitespace-nowrap">{m.name}</td>
              <td className="py-1.5 pr-3 text-slate-300">{m.description}</td>
              <td className="py-1.5 text-right font-mono text-green-400 whitespace-nowrap">{m.timeComplexity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
