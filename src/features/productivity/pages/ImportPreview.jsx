import { useState } from 'react';
import { Button, MenuItem, Select, FormControl, InputLabel, TextField, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';

const SAMPLE_CSV = `name,sku,sellingPrice,purchasePrice,taxRatePercent,hsn
Sample Widget A,SAMP-001,1250,950,18,8479
Sample Widget B,SAMP-002,780,540,12,8479
Sample Widget C,SAMP-003,3200,2400,18,8481`;

const TARGETS = [
  { value: 'products', label: 'Products', required: ['name', 'sku', 'sellingPrice'], numeric: ['sellingPrice', 'purchasePrice', 'taxRatePercent'] },
  { value: 'customers', label: 'Customers', required: ['code', 'name'], numeric: [] },
];

/** Very small CSV parser supporting quoted fields. */
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };

  const split = (line) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        out.push(cur); cur = '';
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out;
  };

  const headers = split(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cols = split(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });
    return obj;
  });
  return { headers, rows };
};

export default function ImportPreview() {
  const [target, setTarget] = useState('products');
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [snack, setSnack] = useState(null);

  const { headers, rows } = parseCSV(csvText);
  const targetDef = TARGETS.find((t) => t.value === target);

  // Validation: which columns are present and which required ones are missing
  const missingCols = targetDef.required.filter((c) => !headers.includes(c));
  const validRows = missingCols.length === 0 ? rows : [];
  const invalidRows = [];

  // Per-row checks (simple)
  if (missingCols.length === 0) {
    for (const [i, r] of rows.entries()) {
      const errors = [];
      for (const c of targetDef.required) if (!r[c]) errors.push(`Missing ${c}`);
      for (const n of targetDef.numeric) {
        if (r[n] !== undefined && r[n] !== '' && isNaN(Number(r[n]))) errors.push(`${n} must be a number`);
      }
      if (errors.length) invalidRows.push({ rowIndex: i, row: r, errors });
      else validRows.push(r);
    }
  }

  const handlePreview = () => {
    setSnack({ severity: 'info', message: `Parsed ${rows.length} rows · ${validRows.length} valid · ${invalidRows.length} invalid` });
  };

  return (
    <div>
      <PageHeader
        title="Import Preview"
        description="Paste CSV to validate — nothing is saved (frontend-only preview)"
      />

      <div className="bg-white border border-gray-200 rounded p-3 mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <FormControl size="small">
          <InputLabel>Import Type</InputLabel>
          <Select label="Import Type" value={target} onChange={(e) => setTarget(e.target.value)}>
            {TARGETS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </Select>
        </FormControl>
        <div className="md:col-span-2 flex items-end gap-2">
          <Button variant="outlined" onClick={handlePreview} disabled={rows.length === 0}>Re-parse</Button>
          <Button variant="text" onClick={() => setCsvText(SAMPLE_CSV)}>Reset to sample</Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded p-3 mb-3">
        <label className="text-xs font-medium text-gray-600 block mb-1">CSV Content</label>
        <TextField
          multiline
          minRows={8}
          fullWidth
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
        />
      </div>

      {missingCols.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm text-red-800">
          <strong>Missing required columns:</strong> {missingCols.join(', ')}
        </div>
      )}

      {rows.length > 0 && missingCols.length === 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Rows Parsed" value={rows.length} />
            <Stat label="Valid" value={validRows.length} highlight />
            <Stat label="Invalid" value={invalidRows.length} danger={invalidRows.length > 0} />
          </div>

          <div className="bg-white border border-gray-200 rounded overflow-hidden mb-3">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between">
              <h3 className="text-sm font-semibold">Preview ({Math.min(20, rows.length)} of {rows.length})</h3>
              <span className="text-xs text-gray-500">Columns: {headers.join(', ')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2">#</th>
                    {headers.map((h) => <th key={h} className="text-left px-3 py-2">{h}</th>)}
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r, i) => {
                    const invalid = invalidRows.find((ir) => ir.rowIndex === i);
                    return (
                      <tr key={i} className={`border-t border-gray-100 ${invalid ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-1.5 text-xs text-gray-500">{i + 1}</td>
                        {headers.map((h) => <td key={h} className="px-3 py-1.5 text-xs">{r[h]}</td>)}
                        <td className="px-3 py-1.5 text-xs">
                          {invalid ? <span className="text-red-700">{invalid.errors.join('; ')}</span> : <span className="text-green-700">Valid</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
            <strong>Preview only.</strong> Import is intentionally disabled in this frontend prototype.
            In Phase 20, this screen would POST to a backend import endpoint. The parsing and validation logic shown here is the same shape that backend would receive.
          </div>
        </>
      )}

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}

function Stat({ label, value, highlight, danger }) {
  return (
    <div className={`bg-white border rounded p-2.5 ${highlight ? 'border-blue-300 bg-blue-50' : ''} ${danger ? 'border-red-300 bg-red-50' : ''}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold text-sm tabular-nums ${highlight ? 'text-blue-700' : ''} ${danger ? 'text-red-700' : ''}`}>{value}</div>
    </div>
  );
}