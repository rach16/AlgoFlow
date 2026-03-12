import type { DSState } from '../../types/animation';

interface DSVisualizationProps {
  dsState: DSState | null;
  label: string;
}

function renderHashMap(data: unknown, updated: boolean) {
  const map = data as Record<string, unknown>;
  const entries = Object.entries(map);
  if (entries.length === 0) {
    return <span className="text-gray-600 text-xs font-mono">{'{ }'}</span>;
  }
  return (
    <div className={`flex flex-wrap gap-1.5 transition-all duration-300 ${updated ? 'anim-flash' : ''}`}>
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-0 rounded border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <span className="px-2 py-1 text-xs font-mono text-yellow-300 bg-yellow-400/5 border-r border-[#2a2a2a]">{k}</span>
          <span className="px-2 py-1 text-xs font-mono text-green-300">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function renderStack(data: unknown, updated: boolean) {
  const stack = data as (string | number)[];
  if (stack.length === 0) {
    return <span className="text-gray-600 text-xs font-mono">[ empty ]</span>;
  }
  return (
    <div className={`flex flex-col-reverse gap-1 items-center ${updated ? 'anim-flash' : ''}`}>
      {stack.map((item, i) => (
        <div key={i} className="w-16 px-2 py-1 text-center text-xs font-mono text-cyan-300 border border-cyan-500/30 bg-cyan-400/5 rounded">
          {String(item)}
        </div>
      ))}
      <span className="text-[9px] font-mono text-gray-600 mt-1">top</span>
    </div>
  );
}

function renderArray(data: unknown, updated: boolean) {
  const arr = data as (string | number)[];
  return (
    <div className={`flex flex-wrap gap-1 ${updated ? 'anim-flash' : ''}`}>
      {arr.map((item, i) => (
        <div key={i} className="px-2 py-1 text-xs font-mono text-blue-300 border border-blue-500/30 bg-blue-400/5 rounded">
          {String(item)}
        </div>
      ))}
    </div>
  );
}

function renderSet(data: unknown, updated: boolean) {
  const set = data as (string | number)[];
  if (set.length === 0) {
    return <span className="text-gray-600 text-xs font-mono">{'{ }'}</span>;
  }
  return (
    <div className={`flex flex-wrap gap-1.5 ${updated ? 'anim-flash' : ''}`}>
      {set.map((item, i) => (
        <div key={i} className="px-2 py-1 text-xs font-mono text-pink-300 border border-pink-500/30 bg-pink-400/5 rounded-full">
          {String(item)}
        </div>
      ))}
    </div>
  );
}

function renderMatrix(data: unknown, updated: boolean) {
  const matrix = data as (string | number)[][];
  return (
    <div className={`inline-flex flex-col gap-0.5 ${updated ? 'anim-flash' : ''}`}>
      {matrix.map((row, i) => (
        <div key={i} className="flex gap-0.5">
          {row.map((cell, j) => (
            <div key={j} className="w-8 h-8 flex items-center justify-center text-[10px] font-mono text-gray-300 border border-[#2a2a2a] bg-[#1a1a1a] rounded-sm">
              {String(cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function renderDP(data: unknown, updated: boolean) {
  const dp = data as (string | number)[];
  return (
    <div className={`flex flex-wrap gap-1 ${updated ? 'anim-flash' : ''}`}>
      {dp.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-8 flex items-center justify-center text-xs font-mono text-orange-300 border border-orange-500/30 bg-orange-400/5 rounded">
            {String(val)}
          </div>
          <span className="text-[8px] font-mono text-gray-600">{i}</span>
        </div>
      ))}
    </div>
  );
}

function renderGeneric(data: unknown, updated: boolean) {
  const str = typeof data === 'string' ? data : JSON.stringify(data, null, 1);
  return (
    <pre className={`text-xs font-mono text-gray-400 whitespace-pre-wrap max-h-32 overflow-auto ${updated ? 'anim-flash' : ''}`}>
      {str}
    </pre>
  );
}

const renderers: Record<string, (data: unknown, updated: boolean) => React.ReactNode> = {
  hashmap: renderHashMap,
  stack: renderStack,
  queue: renderArray,
  array: renderArray,
  set: renderSet,
  matrix: renderMatrix,
  dp: renderDP,
  heap: renderArray,
  intervals: renderGeneric,
  bits: renderGeneric,
  tree: renderGeneric,
  graph: renderGeneric,
  linkedlist: renderGeneric,
  trie: renderGeneric,
  custom: renderGeneric,
};

export default function DSVisualization({ dsState, label }: DSVisualizationProps) {
  if (!dsState) return null;

  const renderer = renderers[dsState.type] ?? renderGeneric;

  return (
    <div>
      <div className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-2">
        {dsState.label ?? label}
      </div>
      {renderer(dsState.data, !!dsState.updated)}
    </div>
  );
}
