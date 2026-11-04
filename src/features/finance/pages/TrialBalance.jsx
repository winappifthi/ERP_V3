import { useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectTrialBalance } from '../financeSelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function TrialBalance() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const tb = useSelector(selectTrialBalance(fromDate, toDate));
  const balanced = tb.totalDebit === tb.totalCredit;

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.account.code}</span> },
    { key: 'name', label: 'Account', render: (r) => r.account.name },
    { key: 'opening', label: 'Opening (Dr)', align: 'right', render: (r) => r.openingDebitPaise ? formatINR(r.openingDebitPaise) : r.openingCreditPaise ? `(${formatINR(r.openingCreditPaise)})` : '—' },
    { key: 'debit', label: 'Debit', align: 'right', render: (r) => r.debitPaise ? formatINR(r.debitPaise) : '—' },
    { key: 'credit', label: 'Credit', align: 'right', render: (r) => r.creditPaise ? formatINR(r.creditPaise) : '—' },
    { key: 'closing', label: 'Closing (Dr)', align: 'right', render: (r) => r.closingDebitPaise ? <span className="font-medium">{formatINR(r.closingDebitPaise)}</span> : r.closingCreditPaise ? <span className="font-medium">({formatINR(r.closingCreditPaise)})</span> : '—' },
  ];

  return (
    <div>
      <PageHeader title="Trial Balance" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Button size="small" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Opening Dr" value={formatINR(tb.totalOpeningDebit)} />
        <Stat label="Total Dr" value={formatINR(tb.totalDebit)} />
        <Stat label="Total Cr" value={formatINR(tb.totalCredit)} />
      </div>
      <div className={`mb-3 px-3 py-2 rounded text-sm ${balanced ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
        {balanced ? '✓ Trial Balance is balanced' : '⚠ Unbalanced trial balance — check postings'}
      </div>
      <DataTable columns={columns} rows={tb.rows} pageSize={30} emptyMessage="No postings in this range." />
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