import { Autocomplete, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectVendorsForCompany } from '../../../store/selectors/contextSelectors';

export default function VendorSelector({ value, onChange, error, helperText, disabled }) {
  const vendors = useSelector(selectVendorsForCompany);
  const selected = vendors.find((v) => v.id === value) || null;
  return (
    <Autocomplete
      size="small"
      options={vendors}
      getOptionLabel={(o) => `${o.code} — ${o.name}`}
      value={selected}
      onChange={(_, v) => onChange(v?.id || '')}
      disabled={disabled}
      renderInput={(params) => <TextField {...params} label="Vendor" required error={!!error} helperText={helperText} />}
      isOptionEqualToValue={(o, v) => o.id === v.id}
    />
  );
}