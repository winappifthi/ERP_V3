import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectBomsInContext } from '../manufacturingSelectors';
import { selectProducts, selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

export default function BomList() {
  const navigate = useNavigate();
  const boms = useSelector(selectBomsInContext);
  const products = useSelector(selectProducts);
  const company = useSelector(selectCurrentCompany);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  const columns = [
    { key: 'outputProductId', label: 'Output Product', render: (r) => <div><div className="font-medium">{productById[r.outputProductId]?.name}</div><div className="text-xs font-mono text-gray-500">{productById[r.outputProductId]?.sku}</div></div> },
    { key: 'version', label: 'Version', render: (r) => <span className="font-mono text-xs">{r.version}</span> },
    { key: 'outputQuantity', label: 'Yield Qty', align: 'right', render: (r) => r.outputQuantity },
    { key: 'lines', label: 'Components', align: 'right', render: (r) => r.lines.length },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
    { key: 'actions', label: '', align: 'right', sortable: false, render: (r) => <Button size="small" onClick={() => navigate(`/app/manufacturing/bom/${r.id}`)}>View</Button> },
  ];

  return (
    <div>
      <PageHeader
        title="Bills of Materials"
        description={`${company?.displayName || ''}`}
        actions={<Button variant="contained" startIcon={<Add />} onClick={() => navigate('/app/manufacturing/bom/new')}>New BOM</Button>}
      />
      <DataTable columns={columns} rows={boms} pageSize={10} emptyMessage="No BOMs defined yet." />
    </div>
  );
}