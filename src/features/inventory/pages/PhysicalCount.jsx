import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TextField, MenuItem, Select, FormControl, InputLabel, Button, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { selectStockOverview } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch, selectWarehousesForBranch } from '../../../store/selectors/contextSelectors';
import { createAdjustment, generateAdjustmentId, generateAdjustmentNumber } from '../inventorySlice';
import { selectAdjustmentsForCompany } from '../inventorySelectors';
import dayjs from '../../../lib/dayjs';

export default function PhysicalCount() {
  const dispatch = useDispatch();
  const rows = useSelector(selectStockOverview);
  const warehouses = useSelector(selectWarehousesForBranch);
  const adjustments = useSelector(selectAdjustmentsForCompany);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({}); // { productId: countedQty }
  const [snack, setSnack] = useState(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => r.warehouseId === warehouseId).filter((r) => !search || r.product.name.toLowerCase().includes(search.toLowerCase()) || r.product.sku.toLowerCase().includes(search.toLowerCase()));
  }, [rows, warehouseId, search]);

  const handlePost = () => {
    const lines = [];
    for (const [productId, counted] of Object.entries(counts)) {
      if (counted == null) continue;
      const row = rows.find((r) => r.warehouseId === warehouseId && r.productId === productId);
      const diff = Number(counted) - (row?.onHand || 0);
      if (diff !== 0) {
        lines.push({ productId, quantity: diff, reason: diff > 0 ? 'found' : 'shrinkage', notes: 'Physical count adjustment' });
      }
    }
    if (lines.length === 0) {
      setSnack({ severity: 'info', message: 'No discrepancies found' });
      return;
    }
    const id = generateAdjustmentId();
    dispatch(createAdjustment({
      id,
      companyId: company.id,
      branchId: branch.id,
      adjustmentNumber: generateAdjustmentNumber(adjustments, branch),
      adjustmentDate: dayjs().format('YYYY-MM-DD'),
      warehouseId,
      status: 'posted',
      lines,
      notes: 'Physical count adjustment',
      createdAt: new Date().toISOString(),
    }));
    setSnack({ severity: 'success', message: `${lines.length} line(s) adjusted for discrepancies` });
    setCounts({});
  };

  return (
    <div>
      <PageHeader
        title="Physical Count"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={<Button variant="contained" onClick={handlePost}>Post Discrepancies</Button>}
      />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Warehouse</InputLabel>
          <Select label="Warehouse" value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); setCounts({}); }}>
            {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 240 }} />
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Product</th>
              <th className="text-right px-3 py-2">System Qty</th>
              <th className="text-right px-3 py-2">Counted Qty</th>
              <th className="text-right px-3 py-2">Diff</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500 text-xs">No products in this warehouse.</td></tr>}
            {filtered.map((r) => {
              const counted = counts[r.productId];
              const diff = counted != null ? Number(counted) - r.onHand : null;
              return (
                <tr key={r.productId} className="border-t border-gray-100">
                  <td className="px-3 py-2"><div className="font-medium">{r.product.name}</div><div className="text-xs font-mono text-gray-500">{r.product.sku}</div></td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.onHand}</td>
                  <td className="px-3 py-2 text-right">
                    <TextField
                      type="number"
                      size="small"
                      value={counted ?? ''}
                      onChange={(e) => setCounts({ ...counts, [r.productId]: e.target.value === '' ? null : Number(e.target.value) })}
                      inputProps={{ style: { textAlign: 'right', width: 80 } }}
                    />
                  </td>
                  <td className={`px-3 py-2 text-right tabular-nums font-medium ${diff > 0 ? 'text-green-700' : diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {diff == null ? '—' : diff > 0 ? `+${diff}` : diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}