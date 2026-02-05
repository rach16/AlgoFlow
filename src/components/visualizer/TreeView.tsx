interface TreeNode {
  val: number | string | null;
  id: number;
}

interface TreeViewProps {
  nodes: TreeNode[];
  highlights?: number[];
  secondary?: number[];
  pointers?: Record<string, number>;
  title?: string;
}

export function TreeView({ nodes, highlights = [], secondary = [], pointers = {}, title = 'Binary Tree' }: TreeViewProps) {
  if (nodes.length === 0) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm italic">Empty tree</p>
      </div>
    );
  }

  const depth = Math.floor(Math.log2(nodes.length)) + 1;
  const levels: TreeNode[][] = [];
  let idx = 0;
  for (let d = 0; d < depth && idx < nodes.length; d++) {
    const count = Math.pow(2, d);
    levels.push(nodes.slice(idx, idx + count));
    idx += count;
  }

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 overflow-x-auto">
      <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>
      <div className="flex flex-col items-center gap-2 min-w-fit">
        {levels.map((level, levelIdx) => {
          const nodeOffset = Math.pow(2, levelIdx) - 1;
          return (
            <div key={levelIdx} className="flex justify-center w-full" style={{ gap: `${Math.pow(2, depth - levelIdx - 1) * 8}px` }}>
              {level.map((node, nodeIdx) => {
                const globalIdx = nodeOffset + nodeIdx;
                const isHighlighted = highlights.includes(globalIdx);
                const isSecondary = secondary.includes(globalIdx);
                const pointersAtNode = Object.entries(pointers)
                  .filter(([, i]) => i === globalIdx)
                  .map(([name]) => name);

                if (node.val === null) {
                  return <div key={node.id} className="w-10 h-10" />;
                }

                return (
                  <div key={node.id} className="flex flex-col items-center">
                    {pointersAtNode.length > 0 && (
                      <div className="flex gap-1 mb-1">
                        {pointersAtNode.map((name) => (
                          <span key={name} className="text-xs font-bold text-blue-400">{name}</span>
                        ))}
                      </div>
                    )}
                    <div
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-full font-mono text-sm
                        transition-all duration-300 border-2
                        ${isHighlighted ? 'bg-indigo-500 border-indigo-400 scale-110' : ''}
                        ${isSecondary && !isHighlighted ? 'bg-green-500 border-green-400' : ''}
                        ${!isHighlighted && !isSecondary ? 'bg-slate-800 border-slate-600' : ''}
                      `}
                    >
                      {node.val}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
