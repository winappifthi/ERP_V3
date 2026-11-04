import { useSelector } from 'react-redux';
import { Paper, Typography } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  selectCurrentCompany, selectBranchesForCompany, selectWarehouses,
} from '../../../store/selectors/contextSelectors';

export default function GeneralSettings() {
  const company = useSelector(selectCurrentCompany);
  const branches = useSelector(selectBranchesForCompany);
  const warehouses = useSelector(selectWarehouses);
  const financialYear = useSelector((s) => s.app.financialYear);

  const row = (label, value) => (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-right">{value || '—'}</dd>
    </div>
  );

  return (
    <div>
      <PageHeader title="General Settings" description="Company and workspace configuration" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Company Profile</Typography>
          <dl className="text-sm">
            {row('Legal Name', company?.legalName)}
            {row('Display Name', company?.displayName)}
            {row('GSTIN', company?.gstin)}
            {row('PAN', company?.pan)}
            {row('Currency', company?.currency)}
            {row('State', company?.state)}
            {row('Address', company?.address)}
          </dl>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Workspace</Typography>
          <dl className="text-sm">
            {row('Financial Year', financialYear)}
            {row('Branches', branches.length)}
            {row('Warehouses', warehouses.length)}
          </dl>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Branches</Typography>
          <ul className="text-sm space-y-1.5">
            {branches.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-2">
                <span>{b.name}</span>
                <StatusBadge status={b.active ? 'active' : 'inactive'} />
              </li>
            ))}
          </ul>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Warehouses</Typography>
          <ul className="text-sm space-y-1.5">
            {warehouses.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-2">
                <span>{w.name}</span>
                <span className="text-xs text-gray-500 capitalize">{w.type}</span>
              </li>
            ))}
          </ul>
        </Paper>
      </div>
    </div>
  );
}
