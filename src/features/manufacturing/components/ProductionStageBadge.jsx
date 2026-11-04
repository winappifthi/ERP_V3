const COLORS = {
  'planned': 'bg-gray-100 text-gray-700',
  'material-issued': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-amber-100 text-amber-800',
  'completed': 'bg-emerald-100 text-emerald-800',
  'cancelled': 'bg-red-100 text-red-700',
};

const LABELS = {
  'planned': 'Planned',
  'material-issued': 'Material Issued',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

export default function ProductionStageBadge({ status }) {
  const cls = COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${cls}`}>
      {LABELS[status] || status}
    </span>
  );
}