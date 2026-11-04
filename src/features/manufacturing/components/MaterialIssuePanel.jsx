import { TextField, Button, Autocomplete, MenuItem, Select } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectProducts, selectWarehousesForBranch } from '../../../store/selectors/contextSelectors';
import { computeOnHand } from '../../inventory/inventorySlice';
import { selectMovementsInContext } from '../../inventory/inventorySelectors';

export default function MaterialIssuePanel({ lines, onChange }) {
  const products = useSelector(selectProducts);
  const warehouses = useSelector(selectWarehousesForBranch);
  const movements = useSelector(selectMovementsInContext);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  const update = (i, patch) => {
    const next = [...lines];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-3">
      <h2 className="text-sm font-semibold mb-2">Material Issue Lines</h2>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th className="text-left px-3 py-2">Component</th>
            <th className="text-left px-3 py-2">Warehouse</th>
            <th className="text-right px-3 py-2">Available</th>
            <th className="text-right px-3 py-2" style={{ width: '14%' }}>Issue Qty</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => {
            const available = l.productId && l.warehouseId
              ? computeOnHand(movements, { productId: l.productId, warehouseId: l.warehouseId })
              : 0;
            return (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-3 py-1.5">
                  <Autocomplete
                    size="small"
                    options={products}
                    getOptionLabel={(p) => `${p.sku} — ${p.name}`}
                    value={products.find((p) => p.id === l.productId) || null}
                    onChange={(_, v) => update(i, { productId: v?.id || '' })}
                    renderInput={(params) => <TextField {...params} placeholder="Select" />}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <Select size="small" fullWidth value={l.warehouseId || ''} onChange={(e) => update(i, { warehouseId: e.target.value })}>
                    {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                  </Select>
                </td>
                <td className={`px-3 py-1.5 text-right tabular-nums ${available < l.quantity ? 'text-red-600' : ''}`}>{available}</td>
                <td className="px-3 py-1.5">
                  <TextField
                    type="number"
                    size="small"
                    value={l.quantity}
                    onChange={(e) => update(i, { quantity: Math.max(0, Number(e.target.value) || 0) })}
                    inputProps={{ min: 0, step: '0.01', style: { textAlign: 'right' } }}
                    error={l.quantity > available}
                    helperText={l.quantity > available ? 'Exceeds stock' : ''}
                    fullWidth
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Button size="small" onClick={() => onChange(lines.filter((_, j) => j !== i))}><Delete fontSize="small" /></Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pt-2 border-t border-gray-200">
        <Button size="small" startIcon={<Add />} onClick={() => onChange([...lines, { productId: '', quantity: 1, warehouseId: warehouses[0]?.id || '' }])}>Add Line</Button>
      </div>
    </div>
  );
}