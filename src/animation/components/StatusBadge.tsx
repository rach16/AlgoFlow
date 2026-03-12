interface StatusBadgeProps {
  label: string;
  phaseId: string;
}

export default function StatusBadge({ label, phaseId }: StatusBadgeProps) {
  const isInit = phaseId === 'init';
  const isResult = phaseId === 'result';

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-mono tracking-wider uppercase border transition-all duration-300 ${
        isResult
          ? 'border-green-400 text-green-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
          : isInit
          ? 'border-gray-500 text-gray-400'
          : 'border-yellow-400 text-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.2)]'
      }`}
    >
      {label}
    </span>
  );
}
