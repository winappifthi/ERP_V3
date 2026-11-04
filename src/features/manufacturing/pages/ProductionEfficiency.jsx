import { useSelector } from 'react-redux';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectProductionEfficiency, selectProductionOrdersInContext } from '../manufacturingSelectors';
import { selectProducts, selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

export default function ProductionEfficiency() {
  const efficiency = useSelector(selectProductionEfficiency);
  const orders = useSelector(selectProductionOrdersInContext);
  const products = useSelector(selectProducts);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  const completed = orders.filter((o) => o.status === 'completed');
  const avgEfficiency = efficiency.length > 0
    ? Math.round(efficiency.reduce((s, r) => s + r.efficiency, 0) / efficiency.length)
    : 0;

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (r) => <span className="font-mono text-xs">{r.order.orderNumber}</span> },
    { key: 'product', label: 'Product', render: (r) => productById[r.order.outputProductId]?.name },
    { key: 'startDate', label: 'Start', render: (r) => formatDate(r.order.startDate) },
    { key: 'plannedQty', label: 'Planned', align: 'right', render: (r) => r.plannedQty },
    { key: 'completedQty', label: 'Completed', align: 'right', render: (r) => r.completedQty },
    { key: 'efficiency', label: 'Efficiency', align: 'right', render: (r) => (
      <span className={`font-semibold tabular-nums ${r.efficiency >= 95 ? 'text-green-700' : r.efficiency >= 80 ? 'text-amber-700' : 'text-red-600'}`}>{r.efficiency}%</span>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Production Efficiency"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <Stat label="Total Orders" value={orders.length} />
        <Stat label="Completed" value={completed.length} />
        <Stat label="Avg Efficiency" value={`${avgEfficiency}%`} />
        <Stat label="In Progress" value={orders.filter((o) => o.status === 'in-progress' || o.status === 'material-issued').length} />
      </div>
      <DataTable columns={columns} rows={efficiency} pageSize={20} emptyMessage="No completed production orders." />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-sm tabular-nums">{value}</div>
    </div>
  );
}