import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { productSchema } from '../schemas/productSchema';
import { updateProduct } from '../../../store/slices/mastersSlice';
import { selectProducts } from '../../../store/selectors/contextSelectors';
import { selectTaxCategories } from '../../../store/selectors/contextSelectors';

const UOMS = ['PCS', 'MTR', 'KG', 'LTR', 'BOX', 'SET'];
const CATEGORIES = [
  { id: 'CAT-IND', label: 'Industrial' },
  { id: 'CAT-ELEC', label: 'Electrical' },
  { id: 'CAT-FAST', label: 'Fasteners' },
  { id: 'CAT-FMCG', label: 'FMCG' },
  { id: 'CAT-RM', label: 'Raw Material' },
  { id: 'CAT-FG', label: 'Finished Goods' },
  { id: 'CAT-WS', label: 'Wholesale' },
];

export default function ProductEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(selectProducts);
  const taxes = useSelector(selectTaxCategories);
  const product = products.find((p) => p.id === id);
  const [snack, setSnack] = useState(null);

  const defaultValues = useMemo(() => product ? { ...product } : null, [product]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: 'onBlur',
  });

  if (!product) {
    return <div><PageHeader title="Product not found" /><Button variant="outlined" onClick={() => navigate('/app/masters/products')}>Back</Button></div>;
  }

  const onSubmit = (data) => {
    dispatch(updateProduct({ id, ...data }));
    setSnack({ severity: 'success', message: 'Product updated' });
    setTimeout(() => navigate(`/app/masters/products/${id}`), 700);
  };

  return (
    <div>
      <PageHeader title={`Edit ${product.name}`} description={product.sku} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded p-4 space-y-3 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField label="SKU *" size="small" {...register('sku')} error={!!errors.sku} helperText={errors.sku?.message} />
          <TextField label="Product Name *" size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <FormControl size="small">
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={watch('categoryId')} onChange={(e) => setValue('categoryId', e.target.value)}>
              {CATEGORIES.map((c) => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>UOM</InputLabel>
            <Select label="UOM" value={watch('baseUom')} onChange={(e) => setValue('baseUom', e.target.value)}>
              {UOMS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Selling Price (₹)" type="number" size="small" {...register('sellingPrice', { valueAsNumber: true })} />
          <TextField label="Purchase Price (₹)" type="number" size="small" {...register('purchasePrice', { valueAsNumber: true })} />
          <FormControl size="small">
            <InputLabel>Tax Category</InputLabel>
            <Select label="Tax Category" value={watch('taxCategoryId')} onChange={(e) => setValue('taxCategoryId', e.target.value)}>
              {taxes.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="HSN" size="small" {...register('hsn')} error={!!errors.hsn} helperText={errors.hsn?.message} />
          <TextField label="Reorder Level" type="number" size="small" {...register('reorderLevel', { valueAsNumber: true })} />
          <div className="flex flex-col gap-1 pt-1">
            <FormControlLabel control={<Checkbox size="small" checked={watch('trackBatch')} onChange={(e) => setValue('trackBatch', e.target.checked)} />} label={<span className="text-sm">Track batch</span>} />
            <FormControlLabel control={<Checkbox size="small" checked={watch('trackSerial')} onChange={(e) => setValue('trackSerial', e.target.checked)} />} label={<span className="text-sm">Track serial</span>} />
            <FormControlLabel control={<Checkbox size="small" checked={watch('active')} onChange={(e) => setValue('active', e.target.checked)} />} label={<span className="text-sm">Active</span>} />
          </div>
        </div>
        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate(`/app/masters/products/${id}`)}>Cancel</Button>
          <Button variant="contained" type="submit">Save Changes</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}