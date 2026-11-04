import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Checkbox, FormControlLabel, Snackbar, Alert, Divider,
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { partySchema } from '../schemas/partySchema';
import { addParty } from '../../../store/slices/mastersSlice';
import { selectPartiesForCompany, selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { PARTY_TYPES, LEAD_STAGES, INDIAN_STATES } from '../partyHelpers';

export default function PartyCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const parties = useSelector(selectPartiesForCompany);
  const [snack, setSnack] = useState(null);

  const initialType = searchParams.get('type') || 'customer';

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(partySchema),
    defaultValues: {
      type: initialType,
      code: '',
      name: '',
      gstin: '',
      state: 'Tamil Nadu',
      stateCode: '33',
      phone: '',
      email: '',
      notes: '',
      active: true,
      creditLimit: 0,
      stage: 'new',
    },
    mode: 'onBlur',
  });

  const watched = watch();
  const currentType = watched.type;

  // Reset irrelevant fields when type changes
  useEffect(() => {
    if (currentType === 'lead') {
      setValue('creditLimit', 0);
      if (!watched.stage) setValue('stage', 'new');
    } else {
      setValue('stage', undefined);
    }
  }, [currentType, setValue, watched.stage]);

  const onSubmit = (data) => {
    const dup = parties.find(
      (p) => p.type === data.type && p.code.toLowerCase() === data.code.toLowerCase()
    );
    if (dup) {
      setSnack({ severity: 'error', message: `Code "${data.code}" already exists for this party type` });
      return;
    }
    const id = `PTY-${Date.now().toString(36).toUpperCase()}`;
    const payload = {
      id,
      companyId: company.id,
      branchId: branch.id,
      outstanding: 0,
      ...data,
    };
    // Strip type-irrelevant fields so stored records are clean
    if (data.type === 'lead') {
      delete payload.creditLimit;
      delete payload.outstanding;
    }
    if (data.type !== 'lead') {
      delete payload.stage;
    }
    dispatch(addParty(payload));
    setSnack({ severity: 'success', message: 'Party created' });
    setTimeout(() => navigate(`/app/masters/parties?type=${data.type}`), 700);
  };

  return (
    <div>
      <PageHeader title="New Party" description={`${company?.displayName} · ${branch?.name}`} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded p-4 space-y-4 max-w-3xl">
        {/* Type picker */}
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={currentType} onChange={(e) => setValue('type', e.target.value, { shouldValidate: true })}>
            {PARTY_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider><span className="text-xs text-gray-500">Basic Info</span></Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField label="Code *" size="small" {...register('code')} error={!!errors.code} helperText={errors.code?.message} />
          <TextField label="Name *" size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Phone" size="small" {...register('phone')} />
          <TextField label="Email" size="small" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        </div>

        {/* Customer + Vendor fields */}
        {(currentType === 'customer' || currentType === 'vendor') && (
          <>
            <Divider><span className="text-xs text-gray-500">Tax & Address</span></Divider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="GSTIN (optional)"
                size="small"
                {...register('gstin')}
                inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
                helperText="Leave blank for unregistered"
              />
              <FormControl size="small" error={!!errors.stateCode}>
                <InputLabel>State *</InputLabel>
                <Select
                  label="State *"
                  value={watched.stateCode || ''}
                  onChange={(e) => {
                    const code = e.target.value;
                    setValue('stateCode', code, { shouldValidate: true });
                    setValue('state', INDIAN_STATES.find((s) => s.code === code)?.name || '');
                  }}
                >
                  {INDIAN_STATES.map((s) => (
                    <MenuItem key={s.code} value={s.code}>{s.code} — {s.name}</MenuItem>
                  ))}
                </Select>
                {errors.stateCode && <div className="text-xs text-red-600 mt-0.5">{errors.stateCode.message}</div>}
              </FormControl>
            </div>
          </>
        )}

        {/* Customer-only fields */}
        {currentType === 'customer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField
              label="Credit Limit (₹)"
              type="number"
              size="small"
              inputProps={{ min: 0 }}
              {...register('creditLimit', { valueAsNumber: true })}
            />
          </div>
        )}

        {/* Lead-only fields */}
        {currentType === 'lead' && (
          <>
            <Divider><span className="text-xs text-gray-500">Lead Details</span></Divider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormControl size="small" error={!!errors.stage}>
                <InputLabel>Stage *</InputLabel>
                <Select
                  label="Stage *"
                  value={watched.stage || 'new'}
                  onChange={(e) => setValue('stage', e.target.value, { shouldValidate: true })}
                >
                  {LEAD_STAGES.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
                {errors.stage && <div className="text-xs text-red-600 mt-0.5">{errors.stage.message}</div>}
              </FormControl>
            </div>
          </>
        )}

        <Divider><span className="text-xs text-gray-500">Other</span></Divider>
        <TextField
          label="Notes"
          size="small"
          fullWidth
          multiline
          minRows={2}
          {...register('notes')}
        />

        <div className="flex items-center">
          <FormControlLabel
            control={<Checkbox size="small" checked={watched.active} onChange={(e) => setValue('active', e.target.checked)} />}
            label={<span className="text-sm">Active</span>}
          />
        </div>

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/masters/parties')}>Cancel</Button>
          <Button variant="contained" type="submit">Create {PARTY_TYPES.find((t) => t.value === currentType)?.label}</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}