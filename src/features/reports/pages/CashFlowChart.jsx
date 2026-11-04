import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportShell, { inrShort } from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import BarChartCard from '../components/BarChartCard';
import { selectCashFlow } from '../../finance/financeSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { monthKey } from '../reportsUtils';

export default function CashFlowChart() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const cashFlow = useSelector(selectCashFlow(range.fromDate, range.toDate));

  // Group by month: inflow and outflow
  const monthly = (() => {
    const map = new Map();
    for (const row of cashFlow.rows) {
      const m = monthKey(row.date);
      const existing = map.get(m) || { month: m, inflow: 0, outflow: 0, net: 0 };
      if (row.netPaise > 0) existing.inflow += row.netPaise / 100;
      else existing.outflow += -row.netPaise / 100;
      existing.net += row.netPaise / 100;
      map.set(m, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  return (
    <ReportShell
      title="Cash Flow Report"
      description={`Cash & bank movements · ${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
    >
      <SummaryGrid items={[
        { label: 'Cash Inflow', value: formatINR(cashFlow.inflow) },
        { label: 'Cash Outflow', value: formatINR(cashFlow.outflow) },
        { label: 'Net Change', value: formatINR(cashFlow.netChange), highlight: cashFlow.netChange >= 0 },
      ]} />
      <BarChartCard
        title="Monthly Cash Flow"
        data={monthly}
        xKey="month"
        series={[
          { key: 'inflow', name: 'Inflow', color: '#059669' },
          { key: 'outflow', name: 'Outflow', color: '#dc2626' },
        ]}
        formatY={(v) => inrShort(v)}
      />
    </ReportShell>
  );
}