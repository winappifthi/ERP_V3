import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { INVOICE_TYPE_OPTIONS } from '../fieldConfig';

export default function UnifiedInvoicesList() {
  const navigate = useNavigate();
  const [type, setType] = useState('sales-invoice');
  const [search, setSearch] = useState('');

  const salesInvoices = useSelector((s) => s.sales.invoices);
  const purchaseInvoices = useSelector((s) => s.purchases.invoices);
  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const isSales = type === 'sales-invoice';
  const records = isSales ? salesInvoices : purchaseInvoices;
  const parties = isSales ? customers : vendors;
  const partyById = useMemo(() => Object.fromEntries(parties.map((p) => [p.id, p])), [parties]);

  // Filter records by company, branch, and search query
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter((r) => r.companyId === company?.id && r.branchId === branch?.id)
      .filter((r) => {
        if (!q) return true;
        const partyName = partyById[r[isSales ? 'customerId' : 'vendorId']]?.name || '';
        return (
          r.invoiceNumber.toLowerCase().includes(q) ||
          (r.vendorInvoiceNumber || '').toLowerCase().includes(q) ||
          partyName.toLowerCase().includes(q)
        );
      })
      .map((r) => {
        const calc = calculateDocument({
          lines: r.lines || [],
          headerDiscountRupees: r.headerDiscountRupees || 0,
          charges: r.charges,
          applyRoundOff: r.applyRoundOff ?? true,
        });
        const paid = Math.round((r.amountPaid || 0) * 100);
        return {
          ...r,
          totalPaise: calc.totals.finalTotalPaise,
          duePaise: calc.totals.finalTotalPaise - paid,
        };
      });
  }, [records, search, company, branch, partyById, isSales]);

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (r) => (
        <button
          onClick={() => navigate(`/app/transactions/invoices/${r.id}`)}
          className="text-blue-600 hover:underline font-mono text-xs"
        >
          {r.invoiceNumber}
        </button>
      ),
    },
    ...(type === 'purchase-invoice'
      ? [{
          key: 'vendorInvoiceNumber',
          label: 'Vendor Inv #',
          hideOnMobile: true,
          render: (r) => <span className="font-mono text-xs">{r.vendorInvoiceNumber || '—'}</span>,
        }]
      : []),
    { key: 'invoiceDate', label: 'Date', render: (r) => formatDate(r.invoiceDate) },
    {
      key: isSales ? 'customerId' : 'vendorId',
      label: isSales ? 'Customer' : 'Vendor',
      render: (r) => partyById[r[isSales ? 'customerId' : 'vendorId']]?.name || '—',
    },
    {
      key: 'totalPaise',
      label: 'Total',
      align: 'right',
      render: (r) => <span className="tabular-nums">{formatINR(r.totalPaise)}</span>,
    },
    {
      key: 'duePaise',
      label: 'Due',
      align: 'right',
      hideOnMobile: true,
      render: (r) => <span className="tabular-nums">{formatINR(r.duePaise)}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/app/transactions/invoices/new')}
          >
            New Invoice
          </Button>
        }
      />

      {/* Filters Bar (Like Ledger) */}
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Invoice Type</InputLabel>
          <Select label="Invoice Type" value={type} onChange={(e) => setType(e.target.value)}>
            {INVOICE_TYPE_OPTIONS.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search invoice # or party name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={15}
        emptyMessage={`No ${isSales ? 'sales' : 'purchase'} invoices found.`}
      />
    </div>
  );
}