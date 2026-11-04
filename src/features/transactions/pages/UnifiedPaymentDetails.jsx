import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
} from '../../../store/selectors/contextSelectors';
import { setReceiptStatus } from '../../sales/salesSlice';
import { setPaymentStatus } from '../../purchases/purchasesSlice';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function UnifiedPaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Find the record in either slice
  const receipt = useSelector((s) => s.sales.receipts.find((r) => r.id === id));
  const payment = useSelector((s) => s.purchases.payments.find((p) => p.id === id));
  const record = receipt || payment;
  const isReceipt = !!receipt;

  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  
  // Need invoices to resolve the allocations
  const salesInvoices = useSelector((s) => s.sales.invoices);
  const purchaseInvoices = useSelector((s) => s.purchases.invoices);

  if (!record) {
    return (
      <div>
        <PageHeader title="Record not found" />
        <Button onClick={() => navigate('/app/transactions/payments')} variant="outlined">
          Back
        </Button>
      </div>
    );
  }

  const partyField = isReceipt ? 'customerId' : 'vendorId';
  const partyLabel = isReceipt ? 'Customer' : 'Vendor';
  const typeLabel = isReceipt ? 'Customer Receipt' : 'Vendor Payment';
  const numberField = isReceipt ? 'receiptNumber' : 'paymentNumber';
  const dateField = isReceipt ? 'receiptDate' : 'paymentDate';

  const parties = isReceipt ? customers : vendors;
  const party = parties.find((p) => p.id === record[partyField]);
  
  const invoices = isReceipt ? salesInvoices : purchaseInvoices;
  const invoiceById = Object.fromEntries(invoices.map((i) => [i.id, i]));

  // Calculate total allocated
  const totalAllocatedPaise = (record.allocations || []).reduce(
    (sum, a) => sum + (a.amountRupees || 0) * 100,
    0
  );

  const handlePost = () => {
    if (isReceipt) dispatch(setReceiptStatus({ id, status: 'posted' }));
    else dispatch(setPaymentStatus({ id, status: 'posted' }));
  };

  return (
    <div>
      <PageHeader
        title={record[numberField]}
        description={`${party?.name || '—'} · ${formatDate(record[dateField])}`}
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate('/app/transactions/payments')}>
              Back
            </Button>

            {record.status === 'draft' && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate(`/app/transactions/payments/${id}/edit`)}
              >
                Edit
              </Button>
            )}

            {record.status === 'draft' && (
              <Button variant="contained" onClick={handlePost}>
                Post {isReceipt ? 'Receipt' : 'Payment'}
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        
        {/* LEFT COLUMN: Details & Allocations */}
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
                <dt className="text-xs text-gray-500">Payment Mode</dt>
                <dd className="capitalize">{record.mode || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Reference #</dt>
                <dd className="font-mono text-xs">{record.referenceNumber || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Date</dt>
                <dd>{formatDate(record[dateField])}</dd>
              </div>
              {record.notes && (
                <div className="col-span-2">
                  <dt className="text-xs text-gray-500">Notes</dt>
                  <dd className="text-sm">{record.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Allocations Table */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold">Invoice Allocations</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2">Invoice #</th>
                  <th className="text-left px-3 py-2">Invoice Date</th>
                  <th className="text-right px-3 py-2">Amount Applied</th>
                </tr>
              </thead>
              <tbody>
                {(record.allocations || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-gray-500 text-xs">
                      No invoices allocated to this {isReceipt ? 'receipt' : 'payment'}.
                    </td>
                  </tr>
                ) : (
                  record.allocations.map((alloc, i) => {
                    const inv = invoiceById[alloc.invoiceId];
                    return (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-2">
                          <div className="font-medium font-mono text-xs">{inv?.invoiceNumber || alloc.invoiceId}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {inv ? formatDate(inv.invoiceDate) : '—'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">
                          {formatINR((alloc.amountRupees || 0) * 100)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Totals Summary */}
        <div className="bg-white border border-gray-200 rounded p-4 text-sm space-y-1 h-fit">
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Payment Mode</span>
            <span className="capitalize font-medium text-gray-900">{record.mode || '—'}</span>
          </div>
          
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-semibold text-base">
              <span>Total Amount</span>
              <span className="tabular-nums text-green-700">
                {formatINR(totalAllocatedPaise)}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            This amount has been applied to {record.allocations?.length || 0} invoice(s) for {party?.name || 'the party'}.
          </p>
        </div>

      </div>
    </div>
  );
}