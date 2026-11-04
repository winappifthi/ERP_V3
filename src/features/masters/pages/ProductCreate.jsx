import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { productSchema } from '../schemas/productSchema';
import { addProduct } from '../../../store/slices/mastersSlice';
import { selectProducts, selectTaxCategories, selectCurrentCompany } from '../../../store/selectors/contextSelectors';

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

export default function ProductCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const products = useSelector(selectProducts);
  const taxes = useSelector(selectTaxCategories);
  const [snack, setSnack] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      categoryId: 'CAT-ELEC',
      baseUom: 'PCS',
      sellingPrice: 0,
      purchasePrice: 0,
      taxCategoryId: 'TAX-GST18',
      hsn: '',
      trackBatch: false,
      trackSerial: false,
      reorderLevel: 10,
      active: true,
    },
    mode: 'onBlur',
  });

  const onSubmit = (data) => {
    const dup = products.find((p) => p.sku.toLowerCase() === data.sku.toLowerCase());
    if (dup) {
      setSnack({ severity: 'error', message: `SKU "${data.sku}" already exists` });
      return;
    }
    const id = `PRD-${String(products.length + 1).padStart(4, '0')}-${Date.now().toString(36).slice(-4)}`;
    dispatch(addProduct({ id, ...data }));
    setSnack({ severity: 'success', message: 'Product created' });
    setTimeout(() => navigate('/app/masters/products'), 700);
  };

  return (
    <div>
      <PageHeader title="New Product" description={company?.displayName} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded p-4 space-y-3 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField label="SKU *" size="small" {...register('sku')} error={!!errors.sku} helperText={errors.sku?.message} />
          <TextField label="Product Name *" size="small" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <FormControl size="small" error={!!errors.categoryId}>
            <InputLabel>Category *</InputLabel>
            <Select label="Category *" value={watch('categoryId')} onChange={(e) => setValue('categoryId', e.target.value)}>
              {CATEGORIES.map((c) => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Unit of Measure</InputLabel>
            <Select label="Unit of Measure" value={watch('baseUom')} onChange={(e) => setValue('baseUom', e.target.value)}>
              {UOMS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Selling Price (₹)" type="number" size="small" inputProps={{ min: 0, step: '0.01' }} {...register('sellingPrice', { valueAsNumber: true })} error={!!errors.sellingPrice} helperText={errors.sellingPrice?.message} />
          <TextField label="Purchase Price (₹)" type="number" size="small" inputProps={{ min: 0, step: '0.01' }} {...register('purchasePrice', { valueAsNumber: true })} error={!!errors.purchasePrice} helperText={errors.purchasePrice?.message} />
          <FormControl size="small">
            <InputLabel>Tax Category *</InputLabel>
            <Select label="Tax Category *" value={watch('taxCategoryId')} onChange={(e) => setValue('taxCategoryId', e.target.value)}>
              {taxes.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="HSN Code" size="small" {...register('hsn')} error={!!errors.hsn} helperText={errors.hsn?.message} />
          <TextField label="Reorder Level" type="number" size="small" inputProps={{ min: 0 }} {...register('reorderLevel', { valueAsNumber: true })} />
          <div className="flex flex-col gap-1 pt-1">
            <FormControlLabel control={<Checkbox size="small" checked={watch('trackBatch')} onChange={(e) => setValue('trackBatch', e.target.checked)} />} label={<span className="text-sm">Track batch</span>} />
            <FormControlLabel control={<Checkbox size="small" checked={watch('trackSerial')} onChange={(e) => setValue('trackSerial', e.target.checked)} />} label={<span className="text-sm">Track serial number</span>} />
            <FormControlLabel control={<Checkbox size="small" checked={watch('active')} onChange={(e) => setValue('active', e.target.checked)} />} label={<span className="text-sm">Active</span>} />
          </div>
        </div>
        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/masters/products')}>Cancel</Button>
          <Button variant="contained" type="submit">Create Product</Button>
        </div>
      </form>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}