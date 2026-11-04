import { Autocomplete, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCustomersForCompany } from '../../../store/selectors/contextSelectors';

export default function CustomerSelector({ value, onChange, error, helperText, disabled }) {
  const customers = useSelector(selectCustomersForCompany);
  const selected = customers.find((c) => c.id === value) || null;

  return (
    <Autocomplete
      size="small"
      options={customers}
      getOptionLabel={(o) => `${o.code} — ${o.name}`}
      value={selected}
      onChange={(_, v) => onChange(v?.id || '')}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Customer"
          error={!!error}
          helperText={helperText}
          required
        />
      )}
      isOptionEqualToValue={(o, v) => o.id === v.id}
    />
  );
}