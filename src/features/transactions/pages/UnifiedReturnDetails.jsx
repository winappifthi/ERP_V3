import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectProducts,
} from '../../../store/selectors/contextSelectors';
import { setReturnStatus as setSalesReturnStatus } from '../../sales/salesSlice';
import { setReturnStatus as setPurchaseReturnStatus } from '../../purchases/purchasesSlice';
import { calculateDocument } from '../../../domain/calculations/documentCalculator';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function UnifiedReturnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Find the return in either slice
  const salesReturn = useSelector((s) => s.sales.returns.find((r) => r.id === id));
  const purchaseReturn = useSelector((s) => s.purchases.returns.find((r) => r.id === id));
  const record = salesReturn || purchaseReturn;
  const isSales = !!salesReturn;

  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const products = useSelector(selectProducts);

  if (!record) {
    return (
      <div>
        <PageHeader title="Return not found" />
        <Button onClick={() => navigate('/app/transactions/returns')} variant="outlined">
          Back
        </Button>
      </div>
    );
  }

  const partyField = isSales ? 'customerId' : 'vendorId';
  const partyLabel = isSales ? 'Customer' : 'Vendor';
  const typeLabel = isSales ? 'Sales Return' : 'Purchase Return';

  const parties = isSales ? customers : vendors;
  const party = parties.find((p) => p.id === record[partyField]);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  // 2. Calculate totals from lines
  const calc = calculateDocument({
    lines: record.lines || [],
    headerDiscountRupees: 0,
    charges: { freightRupees: 0, packingRupees: 0, otherRupees: 0 },
    applyRoundOff: true,
  });

  const handlePost = () => {
    if (isSales) dispatch(setSalesReturnStatus({ id, status: 'posted' }));
    else dispatch(setPurchaseReturnStatus({ id, status: 'posted' }));
  };

  return (
    <div>
      <PageHeader
        title={record.returnNumber}
        description={`${party?.name || '—'} · ${formatDate(record.returnDate)}`}
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate('/app/transactions/returns')}>
              Back
            </Button>

            {record.status === 'draft' && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate(`/app/transactions/returns/${id}/edit`)}
              >
                Edit
              </Button>
            )}

            {record.status === 'draft' && (
              <Button variant="contained" onClick={handlePost}>
                Approve & Post
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        
        {/* LEFT COLUMN: Details & Lines */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Header Info */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold">{typeLabel} Details</h2>
              <StatusBadge status={record.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Type</dt>
                <dd className="font-medium">{typeLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">{partyLabel}</dt>
                <dd className="font-medium">{party?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">GSTIN</dt>
                <dd className="font-mono text-xs">{party?.gstin || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Return Date</dt>
                <dd>{formatDate(record.returnDate)}</dd>
              </div>
              {record.sourceInvoiceId && (
                <div>
                  <dt className="text-xs text-gray-500">Source Invoice</dt>
                  <dd className="font-mono text-xs">{record.sourceInvoiceId}</dd>
                </div>
              )}
              {record.notes && (
                <div className="col-span-2">
                  <dt className="text-xs text-gray-500">Reason / Notes</dt>
                  <dd className="text-sm">{record.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Line Items Table */}
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

        {/* RIGHT COLUMN: Totals Summary */}
        <div className="bg-white border border-gray-200 rounded p-4 text-sm space-y-1 h-fit">
          <div className="flex justify-between">
            <span className="text-gray-600">Taxable</span>
            <span className="tabular-nums">{formatINR(calc.totals.taxableValuePaise)}</span>
          </div>
          {calc.totals.cgstPaise > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">CGST</span>
              <span className="tabular-nums">{formatINR(calc.totals.cgstPaise)}</span>
            </div>
          )}
          {calc.totals.sgstPaise > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">SGST</span>
              <span className="tabular-nums">{formatINR(calc.totals.sgstPaise)}</span>
            </div>
          )}
          {calc.totals.igstPaise > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">IGST</span>
              <span className="tabular-nums">{formatINR(calc.totals.igstPaise)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
            <span>Total Amount</span>
            <span className="tabular-nums">{formatINR(calc.totals.finalTotalPaise)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}