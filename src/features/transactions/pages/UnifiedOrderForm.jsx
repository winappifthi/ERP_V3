import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ConfigForm from '../components/ConfigForm';
import { orderFields } from '../fieldConfig';
import { buildDefaultValues } from '../buildDefaults';
import {
  createOrder as createSalesOrder,
  updateOrder as updateSalesOrder,
  generateOrderId as genSalesId,
  generateOrderNumber as genSalesNum,
} from '../../sales/salesSlice';
import {
  createOrder as createPurchaseOrder,
  updateOrder as updatePurchaseOrder,
  generateOrderId as genPurchaseId,
  generateOrderNumber as genPurchaseNum,
} from '../../purchases/purchasesSlice';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function UnifiedOrderForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const salesOrders = useSelector((s) => s.sales.orders);
  const purchaseOrders = useSelector((s) => s.purchases.orders);

  const existingSales = isEdit ? salesOrders.find((o) => o.id === id) : null;
  const existingPurchase = isEdit ? purchaseOrders.find((o) => o.id === id) : null;
  const existing = existingSales || existingPurchase;

  const [snack, setSnack] = useState(null);

  const resolvedType =
    existing?.type ||
    (existingSales ? 'sales-order' : null) ||
    (existingPurchase ? 'purchase-order' : null) ||
    'sales-order';

  const [liveType, setLiveType] = useState(resolvedType);

  const displayOrderNumber = useMemo(() => {
    if (isEdit && existing) return existing.orderNumber;
    const records = liveType === 'sales-order' ? salesOrders : purchaseOrders;
    const companyRecords = records.filter((r) => r.companyId === company.id);
    return liveType === 'sales-order'
      ? genSalesNum(companyRecords, company, branch)
      : genPurchaseNum(companyRecords, company, branch);
  }, [isEdit, existing, liveType, salesOrders, purchaseOrders, company, branch]);

  // ⬇️ DERIVED FROM CONFIG — no manual field list
  const initialValues = useMemo(() => {
    if (existing) {
      return buildDefaultValues(orderFields, existing);
    }
    return buildDefaultValues(orderFields, null, {
      orderDate: dayjs().format('YYYY-MM-DD'),
      expectedDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      orderNumber: displayOrderNumber,
      type: liveType,
    });
  }, [existing, displayOrderNumber, liveType]);

  const handleSubmit = (data) => {
    const type = data.type;
    const isSales = type === 'sales-order';
    const partyId = isSales ? data.customerId : data.vendorId;

    if (!partyId) {
      setSnack({ severity: 'error', message: `Select a ${isSales ? 'customer' : 'vendor'}` });
      return;
    }

    if (isEdit && existing) {
      const action = existingSales ? updateSalesOrder : updatePurchaseOrder;
      dispatch(action({
        id,
        type,
        orderDate: data.orderDate,
        expectedDate: data.expectedDate,
        taxTreatment: data.taxTreatment,
        charges: data.charges,
        notes: data.notes,
        customerId: isSales ? partyId : undefined,
        vendorId: !isSales ? partyId : undefined,
      }));
      setSnack({ severity: 'success', message: 'Order updated' });
      setTimeout(() => navigate(`/app/transactions/orders/${id}`), 700);
      return;
    }

    const newId = isSales ? genSalesId() : genPurchaseId();
    const createAction = isSales ? createSalesOrder : createPurchaseOrder;

    const payload = {
      id: newId,
      companyId: company.id,
      branchId: branch.id,
      orderNumber: displayOrderNumber,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate,
      type,
      taxTreatment: data.taxTreatment,
      lines: [],
      charges: data.charges,
      notes: data.notes,
      status: isSales ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
    };
    if (isSales) payload.customerId = partyId;
    else payload.vendorId = partyId;

    dispatch(createAction(payload));
    setSnack({ severity: 'success', message: 'Order created' });
    setTimeout(() => navigate('/app/transactions/orders'), 700);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit ${resolvedType === 'sales-order' ? 'Sales' : 'Purchase'} Order` : 'New Order'}
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <ConfigForm
        fields={orderFields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/transactions/orders')}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save Changes' : 'Create Order'}
        onValuesChange={(values) => {
          if (!isEdit && values.type && values.type !== liveType) {
            setLiveType(values.type);
          }
        }}
      />
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}