import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectAdjustmentsInContext } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

export default function StockAdjustmentList() {
  const navigate = useNavigate();
  const adjustments = useSelector(selectAdjustmentsInContext);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const warehouses = useSelector((s) => s.masters.warehouses);
  const warehouseById = useMemo(() => Object.fromEntries(warehouses.map((w) => [w.id, w])), [warehouses]);

  const columns = [
    { key: 'adjustmentNumber', label: 'Adjustment #', render: (r) => <span className="font-mono text-xs">{r.adjustmentNumber}</span> },
    { key: 'adjustmentDate', label: 'Date', render: (r) => formatDate(r.adjustmentDate) },
    { key: 'warehouseId', label: 'Warehouse', render: (r) => warehouseById[r.warehouseId]?.name },
    { key: 'lines', label: 'Lines', align: 'right', render: (r) => r.lines.length },
    { key: 'netQty', label: 'Net Qty', align: 'right', render: (r) => r.lines.reduce((s, l) => s + l.quantity, 0) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={<Button variant="contained" startIcon={<Add />} onClick={() => navigate('/app/inventory/adjustments/new')}>New Adjustment</Button>}
      />
      <DataTable columns={columns} rows={adjustments} pageSize={10} emptyMessage="No adjustments yet." />
    </div>
  );
}