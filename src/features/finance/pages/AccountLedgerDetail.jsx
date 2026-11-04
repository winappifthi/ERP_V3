import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectAccountLedger } from '../financeSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function AccountLedgerDetail() {
  const { accountCode } = useParams();
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const ledger = useSelector(selectAccountLedger(accountCode, fromDate, toDate));

  if (!ledger) return <div><PageHeader title="Account not found" /><Button onClick={() => navigate('/app/finance/coa')} variant="outlined">Back</Button></div>;

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'narration', label: 'Narration', render: (r) => <div><div>{r.narration}</div>{r.referenceId && <div className="text-xs text-gray-500 font-mono">{r.referenceId}</div>}</div> },
    { key: 'debitPaise', label: 'Debit', align: 'right', render: (r) => r.debitPaise ? formatINR(r.debitPaise) : '—' },
    { key: 'creditPaise', label: 'Credit', align: 'right', render: (r) => r.creditPaise ? formatINR(r.creditPaise) : '—' },
    { key: 'runningBalancePaise', label: 'Balance', align: 'right', render: (r) => <span className={`tabular-nums ${r.runningBalancePaise < 0 ? 'text-red-600' : ''}`}>{formatINR(r.runningBalancePaise)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title={`${ledger.account.code} — ${ledger.account.name}`}
        description={`Type: ${ledger.account.accountType} · Normal: ${ledger.account.normalBalance}`}
        actions={<Button variant="outlined" onClick={() => navigate('/app/finance/coa')}>Back</Button>}
      />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Button size="small" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
        <div className="ml-auto text-sm">
          Opening: <span className="font-semibold tabular-nums">{formatINR(ledger.openingBalancePaise)}</span>
          <span className="mx-3">|</span>
          Closing: <span className="font-semibold tabular-nums">{formatINR(ledger.closingBalancePaise)}</span>
        </div>
      </div>
      <DataTable columns={columns} rows={ledger.rows} pageSize={25} emptyMessage="No postings." />
    </div>
  );
}