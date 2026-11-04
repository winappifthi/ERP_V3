import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export const INDIAN_STATES = [
  { code: '33', name: 'Tamil Nadu' },
  { code: '29', name: 'Karnataka' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '36', name: 'Telangana' },
  { code: '32', name: 'Kerala' },
  { code: '24', name: 'Gujarat' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
];

export default function GstinFields({ control, errors, setValue, watch }) {
  const stateCode = watch('stateCode');
  const state = INDIAN_STATES.find((s) => s.code === stateCode)?.name || '';

  return (
    <>
      <TextField
        label="GSTIN (optional)"
        size="small"
        {...control.register('gstin')}
        inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
        error={!!errors.gstin}
        helperText={errors.gstin?.message || 'Leave blank for unregistered'}
      />
      <FormControl size="small" error={!!errors.stateCode}>
        <InputLabel>State</InputLabel>
        <Select
          label="State"
          value={stateCode || ''}
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
        {errors.stateCode && (
          <div className="text-xs text-red-600 mt-0.5">{errors.stateCode.message}</div>
        )}
      </FormControl>
      <TextField label="State Name" size="small" value={state} InputProps={{ readOnly: true }} />
    </>
  );
}