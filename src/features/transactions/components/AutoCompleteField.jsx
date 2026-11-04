import { Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Autocomplete, TextField } from '@mui/material';

export default function AutoCompleteField({ field, control, error, values, disabled }) {
  const options = useSelector((state) => field.selector(state));
  const currentValue = values[field.name];
  const selected = options.find((o) => o.id === currentValue) || null;

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: rhf }) => {
        // Prefer RHF's value to avoid one-render lag after reset
        const selectedFromRHF = options.find((o) => o.id === rhf.value) || selected;

        return (
          <Autocomplete
            size="small"
            options={options}
            getOptionLabel={field.getOptionLabel || ((o) => o.name || o.id)}
            value={selectedFromRHF}
            onChange={(_, v) => rhf.onChange(v?.id || '')}
            onBlur={rhf.onBlur}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                required={field.required}
                error={!!error}
                helperText={error?.message}
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />
        );
      }}
    />
  );
}