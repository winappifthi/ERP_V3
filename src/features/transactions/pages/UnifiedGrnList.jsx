import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCustomersForCompany,
  selectVendorsForCompany,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../../../store/selectors/contextSelectors';
import { formatDate } from '../../../lib/dayjs';

const GRN_TYPES = [
  {
    value: 'grn',
    label: 'Goods Receipts',
    singular: 'Goods Receipt',
    partyLabel: 'Vendor',
    partyField: 'vendorId',
    numberField: 'receiptNumber',
    dateField: 'receiptDate',
  },
  {
    value: 'gdn',
    label: 'Goods Deliveries',
    singular: 'Goods Delivery',
    partyLabel: 'Customer',
    partyField: 'customerId',
    numberField: 'deliveryNumber',
    dateField: 'deliveryDate',
  },
];

export default function UnifiedGrnList() {
  const navigate = useNavigate();
  const [type, setType] = useState('grn');
  const meta = GRN_TYPES.find((t) => t.value === type);

  const grns = useSelector((s) => s.purchases.grns || []);
  const gdns = useSelector((s) => s.sales.gdns || []);
  const customers = useSelector(selectCustomersForCompany);
  const vendors = useSelector(selectVendorsForCompany);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const [search, setSearch] = useState('');

  const records = type === 'grn' ? grns : gdns;
  const parties = type === 'grn' ? vendors : customers;
  const partyById = useMemo(() => Object.fromEntries(parties.map((p) => [p.id, p])), [parties]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter((r) => r.companyId === company?.id && r.branchId === branch?.id)
      .filter((r) => {
        if (!q) return true;
        return (
          r[meta.numberField].toLowerCase().includes(q) ||
          (partyById[r[meta.partyField]]?.name || '').toLowerCase().includes(q)
        );
      });
  }, [records, search, company, branch, partyById, meta.partyField, meta.numberField]);

  const columns = [
    {
      key: meta.numberField,
      label: type === 'grn' ? 'GRN #' : 'GDN #',
      render: (r) => <span className="font-mono text-xs">{r[meta.numberField]}</span>,
    },
    {
      key: meta.dateField,
      label: 'Date',
      render: (r) => formatDate(r[meta.dateField]),
    },
    {
      key: meta.partyField,
      label: meta.partyLabel,
      render: (r) => partyById[r[meta.partyField]]?.name || '—',
    },
    {
      key: 'lines',
      label: 'Lines',
      align: 'right',
      render: (r) => r.lines?.length || 0,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status || 'posted'} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Goods Receipts & Deliveries"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/app/transactions/grn/new')}
          >
            New {meta.singular}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-3 items-end">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            {GRN_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder={`Search ${meta.label.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 280 } }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={15}
        emptyMessage={`No ${meta.label.toLowerCase()} yet.`}
        emptyAction={{
          label: `New ${meta.singular}`,
          onClick: () => navigate('/app/transactions/grn/new'),
        }}
      />
    </div>
  );
}