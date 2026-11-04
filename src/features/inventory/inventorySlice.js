import { createSlice, nanoid } from '@reduxjs/toolkit';
import { stockMovements as seedMovements } from '../../data/seed/stockMovements';
import { stockTransfers as seedTransfers } from '../../data/seed/stockTransfers';
import { stockAdjustments as seedAdjustments } from '../../data/seed/stockAdjustments';

const initialState = {
  movements: seedMovements,
  transfers: seedTransfers,
  adjustments: seedAdjustments,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addMovement(state, action) {
      state.movements.push({ ...action.payload, id: action.payload.id || `MOV-${nanoid(6)}` });
    },
    addMovements(state, action) {
      action.payload.forEach((m) => state.movements.push({ ...m, id: m.id || `MOV-${nanoid(6)}` }));
    },

    createTransfer(state, action) {
      const transfer = action.payload;
      state.transfers.unshift(transfer);
      // Generate paired movements
      for (const line of transfer.lines) {
        state.movements.push({
          id: `MOV-${nanoid(6)}`,
          companyId: transfer.companyId,
          branchId: transfer.branchId,
          warehouseId: transfer.sourceWarehouseId,
          productId: line.productId,
          quantity: -line.quantity,
          movementType: 'transfer-out',
          movementDate: transfer.transferDate,
          referenceType: 'stock-transfer',
          referenceId: transfer.id,
        });
        state.movements.push({
          id: `MOV-${nanoid(6)}`,
          companyId: transfer.companyId,
          branchId: transfer.branchId,
          warehouseId: transfer.destinationWarehouseId,
          productId: line.productId,
          quantity: line.quantity,
          movementType: 'transfer-in',
          movementDate: transfer.transferDate,
          referenceType: 'stock-transfer',
          referenceId: transfer.id,
        });
      }
    },

    createAdjustment(state, action) {
      const adj = action.payload;
      state.adjustments.unshift(adj);
      for (const line of adj.lines) {
        state.movements.push({
          id: `MOV-${nanoid(6)}`,
          companyId: adj.companyId,
          branchId: adj.branchId,
          warehouseId: adj.warehouseId,
          productId: line.productId,
          quantity: line.quantity, // signed
          movementType: 'adjustment',
          movementDate: adj.adjustmentDate,
          referenceType: 'stock-adjustment',
          referenceId: adj.id,
          reason: line.reason,
        });
      }
    },
  },
});

export const { addMovement, addMovements, createTransfer, createAdjustment } = inventorySlice.actions;

export const generateTransferId = () => `ST-${nanoid(6)}`;
export const generateAdjustmentId = () => `ADJ-${nanoid(6)}`;

const nextNumber = (list, prefixFn, key) => {
  const prefix = prefixFn();
  const matching = list.filter((o) => o[key]?.startsWith(prefix));
  const maxSeq = matching.reduce((max, o) => {
    const seq = parseInt(o[key].split('/').pop(), 10) || 0;
    return Math.max(max, seq);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
};

export const generateTransferNumber = (transfers, branch) =>
  nextNumber(transfers, () => `ST/${branch?.code || 'XX'}/2425/`, 'transferNumber');
export const generateAdjustmentNumber = (adjustments, branch) =>
  nextNumber(adjustments, () => `ADJ/${branch?.code || 'XX'}/2425/`, 'adjustmentNumber');

/** Pure helper: derive on-hand qty for a product at a warehouse. */
export const computeOnHand = (movements, { productId, warehouseId }) =>
  movements
    .filter((m) => m.productId === productId && m.warehouseId === warehouseId)
    .reduce((s, m) => s + m.quantity, 0);

export default inventorySlice.reducer;