import { TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectProducts, selectWarehousesForBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function ReceiptLineEditor({ lines, onChange, disabled }) {
  const products = useSelector(selectProducts);
  const warehouses = useSelector(selectWarehousesForBranch);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  const update = (i, patch) => {
    const next = [...lines];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Product</th>
              <th className="text-right px-3 py-2">Ordered</th>
              <th className="text-right px-3 py-2">Received</th>
              <th className="text-right px-3 py-2">Rate</th>
              <th className="text-left px-3 py-2">Warehouse</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const prod = productById[l.productId];
              return (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <div className="font-medium">{prod?.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{prod?.sku}</div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.orderedQuantity ?? '—'}</td>
                  <td className="px-3 py-2">
                    <TextField
                      type="number"
                      size="small"
                      value={l.quantity}
                      onChange={(e) => {
                        const raw = Number(e.target.value) || 0;
                        const max = l.orderedQuantity ?? Infinity;
                        update(i, { quantity: Math.max(0, Math.min(max, raw)) });
                      }}
                      inputProps={{ min: 0, max: l.orderedQuantity, style: { textAlign: 'right', width: 80 } }}
                      disabled={disabled}
                      error={l.quantity > (l.orderedQuantity ?? Infinity)}
                      helperText={l.quantity > (l.orderedQuantity ?? Infinity) ? 'Exceeds ordered' : ''}
                    />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatINR(l.unitPriceRupees * 100)}</td>
                  <td className="px-3 py-2">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      value={l.warehouseId || ''}
                      onChange={(e) => update(i, { warehouseId: e.target.value })}
                      disabled={disabled}
                    >
                      {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}