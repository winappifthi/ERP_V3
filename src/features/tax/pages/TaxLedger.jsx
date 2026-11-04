import { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import GstPeriodFilter from '../components/GstPeriodFilter';
import { selectTaxLedger } from '../taxSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function TaxLedger() {
  const company = useSelector(selectCurrentCompany);
  const [period, setPeriod] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectTaxLedger(period.fromDate, period.toDate));

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'accountCode', label: 'Account', render: (r) => <div><div className="text-xs">{r.account?.name}</div><div className="text-[10px] font-mono text-gray-500">{r.accountCode}</div></div> },
    { key: 'narration', label: 'Narration', render: (r) => <span className="text-xs">{r.narration}</span> },
    { key: 'referenceId', label: 'Ref', render: (r) => r.referenceId ? <span className="font-mono text-xs">{r.referenceId}</span> : '—' },
    { key: 'debitPaise', label: 'Debit', align: 'right', render: (r) => r.debitPaise ? formatINR(r.debitPaise) : '—' },
    { key: 'creditPaise', label: 'Credit', align: 'right', render: (r) => r.creditPaise ? formatINR(r.creditPaise) : '—' },
  ];

  const totals = rows.reduce((acc, r) => ({ debit: acc.debit + r.debitPaise, credit: acc.credit + r.creditPaise }), { debit: 0, credit: 0 });

  return (
    <div>
      <PageHeader title="GST Ledger" description={`Tax account postings · ${company?.displayName || ''}`} />
      <GstPeriodFilter fromDate={period.fromDate} toDate={period.toDate} onChange={setPeriod} />
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Entries" value={rows.length} />
        <Stat label="Total Debits" value={formatINR(totals.debit)} />
        <Stat label="Total Credits" value={formatINR(totals.credit)} />
      </div>
      <DataTable columns={columns} rows={rows} pageSize={25} emptyMessage="No GST postings in this range." />
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