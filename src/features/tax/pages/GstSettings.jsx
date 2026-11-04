import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { selectCurrentTaxSettings } from '../taxSelectors';
import { updateSettings } from '../taxSlice';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

const STATES = [
  { code: '33', name: 'Tamil Nadu' },
  { code: '29', name: 'Karnataka' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '36', name: 'Telangana' },
  { code: '32', name: 'Kerala' },
];

export default function GstSettings() {
  const dispatch = useDispatch();
  const company = useSelector(selectCurrentCompany);
  const settings = useSelector(selectCurrentTaxSettings);
  const [form, setForm] = useState(settings || {});
  const [snack, setSnack] = useState(null);

  useEffect(() => { setForm(settings || {}); }, [settings]);

  if (!settings) {
    return <div><PageHeader title="GST Settings" /><div className="p-6 bg-white border rounded text-sm text-gray-500">No GST settings configured for this company.</div></div>;
  }

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    dispatch(updateSettings(form));
    setSnack({ severity: 'success', message: 'GST settings updated' });
  };

  const stateObj = STATES.find((s) => s.code === form.stateCode);

  return (
    <div>
      <PageHeader
        title="GST Settings"
        description={company?.displayName}
        actions={<Button variant="contained" onClick={handleSave}>Save Changes</Button>}
      />
      <div className="bg-white border border-gray-200 rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField label="Legal Name" size="small" value={form.legalName || ''} onChange={(e) => update('legalName', e.target.value)} />
          <TextField label="Trade Name" size="small" value={form.tradeName || ''} onChange={(e) => update('tradeName', e.target.value)} />
          <TextField label="PAN" size="small" value={form.pan || ''} onChange={(e) => update('pan', e.target.value)} inputProps={{ style: { textTransform: 'uppercase' } }} />
          <TextField label="GSTIN" size="small" value={form.gstin || ''} onChange={(e) => update('gstin', e.target.value)} inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }} />
          <FormControl size="small">
            <InputLabel>Registration Type</InputLabel>
            <Select label="Registration Type" value={form.registrationType || 'regular'} onChange={(e) => update('registrationType', e.target.value)}>
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="composition">Composition</MenuItem>
              <MenuItem value="unregistered">Unregistered</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>State</InputLabel>
            <Select label="State" value={form.stateCode || ''} onChange={(e) => { update('stateCode', e.target.value); update('state', STATES.find((s) => s.code === e.target.value)?.name || ''); }}>
              {STATES.map((s) => <MenuItem key={s.code} value={s.code}>{s.code} — {s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Filing Frequency</InputLabel>
            <Select label="Filing Frequency" value={form.filingFrequency || 'monthly'} onChange={(e) => update('filingFrequency', e.target.value)}>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
            </Select>
          </FormControl>
          <TextField label="GSTIN Verified On" size="small" value={formatDate(form.gstinVerifiedOn)} InputProps={{ readOnly: true }} />
          <TextField label="State" size="small" value={stateObj?.name || form.state || ''} InputProps={{ readOnly: true }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <FormControlLabel
            control={<Switch checked={form.reverseChargeEnabled || false} onChange={(e) => update('reverseChargeEnabled', e.target.checked)} />}
            label={<span className="text-sm">Reverse charge applicable</span>}
          />
          <FormControlLabel
            control={<Switch checked={form.eInvoiceEnabled || false} onChange={(e) => update('eInvoiceEnabled', e.target.checked)} />}
            label={<span className="text-sm">e-Invoice enabled</span>}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
          <strong>Note:</strong> This is a frontend prototype. GSTIN validation, e-invoice IRN generation, and statutory filing are not implemented. Configuration affects the transaction screens (place of supply, HSN visibility) but not the underlying arithmetic.
        </div>
      </div>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}