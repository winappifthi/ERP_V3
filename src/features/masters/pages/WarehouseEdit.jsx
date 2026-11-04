import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { warehouseSchema } from '../schemas/warehouseSchema';
import { updateWarehouse } from '../../../store/slices/mastersSlice';
import { selectWarehouses } from '../../../store/selectors/contextSelectors';

export default function WarehouseEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const warehouses = useSelector(selectWarehouses);
  const warehouse = warehouses.find((w) => w.id === id);
  const [snack, setSnack] = useState(null);

  const defaultValues = useMemo(() => (warehouse ? { ...warehouse } : null), [warehouse]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues,
    mode: 'onBlur',
  });

  if (!warehouse) {
    return (
      <div>
        <PageHeader title="Warehouse not found" />
        <Button variant="outlined" onClick={() => navigate('/app/masters/warehouses')}>Back</Button>
      </div>
    );
  }

  const onSubmit = (data) => {
    dispatch(updateWarehouse({ id, ...data }));
    setSnack({ severity: 'success', message: 'Warehouse updated' });
    setTimeout(() => navigate(`/app/masters/warehouses/${id}`), 700);
  };

  return (
    <div>
      <PageHeader title={`Edit ${warehouse.name}`} description={warehouse.code} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded p-4 space-y-3 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField label="Code *" size="small" {...register('code')} error={!!errors.code} helperText={errors.code?.message} />
          <TextField label="Name *" size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Branch ID" size="small" value={watch('branchId')} InputProps={{ readOnly: true }} />
          <FormControl size="small">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={watch('type')} onChange={(e) => setValue('type', e.target.value)}>
              <MenuItem value="retail">Retail</MenuItem>
              <MenuItem value="distribution">Distribution</MenuItem>
              <MenuItem value="raw-material">Raw Material</MenuItem>
              <MenuItem value="finished-goods">Finished Goods</MenuItem>
            </Select>
          </FormControl>
          <div className="flex items-center pt-1">
            <FormControlLabel
              control={<Checkbox size="small" checked={watch('active')} onChange={(e) => setValue('active', e.target.checked)} />}
              label={<span className="text-sm">Active</span>}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate(`/app/masters/warehouses/${id}`)}>Cancel</Button>
          <Button variant="contained" type="submit">Save Changes</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}