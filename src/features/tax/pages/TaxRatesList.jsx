import { useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';
import { useState } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectTaxRates } from '../taxSelectors';

export default function TaxRatesList() {
  const rates = useSelector(selectTaxRates);
  const [search, setSearch] = useState('');
  const filtered = rates.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'name', label: 'Name' },
    { key: 'ratePercent', label: 'Rate', align: 'right', render: (r) => <span className="tabular-nums">{r.ratePercent}%</span> },
    { key: 'treatment', label: 'Treatment', render: (r) => <span className="capitalize">{r.treatment === 'rate' ? 'Standard' : r.treatment}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Tax Rates"
        description="Configurable GST rate master — referenced by product tax categories"
      />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3">
        <TextField size="small" placeholder="Search rate…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 280 }} />
      </div>
      <DataTable columns={columns} rows={filtered} pageSize={20} emptyMessage="No tax rates configured." />
    </div>
  );
}