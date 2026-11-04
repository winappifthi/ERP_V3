import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import GstPeriodFilter from '../components/GstPeriodFilter';
import GstTaxBreakdown from '../components/GstTaxBreakdown';
import { selectOutwardSupplies } from '../taxSelectors';
import { selectCurrentCompany, selectCurrentTaxSettings } from '../taxSelectors';
import { selectCurrentCompany as selectCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function Gstr1Preview() {
  const company = useSelector(selectCompany);
  const settings = useSelector(selectCurrentTaxSettings);
  const [period, setPeriod] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectOutwardSupplies(period.fromDate, period.toDate));

  const totals = rows.reduce((acc, r) => ({
    taxable: acc.taxable + r.taxablePaise,
    cgst: acc.cgst + r.cgstPaise,
    sgst: acc.sgst + r.sgstPaise,
    igst: acc.igst + r.igstPaise,
    total: acc.total + r.totalPaise,
  }), { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });

  const exportCSV = () => {
    const headers = ['Type', 'Document #', 'Date', 'Customer', 'GSTIN', 'State', 'POS', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'];
    const csv = [headers.join(','), ...rows.map((r) => [
      r.documentType, r.documentNumber, r.date, r.customerName, r.customerGstin, r.customerState,
      r.placeOfSupply, r.taxablePaise / 100, r.cgstPaise / 100, r.sgstPaise / 100, r.igstPaise / 100, r.totalPaise / 100,
    ].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gstr1-preview-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'documentType', label: 'Type', render: (r) => <span className="text-xs capitalize">{r.documentType}</span> },
    { key: 'documentNumber', label: 'Document #', render: (r) => <span className="font-mono text-xs">{r.documentNumber}</span> },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'customerName', label: 'Customer' },
    { key: 'customerGstin', label: 'GSTIN', render: (r) => <span className="font-mono text-xs">{r.customerGstin}</span> },
    { key: 'placeOfSupply', label: 'POS', render: (r) => r.placeOfSupply || '—' },
    { key: 'taxablePaise', label: 'Taxable', align: 'right', render: (r) => formatINR(r.taxablePaise) },
    { key: 'tax', label: 'Tax', align: 'right', render: (r) => <GstTaxBreakdown cgst={r.cgstPaise} sgst={r.sgstPaise} igst={r.igstPaise} totalTax={r.cgstPaise + r.sgstPaise + r.igstPaise} /> },
    { key: 'totalPaise', label: 'Total', align: 'right', render: (r) => <span className="font-medium tabular-nums">{formatINR(r.totalPaise)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="GSTR-1 Preview"
        description={`Outward supplies · ${company?.displayName || ''} · GSTIN ${settings?.gstin || '—'}`}
        actions={<Button variant="outlined" startIcon={<Download />} onClick={exportCSV} disabled={rows.length === 0}>Export CSV</Button>}
      />

      <GstPeriodFilter fromDate={period.fromDate} toDate={period.toDate} onChange={setPeriod} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <Stat label="Documents" value={rows.length} />
        <Stat label="Taxable Value" value={formatINR(totals.taxable)} />
        <Stat label="CGST" value={formatINR(totals.cgst)} />
        <Stat label="SGST" value={formatINR(totals.sgst)} />
        <Stat label="IGST" value={formatINR(totals.igst)} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 mb-3">
        <strong>Prototype:</strong> This preview reflects posted sales invoices and credit notes. It is not a statutory GSTR-1 filing format. Use it to review the data that would feed such a return.
      </div>

      <DataTable columns={columns} rows={rows} pageSize={25} emptyMessage="No outward supplies in this range." />
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