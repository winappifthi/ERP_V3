import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectWorkCentersInContext } from '../manufacturingSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function WorkCenterList() {
  const navigate = useNavigate();
  const centers = useSelector(selectWorkCentersInContext);
  const company = useSelector(selectCurrentCompany);

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'name', label: 'Name' },
    { key: 'capacityPerDay', label: 'Capacity/Day', align: 'right', render: (r) => r.capacityPerDay },
    { key: 'hourlyRate', label: 'Hourly Rate', align: 'right', render: (r) => formatINR(r.hourlyRate * 100) },
    { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Work Centers"
        description={company?.displayName}
        actions={<Button variant="contained" startIcon={<Add />} onClick={() => navigate('/app/manufacturing/work-centers/new')}>New Work Center</Button>}
      />
      <DataTable columns={columns} rows={centers} pageSize={10} emptyMessage="No work centers defined." />
    </div>
  );
}