import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import AccountTree from '../components/AccountTree';
import { selectAccounts, selectPostingsInContext } from '../financeSelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function ChartOfAccounts() {
  const navigate = useNavigate();
  const accounts = useSelector(selectAccounts);
  const postings = useSelector(selectPostingsInContext);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [search, setSearch] = useState('');

  const balances = useMemo(() => {
    const map = {};
    for (const p of postings) {
      map[p.accountCode] = (map[p.accountCode] || 0) + (p.debitPaise - p.creditPaise);
    }
    return map;
  }, [postings]);

  const filtered = search
    ? accounts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search))
    : accounts;

  const totalAssets = Object.entries(balances).reduce((s, [code, bal]) => {
    const a = accounts.find((x) => x.code === code);
    return a?.accountType === 'asset' ? s + bal : s;
  }, 0);
  const totalLiab = Object.entries(balances).reduce((s, [code, bal]) => {
    const a = accounts.find((x) => x.code === code);
    return a?.accountType === 'liability' ? s - bal : s;
  }, 0);

  return (
    <div>
      <PageHeader
        title="Chart of Accounts"
        description={`${company?.displayName || ''} · ${branch?.name || ''}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <Stat label="Accounts" value={accounts.filter((a) => !a.isGroup).length} />
        <Stat label="Total Assets (net)" value={formatINR(totalAssets)} />
        <Stat label="Total Liabilities (net)" value={formatINR(totalLiab)} />
        <Stat label="Postings" value={postings.length} />
      </div>
      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="mb-2">
          <TextField size="small" placeholder="Search account…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 280 }} />
        </div>
        <AccountTree
          accounts={filtered}
          balances={balances}
          onLeafClick={(code) => navigate(`/app/finance/accounts/${code}`)}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-sm tabular-nums">{value}</div>
    </div>
  );
}