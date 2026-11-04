import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportShell, { inrShort } from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import BarChartCard from '../components/BarChartCard';
import DataTable from '../../../components/data-display/DataTable';
import { selectBranchPerformance } from '../reportsSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function BranchPerformance() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectBranchPerformance(range.fromDate, range.toDate));

  const totalSales = rows.reduce((s, r) => s + r.salesPaise, 0);
  const totalPurchase = rows.reduce((s, r) => s + r.purchasePaise, 0);

  const chartData = rows.map((r) => ({
    branch: r.branchName.length > 20 ? r.branchName.slice(0, 18) + '…' : r.branchName,
    sales: r.salesPaise / 100,
    purchases: r.purchasePaise / 100,
  }));

  const columns = [
    { key: 'branchName', label: 'Branch' },
    { key: 'invoiceCount', label: 'Invoices', align: 'right' },
    { key: 'salesPaise', label: 'Sales', align: 'right', render: (r) => <span className="font-medium tabular-nums">{formatINR(r.salesPaise)}</span> },
    { key: 'purchasePaise', label: 'Purchases', align: 'right', render: (r) => <span className="tabular-nums">{formatINR(r.purchasePaise)}</span> },
    { key: 'grossMarginPaise', label: 'Gross Margin', align: 'right', render: (r) => <span className={`tabular-nums font-medium ${r.grossMarginPaise < 0 ? 'text-red-600' : 'text-green-700'}`}>{formatINR(r.grossMarginPaise)}</span> },
  ];

  return (
    <ReportShell
      title="Branch Performance"
      description={`All branches of ${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
    >
      <SummaryGrid items={[
        { label: 'Branches', value: rows.length },
        { label: 'Total Sales', value: formatINR(totalSales), highlight: true },
        { label: 'Total Purchases', value: formatINR(totalPurchase) },
        { label: 'Net Margin', value: formatINR(totalSales - totalPurchase) },
      ]} />
      <div className="mb-4">
        <BarChartCard
          title="Sales vs Purchases by Branch"
          data={chartData}
          xKey="branch"
          series={[
            { key: 'sales', name: 'Sales', color: '#2563eb' },
            { key: 'purchases', name: 'Purchases', color: '#d97706' },
          ]}
          formatY={(v) => inrShort(v)}
        />
      </div>
      <DataTable columns={columns} rows={rows} pageSize={15} emptyMessage="No branch activity in range." />
    </ReportShell>
  );
}