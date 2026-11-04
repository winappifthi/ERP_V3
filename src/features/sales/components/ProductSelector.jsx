import { Autocomplete, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectProducts, selectTaxCategories } from '../../../store/selectors/contextSelectors';

export default function ProductSelector({ value, onChange, error, disabled }) {
  const products = useSelector(selectProducts);
  const taxes = useSelector(selectTaxCategories);
  const taxById = Object.fromEntries(taxes.map((t) => [t.id, t]));
  const selected = products.find((p) => p.id === value) || null;

  const handleChange = (_, product) => {
    if (!product) {
      onChange(null);
      return;
    }
    const tax = taxById[product.taxCategoryId];
    onChange({
      productId: product.id,
      unitPriceRupees: product.sellingPrice,
      taxRatePercent: tax?.ratePercent ?? 18,
    });
  };

  return (
    <Autocomplete
      size="small"
      options={products}
      getOptionLabel={(o) => `${o.sku} — ${o.name}`}
      value={selected}
      onChange={handleChange}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select product…"
          error={!!error}
          size="small"
        />
      )}
      isOptionEqualToValue={(o, v) => o.id === v.id}
    />
  );
}