import type { InputItem } from '../../types/animation';

interface InputVisualizationProps {
  items: InputItem[];
  label: string;
}

const statusStyles: Record<InputItem['status'], string> = {
  default: 'border-[#2a2a2a] bg-[#1a1a1a] text-gray-400',
  active: 'border-green-400 bg-green-400/10 text-green-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]',
  done: 'border-gray-700 bg-gray-800/30 text-gray-600',
  found: 'border-green-400 bg-green-400/20 text-green-300 anim-pulse-glow',
};

export default function InputVisualization({ items, label }: InputVisualizationProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-2">{label}</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-md border font-mono text-sm transition-all duration-300 ${statusStyles[item.status]}`}
            >
              {typeof item.value === 'string' && item.value.length > 3
                ? item.value.slice(0, 3)
                : item.value}
            </div>
            {item.label && (
              <span className="text-[9px] font-mono text-gray-600">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
