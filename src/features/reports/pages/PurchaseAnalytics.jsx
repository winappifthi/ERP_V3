import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import ReportShell, { inrShort } from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import BarChartCard from '../components/BarChartCard';
import DataTable from '../../../components/data-display/DataTable';
import { selectPurchaseInvoicesEnriched, selectVendorPerformance } from '../reportsSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { exportCSV } from '../reportsUtils';

export default function PurchaseAnalytics() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const invoices = useSelector(selectPurchaseInvoicesEnriched(range.fromDate, range.toDate));
  const vendors = useSelector(selectVendorPerformance(range.fromDate, range.toDate));

  const totalSpend = invoices.reduce((s, i) => s + i.totalPaise, 0);
  const totalTaxable = invoices.reduce((s, i) => s + i.taxablePaise, 0);
  const avgInvoice = invoices.length ? totalSpend / invoices.length : 0;

  // Monthly spend chart
  const monthly = (() => {
    const map = new Map();
    for (const i of invoices) {
      const m = i.month;
      const existing = map.get(m) || { month: m, spend: 0 };
      existing.spend += i.totalPaise / 100;
      map.set(m, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  const doExport = () => {
    exportCSV(`purchase-analytics-${Date.now()}.csv`,
      ['Invoice #', 'Date', 'Vendor', 'Taxable', 'Total'],
      invoices.map((i) => [i.invoiceNumber, i.invoiceDate, i.vendorName, i.taxablePaise / 100, i.totalPaise / 100])
    );
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
    { key: 'invoiceDate', label: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'taxablePaise', label: 'Taxable', align: 'right', render: (r) => formatINR(r.taxablePaise) },
    { key: 'totalPaise', label: 'Total', align: 'right', render: (r) => <span className="font-medium">{formatINR(r.totalPaise)}</span> },
  ];

  const vendorColumns = [
    { key: 'vendorName', label: 'Vendor' },
    { key: 'invoiceCount', label: 'Invoices', align: 'right' },
    { key: 'purchasePaise', label: 'Total Spend', align: 'right', render: (r) => formatINR(r.purchasePaise) },
    { key: 'returnsPaise', label: 'Returns', align: 'right', render: (r) => formatINR(r.returnsPaise) },
    { key: 'returnRate', label: 'Return %', align: 'right', render: (r) => `${r.returnRate}%` },
    { key: 'outstandingRupees', label: 'Outstanding', align: 'right', render: (r) => formatINR(r.outstandingRupees * 100) },
  ];

  return (
    <ReportShell
      title="Purchase Analytics"
      description={`${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
      actions={<Button variant="outlined" startIcon={<Download />} onClick={doExport} disabled={invoices.length === 0}>Export CSV</Button>}
    >
      <SummaryGrid items={[
        { label: 'Invoices', value: invoices.length },
        { label: 'Taxable Value', value: formatINR(totalTaxable) },
        { label: 'Total Spend', value: formatINR(totalSpend), highlight: true },
        { label: 'Avg Invoice', value: formatINR(Math.round(avgInvoice)) },
        { label: 'Vendors', value: vendors.length },
      ]} />

      <div className="mb-4">
        <BarChartCard
          title="Monthly Purchase Spend"
          data={monthly}
          xKey="month"
          series={[{ key: 'spend', name: 'Spend (₹)', color: '#d97706' }]}
          formatY={(v) => inrShort(v)}
        />
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Top Vendors</h2>
        <DataTable columns={vendorColumns} rows={vendors} pageSize={10} emptyMessage="No vendor activity in range." />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">All Invoices</h2>
        <DataTable columns={columns} rows={invoices} pageSize={15} emptyMessage="No posted purchase invoices in range." />
      </div>
    </ReportShell>
  );
}