import { formatINR } from '../../../lib/currency';

export default function StockByWarehouseTable({ rows }) {
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th className="text-left px-3 py-2">Product</th>
            <th className="text-left px-3 py-2">SKU</th>
            <th className="text-right px-3 py-2">On Hand</th>
            <th className="text-right px-3 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.productId} className="border-t border-gray-100">
              <td className="px-3 py-2">{r.product.name}</td>
              <td className="px-3 py-2 font-mono text-xs">{r.product.sku}</td>
              <td className="px-3 py-2 text-right tabular-nums">{r.onHand}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatINR(r.valuePaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}