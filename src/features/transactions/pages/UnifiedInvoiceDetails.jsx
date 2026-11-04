import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { Edit, Print } from '@mui/icons-material'; // Added Edit icon
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectProducts,
} from '../../../store/selectors/contextSelectors';
import { postInvoice as postSalesInvoice } from '../../sales/salesSlice';
import { postInvoice as postPurchaseInvoice } from '../../purchases/purchasesSlice';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function UnifiedInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Find the invoice in either slice
  const salesInvoice = useSelector((s) => s.sales.invoices.find((i) => i.id === id));
  const purchaseInvoice = useSelector((s) => s.purchases.invoices.find((i) => i.id === id));
  const record = salesInvoice || purchaseInvoice;
  const isSales = !!salesInvoice;

  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const products = useSelector(selectProducts);

  if (!record) {
    return (
      <div>
        <PageHeader title="Invoice not found" />
        <Button onClick={() => navigate('/app/transactions/invoices')} variant="outlined">Back</Button>
      </div>
    );
  }

  const type = isSales ? 'sales-invoice' : 'purchase-invoice';
  const partyField = isSales ? 'customerId' : 'vendorId';
  const partyLabel = isSales ? 'Customer' : 'Vendor';
  const typeLabel = isSales ? 'Sales Invoice' : 'Purchase Invoice';

  const parties = isSales ? customers : vendors;
  const party = parties.find((p) => p.id === record[partyField]);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  const calc = calculateDocument({
    lines: record.lines,
    headerDiscountRupees: record.headerDiscountRupees || 0,
    charges: record.charges,
    applyRoundOff: record.applyRoundOff ?? true,
  });
  const paidPaise = Math.round((record.amountPaid || 0) * 100);
  const duePaise = calc.totals.finalTotalPaise - paidPaise;

  const handlePost = () => {
    if (isSales) dispatch(postSalesInvoice(id));
    else dispatch(postPurchaseInvoice(id));
  };

  return (
    <div>
      <PageHeader
        title={record.invoiceNumber}
        description={`${party?.name || '—'} · ${formatDate(record.invoiceDate)}`}
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate('/app/transactions/invoices')}>
              Back
            </Button>

            {/* 👇 THE EDIT BUTTON 👇 */}
            <Button 
              variant="outlined" 
              startIcon={<Edit />} 
              onClick={() => navigate(`/app/transactions/invoices/${id}/edit`)}
            >
              Edit
            </Button>

            <Button 
              variant="outlined" 
              startIcon={<Print />} 
              onClick={() => navigate(`/app/transactions/invoices/${id}/print`)}
            >
              Print
            </Button>
            
            {record.status === 'draft' && (
              <Button variant="contained" onClick={handlePost}>
                Post Invoice
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold">{typeLabel} Details</h2>
              <StatusBadge status={record.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-gray-500">Type</dt><dd className="font-medium">{typeLabel}</dd></div>
              <div><dt className="text-xs text-gray-500">{partyLabel}</dt><dd className="font-medium">{party?.name}</dd></div>
              <div><dt className="text-xs text-gray-500">GSTIN</dt><dd className="font-mono text-xs">{party?.gstin || '—'}</dd></div>
              <div><dt className="text-xs text-gray-500">Invoice Date</dt><dd>{formatDate(record.invoiceDate)}</dd></div>
              <div><dt className="text-xs text-gray-500">Due Date</dt><dd>{formatDate(record.dueDate)}</dd></div>
              {!isSales && record.vendorInvoiceNumber && (
                <div><dt className="text-xs text-gray-500">Vendor Inv #</dt><dd className="font-mono text-xs">{record.vendorInvoiceNumber}</dd></div>
              )}
            </dl>
          </div>

          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2">Product</th>
                  <th className="text-right px-3 py-2">Qty</th>
                  <th className="text-right px-3 py-2">Rate</th>
                  <th className="text-right px-3 py-2">Taxable</th>
                  <th className="text-right px-3 py-2">Tax</th>
                  <th className="text-right px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {calc.lines.map((l, i) => {
                  const p = productById[record.lines[i].productId];
                  return (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        <div className="font-medium">{p?.name}</div>
                        <div className="text-xs font-mono text-gray-500">{p?.sku}</div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{l.quantity}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatINR(l.unitPricePaise)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatINR(l.taxablePaise)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatINR(l.totalTaxPaise)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{formatINR(l.lineTotalPaise)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-600">Taxable</span><span className="tabular-nums">{formatINR(calc.totals.taxableValuePaise)}</span></div>
          {calc.totals.cgstPaise > 0 && <div className="flex justify-between"><span className="text-gray-600">CGST</span><span className="tabular-nums">{formatINR(calc.totals.cgstPaise)}</span></div>}
          {calc.totals.sgstPaise > 0 && <div className="flex justify-between"><span className="text-gray-600">SGST</span><span className="tabular-nums">{formatINR(calc.totals.sgstPaise)}</span></div>}
          {calc.totals.igstPaise > 0 && <div className="flex justify-between"><span className="text-gray-600">IGST</span><span className="tabular-nums">{formatINR(calc.totals.igstPaise)}</span></div>}
          <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2"><span>Total</span><span className="tabular-nums">{formatINR(calc.totals.finalTotalPaise)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Paid</span><span className="tabular-nums">{formatINR(paidPaise)}</span></div>
          <div className="flex justify-between font-semibold text-red-700"><span>Due</span><span className="tabular-nums">{formatINR(duePaise)}</span></div>
        </div>
      </div>
    </div>
  );
}