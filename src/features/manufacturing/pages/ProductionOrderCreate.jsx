import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Autocomplete, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { productionOrderSchema } from '../schemas/productionOrderSchema';
import { createProductionOrder, generateProductionOrderId, generateOrderNumber } from '../manufacturingSlice';
import { selectBomsInContext, selectWorkCentersInContext, selectProductionOrdersForCompany } from '../manufacturingSelectors';
import { selectCurrentCompany, selectCurrentBranch, selectProducts } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function ProductionOrderCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const boms = useSelector(selectBomsInContext);
  const workCenters = useSelector(selectWorkCentersInContext);
  const orders = useSelector(selectProductionOrdersForCompany);
  const products = useSelector(selectProducts);
  const [snack, setSnack] = useState(null);

  const orderNumber = useMemo(() => generateOrderNumber(orders, branch), [orders, branch]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      bomId: '',
      plannedQuantity: 1,
      startDate: dayjs().format('YYYY-MM-DD'),
      expectedCompletionDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
      workCenterId: workCenters[0]?.id || '',
      notes: '',
    },
    mode: 'onBlur',
  });

  const watched = watch();
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));
  const selectedBom = boms.find((b) => b.id === watched.bomId);

  const onSubmit = (data) => {
    const id = generateProductionOrderId();
    const bom = boms.find((b) => b.id === data.bomId);
    dispatch(createProductionOrder({
      id,
      companyId: company.id,
      branchId: branch.id,
      orderNumber,
      bomId: data.bomId,
      outputProductId: bom.outputProductId,
      plannedQuantity: data.plannedQuantity,
      completedQuantity: 0,
      startDate: data.startDate,
      expectedCompletionDate: data.expectedCompletionDate,
      status: 'planned',
      workCenterId: data.workCenterId,
      materialIssues: [],
      completions: [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
    }));
    setSnack({ severity: 'success', message: 'Production order created' });
    setTimeout(() => navigate('/app/manufacturing/production-orders'), 800);
  };

  return (
    <div>
      <PageHeader title="New Production Order" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField label="Order #" size="small" value={orderNumber} InputProps={{ readOnly: true }} />
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 block mb-1">BOM *</label>
            <Autocomplete
              size="small"
              options={boms.filter((b) => b.status === 'active')}
              getOptionLabel={(b) => `${productById[b.outputProductId]?.name || '?'} — ${b.version}`}
              value={boms.find((b) => b.id === watched.bomId) || null}
              onChange={(_, v) => setValue('bomId', v?.id || '', { shouldValidate: true })}
              renderInput={(params) => <TextField {...params} error={!!errors.bomId} helperText={errors.bomId?.message} />}
            />
          </div>
          <TextField label="Planned Quantity" type="number" size="small" inputProps={{ min: 1 }} {...register('plannedQuantity', { valueAsNumber: true })} error={!!errors.plannedQuantity} helperText={errors.plannedQuantity?.message} />
          <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }} {...register('startDate')} />
          <TextField label="Expected Completion" type="date" size="small" InputLabelProps={{ shrink: true }} {...register('expectedCompletionDate')} />
          <FormControl size="small">
            <InputLabel>Work Center</InputLabel>
            <Select label="Work Center" value={watched.workCenterId} onChange={(e) => setValue('workCenterId', e.target.value)}>
              {workCenters.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
          <div className="md:col-span-3">
            <TextField label="Notes" size="small" fullWidth multiline minRows={2} {...register('notes')} />
          </div>
        </div>

        {selectedBom && (
          <div className="bg-white border border-gray-200 rounded p-3">
            <h2 className="text-sm font-semibold mb-2">Material Requirements Preview</h2>
            <p className="text-xs text-gray-500 mb-2">Estimated consumption for {watched.plannedQuantity} unit(s):</p>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2">Component</th>
                  <th className="text-right px-3 py-2">Per Unit</th>
                  <th className="text-right px-3 py-2">Total Required</th>
                </tr>
              </thead>
              <tbody>
                {selectedBom.lines.map((l, i) => {
                  const perUnit = l.quantity * (1 + (l.scrapPercent || 0) / 100);
                  const total = perUnit * watched.plannedQuantity * (1 + (selectedBom.scrapPercent || 0) / 100);
                  return (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2">{productById[l.productId]?.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{perUnit.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{Math.ceil(total * 100) / 100}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/manufacturing/production-orders')}>Cancel</Button>
          <Button variant="contained" type="submit">Create Order</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}