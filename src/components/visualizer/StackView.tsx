interface StackViewProps {
  stack: (string | number)[];
  title?: string;
}

export function StackView({ stack, title = 'Stack' }: StackViewProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      <div className="flex flex-col-reverse items-center gap-1 min-h-[100px]">
        {stack.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Empty stack</p>
        ) : (
          stack.map((item, index) => (
            <div
              key={index}
              className={`
                w-full max-w-[80px] px-4 py-2 bg-indigo-600 rounded text-center font-mono
                ${index === stack.length - 1 ? 'animate-highlight' : ''}
              `}
            >
              {item}
            </div>
          ))
        )}
      </div>
      {stack.length > 0 && (
        <p className="text-xs text-slate-500 text-center mt-2">
          Top → {stack[stack.length - 1]}
        </p>
      )}
    </div>
  );
}
