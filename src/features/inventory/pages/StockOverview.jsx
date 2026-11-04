import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectStockOverview, selectTotalInventoryValue } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch, selectWarehousesForBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function StockOverview() {
  const rows = useSelector(selectStockOverview);
  const totalValue = useSelector(selectTotalInventoryValue);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const warehouses = useSelector(selectWarehousesForBranch);

  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [hideZero, setHideZero] = useState(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => warehouseFilter === 'all' || r.warehouseId === warehouseFilter)
      .filter((r) => !hideZero || r.onHand !== 0)
      .filter((r) => !q || r.product.name.toLowerCase().includes(q) || r.product.sku.toLowerCase().includes(q));
  }, [rows, search, warehouseFilter, hideZero]);

  const totalOnHandValue = filtered.reduce((s, r) => s + r.valuePaise, 0);

  const columns = [
    { key: 'productName', label: 'Product', render: (r) => <div><div className="font-medium">{r.product.name}</div><div className="text-xs font-mono text-gray-500">{r.product.sku}</div></div> },
    { key: 'warehouse', label: 'Warehouse', render: (r) => r.warehouse?.name || '—' },
    { key: 'uom', label: 'UOM', render: (r) => r.product.baseUom },
    { key: 'onHand', label: 'On Hand', align: 'right', render: (r) => <span className={`tabular-nums font-medium ${r.onHand < 0 ? 'text-red-600' : r.onHand === 0 ? 'text-gray-400' : ''}`}>{r.onHand}</span> },
    { key: 'valuePaise', label: 'Value', align: 'right', render: (r) => <span className="tabular-nums">{formatINR(r.valuePaise)}</span> },
    { key: 'lastMovementDate', label: 'Last Movement', render: (r) => r.lastMovementDate ? formatDate(r.lastMovementDate) : '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Overview"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <Stat label="Total On Hand Value" value={formatINR(totalValue)} bold />
        <Stat label="Filtered Value" value={formatINR(totalOnHandValue)} />
        <Stat label="Products Displayed" value={new Set(filtered.map((r) => r.productId)).size} />
        <Stat label="Warehouses" value={warehouses.length} />
      </div>

      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField size="small" placeholder="Search product or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: '100%', sm: 280 } }} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Warehouse</InputLabel>
          <Select label="Warehouse" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <MenuItem value="all">All warehouses</MenuItem>
            {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Checkbox size="small" checked={hideZero} onChange={(e) => setHideZero(e.target.checked)} />}
          label={<span className="text-sm">Hide zero-stock</span>}
        />
      </div>

      <DataTable columns={columns} rows={filtered} pageSize={25} emptyMessage="No stock movements. Record a purchase receipt or adjustment to see stock here."/>
    </div>
  );
}

function Stat({ label, value, bold }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`tabular-nums ${bold ? 'font-bold text-base' : 'font-semibold text-sm'}`}>{value}</div>
    </div>
  );
}