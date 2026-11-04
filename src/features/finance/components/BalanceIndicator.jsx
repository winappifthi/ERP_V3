import { formatINR } from '../../../lib/currency';

export default function BalanceIndicator({ totalDebit, totalCredit }) {
  const balanced = totalDebit === totalCredit && totalDebit > 0;
  const diff = totalDebit - totalCredit;
  return (
    <div className={`flex justify-between p-3 rounded border ${balanced ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="text-sm space-x-4">
        <span>Debit: <span className="font-semibold tabular-nums">{formatINR(totalDebit)}</span></span>
        <span>Credit: <span className="font-semibold tabular-nums">{formatINR(totalCredit)}</span></span>
      </div>
      <div className={`text-sm font-semibold ${balanced ? 'text-green-700' : 'text-amber-800'}`}>
        {balanced ? '✓ Balanced' : `Difference: ${formatINR(diff)}`}
      </div>
    </div>
  );
}