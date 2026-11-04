import { TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel } from '@mui/material';
import CustomerSelector from './CustomerSelector';

export default function SalesDocumentHeader({ control, errors, watch, setValue, disabled, orderNumber }) {
  const taxTreatment = watch('taxTreatment');

  return (
    <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <TextField
          label="Order #"
          size="small"
          value={orderNumber || 'Auto-generated on save'}
          fullWidth
          InputProps={{ readOnly: true }}
        />
      </div>
      <div>
        <TextField
          label="Order Date"
          type="date"
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...control.register('orderDate')}
          error={!!errors.orderDate}
          helperText={errors.orderDate?.message}
          disabled={disabled}
        />
      </div>
      <div>
        <CustomerSelector
          value={watch('customerId')}
          onChange={(id) => setValue('customerId', id, { shouldValidate: true })}
          error={!!errors.customerId}
          helperText={errors.customerId?.message}
          disabled={disabled}
        />
      </div>
      <div>
        <FormControl size="small" fullWidth>
          <InputLabel>Tax Treatment</InputLabel>
          <Select
            label="Tax Treatment"
            value={taxTreatment}
            onChange={(e) => {
              setValue('taxTreatment', e.target.value);
              // Propagate to each line's taxTreatment
              const lines = watch('lines') || [];
              lines.forEach((_, i) => setValue(`lines.${i}.taxTreatment`, e.target.value));
            }}
            disabled={disabled}
          >
            <MenuItem value="intra">Intra-state (CGST + SGST)</MenuItem>
            <MenuItem value="inter">Inter-state (IGST)</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div>
        <TextField
          label="Header Discount (₹)"
          type="number"
          size="small"
          fullWidth
          inputProps={{ min: 0, step: '0.01' }}
          {...control.register('headerDiscountRupees', { valueAsNumber: true })}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center">
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={watch('applyRoundOff')}
              onChange={(e) => setValue('applyRoundOff', e.target.checked)}
              disabled={disabled}
            />
          }
          label={<span className="text-sm">Apply round-off</span>}
        />
      </div>
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextField
          label="Freight (₹)"
          type="number"
          size="small"
          inputProps={{ min: 0, step: '0.01' }}
          {...control.register('charges.freightRupees', { valueAsNumber: true })}
          disabled={disabled}
        />
        <TextField
          label="Packing (₹)"
          type="number"
          size="small"
          inputProps={{ min: 0, step: '0.01' }}
          {...control.register('charges.packingRupees', { valueAsNumber: true })}
          disabled={disabled}
        />
        <TextField
          label="Other Charges (₹)"
          type="number"
          size="small"
          inputProps={{ min: 0, step: '0.01' }}
          {...control.register('charges.otherRupees', { valueAsNumber: true })}
          disabled={disabled}
        />
      </div>
      <div className="md:col-span-3">
        <TextField
          label="Notes"
          size="small"
          fullWidth
          multiline
          minRows={2}
          {...control.register('notes')}
          disabled={disabled}
        />
      </div>
    </div>
  );
}