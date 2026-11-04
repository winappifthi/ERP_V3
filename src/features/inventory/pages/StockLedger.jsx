import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import MovementTypeBadge from '../components/MovementTypeBadge';
import { selectMovementsInContext } from '../inventorySelectors';
import { selectProducts, selectCurrentCompany, selectCurrentBranch, selectWarehousesForBranch } from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

const MOVEMENT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'opening', label: 'Opening' },
  { value: 'purchase-receipt', label: 'Purchase Receipt' },
  { value: 'sales-issue', label: 'Sales Issue' },
  { value: 'sale-return', label: 'Sale Return' },
  { value: 'purchase-return', label: 'Purchase Return' },
  { value: 'transfer-in', label: 'Transfer In' },
  { value: 'transfer-out', label: 'Transfer Out' },
  { value: 'adjustment', label: 'Adjustment' },
];

export default function StockLedger() {
  const movements = useSelector(selectMovementsInContext);
  const products = useSelector(selectProducts);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const warehouses = useSelector(selectWarehousesForBranch);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const warehouseById = useMemo(() => Object.fromEntries(warehouses.map((w) => [w.id, w])), [warehouses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movements
      .filter((m) => typeFilter === 'all' || m.movementType === typeFilter)
      .filter((m) => warehouseFilter === 'all' || m.warehouseId === warehouseFilter)
      .filter((m) => (!fromDate || m.movementDate >= fromDate) && (!toDate || m.movementDate <= toDate))
      .filter((m) => !q || (productById[m.productId]?.name || '').toLowerCase().includes(q) || (productById[m.productId]?.sku || '').toLowerCase().includes(q))
      .sort((a, b) => b.movementDate.localeCompare(a.movementDate));
  }, [movements, search, typeFilter, warehouseFilter, fromDate, toDate, productById]);

  const columns = [
    { key: 'movementDate', label: 'Date', render: (r) => formatDate(r.movementDate) },
    { key: 'productId', label: 'Product', render: (r) => <div><div className="font-medium text-xs">{productById[r.productId]?.name}</div><div className="font-mono text-[10px] text-gray-500">{productById[r.productId]?.sku}</div></div> },
    { key: 'warehouseId', label: 'Warehouse', render: (r) => <span className="text-xs">{warehouseById[r.warehouseId]?.name || '—'}</span> },
    { key: 'movementType', label: 'Type', render: (r) => <MovementTypeBadge type={r.movementType} /> },
    { key: 'quantity', label: 'Qty', align: 'right', render: (r) => <span className={`tabular-nums font-medium ${r.quantity < 0 ? 'text-red-600' : 'text-green-700'}`}>{r.quantity > 0 ? '+' : ''}{r.quantity}</span> },
    { key: 'referenceId', label: 'Reference', render: (r) => r.referenceId ? <span className="font-mono text-xs">{r.referenceId}</span> : '—' },
  ];

  return (
    <div>
      <PageHeader title="Stock Ledger" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />

      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField size="small" placeholder="Search product…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: '100%', sm: 240 } }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {MOVEMENT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Warehouse</InputLabel>
          <Select label="Warehouse" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <DataTable columns={columns} rows={filtered} pageSize={25} emptyMessage="No movements match filters." />
    </div>
  );
}