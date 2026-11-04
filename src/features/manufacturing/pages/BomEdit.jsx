import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, Autocomplete, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import BomLineEditor from '../components/BomLineEditor';
import { bomSchema } from '../schemas/bomSchema';
import { updateBom } from '../manufacturingSlice';
import { selectBomById } from '../manufacturingSelectors';
import { selectProducts } from '../../../store/selectors/contextSelectors';

export default function BomEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bom = useSelector(selectBomById(id));
  const products = useSelector(selectProducts);
  const [snack, setSnack] = useState(null);

  const defaultValues = useMemo(() => {
    if (!bom) return null;
    return {
      outputProductId: bom.outputProductId,
      version: bom.version,
      outputQuantity: bom.outputQuantity,
      scrapPercent: bom.scrapPercent,
      lines: bom.lines.map((l) => ({ ...l })),
      laborCostPerUnit: bom.laborCostPerUnit || 0,
      overheadCostPerUnit: bom.overheadCostPerUnit || 0,
      notes: bom.notes || '',
    };
  }, [bom]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(bomSchema),
    defaultValues,
    mode: 'onBlur',
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  if (!bom) {
    return <div><PageHeader title="BOM not found" /><Button variant="outlined" onClick={() => navigate('/app/manufacturing/bom')}>Back</Button></div>;
  }

  if (bom.status !== 'active') {
    return (
      <div>
        <PageHeader title="Cannot edit" description="Only active BOMs are editable." />
        <Button variant="outlined" onClick={() => navigate(`/app/manufacturing/bom/${id}`)}>Back</Button>
      </div>
    );
  }

  const watched = watch();

  const onSubmit = (data) => {
    dispatch(updateBom({ id, ...data }));
    setSnack({ severity: 'success', message: 'BOM updated' });
    setTimeout(() => navigate(`/app/manufacturing/bom/${id}`), 700);
  };

  return (
    <div>
      <PageHeader title={`Edit BOM — ${bom.version}`} description="Active BOMs only" />
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
          <TextField label="Yield Quantity" type="number" size="small" {...control.register('outputQuantity', { valueAsNumber: true })} />
          <TextField label="Overall Scrap %" type="number" size="small" {...control.register('scrapPercent', { valueAsNumber: true })} />
          <TextField label="Labor Cost per Unit (₹)" type="number" size="small" {...control.register('laborCostPerUnit', { valueAsNumber: true })} />
          <TextField label="Overhead per Unit (₹)" type="number" size="small" {...control.register('overheadCostPerUnit', { valueAsNumber: true })} />
          <div className="md:col-span-3">
            <TextField label="Notes" size="small" fullWidth multiline minRows={2} {...control.register('notes')} />
          </div>
        </div>

        <BomLineEditor control={control} errors={errors} fields={fields} append={append} remove={remove} watch={watch} setValue={setValue} />

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate(`/app/manufacturing/bom/${id}`)}>Cancel</Button>
          <Button variant="contained" type="submit">Save Changes</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}