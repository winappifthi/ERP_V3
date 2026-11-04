import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportShell from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import DataTable from '../../../components/data-display/DataTable';
import { selectVendorPerformance } from '../reportsSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function VendorPerformance() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectVendorPerformance(range.fromDate, range.toDate));

  const totalSpend = rows.reduce((s, r) => s + r.purchasePaise, 0);
  const totalOutstanding = rows.reduce((s, r) => s + (r.outstandingRupees || 0) * 100, 0);
  const avgReturnRate = rows.length ? Math.round(rows.reduce((s, r) => s + r.returnRate, 0) / rows.length) : 0;

  const columns = [
    { key: 'vendorName', label: 'Vendor' },
    { key: 'invoiceCount', label: 'Invoices', align: 'right' },
    { key: 'purchasePaise', label: 'Total Purchases', align: 'right', render: (r) => <span className="font-medium tabular-nums">{formatINR(r.purchasePaise)}</span> },
    { key: 'returnsPaise', label: 'Returns', align: 'right', render: (r) => r.returnsPaise > 0 ? <span className="tabular-nums text-amber-700">{formatINR(r.returnsPaise)}</span> : '—' },
    { key: 'returnRate', label: 'Return %', align: 'right', render: (r) => <span className={`tabular-nums ${r.returnRate > 10 ? 'text-red-600 font-medium' : ''}`}>{r.returnRate}%</span> },
    { key: 'outstandingRupees', label: 'Outstanding', align: 'right', render: (r) => <span className="tabular-nums">{formatINR((r.outstandingRupees || 0) * 100)}</span> },
  ];

  return (
    <ReportShell
      title="Vendor Performance"
      description={`Procurement, returns, and outstanding · ${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
    >
      <SummaryGrid items={[
        { label: 'Vendors', value: rows.length },
        { label: 'Total Spend', value: formatINR(totalSpend), highlight: true },
        { label: 'Outstanding Payables', value: formatINR(totalOutstanding) },
        { label: 'Avg Return Rate', value: `${avgReturnRate}%` },
      ]} />
      <DataTable columns={columns} rows={rows} pageSize={20} emptyMessage="No vendor activity in range." />
    </ReportShell>
  );
}