import { TextField, Button } from '@mui/material';

const PRESETS = [
  { label: 'This Month', get: () => { const n = new Date(); return { from: `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-01`, to: new Date(n.getFullYear(), n.getMonth() + 1, 0).toISOString().slice(0, 10) }; } },
  { label: 'Last 30 days', get: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 30); return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }; } },
  { label: 'This Quarter', get: () => { const n = new Date(); const q = Math.floor(n.getMonth() / 3); const start = new Date(n.getFullYear(), q * 3, 1); const end = new Date(n.getFullYear(), q * 3 + 3, 0); return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }; } },
  { label: 'This Year', get: () => { const y = new Date().getFullYear(); return { from: `${y}-01-01`, to: `${y}-12-31` }; } },
  { label: 'All', get: () => ({ from: '', to: '' }) },
];

export default function DateRangeFilter({ fromDate, toDate, onChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
      <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => onChange({ fromDate: e.target.value, toDate })} />
      <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => onChange({ fromDate, toDate: e.target.value })} />
      <div className="flex flex-wrap gap-1 ml-2">
        {PRESETS.map((p) => (
          <Button key={p.label} size="small" variant="text" onClick={() => { const { from, to } = p.get(); onChange({ fromDate: from, toDate: to }); }}>
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}