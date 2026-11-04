import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button, TextField, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { workCenterSchema } from '../schemas/workCenterSchema';
import { createWorkCenter, generateWorkCenterId } from '../manufacturingSlice';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';

export default function WorkCenterCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const [snack, setSnack] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(workCenterSchema),
    defaultValues: { code: '', name: '', capacityPerDay: 10, hourlyRate: 0 },
  });

  const onSubmit = (data) => {
    dispatch(createWorkCenter({ id: generateWorkCenterId(), companyId: company.id, ...data, active: true }));
    setSnack({ severity: 'success', message: 'Work center created' });
    setTimeout(() => navigate('/app/manufacturing/work-centers'), 600);
  };

  return (
    <div>
      <PageHeader title="New Work Center" />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
        <TextField label="Code" size="small" {...register('code')} error={!!errors.code} helperText={errors.code?.message} />
        <TextField label="Name" size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <TextField label="Capacity per Day" type="number" size="small" {...register('capacityPerDay', { valueAsNumber: true })} error={!!errors.capacityPerDay} helperText={errors.capacityPerDay?.message} />
        <TextField label="Hourly Rate (₹)" type="number" size="small" inputProps={{ min: 0, step: '0.01' }} {...register('hourlyRate', { valueAsNumber: true })} error={!!errors.hourlyRate} helperText={errors.hourlyRate?.message} />
        <div className="md:col-span-2 flex justify-end gap-2">
          <Button variant="text" onClick={() => navigate('/app/manufacturing/work-centers')}>Cancel</Button>
          <Button variant="contained" type="submit">Create</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}