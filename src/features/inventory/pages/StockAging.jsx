import { useSelector } from 'react-redux';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectStockAging } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';

export default function StockAging() {
  const rows = useSelector(selectStockAging);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const columns = [
    { key: 'product', label: 'Product', render: (r) => <div><div className="font-medium">{r.product.name}</div><div className="text-xs font-mono text-gray-500">{r.product.sku}</div></div> },
    { key: 'warehouse', label: 'Warehouse', render: (r) => r.warehouse.name },
    { key: 'totalOnHand', label: 'On Hand', align: 'right', render: (r) => <span className="tabular-nums font-medium">{r.totalOnHand}</span> },
    { key: 'b0_30', label: '0–30 days', align: 'right', render: (r) => <span className="tabular-nums">{r.buckets['0-30']}</span> },
    { key: 'b31_60', label: '31–60 days', align: 'right', render: (r) => <span className="tabular-nums">{r.buckets['31-60']}</span> },
    { key: 'b61_90', label: '61–90 days', align: 'right', render: (r) => <span className="tabular-nums">{r.buckets['61-90']}</span> },
    { key: 'b90', label: '90+ days', align: 'right', render: (r) => <span className={`tabular-nums ${r.buckets['90+'] > 0 ? 'text-amber-700 font-semibold' : ''}`}>{r.buckets['90+']}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Aging"
        description={`FIFO bucket analysis · ${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <DataTable columns={columns} rows={rows} pageSize={20} emptyMessage="No stock aging data." />
    </div>
  );
}