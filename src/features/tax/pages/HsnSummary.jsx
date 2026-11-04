import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import GstPeriodFilter from '../components/GstPeriodFilter';
import { selectHsnSummary } from '../taxSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function HsnSummary() {
  const company = useSelector(selectCurrentCompany);
  const [period, setPeriod] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectHsnSummary(period.fromDate, period.toDate));

  const totalTaxable = rows.reduce((s, r) => s + r.taxablePaise, 0);

  const exportCSV = () => {
    const headers = ['HSN', 'Description', 'UOM', 'Rate %', 'Quantity', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'];
    const csv = [headers.join(','), ...rows.map((r) => [r.hsn, r.description, r.uom, r.rate, r.quantity, r.taxablePaise / 100, r.cgstPaise / 100, r.sgstPaise / 100, r.igstPaise / 100, r.totalPaise / 100].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsn-summary-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'hsn', label: 'HSN', render: (r) => <span className="font-mono text-xs">{r.hsn}</span> },
    { key: 'description', label: 'Description' },
    { key: 'uom', label: 'UOM', align: 'center' },
    { key: 'rate', label: 'Rate', align: 'right', render: (r) => <span className="tabular-nums">{r.rate}%</span> },
    { key: 'quantity', label: 'Qty', align: 'right', render: (r) => <span className="tabular-nums">{Math.round(r.quantity * 100) / 100}</span> },
    { key: 'taxablePaise', label: 'Taxable', align: 'right', render: (r) => formatINR(r.taxablePaise) },
    { key: 'cgstPaise', label: 'CGST', align: 'right', render: (r) => formatINR(r.cgstPaise) },
    { key: 'sgstPaise', label: 'SGST', align: 'right', render: (r) => formatINR(r.sgstPaise) },
    { key: 'igstPaise', label: 'IGST', align: 'right', render: (r) => formatINR(r.igstPaise) },
    { key: 'totalPaise', label: 'Total', align: 'right', render: (r) => <span className="font-medium tabular-nums">{formatINR(r.totalPaise)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="HSN Summary"
        description={`HSN-wise outward supplies · ${company?.displayName || ''}`}
        actions={<Button variant="outlined" startIcon={<Download />} onClick={exportCSV} disabled={rows.length === 0}>Export CSV</Button>}
      />
      <GstPeriodFilter fromDate={period.fromDate} toDate={period.toDate} onChange={setPeriod} />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex justify-between text-sm">
        <span>HSN codes: <strong>{rows.length}</strong></span>
        <span>Total taxable value: <strong className="tabular-nums">{formatINR(totalTaxable)}</strong></span>
      </div>
      <DataTable columns={columns} rows={rows} pageSize={20} emptyMessage="No HSN data in this range." />
    </div>
  );
}