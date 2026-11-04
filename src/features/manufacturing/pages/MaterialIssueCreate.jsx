import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import MaterialIssuePanel from '../components/MaterialIssuePanel';
import { selectProductionOrderById, selectProductionOrderEnriched } from '../manufacturingSelectors';
import { addMaterialIssue, generateMaterialIssueId } from '../manufacturingSlice';
import { addMovements } from '../../inventory/inventorySlice';
import { selectProducts, selectWarehousesForBranch, selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import dayjs from '../../../lib/dayjs';

export default function MaterialIssueCreate() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector(selectProductionOrderById(id));
  const enriched = useSelector(selectProductionOrderEnriched(id));
  const products = useSelector(selectProducts);
  const warehouses = useSelector(selectWarehousesForBranch);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const [snack, setSnack] = useState(null);

  const defaultWh = warehouses[0]?.id || '';
  const [issueDate, setIssueDate] = useState(dayjs().format('YYYY-MM-DD'));

  const [lines, setLines] = useState(() => {
    if (!enriched) return [];
    // Pre-populate with remaining required quantities
    return enriched.plannedRequirements
      .map((r) => {
        const issued = enriched.issuedByProduct[r.productId] || 0;
        const remaining = r.totalRequired - issued;
        return remaining > 0
          ? { productId: r.productId, quantity: Math.ceil(remaining * 100) / 100, warehouseId: defaultWh }
          : null;
      })
      .filter(Boolean);
  });

  if (!order) return <div><PageHeader title="Not found" /><Button onClick={() => navigate(-1)} variant="outlined">Back</Button></div>;

  const handlePost = () => {
    if (lines.length === 0) {
      setSnack({ severity: 'warning', message: 'Add at least one line' });
      return;
    }
    const issueId = generateMaterialIssueId();
    const issue = { id: issueId, issueDate, status: 'posted', lines };

    dispatch(addMaterialIssue({ orderId: id, issue }));

    // Create inventory movements (consume)
    dispatch(addMovements(lines.map((l) => ({
      companyId: company.id,
      branchId: branch.id,
      warehouseId: l.warehouseId,
      productId: l.productId,
      quantity: -l.quantity,
      movementType: 'production-issue',
      movementDate: issueDate,
      referenceType: 'production-order',
      referenceId: order.id,
    }))));

    setSnack({ severity: 'success', message: 'Material issued — inventory reduced' });
    setTimeout(() => navigate(`/app/manufacturing/production-orders/${id}`), 800);
  };

  return (
    <div>
      <PageHeader
        title="Issue Materials to Production"
        description={`${order.orderNumber} · ${order.plannedQuantity} units planned`}
      />
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4">
          <TextField label="Issue Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </div>

        <MaterialIssuePanel lines={lines} onChange={setLines} />

        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate(`/app/manufacturing/production-orders/${id}`)}>Cancel</Button>
          <Button variant="contained" onClick={handlePost}>Post Issue</Button>
        </div>
      </div>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}