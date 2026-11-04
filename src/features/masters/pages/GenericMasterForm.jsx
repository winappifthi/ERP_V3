import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ConfigForm from '../../transactions/components/ConfigForm';
import { buildDefaultValues } from '../../transactions/buildDefaults';
import { MASTER_CONFIGS } from '../masterConfig';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';

import {
  addParty, updateParty,
  addProduct, updateProduct,
  addCategory, updateCategory,
  addUom, updateUom,
  addBarcode, updateBarcode,
  addWarehouse, updateWarehouse,
  addBin, updateBin,
} from '../../../store/slices/mastersSlice';

const ACTION_MAP = {
  parties: { create: addParty, update: updateParty },
  items: { create: addProduct, update: updateProduct },
  categories: { create: addCategory, update: updateCategory },
  uom: { create: addUom, update: updateUom },
  barcodes: { create: addBarcode, update: updateBarcode },
  warehouses: { create: addWarehouse, update: updateWarehouse },
  bins: { create: addBin, update: updateBin },
};

export default function GenericMasterForm() {
  const { masterType, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const company = useSelector(selectCurrentCompany);
  const [snack, setSnack] = useState(null);

  const isEdit = !!id;
  const config = MASTER_CONFIGS[masterType];
  
  // Get type from URL (for parties)
  const typeParam = searchParams.get('type') || config?.defaultType;
  
  // Find existing record for edit
  const existing = useSelector((state) => {
    if (!isEdit || !config) return null;
    const rows = config.getRows(state, typeParam);
    return rows.find((r) => r.id === id);
  });

  const fields = useMemo(
    () => config ? config.getFormFields(typeParam) : [],
    [config, typeParam]
  );

  const initialValues = useMemo(() => {
    if (!config) return {};
    if (existing) return buildDefaultValues(fields, existing);
    return buildDefaultValues(fields, null, {
      ...config.defaultValues,
      type: typeParam,
    });
  }, [config, fields, existing, typeParam]);

  if (!config) {
    return <div className="p-8 text-center text-red-500">Invalid master type</div>;
  }

  const handleSubmit = (data) => {
    const actions = ACTION_MAP[masterType];
    if (!actions) return;

    if (isEdit && existing) {
      dispatch(actions.update({ id, ...data }));
      setSnack({ severity: 'success', message: 'Updated successfully' });
    } else {
      const newId = `${masterType.slice(0, 3).toUpperCase()}-${Date.now()}`;
      dispatch(actions.create({
        id: newId,
        companyId: company?.id,
        ...data,
        type: typeParam,
      }));
      setSnack({ severity: 'success', message: 'Created successfully' });
    }

    setTimeout(() => navigate(`/app/masters/${masterType}`), 700);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit ${config.singular}` : `New ${config.singular}`}
        description={isEdit ? existing?.name : config.description}
      />
      <ConfigForm
        fields={fields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/app/masters/${masterType}`)}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save Changes' : 'Create'}
      />
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : null}
      </Snackbar>
    </div>
  );
}