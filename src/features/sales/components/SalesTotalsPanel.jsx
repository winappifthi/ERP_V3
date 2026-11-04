import { formatINR } from '../../../lib/currency';

function Row({ label, value, bold, muted }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? 'font-semibold text-gray-900' : 'text-gray-700'} ${muted ? 'text-xs' : 'text-sm'}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function SalesTotalsPanel({ totals }) {
  if (!totals) return null;
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
      <Row label="Gross Subtotal" value={formatINR(totals.grossSubtotalPaise)} muted />
      <Row label="Line Discounts" value={`− ${formatINR(totals.totalLineDiscountsPaise)}`} muted />
      {totals.totalHeaderDiscountPaise > 0 && (
        <Row label="Header Discount" value={`− ${formatINR(totals.totalHeaderDiscountPaise)}`} muted />
      )}
      <Row label="Taxable Value" value={formatINR(totals.taxableValuePaise)} />
      {totals.cgstPaise > 0 && <Row label="CGST" value={formatINR(totals.cgstPaise)} muted />}
      {totals.sgstPaise > 0 && <Row label="SGST" value={formatINR(totals.sgstPaise)} muted />}
      {totals.igstPaise > 0 && <Row label="IGST" value={formatINR(totals.igstPaise)} muted />}
      {(totals.freightPaise + totals.packingPaise + totals.otherChargesPaise + totals.lineChargesPaise) > 0 && (
        <Row
          label="Charges"
          value={formatINR(totals.freightPaise + totals.packingPaise + totals.otherChargesPaise + totals.lineChargesPaise)}
          muted
        />
      )}
      {totals.roundOffPaise !== 0 && (
        <Row label="Round-off" value={formatINR(totals.roundOffPaise)} muted />
      )}
      <div className="border-t border-gray-200 mt-2 pt-2">
        <Row label="Total" value={formatINR(totals.finalTotalPaise)} bold />
      </div>
    </div>
  );
}