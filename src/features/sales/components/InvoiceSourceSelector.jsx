import { Autocomplete, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectOrdersForCompany } from '../salesSelectors';

export default function InvoiceSourceSelector({ value, onChange, customerId, disabled }) {
  const orders = useSelector(selectOrdersForCompany);

  // Only show approved/completed orders for the selected customer
  const eligible = orders.filter(
    (o) =>
      (!customerId || o.customerId === customerId) &&
      (o.status === 'approved' || o.status === 'completed')
  );

  const selected = eligible.find((o) => o.id === value) || null;

  return (
    <Autocomplete
      size="small"
      options={eligible}
      getOptionLabel={(o) => `${o.orderNumber} — ${o.status}`}
      value={selected}
      onChange={(_, v) => onChange(v?.id || '')}
      disabled={disabled || !customerId}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Source Sales Order"
          helperText={!customerId ? 'Select customer first' : 'Optional — invoice against an approved order'}
        />
      )}
      isOptionEqualToValue={(o, v) => o.id === v.id}
    />
  );
}