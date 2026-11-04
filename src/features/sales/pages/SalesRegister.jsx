import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectInvoicesInContext } from '../salesSelectors';
import { selectCustomersForCompany, selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function SalesRegister() {
  const invoices = useSelector(selectInvoicesInContext);
  const customers = useSelector(selectCustomersForCompany);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const customerById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);

  const rows = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'posted')
      .filter((i) => (!fromDate || i.invoiceDate >= fromDate) && (!toDate || i.invoiceDate <= toDate))
      .map((i) => {
        const calc = calculateDocument({
          lines: i.lines, headerDiscountRupees: i.headerDiscountRupees,
          charges: i.charges, applyRoundOff: i.applyRoundOff,
        });
        return {
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          invoiceDate: i.invoiceDate,
          customer: customerById[i.customerId]?.name || '—',
          gstin: customerById[i.customerId]?.gstin || '—',
          taxable: calc.totals.taxableValuePaise,
          cgst: calc.totals.cgstPaise,
          sgst: calc.totals.sgstPaise,
          igst: calc.totals.igstPaise,
          total: calc.totals.finalTotalPaise,
        };
      })
      .sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate));
  }, [invoices, fromDate, toDate, customerById]);

  const totals = rows.reduce(
    (acc, r) => ({
      taxable: acc.taxable + r.taxable,
      cgst: acc.cgst + r.cgst,
      sgst: acc.sgst + r.sgst,
      igst: acc.igst + r.igst,
      total: acc.total + r.total,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
  );

  const exportCSV = () => {
    const headers = ['Invoice #', 'Date', 'Customer', 'GSTIN', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'];
    const csv = [
      headers.join(','),
      ...rows.map((r) => [r.invoiceNumber, r.invoiceDate, r.customer, r.gstin, r.taxable / 100, r.cgst / 100, r.sgst / 100, r.igst / 100, r.total / 100].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-register-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
    { key: 'invoiceDate', label: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { key: 'customer', label: 'Customer' },
    { key: 'gstin', label: 'GSTIN', render: (r) => <span className="font-mono text-xs">{r.gstin}</span> },
    { key: 'taxable', label: 'Taxable', align: 'right', render: (r) => formatINR(r.taxable) },
    { key: 'cgst', label: 'CGST', align: 'right', render: (r) => formatINR(r.cgst) },
    { key: 'sgst', label: 'SGST', align: 'right', render: (r) => formatINR(r.sgst) },
    { key: 'igst', label: 'IGST', align: 'right', render: (r) => formatINR(r.igst) },
    { key: 'total', label: 'Total', align: 'right', render: (r) => <span className="font-semibold">{formatINR(r.total)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Register"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={<Button variant="outlined" startIcon={<Download />} onClick={exportCSV} disabled={rows.length === 0}>Export CSV</Button>}
      />

      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Button size="small" variant="text" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <Stat label="Taxable" value={formatINR(totals.taxable)} />
        <Stat label="CGST" value={formatINR(totals.cgst)} />
        <Stat label="SGST" value={formatINR(totals.sgst)} />
        <Stat label="IGST" value={formatINR(totals.igst)} />
        <Stat label="Total" value={formatINR(totals.total)} bold />
      </div>

      <DataTable columns={columns} rows={rows} pageSize={20} emptyMessage="No posted invoices in this range." />
    </div>
  );
}

function Stat({ label, value, bold }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`tabular-nums ${bold ? 'font-bold text-base' : 'font-semibold text-sm'}`}>{value}</div>
    </div>
  );
}