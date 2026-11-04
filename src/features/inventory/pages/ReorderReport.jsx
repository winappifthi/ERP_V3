import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectReorderAlerts } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';

export default function ReorderReport() {
  const navigate = useNavigate();
  const alerts = useSelector(selectReorderAlerts);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const columns = [
    { key: 'productName', label: 'Product', render: (r) => <div><div className="font-medium">{r.product.name}</div><div className="text-xs font-mono text-gray-500">{r.product.sku}</div></div> },
    { key: 'onHand', label: 'On Hand', align: 'right', render: (r) => <span className="tabular-nums text-red-600 font-medium">{r.onHand}</span> },
    { key: 'reorderLevel', label: 'Reorder Level', align: 'right', render: (r) => <span className="tabular-nums">{r.product.reorderLevel}</span> },
    { key: 'shortage', label: 'Shortage', align: 'right', render: (r) => <span className="tabular-nums font-semibold text-red-600">{r.shortage}</span> },
    { key: 'warehouses', label: 'Warehouses', render: (r) => <span className="text-xs text-gray-600">{r.warehouses.filter((w) => w.onHand > 0).map((w) => w.warehouse?.name).join(', ') || 'None'}</span> },
    { key: 'action', label: '', align: 'right', sortable: false, render: (r) => (
      <Button size="small" onClick={() => navigate(`/app/purchases/orders/new`)}>Reorder</Button>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Reorder Report"
        description={`${alerts.length} product(s) below reorder level · ${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <DataTable columns={columns} rows={alerts} pageSize={20} emptyMessage="All products are above their reorder levels. " />
    </div>
  );
}