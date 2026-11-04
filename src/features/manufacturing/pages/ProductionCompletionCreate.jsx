import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Autocomplete, Snackbar, Alert } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import { productionCompletionSchema } from '../schemas/productionCompletionSchema';
import { selectProductionOrderById } from '../manufacturingSelectors';
import { addCompletion, generateCompletionId } from '../manufacturingSlice';
import { addMovements } from '../../inventory/inventorySlice';
import { selectProducts, selectWarehousesForBranch, selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function ProductionCompletionCreate() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector(selectProductionOrderById(id));
  const products = useSelector(selectProducts);
  const warehouses = useSelector(selectWarehousesForBranch);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [snack, setSnack] = useState(null);

  const defaultWh = warehouses.find((w) => w.type === 'finished-goods')?.id || warehouses[0]?.id || '';
  const remaining = order ? order.plannedQuantity - (order.completedQuantity || 0) : 0;

  const { control, handleSubmit, watch, setValue, register, formState: { errors } } = useForm({
    resolver: zodResolver(productionCompletionSchema),
    defaultValues: {
      completionDate: dayjs().format('YYYY-MM-DD'),
      completedQuantity: remaining,
      scrapQuantity: 0,
      byProductLines: [],
      warehouseId: defaultWh,
      notes: '',
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'byProductLines' });
  const watched = watch();
  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  if (!order) return <div><PageHeader title="Not found" /><Button onClick={() => navigate(-1)} variant="outlined">Back</Button></div>;

  const onSubmit = (data) => {
    const completionId = generateCompletionId();
    const completion = {
      id: completionId,
      completionDate: data.completionDate,
      completedQuantity: data.completedQuantity,
      scrapQuantity: data.scrapQuantity || 0,
      warehouseId: data.warehouseId,
      byProducts: data.byProductLines?.filter((b) => b.productId && b.quantity > 0) || [],
      notes: data.notes,
    };
    dispatch(addCompletion({ orderId: id, completion }));

    // Generate inventory movements: finished goods IN
    const movements = [{
      companyId: company.id,
      branchId: branch.id,
      warehouseId: data.warehouseId,
      productId: order.outputProductId,
      quantity: data.completedQuantity,
      movementType: 'production-receipt',
      movementDate: data.completionDate,
      referenceType: 'production-order',
      referenceId: order.id,
    }];

    // Scrap (if tracked as a product, would add a movement; here we reduce FG output instead)
    // By-products
    for (const bp of completion.byProducts) {
      movements.push({
        companyId: company.id,
        branchId: branch.id,
        warehouseId: data.warehouseId,
        productId: bp.productId,
        quantity: bp.quantity,
        movementType: 'production-receipt',
        movementDate: data.completionDate,
        referenceType: 'production-order',
        referenceId: order.id,
      });
    }

    dispatch(addMovements(movements));
    setSnack({ severity: 'success', message: 'Completion recorded — finished goods received' });
    setTimeout(() => navigate(`/app/manufacturing/production-orders/${id}`), 800);
  };

  return (
    <div>
      <PageHeader
        title="Record Production Completion"
        description={`${order.orderNumber} · ${remaining} units remaining`}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField label="Completion Date" type="date" size="small" InputLabelProps={{ shrink: true }} {...register('completionDate')} />
          <TextField label="Completed Quantity" type="number" size="small" inputProps={{ min: 1, max: remaining }} {...register('completedQuantity', { valueAsNumber: true })} error={!!errors.completedQuantity} helperText={errors.completedQuantity?.message || `Max: ${remaining}`} />
          <TextField label="Scrap Quantity" type="number" size="small" inputProps={{ min: 0 }} {...register('scrapQuantity', { valueAsNumber: true })} />
          <div className="md:col-span-2">
            <FormControl size="small" fullWidth>
              <InputLabel>Finished Goods Warehouse</InputLabel>
              <Select label="Finished Goods Warehouse" value={watched.warehouseId} onChange={(e) => setValue('warehouseId', e.target.value)}>
                {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3">
          <h2 className="text-sm font-semibold mb-2">By-Products / Scrap Items (optional)</h2>
          <p className="text-xs text-gray-500 mb-2">Add any usable by-products (e.g., metal offcuts) that should be stocked.</p>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-right px-3 py-2" style={{ width: '20%' }}>Quantity</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => {
                const line = watched.byProductLines?.[i];
                return (
                  <tr key={field.id} className="border-t border-gray-100">
                    <td className="px-3 py-1.5">
                      <Autocomplete
                        size="small"
                        options={products}
                        getOptionLabel={(p) => `${p.sku} — ${p.name}`}
                        value={products.find((p) => p.id === line?.productId) || null}
                        onChange={(_, v) => setValue(`byProductLines.${i}.productId`, v?.id || '')}
                        renderInput={(params) => <TextField {...params} placeholder="Select" />}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <TextField type="number" size="small" inputProps={{ min: 0, style: { textAlign: 'right' } }} {...register(`byProductLines.${i}.quantity`, { valueAsNumber: true })} fullWidth />
                    </td>
                    <td className="px-2 py-1.5">
                      <Button size="small" onClick={() => remove(i)}><Delete fontSize="small" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pt-2 border-t border-gray-200">
            <Button size="small" startIcon={<Add />} onClick={() => append({ productId: '', quantity: 0 })}>Add By-Product</Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-4">
          <TextField label="Notes" size="small" fullWidth multiline minRows={2} {...register('notes')} />
        </div>

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate(`/app/manufacturing/production-orders/${id}`)}>Cancel</Button>
          <Button variant="contained" type="submit">Record Completion</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}