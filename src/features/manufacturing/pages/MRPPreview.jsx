import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Autocomplete, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/data-display/DataTable';
import { selectBomsInContext, selectMrpPreview } from '../manufacturingSelectors';
import { selectProducts, selectWarehousesForBranch, selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function MRPPreview() {
  const navigate = useNavigate();
  const boms = useSelector(selectBomsInContext);
  const products = useSelector(selectProducts);
  const warehouses = useSelector(selectWarehousesForBranch);
  const company = useSelector(selectCurrentCompany);

  const [bomId, setBomId] = useState(boms[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const selectedBom = boms.find((b) => b.id === bomId);

  const mrpResult = useSelector(selectMrpPreview(bomId, quantity, warehouseId));

  const totalRequired = mrpResult?.reduce((s, r) => s + r.estimatedCostPaise, 0) || 0;
  const totalShortfallValue = mrpResult?.filter((r) => !r.sufficient).reduce((s, r) => s + Math.round(r.shortfall * (r.product?.purchasePrice || 0) * 100), 0) || 0;
  const allAvailable = mrpResult?.every((r) => r.sufficient);

  return (
    <div>
      <PageHeader
        title="MRP Preview"
        description={`Material Requirement Planning · ${company?.displayName || ''}`}
        actions={
          allAvailable && mrpResult?.length > 0 ? (
            <Button variant="contained" onClick={() => navigate('/app/manufacturing/production-orders/new')}>Create Production Order</Button>
          ) : null
        }
      />

      <div className="bg-white border border-gray-200 rounded p-4 mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">BOM</label>
          <Autocomplete
            size="small"
            options={boms.filter((b) => b.status === 'active')}
            getOptionLabel={(b) => `${productById[b.outputProductId]?.name || '?'} — ${b.version}`}
            value={boms.find((b) => b.id === bomId) || null}
            onChange={(_, v) => setBomId(v?.id || '')}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
        <TextField label="Quantity" type="number" size="small" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} inputProps={{ min: 1 }} />
        <FormControl size="small" className="md:col-span-3">
          <InputLabel>Check Stock At Warehouse</InputLabel>
          <Select label="Check Stock At Warehouse" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
      </div>

      {mrpResult && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <Stat label="Estimated Material Cost" value={formatINR(totalRequired)} />
            <Stat label="Shortfall Value" value={formatINR(totalShortfallValue)} highlight={totalShortfallValue > 0} />
            <Stat label="Availability" value={allAvailable ? 'Sufficient' : 'Shortfall'} highlight={!allAvailable} />
          </div>

          <DataTable
            columns={[
              { key: 'product', label: 'Component', render: (r) => <div><div className="font-medium">{r.product?.name}</div><div className="text-xs font-mono text-gray-500">{r.product?.sku}</div></div> },
              { key: 'required', label: 'Required', align: 'right', render: (r) => <span className="tabular-nums">{r.required}</span> },
              { key: 'available', label: 'Available', align: 'right', render: (r) => <span className={`tabular-nums ${r.sufficient ? 'text-green-700' : 'text-red-600 font-semibold'}`}>{r.available}</span> },
              { key: 'shortfall', label: 'Shortfall', align: 'right', render: (r) => r.shortfall > 0 ? <span className="tabular-nums text-red-600 font-semibold">{r.shortfall.toFixed(2)}</span> : '—' },
              { key: 'status', label: 'Status', render: (r) => r.sufficient ? <span className="text-xs text-green-700 font-medium">Sufficient</span> : <span className="text-xs text-red-600 font-medium">Short</span> },
              { key: 'estimatedCostPaise', label: 'Est. Cost', align: 'right', render: (r) => formatINR(r.estimatedCostPaise) },
            ]}
            rows={mrpResult}
            pageSize={15}
          />
        </>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold text-sm tabular-nums ${highlight ? 'text-red-700' : ''}`}>{value}</div>
    </div>
  );
}