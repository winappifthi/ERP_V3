import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ConfigForm from '../components/ConfigForm';
import { paymentFields } from '../fieldConfig';
import { buildDefaultValues } from '../buildDefaults';
import {
  createReceipt,
  updateReceipt,
  generateReceiptId,
  generateReceiptNumber,
} from '../../sales/salesSlice';
import {
  createPayment,
  updatePayment,
  generatePaymentId,
  generatePaymentNumber,
} from '../../purchases/purchasesSlice';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function UnifiedPaymentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  
  // 1. Get lists from Redux
  const salesReceipts = useSelector((s) => s.sales.receipts);
  const purchasePayments = useSelector((s) => s.purchases.payments);

  // 2. Find the existing record (if editing)
  const existingReceipt = isEdit ? salesReceipts.find((r) => r.id === id) : null;
  const existingPayment = isEdit ? purchasePayments.find((p) => p.id === id) : null;
  const existing = existingReceipt || existingPayment;

  const [snack, setSnack] = useState(null);

  // 3. Determine the type (receipt vs payment)
  const resolvedType =
    existing?.type ||
    (existingReceipt ? 'receipt' : null) ||
    (existingPayment ? 'payment' : null) ||
    'receipt';

  const [liveType, setLiveType] = useState(resolvedType);

  // 4. Generate the display number for new records
  const displayNumber = useMemo(() => {
    if (isEdit && existing) return existing.receiptNumber || existing.paymentNumber;
    
    const records = liveType === 'receipt' ? salesReceipts : purchasePayments;
    const companyRecords = records.filter((r) => r.companyId === company.id);
    return liveType === 'receipt'
      ? generateReceiptNumber(companyRecords, company, branch)
      : generatePaymentNumber(companyRecords, company, branch);
  }, [isEdit, existing, liveType, salesReceipts, purchasePayments, company, branch]);

  // 5. Build initial form values
  const initialValues = useMemo(() => {
    if (existing) {
      const defaults = buildDefaultValues(paymentFields, existing);
      
      // Map the specific date/number fields so the form displays them correctly
      defaults.number = existing.receiptNumber || existing.paymentNumber;
      defaults.date = existing.receiptDate || existing.paymentDate;
      defaults.type = existing.type || resolvedType;
      
      return defaults;
    }
    
    return buildDefaultValues(paymentFields, null, {
      date: dayjs().format('YYYY-MM-DD'),
      number: displayNumber,
      type: liveType,
    });
  }, [existing, displayNumber, liveType, resolvedType]);

  const handleSubmit = (data) => {
    const isReceipt = data.type === 'receipt';
    const partyId = isReceipt ? data.customerId : data.vendorId;

    if (!partyId) {
      setSnack({ severity: 'error', message: `Select a ${isReceipt ? 'customer' : 'vendor'}` });
      return;
    }

    // --- EDIT MODE ---
    if (isEdit && existing) {
      const action = existingReceipt ? updateReceipt : updatePayment;
      
      // Construct the updates specific to the record type
      const updates = {
        id,
        ...data,
        type: existing.type, // preserve original type
        status: existing.status, // preserve existing status
      };

      if (isReceipt) {
        updates.receiptNumber = data.number;
        updates.receiptDate = data.date;
        updates.customerId = partyId;
      } else {
        updates.paymentNumber = data.number;
        updates.paymentDate = data.date;
        updates.vendorId = partyId;
      }

      dispatch(action(updates));
      setSnack({ severity: 'success', message: 'Record updated' });
      setTimeout(() => navigate(`/app/transactions/payments/${id}`), 700);
      return;
    }

    // --- CREATE MODE ---
    const newId = isReceipt ? generateReceiptId() : generatePaymentId();
    
    const payload = {
      id: newId,
      companyId: company.id,
      branchId: branch.id,
      type: data.type,
      status: 'draft', // Save as draft so you can post it later
      mode: data.mode,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      allocations: [],
      createdAt: new Date().toISOString(),
    };

    if (isReceipt) {
      payload.receiptNumber = displayNumber;
      payload.receiptDate = data.date;
      payload.customerId = partyId;
      dispatch(createReceipt(payload));
    } else {
      payload.paymentNumber = displayNumber;
      payload.paymentDate = data.date;
      payload.vendorId = partyId;
      dispatch(createPayment(payload));
    }

    setSnack({ severity: 'success', message: `${isReceipt ? 'Receipt' : 'Payment'} created` });
    setTimeout(() => navigate('/app/transactions/payments'), 700);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Receipt / Payment' : 'New Receipt / Payment'}
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <ConfigForm
        fields={paymentFields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/transactions/payments')}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save Changes' : 'Create'}
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