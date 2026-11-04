import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, TextField, Tabs, Tab } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectPartiesForCompany, selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { PARTY_TYPES, LEAD_STAGES } from '../partyHelpers';

export default function PartiesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const parties = useSelector(selectPartiesForCompany);
  const company = useSelector(selectCurrentCompany);
  const [search, setSearch] = useState('');

  const typeParam = searchParams.get('type') || 'customer';
  const activeType = PARTY_TYPES.find((t) => t.value === typeParam)?.value || 'customer';

  const handleTabChange = (_, newType) => setSearchParams({ type: newType });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parties
      .filter((p) => p.type === activeType)
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.gstin || '').toLowerCase().includes(q) ||
          (p.phone || '').toLowerCase().includes(q)
        );
      });
  }, [parties, activeType, search]);

  const counts = useMemo(() => {
    const map = { customer: 0, vendor: 0, lead: 0 };
    for (const p of parties) if (map[p.type] !== undefined) map[p.type] += 1;
    return map;
  }, [parties]);

  const columns = useMemo(() => {
    const base = [
      { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
      {
        key: 'name',
        label: 'Name',
        render: (r) => (
          <button onClick={() => navigate(`/app/masters/parties/${r.id}`)} className="text-blue-600 hover:underline">
            {r.name}
          </button>
        ),
      },
    ];

    if (activeType === 'lead') {
      return [
        ...base,
        { key: 'phone', label: 'Phone', hideOnMobile: true, render: (r) => r.phone || '—' },
        { key: 'email', label: 'Email', hideOnMobile: true, render: (r) => r.email || '—' },
        {
          key: 'stage',
          label: 'Stage',
          render: (r) => {
            const stage = LEAD_STAGES.find((s) => s.value === r.stage);
            return stage ? (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stage.color}`}>
                {stage.label}
              </span>
            ) : '—';
          },
        },
        { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
      ];
    }

    return [
      ...base,
      { key: 'gstin', label: 'GSTIN', hideOnMobile: true, render: (r) => <span className="font-mono text-xs">{r.gstin || '—'}</span> },
      { key: 'state', label: 'State', hideOnMobile: true },
      ...(activeType === 'customer'
        ? [
            { key: 'creditLimit', label: 'Credit Limit', align: 'right', render: (r) => <span className="tabular-nums">{formatINR((r.creditLimit || 0) * 100)}</span> },
            { key: 'outstanding', label: 'Outstanding', align: 'right', render: (r) => <span className="tabular-nums">{formatINR((r.outstanding || 0) * 100)}</span> },
          ]
        : [
            { key: 'outstanding', label: 'Outstanding', align: 'right', render: (r) => <span className="tabular-nums">{formatINR((r.outstanding || 0) * 100)}</span> },
          ]),
      { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
    ];
  }, [activeType, navigate]);

  const activeLabel = PARTY_TYPES.find((t) => t.value === activeType)?.plural || 'Parties';

  return (
    <div>
      <PageHeader
        title="Parties"
        description={`${company?.displayName || ''} · ${activeLabel}`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(`/app/masters/parties/new?type=${activeType}`)}
          >
            New {PARTY_TYPES.find((t) => t.value === activeType)?.label}
          </Button>
        }
      />

      <div className="bg-white border border-gray-200 rounded mb-3">
        <Tabs
          value={activeType}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 44 }}
        >
          {PARTY_TYPES.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={`${t.plural} (${counts[t.value] || 0})`}
              sx={{ minHeight: 44, fontSize: 13 }}
            />
          ))}
        </Tabs>
      </div>

      <div className="mb-3">
        <TextField
          size="small"
          placeholder="Search by name, code, GSTIN, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 360 } }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={15}
        emptyMessage={`No ${activeLabel.toLowerCase()} yet.`}
        emptyAction={{
          label: `New ${PARTY_TYPES.find((t) => t.value === activeType)?.label}`,
          onClick: () => navigate(`/app/masters/parties/new?type=${activeType}`),
        }}
      />
    </div>
  );
}