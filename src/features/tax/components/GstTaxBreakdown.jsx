import { formatINR } from '../../../lib/currency';

export default function GstTaxBreakdown({ cgst, sgst, igst, totalTax }) {
  return (
    <div className="flex flex-col items-end text-xs">
      {cgst !== 0 && <div className="flex justify-between w-32"><span className="text-gray-500">CGST</span><span className="tabular-nums">{formatINR(cgst)}</span></div>}
      {sgst !== 0 && <div className="flex justify-between w-32"><span className="text-gray-500">SGST</span><span className="tabular-nums">{formatINR(sgst)}</span></div>}
      {igst !== 0 && <div className="flex justify-between w-32"><span className="text-gray-500">IGST</span><span className="tabular-nums">{formatINR(igst)}</span></div>}
      <div className="flex justify-between w-32 border-t border-gray-300 mt-1 pt-1 font-semibold"><span>Total</span><span className="tabular-nums">{formatINR(totalTax)}</span></div>
    </div>
  );
}