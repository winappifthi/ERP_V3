import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { Print } from '@mui/icons-material';
import {
  selectCurrentCompany,
  selectCurrentBranch,
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectProducts,
} from '../../../store/selectors/contextSelectors';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function UnifiedInvoicePrint() {
  const { id } = useParams();

  const salesInvoice = useSelector((s) => s.sales.invoices.find((i) => i.id === id));
  const purchaseInvoice = useSelector((s) => s.purchases.invoices.find((i) => i.id === id));
  const record = salesInvoice || purchaseInvoice;
  const isSales = !!salesInvoice;

  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const products = useSelector(selectProducts);

  if (!record) return <div className="p-6">Invoice not found.</div>;

  const parties = isSales ? customers : vendors;
  const partyField = isSales ? 'customerId' : 'vendorId';
  const party = parties.find((p) => p.id === record[partyField]);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));
  const calc = calculateDocument({
    lines: record.lines,
    headerDiscountRupees: record.headerDiscountRupees || 0,
    charges: record.charges,
    applyRoundOff: record.applyRoundOff ?? true,
  });

  const headerLabel = isSales ? 'TAX INVOICE' : 'PURCHASE INVOICE';
  const counterpartyLabel = isSales ? 'Bill To' : 'Vendor';

  return (
    <div className="print-wrapper">
      <div className="no-print mb-3 flex gap-2 justify-end">
        <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
      </div>
      <div className="invoice-sheet bg-white mx-auto p-8 max-w-[800px] border border-gray-200">
        <div className="flex justify-between border-b-2 border-gray-900 pb-4">
          <div>
            <div className="text-xl font-bold">{company?.legalName}</div>
            <div className="text-xs text-gray-600 mt-1">{company?.address}</div>
            <div className="text-xs text-gray-600 mt-1">
              GSTIN: <span className="font-mono">{company?.gstin}</span>
            </div>
            <div className="text-xs text-gray-600">Branch: {branch?.name}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">{headerLabel}</div>
            <div className="text-xs mt-1">
              Invoice # <span className="font-mono font-semibold">{record.invoiceNumber}</span>
            </div>
            {!isSales && record.vendorInvoiceNumber && (
              <div className="text-xs">
                Vendor Inv # <span className="font-mono">{record.vendorInvoiceNumber}</span>
              </div>
            )}
            <div className="text-xs">Date: {formatDate(record.invoiceDate)}</div>
            <div className="text-xs">Due: {formatDate(record.dueDate)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-200">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{counterpartyLabel}</div>
            <div className="text-sm font-semibold">{party?.name}</div>
            <div className="text-xs text-gray-600">
              GSTIN: <span className="font-mono">{party?.gstin || 'Unregistered'}</span>
            </div>
            <div className="text-xs text-gray-600">
              State: {party?.state} ({party?.stateCode})
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Tax Treatment</div>
            <div className="text-sm">
              {record.taxTreatment === 'inter'
                ? 'Inter-state supply (IGST)'
                : 'Intra-state supply (CGST + SGST)'}
            </div>
          </div>
        </div>

        <table className="w-full text-xs mt-4">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="text-left px-2 py-2">#</th>
              <th className="text-left px-2 py-2">Description</th>
              <th className="text-right px-2 py-2">HSN</th>
              <th className="text-right px-2 py-2">Qty</th>
              <th className="text-right px-2 py-2">Rate</th>
              <th className="text-right px-2 py-2">Taxable</th>
              <th className="text-right px-2 py-2">GST</th>
              <th className="text-right px-2 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {calc.lines.map((l, i) => {
              const p = productById[record.lines[i].productId];
              return (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-2 py-1.5">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <div className="font-medium">{p?.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{p?.sku}</div>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono">{p?.hsn || '—'}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{l.quantity}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatINR(l.unitPricePaise)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatINR(l.taxablePaise)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatINR(l.totalTaxPaise)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{formatINR(l.lineTotalPaise)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-[320px] text-xs space-y-1">
            <div className="flex justify-between">
              <span>Taxable Value</span>
              <span className="tabular-nums">{formatINR(calc.totals.taxableValuePaise)}</span>
            </div>
            {calc.totals.cgstPaise > 0 && (
              <div className="flex justify-between">
                <span>CGST</span>
                <span className="tabular-nums">{formatINR(calc.totals.cgstPaise)}</span>
              </div>
            )}
            {calc.totals.sgstPaise > 0 && (
              <div className="flex justify-between">
                <span>SGST</span>
                <span className="tabular-nums">{formatINR(calc.totals.sgstPaise)}</span>
              </div>
            )}
            {calc.totals.igstPaise > 0 && (
              <div className="flex justify-between">
                <span>IGST</span>
                <span className="tabular-nums">{formatINR(calc.totals.igstPaise)}</span>
              </div>
            )}
            {calc.totals.roundOffPaise !== 0 && (
              <div className="flex justify-between">
                <span>Round-off</span>
                <span className="tabular-nums">{formatINR(calc.totals.roundOffPaise)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-gray-900 pt-1 mt-1">
              <span>Grand Total</span>
              <span className="tabular-nums">{formatINR(calc.totals.finalTotalPaise)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between">
          <div>{isSales ? 'This is a computer-generated invoice.' : 'Internal document'}</div>
          <div className="text-right">
            <div>For {company?.legalName}</div>
            <div className="mt-8 border-t border-gray-400 pt-1">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}