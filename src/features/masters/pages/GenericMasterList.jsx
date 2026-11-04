import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, TextField, Tabs, Tab } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { MASTER_CONFIGS } from '../masterConfig';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';

export default function GenericMasterList() {
  const { masterType } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const company = useSelector(selectCurrentCompany);
  
  const config = MASTER_CONFIGS[masterType];
  const typeParam = searchParams.get('type') || config?.defaultType;
  const [search, setSearch] = useState('');

  const rows = useSelector((state) => 
    config ? config.getRows(state, typeParam) : []
  );
  
  const columns = useMemo(() => 
    config ? config.getColumns(typeParam) : [], 
    [config, typeParam]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => 
      Object.values(r).some((v) => 
        String(v).toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  if (!config) {
    return <div className="p-8 text-center text-red-500">Invalid master type</div>;
  }

  const handleTabChange = (_, newType) => {
    setSearchParams({ type: newType });
  };

  return (
    <div>
      <PageHeader
        title={config.title}
        description={`${company?.displayName || ''} · ${filtered.length} record(s)`}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(`/app/masters/${masterType}/new${typeParam ? `?type=${typeParam}` : ''}`)}
          >
            New {config.singular}
          </Button>
        }
      />

      {/* Type tabs (only for parties) */}
      {config.types && (
        <div className="bg-white border border-gray-200 rounded mb-3">
          <Tabs value={typeParam} onChange={handleTabChange} sx={{ minHeight: 44 }}>
            {config.types.map((t) => (
              <Tab 
                key={t.value} 
                value={t.value} 
                label={t.label} 
                sx={{ minHeight: 44, fontSize: 13 }} 
              />
            ))}
          </Tabs>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded p-3 mb-3">
        <TextField
          size="small"
          placeholder={`Search ${config.title.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={10}
        emptyMessage={`No ${config.title.toLowerCase()} found.`}
      />
    </div>
  );
}