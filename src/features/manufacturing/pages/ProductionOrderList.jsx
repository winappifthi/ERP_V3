import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import ProductionStageBadge from '../components/ProductionStageBadge';
import { selectProductionOrdersInContext } from '../manufacturingSelectors';
import { selectProducts, selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

export default function ProductionOrderList() {
  const navigate = useNavigate();
  const orders = useSelector(selectProductionOrdersInContext);
  const products = useSelector(selectProducts);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const filtered = orders
    .filter((o) => status === 'all' || o.status === status)
    .filter((o) => !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || (productById[o.outputProductId]?.name || '').toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (r) => <button onClick={() => navigate(`/app/manufacturing/production-orders/${r.id}`)} className="text-blue-600 hover:underline font-mono text-xs">{r.orderNumber}</button> },
    { key: 'outputProductId', label: 'Product', render: (r) => productById[r.outputProductId]?.name },
    { key: 'plannedQuantity', label: 'Planned', align: 'right', render: (r) => r.plannedQuantity },
    { key: 'completedQuantity', label: 'Completed', align: 'right', render: (r) => r.completedQuantity || 0 },
    { key: 'startDate', label: 'Start', render: (r) => formatDate(r.startDate) },
    { key: 'expectedCompletionDate', label: 'Target', render: (r) => formatDate(r.expectedCompletionDate) },
    { key: 'status', label: 'Status', render: (r) => <ProductionStageBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Production Orders"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={<Button variant="contained" startIcon={<Add />} onClick={() => navigate('/app/manufacturing/production-orders/new')}>New Order</Button>}
      />
      <div className="flex flex-wrap gap-2 mb-3">
        <TextField size="small" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 280 }} />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="material-issued">Material Issued</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </div>
      <DataTable columns={columns} rows={filtered} pageSize={10}emptyMessage="No production orders yet."
emptyAction={{ label: 'New Order', onClick: () => navigate('/app/manufacturing/production-orders/new') }} />
    </div>
  );
}