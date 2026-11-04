import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportShell from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import PieChartCard from '../components/PieChartCard';
import DataTable from '../../../components/data-display/DataTable';
import { selectCustomerProfitability } from '../reportsSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function CustomerProfitability() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectCustomerProfitability(range.fromDate, range.toDate));

  const totalRevenue = rows.reduce((s, r) => s + r.revenuePaise, 0);
  const totalMargin = rows.reduce((s, r) => s + r.marginPaise, 0);

  const pieData = rows.slice(0, 8).map((r) => ({ name: r.customerName, value: Math.round(r.revenuePaise / 100) }));

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'invoiceCount', label: 'Invoices', align: 'right', render: (r) => r.invoiceCount },
    { key: 'revenuePaise', label: 'Revenue', align: 'right', render: (r) => formatINR(r.revenuePaise) },
    { key: 'costPaise', label: 'Cost', align: 'right', render: (r) => formatINR(r.costPaise) },
    { key: 'marginPaise', label: 'Margin', align: 'right', render: (r) => <span className={`tabular-nums font-medium ${r.marginPaise < 0 ? 'text-red-600' : 'text-green-700'}`}>{formatINR(r.marginPaise)}</span> },
    { key: 'marginPercent', label: 'Margin %', align: 'right', render: (r) => `${r.marginPercent}%` },
  ];

  return (
    <ReportShell
      title="Customer Profitability"
      description={`Revenue and margin by customer · ${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
    >
      <SummaryGrid items={[
        { label: 'Customers', value: rows.length },
        { label: 'Revenue', value: formatINR(totalRevenue), highlight: true },
        { label: 'Total Margin', value: formatINR(totalMargin) },
      ]} />

      {pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <PieChartCard title="Revenue Share (Top 8)" data={pieData} formatValue={(v) => formatINR(v * 100)} />
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold mb-2">Insights</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Top customer: <strong>{rows[0]?.customerName || '—'}</strong> ({formatINR(rows[0]?.revenuePaise || 0)})</li>
              <li>Best margin: <strong>{[...rows].sort((a, b) => b.marginPercent - a.marginPercent)[0]?.customerName || '—'}</strong></li>
              <li>Avg revenue: <strong>{formatINR(rows.length ? Math.round(totalRevenue / rows.length) : 0)}</strong> per customer</li>
            </ul>
          </div>
        </div>
      )}

      <DataTable columns={columns} rows={rows} pageSize={20} emptyMessage="No customer activity in range." />
    </ReportShell>
  );
}