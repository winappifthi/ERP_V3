import PageHeader from '../../../components/common/PageHeader';
import DateRangeFilter from './DateRangeFilter';
import { formatINR } from '../../../lib/currency';

const inrShort = (v) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

/** Standard shell: header + date range filter + optional actions. */
export default function ReportShell({ title, description, fromDate, toDate, onChange, actions, children }) {
  return (
    <div>
      <PageHeader title={title} description={description} actions={actions} />
      <DateRangeFilter fromDate={fromDate} toDate={toDate} onChange={onChange} />
      {children}
    </div>
  );
}

export { inrShort };