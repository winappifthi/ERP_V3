import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Autocomplete } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import { stockTransferSchema } from '../schemas/stockTransferSchema';
import { createTransfer, generateTransferId, generateTransferNumber, computeOnHand } from '../inventorySlice';
import { selectTransfersForCompany, selectMovementsInContext } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch, selectWarehousesForBranch, selectProducts } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function StockTransferCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const warehouses = useSelector(selectWarehousesForBranch);
  const products = useSelector(selectProducts);
  const transfers = useSelector(selectTransfersForCompany);
  const movements = useSelector(selectMovementsInContext);
  const [snack, setSnack] = useState(null);

  const transferNumber = useMemo(() => generateTransferNumber(transfers, branch), [transfers, branch]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      transferDate: dayjs().format('YYYY-MM-DD'),
      sourceWarehouseId: warehouses[0]?.id || '',
      destinationWarehouseId: warehouses[1]?.id || '',
      lines: [{ productId: '', quantity: 1 }],
      notes: '',
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const watched = watch();

  const onSubmit = (data) => {
    // Validate source qty
    for (const line of data.lines) {
      const available = computeOnHand(movements, { productId: line.productId, warehouseId: data.sourceWarehouseId });
      if (available < line.quantity) {
        setSnack({ severity: 'error', message: `Insufficient stock for ${products.find((p) => p.id === line.productId)?.name}. Available: ${available}` });
        return;
      }
    }
    const id = generateTransferId();
    dispatch(createTransfer({
      id,
      companyId: company.id,
      branchId: branch.id,
      transferNumber,
      transferDate: data.transferDate,
      sourceWarehouseId: data.sourceWarehouseId,
      destinationWarehouseId: data.destinationWarehouseId,
      status: 'posted',
      lines: data.lines,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    }));
    setSnack({ severity: 'success', message: 'Transfer posted — 2 movements created per line' });
    setTimeout(() => navigate('/app/inventory/transfers'), 800);
  };

  return (
    <div>
      <PageHeader title="New Stock Transfer" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField label="Transfer #" size="small" value={transferNumber} InputProps={{ readOnly: true }} />
          <TextField label="Date" type="date" size="small" InputLabelProps={{ shrink: true }} {...control.register('transferDate')} />
          <div />
          <FormControl size="small" error={!!errors.sourceWarehouseId}>
            <InputLabel>From Warehouse</InputLabel>
            <Select label="From Warehouse" value={watched.sourceWarehouseId} onChange={(e) => setValue('sourceWarehouseId', e.target.value)}>
              {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" error={!!errors.destinationWarehouseId}>
            <InputLabel>To Warehouse</InputLabel>
            <Select label="To Warehouse" value={watched.destinationWarehouseId} onChange={(e) => setValue('destinationWarehouseId', e.target.value)}>
              {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
          {errors.destinationWarehouseId && <div className="text-xs text-red-600">{errors.destinationWarehouseId.message}</div>}
        </div>

        <div className="bg-white border border-gray-200 rounded p-3">
          <h2 className="text-sm font-semibold mb-2">Lines</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-right px-3 py-2">Available at Source</th>
                <th className="text-right px-3 py-2">Qty to Transfer</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => {
                const line = watched.lines?.[i];
                const available = line?.productId
                  ? computeOnHand(movements, { productId: line.productId, warehouseId: watched.sourceWarehouseId })
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
                    <td className="px-3 py-1.5 text-right tabular-nums">{available}</td>
                    <td className="px-3 py-1.5">
                      <TextField
                        type="number"
                        size="small"
                        inputProps={{ min: 1, style: { textAlign: 'right' } }}
                        {...control.register(`lines.${i}.quantity`, { valueAsNumber: true })}
                        error={!!errors.lines?.[i]?.quantity}
                        fullWidth
                      />
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
            <Button size="small" startIcon={<Add />} onClick={() => append({ productId: '', quantity: 1 })}>Add Line</Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-4">
          <TextField label="Notes" size="small" fullWidth multiline minRows={2} {...control.register('notes')} />
        </div>

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/inventory/transfers')}>Cancel</Button>
          <Button variant="contained" type="submit">Post Transfer</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}