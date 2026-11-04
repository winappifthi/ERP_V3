import { useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import FinancialStatementTable from '../components/FinancialStatementTable';
import { selectProfitAndLoss } from '../financeSelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function ProfitAndLoss() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const pl = useSelector(selectProfitAndLoss(fromDate, toDate));

  return (
    <div>
      <PageHeader title="Profit & Loss" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />
      <div className="bg-white border border-gray-200 rounded p-3 mb-3 flex flex-wrap gap-2 items-end">
        <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Button size="small" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <Stat label="Total Income" value={formatINR(pl.totalIncome)} />
        <Stat label="Total Expense" value={formatINR(pl.totalExpense)} />
        <Stat label={pl.netProfit >= 0 ? 'Net Profit' : 'Net Loss'} value={formatINR(Math.abs(pl.netProfit))} highlight={pl.netProfit < 0} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FinancialStatementTable title="Income" rows={pl.incomeRows} totalLabel="Total Income" totalPaise={pl.totalIncome} />
        <FinancialStatementTable title="Expenses" rows={pl.expenseRows} totalLabel="Total Expenses" totalPaise={pl.totalExpense} />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold text-sm tabular-nums ${highlight ? 'text-red-700' : ''}`}>{value}</div>
    </div>
  );
}