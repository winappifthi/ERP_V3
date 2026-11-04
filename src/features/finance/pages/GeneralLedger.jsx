import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { selectPostingsInRange, selectLeafAccounts } from '../financeSelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function GeneralLedger() {
  const navigate = useNavigate();
  const accounts = useSelector(selectLeafAccounts);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [accountCode, setAccountCode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const postings = useSelector(selectPostingsInRange(fromDate, toDate));
  const filtered = accountCode ? postings.filter((p) => p.accountCode === accountCode) : postings;

  const totals = filtered.reduce(
    (acc, p) => ({ debit: acc.debit + p.debitPaise, credit: acc.credit + p.creditPaise }),
    { debit: 0, credit: 0 }
  );

  return (
    <div>
      <PageHeader
        title="General Ledger"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>Account</InputLabel>
          <Select label="Account" value={accountCode} onChange={(e) => setAccountCode(e.target.value)}>
            <MenuItem value="">All accounts</MenuItem>
            {accounts.map((a) => <MenuItem key={a.code} value={a.code}>{a.code} — {a.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Entries" value={filtered.length} />
        <Stat label="Total Debit" value={formatINR(totals.debit)} />
        <Stat label="Total Credit" value={formatINR(totals.credit)} />
      </div>
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Account</th>
              <th className="text-left px-3 py-2">Narration</th>
              <th className="text-right px-3 py-2">Debit</th>
              <th className="text-right px-3 py-2">Credit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-3 py-2 text-xs">{formatDate(p.date)}</td>
                <td className="px-3 py-2 text-xs">{p.accountCode}</td>
                <td className="px-3 py-2 text-xs">{p.narration}</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{p.debitPaise ? formatINR(p.debitPaise) : '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{p.creditPaise ? formatINR(p.creditPaise) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 200 && <div className="p-3 text-xs text-center text-gray-500 border-t border-gray-200">Showing 200 of {filtered.length}</div>}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-sm tabular-nums">{value}</div>
    </div>
  );
}