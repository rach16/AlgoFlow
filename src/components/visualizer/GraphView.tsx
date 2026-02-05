interface GraphNode {
  id: number | string;
  label: string;
}

interface GraphEdge {
  from: number | string;
  to: number | string;
  weight?: number;
}

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlights?: (number | string)[];
  secondary?: (number | string)[];
  visitedEdges?: [number | string, number | string][];
  directed?: boolean;
  title?: string;
}

export function GraphView({
  nodes,
  edges,
  highlights = [],
  secondary = [],
  visitedEdges = [],
  directed = false,
  title = 'Graph',
}: GraphViewProps) {
  const width = 400;
  const height = 300;
  const radius = Math.min(width, height) * 0.35;
  const centerX = width / 2;
  const centerY = height / 2;
  const nodeRadius = 20;

  const positions = nodes.map((_, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const nodeIndexMap = new Map(nodes.map((n, i) => [n.id, i]));

  const isEdgeVisited = (from: number | string, to: number | string) =>
    visitedEdges.some(([f, t]) => (f === from && t === to) || (!directed && f === to && t === from));

  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto">
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromIdx = nodeIndexMap.get(edge.from);
          const toIdx = nodeIndexMap.get(edge.to);
          if (fromIdx === undefined || toIdx === undefined) return null;
          const from = positions[fromIdx];
          const to = positions[toIdx];
          const visited = isEdgeVisited(edge.from, edge.to);

          return (
            <g key={i}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={visited ? '#6366f1' : '#475569'}
                strokeWidth={visited ? 2.5 : 1.5}
                className="transition-all duration-300"
              />
              {edge.weight !== undefined && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 8}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = positions[i];
          const isHighlighted = highlights.includes(node.id);
          const isSecondaryNode = secondary.includes(node.id);

          return (
            <g key={node.id} className="transition-all duration-300">
              <circle
                cx={pos.x} cy={pos.y} r={nodeRadius}
                fill={isHighlighted ? '#6366f1' : isSecondaryNode ? '#22c55e' : '#1e293b'}
                stroke={isHighlighted ? '#818cf8' : isSecondaryNode ? '#4ade80' : '#475569'}
                strokeWidth="2"
              />
              <text
                x={pos.x} y={pos.y + 4}
                fill="white"
                fontSize="12"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
