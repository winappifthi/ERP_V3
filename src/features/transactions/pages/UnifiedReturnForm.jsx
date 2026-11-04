import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ConfigForm from '../components/ConfigForm';
import { returnFields } from '../fieldConfig';
import { buildDefaultValues } from '../buildDefaults';
import {
  createReturn as createSalesReturn,
  updateReturn as updateSalesReturn, // Ensure this is exported from salesSlice
  generateReturnId as genSalesId,
  generateReturnNumber as genSalesNum,
} from '../../sales/salesSlice';
import {
  createReturn as createPurchaseReturn,
  updateReturn as updatePurchaseReturn, // Ensure this is exported from purchasesSlice
  generatePurchaseReturnId as genPurchaseId,
  generatePurchaseReturnNumber as genPurchaseNum,
} from '../../purchases/purchasesSlice';
import {
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function UnifiedReturnForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = !!id;

  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const salesReturns = useSelector((s) => s.sales.returns);
  const purchaseReturns = useSelector((s) => s.purchases.returns);

  // 1. Find existing record if in Edit mode
  const existingSales = isEdit ? salesReturns.find((r) => r.id === id) : null;
  const existingPurchase = isEdit ? purchaseReturns.find((r) => r.id === id) : null;
  const existing = existingSales || existingPurchase;

  const [snack, setSnack] = useState(null);

  // 2. Set the initial type based on existing record (or default)
  const resolvedType =
    existing?.type ||
    (existingSales ? 'sales-return' : null) ||
    (existingPurchase ? 'purchase-return' : null) ||
    'sales-return';

  const [liveType, setLiveType] = useState(resolvedType);

  // 3. Generate return number only for new returns
  const displayReturnNumber = useMemo(() => {
    if (isEdit && existing) return existing.returnNumber;
    
    const records = liveType === 'sales-return' ? salesReturns : purchaseReturns;
    const companyRecords = records.filter((r) => r.companyId === company.id);
    
    return liveType === 'sales-return'
      ? genSalesNum(companyRecords, company, branch)
      : genPurchaseNum(companyRecords, company, branch);
  }, [isEdit, existing, liveType, salesReturns, purchaseReturns, company, branch]);

  // 4. Build initial values from existing record or defaults
  const initialValues = useMemo(() => {
    if (existing) return buildDefaultValues(returnFields, existing);
    
    return buildDefaultValues(returnFields, null, {
      returnDate: dayjs().format('YYYY-MM-DD'),
      returnNumber: displayReturnNumber,
      type: liveType,
    });
  }, [existing, displayReturnNumber, liveType]);

  const handleSubmit = (data) => {
    const type = data.type;
    const isSales = type === 'sales-return';
    const partyId = isSales ? data.customerId : data.vendorId;

    if (!partyId) {
      setSnack({ severity: 'error', message: `Select a ${isSales ? 'customer' : 'vendor'}` });
      return;
    }

    // --- EDIT MODE ---
    if (isEdit && existing) {
      const action = existingSales ? updateSalesReturn : updatePurchaseReturn;
      
      dispatch(action({
        id,
        ...data,
        status: existing.status, // Preserve current status
      }));
      
      setSnack({ severity: 'success', message: 'Return updated' });
      setTimeout(() => navigate('/app/transactions/returns'), 700);
      return;
    }

    // --- CREATE MODE ---
    const newId = isSales ? genSalesId() : genPurchaseId();
    const payload = {
      id: newId,
      companyId: company.id,
      branchId: branch.id,
      returnNumber: displayReturnNumber,
      returnDate: data.returnDate,
      type,
      [isSales ? 'customerId' : 'vendorId']: partyId,
      sourceInvoiceId: data.sourceInvoiceId || '',
      status: 'posted', // Or 'pending' if you want approval flow
      taxTreatment: 'intra',
      lines: [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      _computedTotalPaise: 0,
    };

    if (isSales) {
      dispatch(createSalesReturn({ ...payload, restock: data.restock }));
    } else {
      dispatch(createPurchaseReturn({ ...payload, returnToVendor: true }));
    }

    setSnack({ severity: 'success', message: 'Return posted' });
    setTimeout(() => navigate('/app/transactions/returns'), 700);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Return' : 'New Return'}
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <ConfigForm
        fields={returnFields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/transactions/returns')}
        submitLabel={isEdit ? 'Save Changes' : 'Post Return'}
        isEdit={isEdit}
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