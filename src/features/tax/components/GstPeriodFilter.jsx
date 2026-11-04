import { TextField, Button } from '@mui/material';

/** Simple from/to date range filter with quick "current month" preset. */
export default function GstPeriodFilter({ fromDate, toDate, onChange }) {
  const setCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const first = `${y}-${m}-01`;
    const last = new Date(y, now.getMonth() + 1, 0);
    const lastStr = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
    onChange({ fromDate: first, toDate: lastStr });
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
      <TextField
        label="From"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={fromDate}
        onChange={(e) => onChange({ fromDate: e.target.value, toDate })}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={toDate}
        onChange={(e) => onChange({ fromDate, toDate: e.target.value })}
      />
      <Button size="small" variant="outlined" onClick={setCurrentMonth}>Current Month</Button>
      <Button size="small" variant="text" onClick={() => onChange({ fromDate: '', toDate: '' })}>Clear</Button>
    </div>
  );
}