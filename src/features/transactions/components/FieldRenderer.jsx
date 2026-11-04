import { Controller } from 'react-hook-form';
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import AutoCompleteField from './AutoCompleteField';

/** Get a value from a possibly-dotted path (e.g. `charges.packingRupees`). */
function getDeep(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export default function FieldRenderer({ field, control, register, errors, watch, setValue, disabled }) {
  const values = watch();

  // ⬇️ Read error from nested path — `errors['charges.packingRupees']` is undefined
  const error = getDeep(errors, field.name);

  if (field.showIf && !field.showIf(values)) return null;

  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function' ? field.disabled(values) : field.disabled);

  // Read the current value via nested path for readonly fields
  const currentValue = getDeep(values, field.name);

  switch (field.type) {
    case 'text':
      return (
        <TextField
          label={field.label}
          size="small"
          {...register(field.name)}
          error={!!error}
          helperText={error?.message}
          disabled={isDisabled}
          required={field.required}
          fullWidth
        />
      );

    case 'textarea':
      return (
        <TextField
          label={field.label}
          size="small"
          fullWidth
          multiline
          minRows={2}
          {...register(field.name)}
          error={!!error}
          helperText={error?.message}
          disabled={isDisabled}
        />
      );

    case 'number':
      return (
        <TextField
          label={field.label}
          type="number"
          size="small"
          inputProps={{ min: field.min, max: field.max, step: field.step }}
          {...register(field.name, { valueAsNumber: true })}
          error={!!error}
          helperText={error?.message}
          disabled={isDisabled}
          required={field.required}
          fullWidth
        />
      );

    case 'currency':
      return (
        <TextField
          label={field.label}
          type="number"
          size="small"
          inputProps={{ min: 0, step: '0.01' }}
          {...register(field.name, { valueAsNumber: true })}
          error={!!error}
          helperText={error?.message}
          disabled={isDisabled}
          fullWidth
        />
      );

    case 'date':
      return (
        <TextField
          label={field.label}
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          {...register(field.name)}
          error={!!error}
          helperText={error?.message}
          disabled={isDisabled}
          required={field.required}
          fullWidth
        />
      );

    case 'select':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <FormControl size="small" fullWidth error={!!error} disabled={isDisabled}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                label={field.label}
                value={rhf.value ?? ''}
                onChange={(e) => rhf.onChange(e.target.value)}
                onBlur={rhf.onBlur}
              >
                {field.options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              {error && <div className="text-xs text-red-600 mt-0.5">{error.message}</div>}
            </FormControl>
          )}
        />
      );

    case 'autocomplete':
      return (
        <AutoCompleteField
          field={field}
          control={control}
          error={error}
          values={values}
          disabled={isDisabled}
        />
      );

    case 'checkbox':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={!!rhf.value}
                  onChange={(e) => rhf.onChange(e.target.checked)}
                  disabled={isDisabled}
                />
              }
              label={<span className="text-sm">{field.label}</span>}
            />
          )}
        />
      );

    case 'readonly':
      return (
        <TextField
          label={field.label}
          size="small"
          value={currentValue ?? ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />
      );

    case 'hidden':
      return null;

    default:
      return (
        <TextField
          label={field.label}
          size="small"
          {...register(field.name)}
          error={!!error}
          helperText={error?.message}
          disabled={isDisabled}
          fullWidth
        />
      );
  }
}