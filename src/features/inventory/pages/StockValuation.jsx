import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectStockOverview, selectTotalInventoryValue } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch, selectWarehousesForBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function StockValuation() {
  const rows = useSelector(selectStockOverview);
  const total = useSelector(selectTotalInventoryValue);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const warehouses = useSelector(selectWarehousesForBranch);
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const filtered = useMemo(
    () => rows.filter((r) => (warehouseFilter === 'all' || r.warehouseId === warehouseFilter) && r.onHand > 0),
    [rows, warehouseFilter]
  );

  const byProduct = useMemo(() => {
    const map = new Map();
    for (const r of filtered) {
      if (map.has(r.productId)) {
        map.get(r.productId).onHand += r.onHand;
        map.get(r.productId).valuePaise += r.valuePaise;
      } else {
        map.set(r.productId, { productId: r.productId, product: r.product, onHand: r.onHand, valuePaise: r.valuePaise });
      }
    }
    return Array.from(map.values());
  }, [filtered]);

  const filteredTotal = byProduct.reduce((s, r) => s + r.valuePaise, 0);

  const columns = [
    { key: 'product', label: 'Product', render: (r) => <div><div className="font-medium">{r.product.name}</div><div className="text-xs font-mono text-gray-500">{r.product.sku}</div></div> },
    { key: 'uom', label: 'UOM', render: (r) => r.product.baseUom },
    { key: 'onHand', label: 'Qty', align: 'right', render: (r) => <span className="tabular-nums">{r.onHand}</span> },
    { key: 'costPrice', label: 'Cost Price', align: 'right', render: (r) => formatINR(r.product.purchasePrice * 100) },
    { key: 'valuePaise', label: 'Value', align: 'right', render: (r) => <span className="tabular-nums font-medium">{formatINR(r.valuePaise)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Valuation"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-white border border-gray-200 rounded p-2.5"><div className="text-xs text-gray-500">Total Inventory Value</div><div className="text-lg font-bold tabular-nums">{formatINR(total)}</div></div>
        <div className="bg-white border border-gray-200 rounded p-2.5"><div className="text-xs text-gray-500">Filtered Value</div><div className="text-lg font-semibold tabular-nums">{formatINR(filteredTotal)}</div></div>
        <div className="bg-white border border-gray-200 rounded p-2.5"><div className="text-xs text-gray-500">Products</div><div className="text-lg font-semibold tabular-nums">{byProduct.length}</div></div>
      </div>
      <div className="bg-white border border-gray-200 rounded p-3 mb-3">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Warehouse</InputLabel>
          <Select label="Warehouse" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <MenuItem value="all">All warehouses</MenuItem>
            {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
      </div>
      <DataTable columns={columns} rows={byProduct} pageSize={20} emptyMessage="No positive-stock items in this warehouse." />
    </div>
  );
}