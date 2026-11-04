import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ConfigForm from '../components/ConfigForm';
import { grnFields } from '../fieldConfig';
import { buildDefaultValues } from '../buildDefaults';
import {
  createGrn,
  updateGrn,
  generateGrnId,
  generateGrnNumber,
} from '../../purchases/purchasesSlice';
import {
  createDelivery,
  updateDelivery,
  generateDeliveryId,
  generateDeliveryNumber,
} from '../../sales/salesSlice';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function UnifiedGrnForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  
  // 1. Get lists from Redux
  const grns = useSelector((s) => s.purchases.grns || []);
  const gdns = useSelector((s) => s.sales.gdns || []);

  // 2. Find existing record if editing
  const existingGrn = isEdit ? grns.find((g) => g.id === id) : null;
  const existingGdn = isEdit ? gdns.find((g) => g.id === id) : null;
  const existing = existingGrn || existingGdn;

  const [snack, setSnack] = useState(null);

  // 3. Determine the type
  const resolvedType =
    existing?.type ||
    (existingGrn ? 'grn' : null) ||
    (existingGdn ? 'gdn' : null) ||
    'grn';

  const [liveType, setLiveType] = useState(resolvedType);

  // 4. Generate number only for new records
  const displayNumber = useMemo(() => {
    if (isEdit && existing) return existing.receiptNumber || existing.deliveryNumber;
    
    const records = liveType === 'grn' ? grns : gdns;
    const companyRecords = records.filter((r) => r.companyId === company.id);
    return liveType === 'grn'
      ? generateGrnNumber(companyRecords, company, branch)
      : generateDeliveryNumber(companyRecords, company, branch);
  }, [isEdit, existing, liveType, grns, gdns, company, branch]);

  // 5. Build Initial Values
  const initialValues = useMemo(() => {
    if (existing) {
      const defaults = buildDefaultValues(grnFields, existing);
      
      // Map the specific fields so the form displays them correctly
      defaults.number = existing.receiptNumber || existing.deliveryNumber;
      defaults.date = existing.receiptDate || existing.deliveryDate;
      defaults.type = existing.type || resolvedType;
      
      return defaults;
    }
    
    return buildDefaultValues(grnFields, null, {
      date: dayjs().format('YYYY-MM-DD'),
      number: displayNumber,
      type: liveType,
    });
  }, [existing, displayNumber, liveType, resolvedType]);

  const handleSubmit = (data) => {
    const isGrn = data.type === 'grn';
    const partyId = isGrn ? data.vendorId : data.customerId;

    if (!partyId) {
      setSnack({ severity: 'error', message: `Select a ${isGrn ? 'vendor' : 'customer'}` });
      return;
    }
    if (!data.warehouseId) {
      setSnack({ severity: 'error', message: 'Select a warehouse' });
      return;
    }

    // --- EDIT MODE ---
    if (isEdit && existing) {
      const action = existingGrn ? updateGrn : updateDelivery;
      
      const updates = {
        id,
        ...data,
        type: existing.type, // preserve original type
        status: existing.status, // preserve status
      };

      if (isGrn) {
        updates.receiptNumber = data.number;
        updates.receiptDate = data.date;
        updates.vendorId = partyId;
      } else {
        updates.deliveryNumber = data.number;
        updates.deliveryDate = data.date;
        updates.customerId = partyId;
      }

      dispatch(action(updates));
      setSnack({ severity: 'success', message: 'Record updated' });
      setTimeout(() => navigate(`/app/transactions/grn/${id}`), 700);
      return;
    }

    // --- CREATE MODE ---
    const newId = isGrn ? generateGrnId() : generateDeliveryId();
    
    const payload = {
      id: newId,
      companyId: company.id,
      branchId: branch.id,
      type: data.type,
      status: 'draft', // Save as draft for posting
      warehouseId: data.warehouseId,
      sourceOrderId: data.sourceOrderId || '',
      notes: data.notes,
      lines: [],
      createdAt: new Date().toISOString(),
    };

    if (isGrn) {
      payload.receiptNumber = displayNumber;
      payload.receiptDate = data.date;
      payload.vendorId = partyId;
      dispatch(createGrn(payload));
    } else {
      payload.deliveryNumber = displayNumber;
      payload.deliveryDate = data.date;
      payload.customerId = partyId;
      dispatch(createDelivery(payload));
    }

    setSnack({ severity: 'success', message: `${isGrn ? 'Goods Receipt' : 'Goods Delivery'} created` });
    setTimeout(() => navigate('/app/transactions/grn'), 700);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Goods Receipt / Delivery' : 'New Goods Receipt / Delivery'}
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <ConfigForm
        fields={grnFields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/transactions/grn')}
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