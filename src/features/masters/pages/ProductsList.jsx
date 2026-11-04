import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import DataTable from '../../../components/data-display/DataTable';
import {
  selectProducts,
  selectTaxCategories,
  selectCurrentCompany,
} from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { useNavigate } from 'react-router-dom';

export default function ProductsList() {
  const products = useSelector(selectProducts);
  const taxes = useSelector(selectTaxCategories);
  const company = useSelector(selectCurrentCompany);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const taxById = useMemo(
    () => Object.fromEntries(taxes.map((t) => [t.id, t])),
    [taxes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.hsn.includes(q),
    );
  }, [products, search]);

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      render: (r) => (
        <button
          onClick={() => navigate(`/app/masters/products/${r.id}`)}
          className="font-mono text-xs text-blue-600 hover:underline"
        >
          {r.sku}
        </button>
      ),
    },
    { key: 'name', label: 'Product Name' },
    { key: 'baseUom', label: 'UOM', align: 'center' },
    {
      key: 'sellingPrice',
      label: 'Selling Price',
      align: 'right',
      render: (r) => formatINR(r.sellingPrice * 100),
    },
    {
      key: 'purchasePrice',
      label: 'Purchase Price',
      align: 'right',
      render: (r) => formatINR(r.purchasePrice * 100),
    },
    {
      key: 'taxCategoryId',
      label: 'Tax',
      render: (r) => taxById[r.taxCategoryId]?.name || '—',
    },
    { key: 'hsn', label: 'HSN' },
    {
      key: 'active',
      label: 'Status',
      render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${filtered.length} product${filtered.length === 1 ? '' : 's'} · ${company?.displayName || ''}`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/app/masters/products/new')}
          >
            New Product
          </Button>
        }
      />
      <div className="mb-3">
        <TextField
          size="small"
          placeholder="Search by name, SKU, or HSN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 360 } }}
        />
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={10}
        emptyMessage="No products match your search."
      />
    </div>
  );
}
