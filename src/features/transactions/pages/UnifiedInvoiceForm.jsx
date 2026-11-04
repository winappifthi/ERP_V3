import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ConfigForm from '../components/ConfigForm';
import { invoiceFields } from '../fieldConfig';
import { buildDefaultValues } from '../buildDefaults';
import {
  createInvoice as createSalesInvoice,
  updateInvoice as updateSalesInvoice,
  generateInvoiceId as genSalesId,
  generateInvoiceNumber as genSalesNum,
} from '../../sales/salesSlice';
import {
  createInvoice as createPurchaseInvoice,
  updateInvoice as updatePurchaseInvoice,
  generatePurchaseInvoiceId as genPurchaseId,
  generatePurchaseInvoiceNumber as genPurchaseNum,
} from '../../purchases/purchasesSlice';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function UnifiedInvoiceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const salesInvoices = useSelector((s) => s.sales.invoices);
  const purchaseInvoices = useSelector((s) => s.purchases.invoices);

  const existingSales = isEdit ? salesInvoices.find((i) => i.id === id) : null;
  const existingPurchase = isEdit ? purchaseInvoices.find((i) => i.id === id) : null;
  const existing = existingSales || existingPurchase;

  const [snack, setSnack] = useState(null);

  const resolvedType =
    existing?.type ||
    (existingSales ? 'sales-invoice' : null) ||
    (existingPurchase ? 'purchase-invoice' : null) ||
    'sales-invoice';

  const [liveType, setLiveType] = useState(resolvedType);

  const displayInvoiceNumber = useMemo(() => {
    if (isEdit && existing) return existing.invoiceNumber;
    const records = liveType === 'sales-invoice' ? salesInvoices : purchaseInvoices;
    const companyRecords = records.filter((r) => r.companyId === company.id);
    return liveType === 'sales-invoice'
      ? genSalesNum(companyRecords, company, branch)
      : genPurchaseNum(companyRecords, company, branch);
  }, [isEdit, existing, liveType, salesInvoices, purchaseInvoices, company, branch]);

  const initialValues = useMemo(() => {
    if (existing) return buildDefaultValues(invoiceFields, existing);
    return buildDefaultValues(invoiceFields, null, {
      invoiceDate: dayjs().format('YYYY-MM-DD'),
      dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      invoiceNumber: displayInvoiceNumber,
      type: liveType,
    });
  }, [existing, displayInvoiceNumber, liveType]);

  const handleSubmit = (data) => {
    const type = data.type;
    const isSales = type === 'sales-invoice';
    const partyId = isSales ? data.customerId : data.vendorId;

    if (!partyId) {
      setSnack({ severity: 'error', message: `Select a ${isSales ? 'customer' : 'vendor'}` });
      return;
    }

    if (isEdit && existing) {
      const action = existingSales ? updateSalesInvoice : updatePurchaseInvoice;
      dispatch(action({ id, ...data }));
      setSnack({ severity: 'success', message: 'Invoice updated' });
      setTimeout(() => navigate(`/app/transactions/invoices/${id}`), 700);
      return;
    }

    const newId = isSales ? genSalesId() : genPurchaseId();
    const createAction = isSales ? createSalesInvoice : createPurchaseInvoice;

    const payload = {
      id: newId,
      companyId: company.id,
      branchId: branch.id,
      invoiceNumber: displayInvoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      type,
      status: 'posted',
      taxTreatment: data.taxTreatment,
      lines: [],
      charges: data.charges,
      amountPaid: data.amountPaid,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      _computedTotalPaise: 0,
    };

    if (isSales) payload.customerId = partyId;
    else {
      payload.vendorId = partyId;
      payload.vendorInvoiceNumber = data.vendorInvoiceNumber;
    }

    dispatch(createAction(payload));
    setSnack({ severity: 'success', message: 'Invoice created' });
    setTimeout(() => navigate('/app/transactions/invoices'), 700);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit ${resolvedType === 'sales-invoice' ? 'Sales' : 'Purchase'} Invoice` : 'New Invoice'}
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <ConfigForm
        fields={invoiceFields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/transactions/invoices')}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save Changes' : 'Create Invoice'}
        onValuesChange={(values) => {
          if (!isEdit && values.type && values.type !== liveType) setLiveType(values.type);
        }}
      />
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}