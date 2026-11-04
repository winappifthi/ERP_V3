const COLORS = {
  'opening': 'bg-gray-100 text-gray-700',
  'purchase-receipt': 'bg-emerald-100 text-emerald-800',
  'sales-issue': 'bg-blue-100 text-blue-800',
  'sale-return': 'bg-teal-100 text-teal-800',
  'purchase-return': 'bg-amber-100 text-amber-800',
  'transfer-out': 'bg-orange-100 text-orange-800',
  'transfer-in': 'bg-orange-100 text-orange-800',
  'adjustment': 'bg-purple-100 text-purple-800',
  'production-issue': 'bg-red-100 text-red-700',
  'production-receipt': 'bg-green-100 text-green-800',
};

const LABELS = {
  'opening': 'Opening',
  'purchase-receipt': 'Purchase Receipt',
  'sales-issue': 'Sales Issue',
  'sale-return': 'Sale Return',
  'purchase-return': 'Purchase Return',
  'transfer-out': 'Transfer Out',
  'transfer-in': 'Transfer In',
  'adjustment': 'Adjustment',
  'production-issue': 'Production Issue',
  'production-receipt': 'Production Receipt',
};

export default function MovementTypeBadge({ type }) {
  const cls = COLORS[type] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${cls}`}>
      {LABELS[type] || type}
    </span>
  );
}