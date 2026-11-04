export default function SummaryGrid({ items }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${Math.min(items.length, 4)} gap-2 mb-3`} style={{ gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))` }}>
      {items.map((it, i) => (
        <div key={i} className={`bg-white border border-gray-200 rounded p-2.5 ${it.highlight ? 'border-blue-300 bg-blue-50' : ''}`}>
          <div className="text-xs text-gray-500">{it.label}</div>
          <div className={`font-semibold text-sm tabular-nums ${it.highlight ? 'text-blue-700' : ''}`}>{it.value}</div>
          {it.hint && <div className="text-[10px] text-gray-500 mt-0.5">{it.hint}</div>}
        </div>
      ))}
    </div>
  );
}