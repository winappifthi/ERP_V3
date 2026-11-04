import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
// Import the delete actions
import { deleteCategory, deleteUom } from '../inventoryMasterSlice'; 
import {
  categoryConfig, uomConfig, warehouseConfig, stockMovementConfig,
  barcodeConfig, lowStockConfig, valuationConfig, stockHistoryConfig,
} from '../inventoryConfig.jsx';

const CONFIG_MAP = {
  'categories': categoryConfig,
  'uom': uomConfig,
  'warehouses': warehouseConfig,
  'movements': stockMovementConfig,
  'barcodes': barcodeConfig,
  'low-stock': lowStockConfig,
  'valuation': valuationConfig,
  'history': stockHistoryConfig,
};

export default function DynamicInventoryPage() {
  const { pageType } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [search, setSearch] = useState('');

  const config = CONFIG_MAP[pageType];
  const allRows = useSelector((state) => (config ? config.getRows(state) : []));

  const filtered = useMemo(() => {
    if (!config) return [];
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) =>
      config.searchableFields.some((field) =>
        String(r[field] || '').toLowerCase().includes(q)
      )
    );
  }, [allRows, search, config]);

  if (!config) return <div className="p-8 text-center text-red-500">Invalid inventory page.</div>;

  const hasCrud = !!config.formFields; // If the config has formFields, it supports CRUD

  // Add Actions column dynamically if CRUD is supported
  const columns = [...config.columns];
  if (hasCrud) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      align: 'right',
      sortable: false,
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <IconButton size="small" onClick={() => navigate(`/app/inventory/${pageType}/${r.id}/edit`)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => {
            if(window.confirm(`Delete this ${config.singular}?`)) {
              if (pageType === 'categories') dispatch(deleteCategory(r.id));
              if (pageType === 'uom') dispatch(deleteUom(r.id));
            }
          }}>
            <Delete fontSize="small" />
          </IconButton>
        </div>
      ),
    });
  }

  return (
    <div>
      <PageHeader
        title={config.title}
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={
          hasCrud && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate(`/app/inventory/${pageType}/new`)}>
              New {config.singular}
            </Button>
          )
        }
      />

      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField
          size="small"
          placeholder={`Search ${config.title.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
      </div>

      <DataTable columns={columns} rows={filtered} pageSize={15} emptyMessage={`No ${config.title.toLowerCase()} found.`} />
    </div>
  );
}