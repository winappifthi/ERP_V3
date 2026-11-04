import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import ReportShell, { inrShort } from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import BarChartCard from '../components/BarChartCard';
import LineChartCard from '../components/LineChartCard';
import DataTable from '../../../components/data-display/DataTable';
import { selectSalesInvoicesEnriched, selectSalesTrend, selectTopProducts, selectSalesVsPurchaseMonthly } from '../reportsSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { exportCSV } from '../reportsUtils';

export default function SalesAnalytics() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const invoices = useSelector(selectSalesInvoicesEnriched(range.fromDate, range.toDate));
  const trend = useSelector(selectSalesTrend(range.fromDate, range.toDate));
  const topProducts = useSelector(selectTopProducts(range.fromDate, range.toDate));
  const salesVsPurchase = useSelector(selectSalesVsPurchaseMonthly(range.fromDate, range.toDate));

  const totalRevenue = invoices.reduce((s, i) => s + i.totalPaise, 0);
  const totalTaxable = invoices.reduce((s, i) => s + i.taxablePaise, 0);
  const totalTax = invoices.reduce((s, i) => s + i.taxPaise, 0);
  const avgInvoice = invoices.length ? totalRevenue / invoices.length : 0;

  const trendChart = trend.map((t) => ({ month: t.month, revenue: t.valuePaise / 100 }));

  const doExport = () => {
    exportCSV(
      `sales-analytics-${Date.now()}.csv`,
      ['Invoice #', 'Date', 'Customer', 'Taxable', 'Tax', 'Total'],
      invoices.map((i) => [i.invoiceNumber, i.invoiceDate, i.customerName, i.taxablePaise / 100, i.taxPaise / 100, i.totalPaise / 100])
    );
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
    { key: 'invoiceDate', label: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { key: 'customerName', label: 'Customer' },
    { key: 'taxablePaise', label: 'Taxable', align: 'right', render: (r) => formatINR(r.taxablePaise) },
    { key: 'taxPaise', label: 'Tax', align: 'right', render: (r) => formatINR(r.taxPaise) },
    { key: 'totalPaise', label: 'Total', align: 'right', render: (r) => <span className="font-medium">{formatINR(r.totalPaise)}</span> },
  ];

  return (
    <ReportShell
      title="Sales Analytics"
      description={`${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
      actions={<Button variant="outlined" startIcon={<Download />} onClick={doExport} disabled={invoices.length === 0}>Export CSV</Button>}
    >
      <SummaryGrid items={[
        { label: 'Invoices', value: invoices.length },
        { label: 'Taxable Value', value: formatINR(totalTaxable) },
        { label: 'Total Tax', value: formatINR(totalTax) },
        { label: 'Total Revenue', value: formatINR(totalRevenue), highlight: true },
        { label: 'Avg Invoice', value: formatINR(Math.round(avgInvoice)) },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <LineChartCard
          title="Monthly Revenue Trend"
          data={trendChart}
          xKey="month"
          series={[{ key: 'revenue', name: 'Revenue (₹)', color: '#2563eb' }]}
          formatY={(v) => inrShort(v)}
        />
        <BarChartCard
          title="Sales vs Purchases"
          data={salesVsPurchase}
          xKey="month"
          series={[
            { key: 'salesRupees', name: 'Sales', color: '#2563eb' },
            { key: 'purchaseRupees', name: 'Purchases', color: '#d97706' },
          ]}
          formatY={(v) => inrShort(v)}
        />
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Top Products by Revenue</h2>
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-right px-3 py-2">Qty Sold</th>
                <th className="text-right px-3 py-2">Revenue</th>
                <th className="text-right px-3 py-2">Cost</th>
                <th className="text-right px-3 py-2">Margin</th>
                <th className="text-right px-3 py-2">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.productId} className="border-t border-gray-100">
                  <td className="px-3 py-2"><div className="font-medium">{p.productName}</div><div className="text-xs font-mono text-gray-500">{p.sku}</div></td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.quantitySold}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatINR(p.revenuePaise)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatINR(p.costPaise)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{formatINR(p.marginPaise)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.marginPercent}%</td>
                </tr>
              ))}
              {topProducts.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500 text-xs">No sales in range.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">All Invoices</h2>
        <DataTable columns={columns} rows={invoices} pageSize={15} emptyMessage="No posted invoices in range." />
      </div>
    </ReportShell>
  );
}