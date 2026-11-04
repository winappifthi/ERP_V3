import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportShell, { inrShort } from '../components/ReportShell';
import SummaryGrid from '../components/SummaryGrid';
import BarChartCard from '../components/BarChartCard';
import PieChartCard from '../components/PieChartCard';
import { selectStockOverview, selectTotalInventoryValue } from '../../inventory/inventorySelectors';
import { selectCurrentCompany, selectProducts } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function InventoryAnalytics() {
  const company = useSelector(selectCurrentCompany);
  const [range, setRange] = useState({ fromDate: '', toDate: '' }); // date filter not applied to stock (point-in-time)
  const stock = useSelector(selectStockOverview);
  const totalValue = useSelector(selectTotalInventoryValue);
  const products = useSelector(selectProducts);

  // Category breakdown
  const byCategory = (() => {
    const map = new Map();
    for (const r of stock) {
      if (r.onHand <= 0) continue;
      const cat = r.product.categoryId;
      const existing = map.get(cat) || { categoryId: cat, valuePaise: 0, quantity: 0 };
      existing.valuePaise += r.valuePaise;
      existing.quantity += r.onHand;
      map.set(cat, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.valuePaise - a.valuePaise);
  })();

  const categoryPie = byCategory.map((c) => ({ name: c.categoryId, value: Math.round(c.valuePaise / 100) }));

  // Warehouse breakdown
  const byWarehouse = (() => {
    const map = new Map();
    for (const r of stock) {
      if (r.onHand <= 0) continue;
      const existing = map.get(r.warehouseId) || { warehouseId: r.warehouseId, warehouseName: r.warehouse?.name || '—', valuePaise: 0 };
      existing.valuePaise += r.valuePaise;
      map.set(r.warehouseId, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.valuePaise - a.valuePaise);
  })();

  const totalQty = stock.reduce((s, r) => s + (r.onHand > 0 ? r.onHand : 0), 0);
  const productsInStock = new Set(stock.filter((r) => r.onHand > 0).map((r) => r.productId)).size;

  return (
    <ReportShell
      title="Inventory Analytics"
      description={`Stock value and distribution · ${company?.displayName || ''}`}
      fromDate={range.fromDate}
      toDate={range.toDate}
      onChange={setRange}
    >
      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-900 mb-3">
        Note: inventory analytics reflects <strong>current on-hand</strong>. Date filters above are shown for consistency but not applied to point-in-time stock.
      </div>

      <SummaryGrid items={[
        { label: 'Total Value', value: formatINR(totalValue), highlight: true },
        { label: 'Total Quantity', value: totalQty },
        { label: 'Products in Stock', value: productsInStock },
        { label: 'Warehouses', value: byWarehouse.length },
        { label: 'Categories', value: byCategory.length },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {categoryPie.length > 0 && (
          <PieChartCard title="Value by Category" data={categoryPie} formatValue={(v) => formatINR(v * 100)} />
        )}
        <BarChartCard
          title="Value by Warehouse"
          data={byWarehouse.map((w) => ({ warehouse: w.warehouseName, value: w.valuePaise / 100 }))}
          xKey="warehouse"
          series={[{ key: 'value', name: 'Value (₹)', color: '#2563eb' }]}
          formatY={(v) => inrShort(v)}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="p-3 border-b border-gray-200 bg-gray-50"><h3 className="text-sm font-semibold">Category Breakdown</h3></div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-600 bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Category</th>
              <th className="text-right px-3 py-2">Quantity</th>
              <th className="text-right px-3 py-2">Value</th>
              <th className="text-right px-3 py-2">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.map((c) => (
              <tr key={c.categoryId} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-xs">{c.categoryId}</td>
                <td className="px-3 py-2 text-right tabular-nums">{c.quantity}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">{formatINR(c.valuePaise)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{totalValue > 0 ? Math.round((c.valuePaise / totalValue) * 100) : 0}%</td>
              </tr>
            ))}
            {byCategory.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-xs">No stock.</td></tr>}
          </tbody>
        </table>
      </div>
    </ReportShell>
  );
}