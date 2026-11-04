import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ConfigForm from '../../transactions/components/ConfigForm'; // Reuse the generic ConfigForm
import { buildDefaultValues } from '../../transactions/buildDefaults'; // Reuse the helper
import { 
  addCategory, updateCategory, generateCategoryId,
  addUom, updateUom, generateUomId 
} from '../inventoryMasterSlice';
import { 
  categoryConfig, uomConfig 
} from '../inventoryConfig.jsx';

const CONFIG_MAP = {
  'categories': categoryConfig,
  'uom': uomConfig,
};

export default function DynamicInventoryForm() {
  const { pageType, id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [snack, setSnack] = useState(null);

  const config = CONFIG_MAP[pageType];

  // Find existing record if editing
  const existing = useSelector((state) => {
    if (!isEdit || !config) return null;
    const rows = config.getRows(state);
    return rows.find((r) => r.id === id);
  });

  const initialValues = useMemo(() => {
    if (existing) return buildDefaultValues(config.formFields, existing);
    return buildDefaultValues(config.formFields, null, config.defaultValues || {});
  }, [existing, config]);

  const handleSubmit = (data) => {
    if (isEdit && existing) {
      // --- EDIT MODE ---
      const action = pageType === 'categories' ? updateCategory : updateUom;
      dispatch(action({ id, ...data }));
      setSnack({ severity: 'success', message: 'Updated successfully' });
    } else {
      // --- CREATE MODE ---
      const newId = pageType === 'categories' ? generateCategoryId() : generateUomId();
      const action = pageType === 'categories' ? addCategory : addUom;
      dispatch(action({ id: newId, ...data }));
      setSnack({ severity: 'success', message: 'Created successfully' });
    }
    setTimeout(() => navigate(`/app/inventory/${pageType}`), 700);
  };

  if (!config) return <div>Invalid configuration</div>;

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit ${config.singular}` : `New ${config.singular}`}
      />
      <ConfigForm
        fields={config.formFields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/app/inventory/${pageType}`)}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save Changes' : 'Create'}
      />
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}