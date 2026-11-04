import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectBomById } from '../manufacturingSelectors';
import { archiveBom } from '../manufacturingSlice';
import { selectProducts } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function BomDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bom = useSelector(selectBomById(id));
  const products = useSelector(selectProducts);

  if (!bom)
    return (
      <div>
        <PageHeader title="Not found" />
        <Button
          onClick={() => navigate('/app/manufacturing/bom')}
          variant="outlined"
        >
          Back
        </Button>
      </div>
    );

  const productById = Object.fromEntries(products.map((p) => [p.id, p]));
  const outputProduct = productById[bom.outputProductId];

  const totalMaterialCostPerUnitPaise = bom.lines.reduce((s, l) => {
    const p = productById[l.productId];
    const qtyWithScrap = l.quantity * (1 + (l.scrapPercent || 0) / 100);
    return s + Math.round(qtyWithScrap * (p?.purchasePrice || 0) * 100);
  }, 0);

  const totalCostPerUnitPaise =
    totalMaterialCostPerUnitPaise +
    Math.round((bom.laborCostPerUnit + bom.overheadCostPerUnit) * 100);

  return (
    <div>
      <PageHeader
        title={`${outputProduct?.name} — ${bom.version}`}
        description={`BOM ID: ${bom.id}`}
        actions={
          <>
            <Button
              variant="outlined"
              onClick={() => navigate('/app/manufacturing/bom')}
            >
              Back
            </Button>
            {bom.status === 'active' && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => dispatch(archiveBom(bom.id))}
              >
                Archive
              </Button>
            )}
            {bom.status === 'active' && (
              <Button
                variant="outlined"
                onClick={() =>
                  navigate(`/app/manufacturing/bom/${bom.id}/edit`)
                }
              >
                Edit
              </Button>
            )}
          </>
        }
      />

      <div className="bg-white border border-gray-200 rounded p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold">BOM Details</h2>
          <StatusBadge status={bom.status} />
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Output Product</dt>
            <dd className="font-medium">{outputProduct?.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Version</dt>
            <dd className="font-mono">{bom.version}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Yield Qty</dt>
            <dd>{bom.outputQuantity}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Overall Scrap</dt>
            <dd>{bom.scrapPercent}%</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden mb-4">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold">Components</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Component</th>
              <th className="text-right px-3 py-2">Qty / Unit</th>
              <th className="text-right px-3 py-2">Scrap %</th>
              <th className="text-right px-3 py-2">Effective Qty</th>
              <th className="text-right px-3 py-2">Unit Cost</th>
              <th className="text-right px-3 py-2">Line Cost</th>
            </tr>
          </thead>
          <tbody>
            {bom.lines.map((l, i) => {
              const p = productById[l.productId];
              const effectiveQty =
                l.quantity * (1 + (l.scrapPercent || 0) / 100);
              const lineCostPaise = Math.round(
                effectiveQty * (p?.purchasePrice || 0) * 100,
              );
              return (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <div className="font-medium">{p?.name}</div>
                    <div className="text-xs font-mono text-gray-500">
                      {p?.sku}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {l.quantity}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {l.scrapPercent}%
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {effectiveQty.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatINR((p?.purchasePrice || 0) * 100)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">
                    {formatINR(lineCostPaise)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded p-4 text-sm space-y-1 max-w-md ml-auto">
        <div className="flex justify-between">
          <span className="text-gray-600">Material Cost / Unit</span>
          <span className="tabular-nums">
            {formatINR(totalMaterialCostPerUnitPaise)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Labor / Unit</span>
          <span className="tabular-nums">
            {formatINR(Math.round(bom.laborCostPerUnit * 100))}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Overhead / Unit</span>
          <span className="tabular-nums">
            {formatINR(Math.round(bom.overheadCostPerUnit * 100))}
          </span>
        </div>
        <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
          <span>Total Cost / Unit</span>
          <span className="tabular-nums">
            {formatINR(totalCostPerUnitPaise)}
          </span>
        </div>
      </div>
    </div>
  );
}
