import { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import GstPeriodFilter from '../components/GstPeriodFilter';
import { selectPlaceOfSupply } from '../taxSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function PlaceOfSupply() {
  const company = useSelector(selectCurrentCompany);
  const [period, setPeriod] = useState({ fromDate: '', toDate: '' });
  const rows = useSelector(selectPlaceOfSupply(period.fromDate, period.toDate));

  const totals = rows.reduce((acc, r) => ({
    taxable: acc.taxable + r.taxablePaise,
    cgst: acc.cgst + r.cgstPaise,
    sgst: acc.sgst + r.sgstPaise,
    igst: acc.igst + r.igstPaise,
    total: acc.total + r.totalPaise,
  }), { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });

  const columns = [
    { key: 'state', label: 'State' },
    { key: 'stateCode', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.stateCode || '—'}</span> },
    { key: 'invoiceCount', label: 'Invoices', align: 'right' },
    { key: 'taxablePaise', label: 'Taxable', align: 'right', render: (r) => formatINR(r.taxablePaise) },
    { key: 'cgstPaise', label: 'CGST', align: 'right', render: (r) => formatINR(r.cgstPaise) },
    { key: 'sgstPaise', label: 'SGST', align: 'right', render: (r) => formatINR(r.sgstPaise) },
    { key: 'igstPaise', label: 'IGST', align: 'right', render: (r) => formatINR(r.igstPaise) },
    { key: 'totalPaise', label: 'Total', align: 'right', render: (r) => <span className="font-medium tabular-nums">{formatINR(r.totalPaise)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Place of Supply"
        description={`State-wise outward supply breakdown · ${company?.displayName || ''}`}
      />
      <GstPeriodFilter fromDate={period.fromDate} toDate={period.toDate} onChange={setPeriod} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <Stat label="States" value={rows.length} />
        <Stat label="Taxable" value={formatINR(totals.taxable)} />
        <Stat label="CGST" value={formatINR(totals.cgst)} />
        <Stat label="SGST" value={formatINR(totals.sgst)} />
        <Stat label="IGST" value={formatINR(totals.igst)} />
      </div>
      <DataTable columns={columns} rows={rows} pageSize={20} emptyMessage="No supplies in this range." />
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