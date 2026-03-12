import type { ActionType } from '../../types/algorithm';

interface StepDescriptionProps {
  message: string;
  action?: ActionType;
}

const actionColors: Record<string, string> = {
  compare: 'text-yellow-300 border-yellow-500',
  swap: 'text-pink-400 border-pink-500',
  insert: 'text-green-400 border-green-500',
  delete: 'text-red-400 border-red-500',
  found: 'text-green-300 border-green-400',
  visit: 'text-blue-300 border-blue-500',
  push: 'text-cyan-300 border-cyan-500',
  pop: 'text-orange-400 border-orange-500',
};

export default function StepDescription({ message, action }: StepDescriptionProps) {
  return (
    <div className="flex items-start gap-3 font-mono text-sm">
      {action && (
        <span className={`shrink-0 px-2 py-0.5 rounded border text-xs uppercase ${actionColors[action] ?? 'text-gray-400 border-gray-600'}`}>
          {action}
        </span>
      )}
      <p className="text-gray-300 leading-relaxed">{message}</p>
    </div>
  );
}
