import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ProductionStageBadge from '../components/ProductionStageBadge';
import { selectProductionOrderEnriched } from '../manufacturingSelectors';
import { selectProducts } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function ProductionOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useSelector(selectProductionOrderEnriched(id));
  const products = useSelector(selectProducts);

  if (!data) return <div><PageHeader title="Not found" /><Button onClick={() => navigate('/app/manufacturing/production-orders')} variant="outlined">Back</Button></div>;

  const {
    order, bom, product, plannedRequirements, issuedByProduct,
    plannedMaterialCostPaise, laborCostPaise, overheadCostPaise, totalPlannedCostPaise,
    actualMaterialCostPaise, wipValuePaise, progressPercent,
  } = data;

  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={`${product?.name} · ${order.plannedQuantity} units · ${formatDate(order.startDate)} → ${formatDate(order.expectedCompletionDate)}`}
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate('/app/manufacturing/production-orders')}>Back</Button>
            {order.status === 'planned' && (
              <Button variant="contained" onClick={() => navigate(`/app/manufacturing/production-orders/${order.id}/issue`)}>Issue Materials</Button>
            )}
            {(order.status === 'material-issued' || order.status === 'in-progress') && (
              <>
                <Button variant="outlined" onClick={() => navigate(`/app/manufacturing/production-orders/${order.id}/issue`)}>Issue More</Button>
                <Button variant="contained" onClick={() => navigate(`/app/manufacturing/production-orders/${order.id}/complete`)}>Record Completion</Button>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Stat label="Status" value={<ProductionStageBadge status={order.status} />} />
        <Stat label="Progress" value={`${progressPercent}%`} />
        <Stat label="Completed / Planned" value={`${order.completedQuantity || 0} / ${order.plannedQuantity}`} />
        <Stat label="WIP Value" value={formatINR(wipValuePaise)} />
      </div>

      <div className="bg-white border border-gray-200 rounded p-3 mb-4">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="p-3 border-b border-gray-200"><h2 className="text-sm font-semibold">Material Requirements vs Issued</h2></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Component</th>
                <th className="text-right px-3 py-2">Required</th>
                <th className="text-right px-3 py-2">Issued</th>
                <th className="text-right px-3 py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {plannedRequirements.map((r) => {
                const issued = issuedByProduct[r.productId] || 0;
                const balance = r.totalRequired - issued;
                return (
                  <tr key={r.productId} className="border-t border-gray-100">
                    <td className="px-3 py-2">{r.product?.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.totalRequired.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{issued}</td>
                    <td className={`px-3 py-2 text-right tabular-nums font-medium ${balance > 0 ? 'text-amber-700' : 'text-green-700'}`}>{balance.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 rounded p-4 text-sm space-y-1">
          <h2 className="text-sm font-semibold mb-3">Cost Analysis</h2>
          <div className="flex justify-between"><span className="text-gray-600">Planned Material</span><span className="tabular-nums">{formatINR(plannedMaterialCostPaise)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Planned Labor</span><span className="tabular-nums">{formatINR(laborCostPaise)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Planned Overhead</span><span className="tabular-nums">{formatINR(overheadCostPaise)}</span></div>
          <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2"><span>Total Planned</span><span className="tabular-nums">{formatINR(totalPlannedCostPaise)}</span></div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between"><span className="text-gray-600">Actual Material Issued</span><span className="tabular-nums">{formatINR(actualMaterialCostPaise)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">WIP Value</span><span className="tabular-nums">{formatINR(wipValuePaise)}</span></div>
          </div>
        </div>
      </div>

      {order.materialIssues?.length > 0 && (
        <div className="mt-4 bg-white border border-gray-200 rounded overflow-hidden">
          <div className="p-3 border-b border-gray-200"><h2 className="text-sm font-semibold">Material Issues History</h2></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Issue #</th>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-right px-3 py-2">Lines</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {order.materialIssues.map((issue) => (
                <tr key={issue.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs">{issue.id}</td>
                  <td className="px-3 py-2">{formatDate(issue.issueDate)}</td>
                  <td className="px-3 py-2 text-right">{issue.lines.length}</td>
                  <td className="px-3 py-2">{issue.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {order.completions?.length > 0 && (
        <div className="mt-4 bg-white border border-gray-200 rounded overflow-hidden">
          <div className="p-3 border-b border-gray-200"><h2 className="text-sm font-semibold">Completions</h2></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-right px-3 py-2">Completed</th>
                <th className="text-right px-3 py-2">Scrap</th>
                <th className="text-left px-3 py-2">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {order.completions.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{formatDate(c.completionDate)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.completedQuantity}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.scrapQuantity || 0}</td>
                  <td className="px-3 py-2 text-xs">{c.warehouseId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-sm mt-0.5">{value}</div>
    </div>
  );
}