import { TextField, Button, Autocomplete } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../../store/selectors/contextSelectors';

export default function BomLineEditor({ control, errors, fields, append, remove, watch, setValue }) {
  const products = useSelector(selectProducts);
  const watched = watch();

  return (
    <div className="bg-white border border-gray-200 rounded p-3">
      <h2 className="text-sm font-semibold mb-2">Components</h2>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th className="text-left px-3 py-2">Component</th>
            <th className="text-right px-3 py-2" style={{ width: '15%' }}>Qty per Unit</th>
            <th className="text-right px-3 py-2" style={{ width: '12%' }}>Scrap %</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => {
            const line = watched.lines?.[i];
            return (
              <tr key={field.id} className="border-t border-gray-100">
                <td className="px-3 py-1.5">
                  <Autocomplete
                    size="small"
                    options={products}
                    getOptionLabel={(p) => `${p.sku} — ${p.name}`}
                    value={products.find((p) => p.id === line?.productId) || null}
                    onChange={(_, v) => setValue(`lines.${i}.productId`, v?.id || '', { shouldValidate: true })}
                    renderInput={(params) => <TextField {...params} placeholder="Select component" error={!!errors?.lines?.[i]?.productId} />}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <TextField type="number" size="small" inputProps={{ min: 0, step: '0.01', style: { textAlign: 'right' } }} {...control.register(`lines.${i}.quantity`, { valueAsNumber: true })} error={!!errors?.lines?.[i]?.quantity} fullWidth />
                </td>
                <td className="px-3 py-1.5">
                  <TextField type="number" size="small" inputProps={{ min: 0, max: 100, step: '0.1', style: { textAlign: 'right' } }} {...control.register(`lines.${i}.scrapPercent`, { valueAsNumber: true })} fullWidth />
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
        <Button size="small" startIcon={<Add />} onClick={() => append({ productId: '', quantity: 1, scrapPercent: 0 })}>Add Component</Button>
      </div>
    </div>
  );
}