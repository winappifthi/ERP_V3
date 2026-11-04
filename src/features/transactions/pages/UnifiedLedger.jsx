import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MenuItem, Select, FormControl, InputLabel, TextField } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';
import { LEDGER_TYPE_OPTIONS } from '../fieldConfig';

export default function UnifiedLedger() {
  const [type, setType] = useState('customer');
  const [partyId, setPartyId] = useState('');
  const [search, setSearch] = useState('');

  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const salesInvoices = useSelector((s) => s.sales.invoices);
  const salesReturns = useSelector((s) => s.sales.returns);
  const salesReceipts = useSelector((s) => s.sales.receipts);
  const purchaseInvoices = useSelector((s) => s.purchases.invoices);
  const purchaseReturns = useSelector((s) => s.purchases.returns);
  const purchasePayments = useSelector((s) => s.purchases.payments);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const parties = type === 'customer' ? customers : vendors;

  const handleTypeChange = (newType) => {
    setType(newType);
    setPartyId('');
    setSearch('');
  };

  // Build the ledger entries
  const entries = useMemo(() => {
    if (!partyId) return [];
    const rows = [];

    if (type === 'customer') {
      salesInvoices
        .filter((i) => i.customerId === partyId && i.status === 'posted')
        .forEach((i) => {
          const calc = calculateDocument({
            lines: i.lines,
            headerDiscountRupees: i.headerDiscountRupees || 0,
            charges: i.charges,
            applyRoundOff: i.applyRoundOff ?? true,
          });
          rows.push({
            date: i.invoiceDate,
            type: 'Invoice',
            ref: i.invoiceNumber,
            debit: calc.totals.finalTotalPaise,
            credit: 0,
          });
        });

      salesReturns
        .filter((r) => r.customerId === partyId && r.status === 'posted')
        .forEach((r) => {
          const calc = calculateDocument({
            lines: r.lines,
            headerDiscountRupees: 0,
            charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
            applyRoundOff: true,
          });
          rows.push({
            date: r.returnDate,
            type: 'Return',
            ref: r.returnNumber,
            debit: 0,
            credit: calc.totals.finalTotalPaise,
          });
        });

      salesReceipts
        .filter((rc) => rc.customerId === partyId && rc.status === 'posted')
        .forEach((rc) => {
          const total = (rc.allocations || []).reduce((s, a) => s + (a.amountRupees || 0), 0) * 100;
          rows.push({
            date: rc.receiptDate,
            type: 'Receipt',
            ref: rc.receiptNumber,
            debit: 0,
            credit: total,
          });
        });
    } else {
      purchaseInvoices
        .filter((i) => i.vendorId === partyId && i.status === 'posted')
        .forEach((i) => {
          const calc = calculateDocument({
            lines: i.lines,
            headerDiscountRupees: i.headerDiscountRupees || 0,
            charges: i.charges,
            applyRoundOff: true,
          });
          rows.push({
            date: i.invoiceDate,
            type: 'Invoice',
            ref: i.invoiceNumber,
            debit: 0,
            credit: calc.totals.finalTotalPaise,
          });
        });

      purchaseReturns
        .filter((r) => r.vendorId === partyId && r.status === 'posted')
        .forEach((r) => {
          const calc = calculateDocument({
            lines: r.lines,
            headerDiscountRupees: 0,
            charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
            applyRoundOff: true,
          });
          rows.push({
            date: r.returnDate,
            type: 'Return',
            ref: r.returnNumber,
            debit: calc.totals.finalTotalPaise,
            credit: 0,
          });
        });

      purchasePayments
        .filter((p) => p.vendorId === partyId && p.status === 'posted')
        .forEach((p) => {
          const total = (p.allocations || []).reduce((s, a) => s + (a.amountRupees || 0), 0) * 100;
          rows.push({
            date: p.paymentDate,
            type: 'Payment',
            ref: p.paymentNumber,
            debit: total,
            credit: 0,
          });
        });
    }

    // Sort by date and calculate running balance
    rows.sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    const finalRows = rows.map((r) => {
      running += r.debit - r.credit;
      return { ...r, balance: running };
    });

    // Apply search filter
    const q = search.trim().toLowerCase();
    return finalRows.filter((r) => 
      !q || r.ref.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    );
  }, [partyId, type, search, salesInvoices, salesReturns, salesReceipts, purchaseInvoices, purchaseReturns, purchasePayments]);

  const outstanding = entries.length ? entries[entries.length - 1].balance : 0;

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'type', label: 'Type', render: (r) => <span className="font-medium text-xs">{r.type}</span> },
    { key: 'ref', label: 'Reference', render: (r) => <span className="font-mono text-xs">{r.ref}</span> },
    { key: 'debit', label: 'Debit', align: 'right', render: (r) => r.debit ? formatINR(r.debit) : '—' },
    { key: 'credit', label: 'Credit', align: 'right', render: (r) => r.credit ? formatINR(r.credit) : '—' },
    {
      key: 'balance',
      label: 'Balance',
      align: 'right',
      render: (r) => (
        <span className={`tabular-nums font-medium ${r.balance < 0 ? 'text-red-600' : ''}`}>
          {formatINR(r.balance)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Ledger"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Ledger Type</InputLabel>
          <Select label="Ledger Type" value={type} onChange={(e) => handleTypeChange(e.target.value)}>
            {LEDGER_TYPE_OPTIONS.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>{type === 'customer' ? 'Customer' : 'Vendor'}</InputLabel>
          <Select
            label={type === 'customer' ? 'Customer' : 'Vendor'}
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
          >
            <MenuItem value="">
              <em>Select {type === 'customer' ? 'customer' : 'vendor'}…</em>
            </MenuItem>
            {parties.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 200 } }}
        />

        {partyId && (
          <div className="ml-auto text-sm text-gray-600 pb-1">
            Outstanding:{' '}
            <span className={`font-bold tabular-nums text-base ml-1 ${outstanding > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {formatINR(Math.abs(outstanding))}
            </span>
            {outstanding !== 0 && (
              <span className="text-xs ml-1 font-normal">
                ({outstanding > 0 ? 'Dr' : 'Cr'})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      {partyId ? (
        <DataTable
          columns={columns}
          rows={entries}
          pageSize={25}
          emptyMessage={`No transactions found for this ${type}.`}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded p-12 text-center text-sm text-gray-500">
          Select a {type === 'customer' ? 'customer' : 'vendor'} from the dropdown above to view their ledger.
        </div>
      )}
    </div>
  );
}