import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Autocomplete } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import { stockAdjustmentSchema } from '../schemas/stockAdjustmentSchema';
import { createAdjustment, generateAdjustmentId, generateAdjustmentNumber, computeOnHand } from '../inventorySlice';
import { selectAdjustmentsForCompany } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch, selectWarehousesForBranch, selectProducts } from '../../../store/selectors/contextSelectors';
import { selectMovementsInContext } from '../inventorySelectors';
import dayjs from '../../../lib/dayjs';

const REASONS = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'expired', label: 'Expired' },
  { value: 'found', label: 'Found' },
  { value: 'shrinkage', label: 'Shrinkage' },
  { value: 'sample', label: 'Sample/Demo' },
  { value: 'other', label: 'Other' },
];

export default function StockAdjustmentCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const warehouses = useSelector(selectWarehousesForBranch);
  const products = useSelector(selectProducts);
  const adjustments = useSelector(selectAdjustmentsForCompany);
  const movements = useSelector(selectMovementsInContext);
  const [snack, setSnack] = useState(null);

  const adjustmentNumber = useMemo(() => generateAdjustmentNumber(adjustments, branch), [adjustments, branch]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      adjustmentDate: dayjs().format('YYYY-MM-DD'),
      warehouseId: warehouses[0]?.id || '',
      lines: [{ productId: '', quantity: 0, reason: 'damaged', notes: '' }],
      notes: '',
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const watched = watch();

  const onSubmit = (data) => {
    const id = generateAdjustmentId();
    dispatch(createAdjustment({
      id,
      companyId: company.id,
      branchId: branch.id,
      adjustmentNumber,
      adjustmentDate: data.adjustmentDate,
      warehouseId: data.warehouseId,
      status: 'posted',
      lines: data.lines,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    }));
    setSnack({ severity: 'success', message: 'Adjustment posted' });
    setTimeout(() => navigate('/app/inventory/adjustments'), 800);
  };

  return (
    <div>
      <PageHeader title="New Stock Adjustment" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField label="Adjustment #" size="small" value={adjustmentNumber} InputProps={{ readOnly: true }} />
          <TextField label="Date" type="date" size="small" InputLabelProps={{ shrink: true }} {...control.register('adjustmentDate')} />
          <FormControl size="small">
            <InputLabel>Warehouse</InputLabel>
            <Select label="Warehouse" value={watched.warehouseId} onChange={(e) => setValue('warehouseId', e.target.value)}>
              {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3">
          <h2 className="text-sm font-semibold mb-2">Lines</h2>
          <p className="text-xs text-gray-500 mb-2">Use positive quantities to add stock, negative to remove.</p>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-right px-3 py-2">Current Stock</th>
                <th className="text-right px-3 py-2">Change (+/-)</th>
                <th className="text-left px-3 py-2">Reason</th>
                <th className="text-left px-3 py-2">Notes</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => {
                const line = watched.lines?.[i];
                const current = line?.productId
                  ? computeOnHand(movements, { productId: line.productId, warehouseId: watched.warehouseId })
                  : 0;
                return (
                  <tr key={field.id} className="border-t border-gray-100">
                    <td className="px-3 py-1.5">
                      <Autocomplete
                        size="small"
                        options={products}
                        getOptionLabel={(p) => `${p.sku} — ${p.name}`}
                        value={products.find((p) => p.id === line?.productId) || null}
                        onChange={(_, v) => setValue(`lines.${i}.productId`, v?.id || '', { shouldValidate: true })}
                        renderInput={(params) => <TextField {...params} placeholder="Select product" />}
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{current}</td>
                    <td className="px-3 py-1.5">
                      <TextField
                        type="number"
                        size="small"
                        inputProps={{ style: { textAlign: 'right' } }}
                        {...control.register(`lines.${i}.quantity`, { valueAsNumber: true })}
                        fullWidth
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Select size="small" fullWidth value={line?.reason || 'damaged'} onChange={(e) => setValue(`lines.${i}.reason`, e.target.value)}>
                        {REASONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                      </Select>
                    </td>
                    <td className="px-3 py-1.5">
                      <TextField size="small" fullWidth {...control.register(`lines.${i}.notes`)} />
                    </td>
                    <td className="px-2 py-1.5">
                      <Button size="small" onClick={() => remove(i)} disabled={fields.length === 1}><Delete fontSize="small" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pt-2 border-t border-gray-200">
            <Button size="small" startIcon={<Add />} onClick={() => append({ productId: '', quantity: 0, reason: 'damaged', notes: '' })}>Add Line</Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/inventory/adjustments')}>Cancel</Button>
          <Button variant="contained" type="submit">Post Adjustment</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}