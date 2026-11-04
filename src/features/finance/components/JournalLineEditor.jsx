import { TextField, Autocomplete, Button, MenuItem, Select } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectLeafAccounts } from '../financeSelectors';
import { formatINR } from '../../../lib/currency';
import { toPaise } from '../../../lib/currency';

export default function JournalLineEditor({ lines, onChange }) {
  const accounts = useSelector(selectLeafAccounts);

  const update = (i, patch) => {
    const next = [...lines];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debitRupees) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.creditRupees) || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Account</th>
              <th className="text-left px-3 py-2">Narration</th>
              <th className="text-right px-3 py-2" style={{ width: '14%' }}>Debit (₹)</th>
              <th className="text-right px-3 py-2" style={{ width: '14%' }}>Credit (₹)</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-3 py-1.5">
                  <Select
                    size="small"
                    fullWidth
                    displayEmpty
                    value={l.accountCode || ''}
                    onChange={(e) => update(i, { accountCode: e.target.value })}
                  >
                    <MenuItem value="">Select account</MenuItem>
                    {accounts.map((a) => <MenuItem key={a.code} value={a.code}>{a.code} — {a.name}</MenuItem>)}
                  </Select>
                </td>
                <td className="px-3 py-1.5">
                  <TextField size="small" fullWidth value={l.narration || ''} onChange={(e) => update(i, { narration: e.target.value })} />
                </td>
                <td className="px-3 py-1.5">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, step: '0.01', style: { textAlign: 'right' } }}
                    value={l.debitRupees || ''}
                    onChange={(e) => update(i, { debitRupees: Number(e.target.value) || 0, creditRupees: 0 })}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, step: '0.01', style: { textAlign: 'right' } }}
                    value={l.creditRupees || ''}
                    onChange={(e) => update(i, { creditRupees: Number(e.target.value) || 0, debitRupees: 0 })}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Button size="small" onClick={() => onChange(lines.filter((_, j) => j !== i))}><Delete fontSize="small" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 flex justify-between items-center p-2">
        <Button size="small" startIcon={<Add />} onClick={() => onChange([...lines, { accountCode: '', debitRupees: 0, creditRupees: 0, narration: '' }])}>Add Line</Button>
        <div className="text-sm">
          <span className="mr-3">Dr <span className="font-semibold tabular-nums">{formatINR(toPaise(totalDebit))}</span></span>
          <span className="mr-3">Cr <span className="font-semibold tabular-nums">{formatINR(toPaise(totalCredit))}</span></span>
          <span className={`font-semibold ${totalDebit === totalCredit && totalDebit > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {totalDebit === totalCredit ? '✓ Balanced' : `Diff ${formatINR(toPaise(Math.abs(totalDebit - totalCredit)))}`}
          </span>
        </div>
      </div>
    </div>
  );
}