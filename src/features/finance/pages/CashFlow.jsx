import { useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectCashFlow } from '../financeSelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function CashFlow() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const cf = useSelector(selectCashFlow(fromDate, toDate));

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'account', label: 'Account', render: (r) => r.account?.name },
    { key: 'narration', label: 'Narration' },
    { key: 'ref', label: 'Ref', render: (r) => r.referenceId ? <span className="font-mono text-xs">{r.referenceId}</span> : '—' },
    { key: 'net', label: 'Amount', align: 'right', render: (r) => <span className={`tabular-nums font-medium ${r.netPaise > 0 ? 'text-green-700' : 'text-red-600'}`}>{r.netPaise > 0 ? '+' : ''}{formatINR(r.netPaise)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Cash Flow" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Button size="small" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Cash Inflow" value={formatINR(cf.inflow)} />
        <Stat label="Cash Outflow" value={formatINR(cf.outflow)} />
        <Stat label={cf.netChange >= 0 ? 'Net Increase' : 'Net Decrease'} value={formatINR(Math.abs(cf.netChange))} highlight={cf.netChange < 0} />
      </div>
      <DataTable columns={columns} rows={cf.rows} pageSize={25} emptyMessage="No cash movements in range." />
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold text-sm tabular-nums ${highlight ? 'text-red-700' : ''}`}>{value}</div>
    </div>
  );
}