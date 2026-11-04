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
  selectWarehousesForBranch,
} from '../../../store/selectors/contextSelectors';
import { setDeliveryStatus } from '../../sales/salesSlice';
import { setGrnStatus } from '../../purchases/purchasesSlice';
import { formatDate } from '../../../lib/dayjs';

export default function UnifiedGrnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Find the record
  const grn = useSelector((s) => s.purchases.grns.find((g) => g.id === id));
  const gdn = useSelector((s) => s.sales.gdns.find((g) => g.id === id));
  const record = grn || gdn;
  const isGrn = !!grn;

  // 2. Fetch related data
  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const products = useSelector(selectProducts);
  const warehouses = useSelector(selectWarehousesForBranch);

  if (!record) {
    return (
      <div>
        <PageHeader title="Record not found" />
        <Button onClick={() => navigate('/app/transactions/grn')} variant="outlined">
          Back
        </Button>
      </div>
    );
  }

  // 3. Resolve labels and party
  const partyField = isGrn ? 'vendorId' : 'customerId';
  const partyLabel = isGrn ? 'Vendor' : 'Customer';
  const typeLabel = isGrn ? 'Goods Receipt (GRN)' : 'Goods Delivery (GDN)';
  
  const parties = isGrn ? vendors : customers;
  const party = parties.find((p) => p.id === record[partyField]);
  
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));
  const warehouse = warehouses.find((w) => w.id === record.warehouseId);

  const handlePost = () => {
    if (isGrn) dispatch(setGrnStatus({ id, status: 'posted' }));
    else dispatch(setDeliveryStatus({ id, status: 'posted' }));
  };

  return (
    <div>
      <PageHeader
        title={record.receiptNumber || record.deliveryNumber}
        description={`${party?.name || '—'} · ${formatDate(record.receiptDate || record.deliveryDate)}`}
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate('/app/transactions/grn')}>
              Back
            </Button>

            {record.status === 'draft' && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate(`/app/transactions/grn/${id}/edit`)}
              >
                Edit
              </Button>
            )}

            {record.status === 'draft' && (
              <Button variant="contained" onClick={handlePost}>
                Post {isGrn ? 'GRN' : 'GDN'}
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
                <dd className="font-medium">{party?.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">GSTIN</dt>
                <dd className="font-mono text-xs">{party?.gstin || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Date</dt>
                <dd>{formatDate(record.receiptDate || record.deliveryDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Warehouse</dt>
                <dd className="font-medium">{warehouse?.name || record.warehouseId}</dd>
              </div>
              {record.sourceOrderId && (
                <div>
                  <dt className="text-xs text-gray-500">Source Order</dt>
                  <dd className="font-mono text-xs">{record.sourceOrderId}</dd>
                </div>
              )}
              {record.notes && (
                <div className="col-span-2">
                  <dt className="text-xs text-gray-500">Notes</dt>
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
                  <th className="text-right px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {(record.lines || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-xs">
                      No line items found.
                    </td>
                  </tr>
                ) : (
                  record.lines.map((l, i) => {
                    const p = productById[l.productId];
                    const lineTotal = (l.quantity || 0) * (l.unitPriceRupees || 0);
                    return (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-2">
                          <div className="font-medium">{p?.name || l.productId}</div>
                          <div className="text-xs font-mono text-gray-500">{p?.sku}</div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{l.quantity}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          ₹{l.unitPriceRupees?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">
                          ₹{lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="bg-white border border-gray-200 rounded p-4 text-sm space-y-1 h-fit">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Items</span>
            <span className="tabular-nums">{(record.lines || []).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Qty</span>
            <span className="tabular-nums">
              {(record.lines || []).reduce((sum, l) => sum + (l.quantity || 0), 0)}
            </span>
          </div>
          
          <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
            <span>Total Value</span>
            <span className="tabular-nums">
              ₹
              {(record.lines || [])
                .reduce((sum, l) => sum + (l.quantity || 0) * (l.unitPriceRupees || 0), 0)
                .toFixed(2)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}