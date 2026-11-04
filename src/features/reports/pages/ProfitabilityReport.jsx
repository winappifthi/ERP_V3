import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportShell from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import DataTable from '../../../components/data-display/DataTable';
import { selectProductProfitability } from '../reportsSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function ProfitabilityReport() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectProductProfitability(range.fromDate, range.toDate));

  const totalRevenue = rows.reduce((s, r) => s + r.revenuePaise, 0);
  const totalCost = rows.reduce((s, r) => s + r.costPaise, 0);
  const totalMargin = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 100) : 0;
  const topMargin = rows[0];

  const columns = [
    { key: 'productName', label: 'Product', render: (r) => <div><div className="font-medium">{r.productName}</div><div className="text-xs font-mono text-gray-500">{r.sku}</div></div> },
    { key: 'quantitySold', label: 'Qty Sold', align: 'right', render: (r) => <span className="tabular-nums">{r.quantitySold}</span> },
    { key: 'revenuePaise', label: 'Revenue', align: 'right', render: (r) => formatINR(r.revenuePaise) },
    { key: 'costPaise', label: 'Cost', align: 'right', render: (r) => formatINR(r.costPaise) },
    { key: 'marginPaise', label: 'Margin', align: 'right', render: (r) => <span className={`tabular-nums font-medium ${r.marginPaise < 0 ? 'text-red-600' : 'text-green-700'}`}>{formatINR(r.marginPaise)}</span> },
    { key: 'marginPercent', label: 'Margin %', align: 'right', render: (r) => <span className={`tabular-nums font-medium ${r.marginPercent < 0 ? 'text-red-600' : r.marginPercent >= 20 ? 'text-green-700' : ''}`}>{r.marginPercent}%</span> },
  ];

  return (
    <ReportShell
      title="Product Profitability"
      description={`Revenue, cost, and margin by product · ${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
    >
      <SummaryGrid items={[
        { label: 'Products Sold', value: rows.length },
        { label: 'Revenue', value: formatINR(totalRevenue) },
        { label: 'Cost', value: formatINR(totalCost) },
        { label: 'Gross Margin', value: formatINR(totalMargin), highlight: true },
        { label: 'Margin %', value: `${marginPercent}%` },
      ]} />
      {topMargin && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm">
          <strong>Top contributor:</strong> {topMargin.productName} — {formatINR(topMargin.marginPaise)} margin ({topMargin.marginPercent}%)
        </div>
      )}
      <DataTable columns={columns} rows={rows} pageSize={25} emptyMessage="No sold products in range." />
    </ReportShell>
  );
}