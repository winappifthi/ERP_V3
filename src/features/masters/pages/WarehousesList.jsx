import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectWarehouses,
  selectCurrentCompany,
} from '../../../store/selectors/contextSelectors';

const TYPE_LABEL = {
  'retail': 'Retail',
  'distribution': 'Distribution',
  'raw-material': 'Raw Material',
  'finished-goods': 'Finished Goods',
};

export default function WarehousesList() {
  const navigate = useNavigate();
  const allWarehouses = useSelector(selectWarehouses);
  const company = useSelector(selectCurrentCompany);
  const warehouses = allWarehouses.filter((w) => w.companyId === company?.id);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return warehouses;
    return warehouses.filter(
      (w) => w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)
    );
  }, [warehouses, search]);

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      key: 'name',
      label: 'Warehouse',
      render: (r) => (
        <button
          onClick={() => navigate(`/app/masters/warehouses/${r.id}`)}
          className="text-blue-600 hover:underline"
        >
          {r.name}
        </button>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (r) => TYPE_LABEL[r.type] || r.type,
    },
    {
      key: 'branchId',
      label: 'Branch',
      hideOnMobile: true,
      render: (r) => <span className="font-mono text-xs">{r.branchId}</span>,
    },
    {
      key: 'active',
      label: 'Status',
      render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Warehouses"
        description={`${company?.displayName || ''} · ${filtered.length} warehouse(s)`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/app/masters/warehouses/new')}
          >
            New Warehouse
          </Button>
        }
      />
      <div className="mb-3">
        <TextField
          size="small"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 360 } }}
        />
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={15}
        emptyMessage="No warehouses for this company."
        emptyAction={{ label: 'New Warehouse', onClick: () => navigate('/app/masters/warehouses/new') }}
      />
    </div>
  );
}