import { formatINR } from '../../../lib/currency';

export default function FinancialStatementTable({ title, rows, totalLabel, totalPaise }) {
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <div className="p-3 border-b border-gray-200 bg-gray-50"><h3 className="text-sm font-semibold">{title}</h3></div>
      <table className="w-full text-sm">
        <tbody>
          {rows.length === 0 && (
            <tr><td className="px-3 py-4 text-center text-gray-400 text-xs" colSpan={2}>No entries.</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.account.code} className="border-t border-gray-100">
              <td className="px-3 py-1.5">{r.account.name} <span className="text-xs text-gray-400 font-mono">{r.account.code}</span></td>
              <td className="px-3 py-1.5 text-right tabular-nums">{formatINR(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 bg-gray-50">
            <td className="px-3 py-2 font-semibold">{totalLabel}</td>
            <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatINR(totalPaise)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}