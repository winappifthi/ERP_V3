import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectTransfersInContext } from '../inventorySelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

export default function StockTransferList() {
  const navigate = useNavigate();
  const transfers = useSelector(selectTransfersInContext);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const warehouses = useSelector((s) => s.masters.warehouses);
  const warehouseById = useMemo(() => Object.fromEntries(warehouses.map((w) => [w.id, w])), [warehouses]);

  const columns = [
    { key: 'transferNumber', label: 'Transfer #', render: (r) => <span className="font-mono text-xs">{r.transferNumber}</span> },
    { key: 'transferDate', label: 'Date', render: (r) => formatDate(r.transferDate) },
    { key: 'sourceWarehouseId', label: 'From', render: (r) => warehouseById[r.sourceWarehouseId]?.name },
    { key: 'destinationWarehouseId', label: 'To', render: (r) => warehouseById[r.destinationWarehouseId]?.name },
    { key: 'lines', label: 'Lines', align: 'right', render: (r) => r.lines.length },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Transfers"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={<Button variant="contained" startIcon={<Add />} onClick={() => navigate('/app/inventory/transfers/new')}>New Transfer</Button>}
      />
      <DataTable columns={columns} rows={transfers} pageSize={10} emptyMessage="No transfers yet." />
    </div>
  );
}