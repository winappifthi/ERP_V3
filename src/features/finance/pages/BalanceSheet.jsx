import { useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import FinancialStatementTable from '../components/FinancialStatementTable';
import { selectBalanceSheet } from '../financeSelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function BalanceSheet() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [asOfDate, setAsOfDate] = useState('');
  const bs = useSelector(selectBalanceSheet(asOfDate));
  const balanced = bs.difference === 0;

  return (
    <div>
      <PageHeader title="Balance Sheet" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField label="As of" type="date" size="small" InputLabelProps={{ shrink: true }} value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
        <Button size="small" onClick={() => setAsOfDate('')}>Clear</Button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Total Assets" value={formatINR(bs.totalAssets)} />
        <Stat label="Total Liabilities" value={formatINR(bs.totalLiabilities)} />
        <Stat label="Total Equity" value={formatINR(bs.totalEquity)} />
      </div>
      <div className={`mb-3 px-3 py-2 rounded text-sm ${balanced ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
        {balanced ? '✓ Assets = Liabilities + Equity' : `⚠ Difference: ${formatINR(bs.difference)}`}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinancialStatementTable title="Assets" rows={bs.assets} totalLabel="Total Assets" totalPaise={bs.totalAssets} />
        <FinancialStatementTable title="Liabilities" rows={bs.liabilities} totalLabel="Total Liabilities" totalPaise={bs.totalLiabilities} />
        <FinancialStatementTable
          title="Equity (incl. net profit)"
          rows={[...bs.equity, ...(bs.netProfit !== 0 ? [{ account: { code: '3900', name: 'Net Profit for Period' }, amount: bs.netProfit }] : [])]}
          totalLabel="Total Equity"
          totalPaise={bs.totalEquity}
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