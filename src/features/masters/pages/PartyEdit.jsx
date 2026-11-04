import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Checkbox, FormControlLabel, Snackbar, Alert, Divider,
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { partySchema } from '../schemas/partySchema';
import { updateParty } from '../../../store/slices/mastersSlice';
import { selectPartiesForCompany } from '../../../store/selectors/contextSelectors';
import { PARTY_TYPES, LEAD_STAGES, INDIAN_STATES } from '../partyHelpers';

export default function PartyEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const parties = useSelector(selectPartiesForCompany);
  const party = parties.find((p) => p.id === id);
  const [snack, setSnack] = useState(null);

  const defaultValues = useMemo(
    () => (party ? {
      type: party.type,
      code: party.code,
      name: party.name,
      gstin: party.gstin || '',
      state: party.state || 'Tamil Nadu',
      stateCode: party.stateCode || '33',
      phone: party.phone || '',
      email: party.email || '',
      notes: party.notes || '',
      active: party.active ?? true,
      creditLimit: party.creditLimit || 0,
      stage: party.stage || 'new',
    } : null),
    [party]
  );

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(partySchema),
    defaultValues,
    mode: 'onBlur',
  });

  const watched = watch();
  const currentType = watched.type;

  useEffect(() => {
    if (currentType === 'lead') setValue('creditLimit', 0);
    else setValue('stage', undefined);
  }, [currentType, setValue]);

  if (!party) {
    return <div><PageHeader title="Party not found" /><Button variant="outlined" onClick={() => navigate('/app/masters/parties')}>Back</Button></div>;
  }

  const onSubmit = (data) => {
    const payload = { id, ...data };
    if (data.type === 'lead') { delete payload.creditLimit; }
    else { delete payload.stage; }
    dispatch(updateParty(payload));
    setSnack({ severity: 'success', message: 'Party updated' });
    setTimeout(() => navigate(`/app/masters/parties/${id}`), 700);
  };

  return (
    <div>
      <PageHeader title={`Edit ${party.name}`} description={party.code} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded p-4 space-y-4 max-w-3xl">
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={currentType} onChange={(e) => setValue('type', e.target.value, { shouldValidate: true })}>
            {PARTY_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </Select>
        </FormControl>

        <Divider><span className="text-xs text-gray-500">Basic Info</span></Divider>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField label="Code *" size="small" {...register('code')} error={!!errors.code} helperText={errors.code?.message} />
          <TextField label="Name *" size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Phone" size="small" {...register('phone')} />
          <TextField label="Email" size="small" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        </div>

        {(currentType === 'customer' || currentType === 'vendor') && (
          <>
            <Divider><span className="text-xs text-gray-500">Tax & Address</span></Divider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField label="GSTIN (optional)" size="small" {...register('gstin')} inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }} />
              <FormControl size="small" error={!!errors.stateCode}>
                <InputLabel>State *</InputLabel>
                <Select label="State *" value={watched.stateCode || ''} onChange={(e) => {
                  const code = e.target.value;
                  setValue('stateCode', code, { shouldValidate: true });
                  setValue('state', INDIAN_STATES.find((s) => s.code === code)?.name || '');
                }}>
                  {INDIAN_STATES.map((s) => <MenuItem key={s.code} value={s.code}>{s.code} — {s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </>
        )}

        {currentType === 'customer' && (
          <TextField label="Credit Limit (₹)" type="number" size="small" inputProps={{ min: 0 }} {...register('creditLimit', { valueAsNumber: true })} />
        )}

        {currentType === 'lead' && (
          <FormControl size="small" error={!!errors.stage}>
            <InputLabel>Stage *</InputLabel>
            <Select label="Stage *" value={watched.stage || 'new'} onChange={(e) => setValue('stage', e.target.value, { shouldValidate: true })}>
              {LEAD_STAGES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </Select>
            {errors.stage && <div className="text-xs text-red-600 mt-0.5">{errors.stage.message}</div>}
          </FormControl>
        )}

        <TextField label="Notes" size="small" fullWidth multiline minRows={2} {...register('notes')} />
        <FormControlLabel control={<Checkbox size="small" checked={watched.active} onChange={(e) => setValue('active', e.target.checked)} />} label={<span className="text-sm">Active</span>} />

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate(`/app/masters/parties/${id}`)}>Cancel</Button>
          <Button variant="contained" type="submit">Save Changes</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}