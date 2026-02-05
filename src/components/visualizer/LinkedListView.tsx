interface ListNode {
  val: number | string;
  id: number;
}

interface LinkedListViewProps {
  nodes: ListNode[];
  highlights?: number[];
  secondary?: number[];
  pointers?: Record<string, number>;
  title?: string;
}

const POINTER_COLORS: Record<string, string> = {
  curr: 'text-blue-400',
  prev: 'text-yellow-400',
  next: 'text-green-400',
  slow: 'text-purple-400',
  fast: 'text-pink-400',
  head: 'text-cyan-400',
  tail: 'text-orange-400',
  l1: 'text-blue-400',
  l2: 'text-green-400',
};

export function LinkedListView({ nodes, highlights = [], secondary = [], pointers = {}, title = 'Linked List' }: LinkedListViewProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {nodes.map((node, index) => {
          const isHighlighted = highlights.includes(index);
          const isSecondary = secondary.includes(index);
          const pointersAtIndex = Object.entries(pointers)
            .filter(([, idx]) => idx === index)
            .map(([name]) => name);

          return (
            <div key={node.id} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Pointer labels */}
                <div className="h-5 flex gap-1 mb-1">
                  {pointersAtIndex.map((name) => (
                    <span key={name} className={`text-xs font-bold ${POINTER_COLORS[name] || 'text-white'}`}>
                      {name}
                    </span>
                  ))}
                </div>
                {/* Node */}
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-lg font-mono text-lg
                    transition-all duration-300 border-2
                    ${isHighlighted ? 'bg-indigo-500 border-indigo-400 scale-110' : ''}
                    ${isSecondary && !isHighlighted ? 'bg-green-500 border-green-400' : ''}
                    ${!isHighlighted && !isSecondary ? 'bg-slate-800 border-slate-600' : ''}
                  `}
                >
                  {node.val}
                </div>
              </div>
              {/* Arrow */}
              {index < nodes.length - 1 && (
                <svg className="w-6 h-6 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {index === nodes.length - 1 && (
                <span className="text-slate-500 text-xs ml-2">null</span>
              )}
            </div>
          );
        })}
        {nodes.length === 0 && (
          <p className="text-slate-500 text-sm italic">Empty list</p>
        )}
      </div>
    </div>
  );
}
