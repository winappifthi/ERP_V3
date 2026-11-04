import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';

/**
 * Generic list page driven by:
 * - typeOptions: [{ value, label }]
 * - columnConfig: { [type]: [{ key, label, align, render }] }
 * - getRows: (type) => array of rows
 * - basePath: '/app/transactions/orders'
 * - partyField: 'customerId' | 'vendorId'
 * - partySelector: Redux selector for the party list of the current type
 */
export default function ConfigList({
  title,
  description,
  typeOptions,
  defaultType,
  columnConfig,
  getRows,
  getRowKey = (r) => r.id,
  getNewPath,
  partyField,
  partySelector,
  searchableFields = ['invoiceNumber', 'orderNumber', 'returnNumber', 'receiptNumber', 'paymentNumber'],
}) {
  const navigate = useNavigate();
  const [type, setType] = useState(defaultType || typeOptions[0].value);
  const [search, setSearch] = useState('');

  const rows = getRows(type);
  const parties = useSelector(partySelector);
  const partyById = useMemo(
    () => Object.fromEntries(parties.map((p) => [p.id, p])),
    [parties]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const matchesField = searchableFields.some((f) =>
        (r[f] || '').toString().toLowerCase().includes(q)
      );
      const partyName = partyById[r[partyField]]?.name || '';
      return matchesField || partyName.toLowerCase().includes(q);
    });
  }, [rows, search, partyById, partyField, searchableFields]);

  const columns = columnConfig[type] || [];
  const activeMeta = typeOptions.find((t) => t.value === type);

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(getNewPath ? getNewPath(type) : '/')}
          >
            New {activeMeta?.label ? activeMeta.label.replace(/s$/, '') : ''}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-3 items-end">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            {typeOptions.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={15}
        emptyMessage={`No ${activeMeta?.label?.toLowerCase() || 'records'} yet.`}
      />
    </div>
  );
}