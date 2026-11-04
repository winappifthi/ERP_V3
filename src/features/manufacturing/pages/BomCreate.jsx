import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Autocomplete, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import BomLineEditor from '../components/BomLineEditor';
import { bomSchema } from '../schemas/bomSchema';
import { createBom, generateBomId } from '../manufacturingSlice';
import { selectBomsInContext } from '../manufacturingSelectors';
import { selectCurrentCompany, selectProducts } from '../../../store/selectors/contextSelectors';

export default function BomCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const products = useSelector(selectProducts);
  const boms = useSelector(selectBomsInContext);
  const [snack, setSnack] = useState(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(bomSchema),
    defaultValues: {
      outputProductId: '',
      version: 'v1',
      outputQuantity: 1,
      scrapPercent: 0,
      lines: [{ productId: '', quantity: 1, scrapPercent: 0 }],
      laborCostPerUnit: 0,
      overheadCostPerUnit: 0,
      notes: '',
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const watched = watch();

  const onSubmit = (data) => {
    // Duplicate check: same output + version
    const dup = boms.find((b) => b.outputProductId === data.outputProductId && b.version === data.version && b.status !== 'archived');
    if (dup) {
      setSnack({ severity: 'error', message: 'BOM with this product + version already exists' });
      return;
    }
    const id = generateBomId();
    dispatch(createBom({
      id,
      companyId: company.id,
      outputProductId: data.outputProductId,
      version: data.version,
      status: 'active',
      outputQuantity: data.outputQuantity,
      scrapPercent: data.scrapPercent,
      lines: data.lines,
      laborCostPerUnit: data.laborCostPerUnit,
      overheadCostPerUnit: data.overheadCostPerUnit,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    }));
    setSnack({ severity: 'success', message: 'BOM created' });
    setTimeout(() => navigate('/app/manufacturing/bom'), 800);
  };

  return (
    <div>
      <PageHeader title="New BOM" description={`${company?.displayName || ''}`} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Output Product *</label>
            <Autocomplete
              size="small"
              options={products}
              getOptionLabel={(p) => `${p.sku} — ${p.name}`}
              value={products.find((p) => p.id === watched.outputProductId) || null}
              onChange={(_, v) => setValue('outputProductId', v?.id || '', { shouldValidate: true })}
              renderInput={(params) => <TextField {...params} error={!!errors.outputProductId} helperText={errors.outputProductId?.message} />}
            />
          </div>
          <TextField label="Version" size="small" {...control.register('version')} error={!!errors.version} helperText={errors.version?.message} />
          <TextField label="Yield Quantity" type="number" size="small" inputProps={{ min: 1 }} {...control.register('outputQuantity', { valueAsNumber: true })} />
          <TextField label="Overall Scrap %" type="number" size="small" inputProps={{ min: 0, max: 100, step: '0.1' }} {...control.register('scrapPercent', { valueAsNumber: true })} />
          <TextField label="Labor Cost per Unit (₹)" type="number" size="small" inputProps={{ min: 0, step: '0.01' }} {...control.register('laborCostPerUnit', { valueAsNumber: true })} />
          <TextField label="Overhead per Unit (₹)" type="number" size="small" inputProps={{ min: 0, step: '0.01' }} {...control.register('overheadCostPerUnit', { valueAsNumber: true })} />
          <div className="md:col-span-3">
            <TextField label="Notes" size="small" fullWidth multiline minRows={2} {...control.register('notes')} />
          </div>
        </div>

        <BomLineEditor control={control} errors={errors} fields={fields} append={append} remove={remove} watch={watch} setValue={setValue} />

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/manufacturing/bom')}>Cancel</Button>
          <Button variant="contained" type="submit">Create BOM</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}