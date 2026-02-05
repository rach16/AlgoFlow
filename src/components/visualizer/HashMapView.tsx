interface HashMapViewProps {
  hashMap: Record<string | number, number | string>;
  title?: string;
}

export function HashMapView({ hashMap, title = 'HashMap' }: HashMapViewProps) {
  const entries = Object.entries(hashMap);

  if (entries.length === 0) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm italic">Empty</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center bg-slate-800 rounded-md overflow-hidden text-sm"
          >
            <span className="px-2 py-1 bg-indigo-600 text-white font-mono">
              {key}
            </span>
            <span className="px-2 py-1 text-slate-300 font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
